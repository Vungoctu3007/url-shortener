import React, { useState } from "react";
import { X, Download, Copy, Share2 } from "lucide-react";

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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">QR Code</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 text-center">
                    {/* QR Code */}
                    <div className="bg-white border-2 border-gray-200 rounded-lg p-6 mb-6 inline-block">
                        <img
                            src={qrUrl}
                            alt="QR Code"
                            className="w-48 h-48 mx-auto"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const parent = e.currentTarget.parentElement;
                                if (parent) {
                                    parent.innerHTML = '<div class="w-48 h-48 flex items-center justify-center bg-gray-100 text-gray-400">QR Code not available</div>';
                                }
                            }}
                        />
                    </div>

                    {/* Link Info */}
                    <div className="mb-6">
                        <h3 className="font-medium text-gray-900 mb-2">
                            {title || "Untitled"}
                        </h3>
                        <p className="text-blue-600 text-sm font-mono bg-blue-50 px-3 py-2 rounded-lg inline-block">
                            {shortUrl}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-3 gap-3">
                        <button
                            onClick={handleDownload}
                            className="flex flex-col items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <Download size={20} className="text-gray-600 mb-2" />
                            <span className="text-sm text-gray-700">Download</span>
                        </button>

                        <button
                            onClick={handleCopy}
                            className="flex flex-col items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <Copy size={20} className="text-gray-600 mb-2" />
                            <span className="text-sm text-gray-700">Copy Link</span>
                        </button>

                        <button
                            onClick={handleShare}
                            className="flex flex-col items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <Share2 size={20} className="text-gray-600 mb-2" />
                            <span className="text-sm text-gray-700">Share</span>
                        </button>
                    </div>

                    {/* Notification */}
                    {notification && (
                        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm">
                            {notification}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QRCodeModal;
