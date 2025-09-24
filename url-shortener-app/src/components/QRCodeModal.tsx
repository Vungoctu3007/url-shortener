import React, { useState, useEffect } from "react";
import { X, Download, Copy, Share2, ArrowLeft } from "lucide-react";

interface QRCodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    qrUrl: string;
    shortUrl: string;
    title: string;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({
    isOpen,
    onClose,
    qrUrl,
    shortUrl,
    title,
}) => {
    const [notification, setNotification] = useState<string | null>(null);

    const showNotification = (message: string) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 2000);
    };

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        // Cleanup function to reset body overflow when component unmounts
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Handle ESC key press
    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscKey);
        }

        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [isOpen, onClose]);

    const handleDownload = async () => {
        try {
            const response = await fetch(qrUrl);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `qr-code-${title || 'link'}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            URL.revokeObjectURL(url);
            showNotification("QR code downloaded!");
        } catch (error) {
            showNotification("Failed to download QR code");
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shortUrl);
            showNotification("Link copied to clipboard!");
        } catch (error) {
            showNotification("Failed to copy link");
        }
    };

    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: title || 'Shared Link',
                    url: shortUrl,
                    text: `Check out this link: ${shortUrl}`
                });
            } else {
                await handleCopy();
            }
        } catch (error) {
            console.error('Failed to share:', error);
        }
    };

    // Handle click on backdrop
    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-white bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 relative">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                            title="Back"
                        >
                            <ArrowLeft size={16} className="text-gray-600" />
                        </button>
                        <h2 className="text-xl font-semibold text-gray-900">QR Code</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                        title="Close"
                    >
                        <X size={16} className="text-gray-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 text-center">
                    {/* QR Code */}
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 mb-6 inline-block shadow-sm">
                        <img
                            src={qrUrl}
                            alt="QR Code"
                            className="w-48 h-48 mx-auto"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const parent = e.currentTarget.parentElement;
                                if (parent) {
                                    parent.innerHTML = '<div class="w-48 h-48 flex items-center justify-center bg-gray-100 text-gray-400 rounded-lg">QR Code not available</div>';
                                }
                            }}
                        />
                    </div>

                    {/* Link Info */}
                    <div className="mb-6">
                        <h3 className="font-semibold text-gray-900 mb-3 text-lg">
                            {title || "Untitled"}
                        </h3>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-blue-700 text-sm font-mono break-all">
                                {shortUrl}
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-3 gap-3">
                        <button
                            onClick={handleDownload}
                            className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 group"
                        >
                            <Download size={20} className="text-gray-600 mb-2 group-hover:text-blue-600" />
                            <span className="text-sm text-gray-700 group-hover:text-blue-700 font-medium">Download</span>
                        </button>

                        <button
                            onClick={handleCopy}
                            className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-xl hover:bg-green-50 hover:border-green-300 transition-all duration-200 group"
                        >
                            <Copy size={20} className="text-gray-600 mb-2 group-hover:text-green-600" />
                            <span className="text-sm text-gray-700 group-hover:text-green-700 font-medium">Copy Link</span>
                        </button>

                        <button
                            onClick={handleShare}
                            className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-xl hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 group"
                        >
                            <Share2 size={20} className="text-gray-600 mb-2 group-hover:text-purple-600" />
                            <span className="text-sm text-gray-700 group-hover:text-purple-700 font-medium">Share</span>
                        </button>
                    </div>

                    {/* Notification */}
                    {notification && (
                        <div className="mt-4 bg-green-50 border-2 border-green-200 rounded-xl p-3 text-green-700 text-sm font-medium animate-fade-in">
                            {notification}
                        </div>
                    )}

                    {/* Hint text */}
                    <p className="text-xs text-gray-500 mt-4">
                        Click outside or press ESC to close
                    </p>
                </div>
            </div>
        </div>
    );
};

export default QRCodeModal