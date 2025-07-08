import React, { useEffect, useState, useRef } from "react";
import api from "@/axios/axiosInstance";
import echo from "@/pusher/echo";
import { useAuth } from "@/contexts/AuthProvider";

interface ClickData {
    id: number;
    time: string;
    country: string;
    browser: string;
    device: string;
    referrer: string;
}

const LOCAL_KEY = "clickstream_data";

const ClickStream: React.FC = () => {
    const [clicks, setClicks] = useState<ClickData[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const bottomRef = useRef<HTMLDivElement | null>(null);
    const observer = useRef<IntersectionObserver | null>(null);
    const user = useAuth();

    useEffect(() => {
        const saved = localStorage.getItem(LOCAL_KEY);
        if (saved && saved !== "[]") {
            setClicks(JSON.parse(saved));
        } else {
            fetchInitial();
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(clicks));
    }, [clicks]);

    useEffect(() => {
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore && !loading) {
                fetchMore();
            }
        });

        if (bottomRef.current) observer.current.observe(bottomRef.current);
    }, [clicks, hasMore, loading]);

    useEffect(() => {
        const channel = echo.channel("click-stream");

        const listener = (e: any) => {
            const click = e.redirect;

            const newClick: ClickData = {
                id: click.id,
                time: click.created_at,
                country: click.country || "Unknown",
                browser: parseBrowser(click.user_agent),
                device: parseDevice(click.user_agent),
                referrer: click.referrer || "Direct",
            };

            setClicks((prev) => [newClick, ...prev]);
        };

        channel.listen(".new-click", listener);

        return () => {
            channel.stopListening(".new-click");
            echo.leave("click-stream");
        };
    }, []);

    const fetchInitial = async () => {
        setLoading(true);
        try {
            const res = await api.get("/redirects", { params: { limit: 10, user_id: user.user?.id } });
            const data = formatRedirects(res.data.data);
            setClicks(data);
            setHasMore(data.length === 10);
        } catch (err) {
            console.error("Failed to fetch initial click data", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMore = async () => {
        if (clicks.length === 0) return;
        setLoading(true);
        try {
            const lastId = clicks[clicks.length - 1].id;
            const res = await api.get("/redirects", {
                params: { limit: 10, cursor: lastId, user_id: user.user?.id },
            });
            const data = formatRedirects(res.data.data);
            setClicks((prev) => [...prev, ...data]);
            setHasMore(data.length === 10);
        } catch (err) {
            console.error("Failed to load more data:", err);
        } finally {
            setLoading(false);
        }
    };

    const formatRedirects = (items: any[]): ClickData[] => {
        return items.map((item) => ({
            id: item.id,
            time: item.created_at,
            country: item.country || "Unknown",
            browser: parseBrowser(item.user_agent),
            device: parseDevice(item.user_agent),
            referrer: item.referrer || "Direct",
        }));
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                Click Stream
            </h2>
            <div className="overflow-x-auto max-h-[400px] overflow-y-scroll">
                <table className="min-w-full text-sm text-left text-gray-700 ">
                    <thead className="bg-gray-100 text-xs uppercase sticky top-0">
                        <tr>
                            <th className="px-4 py-2">Time</th>
                            <th className="px-4 py-2">Country</th>
                            <th className="px-4 py-2">Browser</th>
                            <th className="px-4 py-2">Device</th>
                            <th className="px-4 py-2">Referrer</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clicks.map((click) => (
                            <tr
                                key={click.id}
                                className="border-b border-gray-200"
                            >
                                <td className="px-4 py-2">{click.time}</td>
                                <td className="px-4 py-2">{click.country}</td>
                                <td className="px-4 py-2">{click.browser}</td>
                                <td className="px-4 py-2">{click.device}</td>
                                <td className="px-4 py-2">{click.referrer}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div ref={bottomRef}></div>
                {loading && (
                    <p className="text-center mt-3 text-sm text-gray-400">
                        Loading...
                    </p>
                )}
                {!hasMore && (
                    <p className="text-center mt-3 text-sm text-gray-400">
                        No more data
                    </p>
                )}
            </div>
        </div>
    );
};

const parseBrowser = (ua: string): string => {
    if (!ua) return "Unknown";
    if (ua.includes("Chrome")) return "Chrome";
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Safari")) return "Safari";
    return "Unknown";
};

const parseDevice = (ua: string): string => {
    if (!ua) return "Unknown";
    return /Mobi|Android/i.test(ua) ? "Mobile" : "Desktop";
};

export default ClickStream;
