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
    XCircle,
    Play,
    Pause,
    Loader
} from 'react-feather';
// import Card from '../Components/Card'; // Unused
import Pagination from '../Components/Pagination';
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

const FullVideo = styled.video`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
`;

const spinAnimation = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const SpinningLoader = styled(Loader)`
  animation: ${spinAnimation} 1s linear infinite;
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

const TemplateCarousel = ({ photos, name, onImageClick, onVideoClick, video1Id, video3Id, mergedVideoId }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = useRef(null);
    const axiosData = useAxios();
    const baseURL = axiosData.defaults.baseURL || 'https://api.bilimbebrandactivations.com/api/';

    // Determine if this is a video template
    const isVideoTemplate = !!(video1Id || video3Id || mergedVideoId);
    
    // For video templates, collect all available videos (video1, video3, mergedVideoId)
    // Priority: mergedVideoId, video3Id, video1Id
    const videoItemsWithLabels = [];
    if (mergedVideoId) videoItemsWithLabels.push({ id: mergedVideoId, label: 'Merged Video' });
    if (video3Id) videoItemsWithLabels.push({ id: video3Id, label: 'End Video (Video 3)' });
    if (video1Id) videoItemsWithLabels.push({ id: video1Id, label: 'Start Video (Video 1)' });
    
    const items = isVideoTemplate ? videoItemsWithLabels.map(v => v.id) : (photos || []);
    const hasMultipleItems = items.length > 1;

    // Reset video playing state when index changes
    useEffect(() => {
        if (isVideoTemplate && videoRef.current) {
            setIsPlaying(false);
            videoRef.current.pause();
            videoRef.current.load();
        }
    }, [currentIndex, isVideoTemplate]);

    const handleNext = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % items.length);
    };

    const handlePrev = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    };

    const handleDotClick = (e, index) => {
        e.stopPropagation();
        setCurrentIndex(index);
    };

    const handleImageClick = (e) => {
        e.stopPropagation();
        if (onImageClick && items && items.length > 0 && !isVideoTemplate) {
            onImageClick(items, currentIndex);
        }
    };

    const handleVideoClick = (e) => {
        e.stopPropagation();
        // Pass video IDs and current index to parent for modal
        if (isVideoTemplate && items.length > 0 && onVideoClick) {
            onVideoClick(items, currentIndex);
        }
    };

    const togglePlay = (e) => {
        e.stopPropagation();
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    if (!items || items.length === 0) {
        return (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#E5E5E5' }}>
                <span style={{ color: '#777', fontSize: '12px' }}>No {isVideoTemplate ? 'Video' : 'Image'}</span>
            </div>
        );
    }

    // For video templates
    if (isVideoTemplate) {
        const currentVideoId = items[currentIndex];
        
        // If no valid video ID, show placeholder
        if (!currentVideoId) {
            return (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#E5E5E5' }}>
                    <span style={{ color: '#777', fontSize: '12px' }}>No Video</span>
                </div>
            );
        }
        
        const videoUrl = `${baseURL}upload/file/${currentVideoId}`;
        const videoLabel = videoItemsWithLabels.find(v => v.id === currentVideoId)?.label || 'Video';
        
        return (
            <div 
                style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', cursor: 'pointer' }}
                onClick={handleVideoClick}
            >
                <video
                    key={currentIndex}
                    ref={videoRef}
                    src={videoUrl}
                    style={{ maxWidth: '90%', maxHeight: '75%', objectFit: 'contain', pointerEvents: 'none' }}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onError={(e) => {
                        console.error('Video load error:', e);
                        e.target.style.display = 'none';
                    }}
                    loop
                    muted
                />
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        togglePlay(e);
                    }}
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: 'rgba(255,255,255,0.9)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '48px',
                        height: '48px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        zIndex: 3,
                        transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#fff'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.9)'}
                >
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>
                
                {/* Navigation buttons for multiple videos */}
                {hasMultipleItems && (
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
                            {items.map((_, idx) => (
                                <div
                                    key={idx}
                                    onClick={(e) => handleDotClick(e, idx)}
                                    style={{
                                        width: '8px', height: '8px', borderRadius: '50%',
                                        background: idx === currentIndex ? '#fff' : 'rgba(255,255,255,0.4)',
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
    }

    // For photo templates (original logic)
    const currentPhotoUrl = `${baseURL}upload/file/${items[currentIndex]}`;

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img
                key={currentIndex}
                src={currentPhotoUrl}
                alt={`${name} - ${currentIndex + 1}`}
                style={{ maxWidth: '90%', maxHeight: '75%', objectFit: 'contain', cursor: 'pointer' }}
                onClick={handleImageClick}
            />

            {hasMultipleItems && (
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
                        {items.map((_, idx) => (
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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All Templates');
    const [selectedSource, setSelectedSource] = useState('All Sources');
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 25,
        total: 0,
        totalPages: 0
    });
    const [selectedStatus, setSelectedStatus] = useState('All Status');
    const [selectedIds, setSelectedIds] = useState([]);

    // Dropdown visibility states
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [showSourceDropdown, setShowSourceDropdown] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);

    const categoryRef = useRef(null);
    const sourceRef = useRef(null);
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

    // Image/Video Modal State
    const [imageModal, setImageModal] = useState({ show: false, photos: [], videos: [], currentIndex: 0, isVideo: false });

    // Helper Functions for Alerts and Confirmations
    const showAlert = (message, type = 'info') => {
        setAlertModal({ show: true, message, type });
    };

    const showConfirm = (message, onConfirm) => {
        setConfirmModal({ show: true, message, onConfirm });
    };

    // Image Modal Handlers
    const handleImageClick = (photos, initialIndex) => {
        setImageModal({ show: true, photos, videos: [], currentIndex: initialIndex, isVideo: false });
    };

    const handleVideoClick = (videos, initialIndex) => {
        setImageModal({ show: true, photos: [], videos, currentIndex: initialIndex, isVideo: true });
    };

    const handleCloseImageModal = () => {
        setImageModal({ show: false, photos: [], videos: [], currentIndex: 0, isVideo: false });
    };

    const handleNextImage = (e) => {
        if (e) e.stopPropagation();
        const items = imageModal.isVideo ? imageModal.videos : imageModal.photos;
        setImageModal(prev => ({
            ...prev,
            currentIndex: (prev.currentIndex + 1) % items.length
        }));
    };

    const handlePrevImage = (e) => {
        if (e) e.stopPropagation();
        const items = imageModal.isVideo ? imageModal.videos : imageModal.photos;
        setImageModal(prev => ({
            ...prev,
            currentIndex: (prev.currentIndex - 1 + items.length) % items.length
        }));
    };

    const handleDotClick = (index) => {
        setImageModal(prev => ({ ...prev, currentIndex: index }));
    };

    // Keyboard navigation for image/video modal
    useEffect(() => {
        if (!imageModal.show) return;

        const handleKeyDown = (e) => {
            const items = imageModal.isVideo ? imageModal.videos : imageModal.photos;
            if (e.key === 'ArrowRight') {
                setImageModal(prev => ({
                    ...prev,
                    currentIndex: (prev.currentIndex + 1) % items.length
                }));
            } else if (e.key === 'ArrowLeft') {
                setImageModal(prev => ({
                    ...prev,
                    currentIndex: (prev.currentIndex - 1 + items.length) % items.length
                }));
            } else if (e.key === 'Escape') {
                setImageModal({ show: false, photos: [], videos: [], currentIndex: 0, isVideo: false });
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [imageModal.show, imageModal.photos.length, imageModal.videos.length, imageModal.isVideo]);
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
        photos: [],
        // Video merge fields
        date: '',
        clientname: '',
        brandname: '',
        congratsOption: false,
        video1TextOption: false,
        video2TextOption: false,
        video3TextOption: false,
        video1: null, // Start video
        video2: null,
        video3: null, // End video
        audio: null,
        // Animation fields
        hasAnimation: false,
        gif: null,
        photo: null
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

    const handleVideoFileChange = (fieldName) => (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (fieldName === 'gif') {
            if (!file.type.includes('gif')) {
                showAlert('Please upload a valid GIF file for animation.', 'error');
                e.target.value = '';
                return;
            }
        } else if (fieldName === 'photo') {
            if (!file.type.startsWith('image/')) {
                showAlert('Please upload a valid image file.', 'error');
                e.target.value = '';
                return;
            }
        } else if (!file.type.startsWith('video/') && fieldName !== 'audio' && !file.type.startsWith('audio/')) {
            showAlert(`${fieldName}: Please upload a valid video or audio file.`, 'error');
            e.target.value = '';
            return;
        }

        setFormData({
            ...formData,
            [fieldName]: file
        });
    };

    // Dynamic Template Names for filtering
    const templateOptions = Array.from(new Set(templates.map(t => t.name))).sort();
    const statusOptions = ['All Status', 'Active', 'Inactive'];

    const fetchData = useCallback(async () => {
        try {
            // setLoading(true);
            // Fetch templates and usage data in parallel with pagination
            const [templatesResponse, photosResponse] = await Promise.all([
                axiosData.get(`/photomerge/templates?adminid=${user._id || user.id}&page=${pagination.page}&limit=${pagination.limit}`),
                axiosData.get(`upload/all?adminid=${user._id || user.id}&page=1&limit=2000`) // Optimized: Fetch recent items for usage calculation
            ]);

            // Handle paginated or non-paginated responses
            const rawTemplatesArray = Array.isArray(templatesResponse.data?.data)
                ? templatesResponse.data.data
                : (Array.isArray(templatesResponse.data) ? templatesResponse.data : []);
            const rawTemplates = rawTemplatesArray.filter(t => t.adminid === user.id || t.adminid === user._id);
            
            const rawPhotosArray = Array.isArray(photosResponse.data?.data)
                ? photosResponse.data.data
                : (Array.isArray(photosResponse.data) ? photosResponse.data : []);
            const rawPhotos = rawPhotosArray;
            
            // Update pagination if available
            if (templatesResponse.data?.pagination) {
                setPagination(prev => ({
                    ...prev,
                    total: templatesResponse.data.pagination.total,
                    totalPages: templatesResponse.data.pagination.totalPages
                }));
            }

            // Calculate usage counts from photo creations and track sources
            const usageCounts = {};
            const templateSources = {}; // Track which source uses each template
            
            rawPhotos
                .filter(item => item.source === 'Photo Merge App' || item.source === 'Video Merge App')
                .forEach(item => {
                    const templateName = item.template_name || item.templatename || item.type;
                    if (templateName) {
                        usageCounts[templateName] = (usageCounts[templateName] || 0) + 1;
                        
                        // Track sources for each template
                        if (!templateSources[templateName]) {
                            templateSources[templateName] = new Set();
                        }
                        templateSources[templateName].add(item.source);
                    }
                });

            // Map backend data to frontend structure with real usage and sources
            let templateList = rawTemplates.map(t => {
                const name = t.templatename;
                // Determine sources for this template
                const sources = templateSources[name] ? Array.from(templateSources[name]) : [];
                // If no usage, determine source from accessType
                const defaultSource = t.accessType === 'videomerge' ? 'Video Merge App' : 'Photo Merge App';
                const templateSource = sources.length > 0 ? sources[0] : defaultSource;
                
                return {
                    id: t._id,
                    name: name,
                    category: t.accessType === 'videomerge' ? 'Video Merge' : 'Photo Merge',
                    status: t.status || 'active',
                    usage: usageCounts[name] || 0, // Using real aggregated usage
                    source: templateSource, // Track which source uses this template
                    sources: sources.length > 0 ? sources : [defaultSource], // All sources that use this template
                    lastUsed: t.updatedDate ? formatDate(t.updatedDate, getStoredDateFormat()) : 'Never',
                    createdAt: t.createdDate ? formatDate(t.createdDate, getStoredDateFormat()) : formatDate(new Date(), getStoredDateFormat()),
                    overlayUrl: (t.templatePhotos && t.templatePhotos.length > 0)
                        ? `${axiosData.defaults.baseURL || 'https://api.bilimbebrandactivations.com/api/'}upload/file/${t.templatePhotos[0]}`
                        : (t.video1Id ? `${axiosData.defaults.baseURL || 'https://api.bilimbebrandactivations.com/api/'}upload/file/${t.video1Id}` : 'https://via.placeholder.com/150?text=No+Image'),
                    accessType: t.accessType || 'photomerge',
                    photos: t.templatePhotos || [],
                    // Video fields for video merge templates
                    video1Id: t.video1Id || null,
                    video3Id: t.video3Id || null,
                    audioId: t.audioId || null,
                    gifId: t.gifId || null,
                    mergedVideoId: t.mergedVideoId || null,
                    // Video merge fields
                    date: t.date || '',
                    type: t.type || '',
                    faceSwap: t.faceSwap || '',
                    videosMergeOption: t.videosMergeOption || '',
                    clientname: t.clientname || '',
                    brandname: t.brandname || '',
                    congratsOption: t.congratsOption || '',
                    video1TextOption: t.video1TextOption || '',
                    video2TextOption: t.video2TextOption || '',
                    video3TextOption: t.video3TextOption || '',
                    approved: t.approved || '',
                    // Animation fields
                    hasAnimation: t.hasAnimation || false
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
                return date >= last30Days && (item.source === 'Photo Merge App' || item.source === 'Video Merge App');
            });

            const previousPhotos = rawPhotos.filter(item => {
                const date = new Date(item.date || item.createdAt);
                return date >= last60Days && date < last30Days && (item.source === 'Photo Merge App' || item.source === 'Video Merge App');
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
    }, [axiosData, user._id, user.id, pagination.page, pagination.limit]);

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
            if (sourceRef.current && !sourceRef.current.contains(event.target)) setShowSourceDropdown(false);
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
            photos: [],
            // Video merge fields
            date: '',
            clientname: '',
            brandname: '',
            congratsOption: false,
            video1TextOption: false,
            video2TextOption: false,
            video3TextOption: false,
            video1: null, // Start video
            video2: null, // Middle video (from mobile app)
            video3: null, // End video
            audio: null,
            // Animation fields
            hasAnimation: false,
            gif: null
        });
        setShowModal(true);
    };

    const handleEdit = (tmpl) => {
        setEditingTemplate(tmpl);
        setFormData({
            name: tmpl.name,
            status: tmpl.status,
            accessType: tmpl.accessType || 'photomerge',
            photos: tmpl.photos || [],
            // Video merge fields (if editing a videomerge template)
            date: tmpl.date || '',
            clientname: tmpl.clientname || '',
            brandname: tmpl.brandname || '',
            congratsOption: tmpl.congratsOption === true || tmpl.congratsOption === 'true' || tmpl.congratsOption === '1',
            video1TextOption: tmpl.video1TextOption === true || tmpl.video1TextOption === 'true' || tmpl.video1TextOption === '1',
            video2TextOption: tmpl.video2TextOption === true || tmpl.video2TextOption === 'true' || tmpl.video2TextOption === '1',
            video3TextOption: tmpl.video3TextOption === true || tmpl.video3TextOption === 'true' || tmpl.video3TextOption === '1',
            // Store existing IDs as strings (like photos), null if not set
            video1: tmpl.video1Id || null,
            video2: null, // Middle video (from mobile app, not stored in template)
            video3: tmpl.video3Id || null,
            audio: tmpl.audioId || null,
            // Animation fields
            hasAnimation: tmpl.hasAnimation === true || tmpl.hasAnimation === 'true' || tmpl.hasAnimation === '1',
            gif: tmpl.gifId || null
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
        setIsSubmitting(true);

        try {
            if (editingTemplate) {
                const uploadData = new FormData();
                uploadData.append('templatename', formData.name);
                uploadData.append('accessType', formData.accessType);
                uploadData.append('status', formData.status);

                if (formData.accessType === 'videomerge') {
                    // Append video merge fields for edit
                    if (formData.name) uploadData.append('name', formData.name);
                    if (formData.date) uploadData.append('date', formData.date);
                    if (formData.clientname) uploadData.append('clientname', formData.clientname);
                    if (formData.brandname) uploadData.append('brandname', formData.brandname);
                    uploadData.append('congratsOption', formData.congratsOption);
                    uploadData.append('video1TextOption', formData.video1TextOption);
                    uploadData.append('video2TextOption', formData.video2TextOption);
                    uploadData.append('video3TextOption', formData.video3TextOption);
                    uploadData.append('hasAnimation', formData.hasAnimation);

                    // Append video files only if new ones are uploaded (File objects)
                    // If they are strings, they are existing IDs and will be kept by backend
                    // Append video files (video2 will come from mobile app)
                    if (formData.video1 && formData.video1 instanceof File) {
                        uploadData.append('video1', formData.video1);
                    }
                    if (formData.video3 && formData.video3 instanceof File) {
                        uploadData.append('video3', formData.video3);
                    }
                    if (formData.audio && formData.audio instanceof File) {
                        uploadData.append('audio', formData.audio);
                    }
                    
                    // Append animation file if animation is enabled and it's a new file
                    if (formData.hasAnimation && formData.gif && formData.gif instanceof File) {
                        uploadData.append('gif', formData.gif);
                    }
                } else {
                    // Hybrid Update Logic: Construct photoOrder for photomerge
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
                }

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

                if (formData.accessType === 'videomerge') {
                    // Append video merge fields
                    // Note: 'name' field for video merge uses the template name
                    if (formData.name) uploadData.append('name', formData.name);
                    if (formData.date) uploadData.append('date', formData.date);
                    if (formData.clientname) uploadData.append('clientname', formData.clientname);
                    if (formData.brandname) uploadData.append('brandname', formData.brandname);
                    uploadData.append('congratsOption', formData.congratsOption);
                    uploadData.append('video1TextOption', formData.video1TextOption);
                    uploadData.append('video2TextOption', formData.video2TextOption);
                    uploadData.append('video3TextOption', formData.video3TextOption);
                    uploadData.append('hasAnimation', formData.hasAnimation);

                    // Append video files (video2 will come from mobile app)
                    if (formData.video1) uploadData.append('video1', formData.video1);
                    if (formData.video3) uploadData.append('video3', formData.video3);
                    if (formData.audio) uploadData.append('audio', formData.audio);
                    
                    // Append animation file if animation is enabled
                    if (formData.hasAnimation && formData.gif) {
                        uploadData.append('gif', formData.gif);
                    }
                } else {
                    // Append photos for photomerge
                    formData.photos.forEach((photo, index) => {
                        if (photo instanceof File) {
                            uploadData.append('photos', photo);
                        }
                    });
                }

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
        } finally {
            setIsSubmitting(false);
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
        // Filter by source: check if template's sources include the selected source
        const matchesSource = selectedSource === 'All Sources' || 
            (tmpl.sources && tmpl.sources.includes(selectedSource)) ||
            (tmpl.source === selectedSource);
        return matchesSearch && matchesCategory && matchesStatus && matchesSource;
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
                    <Dropdown ref={sourceRef}>
                        <DropdownBtn onClick={() => setShowSourceDropdown(!showSourceDropdown)}>
                            <Filter size={16} />
                            {selectedSource}
                            <ChevronDown size={14} />
                        </DropdownBtn>
                        {showSourceDropdown && (
                            <div style={{
                                position: 'absolute', top: '100%', left: 0, width: '200px',
                                background: 'white', border: '1px solid #EEE', borderRadius: '12px',
                                boxShadow: '0 10px 20px rgba(0,0,0,0.1)', zIndex: 100, padding: '8px',
                                marginTop: '8px'
                            }}>
                                {['All Sources', 'Photo Merge App', 'Video Merge App'].map(s => (
                                    <div
                                        key={s}
                                        onClick={() => { setSelectedSource(s); setShowSourceDropdown(false); }}
                                        style={{
                                            padding: '10px 16px', borderRadius: '8px', cursor: 'pointer',
                                            fontSize: '14px', background: selectedSource === s ? '#E5E5E5' : 'transparent',
                                            fontWeight: selectedSource === s ? 600 : 400
                                        }}
                                    >
                                        {s}
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
                        {(searchQuery || selectedCategory !== 'All Templates' || selectedSource !== 'All Sources' || selectedStatus !== 'All Status') && (
                            <Button
                                style={{ marginTop: '24px', background: '#F3F4F6', color: '#374151' }}
                                onClick={() => {
                                    setSearchQuery('');
                                    setSelectedCategory('All Templates');
                                    setSelectedSource('All Sources');
                                    setSelectedStatus('All Status');
                                    setSearchQuery('');
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
                            <TemplateCarousel 
                                photos={tmpl.photos} 
                                name={tmpl.name} 
                                onImageClick={handleImageClick}
                                onVideoClick={handleVideoClick}
                                video1Id={tmpl.video1Id}
                                video3Id={tmpl.video3Id}
                                mergedVideoId={tmpl.mergedVideoId}
                            />
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
            
            {pagination.total > 0 && pagination.totalPages > 1 && (
                <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    total={pagination.total}
                    limit={pagination.limit}
                    onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
                    onLimitChange={(limit) => setPagination(prev => ({ ...prev, limit, page: 1 }))}
                />
            )}

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
                                            {(userAccess.length === 0 || userAccess.includes('videomerge')) && <option value="videomerge">Video Merge</option>}
                                            {(userAccess.length === 0 || userAccess.includes('videovideovideo')) && <option value="videovideovideo">Video + Video + Video</option>}
                                        </select>
                                    </FormGroup>
                                </FormRow>

                                {formData.accessType === 'videomerge' ? (
                                    <>
                                        {/* Basic Information Section */}
                                        <div style={{ 
                                            marginBottom: '28px',
                                            paddingBottom: '24px',
                                            borderBottom: '1px solid #E5E5E5'
                                        }}>
                                            <h3 style={{ 
                                                fontSize: '15px', 
                                                fontWeight: 600, 
                                                color: '#1A1A1A', 
                                                marginBottom: '20px',
                                                letterSpacing: '0.3px'
                                            }}>
                                                Basic Information
                                            </h3>
                                            <FormRow>
                                                <FormGroup>
                                                    <label>Date</label>
                                                    <input
                                                        type="date"
                                                        value={formData.date || ''}
                                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                                    />
                                                </FormGroup>
                                                <FormGroup>
                                                    <label>Client Name</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Enter client name"
                                                        value={formData.clientname || ''}
                                                        onChange={e => setFormData({ ...formData, clientname: e.target.value })}
                                                    />
                                                </FormGroup>
                                            </FormRow>
                                            <FormRow>
                                                <FormGroup>
                                                    <label>Brand Name</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Enter brand name"
                                                        value={formData.brandname || ''}
                                                        onChange={e => setFormData({ ...formData, brandname: e.target.value })}
                                                    />
                                                </FormGroup>
                                                <FormGroup style={{ marginBottom: 0 }}></FormGroup>
                                            </FormRow>
                                        </div>

                                        {/* Video Options Section */}
                                        <div style={{ 
                                            marginBottom: '28px',
                                            paddingBottom: '24px',
                                            borderBottom: '1px solid #E5E5E5'
                                        }}>
                                            <h3 style={{ 
                                                fontSize: '15px', 
                                                fontWeight: 600, 
                                                color: '#1A1A1A', 
                                                marginBottom: '16px',
                                                letterSpacing: '0.3px'
                                            }}>
                                                Video Options
                                            </h3>
                                            <div style={{ 
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '14px',
                                                padding: '20px',
                                                background: 'linear-gradient(135deg, #FAFAFA 0%, #F5F5F5 100%)',
                                                borderRadius: '16px',
                                                border: '1px solid #E8E8E8'
                                            }}>
                                                <label
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '12px',
                                                        cursor: 'pointer',
                                                        fontSize: '14px',
                                                        fontWeight: 500,
                                                        color: '#333',
                                                        padding: '12px 16px',
                                                        borderRadius: '10px',
                                                        background: 'white',
                                                        border: '1px solid #E0E0E0',
                                                        transition: 'all 0.2s ease',
                                                        userSelect: 'none',
                                                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = '#F8F8F8';
                                                        e.currentTarget.style.borderColor = '#D0D0D0';
                                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                                        e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = 'white';
                                                        e.currentTarget.style.borderColor = '#E0E0E0';
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                                                    }}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.congratsOption || false}
                                                        onChange={e => setFormData({ ...formData, congratsOption: e.target.checked })}
                                                        style={{ 
                                                            height: '22px', 
                                                            width: '22px', 
                                                            cursor: 'pointer',
                                                            accentColor: '#1A1A1A',
                                                            flexShrink: 0
                                                        }}
                                                    />
                                                    <span style={{ flex: 1 }}>Enable Congratulations End Text</span>
                                                </label>
                                                <label
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '12px',
                                                        cursor: 'pointer',
                                                        fontSize: '14px',
                                                        fontWeight: 500,
                                                        color: '#333',
                                                        padding: '12px 16px',
                                                        borderRadius: '10px',
                                                        background: 'white',
                                                        border: '1px solid #E0E0E0',
                                                        transition: 'all 0.2s ease',
                                                        userSelect: 'none',
                                                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = '#F8F8F8';
                                                        e.currentTarget.style.borderColor = '#D0D0D0';
                                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                                        e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = 'white';
                                                        e.currentTarget.style.borderColor = '#E0E0E0';
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                                                    }}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.video1TextOption || false}
                                                        onChange={e => setFormData({ ...formData, video1TextOption: e.target.checked })}
                                                        style={{ 
                                                            height: '22px', 
                                                            width: '22px', 
                                                            cursor: 'pointer',
                                                            accentColor: '#1A1A1A',
                                                            flexShrink: 0
                                                        }}
                                                    />
                                                    <span style={{ flex: 1 }}>Enable overlay text for video 1</span>
                                                </label>
                                                <label
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '12px',
                                                        cursor: 'pointer',
                                                        fontSize: '14px',
                                                        fontWeight: 500,
                                                        color: '#333',
                                                        padding: '12px 16px',
                                                        borderRadius: '10px',
                                                        background: 'white',
                                                        border: '1px solid #E0E0E0',
                                                        transition: 'all 0.2s ease',
                                                        userSelect: 'none',
                                                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = '#F8F8F8';
                                                        e.currentTarget.style.borderColor = '#D0D0D0';
                                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                                        e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = 'white';
                                                        e.currentTarget.style.borderColor = '#E0E0E0';
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                                                    }}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.video2TextOption || false}
                                                        onChange={e => setFormData({ ...formData, video2TextOption: e.target.checked })}
                                                        style={{ 
                                                            height: '22px', 
                                                            width: '22px', 
                                                            cursor: 'pointer',
                                                            accentColor: '#1A1A1A',
                                                            flexShrink: 0
                                                        }}
                                                    />
                                                    <span style={{ flex: 1 }}>Enable overlay text for video 2</span>
                                                </label>
                                                <label
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '12px',
                                                        cursor: 'pointer',
                                                        fontSize: '14px',
                                                        fontWeight: 500,
                                                        color: '#333',
                                                        padding: '12px 16px',
                                                        borderRadius: '10px',
                                                        background: 'white',
                                                        border: '1px solid #E0E0E0',
                                                        transition: 'all 0.2s ease',
                                                        userSelect: 'none',
                                                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = '#F8F8F8';
                                                        e.currentTarget.style.borderColor = '#D0D0D0';
                                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                                        e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = 'white';
                                                        e.currentTarget.style.borderColor = '#E0E0E0';
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                                                    }}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.video3TextOption || false}
                                                        onChange={e => setFormData({ ...formData, video3TextOption: e.target.checked })}
                                                        style={{ 
                                                            height: '22px', 
                                                            width: '22px', 
                                                            cursor: 'pointer',
                                                            accentColor: '#1A1A1A',
                                                            flexShrink: 0
                                                        }}
                                                    />
                                                    <span style={{ flex: 1 }}>Enable overlay text for video 3</span>
                                                </label>
                                            </div>
                                        </div>

                                        {/* Video Files Section */}
                                        <div style={{ marginBottom: '28px' }}>
                                            <h3 style={{ 
                                                fontSize: '15px', 
                                                fontWeight: 600, 
                                                color: '#1A1A1A', 
                                                marginBottom: '16px',
                                                letterSpacing: '0.3px'
                                            }}>
                                                Video Files
                                            </h3>
                                            <div style={{ 
                                                display: 'grid', 
                                                gap: '16px', 
                                                gridTemplateColumns: '1fr 1fr' 
                                            }}>
                                                <FormGroup style={{ marginBottom: 0 }}>
                                                    <label style={{ 
                                                        fontSize: '13px', 
                                                        fontWeight: 600, 
                                                        color: '#444', 
                                                        marginBottom: '10px', 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        gap: '8px'
                                                    }}>
                                                        <span>Start Video (Video 1)</span>
                                                        {typeof formData.video1 === 'string' && formData.video1 && (
                                                            <span style={{ color: 'green', marginLeft: '5px' }}>(Existing)</span>
                                                        )}
                                                        {formData.video1 && typeof formData.video1 !== 'string' && (
                                                            <span style={{ 
                                                                color: '#10B981', 
                                                                fontSize: '14px', 
                                                                fontWeight: 600,
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '4px'
                                                            }}>
                                                                <CheckCircle size={16} />
                                                                Uploaded
                                                            </span>
                                                        )}
                                                    </label>
                                                    <input
                                                        accept="video/*"
                                                        type="file"
                                                        onChange={handleVideoFileChange('video1')}
                                                        style={{ 
                                                            padding: '12px 16px',
                                                            borderRadius: '12px',
                                                            border: '1px solid #D0D0D0',
                                                            fontSize: '14px',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s ease',
                                                            background: (formData.video1 && typeof formData.video1 !== 'string') ? '#F0FDF4' : 'white'
                                                        }}
                                                        onFocus={(e) => e.target.style.borderColor = '#1A1A1A'}
                                                        onBlur={(e) => e.target.style.borderColor = '#D0D0D0'}
                                                    />
                                                </FormGroup>
                                                <FormGroup style={{ marginBottom: 0 }}>
                                                    <label style={{ 
                                                        fontSize: '13px', 
                                                        fontWeight: 600, 
                                                        color: '#444', 
                                                        marginBottom: '10px', 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        gap: '8px'
                                                    }}>
                                                        <span>End Video (Video 3)</span>
                                                        {typeof formData.video3 === 'string' && formData.video3 && (
                                                            <span style={{ color: 'green', marginLeft: '5px' }}>(Existing)</span>
                                                        )}
                                                        {formData.video3 && typeof formData.video3 !== 'string' && (
                                                            <span style={{ 
                                                                color: '#10B981', 
                                                                fontSize: '14px', 
                                                                fontWeight: 600,
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '4px'
                                                            }}>
                                                                <CheckCircle size={16} />
                                                                Uploaded
                                                            </span>
                                                        )}
                                                    </label>
                                                    <input
                                                        accept="video/*"
                                                        type="file"
                                                        onChange={handleVideoFileChange('video3')}
                                                        style={{ 
                                                            padding: '12px 16px',
                                                            borderRadius: '12px',
                                                            border: '1px solid #D0D0D0',
                                                            fontSize: '14px',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s ease',
                                                            background: (formData.video3 && typeof formData.video3 !== 'string') ? '#F0FDF4' : 'white'
                                                        }}
                                                        onFocus={(e) => e.target.style.borderColor = '#1A1A1A'}
                                                        onBlur={(e) => e.target.style.borderColor = '#D0D0D0'}
                                                    />
                                                </FormGroup>
                                                <FormGroup style={{ marginBottom: 0 }}>
                                                    <label style={{ 
                                                        fontSize: '13px', 
                                                        fontWeight: 600, 
                                                        color: '#444', 
                                                        marginBottom: '10px', 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        gap: '8px'
                                                    }}>
                                                        <span>Audio *</span>
                                                        {typeof formData.audio === 'string' && formData.audio && (
                                                            <span style={{ color: 'green', marginLeft: '5px' }}>(Existing)</span>
                                                        )}
                                                        {formData.audio && typeof formData.audio !== 'string' && (
                                                            <span style={{ 
                                                                color: '#10B981', 
                                                                fontSize: '14px', 
                                                                fontWeight: 600,
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '4px'
                                                            }}>
                                                                <CheckCircle size={16} />
                                                                Uploaded
                                                            </span>
                                                        )}
                                                    </label>
                                                    <input
                                                        accept="audio/*"
                                                        type="file"
                                                        onChange={handleVideoFileChange('audio')}
                                                        required
                                                        style={{ 
                                                            padding: '12px 16px',
                                                            borderRadius: '12px',
                                                            border: '1px solid #D0D0D0',
                                                            fontSize: '14px',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s ease',
                                                            background: (formData.audio && typeof formData.audio !== 'string') ? '#F0FDF4' : 'white'
                                                        }}
                                                        onFocus={(e) => e.target.style.borderColor = '#1A1A1A'}
                                                        onBlur={(e) => e.target.style.borderColor = '#D0D0D0'}
                                                    />
                                                </FormGroup>
                                            </div>
                                        </div>

                                        {/* Animation Option */}
                                        <div style={{ 
                                            marginBottom: '28px',
                                            paddingBottom: '24px',
                                            borderBottom: '1px solid #E5E5E5'
                                        }}>
                                            <FormGroup>
                                                <label
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '12px',
                                                        cursor: 'pointer',
                                                        fontSize: '14px',
                                                        fontWeight: 500,
                                                        color: '#333',
                                                        padding: '12px 16px',
                                                        borderRadius: '10px',
                                                        background: 'white',
                                                        border: '1px solid #E0E0E0',
                                                        transition: 'all 0.2s ease',
                                                        userSelect: 'none',
                                                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = '#F8F8F8';
                                                        e.currentTarget.style.borderColor = '#D0D0D0';
                                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                                        e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = 'white';
                                                        e.currentTarget.style.borderColor = '#E0E0E0';
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                                                    }}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.hasAnimation || false}
                                                        onChange={e => setFormData({ ...formData, hasAnimation: e.target.checked })}
                                                        style={{ 
                                                            height: '22px', 
                                                            width: '22px', 
                                                            cursor: 'pointer',
                                                            accentColor: '#1A1A1A',
                                                            flexShrink: 0
                                                        }}
                                                    />
                                                    <span style={{ flex: 1 }}>Enable Animation (GIF + Photo)</span>
                                                </label>
                                            </FormGroup>
                                        </div>

                                        {/* Animation Files Section - Only show when animation is enabled */}
                                        {formData.hasAnimation && (
                                            <div style={{ marginBottom: '24px' }}>
                                                <h3 style={{ 
                                                    fontSize: '15px', 
                                                    fontWeight: 600, 
                                                    color: '#1A1A1A', 
                                                    marginBottom: '16px',
                                                    letterSpacing: '0.3px'
                                                }}>
                                                    Animation Files
                                                </h3>
                                                <FormGroup style={{ marginBottom: 0 }}>
                                                    <label style={{ 
                                                        fontSize: '13px', 
                                                        fontWeight: 600, 
                                                        color: '#444', 
                                                        marginBottom: '10px', 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        gap: '8px'
                                                    }}>
                                                        <span>Animation (GIF) *</span>
                                                        {typeof formData.gif === 'string' && formData.gif && (
                                                            <span style={{ color: 'green', marginLeft: '5px' }}>(Existing)</span>
                                                        )}
                                                        {formData.gif && typeof formData.gif !== 'string' && (
                                                            <span style={{ 
                                                                color: '#10B981', 
                                                                fontSize: '14px', 
                                                                fontWeight: 600,
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '4px'
                                                            }}>
                                                                <CheckCircle size={16} />
                                                                Uploaded
                                                            </span>
                                                        )}
                                                    </label>
                                                    <input
                                                        accept="image/gif"
                                                        type="file"
                                                        onChange={handleVideoFileChange('gif')}
                                                        required={formData.hasAnimation}
                                                        style={{ 
                                                            padding: '12px 16px',
                                                            borderRadius: '12px',
                                                            border: '1px solid #D0D0D0',
                                                            fontSize: '14px',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s ease',
                                                            background: (formData.gif && typeof formData.gif !== 'string') ? '#F0FDF4' : 'white',
                                                            width: '100%'
                                                        }}
                                                        onFocus={(e) => e.target.style.borderColor = '#1A1A1A'}
                                                        onBlur={(e) => e.target.style.borderColor = '#D0D0D0'}
                                                    />
                                                </FormGroup>
                                            </div>
                                        )}
                                    </>
                                ) : (
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
                                )}


                                <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
                                    <Button 
                                        type="button" 
                                        onClick={() => setShowModal(false)} 
                                        style={{ flex: 1 }}
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        type="submit" 
                                        $variant="primary" 
                                        style={{ flex: 1, position: 'relative' }}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                <SpinningLoader size={18} />
                                                {editingTemplate ? 'Updating...' : 'Creating...'}
                                            </span>
                                        ) : (
                                            editingTemplate ? 'Update Template' : 'Create Template'
                                        )}
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

            {/* Image/Video Modal */}
            {imageModal.show && (imageModal.photos.length > 0 || imageModal.videos.length > 0) && (
                <ImageModalOverlay onClick={handleCloseImageModal}>
                    <ImageModalContent onClick={e => e.stopPropagation()}>
                        <ImageCloseButton onClick={handleCloseImageModal}>
                            <X size={20} />
                        </ImageCloseButton>

                        {(() => {
                            const items = imageModal.isVideo ? imageModal.videos : imageModal.photos;
                            const hasMultiple = items.length > 1;
                            
                            return (
                                <>
                                    {hasMultiple && (
                                        <ImageNavButton
                                            $left
                                            onClick={handlePrevImage}
                                            disabled={!hasMultiple}
                                        >
                                            <ChevronLeft size={24} />
                                        </ImageNavButton>
                                    )}

                                    {imageModal.isVideo ? (
                                        <FullVideo
                                            key={imageModal.currentIndex}
                                            src={`${axiosData.defaults.baseURL || 'https://api.bilimbebrandactivations.com/api/'}upload/file/${imageModal.videos[imageModal.currentIndex]}`}
                                            controls
                                            autoPlay
                                            loop
                                        />
                                    ) : (
                                        <FullImage
                                            src={`${axiosData.defaults.baseURL || 'https://api.bilimbebrandactivations.com/api/'}upload/file/${imageModal.photos[imageModal.currentIndex]}`}
                                            alt={`Template image ${imageModal.currentIndex + 1}`}
                                        />
                                    )}

                                    {hasMultiple && (
                                        <ImageNavButton
                                            $right
                                            onClick={handleNextImage}
                                            disabled={!hasMultiple}
                                        >
                                            <ChevronRight size={24} />
                                        </ImageNavButton>
                                    )}

                                    {hasMultiple && (
                                        <>
                                            <ImageCounter>
                                                {imageModal.currentIndex + 1} / {items.length}
                                            </ImageCounter>
                                            <ImageDots>
                                                {items.map((_, index) => (
                                                    <ImageDot
                                                        key={index}
                                                        $active={index === imageModal.currentIndex}
                                                        onClick={() => handleDotClick(index)}
                                                    />
                                                ))}
                                            </ImageDots>
                                        </>
                                    )}
                                </>
                            );
                        })()}
                    </ImageModalContent>
                </ImageModalOverlay>
            )}
        </PageContainer>
    );
};

export default Templates;
