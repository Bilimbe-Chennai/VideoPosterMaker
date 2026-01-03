import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Card from '../Components/Card';
import LineAnalytics from '../Components/charts/LineAnalytics';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import {
  Users,
  Image,
  Share2,
  Activity,
  ChevronRight,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingBag,
  Download,
  Eye,
  Info,
  Facebook,
  MoreHorizontal
} from 'react-feather';
import useAxios from '../../useAxios';

const DashboardContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const WelcomeMessage = styled.div`
  h1 {
    margin-bottom: 4px;
    font-size: 24px;
    font-weight: 700;
  }
  p {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 14px;
  }
`;

const FilterWrapper = styled.div`
  display: flex;
  background: ${({ theme }) => theme.colors.primaryLight};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 4px;
  gap: 4px;
`;

const FilterButton = styled.button`
  padding: 8px 16px;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  border: none;
  background: ${({ $active, theme }) => $active ? theme.colors.primaryDark : 'transparent'};
  color: ${({ $active, theme }) => $active ? 'white' : theme.colors.textSecondary};
  font-size: 12px;
  font-weight: 600;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ $active, theme }) => $active ? theme.colors.primaryDark : theme.colors.borderLight};
  }
`;

const KPIBox = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const KPICard = styled(Card)`
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
  gap: ${({ theme }) => theme.spacing.lg};
`;

const ChartCard = styled(Card)`
  grid-column: span 8;
  @media (max-width: 1200px) {
    grid-column: span 12;
  }
`;

const ListCard = styled(Card)`
  grid-column: span 6;
  @media (max-width: 1200px) {
    grid-column: span 12;
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
  
  .action {
    font-size: 13px;
    color: ${({ theme }) => theme.colors.primaryDark};
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
  }
`;

const ListItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-radius: 20px;
  margin-bottom: 12px;
  background: ${({ theme }) => theme.colors.primaryLight};
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateX(5px);
    background: white;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  }
`;

const ListMain = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.gradientPrimary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
`;

const ListInfo = styled.div`
  h4 {
    font-size: 14px;
    font-weight: 700;
    margin: 0 0 2px 0;
  }
`;

const TooltipContainer = styled.div`
  background: rgba(30, 30, 30, 0.95);
  backdrop-filter: blur(12px);
  padding: 16px 20px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  min-width: 140px;
`;

const TooltipLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 600;
  text-transform: capitalize;
`;

const TooltipValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #FFF;
  letter-spacing: -0.5px;
  display: flex;
  align-items: baseline;
  gap: 4px;
  
  span {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.5);
    font-weight: 500;
  }
`;

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <TooltipContainer>
        <TooltipLabel>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: data.payload.color }} />
          {data.name}
        </TooltipLabel>
        <TooltipValue>
          {data.value}<span>%</span>
        </TooltipValue>
      </TooltipContainer>
    );
  }
  return null;
};

const DonutCard = styled(Card)`
  grid-column: span 4;
  padding: 24px;
  background-color: #1A1A1A; /* Dark Theme as per screenshot */
  color: white;
  min-height: 400px;
  border-radius: 32px;
  position: relative;
  display: flex;
  flex-direction: column;

  @media (max-width: 1200px) {
    grid-column: span 6;
  }
  @media (max-width: 768px) {
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

const LegendContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: auto;
  flex-wrap: wrap;
`;

const LegendItem = styled.div`
  text-align: center;
  
  .dot {
    width: 12px;
    height: 12px;
    border-radius: 4px;
    background: ${({ $color }) => $color};
    margin: 0 auto 8px;
  }
  
  .value {
    font-size: 16px;
    font-weight: 700;
    display: block;
    margin-bottom: 4px;
  }
  
  .label {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.6);
    text-transform: capitalize;
  }
`;




const ListValue = styled.div`
  text-align: right;
  .val {
    font-size: 14px;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.primaryDark};
  }
  .sub {
    font-size: 10px;
    color: ${({ theme }) => theme.colors.textLight};
    font-weight: 600;
    text-transform: uppercase;
  }
`;

const TimeTag = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textLight};
  font-weight: 600;
`;

const ActivityIcon = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.accentPurple + '30'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.primaryDark};
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 1px solid #F0F0F0;
  margin-bottom: 24px;
`;

const ChartTabs = styled.div`
display: flex;
gap: 24px;
`;

const ChartTab = styled.button`
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 600;
  color: ${({ $active }) => $active ? '#1A1A1A' : '#999'};
  padding-bottom: 8px;
  position: relative;
  transition: all 0.2s;
  
  ${({ $active }) => $active && `
    &::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      width: 100%;
      height: 2px;
      background: #1A1A1A;
    }
  `}
`;

const DropdownContainer = styled.div`
position: relative;
`;

const DropdownButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: white;
  border: 1px solid #EEE;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 700;
  color: #1A1A1A;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #F9F9F9;
    border-color: #DDD;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid #EEE;
  padding: 8px;
  min-width: 140px;
  z-index: 100;
  display: ${({ $show }) => $show ? 'block' : 'none'};
  animation: fadeIn 0.2s ease;

  @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
  }
`;

const DropdownItem = styled.div`
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: ${({ $active }) => $active ? '#1A1A1A' : '#666'};
  background: ${({ $active }) => $active ? '#F5F5F5' : 'transparent'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #F5F5F5;
    color: #1A1A1A;
  }
`;

const Dashboard = () => {
  const [activeFilter, setActiveFilter] = useState('7 Day');
  const [activeChartTab, setActiveChartTab] = useState('Photos');
  const [activePeriod, setActivePeriod] = useState('Last week');
  const [showDropdown, setShowDropdown] = useState(false);
  const [shareDistribution, setShareDistribution] = useState([
    { name: 'WhatsApp', value: 0, color: '#E8DFF1', fill: '#E8DFF1' },
    { name: 'Instagram', value: 0, color: '#EEF6E8', fill: '#EEF6E8' },
    { name: 'Facebook', value: 0, color: '#FEF7E0', fill: '#FEF7E0' },
    { name: 'Twitter', value: 0, color: '#DFF6FE', fill: '#DFF6FE' },
    { name: 'Download', value: 0, color: '#FCEADF', fill: '#FCEADF' }
  ]);
  const navigate = useNavigate();

  const axiosData = useAxios();
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalPhotos: 0,
    photosToday: 0,
    totalShares: 0,
    conversion: '0%'
  });
  const [topCustomersData, setTopCustomersData] = useState([]);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axiosData.get("upload/all");

        // 1. Filter for Photo Merge App
        const rawItems = response.data.filter(item => item.source === 'Photo Merge App');
        const totalPhotos = rawItems.length;

        // 2. Aggregate Duplicate Customers
        const customersMap = {};
        let todayCount = 0;

        // Get start of today for comparison
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        rawItems.forEach(item => {
          const phone = item.whatsapp || item.mobile || '';
          const key = phone && phone !== 'N/A' ? phone : (item.name || 'Unknown');

          // Check for valid date
          const rawDate = item.date || item.createdAt || new Date();
          const itemTime = new Date(rawDate).getTime();

          if (itemTime >= startOfToday.getTime()) {
            todayCount++;
          }

          if (!customersMap[key]) {
            customersMap[key] = {
              name: item.name || 'Unknown',
              visitCount: 0,
              photoCount: 0,
              shareCount: 0,
              initial: (item.name || 'U').charAt(0).toUpperCase()
            };
          }

          const itemShares = (item.whatsappsharecount || 0) +
            (item.facebooksharecount || 0) +
            (item.twittersharecount || 0) +
            (item.instagramsharecount || 0) +
            (item.downloadcount || 0);

          customersMap[key].visitCount += 1;
          customersMap[key].photoCount += 1;
          customersMap[key].shareCount += itemShares;
        });

        // 3. Share Distribution Calculation
        let counts = {
          whatsapp: 0,
          facebook: 0,
          twitter: 0,
          instagram: 0,
          download: 0
        };

        rawItems.forEach(item => {
          counts.whatsapp += (item.whatsappsharecount || 0);
          counts.facebook += (item.facebooksharecount || 0);
          counts.twitter += (item.twittersharecount || 0);
          counts.instagram += (item.instagramsharecount || 0);
          counts.download += (item.downloadcount || 0);
        });

        const totalShares = counts.whatsapp + counts.facebook + counts.twitter + counts.instagram + counts.download;

        if (totalShares > 0) {
          const distribution = [
            { name: 'WhatsApp', value: parseFloat(((counts.whatsapp / totalShares) * 100).toFixed(1)), color: '#E8DFF1', fill: '#E8DFF1' },
            { name: 'Instagram', value: parseFloat(((counts.instagram / totalShares) * 100).toFixed(1)), color: '#EEF6E8', fill: '#EEF6E8' },
            { name: 'Facebook', value: parseFloat(((counts.facebook / totalShares) * 100).toFixed(1)), color: '#FEF7E0', fill: '#FEF7E0' },
            { name: 'Twitter', value: parseFloat(((counts.twitter / totalShares) * 100).toFixed(1)), color: '#DFF6FE', fill: '#DFF6FE' },
            { name: 'Download', value: parseFloat(((counts.download / totalShares) * 100).toFixed(1)), color: '#FCEADF', fill: '#FCEADF' }
          ];
          setShareDistribution(distribution);
        }

        // Stats Update
        const totalCustomers = Object.keys(customersMap).length;
        setStats({
          totalCustomers: totalCustomers,
          totalPhotos: totalPhotos,
          photosToday: todayCount,
          totalShares: totalShares,
          conversion: '18.5%'
        });

        // Top Customers Update
        const sortedCustomers = Object.values(customersMap)
          .sort((a, b) => b.shareCount - a.shareCount) // Sort by most shares
          .slice(0, 4)
          .map(cust => ({
            name: cust.name,
            photos: cust.photoCount,
            shares: cust.shareCount,
            value: cust.visitCount,
            initial: cust.initial
          }));

        setTopCustomersData(sortedCustomers);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  const kpis = [
    {
      label: 'Total Customers',
      value: stats.totalCustomers.toLocaleString(),
      change: '+12.5%',
      icon: <Users size={20} />,
      bgColor: '#FFF0E5',
      trendColor: '#D47D52',
      positive: true,
      points: "M10,40 C25,38 35,45 50,35 S80,10 90,15",
      endX: 85, endY: 14
    },
    {
      label: 'Total Photos',
      value: stats.totalPhotos ? stats.totalPhotos.toLocaleString() : '0',
      change: '+23.1%',
      icon: <Image size={20} />,
      bgColor: '#F7F2FA',
      trendColor: '#8E44AD',
      positive: true,
      points: "M10,42 C25,35 35,40 50,30 S85,5 90,10",
      endX: 85, endY: 8
    },
    {
      label: 'Photos Today',
      value: stats.photosToday.toLocaleString(),
      change: '+8.2%',
      icon: <Activity size={20} />,
      bgColor: '#F4F9E9',
      trendColor: '#6B8E23',
      positive: true,
      points: "M10,35 C25,38 35,25 50,30 S80,25 90,28",
      endX: 85, endY: 27
    },
    {
      label: 'Total Shares',
      value: stats.totalShares.toLocaleString(),
      change: '+2.1%',
      icon: <Share2 size={20} />,
      bgColor: '#FFF9E5',
      trendColor: '#B58B00',
      positive: true,
      points: "M10,38 C25,35 35,38 50,32 S80,20 90,25",
      endX: 85, endY: 23
    },
  ];



  const recentActivities = [
    { user: 'Priya Sharma', action: 'Shared Kanchipuram Saree', time: '10 min ago', icon: <Share2 size={16} /> },
    { user: 'Rajesh Kumar', action: 'Tried Lehenga collection', time: '25 min ago', icon: <Info size={16} /> },
    { user: 'Anjali Patel', action: 'Downloaded 5 photos', time: '1 hour ago', icon: <Download size={16} /> },
    { user: 'Suresh Nair', action: 'Shared on Facebook', time: '2 hours ago', icon: <Facebook size={16} /> },
  ];

  return (
    <DashboardContainer>
      <DashboardHeader>
        <WelcomeMessage>
          <h1>Welcome back, {user.name || 'Admin'} 👋</h1>
          <p>Here's what's happening with your store today.</p>
        </WelcomeMessage>

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
                <KPIValue>{kpi.value}</KPIValue>
                <TrendIndicator $color={kpi.trendColor} $positive={kpi.positive}>
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
        <ChartCard>
          <ChartHeader>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Daily Performance</h3>
            <ChartTabs>
              {['Photos', 'Shares'].map(tab => (
                <ChartTab
                  key={tab}
                  $active={activeChartTab === tab}
                  onClick={() => setActiveChartTab(tab)}
                >
                  {tab}
                </ChartTab>
              ))}
            </ChartTabs>
            <DropdownContainer>
              <DropdownButton onClick={() => setShowDropdown(!showDropdown)}>
                {activePeriod} <ChevronDown size={14} style={{ transform: showDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </DropdownButton>
              <DropdownMenu $show={showDropdown}>
                {['Last week', 'This week'].map(p => (
                  <DropdownItem
                    key={p}
                    $active={activePeriod === p}
                    onClick={() => {
                      setActivePeriod(p);
                      setShowDropdown(false);
                    }}
                  >
                    {p}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </DropdownContainer>
          </ChartHeader>
          <div style={{ height: '300px' }}>
            <LineAnalytics activeTab={activeChartTab} period={activePeriod} />
          </div>
        </ChartCard>



        {/* Share Platform Distribution */}
        <DonutCard>
          <DonutHeader>
            <h3>Share Platform Distribution</h3>
            <MoreHorizontal color="white" size={20} style={{ opacity: 0.7, cursor: 'pointer' }} />
          </DonutHeader>

          <div style={{ flex: 1, minHeight: '200px', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={shareDistribution}
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  startAngle={90}
                  endAngle={-270}
                >
                  {shareDistribution.map((entry, index) => (
                    <Cell key={`cell - ${index} `} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} cursor={false} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <LegendContainer>
            {shareDistribution.map((item) => (
              <LegendItem key={item.name} $color={item.color}>
                <div className="dot" />
                <span className="value">{item.value}%</span>
                <span className="label">{item.name}</span>
              </LegendItem>
            ))}
          </LegendContainer>
        </DonutCard>

        <ListCard>
          <SectionHeader>
            <h3>Top Customers</h3>
            <div className="action" onClick={() => navigate('/admin-v2/customers')} style={{ cursor: 'pointer' }}>
              View All <ChevronRight size={14} />
            </div>
          </SectionHeader>
          {topCustomersData.map((c, i) => (
            <ListItem key={i}>
              <ListMain>
                <Avatar>{c.initial}</Avatar>
                <ListInfo>
                  <h4>{c.name}</h4>
                  <p>{c.photos} photos • {c.shares} shares</p>
                </ListInfo>
              </ListMain>
              <ListValue>
                <div className="val">{c.value} Visits</div>
                <div className="sub">Total Visits</div>
              </ListValue>
            </ListItem>
          ))}
        </ListCard>

        <ListCard>
          <SectionHeader>
            <h3>Recent Activities</h3>
          </SectionHeader>
          {recentActivities.map((a, i) => (
            <ListItem key={i}>
              <ListMain>
                <ActivityIcon>{a.icon}</ActivityIcon>
                <ListInfo>
                  <p style={{ fontSize: '14px' }}><strong>{a.user}</strong> {a.action}</p>
                </ListInfo>
              </ListMain>
              <TimeTag>{a.time}</TimeTag>
            </ListItem>
          ))}
        </ListCard>
      </MainGrid>
    </DashboardContainer>
  );
};

export default Dashboard;
