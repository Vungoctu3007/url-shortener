import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Search,
    Calendar,
    Filter,
    Plus,
    Download,
    Lock,
    Tag,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Copy,
    Share2,
    Edit,
    MoreHorizontal,
    BarChart3,
    ExternalLink,
    Trash2,
    QrCode,
} from "lucide-react";

import linkService from "@/api/linkService";
import type { LinkData, LinkListParams } from "@/api/linkService";
import CreateLinkModal from "@/components/CreateLinkModal";
import EditLinkModal from "@/components/EditLinkModal";
import QRCodeModal from "@/components/QRCodeModal";

type FilterType = "Active" | "Inactive" | "All";
type BulkActionType = "export" | "delete" | "tag";

interface LinkItemProps {
    link: LinkData;
    isSelected: boolean;
    onSelect: (id: number, selected: boolean) => void;
    onCopy: (url: string) => void;
    onShare: (link: LinkData) => void;
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
    onViewAnalytics: (id: number) => void;
    onShowQR: (link: LinkData) => void;
}

const LinkItem: React.FC<LinkItemProps> = ({
    link,
    isSelected,
    onSelect,
    onCopy,
    onShare,
    onEdit,
    onDelete,
    onViewAnalytics,
    onShowQR,
}) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();

    const handleTitleClick = () => {
        navigate(`/link/${link.id}`);
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
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getStatusColor = (status: string) => {
        return status === 'Active'
            ? 'text-green-600 bg-green-50 border-green-200'
            : 'text-red-600 bg-red-50 border-red-200';
    };

    return (
        <div className="bg-white rounded-lg border p-6 hover:shadow-sm transition-shadow">
            <div className="flex items-start space-x-4">
                {/* Checkbox */}
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => onSelect(link.id, e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                />

                {/* Favicon */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                    {getFaviconUrl(link.target) ? (
                        <img
                            src={getFaviconUrl(link.target)!}
                            alt=""
                            className="w-6 h-6"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    ) : (
                        <ExternalLink size={16} className="text-gray-400" />
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Title and URL */}
                    <div className="mb-2">
                        <h3
                            className="font-medium text-gray-900 hover:text-blue-600 cursor-pointer truncate"
                            onClick={handleTitleClick}
                        >
                            {link.title || "Untitled Link"}
                        </h3>
                        <div className="text-sm text-blue-600 font-medium">
                            {link.short_url.replace('https://', '').replace('http://', '')}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                            {link.target}
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                            <BarChart3 size={12} />
                            <span>{link.clicks.toLocaleString()} clicks</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <span
                                className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(link.status)}`}
                            >
                                {link.status}
                            </span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <Calendar size={12} />
                            <span>{formatDate(link.created_at)}</span>
                        </div>
                        {link.expires_at && (
                            <div className="flex items-center space-x-1">
                                <Lock size={12} />
                                <span>Expires {formatDate(link.expires_at)}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => onCopy(link.short_url)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        title="Copy"
                    >
                        <Copy size={16} />
                    </button>
                    <button
                        onClick={() => onShare(link)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        title="Share"
                    >
                        <Share2 size={16} />
                    </button>
                    <button
                        onClick={() => onEdit(link.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        title="Edit"
                    >
                        <Edit size={16} />
                    </button>

                    {/* Dropdown Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            <MoreHorizontal size={16} />
                        </button>

                        {showDropdown && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowDropdown(false)}
                                />
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-20">
                                    <div className="py-1">
                                        <button
                                            onClick={() => {
                                                onViewAnalytics(link.id);
                                                setShowDropdown(false);
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                                        >
                                            <BarChart3 size={14} />
                                            <span>View analytics</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                onShowQR(link);
                                                setShowDropdown(false);
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                                        >
                                            <QrCode size={14} />
                                            <span>QR code</span>
                                        </button>
                                        <hr className="my-1" />
                                        <button
                                            onClick={() => {
                                                onDelete(link.id);
                                                setShowDropdown(false);
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                                        >
                                            <Trash2 size={14} />
                                            <span>Delete</span>
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const LinkPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [selectedLinks, setSelectedLinks] = useState<number[]>([]);
    const [showFilter, setShowFilter] = useState<FilterType>("All");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage] = useState<number>(10);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [links, setLinks] = useState<LinkData[]>([]);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [totalItems, setTotalItems] = useState<number>(0);
    const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [editingLinkId, setEditingLinkId] = useState<number | null>(null);
    const [showQRModal, setShowQRModal] = useState<boolean>(false);
    const [qrLinkData, setQRLinkData] = useState<LinkData | null>(null);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // Show notification
    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    // Fetch links from API
    const fetchLinks = useCallback(async () => {
        setIsLoading(true);
        try {
            const params: LinkListParams = {
                page: currentPage,
                perpage: itemsPerPage,
                keyword: searchTerm,
                sort: 'created_at,desc'
            };

            if (showFilter === "Active") {
                params.active = 1;
            } else if (showFilter === "Inactive") {
                params.active = 0;
            }

            const response = await linkService.getLinks(params);

            if (response.status === 'success') {
                setLinks(response.data.data);
                setTotalPages(response.data.last_page);
                setTotalItems(response.data.total);
            }
        } catch (error) {
            console.error('Failed to fetch links:', error);
            showNotification('error', 'Failed to load links');
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, itemsPerPage, searchTerm, showFilter]);

    useEffect(() => {
        fetchLinks();
    }, [fetchLinks]);

    // Reset to first page when search or filter changes
    useEffect(() => {
        if (currentPage !== 1) {
            setCurrentPage(1);
        }
    }, [searchTerm, showFilter]);

    // Event handlers
    const handleSelectLink = useCallback((linkId: number, isSelected: boolean): void => {
        setSelectedLinks((prev) =>
            isSelected ? [...prev, linkId] : prev.filter((id) => id !== linkId)
        );
    }, []);

    const handleSelectAll = useCallback((isSelected: boolean): void => {
        setSelectedLinks(isSelected ? links.map((link) => link.id) : []);
    }, [links]);

    const handleCopy = useCallback(async (url: string): Promise<void> => {
        try {
            const success = await linkService.copyToClipboard(url);
            if (success) {
                showNotification('success', 'Link copied to clipboard!');
            }
        } catch (error) {
            showNotification('error', 'Failed to copy link');
        }
    }, []);

    const handleShare = useCallback(async (link: LinkData): Promise<void> => {
        try {
            await linkService.shareLink({
                title: link.title || 'Shared Link',
                url: link.short_url,
                text: `Check out this link: ${link.title || link.short_url}`
            });
        } catch (error) {
            showNotification('error', 'Failed to share link');
        }
    }, []);

    const handleEdit = useCallback((id: number): void => {
        setEditingLinkId(id);
        setShowEditModal(true);
    }, []);

    const handleDelete = useCallback(async (id: number): Promise<void> => {
        if (!confirm('Are you sure you want to delete this link?')) return;

        try {
            const response = await linkService.deleteLink(id);
            if (response.status === 'success') {
                await fetchLinks();
                setSelectedLinks(prev => prev.filter(linkId => linkId !== id));
                showNotification('success', 'Link deleted successfully');
            }
        } catch (error) {
            showNotification('error', 'Failed to delete link');
        }
    }, [fetchLinks]);

    const handleViewAnalytics = useCallback((id: number): void => {
        navigate(`/link/${id}`);
    }, [navigate]);

    const handleShowQR = useCallback((link: LinkData): void => {
        setQRLinkData(link);
        setShowQRModal(true);
    }, []);

    const handleBulkAction = useCallback(async (action: BulkActionType): Promise<void> => {
        if (selectedLinks.length === 0) return;

        try {
            switch (action) {
                case "export":
                    const exportResponse = await linkService.bulkExportLinks(selectedLinks);
                    if (exportResponse.status === 'success') {
                        linkService.downloadAsCSV(
                            exportResponse.data,
                            `links-export-${new Date().toISOString().split('T')[0]}.csv`
                        );
                        showNotification('success', 'Links exported successfully');
                    }
                    break;

                case "delete":
                    if (!confirm(`Are you sure you want to delete ${selectedLinks.length} selected links?`)) return;

                    const deleteResponse = await linkService.bulkDeleteLinks(selectedLinks);
                    if (deleteResponse.status === 'success') {
                        await fetchLinks();
                        setSelectedLinks([]);
                        showNotification('success', 'Selected links deleted successfully');
                    }
                    break;

                case "tag":
                    // Implement tagging functionality
                    console.log('Bulk tag:', selectedLinks);
                    showNotification('success', 'Tagging feature coming soon!');
                    break;
            }
        } catch (error) {
            showNotification('error', `Failed to ${action} selected links`);
        }
    }, [selectedLinks, fetchLinks]);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Notification */}
            {notification && (
                <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
                    notification.type === 'success'
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                    {notification.message}
                </div>
            )}

            <div className="max-w-7xl mx-auto p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Links</h1>
                        <p className="text-gray-600 mt-1">Manage and track your shortened URLs</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 font-medium"
                    >
                        <Plus size={20} />
                        <span>Create link</span>
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg border p-6 mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search links by title, URL, or slug..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <Filter size={16} className="text-gray-500" />
                                <span className="text-sm text-gray-600">Status:</span>
                                <select
                                    value={showFilter}
                                    onChange={(e) => setShowFilter(e.target.value as FilterType)}
                                    className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="All">All Links</option>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bulk actions bar */}
                <div className="bg-white rounded-lg border p-4 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <input
                                type="checkbox"
                                checked={selectedLinks.length === links.length && links.length > 0}
                                onChange={(e) => handleSelectAll(e.target.checked)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-gray-600">
                                {selectedLinks.length > 0
                                    ? `${selectedLinks.length} selected`
                                    : `${totalItems} total links`
                                }
                            </span>

                            {selectedLinks.length > 0 && (
                                <div className="flex items-center space-x-2 ml-4">
                                    <button
                                        onClick={() => handleBulkAction("export")}
                                        className="px-3 py-1 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded flex items-center space-x-1 text-sm"
                                    >
                                        <Download size={16} />
                                        <span>Export</span>
                                    </button>
                                    <button
                                        onClick={() => handleBulkAction("delete")}
                                        className="px-3 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded flex items-center space-x-1 text-sm"
                                    >
                                        <Trash2 size={16} />
                                        <span>Delete</span>
                                    </button>
                                    <button
                                        onClick={() => handleBulkAction("tag")}
                                        className="px-3 py-1 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded flex items-center space-x-1 text-sm"
                                    >
                                        <Tag size={16} />
                                        <span>Tag</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span>Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}</span>
                        </div>
                    </div>
                </div>

                {/* Links list */}
                <div className="space-y-4 mb-8">
                    {isLoading ? (
                        Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="bg-white rounded-lg border p-6 animate-pulse">
                                <div className="flex items-start space-x-4">
                                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : links.length > 0 ? (
                        links.map((link) => (
                            <LinkItem
                                key={link.id}
                                link={link}
                                isSelected={selectedLinks.includes(link.id)}
                                onSelect={handleSelectLink}
                                onCopy={handleCopy}
                                onShare={handleShare}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onViewAnalytics={handleViewAnalytics}
                                onShowQR={handleShowQR}
                            />
                        ))
                    ) : (
                        <div className="bg-white rounded-lg border p-12 text-center">
                            <div className="text-gray-400 mb-4">
                                <Search size={48} className="mx-auto" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {searchTerm ? "No links found" : "No links yet"}
                            </h3>
                            <p className="text-gray-600 mb-4">
                                {searchTerm
                                    ? "Try adjusting your search terms or filters"
                                    : "Create your first link to get started"
                                }
                            </p>
                            {!searchTerm && (
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Create your first link
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="bg-white rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                                {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
                            </div>

                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft size={20} />
                                </button>

                                <div className="flex items-center space-x-1">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`px-3 py-2 rounded-lg transition-colors ${
                                                    currentPage === pageNum
                                                        ? "bg-blue-600 text-white"
                                                        : "border border-gray-300 hover:bg-gray-50 text-gray-700"
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}

                                    {totalPages > 5 && currentPage < totalPages - 2 && (
                                        <>
                                            <span className="px-2 text-gray-400">...</span>
                                            <button
                                                onClick={() => setCurrentPage(totalPages)}
                                                className={`px-3 py-2 rounded-lg transition-colors ${
                                                    currentPage === totalPages
                                                        ? "bg-blue-600 text-white"
                                                        : "border border-gray-300 hover:bg-gray-50 text-gray-700"
                                                }`}
                                            >
                                                {totalPages}
                                            </button>
                                        </>
                                    )}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {showCreateModal && (
                <CreateLinkModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        fetchLinks();
                        showNotification('success', 'Link created successfully!');
                    }}
                    userId={1} // Replace with actual user ID from auth context
                />
            )}

            {showEditModal && (
                <EditLinkModal
                    isOpen={showEditModal}
                    onClose={() => {
                        setShowEditModal(false);
                        setEditingLinkId(null);
                    }}
                    onSuccess={() => {
                        fetchLinks();
                        showNotification('success', 'Link updated successfully!');
                    }}
                    linkId={editingLinkId}
                />
            )}

            {showQRModal && qrLinkData && (
                <QRCodeModal
                    isOpen={showQRModal}
                    onClose={() => {
                        setShowQRModal(false);  
                        setQRLinkData(null);
                    }}
                    qrUrl={qrLinkData.qr_url || ''}
                    shortUrl={qrLinkData.short_url}
                    title={qrLinkData.title || 'Untitled'}
                />
            )}
        </div>
    );
};

export default LinkPage;
