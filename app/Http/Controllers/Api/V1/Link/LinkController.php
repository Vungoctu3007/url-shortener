<?php

namespace App\Http\Controllers\Api\V1\Link;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLinkRequest;
use App\Http\Requests\UpdateLinkRequest;
use App\Interfaces\Services\LinkServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;
use App\Interfaces\Repositories\LinkRepositoryInterface;
use Illuminate\Support\Facades\Storage;

class LinkController extends Controller
{
    protected LinkServiceInterface $linkService;
    protected LinkRepositoryInterface $linkRepository;

    public function __construct(LinkServiceInterface $linkService, LinkRepositoryInterface $linkRepository)
    {
        $this->linkService = $linkService;
        $this->linkRepository = $linkRepository;
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $userId = Auth::id();

            if (!$userId) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized. Please login first.'
                ], 401);
            }

            $links = $this->linkService->paginate($request, $userId);

            return response()->json([
                'status' => 'success',
                'data' => $links,
                'meta' => [
                    'user_id' => $userId,
                    'total_links' => $links->total() ?? count($links),
                    'current_page' => $links->currentPage() ?? 1,
                    'per_page' => $links->perPage() ?? 10,
                ]
            ], 200);
        } catch (\Exception $e) {
            Log::error('Failed to list links for user ' . Auth::id() . ': ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Unable to retrieve links.'
            ], 500);
        }
    }

    public function store(StoreLinkRequest $request): JsonResponse
    {
        try {
            $link = $this->linkService->create($request->validated());
            $shortUrl = config('app.url') . '/' . $link->slug;
            return response()->json([
                'status' => 'success',
                'data' => $link,
                'short_url' => $shortUrl,
                'message' => 'Link created successfully.'
            ], 201);
        } catch (\Exception $e) {
            Log::error('Link create failed: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Internal Server Error'
            ], 500);
        }
    }

    public function show($id): JsonResponse
    {
        try {
            $link = $this->linkService->findWithAnalytics($id);

            if (!$link) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Link not found.'
                ], 404);
            }

            return response()->json([
                'status' => 'success',
                'data' => $link
            ], 200);
        } catch (\Exception $e) {
            Log::error('Link fetch failed: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Internal Server Error'
            ], 500);
        }
    }

    public function update(UpdateLinkRequest $request, $id): JsonResponse
    {
        try {
            $link = $this->linkService->update($id, $request->validated());

            if (!$link) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Link not found.'
                ], 404);
            }

            return response()->json([
                'status' => 'success',
                'data' => $link,
                'message' => 'Link updated successfully.'
            ], 200);
        } catch (\Exception $e) {
            Log::error('Link update failed: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Internal Server Error'
            ], 500);
        }
    }

    public function destroy($id): JsonResponse
    {
        try {
            $deleted = $this->linkService->delete($id);

            if (!$deleted) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Link not found or not deleted.'
                ], 404);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Link deleted successfully.'
            ], 200);
        } catch (\Exception $e) {
            Log::error('Link deletion failed: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Internal Server Error'
            ], 500);
        }
    }

    public function bulkDelete(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'ids' => 'required|array',
                'ids.*' => 'integer|exists:links,id'
            ]);

            $deleted = $this->linkService->bulkDelete($request->ids);

            return response()->json([
                'status' => 'success',
                'message' => "{$deleted} links deleted successfully."
            ], 200);
        } catch (\Exception $e) {
            Log::error('Bulk delete failed: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Internal Server Error'
            ], 500);
        }
    }

    public function bulkExport(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'ids' => 'required|array',
                'ids.*' => 'integer|exists:links,id'
            ]);

            $links = $this->linkService->bulkExport($request->ids);

            return response()->json([
                'status' => 'success',
                'data' => $links
            ], 200);
        } catch (\Exception $e) {
            Log::error('Bulk export failed: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Internal Server Error'
            ], 500);
        }
    }

    public function redirect(Request $request, $slug)
    {
        try {
            $link = $this->linkService->findBySlug($slug);
            if (!$link) {
                return response()->json(['message' => 'Link not found'], 404);
            }

            if ($link->expires_at && now()->greaterThan($link->expires_at)) {
                return response()->json(['message' => 'Link has expired'], 410);
            }
            
            $this->linkService->trackRedirect($request, $link);

            return redirect()->away($link->target, 302);
        } catch (\Exception $e) {
            Log::error("Redirect error: " . $e->getMessage(), [
                'exception' => $e,
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Internal Server Error'
            ], 500);
        }
    }

    public function downloadQr(int $id): StreamedResponse {
        $link = $this->linkService->find($id);
        if (!$link) {
            return response()->json(['message' => 'Link not found'], 404);
        }
        
        $filePath = 'qr/qr_' . $link->slug . '.png';

        if(!Storage::disk('public')->exists($filePath)) {
            return response()->json([
                'status' => 'error',
                'message' => 'QR code not found'
            ], 404);
        }
        
        return Storage::disk('public')->download($filePath, 'qr_' . $link->slug . '.png');
    }
}
