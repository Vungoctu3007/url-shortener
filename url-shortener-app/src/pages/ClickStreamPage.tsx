import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { Clock, Globe, Monitor, Smartphone, ExternalLink, RefreshCw, AlertCircle, Tablet } from "lucide-react";
import api from "@/axios/axiosInstance";
import echo from "@/pusher/echo";
import { useAuth } from "@/contexts/AuthProvider";

interface ClickData {
    id: number;
    time: string;
    country: string;
    browser: string;
    device: string;
    referrer: string;
    formattedTime: string;
    link?: {
        id: number;
        short_code: string;
        title: string;
    };
}

interface CountryFlag {
    [key: string]: string;
}

const COUNTRY_FLAGS: CountryFlag = {
    'Vietnam': '🇻🇳',
    'USA': '🇺🇸',
    'United States': '🇺🇸',
    'Japan': '🇯🇵',
    'Germany': '🇩🇪',
    'UK': '🇬🇧',
    'United Kingdom': '🇬🇧',
    'France': '🇫🇷',
    'Canada': '🇨🇦',
    'Australia': '🇦🇺',
    'China': '🇨🇳',
    'India': '🇮🇳',
    'Brazil': '🇧🇷',
    'Russia': '🇷🇺',
    'South Korea': '🇰🇷',
    'Unknown': '🌍',
    'Local/Private': '🏠'
};

const DEVICE_ICONS = {
    'Mobile': Smartphone,
    'Desktop': Monitor,
    'Tablet': Tablet,
    'Unknown': Monitor
};

const ClickStream: React.FC = () => {
    const [clicks, setClicks] = useState<ClickData[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isRealTime, setIsRealTime] = useState(true);

    const bottomRef = useRef<HTMLDivElement | null>(null);
    const observer = useRef<IntersectionObserver | null>(null);
    const { user } = useAuth();

    // Memoized formatters
    const formatTime = useCallback((timeString: string): string => {
        const date = new Date(timeString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMinutes = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }, []);

    const parseBrowser = useCallback((ua: string): string => {
        if (!ua) return "Unknown";
        if (ua.includes("Chrome") && !ua.includes("Edge")) return "Chrome";
        if (ua.includes("Firefox")) return "Firefox";
        if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
        if (ua.includes("Edge")) return "Edge";
        if (ua.includes("Opera")) return "Opera";
        return "Unknown";
    }, []);

    const parseDevice = useCallback((ua: string): string => {
        if (!ua) return "Unknown";
        if (/Mobi|Android|iPhone/i.test(ua)) return "Mobile";
        if (/Tablet|iPad/i.test(ua)) return "Tablet";
        return "Desktop";
    }, []);

    const formatReferrer = useCallback((referrer: string): string => {
        if (!referrer || referrer === 'Direct') return 'Direct';
        try {
            const url = new URL(referrer);
            return url.hostname.replace('www.', '');
        } catch {
            return referrer;
        }
    }, []);

    const formatRedirects = useCallback((items: any[]): ClickData[] => {
        return items.map((item) => {
            console.log('Processing item:', item);
            console.log('Item link:', item.link);
            console.log('Item link_id:', item.link_id);
            
            return {
                id: item.id,
                time: item.created_at,
                slug: item.slug,
                country: item.country || "Unknown",
                browser: parseBrowser(item.user_agent),
                device: parseDevice(item.user_agent),
                referrer: formatReferrer(item.referrer),
                formattedTime: formatTime(item.created_at),
                link: item.link ? {
                    id: item.link.id,
                    short_code: item.link.slug,
                    title: item.link.title || 'Untitled'
                } : {
                    id: item.link_id,
                    short_code: item.link_slug || item.slug,
                    title: item.link_title || 'Untitled'
                }
            };
        });
    }, [formatTime, parseBrowser, parseDevice, formatReferrer]);

    // Intersection Observer setup
    const setupObserver = useCallback(() => {
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    fetchMore();
                }
            },
            { threshold: 0.1 }
        );

        if (bottomRef.current) {
            observer.current.observe(bottomRef.current);
        }
    }, [hasMore, loading]);

    const fetchInitial = useCallback(async () => {
        if (loading) return;

        setLoading(true);
        setError(null);

        try {
            const res = await api.get("/redirects", {
                params: {
                    limit: 20,
                    user_id: user?.id
                }
            });

            if (res.data.status || res.data.success) {
                console.log('API Response Data:', res.data.data);
                console.log('First item structure:', res.data.data[0]);
                const data = formatRedirects(res.data.data);
                setClicks(data);
                setHasMore(data.length === 20);
            } else {
                throw new Error(res.data.message || 'Failed to fetch data');
            }
        } catch (err: any) {
            console.error("Failed to fetch initial click data", err);
            setError(err?.response?.data?.message || "Failed to load click stream data. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [user?.id, formatRedirects, loading]);

    const fetchMore = useCallback(async () => {
        if (clicks.length === 0 || loading) return;

        setLoading(true);
        setError(null);

        try {
            const lastId = clicks[clicks.length - 1].id;
            const res = await api.get("/redirects", {
                params: {
                    limit: 20,
                    cursor: lastId,
                    user_id: user?.id
                },
            });

            if (res.data.status || res.data.success) {
                const data = formatRedirects(res.data.data);
                setClicks((prev) => [...prev, ...data]);
                setHasMore(data.length === 20);
            } else {
                throw new Error(res.data.message || 'Failed to fetch more data');
            }
        } catch (err: any) {
            console.error("Failed to load more data:", err);
            setError("Failed to load more data.");
        } finally {
            setLoading(false);
        }
    }, [clicks, user?.id, formatRedirects, loading]);

    const handleRefresh = useCallback(() => {
        setClicks([]);
        setHasMore(true);
        fetchInitial();
    }, [fetchInitial]);

    // Effects
    useEffect(() => {
        if (user?.id) {
            fetchInitial();
        }
        return () => {
            if (observer.current) observer.current.disconnect();
        };
    }, [user?.id]);

    useEffect(() => {
        setupObserver();
    }, [setupObserver]);

    useEffect(() => {
        if (!isRealTime || !user?.id) return;

        const channel = echo.private(`user-clicks.${user.id}`);
        const listener = (event: any) => {
            const clickData = event.click;

            const newClick: ClickData = {
                id: clickData.id,
                time: clickData.timestamp, 
                country: clickData.country || "Unknown",
                browser: clickData.browser || "Unknown",
                device: clickData.device || "Desktop",
                referrer: clickData.referrer || "Direct",
                formattedTime: formatTime(clickData.timestamp),
                link: {
                    id: clickData.link_id,
                    short_code: clickData.link_slug,
                    title: clickData.link_title || 'Untitled'
                }
            };
            setClicks((prev) => [newClick, ...prev.slice(0, 199)]);
        };

        // Listen to the event
        channel.listen('.new-click', listener);

        // Cleanup
        return () => {
            channel.stopListening('.new-click');
            echo.leave(`user-clicks.${user.id}`);
        };
    }, [isRealTime, user?.id, formatTime]);

    const memoizedClicks = useMemo(() => clicks, [clicks]);

    if (!user?.id) {
        return (
            <div className="w-full max-w-7xl mx-auto p-4 sm:p-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                        <p className="text-yellow-800">Please login to view your click stream.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-lg border border-gray-100">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                        <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                            Click Stream
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Real-time visitor activity across all your links
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isRealTime ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                        <span className="text-sm text-gray-600">
                            {isRealTime ? 'Live' : 'Paused'}
                        </span>
                    </div>

                    <button
                        onClick={() => setIsRealTime(!isRealTime)}
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        {isRealTime ? 'Pause' : 'Resume'}
                    </button>

                    <button
                        onClick={handleRefresh}
                        disabled={loading}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Error state */}
            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-red-700 text-sm">{error}</p>
                </div>
            )}

            {/* Table Container */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <div className="max-h-[500px] overflow-y-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-white border-b border-gray-200 sticky top-0 z-10">
                                <tr>
                                    <th className="text-left p-4 font-semibold text-gray-700 min-w-[120px]">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            Time
                                        </div>
                                    </th>
                                    <th className="text-left p-4 font-semibold text-gray-700 min-w-[100px]">
                                        <div className="flex items-center gap-2">
                                            <Globe className="w-4 h-4" />
                                            Country
                                        </div>
                                    </th>
                                    <th className="text-left p-4 font-semibold text-gray-700 min-w-[80px]">
                                        Browser
                                    </th>
                                    <th className="text-left p-4 font-semibold text-gray-700 min-w-[80px]">
                                        <div className="flex items-center gap-2">
                                            <Monitor className="w-4 h-4" />
                                            Device
                                        </div>
                                    </th>
                                    <th className="text-left p-4 font-semibold text-gray-700 min-w-[120px]">
                                        <div className="flex items-center gap-2">
                                            <ExternalLink className="w-4 h-4" />
                                            Referrer
                                        </div>
                                    </th>
                                    <th className="text-left p-4 font-semibold text-gray-700 ">
                                        Link
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {memoizedClicks.map((click, index) => {
                                    const DeviceIcon = DEVICE_ICONS[click.device as keyof typeof DEVICE_ICONS] || Monitor;

                                    return (
                                        <tr
                                            key={`${click.id}-${index}`}
                                            className="hover:bg-white/80 transition-colors group"
                                        >
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900 text-xs">
                                                        {click.formattedTime}
                                                    </span>
                                                    <span className="text-xs text-gray-500 mt-0.5">
                                                        {new Date(click.time).toLocaleTimeString('en-US', {
                                                            hour12: false,
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                            second: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">
                                                        {COUNTRY_FLAGS[click.country] || COUNTRY_FLAGS.Unknown}
                                                    </span>
                                                    <span className="font-medium text-gray-900 text-xs truncate">
                                                        {click.country}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="p-4">
                                                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                                                    {click.browser}
                                                </span>
                                            </td>

                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <DeviceIcon className="w-4 h-4 text-gray-500" />
                                                    <span className="text-xs font-medium text-gray-900">
                                                        {click.device}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="p-4">
                                                <div className="max-w-[120px]">
                                                    {click.referrer === 'Direct' ? (
                                                        <span className="text-xs text-gray-500">
                                                            Direct
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-blue-600 hover:text-blue-800 truncate max-w-[100px]">
                                                            {click.referrer}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="p-4">
                                                {click.link ? (
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-gray-900 text-xs truncate max-w-[120px]">
                                                            {click.link.title}
                                                        </span>
                                                        <span className="text-xs text-blue-600 mt-0.5">
                                                            /{click.link.short_code}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400">
                                                        Unknown Link
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {/* Loading indicator */}
                        <div ref={bottomRef} className="p-4 text-center">
                            {loading && (
                                <div className="flex items-center justify-center gap-2">
                                    <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                                    <span className="text-sm text-gray-500">Loading more...</span>
                                </div>
                            )}

                            {!hasMore && memoizedClicks.length > 0 && (
                                <span className="text-sm text-gray-500">
                                    No more data to load
                                </span>
                            )}

                            {memoizedClicks.length === 0 && !loading && !error && (
                                <div className="py-8 text-center">
                                    <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">No clicks recorded yet</p>
                                    <p className="text-sm text-gray-400 mt-1">Share your links to see activity here</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile-specific info */}
            <div className="mt-4 text-xs text-gray-500 sm:hidden">
                <p>Swipe horizontally to see more details</p>
            </div>
        </div>
    );
};

export default ClickStream;