import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Card from '../Components/Card';
import LineAnalytics from '../Components/charts/LineAnalytics';
import MetricCircularCard from '../Components/charts/MetricCircularCard';

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
  MoreHorizontal,
  Video
} from 'react-feather';
import useAxios from '../../useAxios';
import { formatDate, getStoredDateFormat } from '../../utils/dateUtils';
import { isVideoType, getAccessType } from '../../utils/accessTypeUtils';

const DashboardContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
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
  color: #0F0F0F;
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
    const count = data.payload?.count || data.count || 0;
    const percentage = data.value || 0;
    return (
      <TooltipContainer>
        <TooltipLabel>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: data.payload.color }} />
          {data.name}
        </TooltipLabel>
        <TooltipValue>
          Count: {count}
        </TooltipValue>
        <TooltipValue>
          {percentage}<span>%</span>
        </TooltipValue>
      </TooltipContainer>
    );
  }
  return null;
};

const DonutCard = styled(Card)`
  grid-column: span 4;
  padding: 24px;
  background-color: #0F0F0F; /* Dark Theme as per screenshot */
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
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #E8E9EA;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0F0F0F;
  border: 1px solid #D8D8D8;
  flex-shrink: 0;
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 1px solid #D8D8D8;
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
  color: ${({ $active }) => $active ? '#0F0F0F' : '#777'};
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
      background: #0F0F0F;
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
  border: 1px solid #D0D0D0;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 700;
  color: #0F0F0F;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #E8E8E8;
    border-color: #C0C0C0;
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
  border: 1px solid #D0D0D0;
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
  color: ${({ $active }) => $active ? '#0F0F0F' : '#555'};
  background: ${({ $active }) => $active ? '#E5E5E5' : 'transparent'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #E5E5E5;
    color: #0F0F0F;
  }
`;

const Dashboard = () => {
  const [activeFilter, setActiveFilter] = useState('7 Day');
  const [activeChartTab, setActiveChartTab] = useState('Photos');
  const [activePeriod, setActivePeriod] = useState('This week');
  const [showDropdown, setShowDropdown] = useState(false);
  const [shareDistribution, setShareDistribution] = useState([
    { name: 'WhatsApp', value: 0, color: '#10B981', fill: '#10B981' },
    { name: 'Instagram', value: 0, color: '#EC4899', fill: '#EC4899' },
    { name: 'Facebook', value: 0, color: '#3B82F6', fill: '#3B82F6' },
    { name: 'Twitter', value: 0, color: '#06B6D4', fill: '#06B6D4' },
    { name: 'Download', value: 0, color: '#F97316', fill: '#F97316' }
  ]);
  const [trends, setTrends] = useState({});
  const [trendsPhotos, setTrendsPhotos] = useState({});
  const [trendsVideos, setTrendsVideos] = useState({});
  const [recentActivities, setRecentActivities] = useState([]);
  const navigate = useNavigate();

  const formatRelativeTime = (date) => {
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

  // Helper function to generate SVG trend path based on growth value
  const generateTrendPath = (growth) => {
    const growthValue = parseFloat(growth) || 0;

    // Normalize growth to a 0-100 scale for better visualization
    const normalizedGrowth = Math.max(-50, Math.min(50, growthValue));
    const scaleFactor = normalizedGrowth / 50; // -1 to 1

    // Calculate Y positions (lower Y = higher on screen)
    const startY = 35; // Middle baseline
    const endYOffset = -scaleFactor * 20; // Move up/down based on growth
    const endY = startY + endYOffset;

    // Create smooth curve points
    const midY = startY + (endYOffset * 0.3);

    const path = `M10,${startY} C25,${startY - scaleFactor * 3} 35,${midY} 50,${midY + scaleFactor * 5} S80,${endY + 5} 90,${endY}`;

    return {
      points: path,
      endX: 85,
      endY: Math.round(endY)
    };
  };

  const axiosData = useAxios();
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalPhotos: 0,
    totalVideos: 0,
    totalShares: 0,
    totalDownloads: 0,
    conversion: '0%',
    customerGrowth: 0,
    photosGrowth: 0,
    photosTodayGrowth: 0,
    totalVideosGrowth: 0,
    sharesGrowth: 0
  });
  const [topCustomersData, setTopCustomersData] = useState([]);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // STEP 1: Fetch Templates to get accessType mapping
        let templateAccessTypeMap = {};
        try {
          const templatesResponse = await axiosData.get(`photomerge/templates?adminid=${user._id || user.id}`);
          const templates = Array.isArray(templatesResponse.data) ? templatesResponse.data : [];
          templates.forEach(template => {
            if (template.templatename) {
              templateAccessTypeMap[template.templatename] = template.accessType || 'photomerge';
            }
          });
        } catch (templatesError) {
          // Error fetching templates - will use fallback logic
        }

        // STEP 2: Fetch DATA first (completely independent of metrics)
        // Optimized: Fetch only last 1000 items for dashboard (faster load)
        // Metrics will fetch full data in background if needed
        const response = await axiosData.get(`upload/all?adminid=${user._id || user.id}&page=1&limit=1000`);

        // STEP 3: Fetch METRICS separately (only for growth percentages)
        // Metrics do NOT affect data display
        let apiMetrics = {};
        try {
          const metricsResponse = await axiosData.get(`upload/dashboard-metrics?adminid=${user._id || user.id}`);
          apiMetrics = metricsResponse.data?.metrics?.dashboard || {};
        } catch (metricsError) {
          // Error fetching metrics - will use defaults for growth
          // Metrics error should NOT affect data display
        }

        // DATA PROCESSING: Handle both paginated and non-paginated responses
        // Don't filter by source - show all available data
        const dataArray = Array.isArray(response.data?.data)
          ? response.data.data
          : (Array.isArray(response.data) ? response.data : []);

        const rawItems = dataArray.filter(item =>
          (item.source && item.source.toLowerCase() === 'photo merge app') ||
          (item.source && item.source.toLowerCase() === 'video merge app')
        );

        const customersMap = {};
        const dailyTrends = {};
        const dailyTrendsPhotos = {};
        const dailyTrendsVideos = {};
        let photoCount = 0;
        let videoCount = 0;

        // Get start of today for comparison
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        rawItems.forEach(item => {
          const phone = item.whatsapp || item.mobile || '';
          const key = phone && phone !== 'N/A' ? phone : (item.name || 'Unknown');

          // Date extraction & Trend isolation
          const rawDate = item.date || item.createdAt || new Date();
          const itemDate = new Date(rawDate);
          const dateKey = itemDate.toISOString().split('T')[0]; // YYYY-MM-DD

          if (!dailyTrends[dateKey]) {
            dailyTrends[dateKey] = { photos: 0, shares: 0, downloads: 0 };
          }
          if (!dailyTrendsPhotos[dateKey]) {
            dailyTrendsPhotos[dateKey] = { photos: 0, shares: 0, downloads: 0 };
          }
          if (!dailyTrendsVideos[dateKey]) {
            dailyTrendsVideos[dateKey] = { photos: 0, shares: 0, downloads: 0 };
          }

          // Media Type logic based on accessType from template (future-proof)
          const isVideo = isVideoType(item, templateAccessTypeMap, { enableFallback: true });

          if (isVideo) {
            videoCount++;
            dailyTrendsVideos[dateKey].photos += 1;
          } else {
            photoCount++;
            dailyTrendsPhotos[dateKey].photos += 1;
          }

          if (!customersMap[key]) {
            customersMap[key] = {
              name: item.name || 'Unknown',
              visitCount: 0,
              photoCount: 0,
              shareCount: 0,
              downloadCount: 0,
              initial: (item.name || 'U').charAt(0).toUpperCase()
            };
          }

          const itemShares = (item.whatsappsharecount || 0) +
            (item.facebooksharecount || 0) +
            (item.twittersharecount || 0) +
            (item.instagramsharecount || 0);
          const itemDownloads = item.downloadcount || 0;

          customersMap[key].visitCount += 1;
          customersMap[key].photoCount += 1;
          customersMap[key].shareCount += itemShares;
          customersMap[key].downloadCount = (customersMap[key].downloadCount || 0) + itemDownloads;

          dailyTrends[dateKey].photos += 1;
          dailyTrends[dateKey].shares += itemShares;
          dailyTrends[dateKey].downloads = (dailyTrends[dateKey].downloads || 0) + itemDownloads;

          // Update separate trends for photos and videos
          if (isVideo) {
            dailyTrendsVideos[dateKey].shares += itemShares;
            dailyTrendsVideos[dateKey].downloads = (dailyTrendsVideos[dateKey].downloads || 0) + itemDownloads;
          } else {
            dailyTrendsPhotos[dateKey].shares += itemShares;
            dailyTrendsPhotos[dateKey].downloads = (dailyTrendsPhotos[dateKey].downloads || 0) + itemDownloads;
          }
        });

        setTrends(dailyTrends);
        // Store separate trends for photos and videos
        setTrendsPhotos(dailyTrendsPhotos);
        setTrendsVideos(dailyTrendsVideos);

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

        const totalShares = counts.whatsapp + counts.facebook + counts.twitter + counts.instagram;
        const totalDownloads = counts.download;
        const totalEngagement = totalShares + totalDownloads;

        if (totalEngagement > 0) {
          const distribution = [
            { name: 'WhatsApp', value: parseFloat(((counts.whatsapp / totalEngagement) * 100).toFixed(1)), count: counts.whatsapp, color: '#10B981', fill: '#10B981' },
            { name: 'Instagram', value: parseFloat(((counts.instagram / totalEngagement) * 100).toFixed(1)), count: counts.instagram, color: '#EC4899', fill: '#EC4899' },
            { name: 'Facebook', value: parseFloat(((counts.facebook / totalEngagement) * 100).toFixed(1)), count: counts.facebook, color: '#3B82F6', fill: '#3B82F6' },
            { name: 'Twitter', value: parseFloat(((counts.twitter / totalEngagement) * 100).toFixed(1)), count: counts.twitter, color: '#06B6D4', fill: '#06B6D4' },
            { name: 'Download', value: parseFloat(((counts.download / totalEngagement) * 100).toFixed(1)), count: counts.download, color: '#F97316', fill: '#F97316' }
          ];
          setShareDistribution(distribution);
        }

        // DATA VALUES: Calculated from actual data (NOT affected by metrics)
        // These values are completely independent and always show correctly
        const totalCustomers = Object.keys(customersMap).length;
        const finalStats = {
          // DATA VALUES - Always calculated from actual data, never from metrics
          totalCustomers: totalCustomers,
          totalPhotos: photoCount,
          totalVideos: videoCount,
          totalShares: totalShares,
          totalDownloads: totalDownloads,
          conversion: '18.5%',
          // METRICS VALUES - Only for growth percentages, separate from data
          // If metrics API fails, growth will be 0 but data will still display
          customerGrowth: apiMetrics.totalCustomers?.growth ?? 0,
          photosGrowth: apiMetrics.totalPhotos?.growth ?? 0,
          photosTodayGrowth: apiMetrics.photosToday?.growth ?? 0,
          totalVideosGrowth: 0, // Split metrics might not be available
          sharesGrowth: apiMetrics.totalShares?.growth ?? 0
        };
        setStats(finalStats);

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

        // 4. Recent Activities Construction
        const constructedActivities = rawItems
          .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
          .slice(0, 4)
          .map(item => {
            const name = item.name || 'Anonymous';
            let actionText = '';
            let icon = <Image size={18} />;

            if (item.whatsappsharecount > 0) {
              actionText = `Shared ${item.template_name || 'Design'} via WhatsApp`;
              icon = <Share2 size={18} />;
            } else if (item.facebooksharecount > 0) {
              actionText = `Shared on Facebook`;
              icon = <Facebook size={18} />;
            } else if (item.downloadcount > 0) {
              actionText = `Downloaded ${item.downloadcount > 1 ? item.downloadcount + ' photos' : 'a photo'}`;
              icon = <Download size={18} />;
            } else {
              actionText = `Tried ${item.template_name || 'Design'} collection`;
              icon = <Info size={18} />;
            }

            return {
              user: name,
              action: actionText,
              time: formatRelativeTime(item.date || item.createdAt),
              icon: icon
            };
          });

        setRecentActivities(constructedActivities);

      } catch (error) {
        // Set default stats even on error so UI shows something
        setStats({
          totalCustomers: 0,
          totalPhotos: 0,
          totalVideos: 0,
          totalShares: 0,
          totalDownloads: 0,
          conversion: '0%',
          customerGrowth: 0,
          photosGrowth: 0,
          photosTodayGrowth: 0,
          totalVideosGrowth: 0,
          sharesGrowth: 0
        });
      }
    };

    fetchDashboardData();
  }, []);

  const customerTrend = generateTrendPath(stats.customerGrowth ?? 0);
  const photosTrend = generateTrendPath(stats.photosGrowth ?? 0);
  const photosTodayTrend = generateTrendPath(stats.photosTodayGrowth ?? 0);
  const sharesTrend = generateTrendPath(stats.sharesGrowth ?? 0);

  const kpis = [
    {
      label: 'Total Customers',
      value: (stats.totalCustomers ?? 0).toLocaleString(),
      change: `${(stats.customerGrowth ?? 0) >= 0 ? '+' : ''}${stats.customerGrowth ?? 0}%`,
      icon: <Users size={20} />,
      bgColor: '#FEF3C7',
      trendColor: '#F59E0B',
      positive: (stats.customerGrowth ?? 0) >= 0,
      points: customerTrend.points,
      endX: customerTrend.endX,
      endY: customerTrend.endY
    },
    {
      label: 'Total Photos',
      value: (stats.totalPhotos ?? 0).toLocaleString(),
      change: `${(stats.photosGrowth ?? 0) >= 0 ? '+' : ''}${stats.photosGrowth ?? 0}%`,
      icon: <Image size={20} />,
      bgColor: '#E8D5FF',
      trendColor: '#8B5CF6',
      positive: (stats.photosGrowth ?? 0) >= 0,
      points: photosTrend.points,
      endX: photosTrend.endX,
      endY: photosTrend.endY
    },
    {
      label: 'Total Videos',
      value: (stats.totalVideos ?? 0).toLocaleString(),
      change: `${(stats.totalVideosGrowth ?? 0) >= 0 ? '+' : ''}${stats.totalVideosGrowth ?? 0}%`,
      icon: <Video size={20} />,
      bgColor: '#D1FAE5',
      trendColor: '#10B981',
      positive: (stats.totalVideosGrowth ?? 0) >= 0,
      points: photosTodayTrend.points,
      endX: photosTodayTrend.endX,
      endY: photosTodayTrend.endY
    },
    {
      label: 'Total Shares',
      value: (stats.totalShares ?? 0).toLocaleString(),
      change: `${(stats.sharesGrowth ?? 0) >= 0 ? '+' : ''}${stats.sharesGrowth ?? 0}%`,
      icon: <Share2 size={20} />,
      bgColor: '#FED7AA',
      trendColor: '#F97316',
      positive: (stats.sharesGrowth ?? 0) >= 0,
      points: sharesTrend.points,
      endX: sharesTrend.endX,
      endY: sharesTrend.endY
    },
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
              {['Photos', 'Videos'].map(tab => (
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
          <div style={{ height: '350px' }}>
            <LineAnalytics
              data={activeChartTab === 'Photos' ? trendsPhotos : trendsVideos}
              period={activePeriod}
              activeTab="photos"
            />
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
                    <Cell key={`cell-${index}`} fill={entry.color} />
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
            <div className="action" onClick={() => navigate('/admin/customers')} style={{ cursor: 'pointer' }}>
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
            <h3 style={{ fontSize: '20px' }}>Recent Activities</h3>
            <div className="action" onClick={() => navigate('/admin/share-tracking')} style={{ cursor: 'pointer' }}>
              View All <ChevronRight size={14} />
            </div>
          </SectionHeader>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {recentActivities.length > 0 ? recentActivities.map((a, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 0',
                borderBottom: i === recentActivities.length - 1 ? 'none' : '1px solid #D8D8D8'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <ActivityIcon>{a.icon}</ActivityIcon>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <p style={{ margin: 0, fontSize: '15px', color: '#0F0F0F' }}>
                      <strong style={{ fontWeight: 700 }}>{a.user}</strong> <span style={{ color: '#3A4148' }}>{a.action}</span>
                    </p>
                  </div>
                </div>
                <TimeTag style={{ color: '#808080', fontSize: '12px' }}>{a.time}</TimeTag>
              </div>
            )) : (
              <p style={{ textAlign: 'center', color: '#777', padding: '20px' }}>No recent activities</p>
            )}
          </div>
        </ListCard>
      </MainGrid>
    </DashboardContainer>
  );
};

export default Dashboard;
