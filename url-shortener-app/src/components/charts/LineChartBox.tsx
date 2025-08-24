import React, { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Calendar, TrendingUp } from "lucide-react";

interface ClickData {
    date: string;
    clicks: number;
    fullDate?: Date;
    year?: number;
    month?: number;
    originalDate?: string;
}

interface LineChartBoxProps {
    data: ClickData[];
}

const LineChartBox: React.FC<LineChartBoxProps> = ({ data }) => {
    // Debug logs
    console.log("🔍 LineChartBox received data:", data);
    console.log("🔍 Data length:", data?.length);
    console.log("🔍 First item:", data?.[0]);

    // Validate and clean data first
    const validData = useMemo(() => {
        if (!data || data.length === 0) return [];

        return data.filter(item =>
            item &&
            item.date &&
            typeof item.date === 'string' &&
            typeof item.clicks === 'number' &&
            !isNaN(item.clicks)
        );
    }, [data]);

    console.log("🔍 Valid data count:", validData.length);

    const totalClicks = useMemo(() => {
        return validData.reduce((sum, item) => sum + item.clicks, 0);
    }, [validData]);

    const averageClicks = useMemo(() => {
        return validData.length > 0 ? (totalClicks / validData.length).toFixed(1) : '0';
    }, [totalClicks, validData.length]);

    const peakClicks = useMemo(() => {
        return validData.length > 0 ? Math.max(...validData.map(d => d.clicks)) : 0;
    }, [validData]);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="text-sm text-gray-600 mb-1">Date: {label}</p>
                    <p className="text-lg font-semibold text-blue-600">
                        {payload[0].value} {payload[0].value === 1 ? 'click' : 'clicks'}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white rounded-lg border p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Click Activity</h3>
                        <p className="text-sm text-gray-600">Last 30 days</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{totalClicks.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Total clicks</div>
                </div>
            </div>

            {/* Debug info panel (only in development) */}
            {process.env.NODE_ENV === 'development' && (
                <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                    <div className="grid grid-cols-2 gap-2 text-blue-700">
                        <div>Raw data points: {data?.length || 0}</div>
                        <div>Valid data points: {validData.length}</div>
                        <div>Total clicks: {totalClicks}</div>
                        <div>Peak: {peakClicks}</div>
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-lg font-semibold text-blue-900">{totalClicks.toLocaleString()}</div>
                    <div className="text-sm text-blue-700">Total clicks</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-lg font-semibold text-green-900">{averageClicks}</div>
                    <div className="text-sm text-green-700">Average per day</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                    <div className="text-lg font-semibold text-purple-900">
                        {peakClicks}
                    </div>
                    <div className="text-sm text-purple-700">Peak day</div>
                </div>
            </div>

            {/* Chart */}
            <div className="h-64">
                {validData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={validData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                                dataKey="date"
                                stroke="#6b7280"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                stroke="#6b7280"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                allowDecimals={false}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Line
                                type="monotone"
                                dataKey="clicks"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: '#ffffff' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
                            <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
                            <p>No click data available</p>
                            <p className="text-sm">Clicks will appear here once your link is shared</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LineChartBox;
