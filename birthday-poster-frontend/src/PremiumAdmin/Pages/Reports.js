import React, { useState } from 'react';
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
  File
} from 'react-feather';
import Card from '../Components/Card';
import KPIMetricCard from '../Components/charts/KPIMetricCard';

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
  padding: 24px;
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

const GenerateButton = styled.button`
  flex: 1;
  padding: 12px;
  border-radius: 14px;
  border: none;
  background: #1A1A1A;
  color: white;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  
  &:disabled {
    opacity: 0.6;
    cursor: wait;
  }
`;

const DownloadButton = styled.button`
  padding: 12px 16px;
  border-radius: 14px;
  border: 1.5px solid #EEE;
  background: white;
  color: #1A1A1A;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    border-color: #DDD;
    background: #FAFAFA;
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

// --- Mock Data ---

const INITIAL_REPORTS = [
  {
    id: 'customer',
    name: 'Customer Engagement',
    type: 'User Analysis',
    description: 'Detailed analysis of customer visits, photo merge activity, and sharing behavior.',
    color: '#D47D52', // Dashboard Customer Color
    icon: <Users size={24} />,
    records: 1240,
    size: '1.2 MB',
    lastGenerated: '2026-01-04 10:30 AM'
  },
  {
    id: 'photo',
    name: 'Photo Analytics',
    type: 'Asset Performance',
    description: 'Insights into category distribution, total views, and download counts per template.',
    color: '#8E44AD', // Dashboard Photos Color
    icon: <Image size={24} />,
    records: 4520,
    size: '3.8 MB',
    lastGenerated: '2026-01-02 03:15 PM'
  },
  {
    id: 'campaign',
    name: 'Campaign Performance',
    type: 'Marketing ROI',
    description: 'Comprehensive metrics for WhatsApp, Email, and SMS outreach effectiveness.',
    color: '#6B8E23', // Dashboard Activity Color
    icon: <Send size={24} />,
    records: 12,
    size: '0.4 MB',
    lastGenerated: '2026-01-05 09:00 AM'
  },
  {
    id: 'share',
    name: 'Share Tracking',
    type: 'Social Distribution',
    description: 'Audit log of all platform-specific sharing activities and click-through rates.',
    color: '#B58B00', // Dashboard Shares Color
    icon: <Share2 size={24} />,
    records: 890,
    size: '0.9 MB',
    lastGenerated: '2026-01-04 11:45 AM'
  }
];

const Reports = () => {
  const [activeRange, setActiveRange] = useState('7 Days');
  const [reports, setReports] = useState(INITIAL_REPORTS);
  const [generating, setGenerating] = useState(null);

  const handleGenerate = (id) => {
    setGenerating(id);
    setTimeout(() => {
      setReports(prev => prev.map(r => {
        if (r.id === id) {
          return {
            ...r,
            lastGenerated: 'Just now',
            records: r.records + Math.floor(Math.random() * 50),
            size: (parseFloat(r.size) + 0.1).toFixed(1) + ' MB'
          };
        }
        return r;
      }));
      setGenerating(null);
    }, 2000);
  };

  const handleDownload = (report) => {
    const content = JSON.stringify({
      report: report.name,
      generated: new Date().toISOString(),
      range: activeRange,
      records: report.records
    }, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.name.toLowerCase().replace(/\s+/g, '_')}_report.json`;
    a.click();
  };

  return (
    <PageContainer>
      <HeaderSection>
        <HeaderText>
          <h1>Reports & Analytics</h1>
          <p>Generate, manage and download high-level performance data for your store</p>
        </HeaderText>
        <RangeSelector>
          {['1 Day', '7 Days', '30 Days', '90 Days'].map(range => (
            <RangeButton
              key={range}
              $active={activeRange === range}
              onClick={() => setActiveRange(range)}
            >
              {range}
            </RangeButton>
          ))}
        </RangeSelector>
      </HeaderSection>

      <ReportsGrid>
        {reports.map((report) => (
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
              <RefreshCw
                size={18}
                className={generating === report.id ? 'spin' : ''}
                style={{ color: '#999', cursor: 'pointer', transition: 'all 0.5s', transform: generating === report.id ? 'rotate(360deg)' : 'none' }}
                onClick={() => handleGenerate(report.id)}
              />
            </div>

            <ReportDescription>{report.description}</ReportDescription>

            <MetadataGrid>
              <MetaItem>
                <span className="label">Last Generated</span>
                <span className="value">{report.lastGenerated}</span>
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
              <GenerateButton
                onClick={() => handleGenerate(report.id)}
                disabled={generating === report.id}
              >
                {generating === report.id ? (
                  <>Wait...</>
                ) : (
                  <><RefreshCw size={16} /> Generate Report</>
                )}
              </GenerateButton>
              <DownloadButton onClick={() => handleDownload(report)}>
                <Download size={16} /> CSV
              </DownloadButton>
              <DownloadButton onClick={() => handleDownload(report)}>
                <FileText size={16} /> PDF
              </DownloadButton>
            </ActionRow>
          </ReportCard>
        ))}
      </ReportsGrid>

      <div style={{ marginTop: '16px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>System Summary</h3>
        <SummaryGrid>
          <KPIMetricCard
            label="Available Reports"
            value="4"
            trend={0}
            trendColor="#666"
            icon={<File size={20} />}
            bgColor="#F3F4F6"
            points="M10,25 Q25,25 50,25 T90,25"
            endX={85} endY={24}
          />
          <KPIMetricCard
            label="Generated This Month"
            value="18"
            trend={12}
            trendColor="#6B8E23"
            icon={<RefreshCw size={20} />}
            bgColor="#F4F9E9"
          />
          <KPIMetricCard
            label="Total Records"
            value="7,462"
            trend={28}
            trendColor="#8E44AD"
            icon={<Database size={20} />}
            bgColor="#F7F2FA"
            points="M10,42 C25,35 35,40 50,30 S85,5 90,10"
            endX={85} endY={8}
          />
          <KPIMetricCard
            label="Total Storage Size"
            value="6.3 MB"
            trend={1.2}
            trendColor="#D47D52"
            icon={<HardDrive size={20} />}
            bgColor="#FFF0E5"
          />
        </SummaryGrid>
      </div>

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
