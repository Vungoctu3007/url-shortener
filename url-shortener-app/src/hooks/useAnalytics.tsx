// hooks/useAnalytics.ts - COMPLETE FIXED VERSION

import { useState, useEffect, useCallback } from 'react';
import analyticsService from '@/api/analyticsService';
import type {
    DashboardAnalytics,
    TimeSeriesData,
    DeviceStatistics,
    ReferrerStatistics,
    CountryStatistics,
    AnalyticsSummary,
    LinkAnalytics
} from '@/api/analyticsService';

interface UseAnalyticsOptions {
    autoRefresh?: boolean;
    refreshInterval?: number; // in milliseconds
    period?: '7days' | '30days' | '90days' | '1year';
}

interface AnalyticsData {
    dashboard: DashboardAnalytics | null;
    timeSeries: TimeSeriesData[];
    devices: DeviceStatistics | null;
    referrers: ReferrerStatistics | null;
    countries: CountryStatistics | null;
    summary: AnalyticsSummary | null;
}

interface UseAnalyticsReturn {
    data: AnalyticsData;
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    clearCache: () => Promise<void>;
}

export const useAnalytics = (options: UseAnalyticsOptions = {}): UseAnalyticsReturn => {
    const {
        autoRefresh = false,
        refreshInterval = 300000, // 5 minutes
        period = '30days'
    } = options;

    const [data, setData] = useState<AnalyticsData>({
        dashboard: null,
        timeSeries: [],
        devices: null,
        referrers: null,
        countries: null,
        summary: null,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const [
                dashboard,
                timeSeries,
                devices,
                referrers,
                countries,
                summary
            ] = await Promise.all([
                analyticsService.getDashboardAnalytics(),
                analyticsService.getTimeSeriesData(period),
                analyticsService.getDeviceStatistics(),
                analyticsService.getReferrerStatistics(20),
                analyticsService.getCountryStatistics(10),
                analyticsService.getAnalyticsSummary()
            ]);

            setData({
                dashboard,
                timeSeries,
                devices,
                referrers,
                countries,
                summary
            });

        } catch (err) {
            console.error('Error fetching analytics data:', err);
            setError(err instanceof Error ? err.message : 'Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    }, [period]);

    const clearCache = useCallback(async () => {
        try {
            await analyticsService.clearCache();
            await fetchData(); // Refresh data after clearing cache
        } catch (err) {
            console.error('Error clearing cache:', err);
            setError(err instanceof Error ? err.message : 'Failed to clear cache');
        }
    }, [fetchData]);

    // Initial data fetch
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Auto refresh
    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(fetchData, refreshInterval);
        return () => clearInterval(interval);
    }, [autoRefresh, refreshInterval, fetchData]);

    return {
        data,
        loading,
        error,
        refresh: fetchData,
        clearCache
    };
};

// Hook for specific link analytics
interface UseLinkAnalyticsOptions {
    linkId: number;
    enabled?: boolean;
}

interface UseLinkAnalyticsReturn {
    data: LinkAnalytics | null;
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}

export const useLinkAnalytics = ({ linkId, enabled = true }: UseLinkAnalyticsOptions): UseLinkAnalyticsReturn => {
    const [data, setData] = useState<LinkAnalytics | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchLinkAnalytics = useCallback(async () => {
        if (!enabled || !linkId) return;

        try {
            setLoading(true);
            setError(null);
            const linkData = await analyticsService.getLinkAnalytics(linkId);
            setData(linkData);
        } catch (err) {
            console.error('Error fetching link analytics:', err);
            setError(err instanceof Error ? err.message : 'Failed to load link analytics');
        } finally {
            setLoading(false);
        }
    }, [linkId, enabled]);

    useEffect(() => {
        fetchLinkAnalytics();
    }, [fetchLinkAnalytics]);

    return {
        data,
        loading,
        error,
        refresh: fetchLinkAnalytics
    };
};

// Hook for filtered analytics with debouncing
interface UseFilteredAnalyticsOptions {
    filters: {
        startDate?: Date;
        endDate?: Date;
        device?: string;
        referrer?: string;
        period?: '7days' | '30days' | '90days' | '1year';
    };
    debounceMs?: number;
}

interface FilteredAnalyticsData {
    timeSeriesData: TimeSeriesData[];
    deviceData: DeviceStatistics;
    referrerData: ReferrerStatistics;
    summary: DashboardAnalytics;
}

interface UseFilteredAnalyticsReturn {
    data: FilteredAnalyticsData | null;
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}

export const useFilteredAnalytics = ({
    filters,
    debounceMs = 500
}: UseFilteredAnalyticsOptions): UseFilteredAnalyticsReturn => {
    const [data, setData] = useState<FilteredAnalyticsData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchFilteredData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const filteredData = await analyticsService.getFilteredAnalytics(filters);
            setData(filteredData);
        } catch (err) {
            console.error('Error fetching filtered analytics:', err);
            setError(err instanceof Error ? err.message : 'Failed to load filtered analytics');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    // Debounce the fetch function
    useEffect(() => {
        const timeoutId = setTimeout(fetchFilteredData, debounceMs);
        return () => clearTimeout(timeoutId);
    }, [fetchFilteredData, debounceMs]);

    return {
        data,
        loading,
        error,
        refresh: fetchFilteredData
    };
};

// Hook for analytics export
interface UseAnalyticsExportReturn {
    exportData: (options?: {
        format?: 'json' | 'csv';
        period?: '7days' | '30days' | '90days' | '1year';
        include?: ('time_series' | 'device_stats' | 'referrer_stats' | 'country_stats')[];
    }) => Promise<any>;
    loading: boolean;
    error: string | null;
}

export const useAnalyticsExport = (): UseAnalyticsExportReturn => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const exportData = useCallback(async (options: {
        format?: 'json' | 'csv';
        period?: '7days' | '30days' | '90days' | '1year';
        include?: ('time_series' | 'device_stats' | 'referrer_stats' | 'country_stats')[];
    } = {}): Promise<any> => {
        try {
            setLoading(true);
            setError(null);
            const result = await analyticsService.exportAnalytics(options);
            return result;
        } catch (err) {
            console.error('Error exporting analytics:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to export analytics';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        exportData,
        loading,
        error
    };
};
