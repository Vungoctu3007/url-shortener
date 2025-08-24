<?php

namespace App\Http\Controllers\Api\V1\Statistic;

use App\Http\Controllers\Controller;
use App\Services\LinkAnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\ValidationException;

class AnalyticsController extends Controller
{
    protected LinkAnalyticsService $analyticsService;

    public function __construct(LinkAnalyticsService $analyticsService)
    {
        $this->analyticsService = $analyticsService;
    }

    /**
     * Get dashboard analytics
     *
     * @return JsonResponse
     */
    public function dashboard(): JsonResponse
    {
        try {
            $userId = Auth::id();

            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Invalid or missing JWT token.',
                    'error_code' => 'UNAUTHENTICATED'
                ], 401);
            }

            $analytics = $this->analyticsService->getDashboardAnalytics($userId);

            return response()->json([
                'success' => true,
                'data' => $analytics,
                'message' => 'Dashboard analytics retrieved successfully',
                'cache_info' => [
                    'timestamp' => now()->toISOString(),
                    'cache_ttl' => '30 seconds'
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Analytics dashboard error', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve dashboard analytics',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get fresh dashboard analytics (no cache)
     *
     * @return JsonResponse
     */
    public function freshDashboard(): JsonResponse
    {
        try {
            $userId = Auth::id();

            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Invalid or missing JWT token.',
                    'error_code' => 'UNAUTHENTICATED'
                ], 401);
            }

            // Get fresh data without cache
            $analytics = $this->analyticsService->getFreshDashboardAnalytics($userId);

            return response()->json([
                'success' => true,
                'data' => $analytics,
                'message' => 'Fresh dashboard analytics retrieved successfully',
                'cache_info' => [
                    'timestamp' => now()->toISOString(),
                    'cache_status' => 'bypassed'
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Fresh analytics dashboard error', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve fresh dashboard analytics',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get time series data
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function timeSeries(Request $request): JsonResponse
    {
        try {
            $userId = Auth::id();

            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Invalid or missing JWT token.',
                    'error_code' => 'UNAUTHENTICATED'
                ], 401);
            }

            $request->validate([
                'period' => 'sometimes|string|in:7days,30days,90days,1year',
                'fresh' => 'sometimes|boolean' // Add fresh parameter
            ]);

            $period = $request->input('period', '30days');
            $fresh = $request->boolean('fresh', false);

            if ($fresh) {
                // Clear cache first
                Cache::forget("time_series_{$userId}_{$period}");
            }

            $data = $this->analyticsService->getTimeSeriesData($userId, $period);

            return response()->json([
                'success' => true,
                'data' => [
                    'period' => $period,
                    'time_series' => $data
                ],
                'message' => 'Time series data retrieved successfully',
                'cache_info' => [
                    'timestamp' => now()->toISOString(),
                    'fresh_request' => $fresh
                ]
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);

        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);

        } catch (\Exception $e) {
            \Log::error('Analytics time series error', [
                'user_id' => Auth::id(),
                'period' => $request->input('period'),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve time series data',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get device statistics
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function deviceStats(Request $request): JsonResponse
    {
        try {
            $userId = Auth::id();

            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Invalid or missing JWT token.',
                    'error_code' => 'UNAUTHENTICATED'
                ], 401);
            }

            $fresh = $request->boolean('fresh', false);

            if ($fresh) {
                Cache::forget("device_stats_{$userId}");
            }

            $stats = $this->analyticsService->getDeviceStatistics($userId);

            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'Device statistics retrieved successfully',
                'cache_info' => [
                    'timestamp' => now()->toISOString(),
                    'fresh_request' => $fresh
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Analytics device stats error', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve device statistics',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get referrer statistics
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function referrerStats(Request $request): JsonResponse
    {
        try {
            $userId = Auth::id();

            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Invalid or missing JWT token.',
                    'error_code' => 'UNAUTHENTICATED'
                ], 401);
            }

            $request->validate([
                'limit' => 'sometimes|integer|min:1|max:50',
                'fresh' => 'sometimes|boolean'
            ]);

            $limit = $request->input('limit', 10);
            $fresh = $request->boolean('fresh', false);

            if ($fresh) {
                Cache::forget("referrer_stats_{$userId}_{$limit}");
            }

            $stats = $this->analyticsService->getReferrerStatistics($userId, $limit);

            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'Referrer statistics retrieved successfully',
                'cache_info' => [
                    'timestamp' => now()->toISOString(),
                    'fresh_request' => $fresh
                ]
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            \Log::error('Analytics referrer stats error', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve referrer statistics',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get country statistics
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function countryStats(Request $request): JsonResponse
    {
        try {
            $userId = Auth::id();

            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Invalid or missing JWT token.',
                    'error_code' => 'UNAUTHENTICATED'
                ], 401);
            }

            $request->validate([
                'limit' => 'sometimes|integer|min:1|max:50',
                'fresh' => 'sometimes|boolean'
            ]);

            $limit = $request->input('limit', 10);
            $fresh = $request->boolean('fresh', false);

            if ($fresh) {
                Cache::forget("country_stats_{$userId}_{$limit}");
            }

            $stats = $this->analyticsService->getCountryStatistics($userId, $limit);

            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'Country statistics retrieved successfully',
                'cache_info' => [
                    'timestamp' => now()->toISOString(),
                    'fresh_request' => $fresh
                ]
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            \Log::error('Analytics country stats error', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve country statistics',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get analytics for specific link
     *
     * @param int $linkId
     * @param Request $request
     * @return JsonResponse
     */
    public function linkAnalytics(int $linkId, Request $request): JsonResponse
    {
        try {
            $userId = Auth::id();

            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Invalid or missing JWT token.',
                    'error_code' => 'UNAUTHENTICATED'
                ], 401);
            }

            $fresh = $request->boolean('fresh', false);

            if ($fresh) {
                Cache::forget("link_analytics_{$linkId}_{$userId}");
            }

            $analytics = $this->analyticsService->getLinkAnalytics($linkId, $userId);

            if (!$analytics) {
                return response()->json([
                    'success' => false,
                    'message' => 'Link not found or access denied'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $analytics,
                'message' => 'Link analytics retrieved successfully',
                'cache_info' => [
                    'timestamp' => now()->toISOString(),
                    'fresh_request' => $fresh
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Analytics link analytics error', [
                'user_id' => Auth::id(),
                'link_id' => $linkId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve link analytics',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get analytics summary
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function summary(Request $request): JsonResponse
    {
        try {
            $userId = Auth::id();

            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Invalid or missing JWT token.',
                    'error_code' => 'UNAUTHENTICATED'
                ], 401);
            }

            $fresh = $request->boolean('fresh', false);

            if ($fresh) {
                Cache::forget("analytics_summary_{$userId}");
            }

            $summary = $this->analyticsService->getAnalyticsSummary($userId);

            return response()->json([
                'success' => true,
                'data' => $summary,
                'message' => 'Analytics summary retrieved successfully',
                'cache_info' => [
                    'timestamp' => now()->toISOString(),
                    'fresh_request' => $fresh
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Analytics summary error', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve analytics summary',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Clear analytics cache
     *
     * @return JsonResponse
     */
    public function clearCache(): JsonResponse
    {
        try {
            $userId = Auth::id();

            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Invalid or missing JWT token.',
                    'error_code' => 'UNAUTHENTICATED'
                ], 401);
            }

            $this->analyticsService->clearUserCache($userId);

            return response()->json([
                'success' => true,
                'message' => 'Analytics cache cleared successfully',
                'cache_info' => [
                    'timestamp' => now()->toISOString(),
                    'action' => 'cache_cleared'
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Analytics clear cache error', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to clear analytics cache',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Export analytics data
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function export(Request $request): JsonResponse
    {
        try {
            $userId = Auth::id();

            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Invalid or missing JWT token.',
                    'error_code' => 'UNAUTHENTICATED'
                ], 401);
            }

            $request->validate([
                'format' => 'sometimes|string|in:json,csv',
                'period' => 'sometimes|string|in:7days,30days,90days,1year',
                'include' => 'sometimes|array',
                'include.*' => 'string|in:time_series,device_stats,referrer_stats,country_stats',
                'fresh' => 'sometimes|boolean'
            ]);

            $format = $request->input('format', 'json');
            $period = $request->input('period', '30days');
            $include = $request->input('include', ['time_series', 'device_stats', 'referrer_stats', 'country_stats']);
            $fresh = $request->boolean('fresh', false);

            $exportData = [];

            if (in_array('time_series', $include)) {
                if ($fresh) {
                    Cache::forget("time_series_{$userId}_{$period}");
                }
                $exportData['time_series'] = $this->analyticsService->getTimeSeriesData($userId, $period);
            }

            if (in_array('device_stats', $include)) {
                if ($fresh) {
                    Cache::forget("device_stats_{$userId}");
                }
                $exportData['device_stats'] = $this->analyticsService->getDeviceStatistics($userId);
            }

            if (in_array('referrer_stats', $include)) {
                if ($fresh) {
                    Cache::forget("referrer_stats_{$userId}_50");
                }
                $exportData['referrer_stats'] = $this->analyticsService->getReferrerStatistics($userId, 50);
            }

            if (in_array('country_stats', $include)) {
                if ($fresh) {
                    Cache::forget("country_stats_{$userId}_50");
                }
                $exportData['country_stats'] = $this->analyticsService->getCountryStatistics($userId, 50);
            }

            $exportData['exported_at'] = now()->toISOString();
            $exportData['period'] = $period;
            $exportData['cache_info'] = [
                'fresh_request' => $fresh,
                'timestamp' => now()->toISOString()
            ];

            if ($format === 'csv') {
                return $this->exportToCsv($exportData, $period);
            }

            return response()->json([
                'success' => true,
                'data' => $exportData,
                'message' => 'Analytics data exported successfully'
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            \Log::error('Analytics export error', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to export analytics data',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Export data to CSV format
     */
    private function exportToCsv(array $exportData, string $period): \Illuminate\Http\Response
    {
        $filename = 'analytics_export_' . $period . '_' . now()->format('Y-m-d_H-i-s') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function() use ($exportData) {
            $file = fopen('php://output', 'w');

            // Add BOM for UTF-8
            fwrite($file, "\xEF\xBB\xBF");

            // Export time series data
            if (isset($exportData['time_series']) && !empty($exportData['time_series'])) {
                fputcsv($file, ['=== TIME SERIES DATA ===']);
                fputcsv($file, ['Date', 'Clicks + Scans']);

                foreach ($exportData['time_series'] as $item) {
                    fputcsv($file, [
                        $item['date'],
                        $item['count']
                    ]);
                }
                fputcsv($file, []); // Empty row
            }

            // Export device statistics
            if (isset($exportData['device_stats']) && !empty($exportData['device_stats']['breakdown'])) {
                fputcsv($file, ['=== DEVICE STATISTICS ===']);
                fputcsv($file, ['Device Type', 'Count', 'Percentage']);

                foreach ($exportData['device_stats']['breakdown'] as $item) {
                    fputcsv($file, [
                        $item['device_type'],
                        $item['count'],
                        $item['percentage'] . '%'
                    ]);
                }
                fputcsv($file, ['Total', $exportData['device_stats']['total'], '100%']);
                fputcsv($file, []); // Empty row
            }

            // Export referrer statistics
            if (isset($exportData['referrer_stats']) && !empty($exportData['referrer_stats']['breakdown'])) {
                fputcsv($file, ['=== REFERRER STATISTICS ===']);
                fputcsv($file, ['Referrer', 'Count', 'Percentage']);

                foreach ($exportData['referrer_stats']['breakdown'] as $item) {
                    fputcsv($file, [
                        $item['referrer'],
                        $item['count'],
                        $item['percentage'] . '%'
                    ]);
                }
                fputcsv($file, ['Total', $exportData['referrer_stats']['total'], '100%']);
                fputcsv($file, []); // Empty row
            }

            // Export country statistics
            if (isset($exportData['country_stats']) && !empty($exportData['country_stats']['breakdown'])) {
                fputcsv($file, ['=== COUNTRY STATISTICS ===']);
                fputcsv($file, ['Country', 'Count', 'Percentage']);

                foreach ($exportData['country_stats']['breakdown'] as $item) {
                    fputcsv($file, [
                        $item['country'],
                        $item['count'],
                        $item['percentage'] . '%'
                    ]);
                }
                fputcsv($file, ['Total', $exportData['country_stats']['total'], '100%']);
                fputcsv($file, []); // Empty row
            }

            // Export metadata
            fputcsv($file, ['=== EXPORT METADATA ===']);
            fputcsv($file, ['Exported At', $exportData['exported_at'] ?? now()->toISOString()]);
            fputcsv($file, ['Period', $exportData['period'] ?? 'N/A']);
            fputcsv($file, ['Generated By', 'Analytics API']);
            fputcsv($file, ['Cache Status', $exportData['cache_info']['fresh_request'] ?? false ? 'Fresh Data' : 'Cached Data']);

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
