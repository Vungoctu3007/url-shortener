// services/analyticsService.tsx
import api from "@/axios/axiosInstance";

export interface TimeSeriesData {
    date: string;
    count: number;
}

export interface DeviceData {
    device_type: string;
    count: number;
    percentage?: number;
}

export interface ReferrerData {
    referrer: string;
    count: number;
    percentage?: number;
}

export interface CountryData {
    country: string;
    count: number;
    percentage?: number;
}

export interface TopPerformingDate {
    date: string;
    count: number;
    formatted_date: string;
}

export interface DashboardAnalytics {
    total_clicks_scans: number;
    top_performing_date: TopPerformingDate | null;
    device_breakdown: DeviceData[];
    referrer_breakdown: ReferrerData[];
    time_series: TimeSeriesData[];
    cache_status?: string;
}

export interface DeviceStatistics {
    total: number;
    breakdown: DeviceData[];
}

export interface ReferrerStatistics {
    total: number;
    breakdown: ReferrerData[];
}

export interface CountryStatistics {
    total: number;
    breakdown: CountryData[];
}

export interface AnalyticsSummary {
    current_month_total: number;
    previous_month_total: number;
    growth_rate: number;
    growth_direction: 'up' | 'down' | 'stable';
}

export interface LinkAnalytics {
    total_clicks: number;
    device_stats: DeviceData[];
    country_stats: CountryData[];
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message: string;
    cache_info?: {
        timestamp: string;
        cache_ttl?: string;
        fresh_request?: boolean;
        cache_status?: string;
    };
}

class AnalyticsService {
    /**
     * Get dashboard analytics overview
     */
    async getDashboardAnalytics(options: { fresh?: boolean } = {}): Promise<DashboardAnalytics> {
        try {
            const endpoint = options.fresh ? '/analytics/dashboard/fresh' : '/analytics/dashboard';
            const response = await api.get<ApiResponse<DashboardAnalytics>>(endpoint);
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to fetch dashboard analytics');
            }
            return response.data.data;
        } catch (error) {
            console.error('Error fetching dashboard analytics:', error);
            throw error;
        }
    }

    /**
     * Get time series data
     */
    async getTimeSeriesData(
        period: '7days' | '30days' | '90days' | '1year' = '30days',
        options: { fresh?: boolean } = {}
    ): Promise<TimeSeriesData[]> {
        try {
            const params = new URLSearchParams({ period });
            if (options.fresh) {
                params.append('fresh', 'true');
            }

            const response = await api.get<ApiResponse<{ period: string; time_series: TimeSeriesData[] }>>(
                `/analytics/time-series?${params}`
            );
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to fetch time series data');
            }
            return response.data.data.time_series;
        } catch (error) {
            console.error('Error fetching time series data:', error);
            throw error;
        }
    }

    /**
     * Get device statistics
     */
    async getDeviceStatistics(options: { fresh?: boolean } = {}): Promise<DeviceStatistics> {
        try {
            const params = options.fresh ? '?fresh=true' : '';
            const response = await api.get<ApiResponse<DeviceStatistics>>(`/analytics/devices${params}`);
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to fetch device statistics');
            }
            return response.data.data;
        } catch (error) {
            console.error('Error fetching device statistics:', error);
            throw error;
        }
    }

    /**
     * Get referrer statistics
     */
    async getReferrerStatistics(
        limit: number = 10,
        options: { fresh?: boolean } = {}
    ): Promise<ReferrerStatistics> {
        try {
            const params = new URLSearchParams({ limit: limit.toString() });
            if (options.fresh) {
                params.append('fresh', 'true');
            }

            const response = await api.get<ApiResponse<ReferrerStatistics>>(
                `/analytics/referrers?${params}`
            );
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to fetch referrer statistics');
            }
            return response.data.data;
        } catch (error) {
            console.error('Error fetching referrer statistics:', error);
            throw error;
        }
    }

    /**
     * Get country statistics
     */
    async getCountryStatistics(
        limit: number = 10,
        options: { fresh?: boolean } = {}
    ): Promise<CountryStatistics> {
        try {
            const params = new URLSearchParams({ limit: limit.toString() });
            if (options.fresh) {
                params.append('fresh', 'true');
            }

            const response = await api.get<ApiResponse<CountryStatistics>>(
                `/analytics/countries?${params}`
            );
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to fetch country statistics');
            }
            return response.data.data;
        } catch (error) {
            console.error('Error fetching country statistics:', error);
            throw error;
        }
    }

    /**
     * Get analytics summary with growth metrics
     */
    async getAnalyticsSummary(options: { fresh?: boolean } = {}): Promise<AnalyticsSummary> {
        try {
            const params = options.fresh ? '?fresh=true' : '';
            const response = await api.get<ApiResponse<AnalyticsSummary>>(`/analytics/summary${params}`);
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to fetch analytics summary');
            }
            return response.data.data;
        } catch (error) {
            console.error('Error fetching analytics summary:', error);
            throw error;
        }
    }

    /**
     * Get analytics for specific link
     */
    async getLinkAnalytics(linkId: number, options: { fresh?: boolean } = {}): Promise<LinkAnalytics> {
        try {
            const params = options.fresh ? '?fresh=true' : '';
            const response = await api.get<ApiResponse<LinkAnalytics>>(`/analytics/links/${linkId}${params}`);
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to fetch link analytics');
            }
            return response.data.data;
        } catch (error) {
            console.error('Error fetching link analytics:', error);
            throw error;
        }
    }

    /**
     * Get all analytics data with fresh option
     */
    async getAllAnalytics(options: {
        period?: '7days' | '30days' | '90days' | '1year';
        fresh?: boolean;
    } = {}): Promise<{
        dashboard: DashboardAnalytics;
        timeSeries: TimeSeriesData[];
        devices: DeviceStatistics;
        referrers: ReferrerStatistics;
        countries: CountryStatistics;
        summary: AnalyticsSummary;
    }> {
        try {
            const period = options.period || '30days';
            const fresh = options.fresh || false;

            const [
                dashboard,
                timeSeries,
                devices,
                referrers,
                countries,
                summary
            ] = await Promise.all([
                this.getDashboardAnalytics({ fresh }),
                this.getTimeSeriesData(period, { fresh }),
                this.getDeviceStatistics({ fresh }),
                this.getReferrerStatistics(20, { fresh }),
                this.getCountryStatistics(10, { fresh }),
                this.getAnalyticsSummary({ fresh })
            ]);

            return {
                dashboard,
                timeSeries,
                devices,
                referrers,
                countries,
                summary
            };
        } catch (error) {
            console.error('Error fetching all analytics:', error);
            throw error;
        }
    }

    /**
     * Export analytics data
     */
    async exportAnalytics(options: {
        format?: 'json' | 'csv';
        period?: '7days' | '30days' | '90days' | '1year';
        include?: ('time_series' | 'device_stats' | 'referrer_stats' | 'country_stats')[];
        fresh?: boolean;
    } = {}) {
        try {
            const params = new URLSearchParams();

            if (options.format) params.append('format', options.format);
            if (options.period) params.append('period', options.period);
            if (options.fresh) params.append('fresh', 'true');
            if (options.include) {
                options.include.forEach(item => params.append('include[]', item));
            }

            const response = await api.get(`/analytics/export?${params.toString()}`, {
                responseType: options.format === 'csv' ? 'blob' : 'json'
            });

            if (options.format === 'csv') {
                // Handle CSV download
                const blob = new Blob([response.data], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `analytics_export_${options.period || '30days'}_${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                return { success: true, message: 'CSV downloaded successfully' };
            }

            return response.data;
        } catch (error) {
            console.error('Error exporting analytics:', error);
            throw error;
        }
    }

    /**
     * Clear analytics cache
     */
    async clearCache(): Promise<void> {
        try {
            const response = await api.delete<ApiResponse<null>>('/analytics/cache');
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to clear cache');
            }
        } catch (error) {
            console.error('Error clearing cache:', error);
            throw error;
        }
    }

    /**
     * Get filtered data based on date range, device, and referrer
     */
    async getFilteredAnalytics(filters: {
        startDate?: Date;
        endDate?: Date;
        device?: string;
        referrer?: string;
        period?: '7days' | '30days' | '90days' | '1year';
        fresh?: boolean;
    }): Promise<{
        timeSeriesData: TimeSeriesData[];
        deviceData: DeviceStatistics;
        referrerData: ReferrerStatistics;
        summary: DashboardAnalytics;
    }> {
        try {
            // For now, we'll use the existing endpoints and filter on frontend
            // In a real implementation, you might want to add filter parameters to your backend APIs

            const fresh = filters.fresh || false;

            const [timeSeriesData, deviceData, referrerData, summary] = await Promise.all([
                this.getTimeSeriesData(filters.period, { fresh }),
                this.getDeviceStatistics({ fresh }),
                this.getReferrerStatistics(20, { fresh }), // Get more data for filtering
                this.getDashboardAnalytics({ fresh })
            ]);

            // Apply filters on frontend (you can move this logic to backend for better performance)
            let filteredTimeSeriesData = timeSeriesData;
            let filteredDeviceData = deviceData;
            let filteredReferrerData = referrerData;

            // Filter by date range
            if (filters.startDate && filters.endDate) {
                const startDate = filters.startDate.toISOString().split('T')[0];
                const endDate = filters.endDate.toISOString().split('T')[0];

                filteredTimeSeriesData = timeSeriesData.filter(item => {
                    const itemDate = new Date(item.date).toISOString().split('T')[0];
                    return itemDate >= startDate && itemDate <= endDate;
                });
            }

            // Filter by device
            if (filters.device && filters.device !== 'All') {
                filteredDeviceData = {
                    ...deviceData,
                    breakdown: deviceData.breakdown.filter(item => item.device_type === filters.device)
                };
            }

            // Filter by referrer
            if (filters.referrer && filters.referrer !== 'All') {
                filteredReferrerData = {
                    ...referrerData,
                    breakdown: referrerData.breakdown.filter(item => item.referrer === filters.referrer)
                };
            }

            return {
                timeSeriesData: filteredTimeSeriesData,
                deviceData: filteredDeviceData,
                referrerData: filteredReferrerData,
                summary
            };
        } catch (error) {
            console.error('Error fetching filtered analytics:', error);
            throw error;
        }
    }

    /**
     * Auto-refresh analytics data
     */
    startAutoRefresh(callback: () => void, intervalMs: number = 60000): () => void {
        const interval = setInterval(callback, intervalMs);
        return () => clearInterval(interval);
    }
}

// Create and export a singleton instance
const analyticsService = new AnalyticsService();
export default analyticsService;
