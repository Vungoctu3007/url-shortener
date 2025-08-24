import React from "react";
import { CalendarIcon, TagIcon } from "@heroicons/react/24/outline";
import { Copy, Share2, Pencil, MoreHorizontal } from "lucide-react";
import dayjs from "dayjs";

interface Props {
    title: string;
    shortUrl: string;
    originalUrl: string;
    createdAt: string;
    tags: string[];
}

const DetailHeader: React.FC<Props> = ({
    title,
    shortUrl,
    originalUrl,
    createdAt,
    tags,
}) => {
    return (
        <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
            <div className="text-sm text-blue-600 mb-4 cursor-pointer">
                ← Back to list
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                    {/* Favicon or Icon */}
                    <div className="w-16 h-16 rounded-full border-2 border-gray-300 p-2">
                        <img
                            src="https://www.youtube.com/s/desktop/6b4c5092/img/favicon.ico"
                            alt="Favicon"
                            className="w-full h-full object-contain"
                        />
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {title}
                        </h1>
                        <a
                            href={`https://${shortUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 font-medium hover:underline"
                        >
                            {shortUrl}
                        </a>
                        <p className="text-gray-600 text-sm mt-1">
                            {originalUrl}
                        </p>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 self-start md:self-center">
                    <button className="flex items-center gap-1 border px-3 py-1.5 rounded-md text-sm text-gray-700 hover:bg-gray-50">
                        <Copy className="w-4 h-4" /> Copy
                    </button>
                    <button className="flex items-center gap-1 border px-3 py-1.5 rounded-md text-sm text-gray-700 hover:bg-gray-50">
                        <Share2 className="w-4 h-4" /> Share
                    </button>
                    <button className="flex items-center gap-1 border px-3 py-1.5 rounded-md text-sm text-gray-700 hover:bg-gray-50">
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button className="border px-2 py-1.5 rounded-md text-gray-700 hover:bg-gray-50">
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="border-t mt-4 pt-4 flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4" />
                    {dayjs(createdAt).format("MMMM D, YYYY h:mm A [GMT]Z")}
                </div>

                <div className="flex items-center gap-1">
                    <TagIcon className="w-4 h-4" />
                    {tags.length === 0 ? "No tags" : tags.join(", ")}
                </div>
            </div>
        </div>
    );
};

export default DetailHeader;
