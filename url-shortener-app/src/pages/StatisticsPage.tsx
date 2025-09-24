import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
    FunnelIcon,
    CalendarIcon,
    ChevronDownIcon,
    ArrowPathIcon,
    ArrowDownTrayIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";

import { Popover } from "@headlessui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import LineChartBox from "@/components/charts/LineChartBox";
import DevicePieChart from "@/components/charts/DevicePieChart";
import ReferrerBarChart from "@/components/charts/ReferrerBarChart";

import analyticsService from "@/api/analyticsService";
import type {
    DashboardAnalytics,
    TimeSeriesData,
    DeviceStatistics,
    ReferrerStatistics,
    CountryStatistics,
    AnalyticsSummary
} from "@/api/analyticsService";

// Chart data type adapters
interface ChartTimeSeriesData {
    date: string;
    clicks: number;
    fullDate: Date;
    year: number;
    month: number;
    originalDate: string;
}

interface ChartDeviceData {
    name: string;
    value: number;
}

interface ChartReferrerData {
    name: string;
    value: number;
}

// Enhanced filtering interface
interface FilterState {
    startDate: Date | null;
    endDate: Date | null;
    year: string;
    month: string;
    period: '7days' | '30days' | '90days' | '1year' | 'custom';
    device: string;
    referrer: string;
    country: string;
}

const Statistics: React.FC = () => {
    // Enhanced filter state
    const [filters, setFilters] = useState<FilterState>({
        startDate: new Date("2025-06-01"),
        endDate: new Date("2025-07-31"),
        year: "2025",
        month: "all",
        period: '30days',
        device: "All",
        referrer: "All",
        country: "All"
    });

    // State for analytics data
    const [data, setData] = useState({
        dashboard: null as DashboardAnalytics | null,
        timeSeries: [] as TimeSeriesData[],
        devices: null as DeviceStatistics | null,
        referrers: null as ReferrerStatistics | null,
        countries: null as CountryStatistics | null,
        summary: null as AnalyticsSummary | null,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [exportLoading, setExportLoading] = useState(false);

    // Generate year options (current year ± 2 years)
    const yearOptions = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = currentYear - 2; i <= currentYear + 1; i++) {
            years.push(i.toString());
        }
        return years;
    }, []);

    // Month options
    const monthOptions = [
        { value: "all", label: "All Months" },
        { value: "01", label: "January" },
        { value: "02", label: "February" },
        { value: "03", label: "March" },
        { value: "04", label: "April" },
        { value: "05", label: "May" },
        { value: "06", label: "June" },
        { value: "07", label: "July" },
        { value: "08", label: "August" },
        { value: "09", label: "September" },
        { value: "10", label: "October" },
        { value: "11", label: "November" },
        { value: "12", label: "December" }
    ];

    // Quick filter presets
    const quickFilters = [
        {
            label: "Today",
            getValue: () => {
                const today = new Date();
                return {
                    startDate: today,
                    endDate: today,
                    period: 'custom' as const
                };
            }
        },
        {
            label: "Last 7 days",
            getValue: () => ({
                startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                endDate: new Date(),
                period: '7days' as const
            })
        },
        {
            label: "Last 30 days",
            getValue: () => ({
                startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                endDate: new Date(),
                period: '30days' as const
            })
        },
        {
            label: "This month",
            getValue: () => {
                const now = new Date();
                const start = new Date(now.getFullYear(), now.getMonth(), 1);
                const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                return {
                    startDate: start,
                    endDate: end,
                    period: 'custom' as const
                };
            }
        },
        {
            label: "Last month",
            getValue: () => {
                const now = new Date();
                const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const end = new Date(now.getFullYear(), now.getMonth(), 0);
                return {
                    startDate: start,
                    endDate: end,
                    period: 'custom' as const
                };
            }
        },
        {
            label: "This year",
            getValue: () => ({
                startDate: new Date(new Date().getFullYear(), 0, 1),
                endDate: new Date(new Date().getFullYear(), 11, 31),
                period: '1year' as const
            })
        }
    ];

    // Fetch analytics data with proper period handling
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Convert custom period to API-compatible period
            const apiPeriod = filters.period === 'custom' ? '30days' : filters.period;

            const [
                dashboard,
                timeSeries,
                devices,
                referrers,
                countries,
                summary
            ] = await Promise.all([
                analyticsService.getDashboardAnalytics(),
                analyticsService.getTimeSeriesData(apiPeriod),
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
            console.error('Error loading analytics data:', err);
            setError(err instanceof Error ? err.message : 'Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    }, [filters.period]);

    // Clear cache and refresh
    const clearCache = useCallback(async () => {
        try {
            await analyticsService.clearCache();
            await fetchData();
        } catch (err) {
            console.error('Error clearing cache:', err);
            setError(err instanceof Error ? err.message : 'Failed to clear cache');
        }
    }, [fetchData]);

    // Export data with proper period handling
    const handleExport = useCallback(async (format: 'json' | 'csv') => {
        try {
            setExportLoading(true);

            // Convert custom period to API-compatible period for export
            const exportPeriod = filters.period === 'custom' ? '30days' : filters.period;

            await analyticsService.exportAnalytics({
                format,
                period: exportPeriod,
                include: ['time_series', 'device_stats', 'referrer_stats', 'country_stats']
            });
        } catch (err) {
            console.error('Export failed:', err);
            setError('Export failed. Please try again.');
        } finally {
            setExportLoading(false);
        }
    }, [filters.period]);

    // Update filters
    const updateFilter = useCallback(<K extends keyof FilterState>(
        key: K,
        value: FilterState[K]
    ) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    // Apply quick filter
    const applyQuickFilter = useCallback((quickFilter: typeof quickFilters[0]) => {
        const values = quickFilter.getValue();
        setFilters(prev => ({ ...prev, ...values }));
    }, []);

    // Reset all filters
    const resetFilters = useCallback(() => {
        setFilters({
            startDate: new Date("2025-06-01"),
            endDate: new Date("2025-07-31"),
            year: "2025",
            month: "all",
            period: '30days',
            device: "All",
            referrer: "All",
            country: "All"
        });
    }, []);

    // Load data on component mount and when period changes
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Auto-refresh every 5 minutes
    useEffect(() => {
        const interval = setInterval(fetchData, 300000); // 5 minutes
        return () => clearInterval(interval);
    }, [fetchData]);

    // Enhanced data transformation with full date objects
    const chartData = useMemo(() => {
        if (!data.timeSeries || data.timeSeries.length === 0) {
            return { timeSeriesData: [], deviceData: [], referrerData: [] };
        }

        console.log("🔄 Transforming data:", data.timeSeries);

        const timeSeriesData: ChartTimeSeriesData[] = data.timeSeries.map(item => {
            const fullDate = new Date(item.date);

            return {
                date: fullDate.toLocaleDateString('en-US', {
                    month: '2-digit',
                    day: '2-digit'
                }),
                fullDate: fullDate,
                year: fullDate.getFullYear(),
                month: fullDate.getMonth() + 1,
                clicks: item.count,
                originalDate: item.date
            };
        });

        const deviceData: ChartDeviceData[] = data.devices?.breakdown?.map(item => ({
            name: item.device_type,
            value: item.count
        })) || [];

        const referrerData: ChartReferrerData[] = data.referrers?.breakdown?.map(item => ({
            name: item.referrer === 'Direct' ? 'Direct' : item.referrer,
            value: item.count
        })) || [];

        console.log("✅ Transformed data:", { timeSeriesData, deviceData, referrerData });

        return { timeSeriesData, deviceData, referrerData };
    }, [data]);

    // Enhanced filtering logic
    const filteredData = useMemo(() => {
        let filteredTimeSeries = chartData.timeSeriesData;
        let filteredDevices = chartData.deviceData;
        let filteredReferrers = chartData.referrerData;

        console.log("🎯 Applying enhanced filters:", filters);
        console.log("🎯 Original data count:", filteredTimeSeries.length);

        // Filter by year
        if (filters.year !== "all") {
            filteredTimeSeries = filteredTimeSeries.filter(item =>
                item.year === parseInt(filters.year)
            );
            console.log("🎯 After year filter:", filteredTimeSeries.length);
        }

        // Filter by month
        if (filters.month !== "all") {
            filteredTimeSeries = filteredTimeSeries.filter(item =>
                item.month === parseInt(filters.month)
            );
            console.log("🎯 After month filter:", filteredTimeSeries.length);
        }

        // Filter by date range (if custom period)
        if (filters.period === 'custom' && filters.startDate && filters.endDate) {
            filteredTimeSeries = filteredTimeSeries.filter(item => {
                const itemDate = item.fullDate;
                const startDate = new Date(filters.startDate!);
                const endDate = new Date(filters.endDate!);

                // Set time to start/end of day for accurate comparison
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(23, 59, 59, 999);

                return itemDate >= startDate && itemDate <= endDate;
            });
            console.log("🎯 After date range filter:", filteredTimeSeries.length);
        }

        // Filter by device
        if (filters.device !== "All") {
            filteredDevices = chartData.deviceData.filter(item =>
                item.name === filters.device
            );
        }

        // Filter by referrer
        if (filters.referrer !== "All") {
            filteredReferrers = chartData.referrerData.filter(item =>
                item.name === filters.referrer
            );
        }

        console.log("🎯 Final filtered count:", filteredTimeSeries.length);

        return {
            timeSeries: filteredTimeSeries,
            devices: filteredDevices,
            referrers: filteredReferrers
        };
    }, [chartData, filters]);

    // Get top performing location
    const topLocation = useMemo(() => {
        if (!data.countries || data.countries.breakdown.length === 0) {
            return "No data available";
        }

        return data.countries.breakdown
            .slice(0, 2)
            .map(country => country.country)
            .join(' & ');
    }, [data.countries]);

    // Count active filters
    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (filters.year !== "2025") count++;
        if (filters.month !== "all") count++;
        if (filters.device !== "All") count++;
        if (filters.referrer !== "All") count++;
        if (filters.country !== "All") count++;
        if (filters.period === 'custom') count++;
        return count;
    }, [filters]);

    // Loading state
    if (loading && !data.dashboard) {
        return (
            <div className="p-6 max-w-7xl mx-auto w-full">
                <div className="flex items-center justify-center h-64">
                    <ArrowPathIcon className="w-8 h-8 animate-spin text-blue-500" />
                    <span className="ml-2 text-gray-600">Loading analytics...</span>
                </div>
            </div>
        );
    }

    // Error state
    if (error && !data.dashboard) {
        return (
            <div className="p-6 max-w-7xl mx-auto w-full">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex">
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">
                                Error loading analytics
                            </h3>
                            <p className="mt-2 text-sm text-red-700">{error}</p>
                            <div className="mt-3 flex gap-2">
                                <button
                                    onClick={fetchData}
                                    className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm"
                                >
                                    Try again
                                </button>
                                <button
                                    onClick={clearCache}
                                    className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm"
                                >
                                    Clear cache & retry
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto w-full">
            {/* Header with controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                    URL Statistics
                </h2>

                <div className="flex items-center gap-3">
                    {/* Export buttons */}
                    {/* <div className="flex gap-2">
                        <button
                            onClick={() => handleExport('json')}
                            disabled={exportLoading}
                            className="flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                        >
                            <ArrowDownTrayIcon className="w-4 h-4" />
                            JSON
                        </button>
                        <button
                            onClick={() => handleExport('csv')}
                            disabled={exportLoading}
                            className="flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                        >
                            <ArrowDownTrayIcon className="w-4 h-4" />
                            CSV
                        </button>
                    </div> */}

                    {/* Period selector */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Period:</span>
                        <select
                            value={filters.period}
                            onChange={(e) => updateFilter('period', e.target.value as any)}
                            className="border border-gray-300 rounded px-3 py-1 text-sm"
                        >
                            <option value="7days">7 days</option>
                            <option value="30days">30 days</option>
                            <option value="90days">90 days</option>
                            <option value="1year">1 year</option>
                            <option value="custom">Custom range</option>
                        </select>
                    </div>

                    {/* Refresh button */}
                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                        title="Refresh data"
                    >
                        <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Quick filters */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-sm text-gray-600 mr-2">Quick filters:</span>
                {quickFilters.map((filter) => (
                    <button
                        key={filter.label}
                        onClick={() => applyQuickFilter(filter)}
                        className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            {/* Error banner (for non-critical errors) */}
            {error && data.dashboard && (
                <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center">
                        <span className="text-sm text-yellow-800">{error}</span>
                        <button
                            onClick={() => setError(null)}
                            className="ml-auto text-yellow-500 hover:text-yellow-700"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            {/* Stats summary cards */}
            {data.summary && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg border">
                        <div className="text-2xl font-bold text-gray-900">
                            {data.dashboard?.total_clicks_scans?.toLocaleString() || 0}
                        </div>
                        <div className="text-sm text-gray-600">Total Clicks + Scans</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                        <div className="text-2xl font-bold text-gray-900">
                            {data.summary.current_month_total.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">This Month</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                        <div className={`text-2xl font-bold ${
                            data.summary.growth_direction === 'up' ? 'text-green-600' :
                            data.summary.growth_direction === 'down' ? 'text-red-600' :
                            'text-gray-600'
                        }`}>
                            {data.summary.growth_rate > 0 ? '+' : ''}{data.summary.growth_rate}%
                        </div>
                        <div className="text-sm text-gray-600">Growth Rate</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                        <div className="text-2xl font-bold text-gray-900">
                            {data.devices?.breakdown.length || 0}
                        </div>
                        <div className="text-sm text-gray-600">Device Types</div>
                    </div>
                </div>
            )}

            {/* Enhanced filters row */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
                {/* Date range picker (for custom period) */}
                {filters.period === 'custom' && (
                    <div className="flex items-center border border-gray-300 rounded-sm px-3 py-2 text-sm text-gray-600 bg-white">
                        <CalendarIcon className="w-4 h-4 text-gray-500 mr-2" />
                        <DatePicker
                            selected={filters.startDate}
                            onChange={(date) => updateFilter('startDate', date)}
                            selectsStart
                            startDate={filters.startDate}
                            endDate={filters.endDate}
                            dateFormat="MM/dd/yyyy"
                            className="outline-none bg-transparent w-[100px]"
                            placeholderText="Start date"
                        />
                        <span className="mx-1 text-gray-400">→</span>
                        <DatePicker
                            selected={filters.endDate}
                            onChange={(date) => updateFilter('endDate', date)}
                            selectsEnd
                            startDate={filters.startDate}
                            endDate={filters.endDate}
                            minDate={filters.startDate || undefined}
                            dateFormat="MM/dd/yyyy"
                            className="outline-none bg-transparent w-[100px]"
                            placeholderText="End date"
                        />
                    </div>
                )}

                {/* Year filter */}
                <div className="flex items-center border border-gray-300 rounded-sm px-3 py-2 text-sm bg-white">
                    <span className="text-gray-600 mr-2">Year:</span>
                    <select
                        value={filters.year}
                        onChange={(e) => updateFilter('year', e.target.value)}
                        className="outline-none bg-transparent"
                    >
                        <option value="all">All Years</option>
                        {yearOptions.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>

                {/* Month filter */}
                <div className="flex items-center border border-gray-300 rounded-sm px-3 py-2 text-sm bg-white">
                    <span className="text-gray-600 mr-2">Month:</span>
                    <select
                        value={filters.month}
                        onChange={(e) => updateFilter('month', e.target.value)}
                        className="outline-none bg-transparent"
                    >
                        {monthOptions.map(month => (
                            <option key={month.value} value={month.value}>
                                {month.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Advanced filters button */}
                <Popover className="relative">
                    <Popover.Button className="flex items-center gap-2 px-4 py-[6px] bg-white border border-gray-300 rounded-sm shadow-sm hover:bg-gray-50 transition text-sm text-gray-600 font-medium">
                        <FunnelIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">More filters</span>
                        {activeFiltersCount > 0 && (
                            <span className="ml-1 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                                {activeFiltersCount}
                            </span>
                        )}
                    </Popover.Button>

                    <Popover.Panel className="absolute z-10 mt-2 right-0 w-[300px] bg-white border border-gray-200 rounded-xl shadow-xl p-4 text-sm space-y-4">
                        {/* Device filter */}
                        <div className="space-y-1">
                            <label className="text-gray-600 font-medium">Device</label>
                            <div className="relative">
                                <select
                                    value={filters.device}
                                    onChange={(e) => updateFilter('device', e.target.value)}
                                    className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                >
                                    <option value="All">All Devices</option>
                                    {chartData.deviceData.map(device => (
                                        <option key={device.name} value={device.name}>
                                            {device.name} ({device.value})
                                        </option>
                                    ))}
                                </select>
                                <ChevronDownIcon className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                            </div>
                        </div>

                        {/* Referrer filter */}
                        <div className="space-y-1">
                            <label className="text-gray-600 font-medium">Traffic Source</label>
                            <div className="relative">
                                <select
                                    value={filters.referrer}
                                    onChange={(e) => updateFilter('referrer', e.target.value)}
                                    className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                >
                                    <option value="All">All Sources</option>
                                    {chartData.referrerData.map(referrer => (
                                        <option key={referrer.name} value={referrer.name}>
                                            {referrer.name} ({referrer.value})
                                        </option>
                                    ))}
                                </select>
                                <ChevronDownIcon className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                            </div>
                        </div>

                        {/* Country filter */}
                        {data.countries && (
                            <div className="space-y-1">
                                <label className="text-gray-600 font-medium">Country</label>
                                <div className="relative">
                                    <select
                                        value={filters.country}
                                        onChange={(e) => updateFilter('country', e.target.value)}
                                        className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                    >
                                        <option value="All">All Countries</option>
                                        {data.countries.breakdown.map(country => (
                                            <option key={country.country} value={country.country}>
                                                {country.country} ({country.count})
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDownIcon className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                                </div>
                            </div>
                        )}

                        {/* Clear filters button */}
                        <div className="flex justify-between pt-3 border-t">
                            <button
                                onClick={resetFilters}
                                className="text-sm text-blue-600 font-medium hover:underline"
                            >
                                Clear all filters
                            </button>
                            <span className="text-xs text-gray-500">
                                {filteredData.timeSeries.length} data points
                            </span>
                        </div>
                    </Popover.Panel>
                </Popover>

                {/* Clear filters button (when filters are active) */}
                {activeFiltersCount > 0 && (
                    <button
                        onClick={resetFilters}
                        className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50"
                    >
                        <XMarkIcon className="w-4 h-4" />
                        Clear filters ({activeFiltersCount})
                    </button>
                )}
            </div>

            {/* Active filters display */}
            {activeFiltersCount > 0 && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-blue-800">Active filters:</span>
                        {filters.year !== "2025" && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                Year: {filters.year}
                            </span>
                        )}
                        {filters.month !== "all" && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                Month: {monthOptions.find(m => m.value === filters.month)?.label}
                            </span>
                        )}
                        {filters.device !== "All" && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                Device: {filters.device}
                            </span>
                        )}
                        {filters.referrer !== "All" && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                Source: {filters.referrer}
                            </span>
                        )}
                        {filters.country !== "All" && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                Country: {filters.country}
                            </span>
                        )}
                        {filters.period === 'custom' && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                Custom Range
                            </span>
                        )}
                        <span className="text-xs text-blue-600">
                            ({filteredData.timeSeries.length} results)
                        </span>
                    </div>
                </div>
            )}

            <div className="border-b border-gray-300 mb-6" />

            {/* Layout chia 2 cột */}
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex flex-col gap-6 w-full lg:w-1/2">
                    <StatBox
                        title="Top performing date by clicks + scans"
                        subtitle={data.dashboard?.top_performing_date?.formatted_date || "No data"}
                        value={data.dashboard?.top_performing_date ?
                            `${data.dashboard.top_performing_date.count} Clicks + scans` :
                            "No data"
                        }
                        note={`Total: ${data.dashboard?.total_clicks_scans || 0} clicks`}
                    />
                    <LineChartBox data={filteredData.timeSeries} />
                    <StatBox
                        title="Top performing location by clicks + scans"
                        subtitle={topLocation}
                    />
                </div>
                <div className="flex flex-col gap-6 w-full lg:w-1/2">
                    <DevicePieChart
                        data={filteredData.devices}
                        total={data.dashboard?.total_clicks_scans || 0}
                    />
                    <ReferrerBarChart data={filteredData.referrers} />
                </div>
            </div>
        </div>
    );
};

const StatBox: React.FC<{
    title: string;
    subtitle: string;
    value?: string;
    note?: string;
}> = ({ title, subtitle, value, note }) => (
    <div className="bg-white p-6 rounded-xl shadow border border-gray-200 w-full text-center">
        <div className="text-sm font-semibold text-gray-600 mb-1">{title}</div>
        <div className="text-xl font-bold text-gray-800 mb-1">{subtitle}</div>
        {value && (
            <div className="text-blue-600 font-medium text-sm mb-1">
                {value}
            </div>
        )}
        {note && <div className="text-xs text-gray-400">{note}</div>}
    </div>
);

export default Statistics;
