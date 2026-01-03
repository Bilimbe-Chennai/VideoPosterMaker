import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { theme } from '../../theme';

const photoLastWeek = [
    { name: 'Mon', value: 7, type: 'normal' },
    { name: 'Tue', value: 4.5, type: 'normal' },
    { name: 'Wed', value: 9, type: 'highlight' },
    { name: 'Thu', value: 6.5, type: 'normal' },
    { name: 'Fri', value: 9, type: 'highlight' },
    { name: 'Sat', value: 7, type: 'normal' },
    { name: 'Sun', value: 8, type: 'normal' },
];

const photoThisWeek = [
    { name: 'Mon', value: 5, type: 'normal' },
    { name: 'Tue', value: 8, type: 'highlight' },
    { name: 'Wed', value: 6, type: 'normal' },
    { name: 'Thu', value: 7.5, type: 'normal' },
    { name: 'Fri', value: 4, type: 'normal' },
    { name: 'Sat', value: 9.5, type: 'highlight' },
    { name: 'Sun', value: 6, type: 'normal' },
];

const shareLastWeek = [
    { name: 'Mon', value: 5, type: 'normal' },
    { name: 'Tue', value: 6, type: 'normal' },
    { name: 'Wed', value: 8, type: 'highlight' },
    { name: 'Thu', value: 4, type: 'normal' },
    { name: 'Fri', value: 7, type: 'highlight' },
    { name: 'Sat', value: 5, type: 'normal' },
    { name: 'Sun', value: 6, type: 'normal' },
];

const shareThisWeek = [
    { name: 'Mon', value: 4, type: 'normal' },
    { name: 'Tue', value: 5, type: 'normal' },
    { name: 'Wed', value: 7, type: 'highlight' },
    { name: 'Thu', value: 3, type: 'normal' },
    { name: 'Fri', value: 6, type: 'highlight' },
    { name: 'Sat', value: 4, type: 'normal' },
    { name: 'Sun', value: 5, type: 'normal' },
];

const LineAnalytics = ({ data, range }) => {
    // Transform processed trends object ({ "2023-10-01": {photos:1...} }) into sorted array
    const chartData = React.useMemo(() => {
        if (!data) return [];
        return Object.keys(data)
            .sort() // Sort by date string (YYYY-MM-DD works perfectly for sorting)
            .map(date => {
                const [y, m, d] = date.split('-');
                return {
                    name: `${d}/${m}`, // Display as DD/MM
                    photos: data[date].photos,
                    shares: data[date].shares,
                    fullDate: date
                };
            });
    }, [data]);

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="0" vertical={true} horizontal={false} stroke="#F0F0F0" />
                <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: theme.colors.textLight, fontSize: 12, fontWeight: 500 }}
                    dy={15}
                />
                <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: theme.colors.textLight, fontSize: 12, fontWeight: 500 }}
                    tickFormatter={(val) => val}
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
                    dataKey="photos"
                    name="Photos"
                    fill="#1A1A1A"
                    radius={[4, 4, 0, 0]}
                    barSize={12}
                />
                <Bar
                    dataKey="shares"
                    name="Shares"
                    fill="#E8DFF1"
                    radius={[4, 4, 0, 0]}
                    barSize={12}
                />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default LineAnalytics;
