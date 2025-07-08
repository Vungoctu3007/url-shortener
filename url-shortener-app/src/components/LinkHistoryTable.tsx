import React, { useEffect, useState } from "react";
import api from "@/axios/axiosInstance";
import {
    DocumentDuplicateIcon,
    QrCodeIcon,
    PencilIcon,
    TrashIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthProvider";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface HistoryItem {
    id: number;
    shortLink: string;
    originalLink: string;
    qrCode: string;
    clicks: number;
    status: "Active" | "Inactive";
    date: string;
}

const HistoryTable: React.FC = () => {
    const [data, setData] = useState<HistoryItem[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [perPage, setPerPage] = useState(5);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const user = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get("/links", {
                    params: {
                        user_id: user.user?.id,
                        perpage: perPage,
                        page: currentPage,
                        active: 1,
                        sort: `created_at,${sortOrder}`,
                    },
                });

                const items = res.data?.data?.data || [];
                setTotalPages(res.data?.data?.last_page || 1);

                const mapped = items.map((item: any) => ({
                    id: item.id,
                    shortLink: `http://localhost:5173/${item.slug}`,
                    originalLink: item.target,
                    qrCode: item.qr_url,
                    clicks: item.clicks,
                    status: item.deleted_at ? "Inactive" : "Active",
                    date: new Date(item.created_at).toLocaleDateString(
                        "en-US",
                        {
                            year: "numeric",
                            month: "short",
                            day: "2-digit",
                        }
                    ),
                }));

                setData(mapped);
            } catch (error) {
                console.error("Failed to fetch links", error);
            }
        };

        if (user.user?.id) fetchData();
    }, [user.user?.id, currentPage, perPage, sortOrder]);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("Copied to clipboard!");
    };

    return (
        <div className="w-full p-4 bg-white shadow rounded-md">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
                <h2 className="text-xl font-semibold text-gray-800">
                    History ({data.length}) - Page {currentPage}/{totalPages}
                </h2>
                <div className="flex gap-4 items-center">
                    <div>
                        <Label className="text-sm text-gray-600">
                            Per Page
                        </Label>
                        <Select
                            value={String(perPage)}
                            onValueChange={(v) => {
                                setPerPage(Number(v));
                                setCurrentPage(1);
                            }}
                        >
                            <SelectTrigger className="w-[100px]">
                                <SelectValue placeholder="Per Page" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="5">5</SelectItem>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label className="text-sm text-gray-600">Sort</Label>
                        <Select
                            value={sortOrder}
                            onValueChange={(v) => {
                                setSortOrder(v as "asc" | "desc");
                                setCurrentPage(1);
                            }}
                        >
                            <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Sort" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="asc">
                                    Oldest First
                                </SelectItem>
                                <SelectItem value="desc">
                                    Newest First
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <div className="hidden md:block overflow-x-auto">
                <table className="w-full table-auto text-sm whitespace-nowrap">
                    <thead className="bg-gray-100 text-gray-500">
                        <tr>
                            <th className="p-4 w-[22%]">Short Link</th>
                            <th className="p-4 w-[28%]">Original Link</th>
                            <th className="p-4 text-center">QR Code</th>
                            <th className="p-4 text-center">Clicks</th>
                            <th className="p-4 text-center">Status</th>
                            <th className="p-4 text-center">Date</th>
                            <th className="p-4 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item) => (
                            <tr
                                key={item.id}
                                className="border-b border-gray-200 hover:bg-gray-50 transition"
                            >
                                <td className="p-4 max-w-[200px] break-words">
                                    <div className="flex items-center gap-2">
                                        <span className="truncate">
                                            {item.shortLink}
                                        </span>
                                        <DocumentDuplicateIcon
                                            className="w-5 h-5 text-blue-500 cursor-pointer"
                                            onClick={() =>
                                                handleCopy(item.shortLink)
                                            }
                                        />
                                    </div>
                                </td>
                                <td className="p-4 max-w-[280px] break-words truncate">
                                    {item.originalLink}
                                </td>
                                <td className="p-4 text-center">
                                    <a
                                        href={item.qrCode}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <QrCodeIcon className="w-5 h-5 mx-auto text-gray-500" />
                                    </a>
                                </td>
                                <td className="p-4 text-center">
                                    {item.clicks}
                                </td>
                                <td className="p-4 text-center">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                            item.status === "Active"
                                                ? "bg-green-500 text-white"
                                                : "bg-yellow-500 text-white"
                                        }`}
                                    >
                                        {item.status}
                                    </span>
                                </td>
                                <td className="p-4 text-center">{item.date}</td>
                                <td className="p-4 flex justify-center gap-3">
                                    <PencilIcon className="w-5 h-5 text-blue-400 cursor-pointer" />
                                    <TrashIcon className="w-5 h-5 text-red-400 cursor-pointer" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="block md:hidden space-y-4 mt-4">
                {data.map((item) => (
                    <div
                        key={item.id}
                        className="p-4 bg-gray-50 rounded-xl shadow border border-gray-200"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="font-semibold text-sm text-gray-700 break-words">
                                {item.shortLink}
                            </span>
                            <DocumentDuplicateIcon
                                className="w-5 h-5 text-blue-500 cursor-pointer"
                                onClick={() => handleCopy(item.shortLink)}
                            />
                        </div>
                        <div className="text-xs text-gray-500 mb-3 break-words">
                            {item.originalLink}
                        </div>
                        <div className="flex justify-between items-center text-sm text-gray-700 mb-2">
                            <div className="flex items-center gap-1">
                                <QrCodeIcon className="w-4 h-4" />
                                <span>{item.clicks} clicks</span>
                            </div>
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    item.status === "Active"
                                        ? "bg-green-500 text-white"
                                        : "bg-yellow-500 text-white"
                                }`}
                            >
                                {item.status}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-gray-500">
                            <span>{item.date}</span>
                            <div className="flex gap-3">
                                <PencilIcon className="w-5 h-5 text-blue-400 cursor-pointer" />
                                <TrashIcon className="w-5 h-5 text-red-400 cursor-pointer" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-center mt-6">
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                className="cursor-pointer"
                                onClick={() =>
                                    setCurrentPage((prev) =>
                                        Math.max(prev - 1, 1)
                                    )
                                }
                            />
                        </PaginationItem>
                        {Array.from(
                            { length: totalPages },
                            (_, i) => i + 1
                        ).map((page) => (
                            <PaginationItem key={page}>
                                <PaginationLink
                                    className="cursor-pointer"
                                    isActive={page === currentPage}
                                    onClick={() => setCurrentPage(page)}
                                >
                                    {page}
                                </PaginationLink>
                            </PaginationItem>
                        ))}
                        <PaginationItem>
                            <PaginationNext
                                className="cursor-pointer"
                                onClick={() =>
                                    setCurrentPage((prev) =>
                                        Math.min(prev + 1, totalPages)
                                    )
                                }
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </div>
    );
};

export default HistoryTable;
