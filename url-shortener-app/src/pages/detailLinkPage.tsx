import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Copy, Share2, Edit, Trash2, QrCode, ExternalLink, Calendar, Tag, TrendingUp } from "lucide-react";
import linkService from "@/api/linkService";
import type { LinkDetailData } from "@/api/linkService";
import DevicePieChart from "@/components/charts/DevicePieChart";
import ReferrerBarChart from "@/components/charts/ReferrerBarChart";
import LineChartBox from "@/components/charts/LineChartBox";
import EditLinkModal from "@/components/EditLinkModal";
import QRCodeModal from "@/components/QRCodeModal";

const config = {
    APP_URL: import.meta.env.VITE_BACK_END || "https://url-shortener.ddev.site",
    getShortUrl: (slug: string) => `${import.meta.env.VITE_BACK_END || "https://url-shortener.ddev.site"}/${slug}`,
    getShortUrlBase: () => (import.meta.env.VITE_BACK_END || "https://url-shortener.ddev.site").replace('https://', '').replace('http://', '')
};

const DetailLinkPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [link, setLink] = useState<LinkDetailData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [showQRModal, setShowQRModal] = useState<boolean>(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!id) {
                setError("Link ID is required");
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                setError(null);

                const response = await linkService.getLinkWithAnalytics(parseInt(id));

                if (response.status === 'success') {
                    const data = response.data;

                    // Create a safe link object with all required properties
                    const safeLink: LinkDetailData = {
                        id: data.id || 0,
                        title: data.title || null,
                        slug: data.slug || '',
                        target: data.target || '',
                        clicks: data.clicks || data.total_clicks || 0,
                        created_at: data.created_at || new Date().toISOString(),
                        expires_at: data.expires_at || null,
                        qr_url: data.qr_url || null,
                        user_id: data.user_id || 0,
                        status: data.status || (data.expires_at && new Date(data.expires_at) < new Date() ? 'Inactive' : 'Active'),
                        short_url: data.short_url || config.getShortUrl(data.slug),
                        click_count: data.clicks || data.total_clicks || 0,
                        created_at_formatted: data.created_at_formatted || data.created_at || new Date().toISOString(),
                        clicksdata: data.clicksdata || [],
                        devices: data.devices || [],
                        referrers: data.referrers || [],
                        total_clicks: data.total_clicks || data.clicks || 0
                    };

                    setLink(safeLink);
                } else {
                    setError("Failed to load link details");
                }
            } catch (err) {
                console.error("Error fetching link detail", err);
                setError("An error occurred while loading link details");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleCopy = async (url: string) => {
        try {
            const success = await linkService.copyToClipboard(url);
            if (success) {
                showNotification('success', 'Link copied to clipboard!');
            }
        } catch (error) {
            showNotification('error', 'Failed to copy link');
        }
    };

    const handleShare = async () => {
        if (!link) return;
        try {
            await linkService.shareLink({
                title: link.title || 'Shared Link',
                url: link.short_url,
                text: `Check out this link: ${link.title || link.short_url}`
            });
        } catch (error) {
            showNotification('error', 'Failed to share link');
        }
    };

    const handleDelete = async () => {
        if (!link || !confirm('Are you sure you want to delete this link?')) return;

        try {
            const response = await linkService.deleteLink(link.id);
            if (response.status === 'success') {
                showNotification('success', 'Link deleted successfully');
                setTimeout(() => navigate('/link'), 1500);
            }
        } catch (error) {
            showNotification('error', 'Failed to delete link');
        }
    };

    const getFaviconUrl = (url: string) => {
        try {
            const domain = new URL(url).hostname;
            return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
        } catch {
            return null;
        }
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return 'Invalid date';
        }
    };

    const formatDateShort = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } catch {
            return 'Invalid date';
        }
    };

    const getStatusColor = (status: string) => {
        return status === 'Active'
            ? 'text-green-600 bg-green-50 border-green-200'
            : 'text-red-600 bg-red-50 border-red-200';
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 px-4 py-6">
                <div className="max-w-6xl mx-auto">
                    <div className="animate-pulse space-y-6">
                        <div className="h-6 bg-gray-200 rounded w-32"></div>
                        <div className="bg-white rounded-lg border p-6">
                            <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-64 mb-8"></div>
                            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="h-20 bg-gray-200 rounded"></div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="h-64 bg-gray-200 rounded"></div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="h-64 bg-gray-200 rounded"></div>
                                <div className="h-64 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 px-4 py-6">
                <div className="max-w-6xl mx-auto">
                    <button
                        onClick={() => navigate('/link')}
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-6 py-2"
                    >
                        <ArrowLeft size={20} />
                        <span>Back to Links</span>
                    </button>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <div className="text-red-600 mb-4">
                            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.348 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Link</h3>
                        <p className="text-red-700 mb-4">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!link) {
        return (
            <div className="min-h-screen bg-gray-50 px-4 py-6">
                <div className="max-w-6xl mx-auto">
                    <button
                        onClick={() => navigate('/link')}
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-6 py-2"
                    >
                        <ArrowLeft size={20} />
                        <span>Back to Links</span>
                    </button>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                        <div className="text-gray-400 mb-4">
                            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Link Not Found</h3>
                        <p className="text-gray-600">The link you're looking for doesn't exist or has been deleted.</p>
                    </div>
                </div>
            </div>
        );
    }

    // Safe access to arrays with fallbacks
    const safeClicksData = link.clicksdata || [];
    const safeDevicesData = link.devices || [];
    const safeReferrersData = link.referrers || [];

    // Calculate today's clicks safely
    const todaysClicks = safeClicksData.find(d => d.date === new Date().toISOString().split('T')[0])?.clicks || 0;

    // Calculate peak day safely
    const peakDay = safeClicksData.length > 0 ? Math.max(...safeClicksData.map(d => d.clicks)) : 0;

    // Calculate average daily clicks safely
    const avgDaily = link.clicks > 0 ? (link.clicks / 30).toFixed(1) : '0';

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Notification - Fixed position with proper z-index */}
            {notification && (
                <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50">
                    <div className={`p-4 rounded-lg shadow-lg border ${
                        notification.type === 'success'
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : 'bg-red-100 text-red-800 border-red-200'
                    }`}>
                        <p className="text-sm font-medium">{notification.message}</p>
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
                {/* Back Button - Consistent spacing */}
                <button
                    onClick={() => navigate('/link')}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors py-2"
                >
                    <ArrowLeft size={20} className="flex-shrink-0" />
                    <span>Back to Links</span>
                </button>

                {/* Header Card - Responsive horizontal/vertical layout */}
                <div className="bg-white rounded-lg border overflow-hidden">
                    <div className="p-4 md:p-6">
                        {/* Main content area - Stack on mobile, horizontal on desktop */}
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                            {/* Left side: Title and favicon section */}
                            <div className="flex items-start space-x-4 flex-1 min-w-0">
                                {/* Favicon */}
                                <div className="w-14 h-14 rounded-lg border-2 border-gray-200 p-2 bg-gray-50 flex-shrink-0">
                                    {getFaviconUrl(link.target) ? (
                                        <img
                                            src={getFaviconUrl(link.target)!}
                                            alt="Favicon"
                                            className="w-full h-full object-contain"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <ExternalLink className="text-gray-400 w-full h-full" />
                                    )}
                                </div>

                                {/* Title and URLs */}
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 break-words">
                                        {link.title || "Untitled"}
                                    </h1>
                                    <div className="space-y-2">
                                        <div>
                                            <a
                                                href={link.short_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 font-medium hover:underline text-base md:text-lg block break-all"
                                            >
                                                {link.short_url.replace('https://', '').replace('http://', '')}
                                            </a>
                                        </div>
                                        <div>
                                            <p className="text-gray-600 text-sm break-all leading-relaxed">
                                                {link.target}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right side: Action buttons - Stack on mobile, align right on desktop */}
                            <div className="flex flex-wrap lg:flex-nowrap gap-2 lg:flex-shrink-0">
                                <button
                                    onClick={() => handleCopy(link.short_url)}
                                    className="flex items-center justify-center gap-2 border border-gray-300 px-4 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors min-w-0"
                                >
                                    <Copy className="w-4 h-4 flex-shrink-0" />
                                    <span className="hidden xs:inline">Copy</span>
                                </button>
                                <button
                                    onClick={handleShare}
                                    className="flex items-center justify-center gap-2 border border-gray-300 px-4 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors min-w-0"
                                >
                                    <Share2 className="w-4 h-4 flex-shrink-0" />
                                    <span className="hidden xs:inline">Share</span>
                                </button>
                                <button
                                    onClick={() => setShowEditModal(true)}
                                    className="flex items-center justify-center gap-2 border border-gray-300 px-4 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors min-w-0"
                                >
                                    <Edit className="w-4 h-4 flex-shrink-0" />
                                    <span className="hidden xs:inline">Edit</span>
                                </button>
                                <button
                                    onClick={() => setShowQRModal(true)}
                                    className="flex items-center justify-center gap-2 border border-gray-300 px-4 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors min-w-0"
                                >
                                    <QrCode className="w-4 h-4 flex-shrink-0" />
                                    <span className="hidden xs:inline">QR Code</span>
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex items-center justify-center gap-2 border border-red-300 px-4 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors min-w-0"
                                >
                                    <Trash2 className="w-4 h-4 flex-shrink-0" />
                                    <span className="hidden xs:inline">Delete</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Metadata - Responsive horizontal/vertical layout */}
                    <div className="border-t bg-gray-50 px-4 md:px-6 py-4">
                        <div className="flex flex-col sm:flex-row sm:flex-wrap lg:flex-nowrap lg:items-center lg:justify-between gap-3 sm:gap-4 lg:gap-6 text-xs md:text-sm text-gray-600">
                            {/* Left group: Dates and Status */}
                            <div className="flex flex-col xs:flex-row xs:flex-wrap gap-3 xs:gap-4 lg:gap-6">
                                <div className="flex items-center gap-2 min-w-0">
                                    <Calendar className="w-4 h-4 flex-shrink-0" />
                                    <span className="truncate">
                                        Created <span className="hidden sm:inline">{formatDate(link.created_at)}</span>
                                        <span className="sm:hidden">{formatDateShort(link.created_at)}</span>
                                    </span>
                                </div>

                                {link.expires_at && (
                                    <div className="flex items-center gap-2 min-w-0">
                                        <Calendar className="w-4 h-4 flex-shrink-0" />
                                        <span className="truncate">
                                            Expires <span className="hidden sm:inline">{formatDate(link.expires_at)}</span>
                                            <span className="sm:hidden">{formatDateShort(link.expires_at)}</span>
                                        </span>
                                    </div>
                                )}

                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(link.status)} whitespace-nowrap`}>
                                        {link.status}
                                    </span>
                                </div>
                            </div>

                            {/* Right group: Tags */}
                            <div className="flex items-center gap-2 min-w-0 lg:flex-shrink-0">
                                <Tag className="w-4 h-4 flex-shrink-0" />
                                <span>No tags</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Stats - Responsive grid */}
                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg border p-4 md:p-6">
                        <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                                <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">Total Clicks</p>
                                <p className="text-xl md:text-2xl font-bold text-gray-900 truncate">{link.clicks.toLocaleString()}</p>
                            </div>
                            <div className="p-2 md:p-3 bg-blue-100 rounded-lg ml-3">
                                <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border p-4 md:p-6">
                        <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                                <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">Today's Clicks</p>
                                <p className="text-xl md:text-2xl font-bold text-gray-900 truncate">{todaysClicks}</p>
                            </div>
                            <div className="p-2 md:p-3 bg-green-100 rounded-lg ml-3">
                                <Calendar className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border p-4 md:p-6">
                        <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                                <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">Peak Day</p>
                                <p className="text-xl md:text-2xl font-bold text-gray-900 truncate">{peakDay}</p>
                            </div>
                            <div className="p-2 md:p-3 bg-purple-100 rounded-lg ml-3">
                                <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border p-4 md:p-6">
                        <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                                <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">Avg. Daily</p>
                                <p className="text-xl md:text-2xl font-bold text-gray-900 truncate">{avgDaily}</p>
                            </div>
                            <div className="p-2 md:p-3 bg-orange-100 rounded-lg ml-3">
                                <Calendar className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Analytics Charts - Stack properly on mobile */}
                <div className="space-y-6">
                    <div className="w-full">
                        <LineChartBox data={safeClicksData} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="w-full">
                            <DevicePieChart data={safeDevicesData} />
                        </div>
                        <div className="w-full">
                            <ReferrerBarChart data={safeReferrersData} />
                        </div>
                    </div>
                </div>

                {/* Additional Info - Better mobile layout */}
                <div className="bg-white rounded-lg border p-4 md:p-6">
                    <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-6">Link Information</h3>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Link Details */}
                        <div>
                            <h4 className="font-medium text-gray-700 mb-4">Link Details</h4>
                            <div className="space-y-4">
                                <div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Short URL</div>
                                    <div className="font-mono text-sm text-blue-600 break-all p-2 bg-blue-50 rounded border">
                                        {link.short_url}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Slug</div>
                                    <div className="font-mono text-sm p-2 bg-gray-50 rounded border break-all">
                                        {link.slug}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Created</div>
                                    <div className="text-sm p-2 bg-gray-50 rounded border">
                                        {new Date(link.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                                {link.expires_at && (
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Expires</div>
                                        <div className="text-sm p-2 bg-gray-50 rounded border">
                                            {new Date(link.expires_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Performance Summary */}
                        <div>
                            <h4 className="font-medium text-gray-700 mb-4">Performance Summary</h4>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                                    <span className="text-sm text-gray-600">Total Clicks</span>
                                    <span className="text-sm font-semibold">{link.clicks.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                                    <span className="text-sm text-gray-600">Unique Devices</span>
                                    <span className="text-sm font-semibold">{safeDevicesData.length}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                                    <span className="text-sm text-gray-600">Traffic Sources</span>
                                    <span className="text-sm font-semibold">{safeReferrersData.length}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                                    <span className="text-sm text-gray-600">Status</span>
                                    <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(link.status)}`}>
                                        {link.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showEditModal && (
                <EditLinkModal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    onSuccess={() => {
                        // Refresh link data
                        if (id) {
                            linkService.getLinkWithAnalytics(parseInt(id)).then(response => {
                                if (response.status === 'success') {
                                    const data = response.data;
                                    const safeLink: LinkDetailData = {
                                        id: data.id || 0,
                                        title: data.title || null,
                                        slug: data.slug || '',
                                        target: data.target || '',
                                        clicks: data.clicks || data.total_clicks || 0,
                                        created_at: data.created_at || new Date().toISOString(),
                                        expires_at: data.expires_at || null,
                                        qr_url: data.qr_url || null,
                                        user_id: data.user_id || 0,
                                        status: data.status || (data.expires_at && new Date(data.expires_at) < new Date() ? 'Inactive' : 'Active'),
                                        short_url: data.short_url || `${window.location.origin}/${data.slug}`,
                                        click_count: data.clicks || data.total_clicks || 0,
                                        created_at_formatted: data.created_at_formatted || data.created_at || new Date().toISOString(),
                                        clicksdata: data.clicksdata || [],
                                        devices: data.devices || [],
                                        referrers: data.referrers || [],
                                        total_clicks: data.total_clicks || data.clicks || 0
                                    };
                                    setLink(safeLink);
                                }
                            });
                        }
                        showNotification('success', 'Link updated successfully!');
                    }}
                    linkId={link.id}
                />
            )}

            {showQRModal && (
                <QRCodeModal
                    isOpen={showQRModal}
                    onClose={() => setShowQRModal(false)}
                    qrUrl={link.qr_url || ''}
                    shortUrl={link.short_url}
                    title={link.title || 'Untitled'}
                />
            )}
        </div>
    );
};

export default DetailLinkPage;
