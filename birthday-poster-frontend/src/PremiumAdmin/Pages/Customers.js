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
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader
} from 'react-feather';
import useAxios from '../../useAxios';

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
    $variant === 'outline' ? '#1A1A1A' : '#FFF'};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
`;

const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 32px;
`;

const MetricCard = styled.div`
  background: ${({ $bgColor }) => $bgColor || '#FFF'};
  padding: 24px;
  border-radius: 32px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 160px;
  transition: transform 0.2s;
  position: relative;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const IconBox = styled.div`
  width: 48px;
  height: 48px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
`;

const CardLabel = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: #555;
`;

const MetricValue = styled.div`
  font-size: 36px;
  font-weight: 800;
  color: #1A1A1A;
  margin-top: 20px;
  margin-bottom: 8px;
  letter-spacing: -1px;
`;

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const GrowthTag = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 700;
  color: ${({ $color }) => $color};
`;

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
  color: #1A1A1A;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 180px;
  
  &:hover {
    background: #FAFAFA;
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
  border: 1px solid #F0F0F0;
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
    color: #1A1A1A;
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
      border-color: #1A1A1A;
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
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th {
    text-align: left;
    padding: 16px 24px;
    background: #FAFAFA;
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
  color: #1A1A1A;
  font-weight: 700;
  border-radius: 2px;
  padding: 0 2px;
`;

const TableRow = styled.tr`
  td {
    padding: 16px 24px;
    border-bottom: 1px solid #F5F5F5;
    font-size: 14px;
    color: #1A1A1A;
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
    background: #FAFAFA;
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
  color: #1A1A1A;
`;

const StatusBadge = styled.span`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  background: ${({ $status }) => $status === 'active' ? '#EEF6E8' : '#F5F5F5'};
  color: ${({ $status }) => $status === 'active' ? '#4CAF50' : '#888'};
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
    color: #1A1A1A;
  }
`;

const BulkActionBar = styled.div`
  position: fixed;
  bottom: 40px;
  left: 50%;
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
  const rowRefs = useRef({});

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

  // Fetch real data from API
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axiosData.get("upload/all");
        const rawItems = response.data.filter(item => item.source === 'Photo Merge App');

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
              shareCount: 0,
              latestTimeStamp: validTime
            };
          }

          const entry = customersMap[key];
          const itemShares = (item.whatsappsharecount || 0) +
            (item.facebooksharecount || 0) +
            (item.twittersharecount || 0) +
            (item.instagramsharecount || 0) +
            (item.downloadcount || 0);

          entry.visitCount += 1;
          entry.photoCount += 1;
          entry.shareCount += itemShares;

          if (validTime > entry.latestTimeStamp) {
            entry.latestTimeStamp = validTime;
            entry.name = item.name || entry.name;
            entry.email = item.email || entry.email;
            entry.branch = item.source || entry.branch;
            entry.template_name = item.template_name || item.templatename || item.type || entry.template_name;
          }
        });

        const mappedData = Object.values(customersMap).map((item, index) => {
          const dateObj = new Date(item.latestTimeStamp);
          const formattedDate = dateObj.toLocaleDateString('en-GB').replace(/\//g, '.');

          return {
            id: item._id || `CUST-${index}`,
            name: item.name || 'Anonymous',
            email: item.email || 'N/A',
            phone: item.whatsapp || item.mobile || 'N/A',
            visits: item.visitCount,
            photos: item.photoCount,
            shareCount: item.shareCount,
            lastVisit: formattedDate,
            template_name: item.template_name || 'Custom Design',
            branch: item.branch || 'Head Office',
            initial: (item.name || 'A').charAt(0).toUpperCase()
          };
        });

        mappedData.sort((a, b) => {
          const dateA = new Date(a.lastVisit.split('.').reverse().join('-'));
          const dateB = new Date(b.lastVisit.split('.').reverse().join('-'));
          return dateB - dateA;
        });

        setCustomers(mappedData);
      } catch (error) {
        console.error("Error fetching customers:", error);
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
  const dateFilters = [
    'All Time', 'Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'This Month', 'Last Month'
  ];

  const filteredCustomers = customers.filter(cust => {
    const matchesSearch = cust.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cust.phone.includes(searchQuery) ||
      cust.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cust.lastVisit.includes(searchQuery);

    const matchesBranch = selectedBranch === 'All Branches' || cust.branch === selectedBranch;
    const matchesTemplate = selectedTemplate === 'All Templates' || cust.template_name === selectedTemplate;

    let matchesDate = true;
    if (selectedDateFilter !== 'All Time') {
      const custDate = new Date(cust.lastVisit.split('.').reverse().join('-'));
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDateFilter === 'Today') matchesDate = custDate.getTime() === today.getTime();
      else if (selectedDateFilter === 'Yesterday') {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        matchesDate = custDate.getTime() === yesterday.getTime();
      } else if (selectedDateFilter === 'Last 7 Days') {
        const last7 = new Date(today);
        last7.setDate(last7.getDate() - 7);
        matchesDate = custDate >= last7;
      } else if (selectedDateFilter === 'Last 30 Days') {
        const last30 = new Date(today);
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

  const totalCustomers = customers.length;
  const activeToday = customers.filter(c => c.lastVisit === new Date().toLocaleDateString('en-GB').replace(/\//g, '.')).length;
  const totalVisits = customers.reduce((acc, curr) => acc + curr.visits, 0);
  const avgVisits = totalCustomers > 0 ? (totalVisits / totalCustomers).toFixed(1) : 0;

  const toggleSelect = (id) => {
    setSelectedCustomers(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const selectAll = () => {
    setSelectedCustomers(selectedCustomers.length === filteredCustomers.length ? [] : filteredCustomers.map(c => c.id));
  };

  const exportToExcel = (dataToExport = filteredCustomers) => {
    const csvContent = "Name,Phone,Email,Visits,Photos,Category,Branch,Last Visit\n"
      + dataToExport.map(e => `${e.name},${e.phone},${e.email},${e.visits},${e.photos},${e.template_name},${e.branch},${e.lastVisit}`).join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Customers_Report_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <PrimaryButton $variant="success" onClick={() => alert('Opening WhatsApp bulk tool...')}>
            <MessageCircle size={16} /> Bulk WhatsApp
          </PrimaryButton>
          <PrimaryButton $variant="primary" onClick={() => alert('Opening Add Customer form...')}>
            <Plus size={16} /> Add Customer
          </PrimaryButton>
        </ActionButtons>
      </HeaderSection>

      <MetricGrid>
        <MetricCard $bgColor="#FFF5EB">
          <CardHeader>
            <IconBox><Users size={20} /></IconBox>
            <CardLabel>Total Customers</CardLabel>
          </CardHeader>
          <MetricValue>{totalCustomers.toLocaleString()}</MetricValue>
          <CardFooter>
            <GrowthTag $color="#D97706">▲ +12.5%</GrowthTag>
          </CardFooter>
        </MetricCard>

        <MetricCard $bgColor="#F1FBEF">
          <CardHeader>
            <IconBox><Activity size={20} /></IconBox>
            <CardLabel>Active Today</CardLabel>
          </CardHeader>
          <MetricValue>{activeToday}</MetricValue>
          <CardFooter>
            <GrowthTag $color="#65A30D">▲ +8.2%</GrowthTag>
          </CardFooter>
        </MetricCard>

        <MetricCard $bgColor="#F6F0FF">
          <CardHeader>
            <IconBox><ImageIcon size={20} /></IconBox>
            <CardLabel>Avg Engagement</CardLabel>
          </CardHeader>
          <MetricValue>{avgVisits}</MetricValue>
          <CardFooter>
            <GrowthTag $color="#9333EA">▲ +23.1%</GrowthTag>
          </CardFooter>
        </MetricCard>

        <MetricCard $bgColor="#FFFBEB">
          <CardHeader>
            <IconBox><ShoppingBag size={20} /></IconBox>
            <CardLabel>Total Visits</CardLabel>
          </CardHeader>
          <MetricValue>{totalVisits.toLocaleString()}</MetricValue>
          <CardFooter>
            <GrowthTag $color="#D97706">▲ +2.1%</GrowthTag>
          </CardFooter>
        </MetricCard>
      </MetricGrid>

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
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '100px', fontWeight: 600, color: '#666' }}>
                    No customers found based on current filters.
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
                      <IconButton title="Activity History"><RotateCcw size={16} /></IconButton>
                      <IconButton title="WhatsApp Message" style={{ color: '#25D366' }}><Send size={16} /></IconButton>
                      <IconButton title="More"><MoreHorizontal size={16} /></IconButton>
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
            <PrimaryButton style={{ padding: '8px 16px', fontSize: '12px', background: '#E53935' }}>
              Delete
            </PrimaryButton>
            <IconButton style={{ color: 'white' }} onClick={() => setSelectedCustomers([])}>✕</IconButton>
          </div>
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
                <InfoBox><div className="label">Branch</div><div className="value">{viewingCustomer.branch}</div></InfoBox>
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
              <PrimaryButton $variant="success" style={{ flex: 1 }}>
                <MessageCircle size={16} /> WhatsApp
              </PrimaryButton>
              <PrimaryButton $variant="outline" style={{ flex: 1 }} onClick={() => setViewingCustomer(null)}>
                Close
              </PrimaryButton>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}
    </CustomersContainer>
  );
};

export default Customers;
