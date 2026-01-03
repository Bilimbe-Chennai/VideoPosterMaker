import React, { useState, useEffect } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import {
  Users,
  FileText,
  UploadCloud,
  Activity,
  Shield,
  TrendingUp,
  Clock,
  MoreHorizontal
} from 'react-feather';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import useAxios from "../useAxios";
import { theme } from '../PremiumAdmin/theme';

// --- Styled Components ---

const DashboardContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${theme.spacing.xl};
`;

const WelcomeMessage = styled.div`
  h1 {
    margin-bottom: 4px;
    font-size: 24px;
    font-weight: 700;
  }
  p {
    color: ${theme.colors.textSecondary};
    font-size: 14px;
  }
`;

const KPIBox = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.lg};
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const KPICard = styled.div`
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

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: ${theme.spacing.lg};
`;

const ListCard = styled.div`
  grid-column: span 8;
  padding: 24px;
  background: white;
  border-radius: 32px;
  box-shadow: ${theme.shadows.card};
  
  @media (max-width: 1200px) {
    grid-column: span 12;
  }
`;

const DonutCard = styled.div`
  grid-column: span 4;
  padding: 24px;
  background-color: #1A1A1A;
  color: white;
  min-height: 400px;
  border-radius: 32px;
  position: relative;
  display: flex;
  flex-direction: column;

  @media (max-width: 1200px) {
    grid-column: span 12;
  }
`;

const DonutHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
  }
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 20px;
  margin-bottom: 12px;
  background: ${theme.colors.primaryLight};
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateX(5px);
    background: #F9F9F9;
  }
`;

const ActivityIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ $bg }) => $bg || '#F0F0F0'};
  color: ${({ $color }) => $color || '#666'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const ActivityContent = styled.div`
  flex: 1;
  
  h4 {
    margin: 0;
    font-size: 14px;
    font-weight: 700;
    margin-bottom: 4px;
  }
  
  p {
    margin: 0;
    font-size: 12px;
    color: #888;
  }
`;

const ActivityTime = styled.div`
  font-size: 11px;
  color: #999;
  font-weight: 500;
`;

const TooltipContainer = styled.div`
  background: rgba(30, 30, 30, 0.95);
  backdrop-filter: blur(12px);
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
`;

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <TooltipContainer>
        <div style={{ color: 'white', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: data.payload.color }} />
          {data.name}: {data.value}
        </div>
      </TooltipContainer>
    );
  }
  return null;
};

const Dashboard = () => {
  const axiosData = useAxios();
  const [stats, setStats] = useState({
    totalAdmins: 0,
    totalUsers: 0,
    totalTemplates: 0,
    uploadsToday: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchDashboardData = async () => {
    try {
      const [adminsRes, usersRes, templatesRes] = await Promise.all([
        axiosData.get('/admins').catch(() => ({ data: [] })),
        axiosData.get('/users').catch(() => ({ data: [] })),
        axiosData.get('/photomerge/templates').catch(() => ({ data: [] })),
      ]);

      setStats({
        totalAdmins: adminsRes.data?.length || 0,
        totalUsers: usersRes.data?.length || 0,
        totalTemplates: templatesRes.data?.length || 0,
        uploadsToday: Math.floor(Math.random() * 20) + 5, // Mock
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const kpis = [
    {
      label: 'Total Admins',
      value: stats.totalAdmins,
      change: '+5.2%',
      icon: <Shield size={20} />,
      bgColor: '#F2EFFF',
      trendColor: '#7B61FF',
      positive: true,
      points: "M10,40 C25,38 35,45 50,35 S80,10 90,15",
      endX: 85, endY: 14
    },
    {
      label: 'Total Users',
      value: stats.totalUsers,
      change: '+12.5%',
      icon: <Users size={20} />,
      bgColor: '#E8F5E9',
      trendColor: '#25D366',
      positive: true,
      points: "M10,42 C25,35 35,40 50,30 S85,5 90,10",
      endX: 85, endY: 8
    },
    {
      label: 'Total Templates',
      value: stats.totalTemplates,
      change: '+8.2%',
      icon: <FileText size={20} />,
      bgColor: '#FFF3E0',
      trendColor: '#FF9F43',
      positive: true,
      points: "M10,35 C25,38 35,25 50,30 S80,25 90,28",
      endX: 85, endY: 27
    },
    {
      label: 'Uploads Today',
      value: stats.uploadsToday,
      change: '+15.3%',
      icon: <UploadCloud size={20} />,
      bgColor: '#E0F7FA',
      trendColor: '#00C9FF',
      positive: true,
      points: "M10,38 C25,35 35,38 50,32 S80,20 90,25",
      endX: 85, endY: 23
    }
  ];

  const recentActivities = [
    { title: 'New Admin Created', desc: 'System created new admin "Sarah"', time: '2h ago', icon: <Shield size={16} />, color: '#7B61FF', bg: '#F2EFFF' },
    { title: 'Template Updated', desc: 'Modified "Wedding Invite"', time: '4h ago', icon: <FileText size={16} />, color: '#FF9F43', bg: '#FFF3E0' },
    { title: 'System Backup', desc: 'Daily backup successful', time: '6h ago', icon: <Activity size={16} />, color: '#00C9FF', bg: '#E0F7FA' },
    { title: 'New User', desc: 'User #8423 joined', time: '1d ago', icon: <TrendingUp size={16} />, color: '#25D366', bg: '#E8F5E9' },
  ];

  const distributionData = [
    { name: 'Admins', value: stats.totalAdmins || 1, color: '#7B61FF' },
    { name: 'Users', value: stats.totalUsers || 1, color: '#25D366' },
    { name: 'Guests', value: Math.floor((stats.totalUsers || 10) * 0.3), color: '#FF9F43' },
  ];

  if (loading) return <div>Loading...</div>;

  return (
    <ThemeProvider theme={theme}>
      <DashboardContainer>
        <DashboardHeader>
          <WelcomeMessage>
            <h1>Welcome back, {user.name || 'Admin'} 👋</h1>
            <p>Overview of system performance and user statistics</p>
          </WelcomeMessage>
          <div style={{ display: 'flex', gap: '8px', color: '#666', fontSize: '14px', alignItems: 'center' }}>
            <Clock size={16} />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </DashboardHeader>

        <KPIBox>
          {kpis.map((kpi, idx) => (
            <KPICard key={idx} $bgColor={kpi.bgColor}>
              <KPITop>
                <KPIIconWrapper>{kpi.icon}</KPIIconWrapper>
                <KPILabel>{kpi.label}</KPILabel>
              </KPITop>
              <KPIContent>
                <KPIMain>
                  <KPIValue>{kpi.value.toLocaleString()}</KPIValue>
                  <TrendIndicator $color={kpi.trendColor}>
                    {kpi.positive ? '▲' : '▼'} {kpi.change}
                  </TrendIndicator>
                </KPIMain>
                <SparklineWrapper>
                  <MiniTrendSVG color={kpi.trendColor} points={kpi.points} endX={kpi.endX} endY={kpi.endY} />
                </SparklineWrapper>
              </KPIContent>
            </KPICard>
          ))}
        </KPIBox>

        <MainGrid>
          <ListCard>
            <SectionHeader>
              <h3>Recent System Activity</h3>
            </SectionHeader>
            {recentActivities.map((act, i) => (
              <ActivityItem key={i}>
                <ActivityIcon $bg={act.bg} $color={act.color}>
                  {act.icon}
                </ActivityIcon>
                <ActivityContent>
                  <h4>{act.title}</h4>
                  <p>{act.desc}</p>
                </ActivityContent>
                <ActivityTime>{act.time}</ActivityTime>
              </ActivityItem>
            ))}
          </ListCard>

          <DonutCard>
            <DonutHeader>
              <h3>User Distribution</h3>
              <MoreHorizontal color="white" size={20} style={{ opacity: 0.7, cursor: 'pointer' }} />
            </DonutHeader>
            <div style={{ flex: 1, minHeight: '200px', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} cursor={false} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </DonutCard>
        </MainGrid>
      </DashboardContainer>
    </ThemeProvider>
  );
};

export default Dashboard;
