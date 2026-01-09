import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import {
  Share2, Users, MousePointer, Image as ImageIcon,
  Download, MessageCircle, Search, ChevronDown,
  Filter, Calendar, TrendingUp, TrendingDown,
  ArrowRight, MoreVertical, Eye, RotateCcw, Send, Loader,
  Instagram, Facebook, X, Mail, AlertCircle, CheckCircle, XCircle
} from 'react-feather';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Legend,
  Cell
} from 'recharts';
import Card from '../Components/Card';
import useAxios from '../../useAxios';
import Pagination from '../Components/Pagination';

// Configuration Constants (can be fetched from API or settings in future)
const SHARE_TRACKING_CONFIG = {
  dateRangeOptions: ['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'Last 90 Days'],
  defaultDateRange: 'Last 30 Days',
  defaultPlatform: 'All Platforms',
  itemsPerPage: 10,
  clicksMultiplier: 1.5, // Clicks = shares * multiplier
  platforms: [
    { 
      name: 'WhatsApp', 
      key: 'WhatsApp', 
      color: '#20BD5A', 
      icon: 'MessageCircle',
      shareKey: 'whatsappsharecount'
    },
    { 
      name: 'Instagram', 
      key: 'Instagram', 
      color: '#E4405F', 
      icon: 'Instagram',
      shareKey: 'instagramsharecount'
    },
    { 
      name: 'Facebook', 
      key: 'Facebook', 
      color: '#1877F2', 
      icon: 'Facebook',
      shareKey: 'facebooksharecount'
    },
    { 
      name: 'Twitter',
      key: 'Twitter',
      color: '#1DA1F2',
      icon: 'Share2',
      shareKey: 'twittersharecount'
    },
    { 
      name: 'Download', 
      key: 'Download', 
      color: '#D97706', 
      icon: 'Download',
      shareKey: 'downloadcount'
    }
  ],
  metricCards: [
    {
      label: 'Total Shares',
      key: 'totalShares',
      icon: 'Share2',
      bgColor: '#F5E8C8',
      trendColor: '#B8653A',
      growthKey: 'sharesGrowth'
    },
    {
      label: 'Unique Users',
      key: 'uniqueUsers',
      icon: 'Users',
      bgColor: '#D1FAE5',
      trendColor: '#10B981',
      growthKey: 'usersGrowth'
    },
    {
      label: 'Total Clicks',
      key: 'totalClicks',
      icon: 'MousePointer',
      bgColor: '#E8D5FF',
      trendColor: '#8B5CF6',
      growthKey: 'clicksGrowth'
    },
    {
      label: 'Photos Shared',
      key: 'photosShared',
      icon: 'ImageIcon',
      bgColor: '#FED7AA',
      trendColor: '#F97316',
      growthKey: 'photosGrowth'
    }
  ]
};

// Icon mapping
const iconComponents = {
  Share2,
  Users,
  MousePointer,
  ImageIcon,
  MessageCircle,
  Instagram,
  Facebook,
  Download
};

// --- Styled Components ---

const PageContainer = styled.div`
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 40px;

  @media (max-width: 1024px) {
    flex-direction: column;
    gap: 20px;
  }
`;

const PageInfo = styled.div`
  h1 {
    font-size: 28px;
    font-weight: 700;
    color: #111;
    margin: 0;
  }
  p {
    color: #777;
    margin-top: 4px;
    font-size: 14px;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
`;

const PrimaryButton = styled.button`
  padding: 10px 20px;
  border-radius: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 15px;
  border: none;

  background: ${props => {
    if (props.$variant === 'outline') return '#E2E2E2';
    if (props.$variant === 'success') return 'linear-gradient(90deg, #22C55E 0%, #10B981 100%)';
    return '#0F0F0F';
  }};

  color: ${props => {
    if (props.$variant === 'outline') return '#1A1A1A';
    return '#FFF';
  }};

  border: ${props => props.$variant === 'outline' ? '1px solid #D5D5D5' : 'none'};

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;

const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 40px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const MetricCard = styled(Card)`
  padding: 24px;
  border-radius: 32px;
  background: white;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 180px;
  border: 1px solid rgba(0,0,0,0.03);
  position: relative;
  overflow: hidden;
  background-color: ${props => props.$bgColor || 'white'} !important;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 1;
`;

const IconBox = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0F0F0F;
`;

const CardLabel = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #666;
`;

const MetricValue = styled.div`
  font-size: 34px;
  font-weight: 800;
  color: #0F0F0F;
  margin: 16px 0 8px 0;
  z-index: 1;
  letter-spacing: -1px;
`;

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  z-index: 1;
`;

const GrowthTag = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: ${props => props.$color || '#22C55E'};
  display: flex;
  align-items: center;
`;

const ChartContainer = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  margin-bottom: 40px;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const ControlBar = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  align-items: center;

  @media (max-width: 1024px) {
    flex-wrap: wrap;
    
    & > * {
        flex: 1;
        min-width: 200px;
    }
  }
`;

const SearchBox = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;
  
  svg {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: #999;
  }
  
  input {
    width: 100%;
    padding: 14px 16px 14px 48px;
    border-radius: 18px;
    border: 1.5px solid #EEE;
    font-size: 15px;
    outline: none;
    transition: all 0.2s;
    background: #FFF;
    font-weight: 500;

    &:focus {
      border-color: #1A1A1A;
      box-shadow: 0 4px 20px rgba(0,0,0,0.05);
    }
  }
`;

const DropdownContainer = styled.div`
  position: relative;
`;

const DropdownButton = styled.button`
  padding: 12px 20px;
  border-radius: 18px;
  border: 1.5px solid #EEE;
  background: #FFF;
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  min-width: 160px;
  justify-content: space-between;
  transition: all 0.2s;

  &:hover {
    border-color: #DDD;
    background: #E8E8E8;
  }

  ${props => props.$isOpen && `
    border-color: #1A1A1A;
    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  `}
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  width: 100%;
  background: white;
  border-radius: 18px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.12);
  padding: 8px;
  z-index: 100;
  display: ${props => props.$isOpen ? 'block' : 'none'};
  border: 1px solid #EEE;
  animation: slideUp 0.2s ease-out;

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const DropdownItem = styled.div`
  padding: 10px 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  color: ${props => props.$active ? '#FFF' : '#1A1A1A'};
  background: ${props => props.$active ? '#1A1A1A' : 'transparent'};

  &:hover {
    background: ${props => props.$active ? '#0F0F0F' : '#E5E5E5'};
  }
`;

const TableCard = styled(Card)`
  padding: 0;
  border-radius: 32px;
  overflow: hidden;
  background: #FFF;
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th {
    text-align: left;
    padding: 20px 24px;
    background: #E8E9EA;
    font-size: 12px;
    font-weight: 700;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 1px solid #D8D8D8;
  }
  
  td {
    padding: 20px 24px;
    border-bottom: 1px solid #E5E5E5;
    font-size: 14px;
    color: #0F0F0F;
    vertical-align: middle;
  }

  tr:last-child td {
    border-bottom: none;
  }

  tr:hover td {
    background: #FAFAFA;
  }
`;


const PlatformIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.$color + '15'};
  color: ${props => props.$color};
`;

const IconButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 12px;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #F0F0F0;
    color: #0F0F0F;
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
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
  z-index: 2000;
  backdrop-filter: blur(5px);
`;

const ModalContent = styled.div`
  background: white;
  width: 100%;
  max-width: 600px;
  padding: 32px;
  border-radius: 32px;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #0F0F0F;
`;

const MessageTextArea = styled.textarea`
  width: 100%;
  height: 150px;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #E5E7EB;
  background: #F9FAFB;
  font-family: inherit;
  font-size: 15px;
  margin-bottom: 24px;
  resize: none;
  &:focus {
    outline: none;
    border-color: #667eea;
    background: #FFF;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  }
`;

const ModalActionFooter = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
`;

const InfoBox = styled.div`
  padding: 16px;
  background: #F9FAFB;
  border-radius: 12px;
  
  .label {
    font-size: 12px;
    font-weight: 600;
    color: #666;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .value {
    font-size: 16px;
    font-weight: 700;
    color: #0F0F0F;
  }
`;

const ShareTypeButton = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 20px 24px;
  border: 2px solid ${props => props.$selected ? props.$color : '#E5E7EB'};
  background: ${props => props.$selected ? `${props.$color}15` : '#FFF'};
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.$selected ? props.$color : '#1A1A1A'};
  margin-bottom: 12px;
  
  &:hover {
    border-color: ${props => props.$color};
    background: ${props => `${props.$color}10`};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
  
  .icon-wrapper {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: ${props => `${props.$color}20`};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$color};
  }
`;

const AlertModalOverlay = styled(ModalOverlay)`
  z-index: 3000;
`;

const AlertModalContent = styled(ModalContent)`
  max-width: 450px;
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

const ConfirmModalContent = styled(ModalContent)`
  max-width: 450px;
  text-align: center;
`;

const ConfirmMessage = styled.div`
  font-size: 16px;
  color: #0F0F0F;
  margin-bottom: 32px;
  line-height: 1.6;
`;

const BulkActionBar = styled.div`
  position: fixed;
  bottom: 40px;
  left: 60%;
  transform: translateX(-50%);
  background: #1A1A1A;
  color: white;
  padding: 16px 24px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  min-width: 400px;

  .count {
    font-weight: 700;
    font-size: 15px;
  }

  @media (max-width: 768px) {
    left: 50%;
    min-width: 90%;
    flex-direction: column;
    gap: 12px;
  }
`;

// --- Components ---

const ShareTracking = () => {
  const axiosData = useAxios();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [loading, setLoading] = useState(true);
  const [rawData, setRawData] = useState([]);
  const [processedData, setProcessedData] = useState([]);
  const [metrics, setMetrics] = useState({
    totalShares: 0,
    uniqueUsers: 0,
    totalClicks: 0,
    photosShared: 0,
    sharesGrowth: 0,
    usersGrowth: 0,
    clicksGrowth: 0,
    photosGrowth: 0
  });

  // State to store trend path configurations from API
  const [trendPaths, setTrendPaths] = useState({
    totalShares: null,
    uniqueUsers: null,
    totalClicks: null,
    photosShared: null
  });

  // Fetch metrics from API
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const metricsResponse = await axiosData.get(`upload/dashboard-metrics?adminid=${user._id || user.id}`);
        if (metricsResponse.data.metrics?.shareTracking) {
          const apiMetrics = metricsResponse.data.metrics.shareTracking;
          setMetrics(prev => ({
            ...prev,
            totalShares: apiMetrics.totalShares?.value || prev.totalShares,
            uniqueUsers: apiMetrics.uniqueUsers?.value || prev.uniqueUsers,
            totalClicks: apiMetrics.totalClicks?.value || prev.totalClicks,
            photosShared: apiMetrics.photosShared?.value || prev.photosShared,
            sharesGrowth: apiMetrics.totalShares?.growth || 0,
            usersGrowth: apiMetrics.uniqueUsers?.growth || 0,
            clicksGrowth: apiMetrics.totalClicks?.growth || 0,
            photosGrowth: apiMetrics.photosShared?.growth || 0
          }));
          
          // Store trend path configurations from API
          setTrendPaths({
            totalShares: apiMetrics.totalShares?.trendPath || null,
            uniqueUsers: apiMetrics.uniqueUsers?.trendPath || null,
            totalClicks: apiMetrics.totalClicks?.trendPath || null,
            photosShared: apiMetrics.photosShared?.trendPath || null
          });
        }
      } catch (error) {
        console.error("Error fetching metrics:", error);
      }
    };
    fetchMetrics();
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState(SHARE_TRACKING_CONFIG.defaultPlatform);
  const [selectedDateRange, setSelectedDateRange] = useState(SHARE_TRACKING_CONFIG.defaultDateRange);
  const [showPlatformDropdown, setShowPlatformDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(SHARE_TRACKING_CONFIG.itemsPerPage);
  
  // Selection State
  const [selectedItems, setSelectedItems] = useState([]);
  
  // Modal States
  const [viewingItem, setViewingItem] = useState(null);
  const [showMsgModal, setShowMsgModal] = useState(false);
  const [customMsg, setCustomMsg] = useState('');
  const [isSendingMsg, setIsSendingMsg] = useState(false);
  const [showResendModal, setShowResendModal] = useState(false);
  const [isResendingShare, setIsResendingShare] = useState(false);
  
  // Alert & Confirmation Modal States
  const [alertModal, setAlertModal] = useState({ show: false, message: '', type: 'info' });
  const [confirmModal, setConfirmModal] = useState({ show: false, message: '', onConfirm: null });
  
  // Get dynamic platform list (exclude platforms with no data if needed)
  const getAvailablePlatforms = () => {
    const allPlatforms = ['All Platforms', ...SHARE_TRACKING_CONFIG.platforms.map(p => p.name)];
    return allPlatforms;
  };
  
  // Helper function to generate SVG trend path based on growth value
  const generateTrendPath = (growth) => {
    const growthValue = parseFloat(growth) || 0;
    
    // Normalize growth to a -50 to +50 scale for better visualization
    const normalizedGrowth = Math.max(-50, Math.min(50, growthValue));
    const scaleFactor = normalizedGrowth / 50; // -1 to 1
    
    // For 60x30 viewBox: X ranges 0-60, Y ranges 0-30 (lower Y = higher on screen)
    const startY = 20; // Middle baseline
    const endYOffset = -scaleFactor * 12; // Move up/down based on growth (max 12px movement)
    const endY = startY + endYOffset;
    
    // Ensure Y stays within viewBox bounds (0-30)
    const clampedEndY = Math.max(5, Math.min(25, endY));
    
    // Create smooth curve points with control points for better curve
    const midY1 = startY + (endYOffset * 0.2);
    const midY2 = startY + (endYOffset * 0.6);
    
    // Generate dynamic Bezier curve path
    // M = Move to start, C = Cubic Bezier curve (control points)
    const path = `M5,${startY} C18,${startY - scaleFactor * 2} 32,${midY1 + scaleFactor * 1} 45,${midY2} C48,${midY2 + scaleFactor * 1} 50,${clampedEndY - scaleFactor * 0.5} 55,${clampedEndY}`;
    
    return {
      points: path,
      endX: 55,
      endY: Math.round(clampedEndY),
      isPositive: growthValue >= 0
    };
  };
  
  // Helper Functions for Alerts and Confirmations
  const showAlert = (message, type = 'info') => {
    setAlertModal({ show: true, message, type });
  };
  
  const showConfirm = (message, onConfirm) => {
    setConfirmModal({ show: true, message, onConfirm });
  };
  
  // Handler Functions
  const handleViewDetails = (item) => {
    setViewingItem(item);
  };
  
  const handleResendShare = (item) => {
    if (!item) {
      showAlert('Item information not available.', 'error');
      return;
    }
    
    // Check if customer has either WhatsApp or Email
    const hasWhatsApp = item.customerId && item.customerId !== 'N/A';
    const hasEmail = item.email && item.email !== 'N/A';
    
    if (!hasWhatsApp && !hasEmail) {
      showAlert('Customer information (WhatsApp or Email) not available for resending share.', 'error');
      return;
    }
    
    setViewingItem(item);
    setShowResendModal(true);
  };
  
  const confirmResendShare = async (type) => {
    if (!viewingItem) return;
    
    // Find the original raw data item to get posterVideoId
    const rawItem = rawData.find(r => r._id === viewingItem.id);
    if (!rawItem) {
      showAlert('Original data not found.', 'error');
      setShowResendModal(false);
      setViewingItem(null);
      return;
    }
    
    // Check if required contact info is available based on type
    if (type === 'whatsapp' && (!viewingItem.customerId || viewingItem.customerId === 'N/A')) {
      showAlert('WhatsApp number not available for this customer.', 'error');
      return;
    }
    
    if (type === 'email' && (!viewingItem.email || viewingItem.email === 'N/A')) {
      showAlert('Email address not available for this customer.', 'error');
      return;
    }
    
    // Construct viewUrl from posterVideoId
    const posterVideoId = rawItem.posterVideoId;
    const viewUrl = `https://app.bilimbebrandactivations.com/photomergeapp/share/${posterVideoId}`;
    
    // Ask for confirmation before sending
    const confirmMsg = type === 'email'
      ? `Send output message to ${viewingItem.email}?`
      : `Send output message to ${viewingItem.customerId} on WhatsApp?`;
    
    showConfirm(confirmMsg, async () => {
      await executeResendShare(type, viewUrl);
    });
  };
  
  const executeResendShare = async (type, viewUrl) => {
    if (!viewingItem) return;

    setIsResendingShare(true);
    try {
      const rawItem = rawData.find(r => r._id === viewingItem.id);
      if (!rawItem) {
        showAlert('Original data not found.', 'error');
        setIsResendingShare(false);
        return;
      }
      
      const contact = type === 'email' ? viewingItem.email : viewingItem.customerId;
      const response = await axiosData.post(
        `client/client/share/${contact}`,
        {
          typeSend: type,
          viewUrl: viewUrl,
          id: rawItem._id || rawItem.photoId,
          name: viewingItem.customer || viewingItem.name
        },
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
      
      if (response.data.success) {
        showAlert(`Share resent to ${viewingItem.customer} via ${type === 'email' ? 'Email' : 'WhatsApp'} successfully!`, 'success');
        setShowResendModal(false);
        setViewingItem(null);
        // Refresh data after successful resend
        await fetchData();
      } else {
        throw new Error('Failed to resend message');
      }
    } catch (error) {
      console.error('Resend Message Error:', error);
      showAlert(`Failed to resend message via ${type === 'email' ? 'Email' : 'WhatsApp'}. Please try again.`, 'error');
    } finally {
      setIsResendingShare(false);
    }
  };
  
  const handleWhatsApp = (item) => {
    setViewingItem(item);
    const defaultMsg = item.photo
      ? `Hello ${item.customer}, check out your ${item.photo} poster!`
      : `Hello ${item.customer}, thank you for sharing!`;
    setCustomMsg(defaultMsg);
    setShowMsgModal(true);
  };
  
  const confirmSendMessage = async () => {
    if (!viewingItem) return;
    if (!viewingItem.customerId || viewingItem.customerId === 'N/A') {
      showAlert('Phone number not available for this customer.', 'error');
      return;
    }
    
    if (!customMsg.trim()) {
      showAlert('Please enter a message.', 'error');
      return;
    }
    
    setIsSendingMsg(true);
    try {
      // Find the original raw data item
      const rawItem = rawData.find(r => r._id === viewingItem.id);
      if (!rawItem) {
        showAlert('Original data not found.', 'error');
        setIsSendingMsg(false);
        return;
      }
      
      const response = await axiosData.post('/upload/custom-share', {
        mobile: viewingItem.customerId,
        _id: rawItem._id || rawItem.photoId,
        message: customMsg
      });
      
      if (response.data.success) {
        showAlert(`Message sent to ${viewingItem.customer} successfully!`, 'success');
        setShowMsgModal(false);
        setCustomMsg('');
        setViewingItem(null);
      } else {
        throw new Error('Failed to send message via API');
      }
    } catch (error) {
      console.error('WhatsApp Error:', error);
      showAlert('Failed to send message via WhatsApp API.', 'error');
      setShowMsgModal(false);
    } finally {
      setIsSendingMsg(false);
    }
  };

  // Refs for dropdowns
  const platformRef = useRef(null);
  const dateRef = useRef(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axiosData.get(`upload/all?source=Photo Merge App&adminid=${user._id || user.id}`);
      
      // Handle paginated responses
      const dataArray = Array.isArray(res.data?.data) 
        ? res.data.data 
        : (Array.isArray(res.data) ? res.data : []);
      
      const data = dataArray.filter(item =>
        item.source === 'Photo Merge App'
      );

      setRawData(data);
      processData(data);
      setLoading(false);
    } catch (err) {
      console.error("Fetch Error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const processData = (data) => {
    let totalShares = 0;
    const uniqueUsersSet = new Set();
    const photosSharedSet = new Set();
    
    // Initialize platform stats dynamically
    const platformStats = {};
    SHARE_TRACKING_CONFIG.platforms.forEach(platform => {
      platformStats[platform.name] = 0;
    });

    const sharesByDay = {};

    const processed = data.map(item => {
      // Calculate shares dynamically based on platform config
      let totalEngagement = 0;
      const platformShares = {};
      
      SHARE_TRACKING_CONFIG.platforms.forEach(platform => {
        const count = item[platform.shareKey] || 0;
        platformShares[platform.name] = count;
        totalEngagement += count;
      });

      totalShares += totalEngagement;

      if (totalEngagement > 0) {
        uniqueUsersSet.add(item.whatsapp || item.mobile || item.name);
        photosSharedSet.add(item.photoId || item._id);
      }

      const dateStr = new Date(item.date || item.createdAt).toLocaleDateString('en-GB');
      if (!sharesByDay[dateStr]) {
        sharesByDay[dateStr] = { date: dateStr };
        SHARE_TRACKING_CONFIG.platforms.forEach(platform => {
          sharesByDay[dateStr][platform.name] = 0;
        });
      }
      
      SHARE_TRACKING_CONFIG.platforms.forEach(platform => {
        sharesByDay[dateStr][platform.name] += platformShares[platform.name] || 0;
        platformStats[platform.name] += platformShares[platform.name] || 0;
      });

      // Determine primary platform (first platform with shares)
      const primaryPlatform = SHARE_TRACKING_CONFIG.platforms.find(p => (platformShares[p.name] || 0) > 0);
      const platformName = primaryPlatform ? primaryPlatform.name : 'No Share';

      return {
        id: item._id,
        customer: item.name || 'Anonymous',
        email: item.email || item.mail || 'N/A',
        customerId: item.whatsapp || 'N/A',
        photo: item.template_name || item.templatename || 'Custom Poster',
        platform: platformName,
        shares: totalEngagement,
        clicks: item.urlclickcount || 0, // Use actual URL click count from API
        status: item.whatsappstatus === 'yes' ? 'Success' : 'Pending',
        timestamp: new Date(item.date || item.createdAt),
        formattedDate: new Date(item.date || item.createdAt).toLocaleString('en-GB', {
          day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        })
      };
    });

    setProcessedData(processed.sort((a, b) => b.timestamp - a.timestamp));

    // Update metrics with local calculations (growth values come from API)
    setMetrics(prev => ({
      ...prev,
      totalShares,
      uniqueUsers: uniqueUsersSet.size,
      // totalClicks comes from `/upload/dashboard-metrics` (API-derived)
      photosShared: photosSharedSet.size
    }));
  };

  const filteredData = processedData.filter(item => {
    const matchesSearch = item.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.photo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.platform.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPlatform = selectedPlatform === SHARE_TRACKING_CONFIG.defaultPlatform || item.platform === selectedPlatform;

    // Dynamic date filter logic based on config
    let matchesDate = true;
    const now = new Date();
    const todayStr = now.toLocaleDateString('en-CA');
    const itemDateStr = new Date(item.timestamp).toLocaleDateString('en-CA');
    const diff = (now - item.timestamp) / (1000 * 60 * 60 * 24);

    if (selectedDateRange === 'Today') {
      matchesDate = itemDateStr === todayStr;
    } else if (selectedDateRange === 'Yesterday') {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      matchesDate = itemDateStr === yesterday.toLocaleDateString('en-CA');
    } else if (selectedDateRange.startsWith('Last ')) {
      // Extract number from "Last X Days"
      const daysMatch = selectedDateRange.match(/Last (\d+) Days/);
      if (daysMatch) {
        const days = parseInt(daysMatch[1]);
        matchesDate = diff < days;
      }
    }

    return matchesSearch && matchesPlatform && matchesDate;
  });

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedPlatform, selectedDateRange]);

  // Calculate Paginated Data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (size) => {
    setItemsPerPage(size);
    setCurrentPage(1);
  };

  // Selection Functions
  const toggleSelect = (id) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const selectAll = () => {
    const allCurrentPageIds = currentItems.map(item => item.id);
    const allSelected = allCurrentPageIds.every(id => selectedItems.includes(id));
    
    if (allSelected) {
      // Deselect all items on current page
      setSelectedItems(prev => prev.filter(id => !allCurrentPageIds.includes(id)));
    } else {
      // Select all items on current page
      setSelectedItems(prev => {
        const newSelection = [...prev];
        allCurrentPageIds.forEach(id => {
          if (!newSelection.includes(id)) {
            newSelection.push(id);
          }
        });
        return newSelection;
      });
    }
  };

  const selectAllFiltered = () => {
    const allFilteredIds = filteredData.map(item => item.id);
    const allSelected = allFilteredIds.every(id => selectedItems.includes(id));
    
    if (allSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems(allFilteredIds);
    }
  };

  const exportToExcel = (dataToExport = null) => {
    // Ensure we have valid data to export
    let data;
    if (dataToExport && Array.isArray(dataToExport) && dataToExport.length > 0) {
      // Use explicitly passed data (from bulk selection)
      data = dataToExport;
    } else {
      // Default: use filteredData (what's shown in the table)
      // filteredData is already calculated and in sync with the table display
      data = filteredData;
    }
    
    // Validate that data is an array
    if (!Array.isArray(data)) {
      console.error('Export data is not an array:', data, 'Type:', typeof data);
      showAlert('No data available to export.', 'error');
      return;
    }
    
    // Check if data has items
    if (data.length === 0) {
      // If filteredData is empty but processedData has items, it means filters are too restrictive
      if (processedData && processedData.length > 0) {
        showAlert('No data matches your current filters. Please adjust your filters and try again.', 'error');
      } else {
        showAlert('No data available to export. Please wait for data to load.', 'error');
      }
      return;
    }

    const csvRows = [
      ['Customer', 'Customer ID', 'Email', 'Photo', 'Platform', 'Shares', 'Clicks', 'Date', 'Status'],
      ...data.map(d => [
        d.customer || '',
        d.customerId || '',
        d.email || '',
        d.photo || '',
        d.platform || '',
        d.shares || 0,
        d.clicks || 0,
        d.formattedDate || '',
        d.status || ''
      ])
    ];
    const csvContent = "\uFEFF" + csvRows.map(e => e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const dataType = dataToExport ? 'Selected' : 'All';
    link.setAttribute("download", `ShareReport_${dataType}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <PageContainer>
      <HeaderSection>
        <PageInfo>
          <h1>Share Tracking & Analytics</h1>
          <p>Track social media shares and engagement across platforms</p>
        </PageInfo>
        <ActionButtons>
          <PrimaryButton $variant="outline" onClick={() => exportToExcel()}>
            <Download size={18} /> Export as Excel
          </PrimaryButton>
          {/* <PrimaryButton $variant="success">
            <MessageCircle size={18} /> Bulk Whatsapp
          </PrimaryButton> */}
        </ActionButtons>
      </HeaderSection>

      <MetricGrid>
        {SHARE_TRACKING_CONFIG.metricCards.map((metricConfig) => {
          const IconComponent = iconComponents[metricConfig.icon];
          const value = metrics[metricConfig.key] || 0;
          const growth = metrics[metricConfig.growthKey] || 0;
          const isPositive = growth >= 0;
          const growthColor = isPositive ? metricConfig.trendColor : "#E53935";
          
          // Use trend path from API if available, otherwise generate locally as fallback
          const apiTrendPath = trendPaths[metricConfig.key];
          const trendPath = apiTrendPath || generateTrendPath(growth);
          
          return (
            <MetricCard key={metricConfig.key} $bgColor={metricConfig.bgColor}>
              <CardHeader>
                <IconBox><IconComponent size={20} /></IconBox>
                <CardLabel>{metricConfig.label}</CardLabel>
              </CardHeader>
              <MetricValue>{value.toLocaleString()}</MetricValue>
              <CardFooter>
                <GrowthTag $color={growthColor}>
                  {isPositive ? '▲' : '▼'} {isPositive ? '+' : ''}{growth}%
                </GrowthTag>
                <svg width="60" height="30" viewBox="0 0 60 30" fill="none" style={{ overflow: 'visible' }}>
                  <path 
                    d={trendPath.points}
                    stroke={growthColor} 
                    strokeWidth="2.5" 
                    strokeLinecap="round"
                    style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))' }}
                  />
                  <circle 
                    cx={trendPath.endX}
                    cy={trendPath.endY}
                    r="2.5" 
                    fill="white" 
                    stroke={growthColor} 
                    strokeWidth="2" 
                  />
                </svg>
              </CardFooter>
            </MetricCard>
          );
        })}
      </MetricGrid>

      <ControlBar>
        <SearchBox>
          <Search size={18} />
          <input
            placeholder="Search by customer, photo, or platform..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchBox>

        <DropdownContainer ref={dateRef}>
          <DropdownButton onClick={() => setShowDateDropdown(!showDateDropdown)} $isOpen={showDateDropdown}>
            <Calendar size={18} /> {selectedDateRange} <ChevronDown size={14} />
          </DropdownButton>
          <DropdownMenu $isOpen={showDateDropdown}>
            {SHARE_TRACKING_CONFIG.dateRangeOptions.map(d => (
              <DropdownItem key={d} $active={selectedDateRange === d} onClick={() => { setSelectedDateRange(d); setShowDateDropdown(false); }}>{d}</DropdownItem>
            ))}
          </DropdownMenu>
        </DropdownContainer>

        <DropdownContainer ref={platformRef}>
          <DropdownButton onClick={() => setShowPlatformDropdown(!showPlatformDropdown)} $isOpen={showPlatformDropdown}>
            <Filter size={18} /> {selectedPlatform} <ChevronDown size={14} />
          </DropdownButton>
          <DropdownMenu $isOpen={showPlatformDropdown}>
            {getAvailablePlatforms().map(p => (
              <DropdownItem key={p} $active={selectedPlatform === p} onClick={() => { setSelectedPlatform(p); setShowPlatformDropdown(false); }}>{p}</DropdownItem>
            ))}
          </DropdownMenu>
        </DropdownContainer>
      </ControlBar>

      <TableCard>
        <Table>
          <thead>
            <tr>
              <th style={{ width: '40px' }}>
                <input
                  type="checkbox"
                  checked={currentItems.length > 0 && currentItems.every(item => selectedItems.includes(item.id))}
                  onChange={selectAll}
                  title={currentItems.length > 0 && currentItems.every(item => selectedItems.includes(item.id)) ? 'Deselect all on this page' : 'Select all on this page'}
                />
              </th>
              <th>Customer</th>
              <th>Photo / Template</th>
              <th>Platform</th>
              <th>Engagement</th>
              <th>Date & Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8">
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '100px', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <Loader className="rotate" size={48} color="#1A1A1A" />
                    <div style={{ fontWeight: 600, color: '#666' }}>Fetching tracking data...</div>
                  </div>
                </td>
              </tr>
            ) : currentItems.length === 0 ? (
              <tr>
                <td colSpan="8">
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '80px 20px',
                    flexDirection: 'column',
                    alignItems: 'center',
                    background: '#FFF'
                  }}>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      background: '#F9FAFB',
                      borderRadius: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '20px',
                      color: '#6B7280'
                    }}>
                      <Share2 size={40} />
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#111827', marginBottom: '8px' }}>
                      No tracking records found
                    </div>
                    <div style={{ color: '#6B7280', textAlign: 'center', maxWidth: '400px', fontSize: '15px', lineHeight: '1.6' }}>
                      {searchQuery || selectedPlatform !== SHARE_TRACKING_CONFIG.defaultPlatform || selectedDateRange !== SHARE_TRACKING_CONFIG.defaultDateRange
                        ? `We couldn't find any share records matching your current search or filter criteria.`
                        : "No shares have been tracked yet. Engagement data will appear here once customers start sharing their posters."}
                    </div>
                    {(searchQuery || selectedPlatform !== SHARE_TRACKING_CONFIG.defaultPlatform || selectedDateRange !== SHARE_TRACKING_CONFIG.defaultDateRange) && (
                      <PrimaryButton
                        $variant="outline"
                        style={{ marginTop: '24px', borderRadius: '12px' }}
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedPlatform(SHARE_TRACKING_CONFIG.defaultPlatform);
                          setSelectedDateRange(SHARE_TRACKING_CONFIG.defaultDateRange);
                          setCurrentPage(1);
                        }}
                      >
                        Reset All Filters
                      </PrimaryButton>
                    )}
                  </div>
                </td>
              </tr>
            ) : currentItems.map(row => (
              <tr key={row.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(row.id)}
                    onChange={() => toggleSelect(row.id)}
                  />
                </td>
                <td>
                  <div style={{ fontWeight: 700 }}>{row.customer}</div>
                  <div style={{ fontSize: '12px', color: '#999' }}>{row.email}</div>
                </td>
                <td>
                  <div style={{ fontWeight: 600 }}>{row.photo}</div>
                </td>
                <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {row.platform !== 'No Share' && (() => {
                      const platformConfig = SHARE_TRACKING_CONFIG.platforms.find(p => p.name === row.platform);
                      if (!platformConfig) return null;
                      
                      const IconComponent = iconComponents[platformConfig.icon];
                      return (
                        <PlatformIcon $color={platformConfig.color}>
                          <IconComponent size={16} />
                        </PlatformIcon>
                      );
                    })()}
                    <span style={{ fontWeight: 600 }}>{row.platform}</span>
                  </div>
                </td>
                <td>
                  <div style={{ fontWeight: 700 }}>{row.shares} Shares</div>
                  <div style={{ fontSize: '12px', color: '#999' }}>{row.clicks} Clicks</div>
                </td>
                <td>{row.formattedDate}</td>
                <td>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <IconButton title="View Details" onClick={() => handleViewDetails(row)}><Eye size={18} /></IconButton>
                    <IconButton title="Resend Message" onClick={() => handleResendShare(row)}><RotateCcw size={18} /></IconButton>
                    <IconButton title="WhatsApp Message" style={{ color: '#25D366' }} onClick={() => handleWhatsApp(row)}><Send size={18} /></IconButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Pagination
          totalItems={filteredData.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </TableCard>

      {/* Bulk Action Bar */}
      {selectedItems.length > 0 && (
        <BulkActionBar>
          <div className="count">{selectedItems.length} {selectedItems.length === 1 ? 'item' : 'items'} selected</div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <PrimaryButton 
              onClick={() => exportToExcel(processedData.filter(item => selectedItems.includes(item.id)))} 
              style={{ padding: '8px 16px', fontSize: '12px', background: '#333' }}
            >
              <Download size={14} /> Export Selected
            </PrimaryButton>
            <PrimaryButton 
              onClick={selectAllFiltered}
              style={{ padding: '8px 16px', fontSize: '12px', background: '#666' }}
            >
              {filteredData.every(item => selectedItems.includes(item.id)) ? 'Deselect All' : 'Select All'}
            </PrimaryButton>
            <IconButton 
              style={{ color: 'white' }} 
              onClick={() => setSelectedItems([])}
              title="Clear selection"
            >
              <X size={18} />
            </IconButton>
          </div>
        </BulkActionBar>
      )}

      {/* View Details Modal */}
      {viewingItem && !showMsgModal && !showResendModal && (
        <ModalOverlay onClick={() => setViewingItem(null)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Share Details</ModalTitle>
              <IconButton onClick={() => setViewingItem(null)}><X size={20} /></IconButton>
            </ModalHeader>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <InfoBox>
                <div className="label">Customer</div>
                <div className="value">{viewingItem.customer}</div>
              </InfoBox>
              <InfoBox>
                <div className="label">Customer ID</div>
                <div className="value">{viewingItem.customerId}</div>
              </InfoBox>
              <InfoBox>
                <div className="label">Email</div>
                <div className="value">{viewingItem.email}</div>
              </InfoBox>
              <InfoBox>
                <div className="label">Platform</div>
                <div className="value">{viewingItem.platform}</div>
              </InfoBox>
              <InfoBox>
                <div className="label">Photo / Template</div>
                <div className="value">{viewingItem.photo}</div>
              </InfoBox>
              <InfoBox>
                <div className="label">Message Send Status</div>
                <div className="value" style={{ 
                  color: viewingItem.status === 'Success' ? '#10B981' : '#F59E0B' 
                }}>{viewingItem.status}</div>
              </InfoBox>
              <InfoBox>
                <div className="label">Shares</div>
                <div className="value">{viewingItem.shares}</div>
              </InfoBox>
              <InfoBox>
                <div className="label">Clicks</div>
                <div className="value">{viewingItem.clicks}</div>
              </InfoBox>
            </div>
            
            <InfoBox style={{ marginBottom: '24px' }}>
              <div className="label">Date & Time</div>
              <div className="value">{viewingItem.formattedDate}</div>
            </InfoBox>
            
            <ModalActionFooter>
              <PrimaryButton $variant="outline" onClick={() => setViewingItem(null)}>
                Close
              </PrimaryButton>
              <PrimaryButton $variant="success" onClick={() => handleWhatsApp(viewingItem)}>
                <MessageCircle size={16} /> Send WhatsApp
              </PrimaryButton>
            </ModalActionFooter>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* WhatsApp Message Modal */}
      {showMsgModal && viewingItem && (
        <ModalOverlay onClick={() => { setShowMsgModal(false); setViewingItem(null); }}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Compose Message</ModalTitle>
              <IconButton onClick={() => { setShowMsgModal(false); setViewingItem(null); }}>
                <X size={20} />
              </IconButton>
            </ModalHeader>
            <div style={{ marginBottom: '16px', fontSize: '14px', color: '#666' }}>
              To: <strong>{viewingItem.customer}</strong> ({viewingItem.customerId})
            </div>
            <MessageTextArea
              value={customMsg}
              onChange={e => setCustomMsg(e.target.value)}
              placeholder="Type your message here..."
            />
            <ModalActionFooter>
              <PrimaryButton $variant="outline" onClick={() => { setShowMsgModal(false); setViewingItem(null); }}>
                Cancel
              </PrimaryButton>
              <PrimaryButton
                $variant="success"
                onClick={confirmSendMessage}
                disabled={isSendingMsg}
              >
                {isSendingMsg ? 'Sending...' : 'Send Message'}
              </PrimaryButton>
            </ModalActionFooter>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Resend Message Type Selection Modal */}
      {showResendModal && viewingItem && !showMsgModal && (
        <ModalOverlay onClick={() => { setShowResendModal(false); setViewingItem(null); }}>
          <ModalContent onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <ModalHeader>
              <ModalTitle>Resend Message</ModalTitle>
              <IconButton onClick={() => { setShowResendModal(false); setViewingItem(null); }}>
                <X size={20} />
              </IconButton>
            </ModalHeader>
            <div style={{ marginBottom: '24px', fontSize: '14px', color: '#666' }}>
              Choose how to resend the output message to <strong>{viewingItem.customer}</strong>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <ShareTypeButton
                $color="#25D366"
                $selected={true}
                onClick={() => confirmResendShare('whatsapp')}
                disabled={isResendingShare || !viewingItem.customerId || viewingItem.customerId === 'N/A'}
              >
                <div className="icon-wrapper">
                  <MessageCircle size={24} />
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, marginBottom: '4px' }}>WhatsApp</div>
                  <div style={{ fontSize: '13px', fontWeight: 400, color: '#666' }}>
                    {viewingItem.customerId && viewingItem.customerId !== 'N/A' 
                      ? `Send to ${viewingItem.customerId}`
                      : 'WhatsApp number not available'}
                  </div>
                </div>
              </ShareTypeButton>
              
              <ShareTypeButton
                $color="#1877F2"
                $selected={true}
                onClick={() => confirmResendShare('email')}
                disabled={isResendingShare || !viewingItem.email || viewingItem.email === 'N/A'}
              >
                <div className="icon-wrapper">
                  <Mail size={24} />
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, marginBottom: '4px' }}>Email</div>
                  <div style={{ fontSize: '13px', fontWeight: 400, color: '#666' }}>
                    {viewingItem.email && viewingItem.email !== 'N/A'
                      ? `Send to ${viewingItem.email}`
                      : 'Email address not available'}
                  </div>
                </div>
              </ShareTypeButton>
            </div>
            
            {isResendingShare && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '12px',
                padding: '16px',
                background: '#F9FAFB',
                borderRadius: '12px',
                marginBottom: '24px'
              }}>
                <Loader size={20} className="rotate" />
                <span style={{ fontSize: '14px', color: '#666' }}>Sending...</span>
              </div>
            )}
            
            <ModalActionFooter>
              <PrimaryButton 
                $variant="outline" 
                onClick={() => { setShowResendModal(false); setViewingItem(null); }}
                disabled={isResendingShare}
              >
                Cancel
              </PrimaryButton>
            </ModalActionFooter>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Alert Modal */}
      {alertModal.show && (
        <AlertModalOverlay onClick={() => setAlertModal({ show: false, message: '', type: 'info' })}>
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
            <ModalActionFooter style={{ justifyContent: 'center' }}>
              <PrimaryButton
                $variant={alertModal.type === 'success' ? 'success' : 'outline'}
                onClick={() => setAlertModal({ show: false, message: '', type: 'info' })}
              >
                OK
              </PrimaryButton>
            </ModalActionFooter>
          </AlertModalContent>
        </AlertModalOverlay>
      )}

      {/* Confirmation Modal */}
      {confirmModal.show && (
        <AlertModalOverlay onClick={() => setConfirmModal({ show: false, message: '', onConfirm: null })}>
          <ConfirmModalContent onClick={e => e.stopPropagation()}>
            <AlertIconWrapper $type="info">
              <AlertCircle size={32} />
            </AlertIconWrapper>
            <ConfirmMessage>{confirmModal.message}</ConfirmMessage>
            <ModalActionFooter style={{ justifyContent: 'center' }}>
              <PrimaryButton
                $variant="outline"
                onClick={() => setConfirmModal({ show: false, message: '', onConfirm: null })}
              >
                Cancel
              </PrimaryButton>
              <PrimaryButton
                $variant="success"
                onClick={() => {
                  if (confirmModal.onConfirm) {
                    confirmModal.onConfirm();
                  }
                  setConfirmModal({ show: false, message: '', onConfirm: null });
                }}
              >
                Confirm
              </PrimaryButton>
            </ModalActionFooter>
          </ConfirmModalContent>
        </AlertModalOverlay>
      )}
    </PageContainer>
  );
};

export default ShareTracking;
