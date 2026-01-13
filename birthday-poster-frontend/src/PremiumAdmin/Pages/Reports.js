import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import {
  Download,
  FileText,
  Clock,
  Database,
  BarChart2,
  Users,
  Image,
  Share2,
  Send,
  ChevronDown,
  RefreshCw,
  Check,
  HardDrive,
  File,
  Loader,
  AlertCircle,
  CheckCircle,
  XCircle,
  X
} from 'react-feather';
import jsPDF from 'jspdf';
import Card from '../Components/Card';
import KPIMetricCard from '../Components/charts/KPIMetricCard';
import useAxios from '../../useAxios';
import { formatDate, getStoredDateFormat } from '../../utils/dateUtils';

// --- Styled Components ---

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  @media (max-width: 1024px) {
    flex-direction: column;
    gap: 20px;
  }
`;

const HeaderText = styled.div`
  h1 {
    margin: 0;
    font-size: 28px;
    font-weight: 700;
  }
  p {
    color: #666;
    margin-top: 4px;
    font-size: 15px;
  }
`;

const RangeSelector = styled.div`
  display: flex;
  background: white;
  padding: 6px;
  border-radius: 14px;
  border: 1px solid #EEE;
  gap: 4px;
`;

const RangeButton = styled.button`
  padding: 8px 16px;
  border-radius: 10px;
  border: none;
  font-size: 13px;
  font-weight: 700;
  background: ${props => props.$active ? '#1A1A1A' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#666'};
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.$active ? '#1A1A1A' : '#F5F5F5'};
  }
`;

const ReportsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const ReportCard = styled(Card)`
  padding: 32px;
  border-radius: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 30px rgba(0,0,0,0.08);
  }
`;

const ReportHeader = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
`;

const IconBox = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.$color + '15'};
  color: ${props => props.$color};
`;

const ReportTitle = styled.div`
  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
  }
  span {
    font-size: 12px;
    color: #999;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const ReportDescription = styled.p`
  margin: 0;
  font-size: 14px;
  color: #666;
  line-height: 1.6;
`;

const MetadataGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 16px;
  background: #F9FAFB;
  border-radius: 20px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const MetaItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  
  .label {
    font-size: 11px;
    font-weight: 600;
    color: #999;
    text-transform: uppercase;
  }
  .value {
    font-size: 14px;
    font-weight: 700;
    color: #1A1A1A;
  }
`;

const ActionRow = styled.div`
  display: flex;
  gap: 12px;
  margin-top: auto;
`;

const DownloadButton = styled.button`
  flex: 1;
  padding: 14px 20px;
  border-radius: 16px;
  border: 2px solid ${props => props.$variant === 'csv' ? '#10B981' : '#3B82F6'};
  background: ${props => props.$variant === 'csv' ? '#10B981' : '#3B82F6'};
  color: white;
  font-weight: 700;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px ${props => props.$variant === 'csv' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.3)'};
    border-color: ${props => props.$variant === 'csv' ? '#059669' : '#2563EB'};
    background: ${props => props.$variant === 'csv' ? '#059669' : '#2563EB'};
    
    &::before {
      width: 300px;
      height: 300px;
    }
  }

  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  svg {
    position: relative;
    z-index: 1;
  }

  span {
    position: relative;
    z-index: 1;
  }
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-top: 8px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
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
  padding: 20px;
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
  white-space: pre-line;
`;

const ModalActionFooter = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 24px;
`;

const AlertTitle = styled.h3`
  font-size: 20px;
  margin: 0 0 12px;
  color: ${({ $type }) => {
    if ($type === 'success') return '#10B981';
    if ($type === 'error') return '#EF4444';
    return '#F59E0B';
  }};
  text-align: center;
`;

const AlertCloseButton = styled.button`
  background: white;
  border: 1px solid #DDD;
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 20px;
  width: 100%;
  transition: all 0.2s;

  &:hover {
    background: #F9F9F9;
    border-color: #CCC;
  }
`;

const PrimaryButton = styled.button`
  background: #1A1A1A;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.15);
  }
`;

const Reports = () => {
  const axiosData = useAxios();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [activeRange, setActiveRange] = useState('Today');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloading, setDownloading] = useState(null);
  const [alertModal, setAlertModal] = useState({ show: false, message: '', type: 'info' });
  const [downloadCounts, setDownloadCounts] = useState({});
  const [downloadHistory, setDownloadHistory] = useState([]);
  const [mediaData, setMediaData] = useState([]);
  const [campaignsData, setCampaignsData] = useState([]);
  const [templatesData, setTemplatesData] = useState([]);
  const [summaryStats, setSummaryStats] = useState({
    totalReports: 0,
    generatedThisMonth: 0,
    totalRecords: 0,
    totalSize: '0 KB'
  });
  const [growthMetrics, setGrowthMetrics] = useState({
    reportsGrowth: 0,
    generatedGrowth: 0,
    recordsGrowth: 0,
    sizeGrowth: 0
  });

  // Helper function to generate SVG trend path
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

  // Helper functions for alerts
  const showAlert = useCallback((message, type = 'info') => {
    setAlertModal({ show: true, message, type });
  }, []);

  // Calculate estimated file sizes based on records
  const estimateSize = (records) => {
    const sizeKB = records * 0.5; // ~0.5KB per record
    return sizeKB >= 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB.toFixed(0)} KB`;
  };

  // Get days from range
  const getDaysFromRange = (range) => {
    switch (range) {
      case 'Today': return 1;
      case '7 Days': return 7;
      case '30 Days': return 30;
      case '90 Days': return 90;
      default: return 7;
    }
  };

  // Filter data based on active range
  const filterDataByRange = useCallback((data, range, isCampaign = false) => {
    const now = new Date();
    let startDate, endDate;

    if (range === 'Today') {
      // Today: from 00:00:00 today to now
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      endDate = now;
    } else {
      const days = getDaysFromRange(range);
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - days);
      startDate.setHours(0, 0, 0, 0);
      endDate = now;
    }

    return data.filter(item => {
      // For campaigns, use startDate or createdAt; for media items, use date or createdAt
      const itemDate = isCampaign
        ? new Date(item.startDate || item.createdAt)
        : new Date(item.date || item.createdAt);
      return itemDate >= startDate && itemDate <= endDate;
    });
  }, []);

  // Calculate growth
  const calculateGrowth = (current, previous) => {
    const countChange = current - previous;
    return parseFloat(countChange.toFixed(1));
  };

  // Fetch all data from APIs
  const fetchReportData = useCallback(async () => {
    try {
      setLoading(true);

      const adminId = user._id || user.id;
      if (!adminId) {
        console.warn('No admin ID found in user object');
        showAlert('User information not found. Please log in again.', 'error');
        return;
      }

      // Fetch all data in parallel (for Reports, we need all data for accurate statistics)
      // Use high limit to get all data for statistics calculation
      const [mediaResponse, campaignsResponse, templatesResponse] = await Promise.all([
        axiosData.get(`upload/all?adminid=${adminId}&page=1&limit=10000`),
        axiosData.get(`campaigns?adminid=${adminId}&page=1&limit=10000`),
        axiosData.get(`/photomerge/templates?page=1&limit=10000`)
      ]);

      // Log responses for debugging
      console.log('Media Response:', { status: mediaResponse.status, dataLength: mediaResponse.data?.data?.length || mediaResponse.data?.length });
      console.log('Campaigns Response:', { status: campaignsResponse.status, dataLength: campaignsResponse.data?.data?.length || campaignsResponse.data?.length });
      console.log('Templates Response:', { status: templatesResponse.status, dataLength: templatesResponse.data?.data?.length || templatesResponse.data?.length });

      // Handle paginated or non-paginated responses
      const mediaDataArray = Array.isArray(mediaResponse.data?.data)
        ? mediaResponse.data.data
        : (Array.isArray(mediaResponse.data) ? mediaResponse.data : []);
      const campaignsDataArray = Array.isArray(campaignsResponse.data?.data)
        ? campaignsResponse.data.data
        : (Array.isArray(campaignsResponse.data) ? campaignsResponse.data : []);
      const templatesDataArray = Array.isArray(templatesResponse.data?.data)
        ? templatesResponse.data.data
        : (Array.isArray(templatesResponse.data) ? templatesResponse.data : []);

      // For Reports, we fetch all data for accurate statistics
      // Pagination info is not needed for Reports page since we show aggregated data

      const rawItems = mediaDataArray.filter(item => item && item.source === 'Photo Merge App');
      const campaigns = campaignsDataArray;
      const templates = templatesDataArray.filter(t => t && (t.adminid === user.id || t.adminid === user._id));

      console.log('Processed Data:', {
        rawItems: rawItems.length,
        campaigns: campaigns.length,
        templates: templates.length
      });

      setMediaData(rawItems);
      setCampaignsData(campaigns);
      setTemplatesData(templates);

      // Calculate all-time statistics from API data (for comparison)
      const customersSet = new Set();
      let totalShares = 0;
      let totalDownloads = 0;
      let totalClicks = 0;

      rawItems.forEach(item => {
        const phone = item.whatsapp || item.mobile || '';
        const key = phone && phone !== 'N/A' ? phone : (item.name || 'Unknown');
        customersSet.add(key);

        totalShares += (item.whatsappsharecount || 0) +
          (item.facebooksharecount || 0) +
          (item.twittersharecount || 0) +
          (item.instagramsharecount || 0);
        totalDownloads += (item.downloadcount || 0);
        totalClicks += (item.urlclickcount || 0);
      });

      // Filter data based on active range
      const filteredItems = filterDataByRange(rawItems, activeRange, false);
      const filteredCampaigns = filterDataByRange(campaigns, activeRange, true);

      // Calculate statistics from filtered data
      const filteredCustomersSet = new Set();
      let filteredShares = 0;
      let filteredDownloads = 0;

      filteredItems.forEach(item => {
        const phone = item.whatsapp || item.mobile || '';
        const key = phone && phone !== 'N/A' ? phone : (item.name || 'Unknown');
        filteredCustomersSet.add(key);

        filteredShares += (item.whatsappsharecount || 0) +
          (item.facebooksharecount || 0) +
          (item.twittersharecount || 0) +
          (item.instagramsharecount || 0);
        filteredDownloads += (item.downloadcount || 0);
      });

      // Calculate all-time stats for comparison
      const totalCustomers = customersSet.size;
      const totalPhotos = rawItems.length;
      const totalCampaigns = campaigns.length;

      // Calculate filtered stats
      const filteredTotalCustomers = filteredCustomersSet.size;
      const filteredTotalPhotos = filteredItems.length;
      const filteredTotalCampaigns = filteredCampaigns.length;
      const filteredTotalShares = filteredShares;
      const filteredTotalSharesAndDownloads = filteredShares + filteredDownloads;

      // Calculate growth metrics (current period vs previous period)
      const days = getDaysFromRange(activeRange);
      const now = new Date();
      let currentStart, currentEnd, previousStart, previousEnd;

      if (activeRange === 'Today') {
        // Today: from 00:00:00 today to now
        currentStart = new Date(now);
        currentStart.setHours(0, 0, 0, 0);
        currentEnd = now;

        // Previous period: yesterday (00:00:00 to 23:59:59)
        previousStart = new Date(now);
        previousStart.setDate(previousStart.getDate() - 1);
        previousStart.setHours(0, 0, 0, 0);
        previousEnd = new Date(previousStart);
        previousEnd.setHours(23, 59, 59, 999);
      } else {
        currentStart = new Date(now);
        currentStart.setDate(currentStart.getDate() - days);
        currentStart.setHours(0, 0, 0, 0);
        currentEnd = now;

        previousStart = new Date(currentStart);
        previousStart.setDate(previousStart.getDate() - days);
        previousStart.setHours(0, 0, 0, 0);
        previousEnd = currentStart;
      }

      const currentItems = rawItems.filter(item => {
        const date = new Date(item.date || item.createdAt);
        return date >= currentStart && date <= currentEnd;
      });

      const previousItems = rawItems.filter(item => {
        const date = new Date(item.date || item.createdAt);
        return date >= previousStart && date <= previousEnd;
      });

      const currentCampaigns = campaigns.filter(c => {
        const date = new Date(c.startDate || c.createdAt);
        return date >= currentStart && date <= currentEnd;
      });

      const previousCampaigns = campaigns.filter(c => {
        const date = new Date(c.startDate || c.createdAt);
        return date >= previousStart && date <= previousEnd;
      });

      // Build reports with dynamic data from APIs
      const nowFormatted = formatDate(new Date(), getStoredDateFormat() + ' HH:mm');

      // Get current download counts from state
      const currentDownloadCounts = downloadCounts;

      const reportsData = [
        {
          id: 'customer',
          name: 'Customer Engagement',
          type: 'User Analysis',
          description: 'Detailed analysis of customer visits, photo merge activity, and sharing behavior.',
          color: '#B8653A',
          icon: <Users size={24} />,
          records: filteredTotalCustomers,
          size: estimateSize(filteredTotalCustomers),
          lastGenerated: nowFormatted,
          downloadCount: currentDownloadCounts['customer'] || 0,
          data: filteredItems, // Use filtered data
          allData: rawItems // Keep all data for export
        },
        {
          id: 'photo',
          name: 'Photo Analytics',
          type: 'Asset Performance',
          description: 'Insights into category distribution, total views, and download counts per template.',
          color: '#8E44AD',
          icon: <Image size={24} />,
          records: filteredTotalPhotos,
          size: estimateSize(filteredTotalPhotos),
          lastGenerated: nowFormatted,
          downloadCount: currentDownloadCounts['photo'] || 0,
          data: filteredItems, // Use filtered data
          allData: rawItems, // Keep all data for export
          templates: templates
        },
        {
          id: 'campaign',
          name: 'Campaign Performance',
          type: 'Marketing ROI',
          description: 'Comprehensive metrics for WhatsApp, Email, and SMS outreach effectiveness.',
          color: '#5A7519',
          icon: <Send size={24} />,
          records: filteredTotalCampaigns,
          size: estimateSize(filteredTotalCampaigns),
          lastGenerated: nowFormatted,
          downloadCount: currentDownloadCounts['campaign'] || 0,
          data: filteredCampaigns, // Use filtered data
          allData: campaigns // Keep all data for export
        },
        {
          id: 'share',
          name: 'Share Tracking',
          type: 'Social Distribution',
          description: 'Audit log of all platform-specific sharing activities and click-through rates.',
          color: '#B58B00',
          icon: <Share2 size={24} />,
          records: filteredTotalSharesAndDownloads, // Include shares + downloads
          size: estimateSize(filteredTotalSharesAndDownloads),
          lastGenerated: nowFormatted,
          downloadCount: currentDownloadCounts['share'] || 0,
          data: filteredItems, // Use filtered data
          allData: rawItems // Keep all data for export
        }
      ];

      setReports(reportsData);

      // Calculate summary stats dynamically (using filtered data for current period)
      const totalRecords = filteredTotalCustomers + filteredTotalPhotos + filteredTotalCampaigns + filteredTotalSharesAndDownloads;
      const totalSizeKB = totalRecords * 0.5;

      // Fetch downloads this month from API
      let downloadsThisMonth = 0;
      try {
        const adminId = user._id || user.id;
        if (adminId) {
          const response = await axiosData.get(`/report-downloads/this-month?adminid=${adminId}`);
          if (response.data && response.data.success) {
            downloadsThisMonth = response.data.count || 0;
          }
        }
      } catch (error) {
        console.error('Error fetching this month downloads:', error);
        // Fallback to calculating from history if API fails
        const currentMonth = new Date();
        currentMonth.setDate(1);
        currentMonth.setHours(0, 0, 0, 0);
        downloadsThisMonth = downloadHistory.filter(d => {
          const downloadDate = new Date(d.downloadedAt || d.timestamp);
          return downloadDate >= currentMonth;
        }).length;
      }

      setSummaryStats({
        totalReports: reportsData.length,
        generatedThisMonth: downloadsThisMonth, // Show downloads this month
        totalRecords: totalRecords,
        totalSize: totalSizeKB >= 1024 ? `${(totalSizeKB / 1024).toFixed(1)} MB` : `${totalSizeKB.toFixed(0)} KB`
      });

      // Fetch downloads previous month from API
      let downloadsPreviousMonth = 0;
      try {
        const adminId = user._id || user.id;
        if (adminId) {
          const response = await axiosData.get(`/report-downloads/previous-month?adminid=${adminId}`);
          if (response.data && response.data.success) {
            downloadsPreviousMonth = response.data.count || 0;
          }
        }
      } catch (error) {
        console.error('Error fetching previous month downloads:', error);
        // Fallback to calculating from history if API fails
        const currentMonth = new Date();
        currentMonth.setDate(1);
        currentMonth.setHours(0, 0, 0, 0);
        const previousMonth = new Date(currentMonth);
        previousMonth.setMonth(previousMonth.getMonth() - 1);
        downloadsPreviousMonth = downloadHistory.filter(d => {
          const downloadDate = new Date(d.downloadedAt || d.timestamp);
          return downloadDate >= previousMonth && downloadDate < currentMonth;
        }).length;
      }

      // Current period totals
      const currentTotalRecords = totalRecords;
      const currentTotalSize = currentTotalRecords * 0.5;

      // Previous period totals (for comparison)
      const prevCustomersSet = new Set();
      let prevShares = 0;
      let prevDataDownloads = 0;

      previousItems.forEach(item => {
        const phone = item.whatsapp || item.mobile || '';
        const key = phone && phone !== 'N/A' ? phone : (item.name || 'Unknown');
        prevCustomersSet.add(key);
        prevShares += (item.whatsappsharecount || 0) +
          (item.facebooksharecount || 0) +
          (item.twittersharecount || 0) +
          (item.instagramsharecount || 0);
        prevDataDownloads += (item.downloadcount || 0);
      });

      const prevTotalRecords = prevCustomersSet.size + previousItems.length + previousCampaigns.length + prevShares + prevDataDownloads;
      const prevTotalSize = prevTotalRecords * 0.5;

      setGrowthMetrics({
        reportsGrowth: 0, // Always 4 reports, no growth
        generatedGrowth: calculateGrowth(downloadsThisMonth, downloadsPreviousMonth), // Compare downloads this month vs previous month
        recordsGrowth: calculateGrowth(currentTotalRecords, prevTotalRecords), // Compare total records
        sizeGrowth: calculateGrowth(currentTotalSize, prevTotalSize) // Compare sizes
      });

    } catch (error) {
      console.error("Error fetching report data:", error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load report data. Please try again.';
      showAlert(errorMessage, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [axiosData, activeRange, user._id, user.id, filterDataByRange, showAlert]);

  // Fetch download counts from API
  const fetchDownloadCounts = useCallback(async () => {
    try {
      const adminId = user._id || user.id;
      if (!adminId) return;

      const response = await axiosData.get(`/report-downloads/counts?adminid=${adminId}`);
      if (response.data && response.data.success) {
        setDownloadCounts(response.data.counts || {});
      }
    } catch (error) {
      console.error('Error fetching download counts:', error);
    }
  }, [axiosData, user._id, user.id]);

  // Fetch download history from API
  const fetchDownloadHistory = useCallback(async () => {
    try {
      const adminId = user._id || user.id;
      if (!adminId) return;

      const response = await axiosData.get(`/report-downloads/history?adminid=${adminId}&limit=1000`);
      if (response.data && response.data.success) {
        setDownloadHistory(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching download history:', error);
    }
  }, [axiosData, user._id, user.id]);

  // Track download count via API
  const incrementDownloadCount = useCallback(async (reportId, reportType) => {
    try {
      const adminId = user._id || user.id;
      if (!adminId) {
        console.warn('No admin ID found');
        return;
      }

      // Track download in API
      await axiosData.post('/report-downloads', {
        adminid: adminId,
        reportId: reportId,
        reportType: reportType // 'csv' or 'pdf'
      });

      // Fetch updated counts
      await fetchDownloadCounts();

      // Update the report in state
      setReports(prev => prev.map(r =>
        r.id === reportId
          ? { ...r, downloadCount: (r.downloadCount || 0) + 1 }
          : r
      ));
    } catch (error) {
      console.error('Error tracking download:', error);
      // Still update UI even if API call fails
      setReports(prev => prev.map(r =>
        r.id === reportId
          ? { ...r, downloadCount: (r.downloadCount || 0) + 1 }
          : r
      ));
    }
  }, [axiosData, user._id, user.id, fetchDownloadCounts]);

  // Fetch data when component mounts or range changes
  useEffect(() => {
    fetchReportData();
    fetchDownloadCounts();
    fetchDownloadHistory();
  }, [fetchReportData, fetchDownloadCounts, fetchDownloadHistory]);

  // Update download counts in reports when downloadCounts state changes
  useEffect(() => {
    setReports(prev => prev.map(r => ({
      ...r,
      downloadCount: downloadCounts[r.id] || 0
    })));
  }, [downloadCounts]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchReportData();
      await fetchDownloadCounts();
      await fetchDownloadHistory();
      showAlert('Reports data refreshed successfully!', 'success');
    } catch (error) {
      console.error('Error refreshing reports:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to refresh reports. Please try again.';
      showAlert(errorMessage, 'error');
    } finally {
      setRefreshing(false);
    }
  };

  // Helper to escape CSV values
  const escapeCSV = (value) => {
    if (value === null || value === undefined) return '';
    const stringValue = String(value);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  // Track download count

  const handleDownloadCSV = async (report) => {
    try {
      setDownloading(`csv-${report.id}`);

      // Validate data
      const dataToExport = report.allData || report.data;
      if (!dataToExport || dataToExport.length === 0) {
        showAlert('No data available to export for this report.', 'warning');
        return;
      }

      let csvContent = '';
      const timestamp = new Date().toISOString().split('T')[0];

      switch (report.id) {
        case 'customer': {
          // Customer Engagement Report
          const headers = ['Name', 'Phone', 'Email', 'Total Photos', 'Total Shares', 'Total Downloads', 'Last Activity'];
          csvContent = headers.join(',') + '\n';

          // Group by customer
          const customerMap = {};
          dataToExport.forEach(item => {
            const phone = item.whatsapp || item.mobile || '';
            const key = phone && phone !== 'N/A' ? phone : (item.name || 'Unknown');

            if (!customerMap[key]) {
              customerMap[key] = {
                name: item.name || 'Unknown',
                phone: phone || 'N/A',
                email: item.email || 'N/A',
                photos: 0,
                shares: 0,
                downloads: 0,
                lastActivity: item.date || item.createdAt
              };
            }

            customerMap[key].photos += 1;
            customerMap[key].shares += (item.whatsappsharecount || 0) +
              (item.facebooksharecount || 0) +
              (item.twittersharecount || 0) +
              (item.instagramsharecount || 0);
            customerMap[key].downloads += (item.downloadcount || 0);

            const itemDate = new Date(item.date || item.createdAt);
            const lastDate = new Date(customerMap[key].lastActivity);
            if (itemDate > lastDate) {
              customerMap[key].lastActivity = item.date || item.createdAt;
            }
          });

          Object.values(customerMap).forEach(customer => {
            csvContent += [
              escapeCSV(customer.name),
              escapeCSV(customer.phone),
              escapeCSV(customer.email),
              customer.photos,
              customer.shares,
              customer.downloads,
              escapeCSV(formatDate(customer.lastActivity, getStoredDateFormat()))
            ].join(',') + '\n';
          });
          break;
        }

        case 'photo': {
          // Photo Analytics Report
          const headers = ['Template Name', 'Category', 'Total Photos', 'Total Shares', 'WhatsApp Shares', 'Facebook Shares', 'Twitter Shares', 'Instagram Shares', 'Total Downloads'];
          csvContent = headers.join(',') + '\n';

          // Group by template
          const templateMap = {};
          dataToExport.forEach(item => {
            const templateName = item.template_name || item.templatename || item.type || 'Others';

            if (!templateMap[templateName]) {
              templateMap[templateName] = {
                name: templateName,
                category: 'Photo Merge',
                photos: 0,
                shares: 0,
                whatsapp: 0,
                facebook: 0,
                twitter: 0,
                instagram: 0,
                downloads: 0
              };
            }

            templateMap[templateName].photos += 1;
            templateMap[templateName].whatsapp += (item.whatsappsharecount || 0);
            templateMap[templateName].facebook += (item.facebooksharecount || 0);
            templateMap[templateName].twitter += (item.twittersharecount || 0);
            templateMap[templateName].instagram += (item.instagramsharecount || 0);
            templateMap[templateName].shares += (item.whatsappsharecount || 0) +
              (item.facebooksharecount || 0) +
              (item.twittersharecount || 0) +
              (item.instagramsharecount || 0);
            templateMap[templateName].downloads += (item.downloadcount || 0);
          });

          Object.values(templateMap).forEach(template => {
            csvContent += [
              escapeCSV(template.name),
              escapeCSV(template.category),
              template.photos,
              template.shares,
              template.whatsapp,
              template.facebook,
              template.twitter,
              template.instagram,
              template.downloads
            ].join(',') + '\n';
          });
          break;
        }

        case 'campaign': {
          // Campaign Performance Report
          const headers = ['Campaign Name', 'Type', 'Status', 'Start Date', 'End Date', 'Sent', 'Delivered', 'Clicks', 'Delivery Rate (%)', 'CTR (%)'];
          csvContent = headers.join(',') + '\n';

          dataToExport.forEach(campaign => {
            const deliveryRate = (campaign.sent || 0) > 0
              ? (((campaign.delivered || 0) / campaign.sent) * 100).toFixed(2)
              : '0.00';
            const ctr = (campaign.delivered || 0) > 0
              ? (((campaign.clicks || 0) / campaign.delivered) * 100).toFixed(2)
              : '0.00';

            csvContent += [
              escapeCSV(campaign.name),
              escapeCSV(campaign.type),
              escapeCSV(campaign.status),
              escapeCSV(formatDate(campaign.startDate, getStoredDateFormat())),
              escapeCSV(formatDate(campaign.endDate, getStoredDateFormat())),
              campaign.sent || 0,
              campaign.delivered || 0,
              campaign.clicks || 0,
              deliveryRate,
              ctr
            ].join(',') + '\n';
          });
          break;
        }

        case 'share': {
          // Share Tracking Report
          const headers = ['Date', 'Customer Name', 'Template', 'WhatsApp Shares', 'Facebook Shares', 'Twitter Shares', 'Instagram Shares', 'Total Shares', 'Downloads'];
          csvContent = headers.join(',') + '\n';

          dataToExport.forEach(item => {
            const totalShares = (item.whatsappsharecount || 0) +
              (item.facebooksharecount || 0) +
              (item.twittersharecount || 0) +
              (item.instagramsharecount || 0);

            csvContent += [
              escapeCSV(formatDate(item.date || item.createdAt, getStoredDateFormat())),
              escapeCSV(item.name || 'Unknown'),
              escapeCSV(item.template_name || item.templatename || item.type || 'N/A'),
              item.whatsappsharecount || 0,
              item.facebooksharecount || 0,
              item.twittersharecount || 0,
              item.instagramsharecount || 0,
              totalShares,
              item.downloadcount || 0
            ].join(',') + '\n';
          });
          break;
        }

        default:
          showAlert('Unknown report type', 'error');
          return;
      }

      // Create and download CSV
      const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${report.name.toLowerCase().replace(/\s+/g, '_')}_${timestamp}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Increment download count via API
      await incrementDownloadCount(report.id, 'csv');

      showAlert(`${report.name} CSV exported successfully!`, 'success');
    } catch (error) {
      console.error('Error downloading CSV:', error);
      const errorMessage = error.message || 'Failed to download CSV report. Please try again.';
      showAlert(errorMessage, 'error');
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadPDF = async (report) => {
    try {
      setDownloading(`pdf-${report.id}`);

      // Validate data
      const dataToExport = report.allData || report.data;
      if (!dataToExport || dataToExport.length === 0) {
        showAlert('No data available to export for this report.', 'warning');
        return;
      }

      // Create PDF document
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;
      const margin = 20;
      const lineHeight = 7;
      const maxWidth = pageWidth - (margin * 2);

      // Helper function to add new page if needed
      const checkNewPage = (requiredSpace = lineHeight) => {
        if (yPosition + requiredSpace > pageHeight - margin) {
          pdf.addPage();
          yPosition = 20;
          return true;
        }
        return false;
      };

      // Helper function to add text with word wrap
      const addText = (text, fontSize = 10, isBold = false, color = [0, 0, 0]) => {
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
        pdf.setTextColor(color[0], color[1], color[2]);

        const lines = pdf.splitTextToSize(text, maxWidth);
        lines.forEach((line) => {
          checkNewPage();
          pdf.text(line, margin, yPosition);
          yPosition += lineHeight;
        });
      };

      // Header
      addText(report.name.toUpperCase(), 18, true, [26, 26, 26]);
      yPosition += 5;
      addText(`Generated: ${formatDate(new Date(), getStoredDateFormat() + ' HH:mm')}`, 10, false, [100, 100, 100]);
      addText(`Time Range: ${activeRange}`, 10, false, [100, 100, 100]);
      addText(`Total Records: ${report.records.toLocaleString()}`, 10, false, [100, 100, 100]);
      yPosition += 10;

      // Report-specific content
      switch (report.id) {
        case 'customer': {
          addText('CUSTOMER ENGAGEMENT SUMMARY', 14, true);
          yPosition += 5;
          addText(`Total Unique Customers: ${report.records.toLocaleString()}`, 12);
          yPosition += 10;

          // Group by customer
          const customerMap = {};
          dataToExport.forEach(item => {
            const phone = item.whatsapp || item.mobile || '';
            const key = phone && phone !== 'N/A' ? phone : (item.name || 'Unknown');
            if (!customerMap[key]) {
              customerMap[key] = {
                name: item.name || 'Unknown',
                photos: 0,
                shares: 0,
                downloads: 0
              };
            }
            customerMap[key].photos += 1;
            customerMap[key].shares += (item.whatsappsharecount || 0) +
              (item.facebooksharecount || 0) +
              (item.twittersharecount || 0) +
              (item.instagramsharecount || 0);
            customerMap[key].downloads += (item.downloadcount || 0);
          });

          addText('Top 10 Customers by Activity:', 12, true);
          yPosition += 5;
          const topCustomers = Object.values(customerMap)
            .sort((a, b) => (b.photos + b.shares + b.downloads) - (a.photos + a.shares + a.downloads))
            .slice(0, 10);
          topCustomers.forEach((customer, idx) => {
            addText(`${idx + 1}. ${customer.name}: ${customer.photos} photos, ${customer.shares} shares, ${customer.downloads} downloads`, 10);
          });
          break;
        }
        case 'photo': {
          addText('PHOTO ANALYTICS SUMMARY', 14, true);
          yPosition += 5;
          addText(`Total Photos: ${report.records.toLocaleString()}`, 12);
          yPosition += 10;

          // Group by template
          const templateMap = {};
          dataToExport.forEach(item => {
            const templateName = item.template_name || item.templatename || item.type || 'Others';
            if (!templateMap[templateName]) {
              templateMap[templateName] = { count: 0, shares: 0, downloads: 0 };
            }
            templateMap[templateName].count += 1;
            templateMap[templateName].shares += (item.whatsappsharecount || 0) +
              (item.facebooksharecount || 0) +
              (item.twittersharecount || 0) +
              (item.instagramsharecount || 0);
            templateMap[templateName].downloads += (item.downloadcount || 0);
          });

          addText('Template Performance:', 12, true);
          yPosition += 5;
          Object.entries(templateMap)
            .sort((a, b) => b[1].count - a[1].count)
            .forEach(([name, stats]) => {
              addText(`${name}: ${stats.count} photos, ${stats.shares} shares, ${stats.downloads} downloads`, 10);
            });
          break;
        }
        case 'campaign': {
          addText('CAMPAIGN PERFORMANCE SUMMARY', 14, true);
          yPosition += 5;
          addText(`Total Campaigns: ${report.records.toLocaleString()}`, 12);
          yPosition += 10;

          let totalSent = 0, totalDelivered = 0, totalClicks = 0;
          dataToExport.forEach(campaign => {
            totalSent += campaign.sent || 0;
            totalDelivered += campaign.delivered || 0;
            totalClicks += campaign.clicks || 0;
          });

          addText('Overall Campaign Metrics:', 12, true);
          yPosition += 5;
          addText(`Total Sent: ${totalSent.toLocaleString()}`, 10);
          addText(`Total Delivered: ${totalDelivered.toLocaleString()}`, 10);
          addText(`Total Clicks: ${totalClicks.toLocaleString()}`, 10);
          const avgDeliveryRate = totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(2) : 0;
          const avgCTR = totalDelivered > 0 ? ((totalClicks / totalDelivered) * 100).toFixed(2) : 0;
          addText(`Average Delivery Rate: ${avgDeliveryRate}%`, 10);
          addText(`Average CTR: ${avgCTR}%`, 10);
          break;
        }
        case 'share': {
          addText('SHARE TRACKING SUMMARY', 14, true);
          yPosition += 5;
          addText(`Total Shares: ${report.records.toLocaleString()}`, 12);
          yPosition += 10;

          let whatsapp = 0, facebook = 0, twitter = 0, instagram = 0, downloads = 0;
          dataToExport.forEach(item => {
            whatsapp += item.whatsappsharecount || 0;
            facebook += item.facebooksharecount || 0;
            twitter += item.twittersharecount || 0;
            instagram += item.instagramsharecount || 0;
            downloads += item.downloadcount || 0;
          });

          addText('Platform Breakdown:', 12, true);
          yPosition += 5;
          addText(`WhatsApp: ${whatsapp.toLocaleString()}`, 10);
          addText(`Facebook: ${facebook.toLocaleString()}`, 10);
          addText(`Twitter: ${twitter.toLocaleString()}`, 10);
          addText(`Instagram: ${instagram.toLocaleString()}`, 10);
          addText(`Total Downloads: ${downloads.toLocaleString()}`, 10);
          break;
        }
      }

      // Footer on last page
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, pageHeight - 10);
      }

      // Save PDF
      const fileName = `${report.name.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      // Increment download count via API
      await incrementDownloadCount(report.id, 'pdf');

      showAlert(`${report.name} PDF exported successfully!`, 'success');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      const errorMessage = error.message || 'Failed to export PDF report. Please try again.';
      showAlert(errorMessage, 'error');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <PageContainer>
      <HeaderSection>
        <HeaderText>
          <h1>Reports & Analytics</h1>
          <p>Generate, manage and download high-level performance data for your store</p>
        </HeaderText>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <RangeSelector>
            {['Today', '7 Days', '30 Days', '90 Days'].map(range => (
              <RangeButton
                key={range}
                $active={activeRange === range}
                onClick={() => setActiveRange(range)}
              >
                {range}
              </RangeButton>
            ))}
          </RangeSelector>
          <PrimaryButton
            onClick={handleRefresh}
            disabled={refreshing || loading}
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            {refreshing ? (
              <>
                <Loader size={14} className="spin" /> Refreshing...
              </>
            ) : (
              <>
                <RefreshCw size={14} /> Refresh
              </>
            )}
          </PrimaryButton>
        </div>
      </HeaderSection>

      <ReportsGrid>
        {loading ? (
          <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px', flexDirection: 'column', gap: '16px' }}>
            <Loader className="spin" size={40} color="#1A1A1A" />
            <div style={{ fontWeight: 600, color: '#555' }}>Loading reports data...</div>
          </div>
        ) : reports.length === 0 ? (
          <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px', flexDirection: 'column', gap: '16px' }}>
            <File size={40} color="#999" />
            <div style={{ fontWeight: 600, color: '#555' }}>No reports available</div>
            <div style={{ color: '#999', fontSize: '14px' }}>Data will appear here once you have activity</div>
          </div>
        ) : reports.map((report) => (
          <ReportCard key={report.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <ReportHeader>
                <IconBox $color={report.color}>
                  {report.icon}
                </IconBox>
                <ReportTitle>
                  <span>{report.type}</span>
                  <h3>{report.name}</h3>
                </ReportTitle>
              </ReportHeader>
            </div>

            <ReportDescription>{report.description}</ReportDescription>

            <MetadataGrid>
              <MetaItem>
                <span className="label">Downloads</span>
                <span className="value">{report.downloadCount || 0}</span>
              </MetaItem>
              <MetaItem>
                <span className="label">Records</span>
                <span className="value">{report.records.toLocaleString()}</span>
              </MetaItem>
              <MetaItem>
                <span className="label">File Size</span>
                <span className="value">{report.size}</span>
              </MetaItem>
            </MetadataGrid>

            <ActionRow>
              <DownloadButton
                $variant="csv"
                onClick={() => handleDownloadCSV(report)}
                disabled={downloading === `csv-${report.id}` || !report.data || report.data.length === 0}
              >
                {downloading === `csv-${report.id}` ? (
                  <>
                    <Loader size={18} className="spin" />
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    <span>Download CSV</span>
                  </>
                )}
              </DownloadButton>
              <DownloadButton
                $variant="pdf"
                onClick={() => handleDownloadPDF(report)}
                disabled={downloading === `pdf-${report.id}` || !report.data || report.data.length === 0}
              >
                {downloading === `pdf-${report.id}` ? (
                  <>
                    <Loader size={18} className="spin" />
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <FileText size={18} />
                    <span>Download PDF</span>
                  </>
                )}
              </DownloadButton>
            </ActionRow>
          </ReportCard>
        ))}
      </ReportsGrid>

      <div style={{ marginTop: '16px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>System Summary</h3>
        <SummaryGrid>
          {(() => {
            const reportsTrend = generateTrendPath(growthMetrics.reportsGrowth);
            const generatedTrend = generateTrendPath(growthMetrics.generatedGrowth);
            const recordsTrend = generateTrendPath(growthMetrics.recordsGrowth);
            const sizeTrend = generateTrendPath(growthMetrics.sizeGrowth);

            return (
              <>
                <KPIMetricCard
                  label="Available Reports"
                  value={summaryStats.totalReports.toString()}
                  trend={growthMetrics.reportsGrowth}
                  trendColor="#3B82F6"
                  icon={<File size={20} />}
                  bgColor="#DBEAFE"
                  points={reportsTrend.points}
                  endX={reportsTrend.endX}
                  endY={reportsTrend.endY}
                />
                <KPIMetricCard
                  label="Generated This Month"
                  value={summaryStats.generatedThisMonth.toString()}
                  trend={growthMetrics.generatedGrowth}
                  trendColor="#10B981"
                  icon={<RefreshCw size={20} />}
                  bgColor="#D1FAE5"
                  points={generatedTrend.points}
                  endX={generatedTrend.endX}
                  endY={generatedTrend.endY}
                />
                <KPIMetricCard
                  label="Total Records"
                  value={summaryStats.totalRecords.toLocaleString()}
                  trend={growthMetrics.recordsGrowth}
                  trendColor="#7A3A95"
                  icon={<Database size={20} />}
                  bgColor="#E8DEE8"
                  points={recordsTrend.points}
                  endX={recordsTrend.endX}
                  endY={recordsTrend.endY}
                />
                <KPIMetricCard
                  label="Total Storage Size"
                  value={summaryStats.totalSize}
                  trend={growthMetrics.sizeGrowth}
                  trendColor="#F59E0B"
                  icon={<HardDrive size={20} />}
                  bgColor="#FEF3C7"
                  points={sizeTrend.points}
                  endX={sizeTrend.endX}
                  endY={sizeTrend.endY}
                />
              </>
            );
          })()}
        </SummaryGrid>
      </div>

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
            <AlertTitle $type={alertModal.type}>
              {alertModal.type === 'success' ? 'Success' : alertModal.type === 'error' ? 'Error' : 'Info'}
            </AlertTitle>
            <AlertMessage>{alertModal.message}</AlertMessage>
            <AlertCloseButton onClick={() => setAlertModal({ show: false, message: '', type: 'info' })}>
              Close
            </AlertCloseButton>
          </AlertModalContent>
        </ModalOverlay>
      )}

      {/* Export Format Logic would ideally encompass table/data export */}
      {/* For now, just ensuring defaults are respected locally if we were to add a 'Download Report' button */}
      {/* Since current code displays stats but doesn't have a direct 'Export' button in this view, I'll add a check where applicable */}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </PageContainer>
  );
};

export default Reports;
