import React from "react";
import {
  DocumentDuplicateIcon,
  QrCodeIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

type HistoryItem = {
  id: number;
  shortLink: string;
  originalLink: string;
  clicks: number;
  status: "Active" | "Inactive";
  date: string;
};

const mockData: HistoryItem[] = [
  {
    id: 1,
    shortLink: "https://linkly.com/Bn41aCOlnx",
    originalLink: "https://twitter.com/tweets/8ereICoihu",
    clicks: 1313,
    status: "Active",
    date: "Oct - 10 - 2023",
  },
  {
    id: 2,
    shortLink: "https://linkly.com/Bn41aCOlnx",
    originalLink: "https://www.youtube.com/watch?v=8JZ7mH0lXuk",
    clicks: 4313,
    status: "Inactive",
    date: "Oct - 08 - 2023",
  },
];

const HistoryTable: React.FC = () => {
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="w-full p-4 bg-white dark:bg-[#0b0e17] shadow">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
        History (143)
      </h2>

      {/* Desktop View */}
      <div className="hidden md:block">
        <table className="w-full text-left text-sm">
          <thead className="uppercase bg-gray-100 dark:bg-[#121623] text-gray-500 dark:text-gray-400">
            <tr>
              <th className="p-4 w-[22%]">Short Link</th>
              <th className="p-4 w-[28%]">Original Link</th>
              <th className="p-4 w-[10%] text-center">QR Code</th>
              <th className="p-4 w-[10%] text-center">Clicks</th>
              <th className="p-4 w-[10%] text-center">Status</th>
              <th className="p-4 w-[10%] text-center">Date</th>
              <th className="p-4 w-[10%] text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {mockData.map((item) => (
              <tr
                key={item.id}
                className="border-b border-gray-200 dark:border-[#2e3446] hover:bg-gray-50 dark:hover:bg-[#1a1f2e] transition"
              >
                <td className="p-4 break-all flex items-center gap-2">
                  <span className="truncate">{item.shortLink}</span>
                  <DocumentDuplicateIcon
                    className="w-5 h-5 text-blue-500 cursor-pointer"
                    onClick={() => handleCopy(item.shortLink)}
                  />
                </td>

                <td className="p-4 break-all">{item.originalLink}</td>

                <td className="p-4 text-center">
                  <QrCodeIcon className="w-5 h-5 mx-auto text-gray-500 dark:text-gray-300" />
                </td>

                <td className="p-4 text-center">{item.clicks}</td>

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

                <td className="p-4 flex justify-center gap-4">
                  <PencilIcon className="w-5 h-5 text-blue-400 cursor-pointer" />
                  <TrashIcon className="w-5 h-5 text-red-400 cursor-pointer" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="block md:hidden space-y-4">
        {mockData.map((item) => (
          <div
            key={item.id}
            className="p-4 bg-gray-50 dark:bg-[#121623] rounded-xl shadow border border-gray-200 dark:border-[#2e3446] transition"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-sm text-gray-700 dark:text-white">
                {item.shortLink}
              </span>
              <DocumentDuplicateIcon
                className="w-5 h-5 text-blue-500 cursor-pointer"
                onClick={() => handleCopy(item.shortLink)}
              />
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-300 mb-3">
              {item.originalLink}
            </div>

            <div className="flex justify-between items-center text-sm text-gray-700 dark:text-gray-300 mb-2">
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

            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
              <span>{item.date}</span>
              <div className="flex gap-3">
                <PencilIcon className="w-5 h-5 text-blue-400 cursor-pointer" />
                <TrashIcon className="w-5 h-5 text-red-400 cursor-pointer" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryTable;
