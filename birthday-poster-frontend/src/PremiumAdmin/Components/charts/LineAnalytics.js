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

const LineAnalytics = ({ activeTab = 'Photos', period = 'Last week' }) => {
    let data = [];
    if (activeTab === 'Photos') {
        data = period === 'Last week' ? photoLastWeek : photoThisWeek;
    } else {
        data = period === 'Last week' ? shareLastWeek : shareThisWeek;
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: 25 }}>
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
                    dataKey="value"
                    radius={[12, 12, 12, 12]}
                    barSize={24}
                >
                    {data.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={entry.type === 'highlight' ? '#E8DFF1' : '#1A1A1A'}
                        />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

export default LineAnalytics;
