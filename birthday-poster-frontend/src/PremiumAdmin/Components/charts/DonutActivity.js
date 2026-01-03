import React from 'react';
import styled from 'styled-components';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const LegendContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
  margin-top: 20px;
  padding: 0 10px;
`;

const LegendItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

const LegendDot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 4px;
  background-color: ${props => props.$color};
  margin-bottom: 4px;
`;

const LegendValue = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: ${props => props.$dark ? '#FFFFFF' : '#1A1A1A'};
`;

const LegendLabel = styled.div`
  font-size: 11px;
  font-weight: 500;
  color: ${props => props.$dark ? '#7A7A7A' : '#666'};
  text-transform: capitalize;
`;

const DonutActivity = ({ data, dark = false }) => {
    const chartData = React.useMemo(() => {
        if (!data) return [];
        const total = Object.values(data).reduce((a, b) => a + b, 0);
        const colors = ['#EFEBFA', '#E6F5EC', '#FFFAE8', '#E3F2FD', '#FDF1E9', '#F0F0F0'];

        return Object.entries(data).map(([name, value], index) => ({
            name,
            value,
            percentage: total > 0 ? ((value / total) * 100).toFixed(1) : 0,
            color: colors[index % colors.length]
        }));
    }, [data]);

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={105}
                        paddingAngle={5}
                        dataKey="value"
                        stroke={dark ? "#1A1A1A" : "#FFFFFF"}
                        strokeWidth={4}
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            borderRadius: '12px',
                            border: 'none',
                            backgroundColor: dark ? '#2A2A2A' : '#FFF',
                            color: dark ? '#FFF' : '#333',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
                        }}
                        itemStyle={{ color: dark ? '#FFF' : '#333' }}
                    />
                </PieChart>
            </ResponsiveContainer>

            <LegendContainer>
                {chartData.map((item, index) => (
                    <LegendItem key={index}>
                        <LegendDot $color={item.color} />
                        <LegendValue $dark={dark}>{item.percentage}%</LegendValue>
                        <LegendLabel $dark={dark}>{item.name}</LegendLabel>
                    </LegendItem>
                ))}
            </LegendContainer>
        </div>
    );
};

export default DonutActivity;
