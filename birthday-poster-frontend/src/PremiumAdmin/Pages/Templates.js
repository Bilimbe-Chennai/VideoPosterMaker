import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useLocation, useNavigate } from 'react-router-dom';
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
    ChevronLeft,
    ChevronRight,
    X,
    ArrowUpRight,
    ArrowDownRight
} from 'react-feather';
// import Card from '../Components/Card'; // Unused
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

  @media (max-width: 1024px) {
    flex-direction: column;
    gap: 20px;
  }
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

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
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

  @media (max-width: 1024px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
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

const highlightAnimation = keyframes`
  0% { transform: scale(1); box-shadow: 0 10px 40px rgba(0,0,0,0.05); }
  50% { transform: scale(1.03); box-shadow: 0 20px 60px rgba(102, 126, 234, 0.3); border-color: #667eea; background-color: rgba(102, 126, 234, 0.05); }
  100% { transform: scale(1); box-shadow: 0 10px 40px rgba(0,0,0,0.05); }
`;

const HighlightedText = styled.span`
  background: #ffd54f;
  color: #1A1A1A;
  font-weight: 700;
  border-radius: 2px;
  padding: 0 2px;
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
  box-shadow: 0 10px 40px rgba(0,0,0,0.05);
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  border: 1px solid rgba(0,0,0,0.03);

  ${props => props.$highlighted && css`
    animation: ${highlightAnimation} 2s ease-in-out infinite;
    border: 2px solid #667eea;
    z-index: 10;
  `}

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 60px rgba(0,0,0,0.12);
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
    max-height: 80%;
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
  padding:10px;
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

// --- Sub-components ---

const TemplateCarousel = ({ photos, name }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNext = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % photos.length);
    };

    const handlePrev = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
    };

    const handleDotClick = (e, index) => {
        e.stopPropagation();
        setCurrentIndex(index);
    };

    if (!photos || photos.length === 0) {
        return (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
                <span style={{ color: '#999', fontSize: '12px' }}>No Image</span>
            </div>
        );
    }

    const currentPhotoUrl = `https://api.bilimbebrandactivations.com/api/upload/file/${photos[currentIndex]}`;

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img
                key={currentIndex}
                src={currentPhotoUrl}
                alt={`${name} - ${currentIndex + 1}`}
                style={{ maxWidth: '90%', maxHeight: '75%', objectFit: 'contain' }}
            />

            {photos.length > 1 && (
                <>
                    <button
                        onClick={handlePrev}
                        style={{
                            position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
                            background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%',
                            width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 2,
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#fff'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.9)'}
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <button
                        onClick={handleNext}
                        style={{
                            position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                            background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%',
                            width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 2,
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#fff'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.9)'}
                    >
                        <ChevronRight size={18} />
                    </button>
                    <div style={{
                        position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)',
                        display: 'flex', gap: '6px', zIndex: 2,
                        background: 'rgba(255,255,255,0.5)', padding: '4px 8px', borderRadius: '10px',
                        backdropFilter: 'blur(4px)'
                    }}>
                        {photos.map((_, idx) => (
                            <div
                                key={idx}
                                onClick={(e) => handleDotClick(e, idx)}
                                style={{
                                    width: '8px', height: '8px', borderRadius: '50%',
                                    background: idx === currentIndex ? '#1A1A1A' : 'rgba(0,0,0,0.2)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

// --- Main Component ---

const Templates = () => {
    const navigate = useNavigate();
    const axiosData = useAxios();
    const [templates, setTemplates] = useState([]);
    // const [loading, setLoading] = useState(true); // Unused
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
    const [templateCount, setTemplateCount] = useState(3);
    const [userAccess, setUserAccess] = useState([]);
    const [adminInfo, setAdminInfo] = useState({ id: '', branchid: '' });
    const location = useLocation();
    const [highlightedId, setHighlightedId] = useState(null);
    const cardRefs = useRef({});

    const highlightText = (text, query) => {
        if (!query || !text) return text;
        const parts = String(text).split(new RegExp(`(${query})`, 'gi'));
        return parts.map((part, index) =>
            part.toLowerCase() === query.toLowerCase() ?
                <HighlightedText key={index}>{part}</HighlightedText> : part
        );
    };

    // Initialize user settings
    useEffect(() => {
        const adminData = localStorage.getItem('user');
        if (adminData) {
            try {
                const user = JSON.parse(adminData);
                setTemplateCount(user.templateCount || 3);
                setUserAccess(user.accessType || []);
                setAdminInfo({
                    id: user.id || user._id || '',
                    branchid: user.branchName || ''
                });
            } catch (e) {
                console.error('Error parsing user data', e);
            }
        }
    }, []);

    const [formData, setFormData] = useState({
        name: '',
        status: 'active',
        accessType: 'photomerge',
        photos: []
    });

    const handleFileChange = (index) => (e) => {
        const file = e.target.files[0];
        const newPhotos = [...formData.photos];
        newPhotos[index] = file;
        setFormData({
            ...formData,
            photos: newPhotos
        });
    };

    // Default Categories based on spec
    const categories = ['Casual', 'Lehengas', 'Wedding', 'Sarees', 'Festive'];
    const statusOptions = ['All Status', 'Active', 'Inactive'];

    const fetchData = useCallback(async () => {
        try {
            // setLoading(true);
            // Fetch templates and usage data in parallel
            const [templatesResponse, photosResponse] = await Promise.all([
                axiosData.get("/photomerge/templates"),
                axiosData.get("/upload/all")
            ]);

            const rawTemplates = templatesResponse.data || [];
            const rawPhotos = photosResponse.data || [];

            // Calculate usage counts from photo creations
            const usageCounts = {};
            rawPhotos
                .filter(item => item.source === 'Photo Merge App')
                .forEach(item => {
                    const templateName = item.template_name || item.templatename || item.type;
                    if (templateName) {
                        usageCounts[templateName] = (usageCounts[templateName] || 0) + 1;
                    }
                });

            // Map backend data to frontend structure with real usage
            let templateList = rawTemplates.map(t => {
                const name = t.templatename;
                return {
                    id: t._id,
                    name: name,
                    category: 'Photo Merge', // defaulting for now, or derive from type/accessType
                    status: t.status || 'active',
                    usage: usageCounts[name] || 0, // Using real aggregated usage
                    lastUsed: t.updatedDate ? new Date(t.updatedDate).toLocaleDateString() : 'Never',
                    createdAt: t.createdDate ? new Date(t.createdDate).toLocaleDateString() : new Date().toLocaleDateString(),
                    overlayUrl: (t.templatePhotos && t.templatePhotos.length > 0)
                        ? `https://api.bilimbebrandactivations.com/api/upload/file/${t.templatePhotos[0]}`
                        : 'https://via.placeholder.com/150?text=No+Image',
                    accessType: t.accessType || 'photomerge',
                    photos: t.templatePhotos || []
                };
            });

            setTemplates(templateList);
            // setLoading(false);
        } catch (error) {
            console.error("Error fetching templates:", error);
            // setLoading(false);
        }
    }, [axiosData]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        const { highlightedTemplateId, query } = location.state || {};

        if (highlightedTemplateId && templates.length > 0) {
            const id = highlightedTemplateId;
            setHighlightedId(id);

            if (query) setSearchQuery(query);

            // Wait for DOM to be ready
            setTimeout(() => {
                if (cardRefs.current[id]) {
                    cardRefs.current[id].scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 500);

            // Clear state asynchronously
            setTimeout(() => {
                navigate(location.pathname, { replace: true, state: {} });
            }, 100);

            // Remove highlight after 5 seconds
            const timer = setTimeout(() => {
                setHighlightedId(null);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [location.state, location.key, templates, navigate, location.pathname]);

    // Handle outside clicks for dropdowns
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (categoryRef.current && !categoryRef.current.contains(event.target)) setShowCategoryDropdown(false);
            if (statusRef.current && !statusRef.current.contains(event.target)) setShowStatusDropdown(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const saveTemplates = (newList) => {
        setTemplates(newList);
        localStorage.setItem('photo_templates', JSON.stringify(newList));
    };

    const handleCreate = () => {
        setEditingTemplate(null);
        setFormData({
            name: '',
            status: 'active',
            accessType: 'photomerge',
            photos: []
        });
        setShowModal(true);
    };

    const handleEdit = (tmpl) => {
        setEditingTemplate(tmpl);
        setFormData({
            name: tmpl.name,
            status: tmpl.status,
            accessType: tmpl.accessType,
            photos: tmpl.photos || []
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this template?")) return;
        try {
            await axiosData.delete(`/photomerge/templates/${id}`);
            // Remove from local state
            const newList = templates.filter(t => t.id !== id);
            setTemplates(newList);
            alert("Template deleted successfully");
        } catch (error) {
            console.error("Error deleting template", error);
            alert("Failed to delete template");
        }
    };

    const handleToggleStatus = async (id) => {
        const tmpl = templates.find(t => t.id === id);
        if (!tmpl) return;

        const newStatus = tmpl.status === 'active' ? 'inactive' : 'active';

        try {
            const formData = new FormData();
            formData.append('status', newStatus);

            await axiosData.put(`/photomerge/templates/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Update local state
            const newList = templates.map(t =>
                t.id === id ? { ...t, status: newStatus } : t
            );
            setTemplates(newList);
        } catch (error) {
            console.error("Error updating status", error);
            alert("Failed to update status");
        }
    };



    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingTemplate) {
                const uploadData = new FormData();
                uploadData.append('templatename', formData.name);
                uploadData.append('accessType', formData.accessType);
                uploadData.append('status', formData.status);

                // Hybrid Update Logic: Construct photoOrder
                const photoOrder = [];
                formData.photos.forEach((photo, index) => {
                    if (photo instanceof File) {
                        // New file uploaded
                        uploadData.append('photos', photo);
                        photoOrder.push('NEW_FILE');
                    } else if (typeof photo === 'string' && photo.trim() !== '') {
                        // Existing photo ID - keep it
                        photoOrder.push(photo);
                    } else {
                        // Empty or undefined - skip this slot
                        // This shouldn't happen if handleEdit works correctly
                        console.warn('Empty photo slot at index', index);
                    }
                });

                uploadData.append('photoOrder', JSON.stringify(photoOrder));

                await axiosData.put(`/photomerge/templates/${editingTemplate.id}`, uploadData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                fetchData();
                alert('Template updated successfully!');

            } else {
                const uploadData = new FormData();
                uploadData.append('templatename', formData.name);
                uploadData.append('accessType', formData.accessType);
                uploadData.append('status', formData.status);
                // Add required metadata
                uploadData.append('adminid', adminInfo.id);
                uploadData.append('branchid', adminInfo.branchid);
                uploadData.append('source', 'photo merge app');

                // Append photos
                formData.photos.forEach((photo, index) => {
                    if (photo instanceof File) {
                        uploadData.append('photos', photo);
                    }
                });

                await axiosData.post('/photomerge/template-upload', uploadData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                fetchData();
                alert('Template created successfully!');
            }
            setShowModal(false);
        } catch (error) {
            console.error('Error saving template:', error);
            alert('Failed to save template: ' + (error.response?.data?.error || error.message));
        }
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
                    <TemplateCard
                        key={tmpl.id}
                        ref={el => cardRefs.current[tmpl.id] = el}
                        $selected={selectedIds.includes(tmpl.id)}
                        $highlighted={tmpl.id === highlightedId}
                    >
                        <TemplatePreview $active={tmpl.status === 'active'} onClick={() => handleEdit(tmpl)}>
                            <TemplateCarousel photos={tmpl.photos} name={tmpl.name} />
                            <div className="status-badge">{tmpl.status.toUpperCase()}</div>
                            <SelectionCircle
                                $selected={selectedIds.includes(tmpl.id)}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedIds(prev => prev.includes(tmpl.id) ? prev.filter(id => id !== tmpl.id) : [...prev, tmpl.id]);
                                }}
                            />
                        </TemplatePreview>
                        <TemplateInfo>
                            <TemplateTitle>
                                <h3>{highlightText(tmpl.name, searchQuery)}</h3>
                                <div style={{ fontSize: '12px', color: '#AAA', fontWeight: 600 }}>{highlightText(tmpl.id, searchQuery)}</div>
                            </TemplateTitle>
                            <TemplateCategory>{highlightText(tmpl.category, searchQuery)}</TemplateCategory>
                            <UsageStats>
                                <StatItem>
                                    <div className="label">Total Usage</div>
                                    <div className="value">{tmpl.usage.toLocaleString()}</div>
                                </StatItem>
                                <StatItem>
                                    <div className="label">Last Used</div>
                                    <div className="value">{tmpl.lastUsed}</div>
                                </StatItem>
                            </UsageStats>
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

            {
                selectedIds.length > 0 && (
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
                )
            }

            {
                showModal && (
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
                                        <label>Status</label>
                                        <select
                                            value={formData.status}
                                            onChange={e => setFormData({ ...formData, status: e.target.value })}
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </FormGroup>
                                    <FormGroup>
                                        <label>Access Type</label>
                                        <select
                                            value={formData.accessType}
                                            onChange={e => setFormData({ ...formData, accessType: e.target.value })}
                                        >
                                            {(userAccess.length === 0 || userAccess.includes('photomerge')) && <option value="photomerge">Photo Merge</option>}
                                            {(userAccess.length === 0 || userAccess.includes('videovideo')) && <option value="videovideo">Video + Video</option>}
                                            {(userAccess.length === 0 || userAccess.includes('videovideovideo')) && <option value="videovideovideo">Video + Video + Video</option>}
                                        </select>
                                    </FormGroup>
                                </FormRow>
                                <FormGroup>
                                    <label>Template Photos ({templateCount} Required)</label>
                                    <div style={{ display: 'grid', gap: '8px', gridTemplateColumns: '1fr 1fr' }}>
                                        {[...Array(templateCount)].map((_, index) => (
                                            <div key={index}>
                                                <label style={{ fontSize: '12px', marginBottom: '4px' }}>
                                                    Photo {index + 1}
                                                    {typeof formData.photos[index] === 'string' && <span style={{ color: 'green', marginLeft: '5px' }}>(Existing)</span>}
                                                </label>
                                                <input
                                                    accept="image/*"
                                                    type="file"
                                                    onChange={handleFileChange(index)}
                                                    style={{ padding: '8px' }}
                                                />
                                            </div>
                                        ))}
                                    </div>
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
                )
            }
        </PageContainer >
    );
};

export default Templates;
