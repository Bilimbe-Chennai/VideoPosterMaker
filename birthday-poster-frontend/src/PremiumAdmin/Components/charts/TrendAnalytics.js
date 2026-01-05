import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, AreaChart, Area } from 'recharts';

const TrendAnalytics = ({ data, range }) => {
    const chartData = React.useMemo(() => {
        if (!data) return [];

        return Object.keys(data)
            .sort()
            .map(dateKey => {
                const date = new Date(dateKey);
                // Always use DD/MM format as per screenshot
                const dayNum = String(date.getDate()).padStart(2, '0');
                const monthNum = String(date.getMonth() + 1).padStart(2, '0');
                const label = `${dayNum}/${monthNum}`;

                return {
                    name: label,
                    photos: data[dateKey].photos || 0,
                    shares: data[dateKey].shares || 0,
                    fullDate: dateKey
                };
            });
    }, [data, range]);

    if (range > 14) {
        // Use AreaChart for long ranges (30, 90 days)
        return (
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 20, right: 10, left: -25, bottom: 20 }}>
                    <defs>
                        <linearGradient id="colorPhotos" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#1A1A1A" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#1A1A1A" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} horizontal={true} stroke="#F0F0F0" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#999', fontSize: 12 }}
                        minTickGap={30}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#999', fontSize: 12 }}
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="photos"
                        stroke="#1A1A1A"
                        fillOpacity={1}
                        fill="url(#colorPhotos)"
                        strokeWidth={3}
                    />
                </AreaChart>
            </ResponsiveContainer>
        );
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 0, left: -25, bottom: 20 }}>
                <CartesianGrid vertical={true} horizontal={false} stroke="#EEEEEE" />
                <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#999', fontSize: 13, fontWeight: 500 }}
                    dy={10}
                />
                <YAxis
                    axisLine={false}
                    tickLine={false}
                    ticks={[0, 4, 8, 12, 16]}
                    tick={{ fill: '#999', fontSize: 13, fontWeight: 500 }}
                    domain={[0, 16]}
                />
                <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
                />
                <Bar
                    dataKey="photos"
                    name="Photos"
                    fill="#1A1A1A"
                    radius={[10, 10, 10, 10]}
                    barSize={12}
                />
                <Bar
                    dataKey="shares"
                    name="Shares"
                    fill="#E0DAE8"
                    radius={[10, 10, 10, 10]}
                    barSize={12}
                />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default TrendAnalytics;
