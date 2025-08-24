<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class LinkAnalyticsRepository
{
    /**
     * Get total clicks and scans for user's links
     */
    public function getTotalClicksScans(int $userId): int
    {
        return DB::table('redirects')
            ->join('links', 'redirects.link_id', '=', 'links.id')
            ->where('links.user_id', $userId)
            ->whereNull('links.deleted_at')
            ->count();
    }

    /**
     * Get clicks and scans by device type
     */
    public function getClicksScansByDevice(int $userId): array
    {
        $results = DB::table('redirects')
            ->join('links', 'redirects.link_id', '=', 'links.id')
            ->select(
                DB::raw('
                    CASE
                        WHEN LOWER(redirects.user_agent) LIKE "%mobile%" OR
                             LOWER(redirects.user_agent) LIKE "%android%" OR
                             LOWER(redirects.user_agent) LIKE "%iphone%" THEN "Mobile"
                        WHEN LOWER(redirects.user_agent) LIKE "%tablet%" OR
                             LOWER(redirects.user_agent) LIKE "%ipad%" THEN "Tablet"
                        WHEN LOWER(redirects.user_agent) LIKE "%kindle%" OR
                             LOWER(redirects.user_agent) LIKE "%e-reader%" THEN "E-Reader"
                        WHEN redirects.user_agent IS NULL OR redirects.user_agent = "" THEN "Unknown"
                        ELSE "Desktop"
                    END as device_type
                '),
                DB::raw('COUNT(*) as count')
            )
            ->where('links.user_id', $userId)
            ->whereNull('links.deleted_at')
            ->groupBy('device_type')
            ->orderBy('count', 'desc')
            ->get()
            ->toArray();

        return array_map(function($item) {
            return [
                'device_type' => $item->device_type,
                'count' => (int) $item->count
            ];
        }, $results);
    }

    /**
     * Get clicks and scans by referrer
     */
    public function getClicksScansByReferrer(int $userId, int $limit = 10): array
    {
        $results = DB::table('redirects')
            ->join('links', 'redirects.link_id', '=', 'links.id')
            ->select(
                DB::raw('
                    CASE
                        WHEN redirects.referrer IS NULL OR redirects.referrer = "" THEN "Direct"
                        ELSE redirects.referrer
                    END as referrer
                '),
                DB::raw('COUNT(*) as count')
            )
            ->where('links.user_id', $userId)
            ->whereNull('links.deleted_at')
            ->groupBy('referrer')
            ->orderBy('count', 'desc')
            ->limit($limit)
            ->get()
            ->toArray();

        return array_map(function($item) {
            return [
                'referrer' => $item->referrer,
                'count' => (int) $item->count
            ];
        }, $results);
    }

    /**
     * Get clicks and scans over time
     */
    public function getClicksScansOverTime(int $userId, string $period = '30days'): array
    {
        $startDate = match($period) {
            '7days' => Carbon::now()->subDays(7),
            '30days' => Carbon::now()->subDays(30),
            '90days' => Carbon::now()->subDays(90),
            '1year' => Carbon::now()->subYear(),
            default => Carbon::now()->subDays(30)
        };

        $dateFormat = match($period) {
            '7days' => '%Y-%m-%d %H:00:00',
            '30days' => '%Y-%m-%d',
            '90days' => '%Y-%m-%d',
            '1year' => '%Y-%m',
            default => '%Y-%m-%d'
        };

        $results = DB::table('redirects')
            ->join('links', 'redirects.link_id', '=', 'links.id')
            ->select(
                DB::raw("DATE_FORMAT(redirects.created_at, '{$dateFormat}') as date"),
                DB::raw('COUNT(*) as count')
            )
            ->where('links.user_id', $userId)
            ->where('redirects.created_at', '>=', $startDate)
            ->whereNull('links.deleted_at')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->toArray();

        return array_map(function($item) {
            return [
                'date' => $item->date,
                'count' => (int) $item->count
            ];
        }, $results);
    }

    /**
     * Get top performing date
     */
    public function getTopPerformingDate(int $userId): ?array
    {
        $result = DB::table('redirects')
            ->join('links', 'redirects.link_id', '=', 'links.id')
            ->select(
                DB::raw('DATE(redirects.created_at) as date'),
                DB::raw('COUNT(*) as count')
            )
            ->where('links.user_id', $userId)
            ->whereNull('links.deleted_at')
            ->groupBy('date')
            ->orderBy('count', 'desc')
            ->first();

        if (!$result) {
            return null;
        }

        return [
            'date' => $result->date,
            'count' => (int) $result->count
        ];
    }

    /**
     * Get clicks and scans by country
     */
    public function getClicksScansByCountry(int $userId, int $limit = 10): array
    {
        $results = DB::table('redirects')
            ->join('links', 'redirects.link_id', '=', 'links.id')
            ->select(
                DB::raw('
                    CASE
                        WHEN redirects.country IS NULL OR redirects.country = "" THEN "Unknown"
                        ELSE redirects.country
                    END as country
                '),
                DB::raw('COUNT(*) as count')
            )
            ->where('links.user_id', $userId)
            ->whereNull('links.deleted_at')
            ->groupBy('country')
            ->orderBy('count', 'desc')
            ->limit($limit)
            ->get()
            ->toArray();

        return array_map(function($item) {
            return [
                'country' => $item->country,
                'count' => (int) $item->count
            ];
        }, $results);
    }

    /**
     * Get analytics for specific link
     */
    public function getLinkAnalytics(int $linkId, int $userId): ?array
    {
        // Verify link belongs to user
        $linkExists = DB::table('links')
            ->where('id', $linkId)
            ->where('user_id', $userId)
            ->whereNull('deleted_at')
            ->exists();

        if (!$linkExists) {
            return null;
        }

        $totalClicks = DB::table('redirects')
            ->where('link_id', $linkId)
            ->count();

        $deviceStats = DB::table('redirects')
            ->select(
                DB::raw('
                    CASE
                        WHEN LOWER(user_agent) LIKE "%mobile%" OR
                             LOWER(user_agent) LIKE "%android%" OR
                             LOWER(user_agent) LIKE "%iphone%" THEN "Mobile"
                        WHEN LOWER(user_agent) LIKE "%tablet%" OR
                             LOWER(user_agent) LIKE "%ipad%" THEN "Tablet"
                        WHEN LOWER(user_agent) LIKE "%kindle%" OR
                             LOWER(user_agent) LIKE "%e-reader%" THEN "E-Reader"
                        WHEN user_agent IS NULL OR user_agent = "" THEN "Unknown"
                        ELSE "Desktop"
                    END as device_type
                '),
                DB::raw('COUNT(*) as count')
            )
            ->where('link_id', $linkId)
            ->groupBy('device_type')
            ->orderBy('count', 'desc')
            ->get()
            ->toArray();

        $countryStats = DB::table('redirects')
            ->select(
                DB::raw('
                    CASE
                        WHEN country IS NULL OR country = "" THEN "Unknown"
                        ELSE country
                    END as country
                '),
                DB::raw('COUNT(*) as count')
            )
            ->where('link_id', $linkId)
            ->groupBy('country')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get()
            ->toArray();

        return [
            'total_clicks' => $totalClicks,
            'device_stats' => array_map(function($item) {
                return [
                    'device_type' => $item->device_type,
                    'count' => (int) $item->count
                ];
            }, $deviceStats),
            'country_stats' => array_map(function($item) {
                return [
                    'country' => $item->country,
                    'count' => (int) $item->count
                ];
            }, $countryStats)
        ];
    }
}
