import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import {
  Share2, Users, MousePointer, Image as ImageIcon,
  Download, MessageCircle, Search, ChevronDown,
  Filter, Calendar, TrendingUp, TrendingDown,
  ArrowRight, MoreVertical, Eye, RotateCcw, Send, Loader,
  Instagram, Facebook
} from 'react-feather';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Legend,
  Cell
} from 'recharts';
import Card from '../Components/Card';
import useAxios from '../../useAxios';
import Pagination from '../Components/Pagination';

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
    if (props.$variant === 'outline') return '#F2F2F2';
    if (props.$variant === 'success') return 'linear-gradient(90deg, #22C55E 0%, #10B981 100%)';
    return '#1A1A1A';
  }};

  color: ${props => {
    if (props.$variant === 'outline') return '#1A1A1A';
    return '#FFF';
  }};

  border: ${props => props.$variant === 'outline' ? '1px solid #E5E5E5' : 'none'};

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
  color: #1A1A1A;
`;

const CardLabel = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #666;
`;

const MetricValue = styled.div`
  font-size: 34px;
  font-weight: 800;
  color: #1A1A1A;
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
    background: #F9F9F9;
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
    background: ${props => props.$active ? '#1A1A1A' : '#F5F5F5'};
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
    color: #1A1A1A;
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
    color: #1A1A1A;
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
    photosShared: 0
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('All Platforms');
  const [selectedDateRange, setSelectedDateRange] = useState('Last 30 Days');
  const [showPlatformDropdown, setShowPlatformDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Refs for dropdowns
  const platformRef = useRef(null);
  const dateRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axiosData.get(`upload/all?source=Photo Merge App&adminid=${user._id || user.id}`);
      const data = res.data.filter(item =>
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

  const processData = (data) => {
    let totalShares = 0;
    let totalClicks = 0; // Mocked for now
    const uniqueUsersSet = new Set();
    const photosSharedSet = new Set();
    const platformStats = { WhatsApp: 0, Instagram: 0, Facebook: 0, Download: 0 };

    const sharesByDay = {};

    const processed = data.map(item => {
      const w = item.whatsappsharecount || 0;
      const f = item.facebooksharecount || 0;
      const i = item.instagramsharecount || 0;
      const d = item.downloadcount || 0;
      const t = w + f + i + d;

      totalShares += t;
      totalClicks += Math.floor(t * 1.5); // Simulation

      if (t > 0) {
        uniqueUsersSet.add(item.whatsapp || item.mobile || item.name);
        photosSharedSet.add(item.photoId || item._id);
      }

      const dateStr = new Date(item.date || item.createdAt).toLocaleDateString('en-GB');
      if (!sharesByDay[dateStr]) sharesByDay[dateStr] = { date: dateStr, WhatsApp: 0, Instagram: 0, Facebook: 0, Download: 0 };
      sharesByDay[dateStr].WhatsApp += w;
      sharesByDay[dateStr].Instagram += i;
      sharesByDay[dateStr].Facebook += f;
      sharesByDay[dateStr].Download += d;

      platformStats.WhatsApp += w;
      platformStats.Instagram += i;
      platformStats.Facebook += f;
      platformStats.Download += d;

      return {
        id: item._id,
        customer: item.name || 'Anonymous',
        email: item.email || item.mail || 'N/A',
        customerId: item.whatsapp || 'N/A',
        photo: item.template_name || item.templatename || 'Custom Poster',
        platform: w > 0 ? 'WhatsApp' : (i > 0 ? 'Instagram' : (f > 0 ? 'Facebook' : (d > 0 ? 'Download' : 'None'))),
        shares: t,
        clicks: Math.floor(t * 1.5),
        status: t > 0 ? 'Success' : 'Pending',
        timestamp: new Date(item.date || item.createdAt),
        formattedDate: new Date(item.date || item.createdAt).toLocaleString('en-GB', {
          day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        })
      };
    });

    setProcessedData(processed.sort((a, b) => b.timestamp - a.timestamp));
    setMetrics({
      totalShares,
      uniqueUsers: uniqueUsersSet.size,
      totalClicks,
      photosShared: photosSharedSet.size
    });
  };

  const filteredData = processedData.filter(item => {
    const matchesSearch = item.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.photo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.platform.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPlatform = selectedPlatform === 'All Platforms' || item.platform === selectedPlatform;

    // Simple date filter logic
    let matchesDate = true;
    const now = new Date();
    const todayStr = now.toLocaleDateString('en-CA');
    const itemDateStr = new Date(item.timestamp).toLocaleDateString('en-CA');
    const diff = (now - item.timestamp) / (1000 * 60 * 60 * 24);

    if (selectedDateRange === 'Today') matchesDate = itemDateStr === todayStr;
    else if (selectedDateRange === 'Last 7 Days') matchesDate = diff < 7;
    else if (selectedDateRange === 'Last 30 Days') matchesDate = diff < 30;
    else if (selectedDateRange === 'Last 90 Days') matchesDate = diff < 90;

    return matchesSearch && matchesPlatform && matchesDate;
  });

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

  const exportToExcel = () => {
    const csvRows = [
      ['Customer', 'Customer ID', 'Photo', 'Platform', 'Shares', 'Clicks', 'Date', 'Status'],
      ...filteredData.map(d => [d.customer, d.customerId, d.photo, d.platform, d.shares, d.clicks, d.formattedDate, d.status])
    ];
    const csvContent = "\uFEFF" + csvRows.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `ShareReport_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <PageContainer>
      <HeaderSection>
        <PageInfo>
          <h1>Share Tracking & Analytics</h1>
          <p>Track social media shares and engagement across platforms</p>
        </PageInfo>
        <ActionButtons>
          <PrimaryButton $variant="outline" onClick={exportToExcel}>
            <Download size={18} /> Export as Excel
          </PrimaryButton>
          {/* <PrimaryButton $variant="success">
            <MessageCircle size={18} /> Bulk Whatsapp
          </PrimaryButton> */}
        </ActionButtons>
      </HeaderSection>

      <MetricGrid>
        <MetricCard $bgColor="#FFF5EB">
          <CardHeader>
            <IconBox><Share2 size={20} /></IconBox>
            <CardLabel>Total Shares</CardLabel>
          </CardHeader>
          <MetricValue>{metrics.totalShares.toLocaleString()}</MetricValue>
          <CardFooter>
            <GrowthTag $color="#D97706">▲ +24.5%</GrowthTag>
            <svg width="60" height="30" viewBox="0 0 60 30" fill="none">
              <path d="M5 25C15 25 15 10 30 10C45 10 45 5 55 5" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="55" cy="5" r="2.5" fill="white" stroke="#D97706" strokeWidth="2" />
            </svg>
          </CardFooter>
        </MetricCard>

        <MetricCard $bgColor="#F1FBEF">
          <CardHeader>
            <IconBox><Users size={20} /></IconBox>
            <CardLabel>Unique Users</CardLabel>
          </CardHeader>
          <MetricValue>{metrics.uniqueUsers.toLocaleString()}</MetricValue>
          <CardFooter>
            <GrowthTag $color="#65A30D">▲ +12.1%</GrowthTag>
            <svg width="60" height="30" viewBox="0 0 60 30" fill="none">
              <path d="M5 25C20 25 20 20 30 18C40 16 45 12 55 10" stroke="#65A30D" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="55" cy="10" r="2.5" fill="white" stroke="#65A30D" strokeWidth="2" />
            </svg>
          </CardFooter>
        </MetricCard>

        <MetricCard $bgColor="#F6F0FF">
          <CardHeader>
            <IconBox><MousePointer size={20} /></IconBox>
            <CardLabel>Total Clicks</CardLabel>
          </CardHeader>
          <MetricValue>{metrics.totalClicks.toLocaleString()}</MetricValue>
          <CardFooter>
            <GrowthTag $color="#9333EA">▲ +38.4%</GrowthTag>
            <svg width="60" height="30" viewBox="0 0 60 30" fill="none">
              <path d="M5 25C15 25 25 25 35 15C45 5 50 10 55 5" stroke="#9333EA" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="55" cy="5" r="2.5" fill="white" stroke="#9333EA" strokeWidth="2" />
            </svg>
          </CardFooter>
        </MetricCard>

        <MetricCard $bgColor="#FFFBEB">
          <CardHeader>
            <IconBox><ImageIcon size={20} /></IconBox>
            <CardLabel>Photos Shared</CardLabel>
          </CardHeader>
          <MetricValue>{metrics.photosShared.toLocaleString()}</MetricValue>
          <CardFooter>
            <GrowthTag $color="#D97706">▼ -2.4%</GrowthTag>
            <svg width="60" height="30" viewBox="0 0 60 30" fill="none">
              <path d="M5 25C20 24 30 22 40 18C50 14 52 10 55 8" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="55" cy="8" r="2.5" fill="white" stroke="#D97706" strokeWidth="2" />
            </svg>
          </CardFooter>
        </MetricCard>
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
            {['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'Last 90 Days'].map(d => (
              <DropdownItem key={d} $active={selectedDateRange === d} onClick={() => { setSelectedDateRange(d); setShowDateDropdown(false); }}>{d}</DropdownItem>
            ))}
          </DropdownMenu>
        </DropdownContainer>

        <DropdownContainer ref={platformRef}>
          <DropdownButton onClick={() => setShowPlatformDropdown(!showPlatformDropdown)} $isOpen={showPlatformDropdown}>
            <Filter size={18} /> {selectedPlatform} <ChevronDown size={14} />
          </DropdownButton>
          <DropdownMenu $isOpen={showPlatformDropdown}>
            {['All Platforms', 'WhatsApp', 'Instagram', 'Facebook', 'Download'].map(p => (
              <DropdownItem key={p} $active={selectedPlatform === p} onClick={() => { setSelectedPlatform(p); setShowPlatformDropdown(false); }}>{p}</DropdownItem>
            ))}
          </DropdownMenu>
        </DropdownContainer>
      </ControlBar>

      <TableCard>
        <Table>
          <thead>
            <tr>
              <th style={{ width: '40px' }}><input type="checkbox" /></th>
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
                      {searchQuery || selectedPlatform !== 'All Platforms' || selectedDateRange !== 'Last 30 Days'
                        ? `We couldn't find any share records matching your current search or filter criteria.`
                        : "No shares have been tracked yet. Engagement data will appear here once customers start sharing their posters."}
                    </div>
                    {(searchQuery || selectedPlatform !== 'All Platforms' || selectedDateRange !== 'Last 30 Days') && (
                      <PrimaryButton
                        $variant="outline"
                        style={{ marginTop: '24px', borderRadius: '12px' }}
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedPlatform('All Platforms');
                          setSelectedDateRange('Last 30 Days');
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
                <td><input type="checkbox" /></td>
                <td>
                  <div style={{ fontWeight: 700 }}>{row.customer}</div>
                  <div style={{ fontSize: '12px', color: '#999' }}>{row.email}</div>
                </td>
                <td>
                  <div style={{ fontWeight: 600 }}>{row.photo}</div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {row.platform !== 'None' && (
                      <PlatformIcon $color={
                        row.platform === 'WhatsApp' ? '#25D366' :
                          (row.platform === 'Instagram' ? '#E4405F' :
                            (row.platform === 'Facebook' ? '#1877F2' : '#F59E0B'))
                      }>
                        {row.platform === 'WhatsApp' ? <MessageCircle size={16} /> :
                          (row.platform === 'Instagram' ? <Instagram size={16} /> :
                            (row.platform === 'Facebook' ? <Facebook size={16} /> : <Download size={16} />))}
                      </PlatformIcon>
                    )}
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
                    <IconButton title="View Details"><Eye size={18} /></IconButton>
                    <IconButton title="Resend Share"><RotateCcw size={18} /></IconButton>
                    <IconButton title="WhatsApp Message" style={{ color: '#25D366' }}><Send size={18} /></IconButton>
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
    </PageContainer>
  );
};

export default ShareTracking;
