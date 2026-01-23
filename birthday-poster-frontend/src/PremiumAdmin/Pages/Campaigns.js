import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import {
  Plus,
  Send,
  Trash2,
  Edit3,
  ExternalLink,
  MoreVertical,
  Download,
  Filter,
  Calendar,
  Search,
  ChevronDown,
  MessageSquare,
  Mail,
  Smartphone,
  Bell,
  CheckCircle,
  Clock,
  Play,
  AlertCircle,
  BarChart2,
  Share2,
  Users,
  MessageCircle,
  Loader,
  X,
  RefreshCw,
  Eye,
  Copy,
  XCircle
} from 'react-feather';
import Card from '../Components/Card';
import KPIMetricCard from '../Components/charts/KPIMetricCard';
import Pagination from '../Components/Pagination';
import useAxios from '../../useAxios';
import { formatDate, getStoredDateFormat } from '../../utils/dateUtils';

// --- Styled Components ---

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
  }
`;

const HeaderInfo = styled.div`
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

const ActionGroup = styled.div`
  display: flex;
  gap: 12px;
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
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  background: ${({ $variant, theme }) =>
    $variant === 'success' ? '#25D366' :
      $variant === 'primary' ? theme.colors.primaryDark :
        '#1A1A1A'};
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.15);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled.button`
  background: white;
  color: #1A1A1A;
  border: 1px solid #EEE;
  padding: 12px 24px;
  border-radius: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #FAFAFA;
    border-color: #DDD;
  }
`;

const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const ContentCard = styled(Card)`
  padding: 0;
  border-radius: 32px;
  overflow: hidden;
  overflow-x: auto;
`;

const FilterSection = styled.div`
  padding: 24px;
  display: flex;
  gap: 16px;
  border-bottom: 1px solid #F5F5F5;
  align-items: center;
  position: relative;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
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
    padding: 12px 16px 12px 48px;
    border-radius: 18px;
    border: 1.5px solid #EEE;
    font-size: 14px;
    outline: none;
    transition: all 0.2s;
    background: #FFF;

    &:focus {
      border-color: #1A1A1A;
    }
  }
`;

const DropdownSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #FFF;
  border: 1.5px solid #EEE;
  border-radius: 18px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  position: relative;
  
  &:hover {
    border-color: #DDD;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: white;
  border: 1px solid #EEE;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  min-width: 180px;
  z-index: 100;
  display: ${props => props.$show ? 'block' : 'none'};
  animation: fadeIn 0.2s ease;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const DropdownItem = styled.div`
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.$active ? '#1A1A1A' : '#666'};
  background: ${props => props.$active ? '#F5F5F5' : 'transparent'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #F5F5F5;
    color: #1A1A1A;
  }
  
  &:first-child {
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
  }
  
  &:last-child {
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
  }
`;

const CampaignGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
  padding: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const CampaignCard = styled(Card)`
  padding: 24px;
  border-radius: 20px;
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  }
`;

const CampaignTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th {
    text-align: left;
    padding: 16px 24px;
    background: #FAFBFC;
    font-size: 12px;
    font-weight: 700;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 1px solid #F0F0F0;
  }
  
  td {
    padding: 20px 24px;
    border-bottom: 1px solid #F5F5F5;
    font-size: 14px;
    vertical-align: middle;
  }

  tr:last-child td {
    border-bottom: none;
  }
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 700;
  
  ${props => {
    switch (props.$status) {
      case 'Active': return `background: #ECFDF5; color: #059669;`;
      case 'Scheduled': return `background: #EFF6FF; color: #2563EB;`;
      case 'Completed': return `background: #F9FAFB; color: #4B5563;`;
      case 'Failed': return `background: #FEF2F2; color: #DC2626;`;
      case 'Draft': return `background: #F3F4F6; color: #6B7280;`;
      default: return `background: #F3F4F6; color: #6B7280;`;
    }
  }}
`;

const ChannelIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.$color + '20'};
  color: ${props => props.$color};
`;

const ProgressBar = styled.div`
  width: 120px;
  height: 6px;
  background: #F0F0F0;
  border-radius: 100px;
  overflow: hidden;
  margin-top: 4px;

  .fill {
    height: 100%;
    background: #1A1A1A;
    width: ${props => props.$percent}%;
    border-radius: 100px;
  }
`;

const InfoGroup = styled.div`
  h4 {
    margin: 0;
    font-size: 14px;
    font-weight: 700;
    color: #1A1A1A;
  }
  p {
    margin: 2px 0 0 0;
    font-size: 12px;
    color: #666;
  }
`;

const IconButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #F5F5F5;
    color: #1A1A1A;
  }
`;

// Modal Components
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
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 24px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 0;
  margin: 20px;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28px 32px;
  border-bottom: 1px solid #F0F0F0;
  
  h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
  }
`;

const ModalBody = styled.div`
  padding: 32px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  
  label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 600;
    color: #1A1A1A;
  }
  
  input, select, textarea {
    width: 100%;
    padding: 12px 16px;
    border: 1.5px solid #EEE;
    border-radius: 12px;
    font-size: 14px;
    outline: none;
    transition: all 0.2s;
    
    &:focus {
      border-color: #1A1A1A;
    }
  }
  
  textarea {
    min-height: 100px;
    resize: vertical;
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 28px 32px;
  border-top: 1px solid #F0F0F0;
`;

const AlertModalOverlay = styled(ModalOverlay)`
  z-index: 3000;
`;

const AlertModalContent = styled(ModalContent)`
  max-width: 450px;
  text-align: center;
  padding: 32px;
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

const ConfirmModalContent = styled(ModalContent)`
  max-width: 450px;
  text-align: center;
  padding: 32px;
`;

const ConfirmMessage = styled.div`
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

const ErrorText = styled.div`
  color: #EF4444;
  font-size: 12px;
  margin-top: 4px;
  font-weight: 500;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #F0F0F0;
  
  &:last-child {
    border-bottom: none;
  }
  
  .label {
    font-weight: 600;
    color: #666;
    font-size: 14px;
  }
  
  .value {
    font-weight: 700;
    color: #1A1A1A;
    font-size: 14px;
    text-align: right;
  }
`;

const Campaigns = () => {
  const axiosData = useAxios();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All Channels');
  const [filterStatus, setFilterStatus] = useState('All Status');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0
  });
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [scrollMode, setScrollMode] = useState(false); // true for infinite scroll
  const [allCampaigns, setAllCampaigns] = useState([]); // For infinite scroll
  const [loadingMore, setLoadingMore] = useState(false);
  const [growthMetrics, setGrowthMetrics] = useState({
    activeGrowth: 0,
    completedGrowth: 0,
    sentGrowth: 0,
    deliveryGrowth: 0
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

  // Calculate growth metrics from campaigns data
  const calculateGrowthMetrics = (campaignsData) => {
    const now = new Date();
    const last30Days = new Date(now);
    last30Days.setDate(now.getDate() - 30);
    const last60Days = new Date(now);
    last60Days.setDate(now.getDate() - 60);

    const recentCampaigns = campaignsData.filter(c => {
      const date = new Date(c.startDate || c.createdAt);
      return date >= last30Days;
    });
    const previousCampaigns = campaignsData.filter(c => {
      const date = new Date(c.startDate || c.createdAt);
      return date >= last60Days && date < last30Days;
    });

    const calculateGrowth = (current, previous) => {
      const countChange = current - previous;
      return parseFloat(countChange.toFixed(1));
    };

    const recentActive = recentCampaigns.filter(c => c.status === 'Active' || c.status === 'Scheduled').length;
    const previousActive = previousCampaigns.filter(c => c.status === 'Active' || c.status === 'Scheduled').length;
    const recentCompleted = recentCampaigns.filter(c => c.status === 'Completed').length;
    const previousCompleted = previousCampaigns.filter(c => c.status === 'Completed').length;
    const recentSent = recentCampaigns.reduce((acc, c) => acc + (c.sent || 0), 0);
    const previousSent = previousCampaigns.reduce((acc, c) => acc + (c.sent || 0), 0);
    const recentDelivered = recentCampaigns.reduce((acc, c) => acc + (c.delivered || 0), 0);
    const previousDelivered = previousCampaigns.reduce((acc, c) => acc + (c.delivered || 0), 0);

    setGrowthMetrics({
      activeGrowth: calculateGrowth(recentActive, previousActive),
      completedGrowth: calculateGrowth(recentCompleted, previousCompleted),
      sentGrowth: calculateGrowth(recentSent, previousSent),
      deliveryGrowth: calculateGrowth(
        recentSent > 0 ? (recentDelivered / recentSent) * 100 : 0,
        previousSent > 0 ? (previousDelivered / previousSent) * 100 : 0
      )
    });
  };
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingCampaign, setViewingCampaign] = useState(null);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [operationLoading, setOperationLoading] = useState(false);
  const [alertModal, setAlertModal] = useState({ show: false, message: '', type: 'info' });
  const [confirmModal, setConfirmModal] = useState({ show: false, message: '', onConfirm: null });
  const [formErrors, setFormErrors] = useState({});

  // Helper to derive status based on date
  const deriveCampaignStatus = (campaign) => {
    if (!campaign) return 'Draft';
    // If explicitly Failed or Draft (manually set), keep it
    if (campaign.status === 'Failed' || campaign.status === 'Draft') {
      return campaign.status;
    }

    const now = new Date();
    const startDate = new Date(campaign.startDate);
    const endDate = new Date(campaign.endDate);

    // If dates are invalid, fallback to original status or Draft
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return campaign.status || 'Draft';
    }

    if (now < startDate) {
      return 'Scheduled';
    } else {
      // For endDate, we want to include the whole day (until 23:59:59)
      // especially since input[type=date] gives us 00:00:00
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);

      if (now > endOfDay) {
        return 'Completed';
      } else {
        return 'Active';
      }
    }
  };

  // Process campaigns to include derived status
  const processedCampaigns = useMemo(() => {
    return campaigns.map(c => ({
      ...c,
      status: deriveCampaignStatus(c),
      originalStatus: c.status // Keep original for reference if needed
    }));
  }, [campaigns]);

  // Dynamically extract channel types and statuses from processed campaigns data
  const channelTypes = useMemo(() => {
    const types = new Set(processedCampaigns.map(c => c.type).filter(Boolean));
    return Array.from(types).sort();
  }, [processedCampaigns]);

  const statusTypes = useMemo(() => {
    // We want all possible statuses to be valid filters ideally, but dynamic ones depend on time.
    // Let's just gather what we currently have in the processed list.
    const statuses = new Set(processedCampaigns.map(c => c.status).filter(Boolean));
    return Array.from(statuses).sort();
  }, [processedCampaigns]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'WhatsApp',
    status: 'Active',
    startDate: '',
    endDate: '',
    message: ''
  });
  const [photoMergeCustomers, setPhotoMergeCustomers] = useState([]);

  const typeDropdownRef = useRef(null);
  const statusDropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target)) {
        setShowTypeDropdown(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setShowStatusDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchCampaigns = useCallback(async (page = pagination.page, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const response = await axiosData.get(`campaigns?adminid=${user._id || user.id}&page=${page}&limit=${pagination.limit}`);

      // Handle paginated or non-paginated responses
      const campaignsData = Array.isArray(response.data?.data)
        ? response.data.data
        : (Array.isArray(response.data) ? response.data : []);

      if (scrollMode && append) {
        // Append to existing campaigns for infinite scroll
        setAllCampaigns(prev => [...prev, ...campaignsData]);
        setCampaigns(prev => [...prev, ...campaignsData]);
      } else if (scrollMode && !append) {
        // Initial load for infinite scroll
        setAllCampaigns(campaignsData);
        setCampaigns(campaignsData);
      } else {
        // Regular pagination
        setCampaigns(campaignsData);
      }

      // Update pagination if available
      if (response.data?.pagination) {
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total,
          totalPages: response.data.pagination.totalPages,
          page: page
        }));
      }

      // For growth metrics, we might need all campaigns, so fetch separately if needed
      // For now, calculate with current page data
      if (!scrollMode || !append) {
        calculateGrowthMetrics(campaignsData);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [axiosData, user._id, user.id, pagination.limit, scrollMode]);

  const fetchCustomers = useCallback(async () => {
    try {
      const response = await axiosData.get(`campaigns/target/customers?adminid=${user._id || user.id}`);
      setPhotoMergeCustomers(response.data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  }, [axiosData, user._id, user.id]);

  // Handle load more for infinite scroll
  const handleLoadMore = useCallback(() => {
    if (scrollMode && pagination.page < pagination.totalPages && !loadingMore) {
      const nextPage = pagination.page + 1;
      fetchCampaigns(nextPage, true);
    }
  }, [scrollMode, pagination.page, pagination.totalPages, loadingMore, fetchCampaigns]);

  // Fetch campaigns from API
  useEffect(() => {
    if (scrollMode) {
      // Reset and fetch first page when switching to scroll mode
      setAllCampaigns([]);
      setPagination(prev => ({ ...prev, page: 1 }));
    }
    fetchCampaigns(1, false);
    fetchCustomers();
  }, [scrollMode, pagination.limit, fetchCustomers]); // Removed fetchCampaigns from deps to avoid infinite loop

  // Also fetch when page changes in pagination mode
  useEffect(() => {
    if (!scrollMode && pagination.page > 1) {
      fetchCampaigns(pagination.page, false);
    }
  }, [pagination.page]);

  // Helper functions for alerts and confirmations
  const showAlert = (message, type = 'info') => {
    setAlertModal({ show: true, message, type });
  };

  const showConfirm = (message, onConfirm) => {
    setConfirmModal({ show: true, message, onConfirm });
  };

  // Form validation
  const validateForm = () => {
    const errors = {};

    if (!formData.name || formData.name.trim() === '') {
      errors.name = 'Campaign name is required';
    }

    if (!formData.type) {
      errors.type = 'Channel type is required';
    }

    if (!formData.startDate) {
      errors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      errors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) {
        errors.endDate = 'End date must be after start date';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateCampaign = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setOperationLoading(true);
      const campaignData = {
        ...formData,
        adminid: user._id || user.id,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : new Date().toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : new Date().toISOString(),
        targetAudience: {
          source: 'photo merge app'
        }
      };

      await axiosData.post('campaigns', campaignData);
      setShowCreateModal(false);
      resetForm();
      setFormErrors({});
      await fetchCampaigns();
      showAlert('Campaign created successfully!', 'success');
    } catch (error) {
      console.error('Error creating campaign:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to create campaign. Please try again.';
      showAlert(errorMessage, 'error');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleEditCampaign = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setOperationLoading(true);
      const updateData = {
        ...formData,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : editingCampaign.startDate,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : editingCampaign.endDate
      };

      await axiosData.put(`campaigns/${editingCampaign._id}`, updateData);
      setShowEditModal(false);
      setEditingCampaign(null);
      resetForm();
      setFormErrors({});
      await fetchCampaigns();
      showAlert('Campaign updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating campaign:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to update campaign. Please try again.';
      showAlert(errorMessage, 'error');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDeleteCampaign = async (campaignId) => {
    showConfirm('Are you sure you want to delete this campaign? This action cannot be undone.', async () => {
      try {
        setOperationLoading(true);
        await axiosData.delete(`campaigns/${campaignId}`);
        await fetchCampaigns();
        showAlert('Campaign deleted successfully!', 'success');
      } catch (error) {
        console.error('Error deleting campaign:', error);
        const errorMessage = error.response?.data?.error || error.message || 'Failed to delete campaign. Please try again.';
        showAlert(errorMessage, 'error');
      } finally {
        setOperationLoading(false);
      }
    });
  };

  const handleSendCampaign = async (campaignId) => {
    const campaign = campaigns.find(c => (c._id || c.id) === campaignId);
    const customerCount = photoMergeCustomers.length;
    const campaignType = campaign?.type || 'WhatsApp';

    showConfirm(
      `Are you sure you want to send this ${campaignType} campaign? It will be sent to ${customerCount} photo merge app customers.`,
      async () => {
        try {
          setOperationLoading(true);
          const response = await axiosData.post(`campaigns/${campaignId}/send`);
          await fetchCampaigns();

          // Build detailed success message
          let message = response.data?.message || 'Campaign sent successfully!';
          if (response.data?.stats) {
            const { sent, delivered, failed, total } = response.data.stats;
            if (campaignType === 'WhatsApp') {
              message = `Campaign sent successfully!\n\n` +
                `📊 Statistics:\n` +
                `• Total customers: ${total}\n` +
                `• Sent: ${sent}\n` +
                `• Delivered: ${delivered}\n` +
                (failed > 0 ? `• Failed: ${failed}\n` : '');

              if (response.data.errors && response.data.errors.length > 0) {
                message += `\n⚠️ Some messages failed to send. Check campaign details for more info.`;
              }
            }
          }

          showAlert(message, 'success');
        } catch (error) {
          console.error('Error sending campaign:', error);
          const errorMessage = error.response?.data?.error || error.response?.data?.details || error.message || 'Failed to send campaign. Please try again.';
          showAlert(errorMessage, 'error');
        } finally {
          setOperationLoading(false);
        }
      }
    );
  };

  const handleDuplicateCampaign = async (campaign) => {
    try {
      setOperationLoading(true);
      const duplicateData = {
        name: `${campaign.name} (Copy)`,
        description: campaign.description || '',
        type: campaign.type,
        status: 'Draft',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        adminid: user._id || user.id,
        targetAudience: campaign.targetAudience || { source: 'photo merge app' },
        message: campaign.message || '',
        sent: 1,
        delivered: 1,
        clicks: 1
      };

      await axiosData.post('campaigns', duplicateData);
      await fetchCampaigns();
      showAlert('Campaign duplicated successfully!', 'success');
      } catch (error) {
      console.error('Error duplicating campaign:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to duplicate campaign. Please try again.';
      showAlert(errorMessage, 'error');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleViewCampaign = (campaign) => {
    // If campaign is from processedCampaigns, it already has derived status
    // If not, we might want to derive it just in case
    const status = deriveCampaignStatus(campaign);
    setViewingCampaign({ ...campaign, status });
    setShowViewModal(true);
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      await fetchCampaigns();
      await fetchCustomers();
      showAlert('Data refreshed successfully!', 'success');
    } catch (error) {
      console.error('Error refreshing data:', error);
      showAlert('Failed to refresh data. Please try again.', 'error');
      } finally {
        setLoading(false);
      }
    };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: channelTypes.length > 0 ? channelTypes[0] : (processedCampaigns.length > 0 && processedCampaigns[0].type ? processedCampaigns[0].type : 'WhatsApp'),
      status: 'Active', // Default to Active so it becomes automatic based on dates (Draft is for deactivation)
      startDate: '',
      endDate: '',
      message: ''
    });
    setFormErrors({});
  };

  const openEditModal = (campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      name: campaign.name || '',
      description: campaign.description || '',
      type: campaign.type || 'WhatsApp',
      status: campaign.originalStatus || campaign.status || 'Draft', // Use original status for editing to not overwrite logical status accidentally
      startDate: campaign.startDate ? new Date(campaign.startDate).toISOString().split('T')[0] : '',
      endDate: campaign.endDate ? new Date(campaign.endDate).toISOString().split('T')[0] : '',
      message: campaign.message || ''
    });
    setShowEditModal(true);
  };

  const stats = useMemo(() => {
    const active = processedCampaigns.filter(c => c.status === 'Active' || c.status === 'Scheduled').length;
    const completed = processedCampaigns.filter(c => c.status === 'Completed').length;
    const totalSent = processedCampaigns.reduce((acc, curr) => acc + (curr.sent || 0), 0);
    const totalDelivered = processedCampaigns.reduce((acc, curr) => acc + (curr.delivered || 0), 0);
    const avgDelivery = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;

    return { active, completed, totalSent, avgDelivery };
  }, [processedCampaigns]);

  const filteredCampaigns = processedCampaigns.filter(c => {
    const matchesSearch = (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c._id || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'All Channels' || c.type === filterType;
    const matchesStatus = filterStatus === 'All Status' || c.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Pagination for filtered campaigns
  const totalFilteredPages = Math.ceil(filteredCampaigns.length / pagination.limit);
  const startIndex = (pagination.page - 1) * pagination.limit;
  const endIndex = startIndex + pagination.limit;
  const paginatedCampaigns = scrollMode ? filteredCampaigns : filteredCampaigns.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (pagination.page > 1 && totalFilteredPages > 0 && pagination.page > totalFilteredPages) {
      setPagination(prev => ({ ...prev, page: 1 }));
    }
  }, [searchQuery, filterType, filterStatus, totalFilteredPages]);

  const getChannelConfig = (type) => {
    switch (type) {
      case 'WhatsApp': return { icon: <MessageSquare size={16} />, color: '#25D366' };
      case 'Email': return { icon: <Mail size={16} />, color: '#EA4335' };
      case 'SMS': return { icon: <Smartphone size={16} />, color: '#1A1A1A' };
      // case 'Push Notification': return { icon: <Bell size={16} />, color: '#F59E0B' };
      default: return { icon: <AlertCircle size={16} />, color: '#666' };
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Active': return <Play size={12} />;
      case 'Scheduled': return <Clock size={12} />;
      case 'Completed': return <CheckCircle size={12} />;
      case 'Failed': return <AlertCircle size={12} />;
      default: return null;
    }
  };

  const exportData = () => {
    // Helper function to escape CSV values
    const escapeCSV = (value) => {
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      // If value contains comma, quote, or newline, wrap in quotes and escape quotes
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    // Export all campaigns, not just filtered ones
    const dataToExport = processedCampaigns;

    // CSV headers
    const headers = [
      'Name',
      'Description',
      'Type',
      'Status',
      'Start Date',
      'End Date',
      'Sent',
      'Delivered',
      'Clicks',
      'Delivery Rate (%)',
      'CTR (%)',
      'Message'
    ];

    // Build CSV content
    const csvRows = [
      headers.join(','),
      ...dataToExport.map(c => {
        const deliveryRate = (c.sent || 0) > 0 ? (((c.delivered || 0) / c.sent) * 100).toFixed(2) : '0.00';
        const ctr = (c.delivered || 0) > 0 ? (((c.clicks || 0) / c.delivered) * 100).toFixed(2) : '0.00';

        return [
          escapeCSV(c.name || ''),
          escapeCSV(c.description || ''),
          escapeCSV(c.type || ''),
          escapeCSV(c.status || ''), // Uses derived status
          escapeCSV(c.startDate ? formatDate(c.startDate, getStoredDateFormat()) : ''),
          escapeCSV(c.endDate ? formatDate(c.endDate, getStoredDateFormat()) : ''),
          escapeCSV(c.sent || 0),
          escapeCSV(c.delivered || 0),
          escapeCSV(c.clicks || 0),
          escapeCSV(deliveryRate),
          escapeCSV(ctr),
          escapeCSV(c.message || '')
        ].join(',');
      })
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `campaign_report_${formatDate(new Date(), getStoredDateFormat()).replace(/\//g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
          Loading campaigns...
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader>
        <HeaderInfo>
          <h1>Campaign Management</h1>
          <p>Create, manage and analyze your marketing performance across all channels</p>
          {photoMergeCustomers.length > 0 && (
            <p style={{ fontSize: '13px', color: '#059669', marginTop: '4px' }}>
              {photoMergeCustomers.length} photo merge app customers available for targeting
            </p>
          )}
        </HeaderInfo>
        <ActionGroup>
          <SecondaryButton onClick={handleRefresh} disabled={loading || operationLoading}>
            <RefreshCw size={18} style={{ animation: (loading || operationLoading) ? 'spin 1s linear infinite' : 'none' }} /> Refresh
          </SecondaryButton>
          <SecondaryButton onClick={exportData} disabled={campaigns.length === 0}>
            <Download size={18} /> Export Results
          </SecondaryButton>
          <PrimaryButton onClick={() => setShowCreateModal(true)} disabled={operationLoading}>
            <Plus size={18} /> Create New Campaign
          </PrimaryButton>
        </ActionGroup>
      </PageHeader>

      <MetricGrid>
        {(() => {
          const activeTrend = generateTrendPath(growthMetrics.activeGrowth);
          const completedTrend = generateTrendPath(growthMetrics.completedGrowth);
          const sentTrend = generateTrendPath(growthMetrics.sentGrowth);
          const deliveryTrend = generateTrendPath(growthMetrics.deliveryGrowth);

          return (
            <>
              <KPIMetricCard
                label="Active Campaigns"
                value={stats.active}
                trend={growthMetrics.activeGrowth}
                trendColor="#10B981"
                bgColor="#D1FAE5"
                icon={<Play size={20} />}
                points={activeTrend.points}
                endX={activeTrend.endX}
                endY={activeTrend.endY}
              />
              <KPIMetricCard
                label="Completed Campaigns"
                value={stats.completed}
                trend={growthMetrics.completedGrowth}
                trendColor="#7A3A95"
                bgColor="#E8DEE8"
                icon={<CheckCircle size={20} />}
                points={completedTrend.points}
                endX={completedTrend.endX}
                endY={completedTrend.endY}
              />
              <KPIMetricCard
                label="Total Sent"
                value={stats.totalSent.toLocaleString()}
                trend={growthMetrics.sentGrowth}
                trendColor="#D47D52"
                bgColor="#FFF0E5"
                icon={<Send size={20} />}
                points={sentTrend.points}
                endX={sentTrend.endX}
                endY={sentTrend.endY}
              />
              <KPIMetricCard
                label="Avg Delivery Rate"
                value={`${stats.avgDelivery.toFixed(1)}%`}
                trend={growthMetrics.deliveryGrowth}
                trendColor="#F97316"
                bgColor="#FED7AA"
                icon={<BarChart2 size={20} />}
                positive={growthMetrics.deliveryGrowth >= 0}
                points={deliveryTrend.points}
                endX={deliveryTrend.endX}
                endY={deliveryTrend.endY}
              />
            </>
          );
        })()}
      </MetricGrid>

      <ContentCard>
        <FilterSection>
          <SearchBox>
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by campaign name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchBox>
          <div ref={typeDropdownRef} style={{ position: 'relative' }}>
            <DropdownSelector onClick={() => setShowTypeDropdown(!showTypeDropdown)}>
            <Filter size={16} /> {filterType} <ChevronDown size={14} />
          </DropdownSelector>
            <DropdownMenu $show={showTypeDropdown}>
              <DropdownItem
                $active={filterType === 'All Channels'}
                onClick={() => { setFilterType('All Channels'); setShowTypeDropdown(false); }}
              >
                All Channels
              </DropdownItem>
              {channelTypes.map(type => (
                <DropdownItem
                  key={type}
                  $active={filterType === type}
                  onClick={() => { setFilterType(type); setShowTypeDropdown(false); }}
                >
                  {type}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </div>
          <div ref={statusDropdownRef} style={{ position: 'relative' }}>
            <DropdownSelector onClick={() => setShowStatusDropdown(!showStatusDropdown)}>
              <Calendar size={16} /> {filterStatus} <ChevronDown size={14} />
          </DropdownSelector>
            <DropdownMenu $show={showStatusDropdown}>
              <DropdownItem
                $active={filterStatus === 'All Status'}
                onClick={() => { setFilterStatus('All Status'); setShowStatusDropdown(false); }}
              >
                All Status
              </DropdownItem>
              {statusTypes.map(status => (
                <DropdownItem
                  key={status}
                  $active={filterStatus === status}
                  onClick={() => { setFilterStatus(status); setShowStatusDropdown(false); }}
                >
                  {status}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </div>
        </FilterSection>

        {viewMode === 'table' ? (
        <CampaignTable>
          <thead>
            <tr>
                <th style={{ width: '40px' }}></th>
              <th>Campaign Details</th>
              <th>Channel</th>
              <th>Status</th>
              <th>Performance</th>
              <th>Period</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7">
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '100px', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <Loader className="rotate" size={48} color="#1A1A1A" />
                    <div style={{ fontWeight: 600, color: '#666' }}>Loading campaign data...</div>
                  </div>
                </td>
              </tr>
            ) : filteredCampaigns.length === 0 ? (
              <tr>
                <td colSpan="7">
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
                      <Send size={40} />
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#111827', marginBottom: '8px' }}>
                      No campaigns found
                    </div>
                    <div style={{ color: '#6B7280', textAlign: 'center', maxWidth: '400px', fontSize: '15px', lineHeight: '1.6' }}>
                      {searchQuery || filterType !== 'All Channels' || filterStatus !== 'All Status'
                        ? `We couldn't find any campaigns matching your current search or filter criteria.`
                        : "No campaigns have been created yet. Launch your first campaign to start reaching your customers!"}
                    </div>
                    {(searchQuery || filterType !== 'All Channels' || filterStatus !== 'All Status') && (
                      <SecondaryButton
                        style={{ marginTop: '24px', borderRadius: '12px' }}
                        onClick={() => {
                          setSearchQuery('');
                          setFilterType('All Channels');
                          setFilterStatus('All Status');
                        }}
                      >
                        Reset All Filters
                      </SecondaryButton>
                    )}
                  </div>
                </td>
              </tr>
              ) : paginatedCampaigns.map((c) => {
              const channel = getChannelConfig(c.type);
                const deliveryRate = (c.sent || 0) > 0 ? ((c.delivered || 0) / c.sent) * 100 : 0;
                const ctr = (c.delivered || 0) > 0 ? ((c.clicks || 0) / c.delivered) * 100 : 0;

              return (
                  <tr key={c._id || c.id}>
                    <td></td>
                  <td>
                    <InfoGroup>
                      <h4>{c.name}</h4>
                        <p>ID: {c._id || c.id} • {(c.description || '').substring(0, 30)}...</p>
                    </InfoGroup>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <ChannelIcon $color={channel.color}>
                        {channel.icon}
                      </ChannelIcon>
                      <span style={{ fontWeight: 600 }}>{c.type}</span>
                    </div>
                  </td>
                  <td>
                    <StatusBadge $status={c.status}>
                      {getStatusIcon(c.status)} {c.status}
                    </StatusBadge>
                  </td>
                  <td>
                    <InfoGroup>
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '120px', fontSize: '11px', fontWeight: 700 }}>
                        <span>CTR: {ctr.toFixed(1)}%</span>
                        <span>Del: {deliveryRate.toFixed(1)}%</span>
                      </div>
                      <ProgressBar $percent={ctr * 2}>
                        <div className="fill" />
                      </ProgressBar>
                    </InfoGroup>
                  </td>
                  <td>
                    <InfoGroup>
                        <p>{formatDate(c.startDate, getStoredDateFormat())}</p>
                        <p style={{ color: '#999' }}>to {formatDate(c.endDate, getStoredDateFormat())}</p>
                    </InfoGroup>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <IconButton
                          title="View Details"
                          onClick={() => handleViewCampaign(c)}
                        >
                          <Eye size={18} />
                        </IconButton>
                        {c.status !== 'Completed' && (
                          <IconButton
                            title="Send Campaign"
                            onClick={() => handleSendCampaign(c._id || c.id)}
                            disabled={operationLoading}
                          >
                            <Send size={18} />
                          </IconButton>
                        )}
                        <IconButton
                          title="Duplicate Campaign"
                          onClick={() => handleDuplicateCampaign(c)}
                          disabled={operationLoading}
                        >
                          <Copy size={18} />
                        </IconButton>
                        <IconButton
                          title="Edit Campaign"
                          onClick={() => openEditModal(c)}
                          disabled={operationLoading}
                        >
                          <Edit3 size={18} />
                        </IconButton>
                        <IconButton
                          title="Delete Campaign"
                          onClick={() => handleDeleteCampaign(c._id || c.id)}
                          disabled={operationLoading}
                        >
                          <Trash2 size={18} />
                        </IconButton>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </CampaignTable>
        ) : (
          <CampaignGrid>
            {loading ? (
              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', padding: '100px', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <Loader className="rotate" size={48} color="#1A1A1A" />
                <div style={{ fontWeight: 600, color: '#666' }}>Loading campaign data...</div>
              </div>
            ) : paginatedCampaigns.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', padding: '80px 20px', flexDirection: 'column', alignItems: 'center', background: '#FFF' }}>
                <div style={{ width: '80px', height: '80px', background: '#F9FAFB', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', color: '#6B7280' }}>
                  <Send size={40} />
                </div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#111827', marginBottom: '8px' }}>No campaigns found</div>
                <div style={{ color: '#6B7280', textAlign: 'center', maxWidth: '400px', fontSize: '15px', lineHeight: '1.6' }}>
                  {searchQuery || filterType !== 'All Channels' || filterStatus !== 'All Status'
                    ? `We couldn't find any campaigns matching your current search or filter criteria.`
                    : "No campaigns have been created yet. Launch your first campaign to start reaching your customers!"}
                </div>
              </div>
            ) : paginatedCampaigns.map((c) => {
              const channel = getChannelConfig(c.type);
              const deliveryRate = (c.sent || 0) > 0 ? ((c.delivered || 0) / c.sent) * 100 : 0;
              const ctr = (c.delivered || 0) > 0 ? ((c.clicks || 0) / c.delivered) * 100 : 0;

              return (
                <CampaignCard key={c._id || c.id} onClick={() => handleViewCampaign(c)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>{c.name}</h3>
                      <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>ID: {c._id || c.id}</p>
                    </div>
                    <StatusBadge $status={c.status}>
                      {getStatusIcon(c.status)} {c.status}
                    </StatusBadge>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <ChannelIcon $color={channel.color}>
                      {channel.icon}
                    </ChannelIcon>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{c.type}</span>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, marginBottom: '8px' }}>
                      <span>CTR: {ctr.toFixed(1)}%</span>
                      <span>Del: {deliveryRate.toFixed(1)}%</span>
                    </div>
                    <ProgressBar $percent={ctr * 2}>
                      <div className="fill" />
                    </ProgressBar>
                  </div>

                  <div style={{ marginBottom: '16px', fontSize: '13px', color: '#6B7280' }}>
                    <p style={{ margin: '4px 0' }}>{new Date(c.startDate).toLocaleDateString('en-GB')}</p>
                    <p style={{ margin: '4px 0' }}>to {new Date(c.endDate).toLocaleDateString('en-GB')}</p>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', borderTop: '1px solid #F5F5F5', paddingTop: '16px' }}>
                    <IconButton
                      title="View Details"
                      onClick={(e) => { e.stopPropagation(); handleViewCampaign(c); }}
                    >
                      <Eye size={18} />
                    </IconButton>
                    {c.status !== 'Completed' && (
                      <IconButton
                        title="Send Campaign"
                        onClick={(e) => { e.stopPropagation(); handleSendCampaign(c._id || c.id); }}
                        disabled={operationLoading}
                      >
                        <Send size={18} />
                      </IconButton>
                    )}
                    <IconButton
                      title="Duplicate Campaign"
                      onClick={(e) => { e.stopPropagation(); handleDuplicateCampaign(c); }}
                      disabled={operationLoading}
                    >
                      <Copy size={18} />
                    </IconButton>
                    <IconButton
                      title="Edit Campaign"
                      onClick={(e) => { e.stopPropagation(); openEditModal(c); }}
                      disabled={operationLoading}
                    >
                      <Edit3 size={18} />
                    </IconButton>
                    <IconButton
                      title="Delete Campaign"
                      onClick={(e) => { e.stopPropagation(); handleDeleteCampaign(c._id || c.id); }}
                      disabled={operationLoading}
                    >
                      <Trash2 size={18} />
                    </IconButton>
                  </div>
                </CampaignCard>
              );
            })}
          </CampaignGrid>
        )}

        {/* Pagination component will handle its own visibility logic */}
        {filteredCampaigns.length > 0 && (
          <div style={{ padding: '24px' }}>
            <Pagination
              currentPage={pagination.page}
              totalPages={scrollMode ? pagination.totalPages : totalFilteredPages}
              total={scrollMode ? pagination.total : filteredCampaigns.length}
              limit={pagination.limit}
              onPageChange={(page) => {
                setPagination(prev => ({ ...prev, page }));
              }}
              onLimitChange={(limit) => {
                setPagination(prev => ({ ...prev, limit, page: 1 }));
              }}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              scrollMode={scrollMode}
              onScrollModeChange={setScrollMode}
              onLoadMore={handleLoadMore}
              loadingMore={loadingMore}
              hasMore={scrollMode && pagination.page < pagination.totalPages}
            />
          </div>
        )}
      </ContentCard>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <ModalOverlay onClick={() => setShowCreateModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2>Create New Campaign</h2>
              <IconButton onClick={() => { setShowCreateModal(false); resetForm(); }}>
                <X size={24} />
              </IconButton>
            </ModalHeader>
            <ModalBody>
              <FormGroup>
                <label>Campaign Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
                  }}
                  placeholder="Enter campaign name"
                  style={{ borderColor: formErrors.name ? '#EF4444' : '#EEE' }}
                />
                {formErrors.name && <ErrorText>{formErrors.name}</ErrorText>}
              </FormGroup>
              <FormGroup>
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter campaign description"
                />
              </FormGroup>
              <FormGroup>
                <label>Channel Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Email">Email</option>
                  <option value="SMS">SMS</option>
                  {/* <option value="Push Notification">Push Notification</option> */}
                </select>
              </FormGroup>

              <FormGroup>
                <label>Start Date *</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </FormGroup>
              <FormGroup>
                <label>End Date *</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </FormGroup>
              <FormGroup>
                <label>Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Enter campaign message"
                />
              </FormGroup>
              <div style={{
                padding: '16px',
                background: '#F0F9FF',
                borderRadius: '12px',
                marginTop: '20px',
                fontSize: '13px',
                color: '#1E40AF'
              }}>
                <strong>Target Audience:</strong> This campaign will target {photoMergeCustomers.length} photo merge app customers.
              </div>
            </ModalBody>
            <ModalFooter>
              <SecondaryButton onClick={() => { setShowCreateModal(false); resetForm(); }}>
                Cancel
              </SecondaryButton>
              <PrimaryButton
                onClick={handleCreateCampaign}
                disabled={operationLoading || !formData.name || !formData.startDate || !formData.endDate}
              >
                {operationLoading ? (
                  <>
                    <Loader size={18} className="rotate" /> Creating...
                  </>
                ) : (
                  'Create Campaign'
                )}
              </PrimaryButton>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Edit Campaign Modal */}
      {showEditModal && editingCampaign && (
        <ModalOverlay onClick={() => { setShowEditModal(false); setEditingCampaign(null); resetForm(); }}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2>Edit Campaign</h2>
              <IconButton onClick={() => { setShowEditModal(false); setEditingCampaign(null); resetForm(); }}>
                <X size={24} />
              </IconButton>
            </ModalHeader>
            <ModalBody>
              <FormGroup>
                <label>Campaign Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
                  }}
                  style={{ borderColor: formErrors.name ? '#EF4444' : '#EEE' }}
                />
                {formErrors.name && <ErrorText>{formErrors.name}</ErrorText>}
              </FormGroup>
              <FormGroup>
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </FormGroup>
              <FormGroup>
                <label>Channel Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Email">Email</option>
                  <option value="SMS">SMS</option>
                  {/* <option value="Push Notification">Push Notification</option> */}
                </select>
              </FormGroup>

              <FormGroup>
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Draft">Draft (Deactivated)</option>
                  <option value="Active">Active (Automatic)</option>
                  <option value="Scheduled">Scheduled (Automatic)</option>
                  <option value="Completed">Completed (Automatic)</option>
                  <option value="Failed">Failed</option>
                </select>
              </FormGroup>

              <FormGroup>
                <label>Start Date *</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => {
                    setFormData({ ...formData, startDate: e.target.value });
                    if (formErrors.startDate) setFormErrors({ ...formErrors, startDate: '' });
                  }}
                  style={{ borderColor: formErrors.startDate ? '#EF4444' : '#EEE' }}
                />
                {formErrors.startDate && <ErrorText>{formErrors.startDate}</ErrorText>}
              </FormGroup>
              <FormGroup>
                <label>End Date *</label>
                <input
                  type="date"
                  value={formData.endDate}
                  min={formData.startDate || ''}
                  onChange={(e) => {
                    setFormData({ ...formData, endDate: e.target.value });
                    if (formErrors.endDate) setFormErrors({ ...formErrors, endDate: '' });
                  }}
                  style={{ borderColor: formErrors.endDate ? '#EF4444' : '#EEE' }}
                />
                {formErrors.endDate && <ErrorText>{formErrors.endDate}</ErrorText>}
              </FormGroup>
              <FormGroup>
                <label>Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </FormGroup>
            </ModalBody>
            <ModalFooter>
              <SecondaryButton onClick={() => { setShowEditModal(false); setEditingCampaign(null); resetForm(); }}>
                Cancel
              </SecondaryButton>
              <PrimaryButton
                onClick={handleEditCampaign}
                disabled={operationLoading || !formData.name || !formData.startDate || !formData.endDate}
              >
                {operationLoading ? (
                  <>
                    <Loader size={18} className="rotate" /> Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </PrimaryButton>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* View Campaign Details Modal */}
      {showViewModal && viewingCampaign && (
        <ModalOverlay onClick={() => { setShowViewModal(false); setViewingCampaign(null); }}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2>Campaign Details</h2>
              <IconButton onClick={() => { setShowViewModal(false); setViewingCampaign(null); }}>
                <X size={24} />
              </IconButton>
            </ModalHeader>
            <ModalBody>
              <DetailRow>
                <span className="label">Campaign Name</span>
                <span className="value">{viewingCampaign.name}</span>
              </DetailRow>
              <DetailRow>
                <span className="label">Description</span>
                <span className="value">{viewingCampaign.description || 'N/A'}</span>
              </DetailRow>
              <DetailRow>
                <span className="label">Channel Type</span>
                <span className="value">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                    {(() => {
                      const channel = getChannelConfig(viewingCampaign.type);
                      return (
                        <>
                          <ChannelIcon $color={channel.color}>{channel.icon}</ChannelIcon>
                          {viewingCampaign.type}
                        </>
                      );
                    })()}
                  </div>
                </span>
              </DetailRow>
              <DetailRow>
                <span className="label">Status</span>
                <span className="value">
                  <StatusBadge $status={viewingCampaign.status}>
                    {getStatusIcon(viewingCampaign.status)} {viewingCampaign.status}
                  </StatusBadge>
                </span>
              </DetailRow>
              <DetailRow>
                <span className="label">Start Date</span>
                <span className="value">{formatDate(viewingCampaign.startDate, getStoredDateFormat())}</span>
              </DetailRow>
              <DetailRow>
                <span className="label">End Date</span>
                <span className="value">{formatDate(viewingCampaign.endDate, getStoredDateFormat())}</span>
              </DetailRow>
              <DetailRow>
                <span className="label">Sent</span>
                <span className="value">{(viewingCampaign.sent || 0).toLocaleString()}</span>
              </DetailRow>
              <DetailRow>
                <span className="label">Delivered</span>
                <span className="value">{(viewingCampaign.delivered || 0).toLocaleString()}</span>
              </DetailRow>
              <DetailRow>
                <span className="label">Clicks</span>
                <span className="value">{(viewingCampaign.clicks || 0).toLocaleString()}</span>
              </DetailRow>
              <DetailRow>
                <span className="label">Delivery Rate</span>
                <span className="value">
                  {viewingCampaign.sent > 0
                    ? ((viewingCampaign.delivered / viewingCampaign.sent) * 100).toFixed(1) + '%'
                    : '0%'}
                </span>
              </DetailRow>
              <DetailRow>
                <span className="label">CTR (Click-Through Rate)</span>
                <span className="value">
                  {viewingCampaign.delivered > 0
                    ? ((viewingCampaign.clicks / viewingCampaign.delivered) * 100).toFixed(1) + '%'
                    : '0%'}
                </span>
              </DetailRow>
              {viewingCampaign.message && (
                <DetailRow>
                  <span className="label">Message</span>
                  <span className="value" style={{ textAlign: 'left', maxWidth: '60%' }}>{viewingCampaign.message}</span>
                </DetailRow>
              )}
              <DetailRow>
                <span className="label">Created At</span>
                <span className="value">{formatDate(viewingCampaign.createdAt, getStoredDateFormat())}</span>
              </DetailRow>
              <DetailRow>
                <span className="label">Last Updated</span>
                <span className="value">{formatDate(viewingCampaign.updatedAt || viewingCampaign.createdAt, getStoredDateFormat())}</span>
              </DetailRow>
            </ModalBody>
            <ModalFooter>
              <SecondaryButton onClick={() => { setShowViewModal(false); setViewingCampaign(null); }}>
                Close
              </SecondaryButton>
              <PrimaryButton onClick={() => {
                setShowViewModal(false);
                openEditModal(viewingCampaign);
              }}>
                <Edit3 size={18} /> Edit Campaign
              </PrimaryButton>
            </ModalFooter>
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
            <ModalActionFooter>
              <PrimaryButton
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
            <ModalActionFooter>
              <SecondaryButton
                onClick={() => setConfirmModal({ show: false, message: '', onConfirm: null })}
              >
                Cancel
              </SecondaryButton>
              <PrimaryButton
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

export default Campaigns;

// Add CSS for loader animation
const style = document.createElement('style');
style.textContent = `
  .rotate {
    animation: rotate 2s linear infinite;
  }
  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
if (!document.querySelector('style[data-campaigns-loader]')) {
  style.setAttribute('data-campaigns-loader', 'true');
  document.head.appendChild(style);
}
