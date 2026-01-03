import React from 'react';
import styled from 'styled-components';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend
} from 'recharts';

const ChartWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <TooltipContainer>
                <TooltipValue>${payload[0].value.toLocaleString()}</TooltipValue>
                <TooltipTriangle />
            </TooltipContainer>
        );
    }
    return null;
};

const TooltipContainer = styled.div`
  background: #000;
  color: #fff;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  position: relative;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  transform: translateY(-10px);
`;

const TooltipValue = styled.div``;

const TooltipTriangle = styled.div`
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid #000;
`;

const AreaChartActivity = ({ data }) => {
    // We'll use the trend data from Analytics.js but mapped for multiple platforms or comparisons
    return (
        <ChartWrapper>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F36B3D" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#F36B3D" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#999', fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis hide={true} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="shares"
                        stroke="#F36B3D"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorIncome)"
                        activeDot={{ r: 6, fill: "#000", stroke: "#fff", strokeWidth: 2 }}
                    />
                    <Area
                        type="monotone"
                        dataKey="photos"
                        stroke="#999"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        fill="transparent"
                        activeDot={false}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </ChartWrapper>
    );
};

export default AreaChartActivity;
