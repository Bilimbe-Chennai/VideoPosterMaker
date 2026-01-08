import React from 'react';
import styled from 'styled-components';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const LegendContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: nowrap;
  margin-top: 20px;
  padding: 0 5px;
  align-items: flex-start;
  overflow: hidden;
`;

const LegendItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 60px;
  max-width: 80px;
  flex: 0 0 auto;
`;

const LegendDot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 4px;
  background-color: ${props => props.$color};
  margin-bottom: 4px;
`;

const LegendValue = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: ${props => props.$dark ? '#FFFFFF' : '#1A1A1A'};
`;

const LegendLabel = styled.div`
  font-size: 9px;
  font-weight: 500;
  color: ${props => props.$dark ? '#B0B0B0' : '#666'};
  text-transform: capitalize;
  max-width: 70px;
  text-align: center;
  white-space: normal;
  word-break: break-word;
  line-height: 1.3;
`;

const DonutActivity = ({ data, dark = false }) => {
    const chartData = React.useMemo(() => {
        if (!data) return [];
        const total = Object.values(data).reduce((a, b) => a + b, 0);
        const colors = ['#8B5CF6', '#10B981', '#F59E0B', '#3B82F6', '#F97316', '#EC4899'];

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
