import React, { useState, useEffect } from "react";
import { X, Link, Type, Clock, AlertCircle } from "lucide-react";
import linkService from "@/api/linkService";
import type { UpdateLinkData, LinkData } from "@/api/linkService";

interface EditLinkModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    linkId: number | null;
}

const EditLinkModal: React.FC<EditLinkModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    linkId,
}) => {
    const [formData, setFormData] = useState<UpdateLinkData>({
        target: "",
        title: "",
        slug: "",
        expires_at: "",
    });
    const [originalData, setOriginalData] = useState<LinkData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch link data when modal opens
    useEffect(() => {
        if (isOpen && linkId) {
            fetchLinkData();
        }
    }, [isOpen, linkId]);

    const fetchLinkData = async () => {
        if (!linkId) return;

        setIsFetching(true);
        setError(null);

        try {
            const response = await linkService.getLink(linkId);
            if (response.status === 'success') {
                const link = response.data;
                setOriginalData(link);
                setFormData({
                    target: link.target,
                    title: link.title || "",
                    slug: link.slug,
                    expires_at: link.expires_at ? new Date(link.expires_at).toISOString().slice(0, 16) : "",
                });
            }
        } catch (err: any) {
            setError("Failed to load link data");
        } finally {
            setIsFetching(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!linkId) return;

        setIsLoading(true);
        setError(null);

        try {
            // Validate URL
            try {
                new URL(formData.target!);
            } catch {
                setError("Please enter a valid URL");
                setIsLoading(false);
                return;
            }

            // Only send changed fields
            const updateData: UpdateLinkData = {};

            if (formData.target !== originalData?.target) {
                updateData.target = formData.target;
            }
            if (formData.title !== (originalData?.title || "")) {
                updateData.title = formData.title;
            }
            if (formData.slug !== originalData?.slug) {
                updateData.slug = formData.slug;
            }

            const originalExpires = originalData?.expires_at ? new Date(originalData.expires_at).toISOString().slice(0, 16) : "";
            if (formData.expires_at !== originalExpires) {
                updateData.expires_at = formData.expires_at || undefined;
            }

            const response = await linkService.updateLink(linkId, updateData);

            if (response.status === 'success') {
                onSuccess();
                onClose();
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to update link");
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field: keyof UpdateLinkData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (error) setError(null);
    };

    const handleClose = () => {
        onClose();
        // Reset form data
        setTimeout(() => {
            setFormData({
                target: "",
                title: "",
                slug: "",
                expires_at: "",
            });
            setOriginalData(null);
            setError(null);
        }, 300);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">Edit link</h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {isFetching ? (
                        <div className="space-y-4">
                            <div className="animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                                <div className="h-12 bg-gray-200 rounded mb-4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                                <div className="h-12 bg-gray-200 rounded mb-4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                                <div className="h-12 bg-gray-200 rounded mb-4"></div>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm flex items-start space-x-2">
                                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Destination URL */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Destination URL *
                                </label>
                                <div className="relative">
                                    <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="url"
                                        value={formData.target}
                                        onChange={(e) => handleInputChange("target", e.target.value)}
                                        placeholder="https://example.com"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Title (optional)
                                </label>
                                <div className="relative">
                                    <Type className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => handleInputChange("title", e.target.value)}
                                        placeholder="Enter a title for your link"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Custom Back-half */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Custom back-half
                                </label>
                                <div className="flex">
                                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                        {window.location.origin}/
                                    </span>
                                    <input
                                        type="text"
                                        value={formData.slug}
                                        onChange={(e) => handleInputChange("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
                                        placeholder="custom-slug"
                                        className="flex-1 px-3 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Only lowercase letters, numbers, hyphens, and underscores
                                </p>
                            </div>

                            {/* Expiration Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Expiration date (optional)
                                </label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="datetime-local"
                                        value={formData.expires_at}
                                        onChange={(e) => handleInputChange("expires_at", e.target.value)}
                                        min={new Date().toISOString().slice(0, 16)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Leave empty for no expiration
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading || !formData.target?.trim()}
                                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isLoading ? "Updating..." : "Update link"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EditLinkModal;
