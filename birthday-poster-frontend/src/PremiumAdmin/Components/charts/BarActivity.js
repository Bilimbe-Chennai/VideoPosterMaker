import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { theme } from '../../theme';

const data = [
    { name: 'Mon', orders: 45 },
    { name: 'Tue', orders: 52 },
    { name: 'Wed', orders: 38 },
    { name: 'Thu', orders: 65 },
    { name: 'Fri', orders: 48 },
    { name: 'Sat', orders: 85 },
    { name: 'Sun', orders: 72 },
];

const BarActivity = () => {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.colors.borderLight} />
                <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: theme.colors.textLight, fontSize: 12 }}
                />
                <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: theme.colors.textLight, fontSize: 12 }}
                />
                <Tooltip
                    cursor={{ fill: theme.colors.accentPurple, opacity: 0.4 }}
                    contentStyle={{
                        borderRadius: theme.borderRadius.medium,
                        border: 'none',
                        boxShadow: theme.shadows.card
                    }}
                />
                <Bar dataKey="orders" fill={theme.colors.primaryDark} radius={[4, 4, 0, 0]}>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? theme.colors.primaryDark : theme.colors.textSecondary} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

export default BarActivity;
