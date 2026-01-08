import React, { useState, useEffect } from 'react';
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

const Reports = () => {
  const axiosData = useAxios();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [activeRange, setActiveRange] = useState('7 Days');
  const [reports, setReports] = useState([]);
  const [generating, setGenerating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summaryStats, setSummaryStats] = useState({
    totalReports: 4,
    generatedThisMonth: 0,
    totalRecords: 0,
    totalSize: '0 MB'
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

  const fetchReportData = React.useCallback(async () => {
      try {
        setLoading(true);
        const response = await axiosData.get(`upload/all?adminid=${user._id || user.id}`);
        const rawItems = response.data.filter(item => item.source === 'Photo Merge App');

        // Calculate real statistics
        const customersSet = new Set();
        let totalShares = 0;

        let totalDownloads = 0;
        rawItems.forEach(item => {
          const phone = item.whatsapp || item.mobile || '';
          const key = phone && phone !== 'N/A' ? phone : (item.name || 'Unknown');
          customersSet.add(key);
          
          totalShares += (item.whatsappsharecount || 0) +
            (item.facebooksharecount || 0) +
            (item.twittersharecount || 0) +
            (item.instagramsharecount || 0);
          totalDownloads += (item.downloadcount || 0);
        });

        const totalCustomers = customersSet.size;
        const totalPhotos = rawItems.length;

        // Calculate estimated file sizes based on records
        const estimateSize = (records) => {
          const sizeKB = records * 0.5; // ~0.5KB per record
          return sizeKB >= 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB.toFixed(0)} KB`;
        };

        const now = new Date();
        const formattedDate = now.toLocaleString('en-US', {
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit', hour12: true
        });

        // Build reports with real data
        const reportsData = [
          {
            id: 'customer',
            name: 'Customer Engagement',
            type: 'User Analysis',
            description: 'Detailed analysis of customer visits, photo merge activity, and sharing behavior.',
            color: '#B8653A',
            icon: <Users size={24} />,
            records: totalCustomers,
            size: estimateSize(totalCustomers),
            lastGenerated: formattedDate
          },
          {
            id: 'photo',
            name: 'Photo Analytics',
            type: 'Asset Performance',
            description: 'Insights into category distribution, total views, and download counts per template.',
            color: '#8E44AD',
            icon: <Image size={24} />,
            records: totalPhotos,
            size: estimateSize(totalPhotos),
            lastGenerated: formattedDate
          },
          {
            id: 'campaign',
            name: 'Campaign Performance',
            type: 'Marketing ROI',
            description: 'Comprehensive metrics for WhatsApp, Email, and SMS outreach effectiveness.',
            color: '#5A7519',
            icon: <Send size={24} />,
            records: Math.floor(totalShares / 10) || 0,
            size: estimateSize(Math.floor(totalShares / 10)),
            lastGenerated: formattedDate
          },
          {
            id: 'share',
            name: 'Share Tracking',
            type: 'Social Distribution',
            description: 'Audit log of all platform-specific sharing activities and click-through rates.',
            color: '#B58B00',
            icon: <Share2 size={24} />,
            records: totalShares,
            size: estimateSize(totalShares),
            lastGenerated: formattedDate
          }
        ];

        setReports(reportsData);

        // Calculate summary stats
        const totalRecords = totalCustomers + totalPhotos + totalShares;
        const totalSizeKB = totalRecords * 0.5;
        setSummaryStats({
          totalReports: 4,
          generatedThisMonth: reportsData.length,
          totalRecords: totalRecords,
          totalSize: totalSizeKB >= 1024 ? `${(totalSizeKB / 1024).toFixed(1)} MB` : `${totalSizeKB.toFixed(0)} KB`
        });

        // Calculate growth (current vs previous period based on activeRange)
        const getDaysFromRange = (range) => {
          switch(range) {
            case '1 Day': return 1;
            case '7 Days': return 7;
            case '30 Days': return 30;
            case '90 Days': return 90;
            default: return 7;
          }
        };

        const days = getDaysFromRange(activeRange);
        const currentStart = new Date();
        currentStart.setDate(currentStart.getDate() - days);
        const previousStart = new Date();
        previousStart.setDate(previousStart.getDate() - (days * 2));
        const previousEnd = currentStart;

        const currentItems = rawItems.filter(item => {
          const date = new Date(item.date || item.createdAt);
          return date >= currentStart;
        });

        const previousItems = rawItems.filter(item => {
          const date = new Date(item.date || item.createdAt);
          return date >= previousStart && date < previousEnd;
        });

        const calculateGrowth = (current, previous) => {
          if (previous === 0) return current > 0 ? parseFloat(current.toFixed(1)) : 0;
          return parseFloat(((current - previous) / previous * 100).toFixed(1));
        };

        setGrowthMetrics({
          reportsGrowth: 0, // Static
          generatedGrowth: calculateGrowth(currentItems.length, previousItems.length),
          recordsGrowth: calculateGrowth(currentItems.length, previousItems.length),
          sizeGrowth: calculateGrowth(currentItems.length * 0.5, previousItems.length * 0.5)
        });

      } catch (error) {
        console.error("Error fetching report data:", error);
      } finally {
        setLoading(false);
      }
  }, [axiosData, activeRange, user._id, user.id]);

  // Fetch real data from API
  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const handleGenerate = async (id) => {
    try {
      setGenerating(id);
      // Re-fetch real data instead of simulating generation
      await fetchReportData();
      // Update the generated label for UX (data stays API-driven)
      setReports(prev => prev.map(r => (r.id === id ? { ...r, lastGenerated: 'Just now' } : r)));
    } finally {
      setGenerating(null);
    }
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
        {loading ? (
          <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px', flexDirection: 'column', gap: '16px' }}>
            <Loader className="spin" size={40} color="#1A1A1A" />
            <div style={{ fontWeight: 600, color: '#555' }}>Loading reports data...</div>
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

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>

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
