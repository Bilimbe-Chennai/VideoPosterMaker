import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { theme } from '../../theme';

const getDayName = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
};

const LineAnalytics = ({ data, period, activeTab }) => {
    // Transform processed trends object into a strict Mon-Sun 7-day range
    const chartData = React.useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Find the Monday of the current week (local time)
        const currentMonday = new Date(today);
        const day = today.getDay(); // 0 is Sun, 1 is Mon...
        const diff = day === 0 ? -6 : 1 - day; // Offset to get to Monday
        currentMonday.setDate(today.getDate() + diff);

        let startDay = new Date(currentMonday);
        if (period === 'Last week') {
            startDay.setDate(currentMonday.getDate() - 7);
        }

        const dates = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(startDay);
            d.setDate(startDay.getDate() + i);

            // Generate local YYYY-MM-DD key
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const dayNum = String(d.getDate()).padStart(2, '0');
            dates.push(`${year}-${month}-${dayNum}`);
        }

        return dates.map(dateKey => {
            const dayName = getDayName(dateKey);
            const rawValue = data && data[dateKey] ? (data[dateKey][activeTab] || 0) : 0;
            return {
                name: dayName,
                value: rawValue,
                isHighlight: dayName === 'Wed' || dayName === 'Fri',
                fullDate: dateKey
            };
        });
    }, [data, period, activeTab]);

    return (
        <div style={{ height: '100%', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 0, left: -25, bottom: 20 }}>
                    <CartesianGrid vertical={true} horizontal={false} stroke="#F0F0F0" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#999', fontSize: 13, fontWeight: 500 }}
                        interval={0}
                        padding={{ left: 20, right: 20 }}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        ticks={[0, 3, 6, 9, 12]}
                        tick={{ fill: '#999', fontSize: 13, fontWeight: 500 }}
                        domain={[0, 12]}
                    />
                    <Tooltip
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                        }}
                    />
                    <Bar
                        dataKey="value"
                        radius={[15, 15, 15, 15]}
                        barSize={32}
                    >
                        {chartData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.isHighlight ? '#E0DAE8' : '#1A1A1A'}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default LineAnalytics;
