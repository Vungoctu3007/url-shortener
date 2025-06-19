import React, { useState } from "react";
import { PaperAirplaneIcon, LinkIcon, CheckCircleIcon, ClipboardIcon, ArrowDownTrayIcon, ShareIcon, QrCodeIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

const UrlShortener: React.FC = () => {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const handleShorten = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setShortUrl("");
    setShowQR(false);

    setTimeout(() => {
      const fakeShortUrl = "https://lnk.ly/" + Math.random().toString(36).substring(2, 8);
      setShortUrl(fakeShortUrl);
      setLoading(false);
    }, 1500);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    alert("Copied to clipboard!");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Shortened URL',
        url: shortUrl
      }).catch(() => {});
    } else {
      alert("Sharing not supported");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 md:px-8 bg-white dark:bg-[#0b0e17] transition-colors">
      <h1 className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-pink-500 to-blue-500 text-transparent bg-clip-text text-center mb-5">
        Shorten Your Long Links
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-10 text-center max-w-2xl">
        Linkly is an efficient and easy-to-use URL shortening service that streamlines your online experience.
      </p>

      <div className="flex flex-row w-full max-w-3xl bg-gray-100 dark:bg-[#121623] rounded-full shadow-lg overflow-hidden border border-gray-300 dark:border-[#2e3446] transition-colors">
        <div className="px-3 flex items-center">
          <LinkIcon className="w-5 h-5 text-gray-400" />
        </div>

        <input
          type="text"
          placeholder="Enter the link here"
          className="flex-1 bg-transparent text-gray-900 dark:text-white focus:outline-none px-2 py-3 text-sm md:text-base"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        <button
          onClick={handleShorten}
          className={clsx(
            "flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all px-4 sm:px-6 py-3 rounded-none",
            loading && "opacity-70 cursor-not-allowed"
          )}
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              <span className="hidden sm:inline">Shortening...</span>
            </div>
          ) : (
            <>
              <span className="hidden sm:inline">Shorten Now!</span>
              <PaperAirplaneIcon className="w-5 h-5 rotate-90" />
            </>
          )}
        </button>
      </div>

      {shortUrl && (
        <div className="mt-8 flex flex-col items-center gap-4 bg-gray-100 dark:bg-[#121623] text-gray-900 dark:text-white px-6 py-4 rounded-lg shadow transition-colors max-w-xl w-full">
          <div className="flex items-center gap-3">
            <CheckCircleIcon className="w-6 h-6 text-green-500" />
            <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="underline break-words">
              {shortUrl}
            </a>
          </div>

          <div className="flex gap-3 justify-center">
            <button onClick={() => setShowQR(!showQR)} className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition">
              <QrCodeIcon className="w-5 h-5" />
            </button>

            <button onClick={handleCopy} className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition">
              <ClipboardIcon className="w-5 h-5" />
            </button>

            <button onClick={handleShare} className="p-2 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition">
              <ShareIcon className="w-5 h-5" />
            </button>

            <button onClick={() => alert("Simulate download QR")} className="p-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition">
              <ArrowDownTrayIcon className="w-5 h-5" />
            </button>
          </div>

          {showQR && (
            <div className="mt-4 w-52 h-52 flex items-center justify-center bg-white rounded-lg border border-gray-300 shadow-md">
              <span className="text-gray-500">[ QR Code Placeholder ]</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UrlShortener;
