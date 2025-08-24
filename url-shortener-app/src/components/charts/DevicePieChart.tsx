import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Smartphone, Monitor, Tablet } from "lucide-react";

interface DeviceData {
    name: string;
    value: number;
}

interface DevicePieChartProps {
    data: DeviceData[];
    total?: number; // Add optional total prop
}

const DevicePieChart: React.FC<DevicePieChartProps> = ({ data, total }) => {
    const COLORS = {
        Mobile: '#3b82f6',
        Desktop: '#10b981',
        Tablet: '#f59e0b'
    };

    const getDeviceIcon = (deviceType: string) => {
        switch (deviceType) {
            case 'Mobile':
                return <Smartphone size={16} />;
            case 'Desktop':
                return <Monitor size={16} />;
            case 'Tablet':
                return <Tablet size={16} />;
            default:
                return <Monitor size={16} />;
        }
    };

    // Calculate total from data if not provided
    const calculatedTotal = total || data.reduce((sum, item) => sum + item.value, 0);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const percentage = calculatedTotal > 0 ? ((data.value / calculatedTotal) * 100).toFixed(1) : '0';

            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <div className="flex items-center space-x-2 mb-1">
                        {getDeviceIcon(data.name)}
                        <span className="font-medium">{data.name}</span>
                    </div>
                    <p className="text-sm text-gray-600">
                        {data.value} clicks ({percentage}%)
                    </p>
                </div>
            );
        }
        return null;
    };

    const CustomLegend = ({ payload }: any) => {
        return (
            <div className="flex flex-col space-y-2 mt-4">
                {payload.map((entry: any, index: number) => {
                    const percentage = calculatedTotal > 0 ? ((entry.payload.value / calculatedTotal) * 100).toFixed(1) : '0';
                    return (
                        <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: entry.color }}
                                />
                                <div className="flex items-center space-x-1">
                                    {getDeviceIcon(entry.value)}
                                    <span className="text-sm text-gray-700">{entry.value}</span>
                                </div>
                            </div>
                            <div className="text-sm text-gray-600">
                                {entry.payload.value} ({percentage}%)
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-green-100 rounded-lg">
                    <Monitor className="w-5 h-5 text-green-600" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Device Types</h3>
                    <p className="text-sm text-gray-600">Click distribution by device</p>
                </div>
            </div>

            {data.length > 0 && calculatedTotal > 0 ? (
                <div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {data.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[entry.name as keyof typeof COLORS] || '#6b7280'}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <CustomLegend payload={data.map(item => ({
                        value: item.name,
                        color: COLORS[item.name as keyof typeof COLORS] || '#6b7280',
                        payload: item
                    }))} />
                </div>
            ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                    <div className="text-center">
                        <Monitor size={48} className="mx-auto mb-4 text-gray-300" />
                        <p>No device data available</p>
                        <p className="text-sm">Device information will appear once users click your link</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DevicePieChart;
