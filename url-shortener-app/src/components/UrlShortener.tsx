import React, { useState, useEffect } from "react";
import {
    PaperAirplaneIcon,
    LinkIcon,
    CheckCircleIcon,
    ClipboardIcon,
    ArrowDownTrayIcon,
    ShareIcon,
    QrCodeIcon,
    DocumentTextIcon,
    ChartBarIcon,
    GlobeAltIcon,
    SparklesIcon,
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
    const [longUrl, setLongUrl] = useState("");
    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [qrUrl, setQrUrl] = useState("");
    const [shortUrl, setShortUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showQR, setShowQR] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [animateStats, setAnimateStats] = useState(false);
    const [errors, setErrors] = useState<{
        target?: string;
        slug?: string;
        title?: string;
    }>({});

    useEffect(() => {
        setAnimateStats(true);
    }, []);

    const handleShorten = async () => {
        setLoading(true);
        setShortUrl("");
        setShowQR(false);
        setErrors({});

        try {
            const result = await shortenUrl({
                longUrl,
                slug,
                title,
                userId: user?.id,
            });
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
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && longUrl && !loading) {
            handleShorten();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Header with floating animation */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-400/20 to-blue-400/20 animate-pulse"></div>
                <div className="relative flex flex-col items-center justify-center py-16 px-4 md:px-8">
                    <div className="flex items-center gap-3 mb-6 animate-bounce">
                        <SparklesIcon className="w-8 h-8 text-pink-500" />
                        <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-transparent bg-clip-text text-center">
                            Linkly
                        </h1>
                        <SparklesIcon className="w-8 h-8 text-blue-500" />
                    </div>
                    <p className="text-lg md:text-xl text-gray-600 mb-4 text-center max-w-3xl leading-relaxed">
                        Transform your long, messy URLs into clean, shareable
                        links in seconds
                    </p>
                    <p className="text-sm text-gray-500 text-center max-w-2xl">
                        ⚡ Lightning fast • 📊 Analytics included • 🔒 Secure &
                        reliable • 📱 Mobile optimized
                    </p>
                </div>
            </div>

            {/* Main Form */}
            <div className="max-w-4xl mx-auto mt-16 px-4 pb-16 ">
                <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100">
                    <div className="space-y-6">
                        {/* Title input */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <DocumentTextIcon className="w-4 h-4" />
                                Link Title (Optional)
                            </label>
                            <div
                                className={clsx(
                                    "relative overflow-hidden rounded-xl border-2 transition-all duration-200",
                                    errors.title
                                        ? "border-red-300 bg-red-50"
                                        : "border-gray-200 bg-gray-50 focus-within:border-blue-400 focus-within:bg-white"
                                )}
                            >
                                <input
                                    type="text"
                                    placeholder="Give your link a memorable title..."
                                    className="w-full px-4 py-4 bg-transparent text-gray-900 focus:outline-none text-base placeholder-gray-400"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                />
                            </div>
                            {errors.title && (
                                <p className="text-red-500 text-sm flex items-center gap-1">
                                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                    {errors.title}
                                </p>
                            )}
                        </div>

                        {/* URL input */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <LinkIcon className="w-4 h-4" />
                                Long URL *
                            </label>
                            <div
                                className={clsx(
                                    "relative overflow-hidden rounded-xl border-2 transition-all duration-200",
                                    errors.target
                                        ? "border-red-300 bg-red-50"
                                        : "border-gray-200 bg-gray-50 focus-within:border-blue-400 focus-within:bg-white"
                                )}
                            >
                                <input
                                    type="url"
                                    placeholder="https://your-very-long-url-here.com/with/lots/of/parameters"
                                    className="w-full px-4 py-4 bg-transparent text-gray-900 focus:outline-none text-base placeholder-gray-400"
                                    value={longUrl}
                                    onChange={(e) => setLongUrl(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                />
                                {longUrl && (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                    </div>
                                )}
                            </div>
                            {errors.target && (
                                <p className="text-red-500 text-sm flex items-center gap-1">
                                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                    {errors.target}
                                </p>
                            )}
                        </div>

                        {/* Slug input */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                                Custom Alias (Optional)
                            </label>
                            <div className="flex items-center">
                                <span className="px-4 py-4 bg-gray-100 text-gray-600 rounded-l-xl border-2 border-r-0 border-gray-200 text-sm">
                                    link.ly/
                                </span>
                                <div
                                    className={clsx(
                                        "flex-1 relative overflow-hidden rounded-r-xl border-2 border-l-0 transition-all duration-200",
                                        errors.slug
                                            ? "border-red-300 bg-red-50"
                                            : "border-gray-200 bg-gray-50 focus-within:border-blue-400 focus-within:bg-white"
                                    )}
                                >
                                    <input
                                        type="text"
                                        placeholder="my-awesome-link"
                                        className="w-full px-4 py-4 bg-transparent text-gray-900 focus:outline-none text-base placeholder-gray-400"
                                        value={slug}
                                        onChange={(e) =>
                                            setSlug(
                                                e.target.value.replace(
                                                    /[^a-zA-Z0-9-_]/g,
                                                    ""
                                                )
                                            )
                                        }
                                        onKeyPress={handleKeyPress}
                                    />
                                </div>
                            </div>
                            {errors.slug && (
                                <p className="text-red-500 text-sm flex items-center gap-1">
                                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                    {errors.slug}
                                </p>
                            )}
                        </div>

                        {/* Submit button */}
                        <button
                            onClick={handleShorten}
                            className={clsx(
                                "w-full h-14 flex items-center justify-center gap-3 font-bold text-lg rounded-xl transition-all duration-200 transform",
                                loading
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                            )}
                            disabled={loading || !longUrl}
                        >
                            {loading ? (
                                <>
                                    <svg
                                        className="w-6 h-6 animate-spin"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8v8z"
                                        />
                                    </svg>
                                    <span>Creating Magic...</span>
                                </>
                            ) : (
                                <>
                                    <SparklesIcon className="w-6 h-6" />
                                    <span>Shorten My Link!</span>
                                    <PaperAirplaneIcon className="w-6 h-6 rotate-45" />
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Result section */}
                {shortUrl && (
                    <div className="mt-8 animate-fade-in">
                        <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-3xl p-8 shadow-lg">
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full mb-4">
                                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                                    <span className="text-green-800 font-semibold">
                                        Success! Your link is ready
                                    </span>
                                </div>
                                {title && (
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                                        {title}
                                    </h3>
                                )}
                                <a
                                    href={shortUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-2xl font-bold text-blue-600 hover:text-blue-700 underline decoration-2 underline-offset-2 break-all"
                                >
                                    {shortUrl}
                                </a>
                            </div>

                            <div className="flex flex-wrap gap-3 justify-center mb-6">
                                <button
                                    onClick={handleCopy}
                                    className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-all transform hover:scale-105 shadow-lg"
                                >
                                    {copied ? (
                                        <>
                                            <CheckCircleIcon className="w-5 h-5" />
                                            <span>Copied!</span>
                                        </>
                                    ) : (
                                        <>
                                            <ClipboardIcon className="w-5 h-5" />
                                            <span>Copy Link</span>
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={() => setShowQR(!showQR)}
                                    className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all transform hover:scale-105 shadow-lg"
                                >
                                    <QrCodeIcon className="w-5 h-5" />
                                    <span>
                                        {showQR ? "Hide QR" : "Show QR"}
                                    </span>
                                </button>

                                {/* Share Dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() =>
                                            setShowDropdown(!showDropdown)
                                        }
                                        className="flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-all transform hover:scale-105 shadow-lg"
                                    >
                                        <ShareIcon className="w-5 h-5" />
                                        <span>Share</span>
                                    </button>

                                    {showDropdown && (
                                        <div className="absolute top-full mt-2 right-0 z-10 bg-white p-3 rounded-2xl shadow-xl border border-gray-100 w-56">
                                            <div className="grid grid-cols-1 gap-2">
                                                <FacebookShareButton
                                                    url={shortUrl}
                                                >
                                                    <div className="flex items-center gap-3 hover:bg-gray-50 p-3 rounded-xl transition-colors w-full">
                                                        <FacebookIcon
                                                            size={28}
                                                            round
                                                        />
                                                        <span className="font-medium">
                                                            Facebook
                                                        </span>
                                                    </div>
                                                </FacebookShareButton>

                                                <TwitterShareButton
                                                    url={shortUrl}
                                                >
                                                    <div className="flex items-center gap-3 hover:bg-gray-50 p-3 rounded-xl transition-colors w-full">
                                                        <TwitterIcon
                                                            size={28}
                                                            round
                                                        />
                                                        <span className="font-medium">
                                                            Twitter
                                                        </span>
                                                    </div>
                                                </TwitterShareButton>

                                                <LinkedinShareButton
                                                    url={shortUrl}
                                                >
                                                    <div className="flex items-center gap-3 hover:bg-gray-50 p-3 rounded-xl transition-colors w-full">
                                                        <LinkedinIcon
                                                            size={28}
                                                            round
                                                        />
                                                        <span className="font-medium">
                                                            LinkedIn
                                                        </span>
                                                    </div>
                                                </LinkedinShareButton>

                                                <RedditShareButton
                                                    url={shortUrl}
                                                >
                                                    <div className="flex items-center gap-3 hover:bg-gray-50 p-3 rounded-xl transition-colors w-full">
                                                        <RedditIcon
                                                            size={28}
                                                            round
                                                        />
                                                        <span className="font-medium">
                                                            Reddit
                                                        </span>
                                                    </div>
                                                </RedditShareButton>

                                                <TelegramShareButton
                                                    url={shortUrl}
                                                >
                                                    <div className="flex items-center gap-3 hover:bg-gray-50 p-3 rounded-xl transition-colors w-full">
                                                        <TelegramIcon
                                                            size={28}
                                                            round
                                                        />
                                                        <span className="font-medium">
                                                            Telegram
                                                        </span>
                                                    </div>
                                                </TelegramShareButton>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => {
                                        const canvas =
                                            document.createElement("canvas");
                                        const ctx = canvas.getContext("2d");
                                        const img = new Image();
                                        img.onload = () => {
                                            canvas.width = img.width;
                                            canvas.height = img.height;
                                            ctx?.drawImage(img, 0, 0);
                                            const link =
                                                document.createElement("a");
                                            link.download = `qr-code-${Date.now()}.png`;
                                            link.href = canvas.toDataURL();
                                            link.click();
                                        };
                                        img.src = qrUrl;
                                    }}
                                    className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-all transform hover:scale-105 shadow-lg"
                                >
                                    <ArrowDownTrayIcon className="w-5 h-5" />
                                    <span>Download QR</span>
                                </button>
                            </div>

                            {showQR && qrUrl && (
                                <div className="flex justify-center animate-fade-in">
                                    <div className="bg-white p-4 rounded-2xl shadow-lg">
                                        <img
                                            src={qrUrl}
                                            alt="QR Code"
                                            className="w-48 h-48 object-contain"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Features section */}
                <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                        {
                            icon: SparklesIcon,
                            title: "Lightning Fast",
                            description:
                                "Create shortened links in milliseconds with our optimized infrastructure",
                        },
                        {
                            icon: ChartBarIcon,
                            title: "Detailed Analytics",
                            description:
                                "Track clicks, geographic data, and referrer information",
                        },
                        {
                            icon: QrCodeIcon,
                            title: "QR Code Generation",
                            description:
                                "Automatically generate QR codes for all your shortened links",
                        },
                        {
                            icon: ShareIcon,
                            title: "Easy Sharing",
                            description:
                                "Share to all major social platforms with one click",
                        },
                        {
                            icon: LinkIcon,
                            title: "Custom Aliases",
                            description:
                                "Create memorable, branded short links with custom aliases",
                        },
                        {
                            icon: GlobeAltIcon,
                            title: "Global CDN",
                            description:
                                "Fast redirects worldwide with our global content delivery network",
                        },
                    ].map((feature, index) => (
                        <div
                            key={index}
                            className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 transform hover:-translate-y-1"
                        >
                            <div className="p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full w-fit mb-4">
                                <feature.icon className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UrlShortener;
