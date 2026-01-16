import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import Card from '../Components/Card';
import Pagination from '../Components/Pagination';
import { useLocation, useNavigate } from 'react-router-dom';
import { keyframes, css } from 'styled-components';
import {
  Search,
  Download,
  Plus,
  MessageCircle,
  Users,
  Activity,
  Image as ImageIcon,
  ShoppingBag,
  MoreVertical,
  Eye,
  RotateCcw,
  Send,
  MoreHorizontal,
  AlertCircle,
  CheckCircle,
  XCircle,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Facebook,
  Video,
  Loader,
  Share2,
} from 'react-feather';
import useAxios from '../../useAxios';
import { formatDate, getStoredDateFormat } from '../../utils/dateUtils';
import { isVideoType } from '../../utils/accessTypeUtils';

// --- Styled Components ---

const CustomersContainer = styled.div`
  .rotate {
    animation: rotate 2s linear infinite;
  }
  
  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;

  @media (max-width: 1024px) {
    flex-direction: column;
    gap: 20px;
  }
`;

const PageInfo = styled.div`
  h1 {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
  }
  p {
    margin: 4px 0 0 0;
    color: #666;
    font-size: 14px;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
`;

const PrimaryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  
  background: ${({ $variant, theme }) =>
    $variant === 'success' ? '#25D366' :
      $variant === 'primary' ? theme.colors.primaryDark :
        '#F5F5F5'};
    
  color: ${({ $variant }) =>
    $variant === 'outline' ? '#0F0F0F' : '#FFF'};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
`;

// (Removed old Metric styled components to use new KPI components)

const ControlBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  margin-bottom: 24px;
`;

const DropdownContainer = styled.div`
  position: relative;
`;

const DropdownButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 16px;
  background: white;
  border: 1px solid #EEE;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #0F0F0F;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 180px;
  
  &:hover {
    background: #E8E8E8;
    border-color: #DDD;
  }

  svg {
    transition: transform 0.3s ease;
    transform: ${({ $isOpen }) => $isOpen ? 'rotate(180deg)' : 'rotate(0)'};
    color: #999;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  width: 100%;
  min-width: 220px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
  border: 1px solid #D8D8D8;
  padding: 8px;
  z-index: 100;
  opacity: ${({ $isOpen }) => $isOpen ? 1 : 0};
  visibility: ${({ $isOpen }) => $isOpen ? 'visible' : 'hidden'};
  transform: translateY(${({ $isOpen }) => $isOpen ? '0' : '10px'});
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

const DropdownItem = styled.div`
  padding: 10px 16px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: ${({ $active }) => $active ? '#1A1A1A' : '#666'};
  background: ${({ $active }) => $active ? '#F5F5F5' : 'transparent'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #F9F9F9;
    color: #0F0F0F;
  }
`;

const SearchBox = styled.div`
  position: relative;
  width: 300px;
  
  input {
    width: 100%;
    padding: 10px 16px 10px 40px;
    border-radius: 12px;
    border: 1px solid #EEE;
    font-size: 14px;
    outline: none;
    transition: all 0.2s;
    
    &:focus {
      border-color: #0F0F0F;
    }
  }
  
  svg {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: #999;
  }
`;

const TableCard = styled(Card)`
  padding: 0;
  overflow: hidden;
  border-radius: 32px;
overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th {
    text-align: left;
    padding: 16px 24px;
    background: #E8E8E8;
    font-size: 12px;
    font-weight: 700;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const pulseAnimation = keyframes`
  0% { background-color: transparent; }
  50% { background-color: rgba(102, 126, 234, 0.15); }
  100% { background-color: transparent; }
`;

const HighlightedText = styled.span`
  background: #ffd54f;
  color: #0F0F0F;
  font-weight: 700;
  border-radius: 2px;
  padding: 0 2px;
`;

const TableRow = styled.tr`
  td {
    padding: 16px 24px;
    border-bottom: 1px solid #E5E5E5;
    font-size: 14px;
    color: #0F0F0F;
    vertical-align: middle;
    transition: background 0.3s ease;
  }

  ${props => props.$highlighted && css`
    td {
      animation: ${pulseAnimation} 2s ease-in-out infinite;
      border-bottom: 2px solid #667eea;
      border-top: 2px solid #667eea;
      background-color: rgba(102, 126, 234, 0.05) !important;
    }
  `}

  &:last-child td {
    border-bottom: none;
  }

  &:hover td {
    background: #E8E8E8;
  }
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 30px;
  background: ${({ theme }) => theme.colors.accentPurple};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #0F0F0F;
`;

const StatusBadge = styled.span`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  background: ${({ $status }) => $status === 'active' ? '#D9E6D0' : '#E5E5E5'};
  color: ${({ $status }) => $status === 'active' ? '#3D8F40' : '#777'};
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

const MessageTextArea = styled.textarea`
  width: 100%;
  height: 150px;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #D5D7DB;
  background: #E8E9EA;
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
  font-weight: 800;
  color: #0F0F0F;
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

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 32px;
  
  .avatar {
    width: 80px;
    height: 80px;
    border-radius: 24px;
    background: ${({ theme }) => theme.colors.accentPurple};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    font-weight: 700;
  }
  
  .info h2 {
    margin: 0;
    font-size: 24px;
  }
  
  .info p {
    margin: 4px 0 0 0;
    color: #888;
    font-size: 14px;
  }
`;

const ProfileSection = styled.div`
  margin-bottom: 24px;
  h4 {
    margin: 0 0 12px 0;
    font-size: 14px;
    text-transform: uppercase;
    color: #888;
    letter-spacing: 1px;
  }
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
`;

const InfoBox = styled.div`
  padding: 16px;
  background: #F9F9F9;
  border-radius: 16px;
  .label {
    font-size: 11px;
    color: #999;
    font-weight: 600;
    margin-bottom: 4px;
  }
  .value {
    font-size: 15px;
    font-weight: 700;
    color: #0F0F0F;
  }
`;

const BulkActionBar = styled.div`
  position: fixed;
  bottom: 40px;
  left: 60%;
  transform: translateX(-50%);
  background: #1A1A1A;
  padding: 12px 24px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 24px;
  color: white;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  animation: slideUp 0.3s ease;

  @keyframes slideUp {
    from { transform: translate(-50%, 100px); }
    to { transform: translate(-50%, 0); }
  }
  
  .count {
    font-weight: 700;
    font-size: 14px;
    color: #E8DFF1;
  }
`;

// --- New KPI Card Components ---

const KPIBox = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 32px;
  
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
  border-radius: 32px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 180px;
  position: relative;
  overflow: hidden;
  transition: transform 0.2s;
  
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

const CardLabel = styled.div`
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

// --- Main Page Component ---

const Customers = () => {
  const axiosData = useAxios();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('All Branches');
  const [selectedTemplate, setSelectedTemplate] = useState('All Templates');
  const [selectedDateFilter, setSelectedDateFilter] = useState('All Time');
  const [viewingCustomer, setViewingCustomer] = useState(null);
  const location = useLocation();
  const [highlightedId, setHighlightedId] = useState(null);
  const [showMsgModal, setShowMsgModal] = useState(false);
  const [customMsg, setCustomMsg] = useState('');
  const [activeCustomer, setActiveCustomer] = useState(null);
  const [isSendingMsg, setIsSendingMsg] = useState(false);
  const [showActivityHistory, setShowActivityHistory] = useState(false);
  const [activityHistory, setActivityHistory] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const rowRefs = useRef({});

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Alert & Confirmation Modal States
  const [alertModal, setAlertModal] = useState({ show: false, message: '', type: 'info' });
  const [confirmModal, setConfirmModal] = useState({ show: false, message: '', onConfirm: null });

  // Helper Functions for Alerts and Confirmations
  const showAlert = (message, type = 'info') => {
    setAlertModal({ show: true, message, type });
  };

  const showConfirm = (message, onConfirm) => {
    setConfirmModal({ show: true, message, onConfirm });
  };

  const highlightText = (text, query) => {
    if (!query || !text) return text;
    const parts = String(text).split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ?
        <HighlightedText key={index}>{part}</HighlightedText> : part
    );
  };

  // Dropdown visibility states
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);

  const branchRef = useRef(null);
  const templateRef = useRef(null);
  const dateRef = useRef(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Fetch real data from API
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        console.log('Fetching customers data for admin:', user._id || user.id);

        // Fetch templates to get accessType mapping
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
          console.error("Error fetching templates:", templatesError);
        }

        // Optimized: Fetch with reasonable limit for faster load
        const response = await axiosData.get(`upload/all?adminid=${user._id || user.id}&page=1&limit=2000`);
        console.log('Raw response data:', response.data);

        // Handle paginated responses
        const dataArray = Array.isArray(response.data?.data)
          ? response.data.data
          : (Array.isArray(response.data) ? response.data : []);

        const rawItems = dataArray.filter(item =>
          item.source === 'photo merge app' || item.source === 'video merge app'
        );
        console.log('Filtered items (Merge Apps):', rawItems.length);

        const customersMap = {};

        rawItems.forEach(item => {
          const phone = item.whatsapp || item.mobile || '';
          const key = phone && phone !== 'N/A' ? phone : (item.name || 'Unknown');

          const rawDate = item.date || item.createdAt || new Date();
          const itemTime = new Date(rawDate).getTime();
          const validTime = isNaN(itemTime) ? Date.now() : itemTime;

          if (!customersMap[key]) {
            customersMap[key] = {
              ...item,
              visitCount: 0,
              photoCount: 0,
              videoCount: 0,
              shareCount: 0,
              downloadCount: 0,
              latestTimeStamp: validTime
            };
          }

          const entry = customersMap[key];
          const itemShares = (item.whatsappsharecount || 0) +
            (item.facebooksharecount || 0) +
            (item.twittersharecount || 0) +
            (item.instagramsharecount || 0);
          const itemDownloads = item.downloadcount || 0;

          // Media Type logic based on accessType from template (future-proof)
          const isVideo = isVideoType(item, templateAccessTypeMap, { enableFallback: true });

          entry.visitCount += 1;
          if (isVideo) {
            entry.videoCount = (entry.videoCount || 0) + 1;
          } else {
            entry.photoCount = (entry.photoCount || 0) + 1;
          }
          entry.shareCount += itemShares;
          entry.downloadCount = (entry.downloadCount || 0) + itemDownloads;

          if (validTime >= entry.latestTimeStamp) {
            entry.latestTimeStamp = validTime;
            entry.name = item.name || entry.name;
            entry.email = item.email || entry.email;
            entry.branchName = item.branchName || entry.branchName;
            entry.template_name = item.template_name || item.templatename || item.type || entry.template_name;
            // Capture latest photo IDs for messaging
            entry.photoId = item.photoId;
            entry.posterVideoId = item.posterVideoId;
            entry.latestMediaId = item._id;
          }
        });

        const mappedData = Object.values(customersMap).map((item, index) => {
          const dateObj = new Date(item.latestTimeStamp);
          const formattedDate = formatDate(dateObj, getStoredDateFormat());

          return {
            id: item._id || `CUST-${index}`,
            name: item.name || 'Anonymous',
            email: item.email || 'N/A',
            phone: item.whatsapp || item.mobile || 'N/A',
            visits: item.visitCount,
            photos: item.photoCount || 0,
            videos: item.videoCount || 0,
            shares: item.shareCount,
            template_name: item.template_name || 'N/A',
            branchName: item.branchName || 'N/A',
            lastVisit: formattedDate,
            timestamp: item.latestTimeStamp,
            initial: (item.name || 'A')[0].toUpperCase(),
            // Pass along media info for messaging
            latestMediaId: item.latestMediaId,
            latestPhotoUrl: (item.photoId || item.posterVideoId)
              ? `https://api.bilimbebrandactivations.com/api/upload/file/${item.photoId || item.posterVideoId}`
              : null
          };
        });

        mappedData.sort((a, b) => b.timestamp - a.timestamp);

        console.log('Mapped customers data:', mappedData.length, 'customers');
        setCustomers(mappedData);
      } catch (error) {
        console.error("Error fetching customers:", error);
        // Set empty array on error so UI shows "no customers" message
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // Handle highlighting from search
  useEffect(() => {
    const { highlightedUserId, highlightedUserEmail, highlightedUserPhone, query } = location.state || {};

    if ((highlightedUserId || highlightedUserEmail || highlightedUserPhone) && customers.length > 0) {
      // Find the customer by ID, Email, or Phone
      const customerIndex = customers.findIndex(c =>
        (highlightedUserId && c.id === highlightedUserId) ||
        (highlightedUserEmail && c.email !== 'N/A' && c.email === highlightedUserEmail) ||
        (highlightedUserPhone && c.phone !== 'N/A' && c.phone === highlightedUserPhone)
      );

      if (customerIndex !== -1) {
        const foundCust = customers[customerIndex];
        setHighlightedId(foundCust.id);

        if (query) setSearchQuery(query);
        // We explicitly DON'T clear searchQuery if no query is passed to keep existing context

        const pageNum = Math.floor(customerIndex / itemsPerPage) + 1;
        setCurrentPage(pageNum);

        setTimeout(() => {
          if (rowRefs.current[foundCust.id]) {
            rowRefs.current[foundCust.id].scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 500);

        // Clear state so it doesn't re-highlight on refresh/back
        // IMPORTANT: We do this asynchronously to avoid disrupting this effect's cleanup
        setTimeout(() => {
          navigate(location.pathname, { replace: true, state: {} });
        }, 100);

        const timer = setTimeout(() => {
          setHighlightedId(null);
        }, 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [location.state, location.key, customers, itemsPerPage, navigate, location.pathname]);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (branchRef.current && !branchRef.current.contains(event.target)) setShowBranchDropdown(false);
      if (templateRef.current && !templateRef.current.contains(event.target)) setShowTemplateDropdown(false);
      if (dateRef.current && !dateRef.current.contains(event.target)) setShowDateDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const templates = ['All Templates', ...new Set(customers.map(c => c.template_name))];
  const branches = ['All Branches', ...new Set(customers.map(c => c.branchName).filter(b => b !== 'N/A'))];
  const dateFilters = [
    'All Time', 'Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'This Month', 'Last Month'
  ];

  const filteredCustomers = customers.filter(cust => {
    const matchesSearch = cust.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cust.phone.includes(searchQuery) ||
      cust.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cust.lastVisit.includes(searchQuery);

    const matchesBranch = selectedBranch === 'All Branches' || cust.branchName === selectedBranch;
    const matchesTemplate = selectedTemplate === 'All Templates' || cust.template_name === selectedTemplate;

    let matchesDate = true;
    if (selectedDateFilter !== 'All Time') {
      const custDate = new Date(cust.lastVisit.split('.').reverse().join('-'));
      const today = new Date();

      // Normalize dates to YYYY-MM-DD local string for comparison
      const toDateString = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const custDateStr = toDateString(custDate);
      const todayDateStr = toDateString(today);

      if (selectedDateFilter === 'Today') {
        matchesDate = custDateStr === todayDateStr;
      } else if (selectedDateFilter === 'Yesterday') {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        matchesDate = custDateStr === toDateString(yesterday);
      } else if (selectedDateFilter === 'Last 7 Days') {
        const last7 = new Date(today);
        last7.setHours(0, 0, 0, 0);
        last7.setDate(last7.getDate() - 7);
        matchesDate = custDate >= last7;
      } else if (selectedDateFilter === 'Last 30 Days') {
        const last30 = new Date(today);
        last30.setHours(0, 0, 0, 0);
        last30.setDate(last30.getDate() - 30);
        matchesDate = custDate >= last30;
      } else if (selectedDateFilter === 'This Month') {
        matchesDate = custDate.getMonth() === today.getMonth() && custDate.getFullYear() === today.getFullYear();
      } else if (selectedDateFilter === 'Last Month') {
        const lastMonth = new Date(today);
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        matchesDate = custDate.getMonth() === lastMonth.getMonth() && custDate.getFullYear() === lastMonth.getFullYear();
      }
    }

    return matchesSearch && matchesBranch && matchesTemplate && matchesDate;
  });

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedBranch, selectedTemplate, selectedDateFilter]);

  // State to store API metrics
  const [apiMetrics, setApiMetrics] = useState({
    totalCustomers: { value: 0, growth: 0 },
    activeToday: { value: 0, growth: 0 },
    totalVisits: { value: 0, growth: 0 },
    avgVisits: { value: 0, growth: 0 }
  });

  // Fetch metrics from API
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        console.log('Fetching metrics for customers page');
        const metricsResponse = await axiosData.get(`upload/dashboard-metrics?adminid=${user._id || user.id}`);
        console.log('Metrics response:', metricsResponse.data);
        if (metricsResponse.data?.metrics?.customers) {
          setApiMetrics(metricsResponse.data.metrics.customers);
          console.log('Set API metrics:', metricsResponse.data.metrics.customers);
        } else {
          console.warn('No customer metrics found in response');
        }
      } catch (error) {
        console.error("Error fetching metrics (using defaults):", error);
        // Keep default values (0 growth) if API fails
      }
    };
    fetchMetrics();
  }, [user._id, user.id]);

  // Calculate metrics using local data for values and API for growth
  const calculateMetrics = () => {
    console.log('Calculating metrics - customers:', customers?.length, 'apiMetrics:', apiMetrics);

    // Return default values if customers data is not loaded yet
    if (!customers || customers.length === 0) {
      console.log('No customers yet, using API metrics or defaults');
      return {
        totalCustomers: apiMetrics.totalCustomers?.value || 0,
        activeToday: apiMetrics.activeToday?.value || 0,
        totalVisits: apiMetrics.totalVisits?.value || 0,
        avgVisits: apiMetrics.avgVisits?.value?.toFixed(1) || '0',
        customerGrowth: apiMetrics.totalCustomers?.growth || 0,
        activeTodayGrowth: apiMetrics.activeToday?.growth || 0,
        avgVisitsGrowth: apiMetrics.avgVisits?.growth || 0,
        totalVisitsGrowth: apiMetrics.totalVisits?.growth || 0
      };
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    today.setHours(0, 0, 0, 0);

    const parseDate = (dateStr) => {
      if (!dateStr || dateStr === 'N/A') return null;
      try {
        const parts = dateStr.split('.');
        if (parts.length === 3) {
          const date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
          if (isNaN(date.getTime())) return null;
          return date;
        }
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return null;
        return date;
      } catch (e) {
        return null;
      }
    };

    // Current period metrics
    const totalCustomers = customers.length;
    const activeToday = customers.filter(c => {
      const visitDate = parseDate(c.lastVisit);
      return visitDate && visitDate >= today;
    }).length;
    const totalVisits = customers.reduce((acc, curr) => acc + (curr.visits || 0), 0);
    const totalPhotos = customers.reduce((acc, curr) => acc + (curr.photos || 0), 0);
    const totalVideos = customers.reduce((acc, curr) => acc + (curr.videos || 0), 0);
    const totalShares = customers.reduce((acc, curr) => acc + (curr.shares || 0), 0);
    const avgVisits = totalCustomers > 0 ? (totalVisits / totalCustomers) : 0;

    return {
      totalCustomers,
      activeToday,
      totalVisits,
      totalPhotos,
      totalVideos,
      totalShares,
      avgVisits: avgVisits.toFixed(1),
      customerGrowth: apiMetrics.totalCustomers?.growth || 0,
      activeTodayGrowth: apiMetrics.activeToday?.growth || 0,
      avgVisitsGrowth: apiMetrics.avgVisits?.growth || 0,
      totalVisitsGrowth: apiMetrics.totalVisits?.growth || 0,
      // Mock growth for new metrics if not in API
      totalPhotosGrowth: 38,
      totalVideosGrowth: 15,
      totalSharesGrowth: 19
    };
  };

  const metrics = calculateMetrics();

  const toggleSelect = (id) => {
    setSelectedCustomers(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const selectAll = () => {
    setSelectedCustomers(selectedCustomers.length === filteredCustomers.length ? [] : filteredCustomers.map(c => c.id));
  };

  const exportToExcel = (dataToExport = null) => {
    // Check Export Settings
    const settings = JSON.parse(localStorage.getItem('admin_settings') || '{}');
    const format = settings.general?.exportFormat || 'Excel';

    // Export either selected items (if any) or all filtered items
    const data = dataToExport || (selectedCustomers.length > 0
      ? filteredCustomers.filter(c => selectedCustomers.includes(c.id))
      : filteredCustomers);

    if (data.length === 0) {
      showAlert('No customers to export.', 'error');
      return;
    }

    const headers = ['Name', 'Phone', 'Visited', 'Photos', 'Shares', 'Email', 'Branch', 'Last Visit'];
    const csvContent = [
      headers.join(','),
      ...data.map(customer => [
        customer.name,
        customer.mobile || customer.whatsapp || 'N/A',
        customer.visits || 0,
        customer.photosCount || 0,
        customer.sharesCount || 0,
        customer.email || 'N/A',
        customer.branchName || 'Main Branch',
        customer.lastVisit ? formatDate(customer.lastVisit) : 'Never'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: format === 'Excel' ? 'application/vnd.ms-excel;charset=utf-8;' : 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `customers_export_${formatDate(new Date(), 'YYYY-MM-DD')}.${format === 'Excel' ? 'xls' : 'csv'}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleWhatsApp = (cust) => {
    setActiveCustomer(cust);
    const defaultMsg = cust.latestPhotoUrl
      ? `Hello ${cust.name}, check out your photo from ${cust.template_name}: ${cust.latestPhotoUrl}`
      : `Hello ${cust.name}, thank you for choosing us! Hope you enjoyed your experience.`;
    setCustomMsg(defaultMsg);
    setShowMsgModal(true);
  };

  const confirmSendMessage = async () => {
    if (!activeCustomer) return;
    if (!activeCustomer.phone || activeCustomer.phone === 'N/A') {
      showAlert("Phone number not available for this customer.", 'error');
      return;
    }

    setIsSendingMsg(true);
    try {
      const response = await axiosData.post('/upload/custom-share', {
        mobile: activeCustomer.phone,
        _id: activeCustomer.latestMediaId || activeCustomer.id,
        message: customMsg
      });

      if (response.data.success) {
        showAlert(`Message sent to ${activeCustomer.name} successfully!`, 'success');
        setShowMsgModal(false);
      } else {
        throw new Error("Failed to send message via API");
      }
    } catch (error) {
      console.error("WhatsApp Error:", error);
      showAlert("Failed to send message via WhatsApp API.", 'error');
      setShowMsgModal(false);
    } finally {
      setIsSendingMsg(false);
    }
  };

  const handleBulkWhatsApp = async () => {
    const targets = selectedCustomers.length > 0
      ? customers.filter(c => selectedCustomers.includes(c.id))
      : [];

    if (targets.length === 0) {
      showAlert("Please select customers to send bulk messages.", 'error');
      return;
    }

    const bulkMsg = prompt("Enter bulk message (links will be appended if available):", "Thank you for choosing us! ");
    if (!bulkMsg) return;

    showConfirm(`Send individual messages to ${targets.length} customers?`, async () => {
      for (const cust of targets) {
        try {
          await axiosData.post('/upload/custom-share', {
            mobile: cust.phone,
            _id: cust.latestMediaId || cust.id,
            message: cust.latestPhotoUrl ? `${bulkMsg}\n\nPhoto: ${cust.latestPhotoUrl}` : bulkMsg
          });
        } catch (err) {
          console.error("Bulk Send Error for", cust.name, err);
        }
        await new Promise(r => setTimeout(r, 500));
      }
      showAlert("Bulk messaging process finished.", 'success');
    });
  };

  const handleViewActivityHistory = async (customer) => {
    setActiveCustomer(customer);
    setShowActivityHistory(true);
    setLoadingActivity(true);
    setActivityHistory([]);

    try {
      const phone = customer.phone && customer.phone !== 'N/A' ? customer.phone : null;
      const name = customer.name || 'Unknown';

      let response;
      if (phone) {
        response = await axiosData.get(`/activity-history/customer/${encodeURIComponent(phone)}?adminid=${user._id || user.id}&limit=100`);
      } else {
        response = await axiosData.get(`/activity-history/customer-by-name/${encodeURIComponent(name)}?adminid=${user._id || user.id}&limit=100`);
      }

      if (response.data.success) {
        setActivityHistory(response.data.data || []);
      } else {
        setActivityHistory([]);
      }
    } catch (error) {
      console.error("Error fetching activity history:", error);
      setActivityHistory([]);
    } finally {
      setLoadingActivity(false);
    }
  };

  const formatActivityType = (type) => {
    const typeMap = {
      'photo_created': 'Photo Created',
      'photo_shared_whatsapp': 'Shared on WhatsApp',
      'photo_shared_facebook': 'Shared on Facebook',
      'photo_shared_twitter': 'Shared on Twitter',
      'photo_shared_instagram': 'Shared on Instagram',
      'photo_downloaded': 'Downloaded',
      'message_sent': 'Message Sent',
      'video_created': 'Video Created',
      'poster_created': 'Poster Created'
    };
    return typeMap[type] || type;
  };

  const getActivityIcon = (type) => {
    if (type.includes('whatsapp') || type === 'message_sent') return <Send size={16} />;
    if (type.includes('shared')) return <MessageCircle size={16} />;
    if (type.includes('download')) return <Download size={16} />;
    if (type.includes('created')) return <ImageIcon size={16} />;
    return <Activity size={16} />;
  };

  const formatRelativeDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return formatDate(date, getStoredDateFormat());
  };

  return (
    <CustomersContainer>
      <HeaderSection>
        <PageInfo>
          <h1>Customer Management</h1>
          <p>Manage customer data, interactions, and engagement</p>
        </PageInfo>
        <ActionButtons>
          <PrimaryButton $variant="outline" onClick={() => exportToExcel()}>
            <Download size={16} /> Export as Excel
          </PrimaryButton>
          {/* <PrimaryButton $variant="success" onClick={handleBulkWhatsApp}>
            <MessageCircle size={16} /> Bulk WhatsApp
          </PrimaryButton> */}
          {/* <PrimaryButton $variant="primary" onClick={() => showAlert('Opening Add Customer form...', 'info')}>
            <Plus size={16} /> Add Customer
          </PrimaryButton> */}
        </ActionButtons>
      </HeaderSection>

      <KPIBox>
        {/* Card 1: Total Customers */}
        <KPICard $bgColor="#FFFBEB">
          <KPITop>
            <KPIIconWrapper><Users size={20} /></KPIIconWrapper>
            <CardLabel>Total Customers</CardLabel>
          </KPITop>
          <KPIContent>
            <KPIMain>
              <KPIValue>{metrics.totalCustomers.toLocaleString()}</KPIValue>
              <TrendIndicator $color={metrics.customerGrowth >= 0 ? "#F59E0B" : "#EF4444"}>
                {metrics.customerGrowth >= 0 ? '▲' : '▼'} {metrics.customerGrowth >= 0 ? '+' : ''}{metrics.customerGrowth}%
              </TrendIndicator>
            </KPIMain>
            <SparklineWrapper>
              <MiniTrendSVG
                color={metrics.customerGrowth >= 0 ? "#F59E0B" : "#EF4444"}
                points="M10,40 C30,35 40,20 60,30 S80,10 90,15"
                endX={90}
                endY={15}
              />
            </SparklineWrapper>
          </KPIContent>
        </KPICard>

        {/* Card 2: Total Photos */}
        <KPICard $bgColor="#F3E8FF">
          <KPITop>
            <KPIIconWrapper><ImageIcon size={20} /></KPIIconWrapper>
            <CardLabel>Total Photos</CardLabel>
          </KPITop>
          <KPIContent>
            <KPIMain>
              <KPIValue>{metrics.totalPhotos}</KPIValue>
              <TrendIndicator $color="#8B5CF6">
                ▲ +{metrics.totalPhotosGrowth}%
              </TrendIndicator>
            </KPIMain>
            <SparklineWrapper>
              <MiniTrendSVG
                color="#8B5CF6"
                points="M10,40 C30,38 50,30 70,35 S90,20 95,15"
                endX={95}
                endY={15}
              />
            </SparklineWrapper>
          </KPIContent>
        </KPICard>

        {/* Card 3: Total Videos */}
        <KPICard $bgColor="#ECFDF5">
          <KPITop>
            <KPIIconWrapper><Video size={20} /></KPIIconWrapper>
            <CardLabel>Total Videos</CardLabel>
          </KPITop>
          <KPIContent>
            <KPIMain>
              <KPIValue>{metrics.totalVideos}</KPIValue>
              <TrendIndicator $color="#10B981">
                ▲ +{metrics.totalVideosGrowth}%
              </TrendIndicator>
            </KPIMain>
            <SparklineWrapper>
              <MiniTrendSVG
                color="#10B981"
                points="M10,25 L90,25"
                endX={90}
                endY={25}
              />
            </SparklineWrapper>
          </KPIContent>
        </KPICard>

        {/* Card 4: Total Shares */}
        <KPICard $bgColor="#FFEDD5">
          <KPITop>
            <KPIIconWrapper><Share2 size={20} /></KPIIconWrapper>
            <CardLabel>Total Shares</CardLabel>
          </KPITop>
          <KPIContent>
            <KPIMain>
              <KPIValue>{metrics.totalShares}</KPIValue>
              <TrendIndicator $color="#F97316">
                ▲ +{metrics.totalSharesGrowth}%
              </TrendIndicator>
            </KPIMain>
            <SparklineWrapper>
              <MiniTrendSVG
                color="#F97316"
                points="M10,40 Q40,40 50,30 T90,20"
                endX={90}
                endY={20}
              />
            </SparklineWrapper>
          </KPIContent>
        </KPICard>
      </KPIBox>

      <ControlBar>
        <SearchBox>
          <Search size={16} />
          <input
            type="text"
            placeholder="Search name, phone, date..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          />
        </SearchBox>

        <DropdownContainer ref={dateRef}>
          <DropdownButton
            $isOpen={showDateDropdown}
            onClick={() => setShowDateDropdown(!showDateDropdown)}
          >
            {selectedDateFilter}
            <ChevronDown size={18} />
          </DropdownButton>
          <DropdownMenu $isOpen={showDateDropdown}>
            {dateFilters.map(filter => (
              <DropdownItem
                key={filter}
                $active={selectedDateFilter === filter}
                onClick={() => {
                  setSelectedDateFilter(filter);
                  setShowDateDropdown(false);
                  setCurrentPage(1);
                }}
              >
                {filter}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </DropdownContainer>

        <DropdownContainer ref={templateRef}>
          <DropdownButton
            $isOpen={showTemplateDropdown}
            onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
          >
            {selectedTemplate}
            <ChevronDown size={18} />
          </DropdownButton>
          <DropdownMenu $isOpen={showTemplateDropdown}>
            {templates.map(t => (
              <DropdownItem
                key={t}
                $active={selectedTemplate === t}
                onClick={() => {
                  setSelectedTemplate(t);
                  setShowTemplateDropdown(false);
                  setCurrentPage(1);
                }}
              >
                {t}
              </DropdownItem>
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
                  checked={selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0}
                  onChange={selectAll}
                />
              </th>
              <th>Customer Identity</th>
              <th>Contact Info</th>
              <th>Engagement</th>
              <th>Activity</th>
              <th>Used Template</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7">
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '100px', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <Loader className="rotate" size={40} color="#1A1A1A" />
                    <div style={{ fontWeight: 600, color: '#666' }}>Fetching live customer data...</div>
                  </div>
                </td>
              </tr>
            ) : filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan="7">
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '80px 20px',
                    flexDirection: 'column',
                    alignItems: 'center',
                    background: '#FAFAFA'
                  }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      background: '#EEE',
                      borderRadius: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '16px',
                      color: '#999'
                    }}>
                      <Users size={32} />
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#1A1A1A', marginBottom: '8px' }}>
                      No customers found
                    </div>
                    <div style={{ color: '#666', textAlign: 'center', maxWidth: '300px', fontSize: '14px', lineHeight: '1.5' }}>
                      {selectedDateFilter !== 'All Time'
                        ? `We couldn't find any customers recorded for ${selectedDateFilter.toLowerCase()}.`
                        : "No data matches your current search or filter criteria."}
                    </div>
                    {(searchQuery || selectedBranch !== 'All Branches' || selectedTemplate !== 'All Templates' || selectedDateFilter !== 'All Time') && (
                      <PrimaryButton
                        style={{ marginTop: '20px', background: '#EEE', color: '#1A1A1A', fontSize: '13px' }}
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedBranch('All Branches');
                          setSelectedTemplate('All Templates');
                          setSelectedDateFilter('All Time');
                        }}
                      >
                        Reset All Filters
                      </PrimaryButton>
                    )}
                  </div>
                </td>
              </tr>
            ) : filteredCustomers
              .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
              .map((cust) => (
                <TableRow
                  key={cust.id}
                  ref={el => rowRefs.current[cust.id] = el}
                  $highlighted={cust.id === highlightedId}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedCustomers.includes(cust.id)}
                      onChange={() => toggleSelect(cust.id)}
                    />
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Avatar>{cust.initial}</Avatar>
                      <div style={{ fontWeight: 700 }}>{highlightText(cust.name, searchQuery)}</div>
                    </div>
                  </td>
                  <td>
                    <div>{highlightText(cust.phone, searchQuery)}</div>
                    <div style={{ fontSize: '12px', color: '#999' }}>{highlightText(cust.email, searchQuery)}</div>
                  </td>
                  <td>
                    <div>{cust.visits} Visits</div>
                    <div style={{ fontSize: '12px', color: '#999' }}>{cust.photos} Photos</div>
                  </td>
                  <td>
                    <div>{highlightText(cust.lastVisit, searchQuery)}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{highlightText(cust.template_name, searchQuery)}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <IconButton title="View Profile" onClick={() => setViewingCustomer(cust)}><Eye size={16} /></IconButton>
                      <IconButton title="Activity History" onClick={() => handleViewActivityHistory(cust)}><RotateCcw size={16} /></IconButton>
                      <IconButton title="WhatsApp Message" style={{ color: '#25D366' }} onClick={() => handleWhatsApp(cust)}><Send size={16} /></IconButton>
                      {/* <IconButton title="More"><MoreHorizontal size={16} /></IconButton> */}
                    </div>
                  </td>
                </TableRow>
              ))}
          </tbody>
        </Table>
        <Pagination
          totalItems={filteredCustomers.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(size) => {
            setItemsPerPage(size);
            setCurrentPage(1);
          }}
        />
      </TableCard>

      {selectedCustomers.length > 0 && (
        <BulkActionBar>
          <div className="count">{selectedCustomers.length} customers selected</div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <PrimaryButton onClick={() => exportToExcel(customers.filter(c => selectedCustomers.includes(c.id)))} style={{ padding: '8px 16px', fontSize: '12px', background: '#333' }}>
              <Download size={14} /> Export
            </PrimaryButton>
            <PrimaryButton style={{ padding: '8px 16px', fontSize: '12px', background: '#E53935' }} onClick={() => showAlert('Delete feature coming soon', 'info')}>
              Delete
            </PrimaryButton>
            <IconButton style={{ color: 'white' }} onClick={() => setSelectedCustomers([])}>✕</IconButton>
          </div>
          {/* <PrimaryButton $variant="success" style={{ padding: '8px 16px', fontSize: '12px' }} onClick={handleBulkWhatsApp}>
            <MessageCircle size={14} /> Bulk WhatsApp
          </PrimaryButton> */}
        </BulkActionBar>
      )}

      {viewingCustomer && (
        <ModalOverlay onClick={() => setViewingCustomer(null)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ProfileHeader>
              <div className="avatar">{viewingCustomer.initial}</div>
              <div className="info">
                <h2>{viewingCustomer.name}</h2>
                <p>Customer ID: {viewingCustomer.id}</p>
              </div>
              <IconButton
                style={{ position: 'absolute', top: '24px', right: '24px' }}
                onClick={() => setViewingCustomer(null)}
              >✕</IconButton>
            </ProfileHeader>

            <ProfileSection>
              <h4>Basic Details</h4>
              <div className="grid">
                <InfoBox><div className="label">Phone</div><div className="value">{viewingCustomer.phone}</div></InfoBox>
                <InfoBox><div className="label">Email</div><div className="value">{viewingCustomer.email}</div></InfoBox>
                <InfoBox><div className="label">Branch</div><div className="value">{viewingCustomer.branchName}</div></InfoBox>
                <InfoBox><div className="label">Last Visit</div><div className="value">{viewingCustomer.lastVisit}</div></InfoBox>
              </div>
            </ProfileSection>

            <ProfileSection>
              <h4>Engagement</h4>
              <div className="grid">
                <InfoBox><div className="label">Total Visits</div><div className="value">{viewingCustomer.visits}</div></InfoBox>
                <InfoBox><div className="label">Total Photos</div><div className="value">{viewingCustomer.photos}</div></InfoBox>
              </div>
            </ProfileSection>

            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <PrimaryButton $variant="success" style={{ flex: 1 }} onClick={() => { setViewingCustomer(null); handleWhatsApp(viewingCustomer); }}>
                <MessageCircle size={16} /> WhatsApp
              </PrimaryButton>
              <PrimaryButton $variant="outline" style={{ flex: 1 }} onClick={() => setViewingCustomer(null)}>
                Close
              </PrimaryButton>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}

      {showMsgModal && (
        <ModalOverlay onClick={() => setShowMsgModal(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <ModalTitle style={{ margin: 0 }}>Compose Message</ModalTitle>
              <IconButton onClick={() => setShowMsgModal(false)}><X size={20} /></IconButton>
            </ModalHeader>
            <MessageTextArea
              value={customMsg}
              onChange={e => setCustomMsg(e.target.value)}
              placeholder="Type your message here..."
            />
            <ModalActionFooter>
              <PrimaryButton $variant="outline" onClick={() => setShowMsgModal(false)}>Cancel</PrimaryButton>
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

      {showActivityHistory && activeCustomer && (
        <ModalOverlay onClick={() => { setShowActivityHistory(false); setActiveCustomer(null); }}>
          <ModalContent onClick={e => e.stopPropagation()} style={{ maxWidth: '800px' }}>
            <ModalHeader>
              <ModalTitle>Activity History - {activeCustomer.name}</ModalTitle>
              <IconButton onClick={() => { setShowActivityHistory(false); setActiveCustomer(null); }}><X size={20} /></IconButton>
            </ModalHeader>

            {loadingActivity ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '60px', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <Loader className="rotate" size={40} color="#1A1A1A" />
                <div style={{ fontWeight: 600, color: '#666' }}>Loading activity history...</div>
              </div>
            ) : activityHistory.length === 0 ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '60px', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: '#EEE',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#999'
                }}>
                  <Activity size={32} />
                </div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#1A1A1A' }}>No activity found</div>
                <div style={{ color: '#666', textAlign: 'center', maxWidth: '300px', fontSize: '14px' }}>
                  This customer hasn't performed any activities yet.
                </div>
              </div>
            ) : (
              <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                {activityHistory.map((activity, index) => (
                  <div
                    key={activity._id || index}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '16px',
                      padding: '16px',
                      borderBottom: index === activityHistory.length - 1 ? 'none' : '1px solid #F0F0F0',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#FAFAFA'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      background: '#F5F5F5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#667eea',
                      flexShrink: 0
                    }}>
                      {getActivityIcon(activity.activityType)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <div style={{ fontWeight: 700, fontSize: '15px', color: '#1A1A1A' }}>
                          {formatActivityType(activity.activityType)}
                        </div>
                        {activity.templateName && (
                          <StatusBadge $status="active" style={{ fontSize: '10px', padding: '2px 8px' }}>
                            {activity.templateName}
                          </StatusBadge>
                        )}
                      </div>
                      <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                        {activity.activityDescription}
                      </div>
                      <div style={{ fontSize: '12px', color: '#999' }}>
                        {formatRelativeDate(activity.createdAt)}
                        {activity.branchName && ` • ${activity.branchName}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
    </CustomersContainer>
  );
};

export default Customers;
