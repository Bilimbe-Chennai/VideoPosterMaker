import React from 'react';
import styled from 'styled-components';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const CardContainer = styled.div`
  background: ${props => props.$bgColor || '#FFF'};
  border-radius: 32px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: none;
  transition: all 0.3s ease;
  height: 100%;
  position: relative;
  overflow: hidden;
  min-height: 180px;

  &:hover {
    transform: translateY(-5px);
  }
`;

const KPITop = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
`;

const KPIIconWrapper = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(0, 0, 0, 0.7);
`;

const Label = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.7);
`;

const LowerSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
`;

const ContentSide = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Value = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #1A1A1A;
`;

const TrendTag = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: ${props => props.$up ? '#10B981' : '#EF4444'};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ChartSide = styled.div`
  width: 80px;
  height: 80px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: -10px;
  margin-right: -10px;
`;

const PercentageCenter = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  font-size: 16px;
  font-weight: 700;
  color: #1A1A1A;
`;

const MetricCircularCard = ({ label, value, percentage, trend, color = '#1A1A1A', bgColor, icon }) => {
  const data = [
    { name: 'Progress', value: percentage },
    { name: 'Empty', value: 100 - percentage }
  ];

  return (
    <CardContainer $bgColor={bgColor}>
      <KPITop>
        {icon && (
          <KPIIconWrapper>
            {icon}
          </KPIIconWrapper>
        )}
        <Label>{label}</Label>
      </KPITop>

      <LowerSection>
        <ContentSide>
          <Value>{value}</Value>
          <TrendTag $up={trend >= 0}>
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
          </TrendTag>
        </ContentSide>

        <ChartSide>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={28}
                outerRadius={38}
                paddingAngle={0}
                dataKey="value"
                startAngle={90}
                endAngle={450}
                stroke="none"
              >
                <Cell fill={color} />
                <Cell fill="rgba(255, 255, 255, 0.4)" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <PercentageCenter>
            {percentage}%
          </PercentageCenter>
        </ChartSide>
      </LowerSection>
    </CardContainer>
  );
};

export default MetricCircularCard;
