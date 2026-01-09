import React from 'react';
import styled from 'styled-components';
import Card from '../Components/Card';
import LineAnalytics from '../Components/charts/LineAnalytics';
import TrendAnalytics from '../Components/charts/TrendAnalytics';
import DonutActivity from '../Components/charts/DonutActivity';
import BarActivity from '../Components/charts/BarActivity';
import MetricCircularCard from '../Components/charts/MetricCircularCard';
import useAxios from '../../useAxios';
import { formatDate, getStoredDateFormat } from '../../utils/dateUtils';
import { PieChart, TrendingUp, Filter, Download, Image, Calendar, Share2, Star, User, Facebook, RefreshCw, BarChart2, AlertCircle, CheckCircle, XCircle } from 'react-feather';

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

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  backdrop-filter: blur(5px);
`;

const AlertModalContent = styled.div`
  background: white;
  width: 100%;
  max-width: 450px;
  padding: 32px;
  border-radius: 32px;
  position: relative;
  text-align: center;
`;

const AlertIconWrapper = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: ${props => {
    if (props.$type === 'success') return '#10B98120';
    if (props.$type === 'error') return '#EF444420';
    return '#F59E0B20';
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  color: ${props => {
    if (props.$type === 'success') return '#10B981';
    if (props.$type === 'error') return '#EF4444';
    return '#F59E0B';
  }};
`;

const AlertMessage = styled.div`
  font-size: 16px;
  color: #0F0F0F;
  margin-bottom: 32px;
  line-height: 1.6;
`;

const ModalActionFooter = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 24px;
`;

// Configuration Constants (can be fetched from API or settings in future)
const ANALYTICS_CONFIG = {
  timeRangeOptions: [1, 7, 30, 90],
  defaultTimeRange: 7,
  sessionCalculation: {
    avgTimePerPhoto: 150, // seconds (2.5 minutes)
    avgTimePerShare: 60   // seconds (1 minute)
  },
  topCategoriesLimit: 4,
  platforms: [
    { name: 'WhatsApp', key: 'WhatsApp', color: '#10B981', bgColor: '#D1FAE5', icon: 'Share2', growthKey: 'platformGrowth' },
    { name: 'Facebook', key: 'Facebook', color: '#F59E0B', bgColor: '#FEF3C7', icon: 'Facebook', growthKey: 'platformGrowth' },
    { name: 'Twitter', key: 'Twitter', color: '#3B82F6', bgColor: '#DBEAFE', icon: 'Share2', growthKey: 'platformGrowth' },
    { name: 'Instagram', key: 'Instagram', color: '#8B5CF6', bgColor: '#E8D5FF', icon: 'Image', growthKey: 'platformGrowth' },
    { name: 'Download', key: 'Direct', color: '#F97316', bgColor: '#FED7AA', icon: 'Download', growthKey: 'downloadGrowth' }
  ],
  kpiCards: [
    { label: 'Total Photos', icon: 'Image', bgColor: '#FEF3C7', trendColor: '#F59E0B' },
    { label: 'Total Shares', icon: 'Share2', bgColor: '#E8D5FF', trendColor: '#8B5CF6' },
    { label: 'Conversion Rate', icon: 'TrendingUp', bgColor: '#D1FAE5', trendColor: '#10B981' },
    { label: 'Unique Customers', icon: 'Star', bgColor: '#FED7AA', trendColor: '#F97316' }
  ]
};

// Icon mapping
const iconComponents = {
  Image,
  Share2,
  TrendingUp,
  Star,
  Facebook,
  Download
};

const Analytics = () => {
  // 1. State Management
  const [timeRange, setTimeRange] = React.useState(ANALYTICS_CONFIG.defaultTimeRange);

  // Alert Modal State
  const [alertModal, setAlertModal] = React.useState({ show: false, message: '', type: 'info' });

  // Helper Functions for Alerts
  const showAlert = (message, type = 'info') => {
    setAlertModal({ show: true, message, type });
  };
  const [loading, setLoading] = React.useState(true);
  const [analyticsData, setAnalyticsData] = React.useState(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const axiosData = useAxios();

  // State to store API metrics for unique customers
  const [uniqueCustomersGrowth, setUniqueCustomersGrowth] = React.useState(0);

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

  // Fetch unique customers growth from API
  React.useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const metricsResponse = await axiosData.get(`upload/dashboard-metrics?adminid=${user._id || user.id}`);
        if (metricsResponse.data.metrics?.shareTracking?.uniqueUsers?.growth) {
          setUniqueCustomersGrowth(metricsResponse.data.metrics.shareTracking.uniqueUsers.growth);
        }
      } catch (error) {
        console.error("Error fetching metrics:", error);
      }
    };
    fetchMetrics();
  }, []);

  // 3. Process Logic
  const processAnalytics = React.useCallback((data, growthValue = 0, range = timeRange) => {
    const now = new Date();
    const currentPeriodStart = new Date();

    // For 1 day, show only today (from 00:00:00 today to now)
    // For other ranges, show last N days
    if (range === 1) {
      currentPeriodStart.setHours(0, 0, 0, 0); // Start of today
    } else {
      currentPeriodStart.setDate(now.getDate() - range);
    }

    const previousPeriodStart = new Date(currentPeriodStart);
    let currentData, previousData;

    if (range === 1) {
      // Previous period for 1 day = yesterday (00:00:00 to 23:59:59)
      previousPeriodStart.setDate(previousPeriodStart.getDate() - 1);
      previousPeriodStart.setHours(0, 0, 0, 0);
      const previousPeriodEnd = new Date(previousPeriodStart);
      previousPeriodEnd.setHours(23, 59, 59, 999);

      // Current period: today (00:00 to now)
      const currentPeriodEnd = now;

      // -- Filter Data by Date Ranges
      currentData = data.filter(item => {
        const d = new Date(item.date || item.createdAt);
        return d >= currentPeriodStart && d <= currentPeriodEnd;
      });

      previousData = data.filter(item => {
        const d = new Date(item.date || item.createdAt);
        return d >= previousPeriodStart && d <= previousPeriodEnd;
      });
    } else {
      previousPeriodStart.setDate(previousPeriodStart.getDate() - range);

      // -- Filter Data by Date Ranges
      currentData = data.filter(item => {
        const d = new Date(item.date || item.createdAt);
        return d >= currentPeriodStart && d <= now;
      });

      previousData = data.filter(item => {
        const d = new Date(item.date || item.createdAt);
        return d >= previousPeriodStart && d < currentPeriodStart;
      });
    }

    // -- Constants & Helpers
    const getShareCount = (item) =>
      (item.whatsappsharecount || 0) + (item.facebooksharecount || 0) +
      (item.twittersharecount || 0) + (item.instagramsharecount || 0);

    const getDownloadCount = (item) => (item.downloadcount || 0);

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
      // Calculate the count change
      const countChange = current - previous;
      // Return the count change directly as percentage (count change = percentage value)
      // If change is +2, show 2%; if change is -5, show -5%
      return parseFloat(countChange.toFixed(1));
    };

    // Calculate average session duration from actual data
    const calculateAvgSessionDuration = (dataset) => {
      if (dataset.length === 0) return { seconds: 0, display: '0s' };

      // Estimate session time based on activity using config values
      const { avgTimePerPhoto, avgTimePerShare } = ANALYTICS_CONFIG.sessionCalculation;

      const totalPhotos = dataset.length;
      const totalShares = dataset.reduce((acc, item) => acc + getShareCount(item), 0);
      const avgSeconds = Math.round((totalPhotos * avgTimePerPhoto + totalShares * avgTimePerShare) / totalPhotos);

      const minutes = Math.floor(avgSeconds / 60);
      const seconds = avgSeconds % 60;
      const display = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

      return { seconds: avgSeconds, display };
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
        current: calculateAvgSessionDuration(currentData),
        previous: calculateAvgSessionDuration(previousData)
      }
    };

    // --- 4. Trend Data (Daily)
    const trends = {};

    // Initialize trends with local dates to avoid timezone shifts
    for (let i = range - 1; i >= 0; i--) {
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

    // --- 5. Category Distribution - Dynamic top 4 templates + Others (matching backend logic)
    const templateCounts = {};
    currentData.forEach(item => {
      const templateName = item.template_name || item.templatename || item.type || "Others";
      templateCounts[templateName] = (templateCounts[templateName] || 0) + 1;
    });

    // Sort templates by count and get top N (from config)
    const topCategoriesLimit = ANALYTICS_CONFIG.topCategoriesLimit;
    const sortedTemplates = Object.entries(templateCounts)
      .filter(([name]) => name !== "Others")
      .sort((a, b) => b[1] - a[1]);

    const topTemplates = sortedTemplates.slice(0, topCategoriesLimit);
    const remainingTemplates = sortedTemplates.slice(topCategoriesLimit);

    // Build categories object with top N + Others
    const categories = {};
    topTemplates.forEach(([name, count]) => {
      categories[name] = count;
    });

    // Sum all remaining templates as "Others"
    const othersCount = remainingTemplates.reduce((sum, [, count]) => sum + count, 0) + (templateCounts["Others"] || 0);
    if (othersCount > 0) {
      categories["Others"] = othersCount;
    }

    // --- 6. Platform Performance (Dynamic - based on available platforms)
    // Dynamically detect which platforms are used in the data
    const platformKeys = ['WhatsApp', 'Facebook', 'Twitter', 'Instagram'];
    const platforms = {};
    const downloads = { Direct: 0 };

    // Initialize platforms dynamically
    platformKeys.forEach(key => {
      platforms[key] = 0;
    });

    currentData.forEach(item => {
      if (item.whatsappsharecount) platforms.WhatsApp = (platforms.WhatsApp || 0) + (item.whatsappsharecount || 0);
      if (item.facebooksharecount) platforms.Facebook = (platforms.Facebook || 0) + (item.facebooksharecount || 0);
      if (item.twittersharecount) platforms.Twitter = (platforms.Twitter || 0) + (item.twittersharecount || 0);
      if (item.instagramsharecount) platforms.Instagram = (platforms.Instagram || 0) + (item.instagramsharecount || 0);
      if (item.downloadcount) downloads.Direct += (item.downloadcount || 0);
    });

    // Calculate platform growth (current vs previous period)
    const previousPlatforms = {};
    const previousDownloads = { Direct: 0 };

    // Initialize previous platforms dynamically
    platformKeys.forEach(key => {
      previousPlatforms[key] = 0;
    });

    previousData.forEach(item => {
      if (item.whatsappsharecount) previousPlatforms.WhatsApp = (previousPlatforms.WhatsApp || 0) + (item.whatsappsharecount || 0);
      if (item.facebooksharecount) previousPlatforms.Facebook = (previousPlatforms.Facebook || 0) + (item.facebooksharecount || 0);
      if (item.twittersharecount) previousPlatforms.Twitter = (previousPlatforms.Twitter || 0) + (item.twittersharecount || 0);
      if (item.instagramsharecount) previousPlatforms.Instagram = (previousPlatforms.Instagram || 0) + (item.instagramsharecount || 0);
      if (item.downloadcount) previousDownloads.Direct += (item.downloadcount || 0);
    });

    const platformGrowth = {};
    Object.keys(platforms).forEach(key => {
      platformGrowth[key] = calculateGrowth(platforms[key], previousPlatforms[key]);
    });

    const downloadGrowth = {};
    Object.keys(downloads).forEach(key => {
      downloadGrowth[key] = calculateGrowth(downloads[key], previousDownloads[key]);
    });

    // Total Engagement (Shares + Downloads combined for display)
    const totalEngagement = {
      WhatsApp: platforms.WhatsApp,
      Facebook: platforms.Facebook,
      Twitter: platforms.Twitter,
      Instagram: platforms.Instagram,
      Direct: downloads.Direct
    };

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

    const fastestPlatform = (() => {
      // Dynamic: which platform has most shares
      const sorted = Object.entries(platforms).filter(([_, count]) => count > 0).sort((a, b) => b[1] - a[1]);
      return sorted[0]?.[0] || (platformKeys[0] || 'WhatsApp');
    })();

    // Calculate unique customers for current period (growth comes from API)
    const uniqueCustomersCurrent = getUniqueCustomers(currentData);

    const sessionGrowth = calculateGrowth(stats.session.current.seconds, stats.session.previous.seconds);

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
          value: stats.session.current.display,
          growth: sessionGrowth
        }
      },
      uniqueCustomers: uniqueCustomersCurrent,
      uniqueCustomersGrowth: growthValue, // From API
      trends,
      categories,
      platforms, // Social shares only
      downloads, // Downloads separate
      totalEngagement, // Combined for display
      platformGrowth, // Add platform growth data
      downloadGrowth, // Download growth
      peakHours,
      insights: {
        bestTimeStr: `${bestHourIndex}:00 - ${bestHourIndex + 1}:00`,
        bestDay,
        bestCategory: bestCategory ? `${bestCategory[0]} (${Math.round(bestCategory[1] / stats.photos.current * 100 || 0)}%)` : 'N/A',
        growthPlatform: fastestPlatform,
        trafficPattern: weekendGrowth,
        recommendation: `Schedule ${fastestPlatform} campaigns on ${bestDay}s at ${bestHourIndex}:00 for max conversion.`
      }
    });
  }, [timeRange]);

  // 2. Fetch Data
  const fetchAnalyticsData = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosData.get(`upload/all?adminid=${user._id || user.id}&page=1&limit=10000`);
      // Handle both paginated and non-paginated responses
      const dataArray = Array.isArray(response.data?.data) 
        ? response.data.data 
        : (Array.isArray(response.data) ? response.data : []);
      const rawData = dataArray.filter(item => item.source === 'Photo Merge App');
      processAnalytics(rawData, uniqueCustomersGrowth, timeRange);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setLoading(false);
    }
  }, [timeRange, axiosData, user._id, user.id, uniqueCustomersGrowth, processAnalytics]);

  React.useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  const handleRefresh = () => {
    fetchAnalyticsData();
  };

  // Function to generate dynamic tags based on insights
  const getRecommendationTags = () => {
    if (!analyticsData?.insights) return [];

    const tags = [];
    const recommendation = analyticsData.insights.recommendation?.toLowerCase() || '';
    const { growthPlatform, bestDay, trafficPattern } = analyticsData.insights;

    // Campaign Optimization - if recommendation mentions campaigns, scheduling, or platforms
    if (recommendation.includes('campaign') || recommendation.includes('schedule') || growthPlatform) {
      tags.push({
        label: 'Campaign Optimization',
        bgColor: '#DBEAFE',
        textColor: '#3B82F6'
      });
    }

    // Engagement - if recommendation mentions conversion, engagement, or sharing
    if (recommendation.includes('conversion') || recommendation.includes('engagement') || recommendation.includes('share')) {
      tags.push({
        label: 'Engagement',
        bgColor: '#D1FAE5',
        textColor: '#10B981'
      });
    }

    // Timing - if recommendation mentions specific time, day, or peak hours
    if (recommendation.includes('time') || bestDay || recommendation.includes('hour')) {
      tags.push({
        label: 'Timing',
        bgColor: '#FEF3C7',
        textColor: '#D97706'
      });
    }

    // Platform - always show if growthPlatform exists (recommendation always includes it)
    if (growthPlatform) {
      tags.push({
        label: growthPlatform,
        bgColor: '#E8D5FF',
        textColor: '#8B5CF6'
      });
    }

    // Performance - if mentions best category or peak performance
    if (recommendation.includes('max') || recommendation.includes('best') || recommendation.includes('peak')) {
      tags.push({
        label: 'Performance',
        bgColor: '#FBCFE8',
        textColor: '#EC4899'
      });
    }

    // Traffic Pattern - if weekend/weekday pattern is mentioned
    if (trafficPattern && (trafficPattern.includes('Weekend') || trafficPattern.includes('Weekday'))) {
      tags.push({
        label: 'Traffic Pattern',
        bgColor: '#DBEAFE',
        textColor: '#3B82F6'
      });
    }

    // If no tags found, return default tags
    if (tags.length === 0) {
      tags.push(
        { label: 'Campaign Optimization', bgColor: '#DBEAFE', textColor: '#3B82F6' },
        { label: 'Engagement', bgColor: '#D1FAE5', textColor: '#10B981' }
      );
    }

    // Return unique tags (remove duplicates)
    return tags.filter((tag, index, self) =>
      index === self.findIndex(t => t.label === tag.label)
    );
  };

  const handleTimeRangeChange = (days) => {
    setTimeRange(days);
    // Data will automatically refresh via useEffect
  };

  const handleExport = () => {
    if (!analyticsData) {
      showAlert('No data available to export. Please wait for data to load.', 'error');
      return;
    }

    try {
      // Detailed CSV with all analytics data
      const timeRangeText = timeRange === 1 ? 'Today' : `Last ${timeRange} Days`;
      let csv = `Analytics Report - ${timeRangeText}\n`;
      csv += `Generated: ${formatDate(new Date(), getStoredDateFormat() + ' HH:mm')}\n\n`;

      // KPI Metrics
      csv += `KPI Metrics\n`;
      csv += `Metric,Value,Growth\n`;
      csv += `Total Photos,${analyticsData.kpis.photos.value},${analyticsData.kpis.photos.growth}%\n`;
      csv += `Total Shares,${analyticsData.kpis.shares.value},${analyticsData.kpis.shares.growth}%\n`;
      csv += `Conversion Rate,${analyticsData.kpis.conversion.value}%,${analyticsData.kpis.conversion.growth}%\n`;
      csv += `Avg Session Duration,${analyticsData.kpis.session.value},${analyticsData.kpis.session.growth}%\n`;
      csv += `Unique Customers,${analyticsData.uniqueCustomers},${analyticsData.uniqueCustomersGrowth}%\n\n`;

      // Category Distribution
      csv += `Category Distribution\n`;
      csv += `Category,Count,Percentage\n`;
      const totalPhotos = analyticsData.kpis.photos.value;
      Object.entries(analyticsData.categories).forEach(([k, v]) => {
        const percentage = totalPhotos > 0 ? ((v / totalPhotos) * 100).toFixed(1) : 0;
        csv += `${k},${v},${percentage}%\n`;
      });
      csv += `\n`;

      // Platform Performance
      csv += `Platform Performance\n`;
      csv += `Platform,Shares,Growth\n`;
      Object.entries(analyticsData.platforms || {}).forEach(([k, v]) => {
        const growth = analyticsData.platformGrowth?.[k] || 0;
        csv += `${k},${v},${growth}%\n`;
      });
      csv += `\n`;

      // Daily Trends
      csv += `Daily Trends\n`;
      csv += `Date,Photos,Shares,Unique Customers\n`;
      Object.entries(analyticsData.trends || {}).forEach(([date, data]) => {
        csv += `${date},${data.photos || 0},${data.shares || 0},${data.uniqueCustomers || 0}\n`;
      });
      csv += `\n`;

      // Insights
      csv += `Insights\n`;
      csv += `Best Category,${analyticsData.insights.bestCategory}\n`;
      csv += `Peak Day & Time,${analyticsData.insights.bestDay}, ${analyticsData.insights.bestTimeStr}\n`;
      csv += `Fastest Growing Platform,${analyticsData.insights.growthPlatform}\n`;
      csv += `Traffic Pattern,${analyticsData.insights.trafficPattern}\n`;
      csv += `Recommendation,${analyticsData.insights.recommendation}\n`;

      // Create and download CSV
      const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const fileNameSuffix = timeRange === 1 ? 'Today' : `${timeRange}Days`;
      a.download = `Analytics_Report_${fileNameSuffix}_${formatDate(new Date(), getStoredDateFormat()).replace(/\//g, '-')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting analytics:", error);
      showAlert('Failed to export analytics data. Please try again.', 'error');
    }
  };


  return (
    <AnalyticsContainer>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <HeaderSection>
        <div>
          <h1>Analytics Dashboard</h1>
          <p style={{ color: '#7A7A7A', marginTop: '8px' }}>
            Track performance, engagement, and conversion metrics
          </p>
        </div>

        <ActionButtons>
          <div style={{ display: 'flex', gap: '8px' }}>
            {ANALYTICS_CONFIG.timeRangeOptions.map(days => (
              <ActionButton
                key={days}
                onClick={() => handleTimeRangeChange(days)}
                style={{
                  background: timeRange === days ? '#E0E7FF' : 'transparent',
                  borderColor: timeRange === days ? '#6366F1' : '#E5E7EB',
                  fontWeight: timeRange === days ? 600 : 500
                }}
              >
                {days === 1 ? 'Today' : `${days} Days`}
              </ActionButton>
            ))}
          </div>
          <ActionButton
            onClick={handleRefresh}
            disabled={loading}
            style={{
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'wait' : 'pointer'
            }}
          >
            <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </ActionButton>
          <ActionButton onClick={handleExport} disabled={!analyticsData || loading}>
            <Download size={16} />
            Export
          </ActionButton>
        </ActionButtons>
      </HeaderSection>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center' }}>Loading analytics...</div>
      ) : !analyticsData || !analyticsData.kpis?.photos?.value || analyticsData.kpis.photos.value === 0 ? (
        <div style={{
          padding: '80px 40px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: '#F3F4F6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px',
            color: '#999'
          }}>
            <BarChart2 size={40} />
          </div>
          <div style={{
            fontSize: '20px',
            fontWeight: 800,
            color: '#111827',
            marginBottom: '8px'
          }}>
            No data for this filter
          </div>
          <div style={{
            color: '#6B7280',
            textAlign: 'center',
            maxWidth: '400px',
            fontSize: '15px',
            lineHeight: '1.6',
            marginBottom: '24px'
          }}>
            {timeRange !== ANALYTICS_CONFIG.defaultTimeRange
              ? `We couldn't find any analytics data for the selected time period. Try selecting a different time range.`
              : "No analytics data available. Data will appear here once customers start creating and sharing photos."}
          </div>
          {timeRange !== ANALYTICS_CONFIG.defaultTimeRange && (
            <ActionButton
              style={{ marginTop: '8px', background: '#F3F4F6', color: '#374151', border: 'none' }}
              onClick={() => {
                setTimeRange(ANALYTICS_CONFIG.defaultTimeRange);
              }}
            >
              Reset Filter
            </ActionButton>
          )}
        </div>
      ) : (
        <AnalyticsGrid>
          {/* KPI Cards */}
          <KPIBox>
            {(() => {
              const kpiDataMap = {
                'Total Photos': {
                  value: analyticsData?.kpis?.photos?.value,
                  growth: analyticsData?.kpis?.photos?.growth
                },
                'Total Shares': {
                  value: analyticsData?.kpis?.shares?.value,
                  growth: analyticsData?.kpis?.shares?.growth
                },
                'Conversion Rate': {
                  value: analyticsData?.kpis?.conversion?.value,
                  growth: analyticsData?.kpis?.conversion?.growth
                },
                'Unique Customers': {
                  value: analyticsData?.uniqueCustomers,
                  growth: analyticsData?.uniqueCustomersGrowth
                }
              };

              return ANALYTICS_CONFIG.kpiCards.map((kpiConfig, idx) => {
                const kpiData = kpiDataMap[kpiConfig.label];
                const trend = generateTrendPath(kpiData?.growth || 0);
                const IconComponent = iconComponents[kpiConfig.icon];

                let displayValue = kpiData?.value;
                if (kpiConfig.label === 'Conversion Rate') {
                  displayValue = `${displayValue || 0}%`;
                } else if (typeof displayValue === 'number') {
                  displayValue = displayValue.toLocaleString();
                } else {
                  displayValue = displayValue || '0';
                }

                const growthValue = kpiData?.growth || 0;
                const changeDisplay = `${growthValue >= 0 ? '+' : ''}${growthValue}%`;

                return {
                  label: kpiConfig.label,
                  value: displayValue,
                  change: changeDisplay,
                  icon: <IconComponent size={20} />,
                  bgColor: kpiConfig.bgColor,
                  trendColor: kpiConfig.trendColor,
                  points: trend.points,
                  endX: trend.endX,
                  endY: trend.endY
                };
              });
            })().map((kpi, idx) => (
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


          <LargeChartCard title="Performance Trends" subtitle={timeRange === 1 ? 'Daily activity for today' : `Daily activity for last ${timeRange} days`}>
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
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '24px',
              padding: '24px 0'
            }}>
              {(() => {
                const totalEngagement = Object.values(analyticsData?.totalEngagement || {}).reduce((a, b) => a + b, 0) || 1;

                // Dynamically build platform list based on config and data availability
                return ANALYTICS_CONFIG.platforms
                  .filter(platform => {
                    // Show platform if it has data or if it's Download (always show)
                    const key = platform.key || platform.name;
                    return analyticsData?.totalEngagement?.[key] > 0 || key === 'Direct';
                  })
                  .map(platform => {
                    const key = platform.key || platform.name;
                    const IconComponent = iconComponents[platform.icon];

                    return (
                      <MetricCircularCard
                        key={key}
                        label={platform.name}
                        value={analyticsData?.totalEngagement?.[key] || 0}
                        percentage={Math.round(((analyticsData?.totalEngagement?.[key] || 0) / totalEngagement) * 100)}
                        trend={parseFloat(analyticsData?.[platform.growthKey]?.[key] || 0)}
                        color={platform.color}
                        bgColor={platform.bgColor}
                        icon={<IconComponent size={20} />}
                      />
                    );
                  });
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
                  {getRecommendationTags().map((tag, index) => (
                    <span
                      key={index}
                      style={{
                        padding: '4px 12px',
                        background: tag.bgColor,
                        color: tag.textColor,
                        borderRadius: '100px',
                        fontSize: '12px',
                        fontWeight: 600
                      }}
                    >
                      {tag.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </FullWidthCard>
        </AnalyticsGrid>
      )}
      {/* Alert Modal */}
      {alertModal.show && (
        <ModalOverlay onClick={() => setAlertModal({ show: false, message: '', type: 'info' })}>
          <AlertModalContent onClick={e => e.stopPropagation()}>
            <AlertIconWrapper $type={alertModal.type}>
              {alertModal.type === 'success' ? (
                <CheckCircle size={32} />
              ) : alertModal.type === 'error' ? (
                <XCircle size={32} />
              ) : (
                <AlertCircle size={32} />
              )}
            </AlertIconWrapper>
            <AlertMessage>{alertModal.message}</AlertMessage>
            <ModalActionFooter>
              <ActionButton
                onClick={() => setAlertModal({ show: false, message: '', type: 'info' })}
              >
                OK
              </ActionButton>
            </ModalActionFooter>
          </AlertModalContent>
        </ModalOverlay>
      )}
    </AnalyticsContainer>
  );
};

export default Analytics;
