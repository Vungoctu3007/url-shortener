import React, { useState } from "react";
import { X, Calendar, Link, Type, Clock } from "lucide-react";
import linkService from "@/api/linkService";
import type { CreateLinkData } from "@/api/linkService";

interface CreateLinkModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    userId: number;
}

const CreateLinkModal: React.FC<CreateLinkModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    userId,
}) => {
    const [formData, setFormData] = useState<CreateLinkData>({
        target: "",
        title: "",
        slug: "",
        expires_at: "",
        user_id: userId,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAdvanced, setIsAdvanced] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // Validate URL
            try {
                new URL(formData.target);
            } catch {
                setError("Please enter a valid URL");
                setIsLoading(false);
                return;
            }

            const submitData = { ...formData };

            // Remove empty fields
            if (!submitData.title?.trim()) delete submitData.title;
            if (!submitData.slug?.trim()) delete submitData.slug;
            if (!submitData.expires_at) delete submitData.expires_at;

            const response = await linkService.createLink(submitData);

            if (response.status === 'success') {
                onSuccess();
                onClose();
                // Reset form
                setFormData({
                    target: "",
                    title: "",
                    slug: "",
                    expires_at: "",
                    user_id: userId,
                });
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to create link");
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field: keyof CreateLinkData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (error) setError(null);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">Create new link</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                            {error}
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

                    {/* Advanced Options Toggle */}
                    <button
                        type="button"
                        onClick={() => setIsAdvanced(!isAdvanced)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                        {isAdvanced ? "Hide" : "Show"} advanced options
                    </button>

                    {isAdvanced && (
                        <div className="space-y-4 pt-2 border-t">
                            {/* Custom Back-half */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Custom back-half (optional)
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
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !formData.target.trim()}
                            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLoading ? "Creating..." : "Create link"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateLinkModal;
