import React from "react";
import {
  GlobeAltIcon,
  CursorArrowRaysIcon,
  DevicePhoneMobileIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const clicksData = [
  { date: "Jun 1", clicks: 24 },
  { date: "Jun 2", clicks: 12 },
  { date: "Jun 3", clicks: 31 },
  { date: "Jun 4", clicks: 10 },
  { date: "Jun 5", clicks: 22 },
];

const devicesData = [
  { name: "Mobile", value: 60 },
  { name: "Desktop", value: 30 },
  { name: "Tablet", value: 10 },
];

const COLORS = ["#3b82f6", "#10b981", "#f59e0b"];

const Statistics: React.FC = () => {
  return (
    <div className="p-6 max-w-5xl mx-auto w-full">
      <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-pink-500 to-blue-500 text-transparent bg-clip-text">
        URL Statistics
      </h2>

      {/* Tổng quan */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <StatCard title="Total Clicks" value="3,428" icon={<CursorArrowRaysIcon className="w-8 h-8 text-blue-500" />} />
        <StatCard title="Unique Visitors" value="2,145" icon={<GlobeAltIcon className="w-8 h-8 text-green-500" />} />
        <StatCard title="Devices" value="3 Types" icon={<DevicePhoneMobileIcon className="w-8 h-8 text-yellow-500" />} />
        <StatCard title="Top Referrers" value="Google" icon={<ChartBarIcon className="w-8 h-8 text-purple-500" />} />
      </div>

      {/* Biểu đồ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Clicks over time */}
        <div className="bg-white dark:bg-[#121623] p-6 rounded-xl shadow border border-gray-200 dark:border-[#2e3446]">
          <h3 className="text-xl font-semibold mb-4">Clicks Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={clicksData}>
              <XAxis dataKey="date" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip />
              <Bar dataKey="clicks" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Devices Pie */}
        <div className="bg-white dark:bg-[#121623] p-6 rounded-xl shadow border border-gray-200 dark:border-[#2e3446]">
          <h3 className="text-xl font-semibold mb-4">Device Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={devicesData} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" dataKey="value" label>
                {devicesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
  <div className="bg-white dark:bg-[#121623] p-5 rounded-xl flex items-center gap-4 shadow border border-gray-200 dark:border-[#2e3446]">
    <div className="p-3 rounded-full bg-gray-100 dark:bg-[#1f273a]">{icon}</div>
    <div>
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  </div>
);

export default Statistics;
