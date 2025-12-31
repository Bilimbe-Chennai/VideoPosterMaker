import React from 'react';
import styled from 'styled-components';
import Card from '../Components/Card';
import LineAnalytics from '../Components/charts/LineAnalytics';
import DonutActivity from '../Components/charts/DonutActivity';
import BarActivity from '../Components/charts/BarActivity';
import { PieChart, TrendingUp, Filter, Download } from 'react-feather';

const AnalyticsContainer = styled.div``;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
`;

const ActionButton = styled.button`
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.lg}`};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  background: ${({ theme }) => theme.colors.primaryLight};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  transition: all 0.3s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.accentPurple};
    border-color: ${({ theme }) => theme.colors.accentPurple};
  }
`;

const AnalyticsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: ${({ theme }) => theme.spacing.lg};
`;

const LargeChartCard = styled(Card)`
  grid-column: span 8;
  @media (max-width: 1200px) {
    grid-column: span 12;
  }
`;

const SmallChartCard = styled(Card)`
  grid-column: span 4;
  @media (max-width: 1200px) {
    grid-column: span 12;
  }
`;

const FullWidthCard = styled(Card)`
  grid-column: span 12;
`;

const Analytics = () => {
    return (
        <AnalyticsContainer>
            <HeaderSection>
                <div>
                    <h1>Analytics Intelligence</h1>
                    <p style={{ color: '#7A7A7A', marginTop: '8px' }}>
                        In-depth analysis of sales, customer behavior, and product performance
                    </p>
                </div>

                <ActionButtons>
                    <ActionButton>
                        <Filter size={16} />
                        Time Filter
                    </ActionButton>
                    <ActionButton>
                        <Download size={16} />
                        Download PDF
                    </ActionButton>
                </ActionButtons>
            </HeaderSection>

            <AnalyticsGrid>
                <LargeChartCard title="Revenue Distribution" subtitle="Last 6 months growth analysis">
                    <div style={{ height: '400px', marginTop: '20px' }}>
                        <LineAnalytics />
                    </div>
                </LargeChartCard>

                <SmallChartCard title="User Acquisition" subtitle="New vs Returning">
                    <div style={{ height: '400px', marginTop: '20px' }}>
                        <DonutActivity />
                    </div>
                </SmallChartCard>

                <FullWidthCard title="Weekly Sales Velocity" subtitle="Daily transaction volume across all categories">
                    <div style={{ height: '350px', marginTop: '20px' }}>
                        <BarActivity />
                    </div>
                </FullWidthCard>
            </AnalyticsGrid>
        </AnalyticsContainer>
    );
};

export default Analytics;
