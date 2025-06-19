import React from "react";
import { GlobeAltIcon, DevicePhoneMobileIcon, CalendarDaysIcon, UserIcon, ArrowTrendingUpIcon } from "@heroicons/react/24/outline";

interface ClickData {
  time: string;
  country: string;
  browser: string;
  device: string;
  referrer: string;
}

const mockClicks: ClickData[] = [
  { time: "2025-06-13 10:45", country: "🇻🇳 Việt Nam", browser: "Chrome", device: "Desktop", referrer: "Google" },
  { time: "2025-06-13 11:02", country: "🇺🇸 USA", browser: "Firefox", device: "Mobile", referrer: "Facebook" },
  { time: "2025-06-13 12:15", country: "🇯🇵 Japan", browser: "Safari", device: "Mobile", referrer: "Twitter" },
  { time: "2025-06-13 13:30", country: "🇩🇪 Germany", browser: "Edge", device: "Desktop", referrer: "LinkedIn" },
];

const ClickStream: React.FC = () => {
  return (
    <div className="p-6 bg-white dark:bg-[#121623] rounded-lg shadow transition-colors">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
        <ArrowTrendingUpIcon className="w-6 h-6 text-blue-500" /> Click Stream
      </h2>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-300">
          <thead className="text-xs uppercase bg-gray-100 dark:bg-[#1a1e2e] text-gray-600 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Country</th>
              <th className="px-4 py-3">Browser</th>
              <th className="px-4 py-3">Device</th>
              <th className="px-4 py-3">Referrer</th>
            </tr>
          </thead>
          <tbody>
            {mockClicks.map((click, idx) => (
              <tr key={idx} className="border-b dark:border-[#2e3446]">
                <td className="px-4 py-3">{click.time}</td>
                <td className="px-4 py-3">{click.country}</td>
                <td className="px-4 py-3">{click.browser}</td>
                <td className="px-4 py-3">{click.device}</td>
                <td className="px-4 py-3">{click.referrer}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClickStream;
