import React from 'react';
import styled from 'styled-components';
import Card from '../Components/Card';
import LineAnalytics from '../Components/charts/LineAnalytics';
import TrendAnalytics from '../Components/charts/TrendAnalytics';
import DonutActivity from '../Components/charts/DonutActivity';
import BarActivity from '../Components/charts/BarActivity';
import MetricCircularCard from '../Components/charts/MetricCircularCard';
import useAxios from '../../useAxios';
import { PieChart, TrendingUp, Filter, Download, Image, Calendar, Share2, Star, User, Facebook } from 'react-feather';

const AnalyticsContainer = styled.div``;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  @media (max-width: 1024px) {
    flex-direction: column;
    gap: 20px;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: 480px) {
    width: 100%;
    flex-direction: column;
  }
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

const KPIBox = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 32px;
  grid-column: span 12;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const KPICard = styled(Card)`
  padding: 24px;
  background-color: ${({ $bgColor }) => $bgColor || '#FFF'};
  border: none;
  box-shadow: none;
  border-radius: 32px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 180px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;

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

const Analytics = () => {
  // 1. State Management
  const [timeRange, setTimeRange] = React.useState(7); // Default 7 days
  const [loading, setLoading] = React.useState(true);
  const [analyticsData, setAnalyticsData] = React.useState(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const axiosData = useAxios();

  // 2. Fetch Data
  const fetchAnalyticsData = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosData.get(`upload/all?adminid=${user._id || user.id}`);
      const rawData = response.data.filter(item => item.source === 'Photo Merge App');
      processAnalytics(rawData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setLoading(false);
    }
  }, [timeRange]);

  React.useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  // 3. Process Logic
  const processAnalytics = (data) => {
    const now = new Date();
    const currentPeriodStart = new Date();
    currentPeriodStart.setDate(now.getDate() - timeRange);

    const previousPeriodStart = new Date(currentPeriodStart);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - timeRange);

    // -- Filter Data by Date Ranges
    const currentData = data.filter(item => {
      const d = new Date(item.date || item.createdAt);
      return d >= currentPeriodStart && d <= now;
    });

    const previousData = data.filter(item => {
      const d = new Date(item.date || item.createdAt);
      return d >= previousPeriodStart && d < currentPeriodStart;
    });

    // -- Constants & Helpers
    const TARGET_CATEGORIES = ['Sarees', 'Lehengas', 'Kurtis', 'Accessories'];

    const getShareCount = (item) =>
      (item.whatsappsharecount || 0) + (item.facebooksharecount || 0) +
      (item.twittersharecount || 0) + (item.instagramsharecount || 0);

    const getUniqueCustomers = (dataset) => {
      const unique = new Set(dataset.map(item => item.mobile || item.whatsapp || item.name));
      return unique.size;
    };

    const calculateConversion = (dataset) => {
      if (dataset.length === 0) return 0;
      const sharedPhotos = dataset.filter(item => getShareCount(item) > 0).length;
      return (sharedPhotos / dataset.length * 100).toFixed(1);
    };

    const calculateGrowth = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous * 100).toFixed(1);
    };

    // --- KPI Calculations
    const stats = {
      photos: {
        current: currentData.length,
        previous: previousData.length
      },
      shares: {
        current: currentData.reduce((acc, item) => acc + getShareCount(item), 0),
        previous: previousData.reduce((acc, item) => acc + getShareCount(item), 0)
      },
      conversion: {
        current: calculateConversion(currentData),
        previous: calculateConversion(previousData)
      },
      session: {
        current: 252, // Mocked 4m 12s in seconds
        previous: 240
      }
    };

    // --- 4. Trend Data (Daily)
    const trends = {};

    // Initialize trends with local dates to avoid timezone shifts
    for (let i = timeRange - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const dayNum = String(d.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${dayNum}`;
      trends[dateKey] = { photos: 0, shares: 0, users: new Set() };
    }

    currentData.forEach(item => {
      let dateKey;
      try {
        const dateObj = new Date(item.date || item.createdAt);
        if (isNaN(dateObj.getTime())) return;

        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const dayNum = String(dateObj.getDate()).padStart(2, '0');
        dateKey = `${year}-${month}-${dayNum}`;
      } catch (e) {
        return;
      }

      if (trends[dateKey]) {
        trends[dateKey].photos += 1;
        trends[dateKey].shares += getShareCount(item);
        trends[dateKey].users.add(item.mobile || item.whatsapp || item.name);
      }
    });

    // Convert trends sets to counts
    Object.keys(trends).forEach(k => trends[k].uniqueCustomers = trends[k].users.size);

    // --- 5. Category Distribution
    const categories = { 'Sarees': 0, 'Lehengas': 0, 'Kurtis': 0, 'Accessories': 0, 'Others': 0 };
    currentData.forEach(item => {
      let cat = item.template_name || item.templatename || item.type || 'Others';
      if (!TARGET_CATEGORIES.includes(cat)) cat = 'Others';
      categories[cat]++;
    });

    // --- 6. Platform Performance
    const platforms = { WhatsApp: 0, Facebook: 0, Instagram: 0, Direct: 0 };
    currentData.forEach(item => {
      platforms.WhatsApp += (item.whatsappsharecount || 0);
      platforms.Facebook += (item.facebooksharecount || 0);
      platforms.Instagram += (item.instagramsharecount || 0);
      platforms.Direct += (item.downloadcount || 0);
    });

    // --- 7. Peak Hours & Day Analysis
    const peakHours = new Array(24).fill(0);
    const dayPerformance = {}; // { 'Monday': { photos: 0 } }

    currentData.forEach(item => {
      const d = new Date(item.date || item.createdAt);
      const hour = d.getHours();
      const day = d.toLocaleDateString('en-US', { weekday: 'long' });

      peakHours[hour]++;

      if (!dayPerformance[day]) dayPerformance[day] = 0;
      dayPerformance[day]++;
    });

    // --- 8. Generated Insights
    const bestHourIndex = peakHours.indexOf(Math.max(...peakHours));
    const bestCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
    const bestDay = Object.entries(dayPerformance).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    // Growth Logic (Mocked logic for specific comparison)
    const weekendCount = (dayPerformance['Saturday'] || 0) + (dayPerformance['Sunday'] || 0);
    const weekdayCount = Object.values(dayPerformance).reduce((a, b) => a + b, 0) - weekendCount;
    const weekendGrowth = weekendCount > weekdayCount ? "High Weekend Traffic" : "Steady Weekday Traffic";

    const platformGrowth = (() => {
      // Simple heuristic: which platform has most shares relative to mock previous
      const sorted = Object.entries(platforms).sort((a, b) => b[1] - a[1]);
      return sorted[0]?.[0] || 'WhatsApp';
    })();

    setAnalyticsData({
      kpis: {
        photos: {
          value: stats.photos.current,
          growth: calculateGrowth(stats.photos.current, stats.photos.previous)
        },
        shares: {
          value: stats.shares.current,
          growth: calculateGrowth(stats.shares.current, stats.shares.previous)
        },
        conversion: {
          value: stats.conversion.current,
          growth: calculateGrowth(parseFloat(stats.conversion.current), parseFloat(stats.conversion.previous))
        },
        session: {
          value: "4m 12s",
          growth: "+5%"
        }
      },
      trends,
      categories,
      platforms,
      peakHours,
      insights: {
        bestTimeStr: `${bestHourIndex}:00 - ${bestHourIndex + 1}:00`,
        bestDay,
        bestCategory: bestCategory ? `${bestCategory[0]} (${Math.round(bestCategory[1] / stats.photos.current * 100 || 0)}%)` : 'N/A',
        growthPlatform: platformGrowth,
        trafficPattern: weekendGrowth,
        recommendation: `Schedule ${platformGrowth} campaigns on ${bestDay}s at ${bestHourIndex}:00 for max conversion.`
      }
    });
  };

  const handleExport = () => {
    if (!analyticsData) return;

    // Detailed CSV
    let csv = `Metric,Value,Growth\n`;
    csv += `Total Photos,${analyticsData.kpis.photos.value},${analyticsData.kpis.photos.growth}%\n`;
    csv += `Total Shares,${analyticsData.kpis.shares.value},${analyticsData.kpis.shares.growth}%\n`;
    csv += `Conversion Rate,${analyticsData.kpis.conversion.value}%,${analyticsData.kpis.conversion.growth}%\n`;

    csv += `\nCategory Distribution\nCategory,Count\n`;
    Object.entries(analyticsData.categories).forEach(([k, v]) => csv += `${k},${v}\n`);

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Analytics_Report_${timeRange}Days.csv`;
    a.click();
  };


  return (
    <AnalyticsContainer>
      <HeaderSection>
        <div>
          <h1>Analytics Dashboard</h1>
          <p style={{ color: '#7A7A7A', marginTop: '8px' }}>
            Track performance, engagement, and conversion metrics
          </p>
        </div>

        <ActionButtons>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[1, 7, 30, 90].map(days => (
              <ActionButton
                key={days}
                onClick={() => setTimeRange(days)}
                style={{ background: timeRange === days ? '#E0E7FF' : 'transparent', borderColor: timeRange === days ? '#6366F1' : '#E5E7EB' }}
              >
                {days} Days
              </ActionButton>
            ))}
          </div>
          <ActionButton onClick={handleExport}>
            <Download size={16} />
            Export
          </ActionButton>
        </ActionButtons>
      </HeaderSection>

      {loading ? <div style={{ padding: '40px', textAlign: 'center' }}>Loading analytics...</div> : (
        <AnalyticsGrid>
          {/* KPI Cards */}
          <KPIBox>
            {[
              {
                label: 'Total Photos',
                value: analyticsData?.kpis?.photos?.value?.toLocaleString() || '0',
                change: `${analyticsData?.kpis?.photos?.growth || 0}%`,
                icon: <Image size={20} />,
                bgColor: '#FFF0E5',
                trendColor: '#D47D52',
                points: "M10,40 C25,38 35,45 50,35 S80,10 90,15",
                endX: 85, endY: 14
              },
              {
                label: 'Total Shares',
                value: analyticsData?.kpis?.shares?.value?.toLocaleString() || '0',
                change: `${analyticsData?.kpis?.shares?.growth || 0}%`,
                icon: <Share2 size={20} />,
                bgColor: '#F7F2FA',
                trendColor: '#8E44AD',
                points: "M10,42 C25,35 35,40 50,30 S85,5 90,10",
                endX: 85, endY: 8
              },
              {
                label: 'Conversion Rate',
                value: `${analyticsData?.kpis?.conversion?.value || 0}%`,
                change: `${analyticsData?.kpis?.conversion?.growth || 0}%`,
                icon: <TrendingUp size={20} />,
                bgColor: '#F4F9E9',
                trendColor: '#6B8E23',
                points: "M10,35 C25,38 35,25 50,30 S80,25 90,28",
                endX: 85, endY: 27
              },
              {
                label: 'Unique Customers',
                value: analyticsData?.uniqueCustomers?.toLocaleString() || '0',
                change: '+5.4%', // Mocked growth for now
                icon: <Star size={20} />,
                bgColor: '#FFF9E5',
                trendColor: '#B58B00',
                points: "M10,38 C25,35 35,38 50,32 S80,20 90,25",
                endX: 85, endY: 23
              }
            ].map((kpi, idx) => (
              <KPICard key={idx} $bgColor={kpi.bgColor}>
                <KPITop>
                  <KPIIconWrapper>
                    {kpi.icon}
                  </KPIIconWrapper>
                  <KPILabel>{kpi.label}</KPILabel>
                </KPITop>

                <KPIContent>
                  <KPIMain>
                    <KPIValue>{kpi.value}</KPIValue>
                    <TrendIndicator $color={kpi.trendColor}>
                      ▲ {kpi.change}
                    </TrendIndicator>
                  </KPIMain>

                  <div style={{ position: 'relative', width: '100px', height: '50px' }}>
                    <svg width="100%" height="100%" viewBox="0 0 100 50" style={{ overflow: 'visible' }}>
                      <path
                        d={kpi.points}
                        fill="none"
                        stroke={kpi.trendColor}
                        strokeWidth="3"
                        strokeLinecap="round"
                        style={{ filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.1))' }}
                      />
                      <circle
                        cx={kpi.endX}
                        cy={kpi.endY}
                        r="4"
                        fill="white"
                        stroke={kpi.trendColor}
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                </KPIContent>
              </KPICard>
            ))}
          </KPIBox>


          <LargeChartCard title="Performance Trends" subtitle={`Daily activity for last ${timeRange} days`}>
            <div style={{ height: '400px', marginTop: '20px' }}>
              <TrendAnalytics data={analyticsData?.trends} range={timeRange} />
            </div>
          </LargeChartCard>

          <SmallChartCard dark title="Category Distribution" subtitle="Top performing categories">
            <div style={{ height: '400px', marginTop: '20px' }}>
              <DonutActivity dark data={analyticsData?.categories} />
            </div>
          </SmallChartCard>

          <FullWidthCard title="Platform Performance" subtitle="Shares across channels">
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '24px',
              padding: '24px 0'
            }}>
              {(() => {
                const totalShares = Object.values(analyticsData?.platforms || {}).reduce((a, b) => a + b, 0) || 1;
                return [
                  { label: 'WhatsApp', key: 'WhatsApp', color: '#6B8E23', bgColor: '#F4F9E9', icon: <Share2 size={20} /> },
                  { label: 'Facebook', key: 'Facebook', color: '#D47D52', bgColor: '#FFF0E5', icon: <Facebook size={20} /> },
                  { label: 'Instagram', key: 'Instagram', color: '#8E44AD', bgColor: '#F7F2FA', icon: <Image size={20} /> },
                  { label: 'Download', key: 'Direct', color: '#B58B00', bgColor: '#FFF9E5', icon: <Download size={20} /> }
                ].map(p => (
                  <MetricCircularCard
                    key={p.key}
                    label={p.label}
                    value={analyticsData?.platforms[p.key] || 0}
                    percentage={Math.round(((analyticsData?.platforms[p.key] || 0) / totalShares) * 100)}
                    trend={5.0}
                    color={p.color}
                    bgColor={p.bgColor}
                    icon={p.icon}
                  />
                ));
              })()}
            </div>
          </FullWidthCard>

          <FullWidthCard title="Insights & Recommendations" subtitle="AI Derived Actions">
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
              padding: '20px 0'
            }}>
              <div>
                <h4 style={{ marginBottom: '10px', color: '#1A1A1A' }}>🏆 Top Performance</h4>
                <p style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>Best Category</p>
                <p style={{ fontWeight: 600, color: '#1A1A1A' }}>{analyticsData?.insights.bestCategory}</p>
                <p style={{ fontSize: '13px', color: '#666', marginTop: '12px', marginBottom: '4px' }}>Peak Day & Time</p>
                <p style={{ fontWeight: 600, color: '#1A1A1A' }}>{analyticsData?.insights.bestDay}, {analyticsData?.insights.bestTimeStr}</p>
              </div>
              <div>
                <h4 style={{ marginBottom: '10px', color: '#1A1A1A' }}>🚀 Growth Areas</h4>
                <p style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>Fastest Growing Platform</p>
                <p style={{ fontWeight: 600, color: '#1A1A1A' }}>{analyticsData?.insights.growthPlatform}</p>
                <p style={{ fontSize: '13px', color: '#666', marginTop: '12px', marginBottom: '4px' }}>Traffic Pattern</p>
                <p style={{ fontWeight: 600, color: '#1A1A1A' }}>{analyticsData?.insights.trafficPattern}</p>
              </div>
              <div style={{ background: '#F9FAFB', padding: '16px', borderRadius: '12px' }}>
                <h4 style={{ marginBottom: '10px', color: '#1A1A1A' }}>💡 Smart Recommendation</h4>
                <p style={{ color: '#4B5563', lineHeight: '1.5' }}>{analyticsData?.insights.recommendation}</p>
                <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ padding: '4px 12px', background: '#E0E7FF', color: '#4F46E5', borderRadius: '100px', fontSize: '12px', fontWeight: 600 }}>Campaign Optimization</span>
                  <span style={{ padding: '4px 12px', background: '#DCFCE7', color: '#16A34A', borderRadius: '100px', fontSize: '12px', fontWeight: 600 }}>Engagement</span>
                </div>
              </div>
            </div>
          </FullWidthCard>
        </AnalyticsGrid>
      )}
    </AnalyticsContainer>
  );
};

export default Analytics;
