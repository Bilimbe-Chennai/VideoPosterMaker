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
  MoreHorizontal,
  Download,
  CheckCircle,
  XCircle
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
    adminsGrowth: 0,
    usersGrowth: 0,
    templatesGrowth: 0,
    uploadsGrowth: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const calculateGrowth = (current, previous) => {
    // Calculate the count change
    const countChange = current - previous;
    // Return the count change directly as percentage (count change = percentage value)
    // If change is +2, show 2%; if change is -5, show -5%
    return parseFloat(countChange.toFixed(1));
  };

  const formatRelativeTime = (date) => {
    if (!date) return 'N/A';
    const now = new Date();
    const past = new Date(date);
    const diffInMs = now - past;
    const diffInMin = Math.floor(diffInMs / (1000 * 60));
    const diffInHrs = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMin < 1) return 'Just now';
    if (diffInMin < 60) return `${diffInMin} min ago`;
    if (diffInHrs < 24) return `${diffInHrs} hour${diffInHrs > 1 ? 's' : ''} ago`;
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  const generateTrendPath = (growth) => {
    const growthValue = parseFloat(growth) || 0;
    const normalizedGrowth = Math.max(-50, Math.min(50, growthValue));
    const scaleFactor = normalizedGrowth / 50;
    const startY = 35;
    const endYOffset = -scaleFactor * 20;
    const endY = startY + endYOffset;
    const midY = startY + (endYOffset * 0.3);
    const path = `M10,${startY} C25,${startY - scaleFactor * 3} 35,${midY} 50,${midY + scaleFactor * 5} S80,${endY + 5} 90,${endY}`;
    return { points: path, endX: 85, endY: Math.round(endY) };
  };

  const fetchDashboardData = async () => {
    try {
      const [adminsRes, usersRes, templatesRes, uploadsRes] = await Promise.all([
        axiosData.get('users?type=admin').catch(() => ({ data: { data: [] } })),
        axiosData.get('users').catch(() => ({ data: { data: [] } })),
        axiosData.get('photomerge/templates').catch(() => ({ data: [] })),
        axiosData.get('upload/all').catch(() => ({ data: [] })),
      ]);

      const admins = adminsRes.data?.data || [];
      const allUsers = usersRes.data?.data || [];
      const templates = templatesRes.data || [];
      const uploads = uploadsRes.data || [];

      const nonAdminUsers = allUsers.filter(u => u.type !== 'admin' && u.type !== 'superadmin');

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      todayStart.setHours(0, 0, 0, 0);
      const yesterdayStart = new Date(todayStart);
      yesterdayStart.setDate(yesterdayStart.getDate() - 1);

      const uploadsToday = uploads.filter(m => {
        const d = new Date(m.date || m.createdAt);
        return m.source === 'photo merge app' && d >= todayStart;
      }).length;
      const uploadsYesterday = uploads.filter(m => {
        const d = new Date(m.date || m.createdAt);
        return m.source === 'photo merge app' && d >= yesterdayStart && d < todayStart;
      }).length;

      // Growth for users/admins/templates based on last 30 days vs previous 30 days
      const last30Days = new Date(todayStart);
      last30Days.setDate(last30Days.getDate() - 30);
      const last60Days = new Date(todayStart);
      last60Days.setDate(last60Days.getDate() - 60);

      const admins30 = admins.filter(a => new Date(a.createdAt) >= last30Days).length;
      const adminsPrev30 = admins.filter(a => {
        const d = new Date(a.createdAt);
        return d >= last60Days && d < last30Days;
      }).length;

      const users30 = nonAdminUsers.filter(u => new Date(u.createdAt) >= last30Days).length;
      const usersPrev30 = nonAdminUsers.filter(u => {
        const d = new Date(u.createdAt);
        return d >= last60Days && d < last30Days;
      }).length;

      const getTemplateDate = (t) => new Date(t.createdAt || t.createdDate || t.createdDateTime || t.updatedDate || Date.now());
      const templates30 = templates.filter(t => getTemplateDate(t) >= last30Days).length;
      const templatesPrev30 = templates.filter(t => {
        const d = getTemplateDate(t);
        return d >= last60Days && d < last30Days;
      }).length;

      setStats({
        totalAdmins: admins.length || 0,
        totalUsers: nonAdminUsers.length || 0,
        totalTemplates: templates.length || 0,
        uploadsToday: uploadsToday || 0,
        adminsGrowth: calculateGrowth(admins30, adminsPrev30),
        usersGrowth: calculateGrowth(users30, usersPrev30),
        templatesGrowth: calculateGrowth(templates30, templatesPrev30),
        uploadsGrowth: calculateGrowth(uploadsToday, uploadsYesterday),
      });

      // Recent activities from real data
      const latestAdmin = admins.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
      const latestUser = nonAdminUsers.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
      const latestTemplate = templates.slice().sort((a, b) => getTemplateDate(b) - getTemplateDate(a))[0];
      const latestUpload = uploads
        .filter(m => m.source === 'photo merge app')
        .slice()
        .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))[0];

      setRecentActivities([
        latestAdmin ? { title: 'New Admin Created', desc: `Admin "${latestAdmin.name || latestAdmin.email || 'New Admin'}" created`, time: formatRelativeTime(latestAdmin.createdAt), icon: <Shield size={16} />, color: '#7B61FF', bg: '#F2EFFF' } : null,
        latestTemplate ? { title: 'Template Updated', desc: `Template "${latestTemplate.templatename || 'Template'}" updated`, time: formatRelativeTime(getTemplateDate(latestTemplate)), icon: <FileText size={16} />, color: '#FF9F43', bg: '#FFF3E0' } : null,
        latestUpload ? { title: 'New Upload', desc: `Upload by "${latestUpload.name || 'Customer'}"`, time: formatRelativeTime(latestUpload.date || latestUpload.createdAt), icon: <UploadCloud size={16} />, color: '#00C9FF', bg: '#E0F7FA' } : null,
        latestUser ? { title: 'New User', desc: `User "${latestUser.name || latestUser.email || 'New User'}" joined`, time: formatRelativeTime(latestUser.createdAt), icon: <TrendingUp size={16} />, color: '#25D366', bg: '#E8F5E9' } : null,
      ].filter(Boolean));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const adminsTrend = generateTrendPath(stats.adminsGrowth);
  const usersTrend = generateTrendPath(stats.usersGrowth);
  const templatesTrend = generateTrendPath(stats.templatesGrowth);
  const uploadsTrend = generateTrendPath(stats.uploadsGrowth);

  const kpis = [
    {
      label: 'Total Admins',
      value: stats.totalAdmins,
      change: `${stats.adminsGrowth >= 0 ? '+' : ''}${stats.adminsGrowth}%`,
      icon: <Shield size={20} />,
      bgColor: '#F2EFFF',
      trendColor: '#7B61FF',
      positive: stats.adminsGrowth >= 0,
      points: adminsTrend.points,
      endX: adminsTrend.endX, endY: adminsTrend.endY
    },
    {
      label: 'Total Users',
      value: stats.totalUsers,
      change: `${stats.usersGrowth >= 0 ? '+' : ''}${stats.usersGrowth}%`,
      icon: <Users size={20} />,
      bgColor: '#E8F5E9',
      trendColor: '#25D366',
      positive: stats.usersGrowth >= 0,
      points: usersTrend.points,
      endX: usersTrend.endX, endY: usersTrend.endY
    },
    {
      label: 'Total Templates',
      value: stats.totalTemplates,
      change: `${stats.templatesGrowth >= 0 ? '+' : ''}${stats.templatesGrowth}%`,
      icon: <FileText size={20} />,
      bgColor: '#FFF3E0',
      trendColor: '#FF9F43',
      positive: stats.templatesGrowth >= 0,
      points: templatesTrend.points,
      endX: templatesTrend.endX, endY: templatesTrend.endY
    },
    {
      label: 'Uploads Today',
      value: stats.uploadsToday,
      change: `${stats.uploadsGrowth >= 0 ? '+' : ''}${stats.uploadsGrowth}%`,
      icon: <UploadCloud size={20} />,
      bgColor: '#E0F7FA',
      trendColor: '#00C9FF',
      positive: stats.uploadsGrowth >= 0,
      points: uploadsTrend.points,
      endX: uploadsTrend.endX, endY: uploadsTrend.endY
    }
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
