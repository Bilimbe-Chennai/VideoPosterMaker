import React, { useState, useMemo } from 'react';
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
    Users
} from 'react-feather';
import Card from '../Components/Card';
import KPIMetricCard from '../Components/charts/KPIMetricCard';

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
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.15);
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
  
  &:hover {
    border-color: #DDD;
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
  transition: all 0.2s;
  
  &:hover {
    background: #F5F5F5;
    color: #1A1A1A;
  }
`;

// --- Mock Data ---

const INITIAL_CAMPAIGNS = [
    {
        id: 'CMP-001',
        name: 'Winter Festive Sale',
        description: 'Special 30% discount on silk sarees',
        type: 'WhatsApp',
        status: 'Active',
        startDate: '2026-01-01',
        endDate: '2026-01-10',
        sent: 1250,
        delivered: 1180,
        clicks: 450,
    },
    {
        id: 'CMP-002',
        name: 'New Year Collection Launch',
        description: 'Exclusive preview of 2026 collection',
        type: 'Email',
        status: 'Completed',
        startDate: '2025-12-25',
        endDate: '2025-12-31',
        sent: 5000,
        delivered: 4850,
        clicks: 920,
    },
    {
        id: 'CMP-003',
        name: 'Weekend Store Visit SMS',
        description: 'Visit our flagship store this weekend',
        type: 'SMS',
        status: 'Scheduled',
        startDate: '2026-01-07',
        endDate: '2026-01-08',
        sent: 0,
        delivered: 0,
        clicks: 0,
    },
    {
        id: 'CMP-004',
        name: 'Flash Sale Reminder',
        description: 'Only 2 hours left for the sale!',
        type: 'Push Notification',
        status: 'Failed',
        startDate: '2026-01-03',
        endDate: '2026-01-03',
        sent: 800,
        delivered: 650,
        clicks: 210,
    }
];

const Campaigns = () => {
    const [campaigns, setCampaigns] = useState(INITIAL_CAMPAIGNS);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('All Channels');
    const [filterStatus, setFilterStatus] = useState('All Status');

    const stats = useMemo(() => {
        const active = campaigns.filter(c => c.status === 'Active' || c.status === 'Scheduled').length;
        const completed = campaigns.filter(c => c.status === 'Completed').length;
        const totalSent = campaigns.reduce((acc, curr) => acc + curr.sent, 0);
        const totalDelivered = campaigns.reduce((acc, curr) => acc + curr.delivered, 0);
        const avgDelivery = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;

        return { active, completed, totalSent, avgDelivery };
    }, [campaigns]);

    const filteredCampaigns = campaigns.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.id.toLowerCase().includes(searchQuery.toLowerCase());
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
                c.id, c.name, c.type, c.status, c.sent, c.delivered,
                c.delivered > 0 ? ((c.clicks / c.delivered) * 100).toFixed(1) + '%' : '0%'
            ].join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "campaign_report.csv");
        document.body.appendChild(link);
        link.click();
    };

    return (
        <PageContainer>
            <PageHeader>
                <HeaderInfo>
                    <h1>Campaign Management</h1>
                    <p>Create, manage and analyze your marketing performance across all channels</p>
                </HeaderInfo>
                <ActionGroup>
                    <SecondaryButton onClick={exportData}>
                        <Download size={18} /> Export Results
                    </SecondaryButton>
                    <PrimaryButton>
                        <Plus size={18} /> Create New Campaign
                    </PrimaryButton>
                </ActionGroup>
            </PageHeader>

            <MetricGrid>
                <KPIMetricCard
                    label="Active Campaigns"
                    value={stats.active}
                    trend={12.5}
                    trendColor="#6B8E23"
                    bgColor="#F4F9E9"
                    icon={<Play size={20} />}
                    points="M10,40 C25,38 35,45 50,35 S80,10 90,15"
                    endX={85} endY={14}
                />
                <KPIMetricCard
                    label="Completed Campaigns"
                    value={stats.completed}
                    trend={5.2}
                    trendColor="#8E44AD"
                    bgColor="#F7F2FA"
                    icon={<CheckCircle size={20} />}
                    points="M10,42 C25,35 35,40 50,30 S85,5 90,10"
                    endX={85} endY={8}
                />
                <KPIMetricCard
                    label="Total Sent"
                    value={stats.totalSent.toLocaleString()}
                    trend={24.8}
                    trendColor="#D47D52"
                    bgColor="#FFF0E5"
                    icon={<Send size={20} />}
                    points="M10,35 C25,38 35,25 50,30 S80,25 90,28"
                    endX={85} endY={27}
                />
                <KPIMetricCard
                    label="Avg Delivery Rate"
                    value={`${stats.avgDelivery.toFixed(1)}%`}
                    trend={-1.4}
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
                    <DropdownSelector onClick={() => { }}>
                        <Filter size={16} /> {filterType} <ChevronDown size={14} />
                    </DropdownSelector>
                    <DropdownSelector onClick={() => { }}>
                        <Calendar size={16} /> Last 30 Days <ChevronDown size={14} />
                    </DropdownSelector>
                </FilterSection>

                <CampaignTable>
                    <thead>
                        <tr>
                            <th style={{ width: '40px' }}><input type="checkbox" /></th>
                            <th>Campaign Details</th>
                            <th>Channel</th>
                            <th>Status</th>
                            <th>Performance</th>
                            <th>Period</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCampaigns.map((c) => {
                            const channel = getChannelConfig(c.type);
                            const deliveryRate = c.sent > 0 ? (c.delivered / c.sent) * 100 : 0;
                            const ctr = c.delivered > 0 ? (c.clicks / c.delivered) * 100 : 0;

                            return (
                                <tr key={c.id}>
                                    <td><input type="checkbox" /></td>
                                    <td>
                                        <InfoGroup>
                                            <h4>{c.name}</h4>
                                            <p>ID: {c.id} • {c.description.substring(0, 30)}...</p>
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
                                            <IconButton title="View Analytics"><BarChart2 size={18} /></IconButton>
                                            <IconButton title="Edit Campaign"><Edit3 size={18} /></IconButton>
                                            <IconButton title="More"><MoreVertical size={18} /></IconButton>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </CampaignTable>
            </ContentCard>
        </PageContainer>
    );
};

export default Campaigns;
