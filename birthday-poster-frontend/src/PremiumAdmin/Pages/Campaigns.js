import React, { useState, useMemo, useEffect } from 'react';
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
  Loader
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

const Campaigns = () => {
  const axiosData = useAxios();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [campaigns, setCampaigns] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All Channels');
  const [filterStatus, setFilterStatus] = useState('All Status');
  const [loading, setLoading] = useState(true);
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

  // Fetch campaign data from API (derived from share activities)
  useEffect(() => {
    const fetchCampaignData = async () => {
      try {
        setLoading(true);
        const response = await axiosData.get(`upload/all?adminid=${user._id || user.id}`);
        const rawItems = response.data.filter(item => item.source === 'Photo Merge App');

        // Group by template/campaign type
        const campaignMap = {};
        
        rawItems.forEach(item => {
          const templateName = item.template_name || item.templatename || item.type || 'General Campaign';
          
          if (!campaignMap[templateName]) {
            campaignMap[templateName] = {
              id: `CMP-${Object.keys(campaignMap).length + 1}`.padStart(7, '0'),
              name: templateName,
              description: `Campaign for ${templateName} template`,
              type: 'WhatsApp',
              status: 'Active',
              startDate: item.date || item.createdAt,
              endDate: new Date().toISOString(),
              sent: 0,
              delivered: 0,
              clicks: 0,
              whatsapp: 0,
              facebook: 0,
              instagram: 0,
              download: 0
            };
          }

          const campaign = campaignMap[templateName];
          const whatsapp = item.whatsappsharecount || 0;
          const facebook = item.facebooksharecount || 0;
          const twitter = item.twittersharecount || 0;
          const instagram = item.instagramsharecount || 0;
          const download = item.downloadcount || 0;
          const totalShares = whatsapp + facebook + twitter + instagram; // Shares only
          const totalEngagement = totalShares + download; // Shares + Downloads

          campaign.sent += 1;
          campaign.delivered += totalShares > 0 ? 1 : 0;
          campaign.clicks += totalShares;
          campaign.whatsapp += whatsapp;
          campaign.facebook += facebook;
          campaign.instagram += instagram;
          campaign.download += download;

          // Determine primary channel
          if (campaign.whatsapp > campaign.facebook && campaign.whatsapp > campaign.instagram) {
            campaign.type = 'WhatsApp';
          } else if (campaign.facebook > campaign.instagram) {
            campaign.type = 'Email'; // Using Email icon for Facebook
          } else if (campaign.instagram > 0) {
            campaign.type = 'Push Notification'; // Using for Instagram
          }

          // Update dates
          const itemDate = new Date(item.date || item.createdAt);
          const startDate = new Date(campaign.startDate);
          if (itemDate < startDate) {
            campaign.startDate = item.date || item.createdAt;
          }
        });

        // Convert to array and determine status
        const now = new Date();
        const campaignsArray = Object.values(campaignMap).map(c => {
          const endDate = new Date(c.endDate);
          const startDate = new Date(c.startDate);
          
          if (c.clicks === 0 && c.sent > 0) {
            c.status = 'Scheduled';
          } else if (endDate < now && c.clicks > 0) {
            c.status = 'Completed';
          } else if (c.delivered < c.sent * 0.5) {
            c.status = 'Failed';
          } else {
            c.status = 'Active';
          }
          
          return c;
        });

        // Sort by most recent
        campaignsArray.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
        
        setCampaigns(campaignsArray);

        // Calculate growth metrics (compare current vs last 30 days)
        const last30Days = new Date(now);
        last30Days.setDate(now.getDate() - 30);
        const last60Days = new Date(now);
        last60Days.setDate(now.getDate() - 60);

        const recentCampaigns = campaignsArray.filter(c => new Date(c.startDate) >= last30Days);
        const previousCampaigns = campaignsArray.filter(c => {
          const date = new Date(c.startDate);
          return date >= last60Days && date < last30Days;
        });

        const calculateGrowth = (current, previous) => {
          if (previous === 0) return current > 0 ? parseFloat(current.toFixed(1)) : 0;
          return parseFloat(((current - previous) / previous * 100).toFixed(1));
        };

        const recentActive = recentCampaigns.filter(c => c.status === 'Active' || c.status === 'Scheduled').length;
        const previousActive = previousCampaigns.filter(c => c.status === 'Active' || c.status === 'Scheduled').length;
        const recentCompleted = recentCampaigns.filter(c => c.status === 'Completed').length;
        const previousCompleted = previousCampaigns.filter(c => c.status === 'Completed').length;
        const recentSent = recentCampaigns.reduce((acc, c) => acc + c.sent, 0);
        const previousSent = previousCampaigns.reduce((acc, c) => acc + c.sent, 0);
        const recentDelivered = recentCampaigns.reduce((acc, c) => acc + c.delivered, 0);
        const previousDelivered = previousCampaigns.reduce((acc, c) => acc + c.delivered, 0);

        setGrowthMetrics({
          activeGrowth: calculateGrowth(recentActive, previousActive),
          completedGrowth: calculateGrowth(recentCompleted, previousCompleted),
          sentGrowth: calculateGrowth(recentSent, previousSent),
          deliveryGrowth: calculateGrowth(
            recentSent > 0 ? (recentDelivered / recentSent) * 100 : 0,
            previousSent > 0 ? (previousDelivered / previousSent) * 100 : 0
          )
        });
      } catch (error) {
        console.error("Error fetching campaign data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaignData();
  }, []);

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
           <PrimaryButton $variant="success">
            <MessageCircle size={18} /> Bulk Whatsapp
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
            ) : filteredCampaigns.map((c) => {
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
`;
if (!document.querySelector('style[data-campaigns-loader]')) {
  style.setAttribute('data-campaigns-loader', 'true');
  document.head.appendChild(style);
}
