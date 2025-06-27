<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLinkRequest;
use App\Interfaces\Services\LinkServiceInterface;
use App\Jobs\IncrementLinkClicks;
use App\Jobs\LogRedirectJob;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class LinkController extends Controller
{
    protected LinkServiceInterface $linkService;

    public function __construct(LinkServiceInterface $linkService)
    {
        $this->linkService = $linkService;
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $links = $this->linkService->paginate($request);
            return response()->json([
                'status' => 'success',
                'data' => $links
            ], 200);
        } catch (\Exception $e) {
            Log::error('Failed to list links: ' . $e->getMessage());
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
            $link = $this->linkService->find($id);

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

            LogRedirectJob::dispatch([
                'link_id' => $link->id,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'referrer' => $request->headers->get('referer'),
                'country' => null
            ]);
            dispatch(new IncrementLinkClicks($link->id));
            return redirect()->away($link->target);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Internal Server Error'
            ], 500);
        }
    }
}
