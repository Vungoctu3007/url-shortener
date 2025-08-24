<?php

namespace App\Http\Controllers\Api\V1\Link;

use App\Http\Controllers\Controller;
use App\Services\RedirectService;
use Illuminate\Http\Request;
use App\Models\Redirect;

class RedirectController extends Controller
{
    protected $redirectService;

    public function __construct(RedirectService $redirectService)
    {
        $this->redirectService = $redirectService;
    }
    public function index(Request $request)
    {
        $userId = $request->input('user_id');
        $limit = (int) $request->input('limit', 10);
        $cursor = $request->input('cursor');

        if (!$userId) {
            return response()->json([
                'status' => false,
                'message' => 'Missing user_id',
            ], 400);
        }

        try {
            $redirects = $this->redirectService->getUserRedirects($userId, $limit, $cursor);

            return response()->json([
                'status' => true,
                'data' => $redirects,
            ]);
        } catch (\Throwable $e) {
            \Log::error("Error fetching user redirects", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'status' => false,
                'message' => 'Something went wrong. Please try again later.',
            ], 500);
        }
    }

}
