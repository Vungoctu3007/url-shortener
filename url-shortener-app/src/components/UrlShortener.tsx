import React, { useState } from "react";
import {
    PaperAirplaneIcon,
    LinkIcon,
    CheckCircleIcon,
    ClipboardIcon,
    ArrowDownTrayIcon,
    ShareIcon,
    QrCodeIcon,
} from "@heroicons/react/24/outline";
import {
    FacebookShareButton,
    FacebookIcon,
    TwitterShareButton,
    TwitterIcon,
    LinkedinShareButton,
    LinkedinIcon,
    RedditShareButton,
    RedditIcon,
    TelegramShareButton,
    TelegramIcon,
} from "react-share";
import clsx from "clsx";
import { useAuth } from "@/contexts/AuthProvider";
import { shortenUrl } from "@/api/urlService";

const UrlShortener: React.FC = () => {
    const { user } = useAuth();
    const [url, setUrl] = useState("");
    const [slug, setSlug] = useState("");
    const [qrUrl, setQrUrl] = useState("");
    const [shortUrl, setShortUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showQR, setShowQR] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [errors, setErrors] = useState<{ target?: string; slug?: string }>(
        {}
    );

    const handleShorten = async () => {
        setLoading(true);
        setShortUrl("");
        setShowQR(false);
        setErrors({});

        try {
            const result = await shortenUrl(url, slug, user?.id);
            setShortUrl(result.shortUrl);
            setQrUrl(result.qrUrl);
        } catch (err: any) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors || {});
            } else {
                console.error(err);
                setErrors({
                    target: "Failed to shorten the URL. Please try again.",
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(shortUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // Reset sau 2 giây
        });
    };

    return (
        <div className="flex flex-col items-center justify-center py-10 px-4 md:px-8 bg-white transition-colors">
            <h1 className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-pink-500 to-blue-500 text-transparent bg-clip-text text-center mb-5">
                Shorten Your Long Links
            </h1>
            <p className="text-gray-600 mb-10 text-center max-w-2xl">
                Linkly is an efficient and easy-to-use URL shortening service.
            </p>

            <div className="flex flex-col md:flex-row w-full max-w-3xl gap-3 md:gap-4">
                {/* URL input */}
                <div className="flex flex-col w-full md:flex-[2]">
                    <div
                        className={clsx(
                            "flex items-center px-4 py-2 rounded-xl transition-colors bg-gray-100 border",
                            errors.target ? "border-red-500" : "border-gray-300"
                        )}
                    >
                        <LinkIcon className="w-5 h-5 text-gray-400 mr-2 hidden md:block" />
                        <input
                            type="text"
                            placeholder="Enter the link here"
                            className="w-full bg-transparent text-gray-900 focus:outline-none text-sm md:text-base"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                    </div>
                    <div className="min-h-[1.25rem] mt-1 px-1">
                        {errors.target && (
                            <p className="text-red-500 text-xs">{errors.target}</p>
                        )}
                    </div>
                </div>

                {/* Slug input */}
                <div className="flex flex-col w-full md:flex-[1]">
                    <div
                        className={clsx(
                            "flex items-center px-4 py-2 rounded-xl transition-colors bg-gray-100 border",
                            errors.slug ? "border-red-500" : "border-gray-300"
                        )}
                    >
                        <input
                            type="text"
                            placeholder="Custom alias (optional)"
                            className="w-full bg-transparent text-gray-900 focus:outline-none text-sm md:text-base"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                        />
                    </div>
                    <div className="min-h-[1.25rem] mt-1 px-1">
                        {errors.slug && (
                            <p className="text-red-500 text-xs">{errors.slug}</p>
                        )}
                    </div>
                </div>

                {/* Submit button */}
                <button
                    onClick={handleShorten}
                    className={clsx(
                        "h-[44px] w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 sm:px-6 rounded-xl transition-all",
                        loading && "opacity-70 cursor-not-allowed"
                    )}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <svg
                                className="w-5 h-5 animate-spin"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="white"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="white"
                                    d="M4 12a8 8 0 018-8v8z"
                                />
                            </svg>
                            <span className="hidden sm:inline">Shortening...</span>
                        </>
                    ) : (
                        <>
                            <span className="hidden sm:inline">Shorten Now!</span>
                            <PaperAirplaneIcon className="w-5 h-5 rotate-90" />
                        </>
                    )}
                </button>
            </div>

            {/* Result section */}
            {shortUrl && (
                <div className="mt-8 flex flex-col items-center gap-4 bg-gray-100 text-gray-900 px-6 py-4 rounded-lg shadow transition-colors max-w-xl w-full">
                    <div className="flex items-center gap-3">
                        <CheckCircleIcon className="w-6 h-6 text-green-500" />
                        <a
                            href={shortUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline break-words"
                        >
                            {shortUrl}
                        </a>
                    </div>

                    <div className="flex gap-3 justify-center relative">
                        <button
                            onClick={() => setShowQR(!showQR)}
                            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
                        >
                            <QrCodeIcon className="w-5 h-5" />
                        </button>

                        <button
                            onClick={handleCopy}
                            className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition"
                        >
                            {copied ? (
                                <CheckCircleIcon className="w-5 h-5 text-white" />
                            ) : (
                                <ClipboardIcon className="w-5 h-5 text-white" />
                            )}
                        </button>

                        {/* Share Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="p-2 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition"
                            >
                                <ShareIcon className="w-5 h-5" />
                            </button>

                            {showDropdown && (
                                <div className="absolute top-12 right-0 z-10 bg-white p-2 rounded-lg shadow-md border w-48 flex flex-col gap-2">
                                    <FacebookShareButton url={shortUrl}>
                                        <div className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded-md">
                                            <FacebookIcon size={24} round />
                                            <span className="text-sm">
                                                Facebook
                                            </span>
                                        </div>
                                    </FacebookShareButton>

                                    <TwitterShareButton url={shortUrl}>
                                        <div className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded-md">
                                            <TwitterIcon size={24} round />
                                            <span className="text-sm">
                                                Twitter
                                            </span>
                                        </div>
                                    </TwitterShareButton>

                                    <LinkedinShareButton url={shortUrl}>
                                        <div className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded-md">
                                            <LinkedinIcon size={24} round />
                                            <span className="text-sm">
                                                LinkedIn
                                            </span>
                                        </div>
                                    </LinkedinShareButton>

                                    <RedditShareButton url={shortUrl}>
                                        <div className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded-md">
                                            <RedditIcon size={24} round />
                                            <span className="text-sm">Reddit</span>
                                        </div>
                                    </RedditShareButton>

                                    <TelegramShareButton url={shortUrl}>
                                        <div className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded-md">
                                            <TelegramIcon size={24} round />
                                            <span className="text-sm">
                                                Telegram
                                            </span>
                                        </div>
                                    </TelegramShareButton>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => alert("Simulate download QR")}
                            className="p-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition"
                        >
                            <ArrowDownTrayIcon className="w-5 h-5" />
                        </button>
                    </div>

                    {showQR && qrUrl && (
                        <img
                            src={qrUrl}
                            alt="QR Code"
                            className="w-52 h-52 object-contain"
                        />
                    )}
                </div>
            )}
        </div>
    );

};

export default UrlShortener;

