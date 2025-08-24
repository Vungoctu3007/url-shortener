import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ExternalLink, Globe } from "lucide-react";

interface ReferrerData {
    name: string;
    value: number;
}

interface ReferrerBarChartProps {
    data: ReferrerData[];
}

const ReferrerBarChart: React.FC<ReferrerBarChartProps> = ({ data }) => {
    const getReferrerIcon = (referrer: string) => {
        const iconMap: { [key: string]: string } = {
            'Google': '🔍',
            'Facebook': '📘',
            'Twitter/X': '🐦',
            'LinkedIn': '💼',
            'Instagram': '📷',
            'YouTube': '📺',
            'Direct': '🔗'
        };
        return iconMap[referrer] || '🌐';
    };

    const total = data.reduce((sum, item) => sum + item.value, 0);

    // Sort data by value in descending order and take top 8
    const sortedData = [...data]
        .sort((a, b) => b.value - a.value)
        .slice(0, 8)
        .map(item => ({
            ...item,
            percentage: total > 0 ? ((item.value / total) * 100).toFixed(1) : '0'
        }));

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <div className="flex items-center space-x-2 mb-1">
                        <span className="text-lg">{getReferrerIcon(label)}</span>
                        <span className="font-medium">{label}</span>
                    </div>
                    <p className="text-sm text-gray-600">
                        {data.value} clicks ({data.percentage}%)
                    </p>
                </div>
            );
        }
        return null;
    };

    const CustomXAxisTick = ({ x, y, payload }: any) => {
        const maxLength = 10;
        const text = payload.value.length > maxLength
            ? payload.value.substring(0, maxLength) + '...'
            : payload.value;

        return (
            <g transform={`translate(${x},${y})`}>
                <text
                    x={0}
                    y={0}
                    dy={16}
                    textAnchor="middle"
                    fill="#6b7280"
                    fontSize="12"
                >
                    {text}
                </text>
            </g>
        );
    };

    return (
        <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-lg">
                    <ExternalLink className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Referrer Sources</h3>
                    <p className="text-sm text-gray-600">Where your clicks are coming from</p>
                </div>
            </div>

            {sortedData.length > 0 ? (
                <div>
                    {/* Chart */}
                    <div className="h-64 mb-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={sortedData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="name"
                                    stroke="#6b7280"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tick={<CustomXAxisTick />}
                                    interval={0}
                                />
                                <YAxis
                                    stroke="#6b7280"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    allowDecimals={false}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar
                                    dataKey="value"
                                    fill="#8b5cf6"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Detailed List */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-700 border-b pb-2">
                            Detailed Breakdown
                        </h4>
                        {sortedData.map((item, index) => (
                            <div key={index} className="flex items-center justify-between py-2">
                                <div className="flex items-center space-x-3">
                                    <span className="text-lg">{getReferrerIcon(item.name)}</span>
                                    <span className="text-sm font-medium text-gray-700">
                                        {item.name}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="text-right">
                                        <div className="text-sm font-semibold text-gray-900">
                                            {item.value.toLocaleString()}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {item.percentage}%
                                        </div>
                                    </div>
                                    <div className="w-16 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${item.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                    <div className="text-center">
                        <Globe size={48} className="mx-auto mb-4 text-gray-300" />
                        <p>No referrer data available</p>
                        <p className="text-sm">Traffic sources will appear once users visit your link</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReferrerBarChart;
