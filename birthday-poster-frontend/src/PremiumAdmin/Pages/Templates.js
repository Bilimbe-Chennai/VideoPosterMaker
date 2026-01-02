import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import {
    Layers,
    Plus,
    Download,

    Search,
    Filter,
    Edit2,
    Trash2,
    Power,
    Activity,
    BarChart2,
    ChevronDown,
    X,
    Check,
    ArrowUpRight,
    ArrowDownRight
} from 'react-feather';
import Card from '../Components/Card';
import useAxios from '../../useAxios';

// --- Styled Components ---

const PageContainer = styled.div`
  padding: 0;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
`;

const HeaderInfo = styled.div`
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

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
  cursor: pointer;
  border: none;

  background: ${props => props.$variant === 'primary' ? '#1A1A1A' :
        props.$variant === 'success' ? '#25D366' : '#F5F5F5'};
  color: ${props => props.$variant === 'primary' || props.$variant === 'success' ? '#FFF' : '#1A1A1A'};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const KPIGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 32px;
`;

const KPICard = styled.div`
  background: ${props => props.$bgColor || '#FFF'};
  padding: 24px;
  border-radius: 32px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 180px;
  transition: transform 0.2s;
  position: relative;
  border: none;
  
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

const KPILabel = styled.div`
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
  color: #1A1A1A;
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

const ControlSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  background: white;
  padding: 16px 24px;
  border-radius: 16px;
  border: 1px solid #F0F0F0;
`;

const SearchBox = styled.div`
  position: relative;
  width: 320px;

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

const FilterGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const Dropdown = styled.div`
  position: relative;
`;

const DropdownBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #FFF;
  border: 1px solid #EEE;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #666;
  cursor: pointer;

  &:hover {
    background: #FAFAFA;
  }
`;

const TemplateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
`;

const TemplateCard = styled.div`
  background: #FFF;
  border-radius: 24px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.05); // Soft, premium shadow
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); // Smooth bezier transition
  position: relative;
  border: 1px solid rgba(0,0,0,0.03); // Very subtle border

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 60px rgba(0,0,0,0.12); // Deeper shadow on hover
  }

  ${props => props.$selected && `
    border-color: #1A1A1A;
    box-shadow: 0 0 0 2px #1A1A1A;
  `}
`;

const TemplatePreview = styled.div`
  height: 200px; // Slightly taller for better visual
  background: #FAFAFA;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  
  // Luxury pattern overlay (optional, subtle)
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at center, rgba(0,0,0,0.02) 0%, transparent 70%);
  }

  img {
    max-width: 90%;
    max-height: 90%;
    object-fit: contain;
    transition: transform 0.5s ease;
    filter: drop-shadow(0 10px 20px rgba(0,0,0,0.1));
  }

  ${TemplateCard}:hover & img {
    transform: scale(1.05);
  }

  .overlay-badge {
    position: absolute;
    top: 16px;
    left: 16px;
    background: rgba(26, 26, 26, 0.8);
    backdrop-filter: blur(8px);
    color: white;
    padding: 6px 12px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }

  .status-badge {
    position: absolute;
    top: 16px;
    right: 16px;
    background: ${props => props.$active ? '#EEF6E8' : '#F5F5F5'};
    color: ${props => props.$active ? '#4CAF50' : '#999'};
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
    box-shadow: 0 4px 15px rgba(0,0,0,0.08); // Floating effect
    letter-spacing: 0.5px;
  }
`;

const TemplateInfo = styled.div`
  padding: 24px;
`;

const TemplateTitle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: #1A1A1A;
  }
`;

const TemplateCategory = styled.div`
  font-size: 13px;
  color: #999;
  font-weight: 500;
  letter-spacing: 0.5px;
  margin-bottom: 20px;
`;

const UsageStats = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 16px;
  background: #FAFAFA; // Lighter, cleaner background
  border-radius: 16px;
  margin-bottom: 20px;
  border: 1px solid #F0F0F0;
`;

const StatItem = styled.div`
  .label {
    font-size: 11px;
    color: #999;
    font-weight: 600;
    text-transform: uppercase;
    margin-bottom: 2px;
  }
  .value {
    font-size: 14px;
    font-weight: 700;
    color: #333;
  }
`;

const ActionFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px; // Removed border-top for cleaner look
  padding-top: 0;
`;

const SelectionCircle = styled.div`
  position: absolute;
  top: 12px;
  left: 12px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid white;
  background: ${props => props.$selected ? '#1A1A1A' : 'rgba(255,255,255,0.3)'};
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);

  svg {
    opacity: ${props => props.$selected ? 1 : 0};
  }
`;

const BulkBar = styled.div`
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
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  z-index: 1000;
  animation: slideUp 0.3s ease;

  @keyframes slideUp {
    from { transform: translate(-50%, 100px); }
    to { transform: translate(-50%, 0); }
  }

  .count {
    font-weight: 700;
    font-size: 14px;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  background: white;
  width: 100%;
  max-width: 600px;
  border-radius: 24px;
  padding: 32px;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;

  h2 {
    margin: 0 0 24px 0;
    font-size: 24px;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;

  label {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: #444;
    margin-bottom: 8px;
  }

  input, select, textarea {
    width: 100%;
    padding: 12px 16px;
    border-radius: 12px;
    border: 1px solid #EEE;
    font-size: 14px;
    outline: none;

    &:focus {
      border-color: #1A1A1A;
    }
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
`;

// --- Main Component ---

const Templates = () => {
    const axiosData = useAxios();
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All Templates');
    const [selectedStatus, setSelectedStatus] = useState('All Status');
    const [selectedIds, setSelectedIds] = useState([]);

    // Dropdown visibility states
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);

    const categoryRef = useRef(null);
    const statusRef = useRef(null);

    // Modal States
    const [showModal, setShowModal] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        category: 'Casual',
        status: 'active',
        overlayUrl: '',
        faceAlignment: 'center',
        cameraMode: 'standard'
    });

    // Default Categories based on spec
    const categories = ['Casual', 'Lehengas', 'Wedding', 'Sarees', 'Festive'];
    const statusOptions = ['All Status', 'Active', 'Inactive'];

    useEffect(() => {
        fetchData();
    }, []);

    // Handle outside clicks for dropdowns
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (categoryRef.current && !categoryRef.current.contains(event.target)) setShowCategoryDropdown(false);
            if (statusRef.current && !statusRef.current.contains(event.target)) setShowStatusDropdown(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchData = async () => {
        try {
            // 1. Fetch Template Definitions (Local for now, until API exists)
            const localData = localStorage.getItem('photo_templates');
            let templateList = localData ? JSON.parse(localData) : [
                { id: 'T101', name: 'Royal Wedding Gold', category: 'Wedding', status: 'active', usage: 1250, lastUsed: '2025-12-30', createdAt: '2025-01-15', overlayUrl: 'https://via.placeholder.com/150/FFD700/000?text=Gold+Border' },
                { id: 'T102', name: 'Silk Heritage', category: 'Sarees', status: 'active', usage: 850, lastUsed: '2025-12-28', createdAt: '2025-02-10', overlayUrl: 'https://via.placeholder.com/150/764BA2/FFF?text=Silk+Pattern' },
                { id: 'T103', name: 'Festive Vibes Red', category: 'Festive', status: 'inactive', usage: 420, lastUsed: '2025-11-20', createdAt: '2025-05-05', overlayUrl: 'https://via.placeholder.com/150/E53935/FFF?text=Red+Festive' },
                { id: 'T104', name: 'Casual Summer', category: 'Casual', status: 'active', usage: 2100, lastUsed: '2025-12-31', createdAt: '2025-03-20', overlayUrl: 'https://via.placeholder.com/150/4CAF50/FFF?text=Casual' },
            ];

            // 2. Fetch Real Usage Data
            try {
                const response = await axiosData.get("upload/all");
                const rawItems = Array.isArray(response.data) ? response.data : (response.data.data || []);

                const usageMap = {};
                const lastUsedMap = {};

                rawItems.forEach(item => {
                    // Match posterVideoId to template ID (e.g. "67b31...883")
                    // If template IDs in local storage are like 'T101', we might have a mismatch.
                    // Assuming for now user will manually ensure IDs match or we rely on 'posterVideoId' 
                    // matching the ID in the template list. 
                    // If local IDs are 'T101' but API returns MongoIDs, this won't match perfectly without user alignment.
                    // For this task, we will attempt to match exact string.
                    const tid = item.posterVideoId;
                    if (tid) {
                        usageMap[tid] = (usageMap[tid] || 0) + 1;

                        const itemDate = new Date(item.date || item.createdAt).getTime();
                        if (!lastUsedMap[tid] || itemDate > lastUsedMap[tid]) {
                            lastUsedMap[tid] = itemDate;
                        }
                    }
                });

                // Merge Usage Data
                templateList = templateList.map(t => ({
                    ...t,
                    usage: usageMap[t.id] || 0, // Use real count if available (will be 0 if ID doesn't match API)
                    lastUsed: lastUsedMap[t.id] ? new Date(lastUsedMap[t.id]).toLocaleDateString() : t.lastUsed
                }));

            } catch (apiErr) {
                console.warn("Failed to fetch usage stats, using local mock data", apiErr);
            }

            setTemplates(templateList);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching templates:", error);
            setLoading(false);
        }
    };

    const saveTemplates = (newList) => {
        setTemplates(newList);
        localStorage.setItem('photo_templates', JSON.stringify(newList));
    };

    const handleCreate = () => {
        setEditingTemplate(null);
        setFormData({
            name: '',
            category: 'Casual',
            status: 'active',

            overlayUrl: '',
            faceAlignment: 'center',
            cameraMode: 'standard'
        });
        setShowModal(true);
    };

    const handleEdit = (tmpl) => {
        setEditingTemplate(tmpl);
        setFormData({ ...tmpl });
        setShowModal(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this template?')) {
            const newList = templates.filter(t => t.id !== id);
            saveTemplates(newList);
        }
    };

    const handleToggleStatus = (id) => {
        const newList = templates.map(t =>
            t.id === id ? { ...t, status: t.status === 'active' ? 'inactive' : 'active' } : t
        );
        saveTemplates(newList);
    };



    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingTemplate) {
            const newList = templates.map(t =>
                t.id === editingTemplate.id ? { ...formData, updatedAt: new Date().toISOString() } : t
            );
            saveTemplates(newList);
        } else {
            const newTmpl = {
                ...formData,
                id: 'T' + (Math.floor(Math.random() * 900) + 100),
                usage: 0,
                createdAt: new Date().toISOString(),
                lastUsed: 'Never'
            };
            saveTemplates([...templates, newTmpl]);
        }
        setShowModal(false);
    };

    const exportToExcel = (dataToExport = templates) => {
        const csvContent = "Template ID,Name,Category,Status,Usage,Last Used,Orientation,Created At\n"
            + dataToExport.map(e => `${e.id},${e.name},${e.category},${e.status},${e.usage},${e.lastUsed},${e.orientation},${e.createdAt}`).join("\n");

        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Templates_Report_${new Date().toLocaleDateString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Filtering Logic
    const filteredTemplates = templates.filter(tmpl => {
        const matchesSearch = tmpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tmpl.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All Templates' || tmpl.category === selectedCategory;
        const matchesStatus = selectedStatus === 'All Status' || tmpl.status.toLowerCase() === selectedStatus.toLowerCase();
        return matchesSearch && matchesCategory && matchesStatus;
    });

    const kpis = [
        {
            label: 'Total Templates',
            value: templates.length,
            icon: <Layers size={21} />,
            color: '#FFF5EB',
            text: '#D97706',
            trend: '+12.5%',
            isUp: true,
            points: "M 10 40 Q 30 35, 50 38 T 90 25",
            endX: 90,
            endY: 25
        },
        {
            label: 'Active Templates',
            value: templates.filter(t => t.status === 'active').length,
            icon: <Activity size={21} />,
            color: '#EEF6E8',
            text: '#4CAF50',
            trend: '+23.1%',
            isUp: true,
            points: "M 10 42 Q 30 40, 50 25 T 90 15",
            endX: 90,
            endY: 15
        },
        {
            label: 'Total Usage',
            value: templates.reduce((acc, curr) => acc + curr.usage, 0).toLocaleString(),
            icon: <BarChart2 size={21} />,
            color: '#E8F0FE',
            text: '#2196F3',
            trend: '+8.2%',
            isUp: true,
            points: "M 10 45 Q 40 45, 60 35 T 90 32",
            endX: 90,
            endY: 32
        },
        {
            label: 'Avg Usage',
            value: templates.length > 0 ? (templates.reduce((acc, curr) => acc + curr.usage, 0) / templates.length).toFixed(0) : 0,
            icon: <Activity size={21} />,
            color: '#F4E6F0',
            text: '#9C27B0',
            trend: '+2.1%',
            isUp: true,
            points: "M 10 45 Q 40 45, 70 35 T 90 28",
            endX: 90,
            endY: 28
        },
    ];

    return (
        <PageContainer>
            <Header>
                <HeaderInfo>
                    <h1>Template Management</h1>
                    <p>Create and manage photo booth templates for customer experiences</p>
                </HeaderInfo>
                <HeaderActions>
                    <Button onClick={() => exportToExcel()}>
                        <Download size={16} /> Export Data
                    </Button>
                    <Button $variant="primary" onClick={handleCreate}>
                        <Plus size={16} /> Create New Template
                    </Button>
                </HeaderActions>
            </Header>

            <KPIGrid>
                {kpis.map((kpi, idx) => (
                    <KPICard key={idx} $bgColor={kpi.color}>
                        <KPITop>
                            <KPIIconWrapper>{kpi.icon}</KPIIconWrapper>
                            <KPILabel>{kpi.label}</KPILabel>
                        </KPITop>

                        <KPIContent>
                            <KPIMain>
                                <KPIValue>{kpi.value}</KPIValue>
                                <TrendIndicator $color={kpi.isUp ? '#4CAF50' : '#E53935'}>
                                    {kpi.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                    {kpi.trend}
                                </TrendIndicator>
                            </KPIMain>

                            <SparklineWrapper>
                                <MiniTrendSVG
                                    color={kpi.text}
                                    points={kpi.points}
                                    endX={kpi.endX}
                                    endY={kpi.endY}
                                />
                            </SparklineWrapper>
                        </KPIContent>
                    </KPICard>
                ))}
            </KPIGrid>

            <ControlSection>
                <SearchBox>
                    <Search size={18} />
                    <input
                        placeholder="Search templates by name or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </SearchBox>

                <FilterGroup>
                    <Dropdown ref={categoryRef}>
                        <DropdownBtn onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}>
                            <Filter size={16} />
                            {selectedCategory}
                            <ChevronDown size={14} />
                        </DropdownBtn>
                        {showCategoryDropdown && (
                            <div style={{
                                position: 'absolute', top: '100%', left: 0, width: '200px',
                                background: 'white', border: '1px solid #EEE', borderRadius: '12px',
                                boxShadow: '0 10px 20px rgba(0,0,0,0.1)', zIndex: 100, padding: '8px',
                                marginTop: '8px'
                            }}>
                                {['All Templates', ...categories].map(c => (
                                    <div
                                        key={c}
                                        onClick={() => { setSelectedCategory(c); setShowCategoryDropdown(false); }}
                                        style={{
                                            padding: '10px 16px', borderRadius: '8px', cursor: 'pointer',
                                            fontSize: '14px', background: selectedCategory === c ? '#F5F5F5' : 'transparent',
                                            fontWeight: selectedCategory === c ? 600 : 400
                                        }}
                                    >
                                        {c}
                                    </div>
                                ))}
                            </div>
                        )}
                    </Dropdown>

                    <Dropdown ref={statusRef}>
                        <DropdownBtn onClick={() => setShowStatusDropdown(!showStatusDropdown)}>
                            {selectedStatus}
                            <ChevronDown size={14} />
                        </DropdownBtn>
                        {showStatusDropdown && (
                            <div style={{
                                position: 'absolute', top: '100%', left: 0, width: '160px',
                                background: 'white', border: '1px solid #EEE', borderRadius: '12px',
                                boxShadow: '0 10px 20px rgba(0,0,0,0.1)', zIndex: 100, padding: '8px',
                                marginTop: '8px'
                            }}>
                                {statusOptions.map(s => (
                                    <div
                                        key={s}
                                        onClick={() => { setSelectedStatus(s); setShowStatusDropdown(false); }}
                                        style={{
                                            padding: '10px 16px', borderRadius: '8px', cursor: 'pointer',
                                            fontSize: '14px', background: selectedStatus === s ? '#F5F5F5' : 'transparent',
                                            fontWeight: selectedStatus === s ? 600 : 400
                                        }}
                                    >
                                        {s}
                                    </div>
                                ))}
                            </div>
                        )}
                    </Dropdown>
                </FilterGroup>
            </ControlSection>

            <TemplateGrid>
                {filteredTemplates.map(tmpl => (
                    <TemplateCard key={tmpl.id} $selected={selectedIds.includes(tmpl.id)}>
                        <SelectionCircle
                            $selected={selectedIds.includes(tmpl.id)}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (selectedIds.includes(tmpl.id)) {
                                    setSelectedIds(selectedIds.filter(id => id !== tmpl.id));
                                } else {
                                    setSelectedIds([...selectedIds, tmpl.id]);
                                }
                            }}
                        >
                            <Check size={12} strokeWidth={4} />
                        </SelectionCircle>

                        <TemplatePreview $active={tmpl.status === 'active'}>
                            <img src={tmpl.overlayUrl} alt={tmpl.name} />
                            <div className="status-badge">{tmpl.status.toUpperCase()}</div>
                        </TemplatePreview>

                        <TemplateInfo>
                            <TemplateTitle>
                                <h3>{tmpl.name}</h3>
                                <div style={{ fontSize: '12px', color: '#AAA', fontWeight: 600 }}>{tmpl.id}</div>
                            </TemplateTitle>
                            <TemplateCategory>{tmpl.category}</TemplateCategory>

                            <UsageStats>
                                <StatItem>
                                    <div className="label">Total Usage</div>
                                    <div className="value">{tmpl.usage.toLocaleString()}</div>
                                </StatItem>
                                <StatItem style={{ justifyContent: 'flex-end', textAlign: 'right' }}>
                                    <div className="label">Last Used</div>
                                    <div className="value">{tmpl.lastUsed}</div>
                                </StatItem>
                            </UsageStats>

                            <div style={{ fontSize: '11px', color: '#BBB' }}>
                                Created: {new Date(tmpl.createdAt).toLocaleDateString()}
                            </div>
                        </TemplateInfo>

                        <ActionFooter>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <Button style={{ padding: '6px', minWidth: '32px' }} title="Edit" onClick={() => handleEdit(tmpl)}>
                                    <Edit2 size={14} />
                                </Button>
                                <Button
                                    style={{ padding: '6px', minWidth: '32px' }}
                                    title={tmpl.status === 'active' ? 'Deactivate' : 'Activate'}
                                    onClick={() => handleToggleStatus(tmpl.id)}
                                >
                                    <Power size={14} color={tmpl.status === 'active' ? '#4CAF50' : '#E53935'} />
                                </Button>
                            </div>
                            <Button style={{ padding: '6px 12px', fontSize: '12px' }} $variant="danger" onClick={() => handleDelete(tmpl.id)}>
                                <Trash2 size={14} />
                            </Button>
                        </ActionFooter>
                    </TemplateCard>
                ))}
            </TemplateGrid>

            {selectedIds.length > 0 && (
                <BulkBar>
                    <div className="count">{selectedIds.length} Templates Selected</div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <Button $variant="primary" onClick={() => {
                            const newList = templates.map(t => selectedIds.includes(t.id) ? { ...t, status: 'active' } : t);
                            saveTemplates(newList);
                            setSelectedIds([]);
                        }}>Activate</Button>
                        <Button $variant="primary" onClick={() => {
                            const newList = templates.map(t => selectedIds.includes(t.id) ? { ...t, status: 'inactive' } : t);
                            saveTemplates(newList);
                            setSelectedIds([]);
                        }}>Deactivate</Button>
                        <Button $variant="primary" onClick={() => exportToExcel(templates.filter(t => selectedIds.includes(t.id)))}>Export</Button>
                        <Button onClick={() => setSelectedIds([])} style={{ background: 'transparent', color: 'white' }}>Cancel</Button>
                    </div>
                </BulkBar>
            )}

            {showModal && (
                <ModalOverlay onClick={() => setShowModal(false)}>
                    <ModalContent onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2>{editingTemplate ? 'Edit Template' : 'Create New Template'}</h2>
                            <X size={24} style={{ cursor: 'pointer' }} onClick={() => setShowModal(false)} />
                        </div>

                        <form onSubmit={handleSubmit}>
                            <FormGroup>
                                <label>Template Name</label>
                                <input
                                    required
                                    placeholder="e.g. Royal Wedding Gold"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </FormGroup>

                            <FormRow>
                                <FormGroup>
                                    <label>Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </FormGroup>
                                <FormGroup>
                                    <label>Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </FormGroup>
                            </FormRow>

                            <FormRow>
                                <FormGroup>
                                    <label>Face Alignment</label>
                                    <select
                                        value={formData.faceAlignment}
                                        onChange={e => setFormData({ ...formData, faceAlignment: e.target.value })}
                                    >
                                        <option value="center">Center</option>
                                        <option value="offset">Offset</option>
                                    </select>
                                </FormGroup>
                            </FormRow>

                            <FormGroup>
                                <label>Overlay PNG URL (Transparent)</label>
                                <input
                                    placeholder="https://api.yoursite.com/overlays/gold.png"
                                    value={formData.overlayUrl}
                                    onChange={e => setFormData({ ...formData, overlayUrl: e.target.value })}
                                />
                            </FormGroup>

                            <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
                                <Button type="button" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancel</Button>
                                <Button type="submit" $variant="primary" style={{ flex: 1 }}>
                                    {editingTemplate ? 'Update Template' : 'Create Template'}
                                </Button>
                            </div>
                        </form>
                    </ModalContent>
                </ModalOverlay>
            )}
        </PageContainer>
    );
};

export default Templates;
