import React, { useState, useCallback } from "react";
import Loader from "../components/loader";
import { shortenUrl } from "../api/urlService";
import UrlShortener from "@/components/UrlShortener";
import LinkHistoryTable from "@/components/LinkHistoryTable";

const HomePage = () => {
    const [longUrl, setLongUrl] = useState("");
    const [shortUrl, setShortUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setLongUrl(e.target.value);
        },
        []
    );

    const handleShorten = useCallback(async () => {
        if (!longUrl) return;
        setLoading(true);
        const result = await shortenUrl(longUrl);
        setShortUrl(result);
        setLoading(false);
    }, [longUrl]);

    const handleCopy = () => {
        navigator.clipboard.writeText(shortUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleReset = () => {
        setLongUrl("");
        setShortUrl("");
        setCopied(false);
    };

    return (
        <>
            <UrlShortener />
        </>
    );
};

export default HomePage;
