<?php

namespace App\Services;

use App\Repositories\LinkAnalyticsRepository;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class LinkAnalyticsService
{
    protected LinkAnalyticsRepository $repository;

    public function __construct(LinkAnalyticsRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Get dashboard analytics data
     */
    public function getDashboardAnalytics(int $userId): array
    {
        $cacheKey = "user_analytics_{$userId}";

        // Reduce cache time from 5 minutes to 30 seconds for real-time updates
        return Cache::remember($cacheKey, now()->addSeconds(30), function () use ($userId) {
            $totalClicksScans = $this->repository->getTotalClicksScans($userId);
            $deviceStats = $this->repository->getClicksScansByDevice($userId);
            $referrerStats = $this->repository->getClicksScansByReferrer($userId);
            $topPerformingDate = $this->repository->getTopPerformingDate($userId);
            $timeSeriesData = $this->repository->getClicksScansOverTime($userId, '30days');

            return [
                'total_clicks_scans' => $totalClicksScans,
                'top_performing_date' => $topPerformingDate ? [
                    'date' => $topPerformingDate['date'],
                    'count' => $topPerformingDate['count'],
                    'formatted_date' => Carbon::parse($topPerformingDate['date'])->format('M j, Y')
                ] : null,
                'device_breakdown' => $deviceStats,
                'referrer_breakdown' => $referrerStats,
                'time_series' => $timeSeriesData
            ];
        });
    }

    /**
     * Get clicks and scans over time with different periods
     */
    public function getTimeSeriesData(int $userId, string $period = '30days'): array
    {
        $validPeriods = ['7days', '30days', '90days', '1year'];

        if (!in_array($period, $validPeriods)) {
            throw new \InvalidArgumentException('Invalid period. Must be one of: ' . implode(', ', $validPeriods));
        }

        $cacheKey = "time_series_{$userId}_{$period}";

        // Reduce cache time from 10 minutes to 1 minute
        return Cache::remember($cacheKey, now()->addMinute(), function () use ($userId, $period) {
            return $this->repository->getClicksScansOverTime($userId, $period);
        });
    }

    /**
     * Get device statistics
     */
    public function getDeviceStatistics(int $userId): array
    {
        $cacheKey = "device_stats_{$userId}";

        // Reduce cache time from 15 minutes to 1 minute
        return Cache::remember($cacheKey, now()->addMinute(), function () use ($userId) {
            $deviceStats = $this->repository->getClicksScansByDevice($userId);
            $total = array_sum(array_column($deviceStats, 'count'));

            return [
                'total' => $total,
                'breakdown' => array_map(function ($item) use ($total) {
                    return [
                        'device_type' => $item['device_type'],
                        'count' => $item['count'],
                        'percentage' => $total > 0 ? round(($item['count'] / $total) * 100, 2) : 0
                    ];
                }, $deviceStats)
            ];
        });
    }

    /**
     * Get referrer statistics
     */
    public function getReferrerStatistics(int $userId, int $limit = 10): array
    {
        $cacheKey = "referrer_stats_{$userId}_{$limit}";

        // Reduce cache time from 15 minutes to 1 minute
        return Cache::remember($cacheKey, now()->addMinute(), function () use ($userId, $limit) {
            $referrerStats = $this->repository->getClicksScansByReferrer($userId, $limit);
            $total = array_sum(array_column($referrerStats, 'count'));

            return [
                'total' => $total,
                'breakdown' => array_map(function ($item) use ($total) {
                    return [
                        'referrer' => $this->formatReferrer($item['referrer']),
                        'count' => $item['count'],
                        'percentage' => $total > 0 ? round(($item['count'] / $total) * 100, 2) : 0
                    ];
                }, $referrerStats)
            ];
        });
    }

    /**
     * Get country statistics
     */
    public function getCountryStatistics(int $userId, int $limit = 10): array
    {
        $cacheKey = "country_stats_{$userId}_{$limit}";

        // Reduce cache time from 15 minutes to 1 minute
        return Cache::remember($cacheKey, now()->addMinute(), function () use ($userId, $limit) {
            $countryStats = $this->repository->getClicksScansByCountry($userId, $limit);
            $total = array_sum(array_column($countryStats, 'count'));

            return [
                'total' => $total,
                'breakdown' => array_map(function ($item) use ($total) {
                    return [
                        'country' => $item['country'],
                        'count' => $item['count'],
                        'percentage' => $total > 0 ? round(($item['count'] / $total) * 100, 2) : 0
                    ];
                }, $countryStats)
            ];
        });
    }

    /**
     * Get analytics for specific link
     */
    public function getLinkAnalytics(int $linkId, int $userId): ?array
    {
        $cacheKey = "link_analytics_{$linkId}_{$userId}";

        // Reduce cache time from 5 minutes to 30 seconds
        return Cache::remember($cacheKey, now()->addSeconds(30), function () use ($linkId, $userId) {
            $analytics = $this->repository->getLinkAnalytics($linkId, $userId);

            if (!$analytics) {
                return null;
            }

            // Add percentage calculations
            $deviceTotal = array_sum(array_column($analytics['device_stats'], 'count'));
            $countryTotal = array_sum(array_column($analytics['country_stats'], 'count'));

            $analytics['device_stats'] = array_map(function ($item) use ($deviceTotal) {
                return [
                    'device_type' => $item['device_type'],
                    'count' => $item['count'],
                    'percentage' => $deviceTotal > 0 ? round(($item['count'] / $deviceTotal) * 100, 2) : 0
                ];
            }, $analytics['device_stats']);

            $analytics['country_stats'] = array_map(function ($item) use ($countryTotal) {
                return [
                    'country' => $item['country'],
                    'count' => $item['count'],
                    'percentage' => $countryTotal > 0 ? round(($item['count'] / $countryTotal) * 100, 2) : 0
                ];
            }, $analytics['country_stats']);

            return $analytics;
        });
    }

    /**
     * Clear analytics cache for user when new data is added
     */
    public function clearUserCache(int $userId): void
    {
        $keys = [
            "user_analytics_{$userId}",
            "device_stats_{$userId}",
            "analytics_summary_{$userId}",
        ];

        // Clear time series cache for all periods
        $periods = ['7days', '30days', '90days', '1year'];
        foreach ($periods as $period) {
            $keys[] = "time_series_{$userId}_{$period}";
        }

        // Clear referrer stats cache for common limits
        $limits = [10, 20, 50];
        foreach ($limits as $limit) {
            $keys[] = "referrer_stats_{$userId}_{$limit}";
            $keys[] = "country_stats_{$userId}_{$limit}";
        }

        foreach ($keys as $key) {
            Cache::forget($key);
        }
    }

    /**
     * Clear link-specific cache
     */
    public function clearLinkCache(int $linkId, int $userId): void
    {
        Cache::forget("link_analytics_{$linkId}_{$userId}");
        $this->clearUserCache($userId); // Also clear user-level cache since it includes this link
    }

    /**
     * Invalidate cache when new redirect data is added
     */
    public function invalidateCacheOnNewRedirect(int $linkId, int $userId): void
    {
        // Clear all related caches immediately
        $this->clearLinkCache($linkId, $userId);
        $this->clearUserCache($userId);
    }

    /**
     * Get fresh data without cache (for debugging)
     */
    public function getFreshDashboardAnalytics(int $userId): array
    {
        $totalClicksScans = $this->repository->getTotalClicksScans($userId);
        $deviceStats = $this->repository->getClicksScansByDevice($userId);
        $referrerStats = $this->repository->getClicksScansByReferrer($userId);
        $topPerformingDate = $this->repository->getTopPerformingDate($userId);
        $timeSeriesData = $this->repository->getClicksScansOverTime($userId, '30days');

        return [
            'total_clicks_scans' => $totalClicksScans,
            'top_performing_date' => $topPerformingDate ? [
                'date' => $topPerformingDate['date'],
                'count' => $topPerformingDate['count'],
                'formatted_date' => Carbon::parse($topPerformingDate['date'])->format('M j, Y')
            ] : null,
            'device_breakdown' => $deviceStats,
            'referrer_breakdown' => $referrerStats,
            'time_series' => $timeSeriesData,
            'cache_status' => 'fresh_data'
        ];
    }

    /**
     * Format referrer for display
     */
    private function formatReferrer(string $referrer): string
    {
        if ($referrer === 'Direct' || empty($referrer)) {
            return 'Direct';
        }

        // Extract domain from URL
        $parsedUrl = parse_url($referrer);
        if (isset($parsedUrl['host'])) {
            $domain = $parsedUrl['host'];
            // Remove www. prefix
            return preg_replace('/^www\./', '', $domain);
        }

        return $referrer;
    }

    /**
     * Get analytics summary
     */
    public function getAnalyticsSummary(int $userId): array
    {
        $cacheKey = "analytics_summary_{$userId}";

        // Reduce cache time from 5 minutes to 30 seconds
        return Cache::remember($cacheKey, now()->addSeconds(30), function () use ($userId) {
            $currentMonth = $this->repository->getClicksScansOverTime($userId, '30days');
            $previousMonth = $this->repository->getClicksScansOverTime($userId, '60days');

            $currentTotal = array_sum(array_column($currentMonth, 'count'));
            $previousTotal = array_sum(array_column(array_slice($previousMonth, 0, -30), 'count'));

            $growthRate = 0;
            if ($previousTotal > 0) {
                $growthRate = round((($currentTotal - $previousTotal) / $previousTotal) * 100, 2);
            }

            return [
                'current_month_total' => $currentTotal,
                'previous_month_total' => $previousTotal,
                'growth_rate' => $growthRate,
                'growth_direction' => $growthRate > 0 ? 'up' : ($growthRate < 0 ? 'down' : 'stable')
            ];
        });
    }
}
