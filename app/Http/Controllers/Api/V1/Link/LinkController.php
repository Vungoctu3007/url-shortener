<?php

namespace App\Http\Controllers\Api\V1\Link;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLinkRequest;
use App\Http\Requests\UpdateLinkRequest;
use App\Interfaces\Services\LinkServiceInterface;
use App\Jobs\IncrementLinkClicks;
use App\Jobs\LogRedirectJob;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

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
            // Get authenticated user ID
            $userId = Auth::id();

            if (!$userId) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized. Please login first.'
                ], 401);
            }

            // Pass user ID to service for filtering
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

    // Add this to your redirect method for debugging
    public function redirect(Request $request, $slug)
    {
        try {
            // Log all request data for debugging
            Log::info("Full request data for debugging", [
                'headers' => $request->headers->all(),
                'server' => $_SERVER,
                'ip_methods' => [
                    'request_ip' => $request->ip(),
                    'getClientIps' => $request->getClientIps(),
                    'server_remote_addr' => $_SERVER['REMOTE_ADDR'] ?? 'not_set',
                    'http_x_forwarded_for' => $_SERVER['HTTP_X_FORWARDED_FOR'] ?? 'not_set',
                    'http_x_real_ip' => $_SERVER['HTTP_X_REAL_IP'] ?? 'not_set',
                ],
                'user_agent_methods' => [
                    'userAgent()' => $request->userAgent(),
                    'header_user_agent' => $request->header('User-Agent'),
                    'server_user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'not_set',
                ],
                'referrer_methods' => [
                    'header_referer' => $request->header('Referer'),
                    'header_referrer' => $request->header('Referrer'),
                    'server_referer' => $_SERVER['HTTP_REFERER'] ?? 'not_set',
                ]
            ]);

            $link = $this->linkService->findBySlug($slug);
            if (!$link) {
                Log::warning("Link not found for slug: $slug");
                return response()->json(['message' => 'Link not found'], 404);
            }

            if ($link->expires_at && now()->greaterThan($link->expires_at)) {
                Log::info("Link expired for slug: $slug");
                return response()->json(['message' => 'Link has expired'], 410);
            }

            // Capture data with multiple fallbacks
            $userAgent = $request->header('User-Agent') ?:
                $request->userAgent() ?:
                ($_SERVER['HTTP_USER_AGENT'] ?? null);

            $referrer = $request->header('Referer') ?:
                $request->header('Referrer') ?:
                ($_SERVER['HTTP_REFERER'] ?? null);

            $ipAddress = $this->getClientIpAddress($request);

            $redirectData = [
                'link_id' => $link->id,
                'ip_address' => $ipAddress,
                'user_agent' => $userAgent,
                'referrer' => $referrer,
                'country' => $this->getCountryFromIp($ipAddress)
            ];

            Log::info("Final redirect data to be logged", $redirectData);

            // Use sync dispatch for debugging - change to queue later
            LogRedirectJob::dispatchSync($redirectData);

            // Also dispatch the click increment
            dispatch(new IncrementLinkClicks($link->id));

            Log::info("Redirecting to: {$link->target}");
            return redirect()->away($link->target);
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

    /**
     * Get client IP address with fallback options
     */
    private function getClientIpAddress(Request $request): ?string
    {
        $ipKeys = [
            'HTTP_X_FORWARDED_FOR',
            'HTTP_X_REAL_IP',
            'HTTP_CLIENT_IP',
            'HTTP_X_FORWARDED',
            'HTTP_FORWARDED_FOR',
            'HTTP_FORWARDED',
            'REMOTE_ADDR'
        ];

        foreach ($ipKeys as $key) {
            if (!empty($_SERVER[$key])) {
                $ips = explode(',', $_SERVER[$key]);
                $ip = trim($ips[0]);

                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                    return $ip;
                }
            }
        }

        return $request->ip();
    }
    /**
     * Get country from IP address with multiple fallback services
     */
    private function getCountryFromIp(?string $ip): ?string
    {
        if (!$ip || $ip === '127.0.0.1' || $ip === '::1' ||
            str_starts_with($ip, '192.168.') || str_starts_with($ip, '10.') ||
            str_starts_with($ip, '172.')) {
            return 'Local/Private';
        }

        // Try multiple IP geolocation services
        $services = [
            'ipapi' => "http://ip-api.com/json/{$ip}?fields=status,country,countryCode",
            'ipinfo' => "https://ipinfo.io/{$ip}/json",
            'geojs' => "https://get.geojs.io/v1/ip/geo/{$ip}.json"
        ];

        foreach ($services as $serviceName => $url) {
            try {
                Log::info("Trying {$serviceName} for IP: {$ip}");

                $context = stream_context_create([
                    'http' => [
                        'timeout' => 5,
                        'user_agent' => 'Mozilla/5.0 (compatible; URL-Shortener/1.0)'
                    ]
                ]);

                $response = file_get_contents($url, false, $context);

                if ($response === false) {
                    Log::warning("{$serviceName} failed to respond");
                    continue;
                }

                $data = json_decode($response, true);

                if (!$data) {
                    Log::warning("{$serviceName} returned invalid JSON");
                    continue;
                }

                $country = null;

                switch ($serviceName) {
                    case 'ipapi':
                        if (isset($data['status']) && $data['status'] === 'success') {
                            $country = $data['country'] ?? null;
                        }
                        break;

                    case 'ipinfo':
                        $country = $data['country'] ?? null;
                        break;

                    case 'geojs':
                        $country = $data['country'] ?? null;
                        break;
                }

                if ($country) {
                    Log::info("Successfully got country '{$country}' from {$serviceName} for IP: {$ip}");
                    return $country;
                }

            } catch (\Exception $e) {
                Log::warning("Error with {$serviceName} for IP {$ip}: " . $e->getMessage());
                continue;
            }
        }

        Log::warning("All IP geolocation services failed for IP: {$ip}");
        return 'Unknown';
    }

    /**
     * Alternative: Use MaxMind GeoIP2 (recommended for production)
     * First install: composer require geoip2/geoip2
     */
    private function getCountryFromIpMaxMind(?string $ip): ?string
    {
        if (!$ip || $ip === '127.0.0.1' || $ip === '::1') {
            return 'Local';
        }

        try {
            // You need to download GeoLite2-Country.mmdb from MaxMind
            $reader = new \GeoIp2\Database\Reader(storage_path('app/GeoLite2-Country.mmdb'));
            $record = $reader->country($ip);

            return $record->country->name;
        } catch (\Exception $e) {
            Log::warning("MaxMind GeoIP2 failed for IP {$ip}: " . $e->getMessage());
            return $this->getCountryFromIp($ip); // Fallback to free services
        }
    }
}
