import React from 'react';
import styled from 'styled-components';
import Card from '../Card';

const StyledKPICard = styled(Card)`
  padding: 24px;
  background-color: ${({ $bgColor }) => $bgColor};
  border: none;
  box-shadow: none;
  border-radius: 32px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 180px;
  position: relative;
  overflow: hidden;
`;

const KPITop = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
`;

const KPIIconWrapper = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(0, 0, 0, 0.7);
`;

const KPILabel = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.7);
`;

const KPIContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
`;

const KPIMain = styled.div``;

const KPIValue = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: #1A1A1A;
  margin-bottom: 8px;
`;

const TrendIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 700;
  color: ${({ $color }) => $color};
`;

const SparklineWrapper = styled.div`
  width: 100px;
  height: 50px;
`;

const MiniTrendSVG = ({ color, points, endX, endY }) => (
    <svg width="100" height="50" viewBox="0 0 100 50">
        <path
            d={points}
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <circle cx={endX} cy={endY} r="3.5" fill="white" stroke={color} strokeWidth="2" />
    </svg>
);

const KPIMetricCard = ({
    label,
    value,
    trend,
    trendColor,
    icon,
    bgColor,
    positive = true,
    points = "M10,40 C25,38 35,45 50,35 S80,10 90,15",
    endX = 85,
    endY = 14
}) => {
    return (
        <StyledKPICard $bgColor={bgColor}>
            <KPITop>
                <KPIIconWrapper>{icon}</KPIIconWrapper>
                <KPILabel>{label}</KPILabel>
            </KPITop>
            <KPIContent>
                <KPIMain>
                    <KPIValue>{value}</KPIValue>
                    <TrendIndicator $color={trendColor}>
                        {positive ? '▲' : '▼'} {trend}%
                    </TrendIndicator>
                </KPIMain>
                <SparklineWrapper>
                    <MiniTrendSVG color={trendColor} points={points} endX={endX} endY={endY} />
                </SparklineWrapper>
            </KPIContent>
        </StyledKPICard>
    );
};

export default KPIMetricCard;
