import React, { useState, useCallback } from "react";
import {
    Calendar,
    Tag,
    Copy,
    Share,
    Edit,
    MoreHorizontal,
    BarChart,
    ExternalLink,
} from "lucide-react";

interface LinkItemProps {
    id: number;
    title: string;
    shortUrl: string;
    originalUrl: string;
    clickCount?: number;
    createdAt?: Date;
    tags?: string[];
    favicon?: string | null;
    onCopy?: (url: string, id: number) => void;
    onShare?: (linkData: LinkShareData) => void;
    onEdit?: (id: number) => void;
    onDelete?: (id: number) => void;
    onViewAnalytics?: (id: number) => void;
    showActions?: boolean;
    showStats?: boolean;
    showTags?: boolean;
    className?: string;
    isLoading?: boolean;
    isCopying?: boolean;
    isSelected?: boolean;
    onSelect?: (id: number, isSelected: boolean) => void;
}
interface LinkShareData {
    id: number;
    title: string;
    shortUrl: string;
    originalUrl: string;
}
const LinkItem: React.FC<LinkItemProps> = ({
    id,
    title,
    shortUrl,
    originalUrl,
    createdAt = new Date(),
    tags = [],
    favicon = null,
    onCopy = () => {},
    onShare = () => {},
    onEdit = () => {},
    onDelete = () => {},
    onViewAnalytics = () => {},
    showActions = true,
    showStats = true,
    showTags = true,
    className = "",
    isLoading = false,
    isCopying = false,
    isSelected = false,
    onSelect = () => {},
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

    const formatDate = useCallback((date: Date): string => {
        const dateObj = date instanceof Date ? date : new Date(date);
        return dateObj.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    }, []);

    const handleCopy = useCallback(async (): Promise<void> => {
        try {
            await navigator.clipboard.writeText(shortUrl);
            onCopy(shortUrl, id);
        } catch (error) {
            console.error("Copy failed:", error);
        }
    }, [shortUrl, onCopy, id]);

    const handleShare = useCallback((): void => {
        if (navigator.share) {
            navigator
                .share({
                    title: title,
                    url: shortUrl,
                })
                .catch(console.error);
        } else {
            onShare({ id, title, shortUrl, originalUrl });
        }
    }, [title, shortUrl, onShare, id, originalUrl]);

    const handleSelectChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>): void => {
            onSelect(id, e.target.checked);
        },
        [id, onSelect]
    );

    const handleEditClick = useCallback((): void => {
        onEdit(id);
    }, [onEdit, id]);

    const handleAnalyticsClick = useCallback((): void => {
        onViewAnalytics(id);
        setIsMenuOpen(false);
    }, [onViewAnalytics, id]);

    const handleDeleteClick = useCallback((): void => {
        onDelete(id);
        setIsMenuOpen(false);
    }, [onDelete, id]);

    if (isLoading) {
        return (
            <div
                className={`bg-white rounded-lg border p-6 animate-pulse ${className}`}
            >
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4 flex-1">
                        <div className="w-4 h-4 bg-gray-200 rounded"></div>
                        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1">
                            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <div className="flex space-x-6">
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                    <div className="flex space-x-2">
                        <div className="h-8 w-16 bg-gray-200 rounded"></div>
                        <div className="h-8 w-16 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`bg-white rounded-lg border hover:border-blue-200 hover:shadow-sm transition-all duration-200 p-6 ${
                isSelected ? "border-blue-300 bg-blue-50" : ""
            } ${className}`}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4 flex-1 min-w-0">
                    {/* Checkbox */}
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={handleSelectChange}
                        className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />

                    {/* Favicon */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                        {favicon ? (
                            <img
                                src={favicon}
                                alt=""
                                className="w-8 h-8"
                                onError={(
                                    e: React.SyntheticEvent<
                                        HTMLImageElement,
                                        Event
                                    >
                                ) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = "none";
                                    if (target.nextSibling) {
                                        (
                                            target.nextSibling as HTMLElement
                                        ).style.display = "flex";
                                    }
                                }}
                            />
                        ) : null}
                        <div
                            className={`w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg text-white text-sm flex items-center justify-center font-semibold ${
                                favicon ? "hidden" : "flex"
                            }`}
                        >
                            {title ? title.charAt(0).toUpperCase() : "L"}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <h3
                            className="font-semibold text-gray-900 text-lg mb-2"
                            title={title}
                        >
                            {title}
                        </h3>
                        <div
                            className="text-blue-600 font-medium mb-2"
                            title={shortUrl}
                        >
                            {shortUrl.replace(/^https?:\/\//, "")}
                        </div>
                        <a
                            href={originalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-blue-600 flex items-center space-x-1 group"
                            title={originalUrl}
                        >
                            <span className="truncate">{originalUrl}</span>
                            <ExternalLink
                                size={14}
                                className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                            />
                        </a>
                    </div>
                </div>

                {/* Action buttons */}
                {showActions && (
                    <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                        <button
                            onClick={handleCopy}
                            disabled={isCopying}
                            className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors flex items-center space-x-1 text-sm"
                            title="Copy"
                        >
                            <Copy size={16} />
                            <span>Copy</span>
                        </button>

                        <button
                            onClick={handleShare}
                            className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors flex items-center space-x-1 text-sm"
                            title="Share"
                        >
                            <Share size={16} />
                            <span>Share</span>
                        </button>

                        <button
                            onClick={handleEditClick}
                            className="px-2 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                            title="Edit"
                        >
                            <Edit size={16} />
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="px-2 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                                title="More"
                            >
                                <MoreHorizontal size={16} />
                            </button>

                            {isMenuOpen && (
                                <div className="absolute right-0 top-full mt-1 w-48 bg-white border rounded-lg shadow-lg z-10">
                                    <button
                                        onClick={handleAnalyticsClick}
                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                                    >
                                        <BarChart size={14} />
                                        <span>View analytics</span>
                                    </button>
                                    <button
                                        onClick={handleDeleteClick}
                                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                                    >
                                        <span>🗑️</span>
                                        <span>Delete</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer stats */}
            <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-6">
                    {showStats && (
                        <div className="flex items-center space-x-1">
                            <BarChart size={16} />
                            <span>Click data</span>
                        </div>
                    )}

                    <div className="flex items-center space-x-1">
                        <Calendar size={16} />
                        <span>{formatDate(createdAt)}</span>
                    </div>

                    {showTags && (
                        <div className="flex items-center space-x-1">
                            <Tag size={16} />
                            <span>
                                {tags.length > 0 ? tags.join(", ") : "No tags"}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {isMenuOpen && (
                <div
                    className="fixed inset-0 z-5"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}
        </div>
    );
};

export default LinkItem;
