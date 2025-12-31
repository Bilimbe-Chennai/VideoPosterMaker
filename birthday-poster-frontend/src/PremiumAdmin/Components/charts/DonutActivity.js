import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { theme } from '../../theme';

const data = [
    { name: 'WhatsApp', value: 45, color: '#25D366' },
    { name: 'Instagram', value: 30, color: '#E1306C' },
    { name: 'Facebook', value: 15, color: '#1877F2' },
    { name: 'Direct Download', value: 10, color: '#7A7A7A' },
];

const DonutActivity = () => {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="45%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip
                    contentStyle={{
                        borderRadius: theme.borderRadius.medium,
                        border: 'none',
                        boxShadow: theme.shadows.card
                    }}
                />
                <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    layout="horizontal"
                    align="center"
                    wrapperStyle={{ fontSize: '13px', fontWeight: 600, color: theme.colors.textSecondary, paddingTop: '20px' }}
                    formatter={(value) => {
                        const item = data.find(d => d.name === value);
                        return (
                            <span style={{ color: theme.colors.textPrimary, marginRight: '15px' }}>
                                {value} <span style={{ marginLeft: '10px', color: theme.colors.textLight, fontWeight: 700 }}>{item.value}%</span>
                            </span>
                        );
                    }}
                />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default DonutActivity;
