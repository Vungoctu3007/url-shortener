import React, { useState } from "react";
import {
    ArrowDownTrayIcon,
    FunnelIcon,
    CalendarIcon,
    ChevronDownIcon,
} from "@heroicons/react/24/outline";

import { Popover } from "@headlessui/react";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
} from "recharts";

const clicksData = [
    { date: "06/10", clicks: 15 },
    { date: "06/11", clicks: 18 },
    { date: "06/12", clicks: 25 },
    { date: "06/13", clicks: 40 },
    { date: "06/14", clicks: 30 },
    { date: "06/15", clicks: 38 },
    { date: "06/16", clicks: 20 },
    { date: "06/17", clicks: 33 },
    { date: "06/18", clicks: 21 },
    { date: "06/19", clicks: 26 },
    { date: "06/20", clicks: 12 },
    { date: "06/21", clicks: 28 },
    { date: "06/22", clicks: 29 },
    { date: "06/23", clicks: 18 },
    { date: "06/24", clicks: 42 },
    { date: "06/25", clicks: 41 },
    { date: "06/26", clicks: 19 },
    { date: "06/27", clicks: 15 },
    { date: "06/28", clicks: 28 },
    { date: "06/29", clicks: 45 },
];

const devicesData = [
    { name: "Desktop", value: 146 },
    { name: "E-Reader", value: 101 },
    { name: "Tablet", value: 70 },
    { name: "Mobile", value: 50 },
    { name: "Unknown", value: 14 },
];

const referrerData = [
    { name: "LinkedIn", value: 40 },
    { name: "Facebook", value: 6 },
    { name: "Google", value: 20 },
    { name: "Twitter", value: 7 },
    { name: "Bitly", value: 14 },
    { name: "Direct", value: 9 },
    { name: "Other", value: 5 },
];

const COLORS = [
    "#0ea5e9",
    "#06b6d4",
    "#3b82f6",
    "#6366f1",
    "#f97316",
    "#a3e635",
    "#ec4899",
];

const Statistics: React.FC = () => {
    const [startDate, setStartDate] = useState(new Date("2025-06-29"));
    const [endDate, setEndDate] = useState(new Date("2025-07-05"));
    const [deviceFilter, setDeviceFilter] = useState("All");
    const [referrerFilter, setReferrerFilter] = useState("All");

    return (
        <div className="p-6 max-w-7xl mx-auto w-full">
            <h2 className="text-3xl font-bold mb-6 text-left bg-gradient-to-r from-pink-500 to-blue-500 text-transparent bg-clip-text">
                URL Statistics
            </h2>

            {/* Filters row */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
                <div className="flex items-center border border-gray-300 rounded-sm px-3 py-2 text-sm text-gray-600 bg-white">
                    <CalendarIcon className="w-4 h-4 text-gray-500 mr-2" />
                    <DatePicker
                        selected={startDate}
                        onChange={(date: Date | null) =>
                            date && setStartDate(date)
                        }
                        selectsStart
                        startDate={startDate}
                        endDate={endDate}
                        dateFormat="MM/dd/yyyy"
                        className="outline-none bg-transparent w-[100px]"
                    />
                    <span className="mx-1 text-gray-400">→</span>
                    <DatePicker
                        selected={endDate}
                        onChange={(date: Date | null) =>
                            date && setEndDate(date)
                        }
                        selectsEnd
                        startDate={startDate}
                        endDate={endDate}
                        minDate={startDate}
                        dateFormat="MM/dd/yyyy"
                        className="outline-none bg-transparent w-[100px]"
                    />
                    <button
                        onClick={() => {
                            setStartDate(new Date("2025-06-29"));
                            setEndDate(new Date("2025-07-05"));
                        }}
                        className="ml-2 text-gray-400 hover:text-gray-600"
                    >
                        ×
                    </button>
                </div>

                {/* Add filters button */}

                <Popover className="relative">
                    <Popover.Button className="flex items-center gap-2 px-4 py-[6px] bg-white border border-gray-300 rounded-sm shadow-sm hover:bg-gray-50 transition text-sm text-gray-600 font-medium">
                        <FunnelIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">Add filters</span>
                    </Popover.Button>

                    <Popover.Panel className="absolute z-10 mt-2 right-0 w-[260px] bg-white border border-gray-200 rounded-xl shadow-xl p-4 text-sm space-y-5">
                        <div className="space-y-1">
                            <label className="text-gray-600 font-medium">
                                Device
                            </label>
                            <div className="relative">
                                <select
                                    value={deviceFilter}
                                    onChange={(e) =>
                                        setDeviceFilter(e.target.value)
                                    }
                                    className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                >
                                    <option value="All">All Devices</option>
                                    <option value="Desktop">Desktop</option>
                                    <option value="Mobile">Mobile</option>
                                    <option value="Tablet">Tablet</option>
                                    <option value="E-Reader">E-Reader</option>
                                    <option value="Unknown">Unknown</option>
                                </select>
                                <ChevronDownIcon className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-gray-600 font-medium">
                                Referrer
                            </label>
                            <div className="relative">
                                <select
                                    value={referrerFilter}
                                    onChange={(e) =>
                                        setReferrerFilter(e.target.value)
                                    }
                                    className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                >
                                    <option value="All">All Referrers</option>
                                    <option value="Facebook">Facebook</option>
                                    <option value="LinkedIn">LinkedIn</option>
                                    <option value="Google">Google</option>
                                    <option value="Twitter">Twitter</option>
                                    <option value="Direct">Direct</option>
                                    <option value="Other">Other</option>
                                </select>
                                <ChevronDownIcon className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                            </div>
                        </div>

                        <div className="flex justify-end pt-1">
                            <button
                                onClick={() => {
                                    setDeviceFilter("All");
                                    setReferrerFilter("All");
                                }}
                                className="text-sm text-blue-600 font-medium hover:underline"
                            >
                                Clear filters
                            </button>
                        </div>
                    </Popover.Panel>
                </Popover>
            </div>
            <div className="border-b border-gray-300 mb-6" />

            {/* Layout chia 2 cột */}
            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col gap-6 w-full md:w-1/2">
                    <StatBox
                        title="Top performing date by clicks + scans"
                        subtitle="June 29, 2025"
                        value="45 Clicks + scans"
                        note="Jun 29 - Jul 5, 2025"
                    />
                    <LineChartBox />
                    <StatBox
                        title="Top performing location by clicks + scans"
                        subtitle="United States & United Kingdom"
                    />
                </div>
                <div className="flex flex-col gap-6 w-full md:w-1/2">
                    <DevicePieChart />
                    <ReferrerBarChart />
                </div>
            </div>
        </div>
    );
};
const StatBox: React.FC<{
    title: string;
    subtitle: string;
    value?: string;
    note?: string;
}> = ({ title, subtitle, value, note }) => (
    <div className="bg-white p-6 rounded-xl shadow border border-gray-200 w-full text-center">
        <div className="text-sm font-semibold text-gray-600 mb-1">{title}</div>
        <div className="text-xl font-bold text-gray-800 mb-1">{subtitle}</div>
        {value && (
            <div className="text-blue-600 font-medium text-sm mb-1">
                {value}
            </div>
        )}
        {note && <div className="text-xs text-gray-400">{note}</div>}
    </div>
);

const LineChartBox = ({ className = "" }) => (
    <div
        className={`bg-white p-6 rounded-xl shadow border border-gray-200 w-full ${className}`}
    >
        <div className="flex justify-between mb-2">
            <h3 className="text-lg font-semibold">Clicks + scans over time</h3>
            <ArrowDownTrayIcon className="w-5 h-5 text-gray-500" />
        </div>
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={clicksData}>
                <XAxis
                    dataKey="date"
                    stroke="#888"
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                />
                <YAxis stroke="#888" fontSize={12} />
                <Tooltip
                    contentStyle={{
                        backgroundColor: "white",
                        borderRadius: 8,
                        borderColor: "#ddd",
                    }}
                    formatter={(value: number) => [
                        `${value}`,
                        "Clicks + scans",
                    ]}
                    labelFormatter={(label) => `Date: ${label}`}
                />
                <Line
                    type="monotone"
                    dataKey="clicks"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                />
            </LineChart>
        </ResponsiveContainer>
    </div>
);

const DevicePieChart = () => {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const total = devicesData.reduce((acc, item) => acc + item.value, 0);

    const renderCustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white shadow-md p-2 rounded border text-sm text-gray-800">
                    <strong>{payload[0].name}</strong>: {payload[0].value}{" "}
                    clicks
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow border border-gray-200 w-full">
            <div className="flex justify-between mb-4">
                <h3 className="text-lg font-semibold">
                    Clicks + scans by device
                </h3>
                <ArrowDownTrayIcon className="w-5 h-5 text-gray-500" />
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-1/2 h-[300px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={devicesData}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={100}
                                dataKey="value"
                                onMouseEnter={(_, index) =>
                                    setActiveIndex(index)
                                }
                                onMouseLeave={() => setActiveIndex(null)}
                            >
                                {devicesData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={renderCustomTooltip} />
                        </PieChart>
                    </ResponsiveContainer>

                    <div className="absolute top-[calc(50%-1.5rem)] left-1/2 transform -translate-x-1/2 text-center pointer-events-none">
                        <div className="text-xl font-bold text-gray-900">
                            {activeIndex !== null
                                ? devicesData[activeIndex].value
                                : total}
                        </div>
                        <div className="text-sm text-gray-500">
                            {activeIndex !== null
                                ? devicesData[activeIndex].name
                                : "Clicks + Scans"}
                        </div>
                    </div>
                </div>

                <ul className="w-full md:w-1/2 mt-2 md:mt-0 space-y-2 text-sm text-gray-600">
                    {devicesData.map((d, idx) => (
                        <li
                            key={d.name}
                            className="flex items-center justify-between"
                        >
                            <div className="flex items-center gap-2">
                                <span
                                    className="inline-block w-3 h-3 rounded-full"
                                    style={{
                                        backgroundColor:
                                            COLORS[idx % COLORS.length],
                                    }}
                                />
                                {d.name}
                            </div>
                            <span>{d.value}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

const ReferrerBarChart = () => (
    <div className="bg-white p-6 rounded-xl shadow border border-gray-200 w-full">
        <div className="flex justify-between mb-2">
            <h3 className="text-lg font-semibold">
                Clicks + scans by referrer
            </h3>
            <ArrowDownTrayIcon className="w-5 h-5 text-gray-500" />
        </div>
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={referrerData}>
                <XAxis dataKey="name" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    </div>
);

export default Statistics;
