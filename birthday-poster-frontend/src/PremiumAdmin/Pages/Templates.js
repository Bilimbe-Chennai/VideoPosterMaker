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
    ArrowDownRight,
    AlertCircle,
    CheckCircle,
    XCircle
} from 'react-feather';
// import Card from '../Components/Card'; // Unused
import useAxios from '../../useAxios';
import { formatDate, getStoredDateFormat } from '../../utils/dateUtils';

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
    color: #555;
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

  background: ${props => props.$variant === 'primary' ? '#0F0F0F' :
        props.$variant === 'success' ? '#20BD5A' : '#E5E5E5'};
  color: ${props => props.$variant === 'primary' || props.$variant === 'success' ? '#FFF' : '#0F0F0F'};

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
    border: 1px solid #D0D0D0;
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
    color: #777;
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
    background: #E8E8E8;
  }
`;

const highlightAnimation = keyframes`
  0% { transform: scale(1); box-shadow: 0 10px 40px rgba(0,0,0,0.05); }
  50% { transform: scale(1.03); box-shadow: 0 20px 60px rgba(102, 126, 234, 0.3); border-color: #667eea; background-color: rgba(102, 126, 234, 0.05); }
  100% { transform: scale(1); box-shadow: 0 10px 40px rgba(0,0,0,0.05); }
`;

const HighlightedText = styled.span`
  background: #ffd54f;
  color: #0F0F0F;
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
    color: #0F0F0F;
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
    color: #777;
    font-weight: 600;
    text-transform: uppercase;
    margin-bottom: 2px;
  }
  .value {
    font-size: 14px;
    font-weight: 700;
    color: #222;
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
  background: #0F0F0F;
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
    border: 1px solid #D0D0D0;
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

const ModalActionFooter = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 24px;
`;

// Image Modal Styles
const ImageModalOverlay = styled(ModalOverlay)`
  //background: rgba(0, 0, 0, 0.95);
  z-index: 4000;
  cursor: pointer;
//   display: flex;
//   align-items: center;
//   justify-content: center;
`;

const ImageModalContent = styled.div`
  position: relative;
  width: 50%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  cursor: default;
`;

const FullImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
`;

const ImageNavButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.3s ease;
  z-index: 10;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.4);
    transform: translateY(-50%) scale(1.1);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  ${props => props.$left && 'left: 20px;'}
  ${props => props.$right && 'right: 20px;'}
`;

const ImageCloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.3s ease;
  z-index: 10;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.4);
    transform: scale(1.1);
  }
`;

const ImageCounter = styled.div`
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  z-index: 10;
`;

const ImageDots = styled.div`
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 10;
`;

const ImageDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.$active ? 'white' : 'rgba(255, 255, 255, 0.4)'};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.$active ? 'white' : 'rgba(255, 255, 255, 0.7)'};
    transform: scale(1.2);
  }
`;

// --- Sub-components ---

const TemplateCarousel = ({ photos, name, onImageClick }) => {
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

    const handleImageClick = (e) => {
        e.stopPropagation();
        if (onImageClick && photos && photos.length > 0) {
            onImageClick(photos, currentIndex);
        }
    };

    if (!photos || photos.length === 0) {
        return (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#E5E5E5' }}>
                <span style={{ color: '#777', fontSize: '12px' }}>No Image</span>
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
                style={{ maxWidth: '90%', maxHeight: '75%', objectFit: 'contain', cursor: 'pointer' }}
                onClick={handleImageClick}
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
                                    background: idx === currentIndex ? '#0F0F0F' : 'rgba(0,0,0,0.2)',
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
    const user = JSON.parse(localStorage.getItem('user') || '{}');
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

    // Alert & Confirmation Modal States
    const [alertModal, setAlertModal] = useState({ show: false, message: '', type: 'info' });
    const [confirmModal, setConfirmModal] = useState({ show: false, message: '', onConfirm: null });

    // Image Modal State
    const [imageModal, setImageModal] = useState({ show: false, photos: [], currentIndex: 0 });

    // Helper Functions for Alerts and Confirmations
    const showAlert = (message, type = 'info') => {
        setAlertModal({ show: true, message, type });
    };

    const showConfirm = (message, onConfirm) => {
        setConfirmModal({ show: true, message, onConfirm });
    };

    // Image Modal Handlers
    const handleImageClick = (photos, initialIndex) => {
        setImageModal({ show: true, photos, currentIndex: initialIndex });
    };

    const handleCloseImageModal = () => {
        setImageModal({ show: false, photos: [], currentIndex: 0 });
    };

    const handleNextImage = (e) => {
        if (e) e.stopPropagation();
        setImageModal(prev => ({
            ...prev,
            currentIndex: (prev.currentIndex + 1) % prev.photos.length
        }));
    };

    const handlePrevImage = (e) => {
        if (e) e.stopPropagation();
        setImageModal(prev => ({
            ...prev,
            currentIndex: (prev.currentIndex - 1 + prev.photos.length) % prev.photos.length
        }));
    };

    const handleDotClick = (index) => {
        setImageModal(prev => ({ ...prev, currentIndex: index }));
    };

    // Keyboard navigation for image modal
    useEffect(() => {
        if (!imageModal.show) return;

        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight') {
                setImageModal(prev => ({
                    ...prev,
                    currentIndex: (prev.currentIndex + 1) % prev.photos.length
                }));
            } else if (e.key === 'ArrowLeft') {
                setImageModal(prev => ({
                    ...prev,
                    currentIndex: (prev.currentIndex - 1 + prev.photos.length) % prev.photos.length
                }));
            } else if (e.key === 'Escape') {
                setImageModal({ show: false, photos: [], currentIndex: 0 });
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [imageModal.show, imageModal.photos.length]);
    const location = useLocation();
    const [highlightedId, setHighlightedId] = useState(null);
    const cardRefs = useRef({});
    const [growthMetrics, setGrowthMetrics] = useState({
        totalGrowth: 0,
        activeGrowth: 0,
        usageGrowth: 0,
        avgUsageGrowth: 0
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
        if (!file) return;

        // Validate file type (PNG only)
        if (file.type !== 'image/png') {
            showAlert(`Photo ${index + 1}: Only PNG format is allowed. Please upload a PNG image.`, 'error');
            e.target.value = ''; // Clear the input
            return;
        }

        // Validate image dimensions (3000x4000)
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(objectUrl);

            const width = img.width;
            const height = img.height;

            if (width !== 3000 || height !== 4000) {
                showAlert(
                    `Photo ${index + 1}: Image dimensions must be exactly 3000x4000 pixels. Current size: ${width}x${height}px. Please upload an image with the correct dimensions.`,
                    'error'
                );
                e.target.value = ''; // Clear the input
                return;
            }

            // Validation passed - add file to form data
            const newPhotos = [...formData.photos];
            newPhotos[index] = file;
            setFormData({
                ...formData,
                photos: newPhotos
            });
        };

        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            showAlert(`Photo ${index + 1}: Failed to load image. Please try again.`, 'error');
            e.target.value = ''; // Clear the input
        };

        img.src = objectUrl;
    };

    // Dynamic Template Names for filtering
    const templateOptions = Array.from(new Set(templates.map(t => t.name))).sort();
    const statusOptions = ['All Status', 'Active', 'Inactive'];

    const fetchData = useCallback(async () => {
        try {
            // setLoading(true);
            // Fetch templates and usage data in parallel
            const [templatesResponse, photosResponse] = await Promise.all([
                axiosData.get("/photomerge/templates"),
                axiosData.get(`upload/all?adminid=${user._id || user.id}`)
            ]);

            const rawTemplates = (templatesResponse.data || []).filter(t => t.adminid === user.id || t.adminid === user._id);
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
                    lastUsed: t.updatedDate ? formatDate(t.updatedDate, getStoredDateFormat()) : 'Never',
                    createdAt: t.createdDate ? formatDate(t.createdDate, getStoredDateFormat()) : formatDate(new Date(), getStoredDateFormat()),
                    overlayUrl: (t.templatePhotos && t.templatePhotos.length > 0)
                        ? `https://api.bilimbebrandactivations.com/api/upload/file/${t.templatePhotos[0]}`
                        : 'https://via.placeholder.com/150?text=No+Image',
                    accessType: t.accessType || 'photomerge',
                    photos: t.templatePhotos || []
                };
            });

            setTemplates(templateList);

            // Calculate growth metrics (compare last 30 days vs previous 30 days)
            const now = new Date();
            const last30Days = new Date(now);
            last30Days.setDate(now.getDate() - 30);
            const last60Days = new Date(now);
            last60Days.setDate(now.getDate() - 60);

            const recentPhotos = rawPhotos.filter(item => {
                const date = new Date(item.date || item.createdAt);
                return date >= last30Days && item.source === 'Photo Merge App';
            });

            const previousPhotos = rawPhotos.filter(item => {
                const date = new Date(item.date || item.createdAt);
                return date >= last60Days && date < last30Days && item.source === 'Photo Merge App';
            });

            const recentTemplateCount = new Set(recentPhotos.map(p => p.template_name || p.templatename || p.type)).size;
            const previousTemplateCount = new Set(previousPhotos.map(p => p.template_name || p.templatename || p.type)).size;

            // Calculate total templates: current vs previous period
            const currentTotalTemplates = templateList.length;
            const previousTotalTemplates = rawTemplates.filter(t => {
                const createdDate = new Date(t.createdDate || t.updatedDate || now);
                return createdDate < last30Days; // Templates created before last 30 days
            }).length;

            const recentActiveTemplates = rawTemplates.filter(t => {
                const updatedDate = new Date(t.updatedDate || t.createdDate);
                return t.status === 'active' && updatedDate >= last30Days;
            }).length;

            const previousActiveTemplates = rawTemplates.filter(t => {
                const updatedDate = new Date(t.updatedDate || t.createdDate);
                return t.status === 'active' && updatedDate >= last60Days && updatedDate < last30Days;
            }).length;

            const recentUsage = recentPhotos.length;
            const previousUsage = previousPhotos.length;

            const recentAvgUsage = recentTemplateCount > 0 ? recentUsage / recentTemplateCount : 0;
            const previousAvgUsage = previousTemplateCount > 0 ? previousUsage / previousTemplateCount : 0;

            const calculateGrowth = (current, previous) => {
                // Calculate the count change
                const countChange = current - previous;
                // Return the count change directly as percentage (count change = percentage value)
                // If change is +2, show 2%; if change is -5, show -5%
                return parseFloat(countChange.toFixed(1));
            };

            setGrowthMetrics({
                totalGrowth: calculateGrowth(currentTotalTemplates, previousTotalTemplates),
                activeGrowth: calculateGrowth(recentActiveTemplates || templateList.filter(t => t.status === 'active').length, previousActiveTemplates || 1),
                usageGrowth: calculateGrowth(recentUsage, previousUsage),
                avgUsageGrowth: calculateGrowth(recentAvgUsage, previousAvgUsage)
            });

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
        showConfirm("Are you sure you want to delete this template?", async () => {
            try {
                await axiosData.delete(`/photomerge/templates/${id}`);
                // Remove from local state
                const newList = templates.filter(t => t.id !== id);
                setTemplates(newList);
                showAlert("Template deleted successfully", 'success');
            } catch (error) {
                console.error("Error deleting template", error);
                showAlert("Failed to delete template", 'error');
            }
        });
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
            showAlert("Failed to update status", 'error');
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
                showAlert('Template updated successfully!', 'success');

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
                showAlert('Template created successfully!', 'success');
            }
            setShowModal(false);
        } catch (error) {
            console.error('Error saving template:', error);
            showAlert('Failed to save template: ' + (error.response?.data?.error || error.message), 'error');
        }
    };

    const exportToExcel = (dataToExport = templates) => {
        const csvContent = "Name,Category,Status,Usage,Last Used,Created At\n"
            + dataToExport.map(e => `${e.name},${e.category},${e.status},${e.usage},${e.lastUsed},${e.createdAt}`).join("\n");

        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Templates_Report_${formatDate(new Date(), getStoredDateFormat())}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Filtering Logic
    const filteredTemplates = templates.filter(tmpl => {
        const matchesSearch = tmpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tmpl.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All Templates' || tmpl.name === selectedCategory;
        const matchesStatus = selectedStatus === 'All Status' || tmpl.status.toLowerCase() === selectedStatus.toLowerCase();
        return matchesSearch && matchesCategory && matchesStatus;
    });

    const totalTrend = generateTrendPath(growthMetrics.totalGrowth);
    const activeTrend = generateTrendPath(growthMetrics.activeGrowth);
    const usageTrend = generateTrendPath(growthMetrics.usageGrowth);
    const avgUsageTrend = generateTrendPath(growthMetrics.avgUsageGrowth);

    const kpis = [
        {
            label: 'Total Templates',
            value: templates.length,
            icon: <Layers size={21} />,
            color: '#FEF3C7',
            text: '#F59E0B',
            trend: `${growthMetrics.totalGrowth >= 0 ? '+' : ''}${growthMetrics.totalGrowth}%`,
            isUp: growthMetrics.totalGrowth >= 0,
            points: totalTrend.points,
            endX: totalTrend.endX,
            endY: totalTrend.endY
        },
        {
            label: 'Active Templates',
            value: templates.filter(t => t.status === 'active').length,
            icon: <Activity size={21} />,
            color: '#D1FAE5',
            text: '#10B981',
            trend: `${growthMetrics.activeGrowth >= 0 ? '+' : ''}${growthMetrics.activeGrowth}%`,
            isUp: growthMetrics.activeGrowth >= 0,
            points: activeTrend.points,
            endX: activeTrend.endX,
            endY: activeTrend.endY
        },
        {
            label: 'Total Usage',
            value: templates.reduce((acc, curr) => acc + curr.usage, 0).toLocaleString(),
            icon: <BarChart2 size={21} />,
            color: '#DBEAFE',
            text: '#3B82F6',
            trend: `${growthMetrics.usageGrowth >= 0 ? '+' : ''}${growthMetrics.usageGrowth}%`,
            isUp: growthMetrics.usageGrowth >= 0,
            points: usageTrend.points,
            endX: usageTrend.endX,
            endY: usageTrend.endY
        },
        {
            label: 'Avg Usage',
            value: templates.length > 0 ? (templates.reduce((acc, curr) => acc + curr.usage, 0) / templates.length).toFixed(0) : 0,
            icon: <Activity size={21} />,
            color: '#E8D5E0',
            text: '#7A1B95',
            trend: `${growthMetrics.avgUsageGrowth >= 0 ? '+' : ''}${growthMetrics.avgUsageGrowth}%`,
            isUp: growthMetrics.avgUsageGrowth >= 0,
            points: avgUsageTrend.points,
            endX: avgUsageTrend.endX,
            endY: avgUsageTrend.endY
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
                                <TrendIndicator $color={kpi.isUp ? '#10B981' : '#EF4444'}>
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
                                {['All Templates', ...templateOptions].map(c => (
                                    <div
                                        key={c}
                                        onClick={() => { setSelectedCategory(c); setShowCategoryDropdown(false); }}
                                        style={{
                                            padding: '10px 16px', borderRadius: '8px', cursor: 'pointer',
                                            fontSize: '14px', background: selectedCategory === c ? '#E5E5E5' : 'transparent',
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
                {filteredTemplates.length === 0 ? (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        padding: '80px 20px',
                        flexDirection: 'column',
                        alignItems: 'center',
                        background: '#FFF',
                        borderRadius: '32px',
                        border: '1px solid #F0F0F0',
                        gridColumn: '1 / -1'
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
                            <Layers size={40} />
                        </div>
                        <div style={{ fontSize: '20px', fontWeight: 800, color: '#111827', marginBottom: '8px' }}>
                            No templates found
                        </div>
                        <div style={{ color: '#6B7280', textAlign: 'center', maxWidth: '400px', fontSize: '15px', lineHeight: '1.6' }}>
                            {searchQuery || selectedCategory !== 'All Templates' || selectedStatus !== 'All Status'
                                ? `We couldn't find any templates matching your current search or filter criteria.`
                                : "No templates have been created yet. Click 'Create New Template' to get started."}
                        </div>
                        {(searchQuery || selectedCategory !== 'All Templates' || selectedStatus !== 'All Status') && (
                            <Button
                                style={{ marginTop: '24px', background: '#F3F4F6', color: '#374151' }}
                                onClick={() => {
                                    setSearchQuery('');
                                    setSelectedCategory('All Templates');
                                    setSelectedStatus('All Status');
                                }}
                            >
                                Reset All Filters
                            </Button>
                        )}
                    </div>
                ) : filteredTemplates.map(tmpl => (
                    <TemplateCard
                        key={tmpl.id}
                        ref={el => cardRefs.current[tmpl.id] = el}
                        $selected={selectedIds.includes(tmpl.id)}
                        $highlighted={tmpl.id === highlightedId}
                    >
                        <TemplatePreview $active={tmpl.status === 'active'} onClick={() => handleEdit(tmpl)}>
                            <TemplateCarousel photos={tmpl.photos} name={tmpl.name} onImageClick={handleImageClick} />
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
                                selectedIds.forEach(id => handleToggleStatus(id));
                                setSelectedIds([]);
                            }}>Activate</Button>
                            <Button $variant="primary" onClick={() => {
                                const newList = templates.map(t => selectedIds.includes(t.id) ? { ...t, status: 'inactive' } : t);
                                saveTemplates(newList);
                                selectedIds.forEach(id => handleToggleStatus(id));
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
                                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
                                        <strong>Requirements:</strong> PNG format only, dimensions must be exactly 3000x4000 pixels
                                    </div>
                                    <div style={{ display: 'grid', gap: '8px', gridTemplateColumns: '1fr 1fr' }}>
                                        {[...Array(templateCount)].map((_, index) => (
                                            <div key={index}>
                                                <label style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}>
                                                    Photo {index + 1}
                                                    {typeof formData.photos[index] === 'string' && <span style={{ color: 'green', marginLeft: '5px' }}>(Existing)</span>}
                                                    {formData.photos[index] && typeof formData.photos[index] !== 'string' && (
                                                        <span style={{ color: '#25D366', marginLeft: '5px' }}>✓</span>
                                                    )}
                                                </label>
                                                <input
                                                    accept="image/png"
                                                    type="file"
                                                    onChange={handleFileChange(index)}
                                                    style={{ padding: '8px', width: '100%' }}
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
                        <ModalActionFooter>
                            <Button
                                $variant="primary"
                                onClick={() => setAlertModal({ show: false, message: '', type: 'info' })}
                            >
                                OK
                            </Button>
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
                        <ModalActionFooter>
                            <Button
                                onClick={() => setConfirmModal({ show: false, message: '', onConfirm: null })}
                            >
                                Cancel
                            </Button>
                            <Button
                                $variant="primary"
                                onClick={() => {
                                    if (confirmModal.onConfirm) {
                                        confirmModal.onConfirm();
                                    }
                                    setConfirmModal({ show: false, message: '', onConfirm: null });
                                }}
                            >
                                Confirm
                            </Button>
                        </ModalActionFooter>
                    </ConfirmModalContent>
                </AlertModalOverlay>
            )}

            {/* Image Modal */}
            {imageModal.show && imageModal.photos.length > 0 && (
                <ImageModalOverlay onClick={handleCloseImageModal}>
                    <ImageModalContent onClick={e => e.stopPropagation()}>
                        <ImageCloseButton onClick={handleCloseImageModal}>
                            <X size={20} />
                        </ImageCloseButton>

                        {imageModal.photos.length > 1 && (
                            <ImageNavButton
                                $left
                                onClick={handlePrevImage}
                                disabled={imageModal.photos.length <= 1}
                            >
                                <ChevronLeft size={24} />
                            </ImageNavButton>
                        )}

                        <FullImage
                            src={`https://api.bilimbebrandactivations.com/api/upload/file/${imageModal.photos[imageModal.currentIndex]}`}
                            alt={`Template image ${imageModal.currentIndex + 1}`}
                        />

                        {imageModal.photos.length > 1 && (
                            <ImageNavButton
                                $right
                                onClick={handleNextImage}
                                disabled={imageModal.photos.length <= 1}
                            >
                                <ChevronRight size={24} />
                            </ImageNavButton>
                        )}

                        {imageModal.photos.length > 1 && (
                            <>
                                <ImageCounter>
                                    {imageModal.currentIndex + 1} / {imageModal.photos.length}
                                </ImageCounter>
                                <ImageDots>
                                    {imageModal.photos.map((_, index) => (
                                        <ImageDot
                                            key={index}
                                            $active={index === imageModal.currentIndex}
                                            onClick={() => handleDotClick(index)}
                                        />
                                    ))}
                                </ImageDots>
                            </>
                        )}
                    </ImageModalContent>
                </ImageModalOverlay>
            )}
        </PageContainer>
    );
};

export default Templates;
