import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  X
} from 'react-feather';
import Card from '../Components/Card';
import KPIMetricCard from '../Components/charts/KPIMetricCard';
import useAxios from '../../useAxios';

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
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #F0F0F0;
  
  h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
  }
`;

const ModalBody = styled.div`
  padding: 24px;
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
  padding: 24px;
  border-top: 1px solid #F0F0F0;
`;

const Campaigns = () => {
  const axiosData = useAxios();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All Channels');
  const [filterStatus, setFilterStatus] = useState('All Status');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'WhatsApp',
    status: 'Draft',
    startDate: '',
    endDate: '',
    message: ''
  });
  const [photoMergeCustomers, setPhotoMergeCustomers] = useState([]);

  const typeDropdownRef = useRef(null);
  const statusDropdownRef = useRef(null);

  // Fetch campaigns from API
  useEffect(() => {
    fetchCampaigns();
    fetchCustomers();
  }, []);

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

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await axiosData.get(`campaigns?adminid=${user._id || user.id}`);
      setCampaigns(response.data || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await axiosData.get(`campaigns/target/customers?adminid=${user._id || user.id}`);
      setPhotoMergeCustomers(response.data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleCreateCampaign = async () => {
    try {
      const campaignData = {
        ...formData,
        adminid: user._id || user.id,
        startDate: formData.startDate || new Date().toISOString(),
        endDate: formData.endDate || new Date().toISOString(),
        targetAudience: {
          source: 'Photo Merge App'
        }
      };

      await axiosData.post('campaigns', campaignData);
      setShowCreateModal(false);
      resetForm();
      fetchCampaigns();
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Failed to create campaign. Please try again.');
    }
  };

  const handleEditCampaign = async () => {
    try {
      await axiosData.put(`campaigns/${editingCampaign._id}`, formData);
      setShowEditModal(false);
      setEditingCampaign(null);
      resetForm();
      fetchCampaigns();
    } catch (error) {
      console.error('Error updating campaign:', error);
      alert('Failed to update campaign. Please try again.');
    }
  };

  const handleDeleteCampaign = async (campaignId) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) {
      return;
    }

    try {
      await axiosData.delete(`campaigns/${campaignId}`);
      fetchCampaigns();
    } catch (error) {
      console.error('Error deleting campaign:', error);
      alert('Failed to delete campaign. Please try again.');
    }
  };

  const handleSendCampaign = async (campaignId) => {
    if (!window.confirm('Are you sure you want to send this campaign?')) {
      return;
    }

    try {
      await axiosData.post(`campaigns/${campaignId}/send`);
      fetchCampaigns();
      alert('Campaign sent successfully!');
    } catch (error) {
      console.error('Error sending campaign:', error);
      alert('Failed to send campaign. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'WhatsApp',
      status: 'Draft',
      startDate: '',
      endDate: '',
      message: ''
    });
  };

  const openEditModal = (campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      name: campaign.name || '',
      description: campaign.description || '',
      type: campaign.type || 'WhatsApp',
      status: campaign.status || 'Draft',
      startDate: campaign.startDate ? new Date(campaign.startDate).toISOString().split('T')[0] : '',
      endDate: campaign.endDate ? new Date(campaign.endDate).toISOString().split('T')[0] : '',
      message: campaign.message || ''
    });
    setShowEditModal(true);
  };

  const stats = useMemo(() => {
    const active = campaigns.filter(c => c.status === 'Active' || c.status === 'Scheduled').length;
    const completed = campaigns.filter(c => c.status === 'Completed').length;
    const totalSent = campaigns.reduce((acc, curr) => acc + (curr.sent || 0), 0);
    const totalDelivered = campaigns.reduce((acc, curr) => acc + (curr.delivered || 0), 0);
    const avgDelivery = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;

    return { active, completed, totalSent, avgDelivery };
  }, [campaigns]);

  const filteredCampaigns = campaigns.filter(c => {
    const matchesSearch = (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c._id || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'All Channels' || c.type === filterType;
    const matchesStatus = filterStatus === 'All Status' || c.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getChannelConfig = (type) => {
    switch (type) {
      case 'WhatsApp': return { icon: <MessageSquare size={16} />, color: '#25D366' };
      case 'Email': return { icon: <Mail size={16} />, color: '#EA4335' };
      case 'SMS': return { icon: <Smartphone size={16} />, color: '#1A1A1A' };
      case 'Push Notification': return { icon: <Bell size={16} />, color: '#F59E0B' };
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
    const csvContent = "data:text/csv;charset=utf-8,"
      + ["ID,Name,Type,Status,Sent,Delivered,CTR"].join(",") + "\n"
      + filteredCampaigns.map(c => [
        c._id || c.id, c.name, c.type, c.status, c.sent || 0, c.delivered || 0,
        (c.delivered || 0) > 0 ? (((c.clicks || 0) / c.delivered) * 100).toFixed(1) + '%' : '0%'
      ].join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "campaign_report.csv");
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
              {photoMergeCustomers.length} Photo Merge App customers available for targeting
            </p>
          )}
        </HeaderInfo>
        <ActionGroup>
          <SecondaryButton onClick={exportData}>
            <Download size={18} /> Export Results
          </SecondaryButton>
          <PrimaryButton onClick={() => setShowCreateModal(true)}>
            <Plus size={18} /> Create New Campaign
          </PrimaryButton>
        </ActionGroup>
      </PageHeader>

      <MetricGrid>
        <KPIMetricCard
          label="Active Campaigns"
          value={stats.active}
          trend={0}
          trendColor="#6B8E23"
          bgColor="#F4F9E9"
          icon={<Play size={20} />}
          points="M10,40 C25,38 35,45 50,35 S80,10 90,15"
          endX={85} endY={14}
        />
        <KPIMetricCard
          label="Completed Campaigns"
          value={stats.completed}
          trend={0}
          trendColor="#8E44AD"
          bgColor="#F7F2FA"
          icon={<CheckCircle size={20} />}
          points="M10,42 C25,35 35,40 50,30 S85,5 90,10"
          endX={85} endY={8}
        />
        <KPIMetricCard
          label="Total Sent"
          value={stats.totalSent.toLocaleString()}
          trend={0}
          trendColor="#D47D52"
          bgColor="#FFF0E5"
          icon={<Send size={20} />}
          points="M10,35 C25,38 35,25 50,30 S80,25 90,28"
          endX={85} endY={27}
        />
        <KPIMetricCard
          label="Avg Delivery Rate"
          value={`${stats.avgDelivery.toFixed(1)}%`}
          trend={0}
          trendColor="#B58B00"
          bgColor="#FFF9E5"
          icon={<BarChart2 size={20} />}
          positive={false}
          points="M10,38 C25,35 35,38 50,32 S80,20 90,25"
          endX={85} endY={23}
        />
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
              <DropdownItem 
                $active={filterType === 'WhatsApp'}
                onClick={() => { setFilterType('WhatsApp'); setShowTypeDropdown(false); }}
              >
                WhatsApp
              </DropdownItem>
              <DropdownItem 
                $active={filterType === 'Email'}
                onClick={() => { setFilterType('Email'); setShowTypeDropdown(false); }}
              >
                Email
              </DropdownItem>
              <DropdownItem 
                $active={filterType === 'SMS'}
                onClick={() => { setFilterType('SMS'); setShowTypeDropdown(false); }}
              >
                SMS
              </DropdownItem>
              <DropdownItem 
                $active={filterType === 'Push Notification'}
                onClick={() => { setFilterType('Push Notification'); setShowTypeDropdown(false); }}
              >
                Push Notification
              </DropdownItem>
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
              <DropdownItem 
                $active={filterStatus === 'Active'}
                onClick={() => { setFilterStatus('Active'); setShowStatusDropdown(false); }}
              >
                Active
              </DropdownItem>
              <DropdownItem 
                $active={filterStatus === 'Scheduled'}
                onClick={() => { setFilterStatus('Scheduled'); setShowStatusDropdown(false); }}
              >
                Scheduled
              </DropdownItem>
              <DropdownItem 
                $active={filterStatus === 'Completed'}
                onClick={() => { setFilterStatus('Completed'); setShowStatusDropdown(false); }}
              >
                Completed
              </DropdownItem>
              <DropdownItem 
                $active={filterStatus === 'Draft'}
                onClick={() => { setFilterStatus('Draft'); setShowStatusDropdown(false); }}
              >
                Draft
              </DropdownItem>
            </DropdownMenu>
          </div>
        </FilterSection>

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
            {filteredCampaigns.length === 0 ? (
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
            ) : filteredCampaigns.map((c) => {
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
                      <p>{new Date(c.startDate).toLocaleDateString('en-GB')}</p>
                      <p style={{ color: '#999' }}>to {new Date(c.endDate).toLocaleDateString('en-GB')}</p>
                    </InfoGroup>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      {c.status === 'Draft' && (
                        <IconButton 
                          title="Send Campaign" 
                          onClick={() => handleSendCampaign(c._id || c.id)}
                        >
                          <Send size={18} />
                        </IconButton>
                      )}
                      <IconButton 
                        title="Edit Campaign" 
                        onClick={() => openEditModal(c)}
                      >
                        <Edit3 size={18} />
                      </IconButton>
                      <IconButton 
                        title="Delete Campaign" 
                        onClick={() => handleDeleteCampaign(c._id || c.id)}
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
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter campaign name"
                />
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
                  <option value="Push Notification">Push Notification</option>
                </select>
              </FormGroup>
              <FormGroup>
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Draft">Draft</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Active">Active</option>
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
                <strong>Target Audience:</strong> This campaign will target {photoMergeCustomers.length} Photo Merge App customers.
              </div>
            </ModalBody>
            <ModalFooter>
              <SecondaryButton onClick={() => { setShowCreateModal(false); resetForm(); }}>
                Cancel
              </SecondaryButton>
              <PrimaryButton 
                onClick={handleCreateCampaign}
                disabled={!formData.name || !formData.startDate || !formData.endDate}
              >
                Create Campaign
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
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
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
                  <option value="Push Notification">Push Notification</option>
                </select>
              </FormGroup>
              <FormGroup>
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Draft">Draft</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Failed">Failed</option>
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
                />
              </FormGroup>
            </ModalBody>
            <ModalFooter>
              <SecondaryButton onClick={() => { setShowEditModal(false); setEditingCampaign(null); resetForm(); }}>
                Cancel
              </SecondaryButton>
              <PrimaryButton 
                onClick={handleEditCampaign}
                disabled={!formData.name || !formData.startDate || !formData.endDate}
              >
                Save Changes
              </PrimaryButton>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageContainer>
  );
};

export default Campaigns;
