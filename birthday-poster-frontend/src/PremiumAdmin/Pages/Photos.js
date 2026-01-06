import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import {
  Image, Share2, Star, Download, Filter, Grid, List as ListIcon,
  MoreVertical, Calendar, Search, Trash2, ExternalLink, MessageCircle, Eye,
  BarChart2, ShoppingBag, X, ChevronLeft, ChevronRight, ChevronDown, CheckCircle
} from 'react-feather';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import useAxios from '../../useAxios';
import Card from '../Components/Card';
import { useLocation, useNavigate } from 'react-router-dom';

const PageContainer = styled.div`
padding: 0;
max-width: 1400px;
margin: 0 auto;
`;

const HeaderSection = styled.div`
display: flex;
justify-content: space-between;
align-items: flex-start;
margin-bottom: 32px;

@media (max-width: 1024px) {
  flex-direction: column;
  gap: 20px;
}
`;

const HeaderTitle = styled.div`
  h1 {
    font-size: 32px;
    font-weight: 800;
    margin: 0 0 8px 0;
    color: #1A1A1A;
    letter-spacing: -0.5px;
  }
  p {
    color: #666;
    font-size: 16px;
    margin: 0;
    font-weight: 500;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  border: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Variant: Primary (Dark) */
  ${props => props.$variant === 'primary' && `
    background: #111827;
    color: #FFFFFF;
    &:hover { background: #000000; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
  `}
  
  /* Variant: Success (Green) */
  ${props => props.$variant === 'success' && `
    background: #25D366;
    color: #FFFFFF;
    &:hover { background: #20BD5A; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3); }
  `}

  /* Variant: Outline (Default) */
  ${props => (!props.$variant || props.$variant === 'outline') && `
    background: #F3F4F6;
    color: #374151;
    border: 1px solid transparent;
    &:hover { background: #E5E7EB; color: #111827; }
  `}
`;

const KPIBox = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 32px;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const KPICard = styled(Card)`
  padding: 24px;
  background-color: ${({ $bgColor }) => $bgColor || '#FFF'};
  border: none;
  box-shadow: none;
  border-radius: 32px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 180px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;

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

const FilterSection = styled.div`
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
  gap: 20px;
}
`;

const ControlBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
`;

const DropdownContainer = styled.div`
  position: relative;
`;

const DropdownButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 16px;
  background: white;
  border: 1px solid #EEE;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #1A1A1A;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 160px;
  
  &:hover {
    background: #FAFAFA;
    border-color: #DDD;
  }

  svg {
    transition: transform 0.3s ease;
    transform: ${({ $isOpen }) => $isOpen ? 'rotate(180deg)' : 'rotate(0)'};
    color: #999;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  width: 100%;
  min-width: 200px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
  border: 1px solid #F0F0F0;
  padding: 8px;
  z-index: 100;
  opacity: ${({ $isOpen }) => $isOpen ? 1 : 0};
  visibility: ${({ $isOpen }) => $isOpen ? 'visible' : 'hidden'};
  transform: translateY(${({ $isOpen }) => $isOpen ? '0' : '10px'});
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

const DropdownItem = styled.div`
  padding: 10px 16px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: ${({ $active }) => $active ? '#1A1A1A' : '#666'};
  background: ${({ $active }) => $active ? '#F5F5F5' : 'transparent'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #F9F9F9;
    color: #1A1A1A;
  }
`;

const SearchBox = styled.div`
  position: relative;
  width: 300px;
  
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

const SelectionBar = styled.div`
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%) translateY(${props => props.$show ? '0' : '100px'});
  background: #1A1A1A;
  color: white;
  padding: 16px 32px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 32px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
  z-index: 1000;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  opacity: ${props => props.$show ? '1' : '0'};
`;

const SelectionCount = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: 15px;
  border-right: 1px solid rgba(255,255,255,0.2);
  padding-right: 32px;

  svg { color: #4CAF50; }
`;

const SelectionAction = styled.button`
  background: ${props => props.$variant === 'danger' ? 'rgba(255, 71, 87, 0.1)' : 'rgba(255,255,255,0.1)'};
  color: ${props => props.$variant === 'danger' ? '#FF4757' : 'white'};
  border: none;
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$variant === 'danger' ? '#FF4757' : 'white'};
    color: ${props => props.$variant === 'danger' ? 'white' : '#1A1A1A'};
    transform: translateY(-2px);
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
`;

const ModalContainer = styled.div`
  background: #FFF;
  width: 90%;
  max-width: 500px;
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  color: #1A1A1A;
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 150px;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #E5E7EB;
  background: #F9FAFB;
  font-family: inherit;
  font-size: 15px;
  margin-bottom: 24px;
  resize: none;
  &:focus {
    outline: none;
    border-color: #667eea;
    background: #FFF;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  }
`;

const ModalFooter = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s;
  
  &:hover {
    background: #F3F4F6;
    color: #1A1A1A;
  }
`;

const ViewControls = styled.div`
display: flex;
align-items: center;
gap: 16px;
border-left: 1px solid #EEE;
padding-left: 16px;
`;

const ViewButton = styled.button`
background: none;
border: none;
color: ${props => props.$active ? '#1A1A1A' : '#CCC'};
cursor: pointer;
padding: 4px;
  
  &:hover {
  color: #1A1A1A;
}
`;

const PhotoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const PhotoTable = styled.div`
  background: white;
  border-radius: 16px;
  border: 1px solid #F0F0F0;
  overflow: hidden;
  margin-top: 24px;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 60px 80px 1.5fr 1fr 1fr 1fr 1fr;
  padding: 16px 24px;
  background: #FAFAFA;
  border-bottom: 1px solid #F0F0F0;
  gap: 16px;
  align-items: center;
`;

const pulseAnimation = keyframes`
  0% { background-color: transparent; }
  50% { background-color: rgba(102, 126, 234, 0.15); }
  100% { background-color: transparent; }
`;

const HighlightedText = styled.span`
  background: #ffd54f;
  color: #1A1A1A;
  font-weight: 700;
  border-radius: 2px;
  padding: 0 2px;
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 60px 80px 1.5fr 1fr 1fr 1fr 1fr;
  padding: 16px 24px;
  border-bottom: 1px solid #F5F5F5;
  gap: 16px;
  align-items: center;
  transition: all 0.2s;

  ${props => props.$highlighted && css`
    animation: ${pulseAnimation} 2s ease-in-out infinite;
    border: 2px solid #667eea;
  `}

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #FAFAFA;
  }
`;

const ColumnLabel = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ListThumbnail = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 8px;
  object-fit: cover;
  cursor: pointer;
  border: 2px solid #F5F5F5;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
  }
`;

const CustomerInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const ListCustomerName = styled.span`
  font-weight: 700;
  color: #1A1A1A;
  font-size: 14px;
`;

const ListCategory = styled.span`
  font-size: 12px;
  color: #666;
`;

const ListEngagement = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: #666;
  font-size: 13px;

  span {
    display: flex;
    align-items: center;
    gap: 4px;
  }
`;

const ListActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ListActionButton = styled.button`
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #EEE;
  background: white;
  color: #1A1A1A;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #F5F5F5;
    border-color: #DDD;
  }
`;

const PhotoCard = styled.div`
  background: white;
  border-radius: 16px;
  border: 1px solid #F0F0F0;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  min-height: 320px;

  ${props => props.$highlighted && css`
    animation: ${pulseAnimation} 2s ease-in-out infinite;
    border: 2px solid #667eea;
    z-index: 10;
  `}

  &:hover {
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
    transform: translateY(-4px);
  }
`;

const pulsate = keyframes`
  0% { background-color: #f8f8f8; }
  50% { background-color: #eeeeee; }
  100% { background-color: #f8f8f8; }
`;

const ImageWrapper = styled.div`
  margin:15px 0px;
  position: relative;
  border: 4px solid #F5F5F5;
  overflow: hidden;
  background-color: #f8f8f8;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &::before {
    content: "";
    display: ${props => props.$loaded ? 'none' : 'block'};
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    animation: ${pulsate} 1.5s ease-in-out infinite;
  }
`;

const StyledImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.5s ease;
  opacity: ${props => props.$loaded ? 1 : 0};
`;

// Helper Component for individual image loading
const GalleryImage = ({ src, alt }) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  return (
    <ImageWrapper $loaded={isLoaded}>
      <StyledImage
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        $loaded={isLoaded}
      />
    </ImageWrapper>
  );
};

const SelectionOverlay = styled.div`
position: absolute;
top: 12px;
left: 12px;
z-index: 10;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #1A1A1A;
`;

const PhotoInfo = styled.div`
  padding: 16px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const PhotoMeta = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
`;

const CategoryBadge = styled.span`
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #666;
`;

const CustomerName = styled.h4`
  font-size: 16px;
  font-weight: 700;
  margin: 0;
  color: #1A1A1A;
`;

const DateText = styled.p`
  font-size: 12px;
  color: #999;
  margin: 4px 0 0 0;
`;

const SendMessageButton = styled.button`
  flex: 1;
  height: 42px;
  background: transparent;
  border: 1px solid #1A1A1A;
  color: #1a1a1a;
  border-radius: 8px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover {
    background: #1A1A1A;
    color: white;
  }
`;

const MenuButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #999;
  padding: 4px;
  z-index: 10;
  
  &:hover {
    color: #1A1A1A;
  }
`;

const OverlayAction = styled.button`
width: 40px;
height: 40px;
border - radius: 50 %;
background: white;
border: none;
display: flex;
align - items: center;
justify - content: center;
cursor: pointer;
transition: all 0.2s;

  &:hover {
  transform: scale(1.1);
}
`;

const EngagementBar = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 12px;
  padding-top: 12px;
  width: 100%;
  border-top: 1px solid #F5F5F5;
`;

const EngagementMetric = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #666;
  
  svg {
    width: 14px;
    height: 14px;
    opacity: 0.7;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 40px;
  gap: 8px;
`;

const PageButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: ${props => props.$active ? '#1A1A1A' : 'transparent'};
  color: ${props => props.$active ? '#FFF' : '#666'};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$active ? '#1A1A1A' : '#F5F5F5'};
    color: ${props => props.$active ? '#FFF' : '#1A1A1A'};
  }
  
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    background: transparent;
  }
`;

const PageEllipsis = styled.span`
  color: #999;
  font-size: 14px;
  padding: 0 4px;
`;

const LightboxOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
`;

const LightboxImage = styled.img`
  max-width: 90%;
  max-height: 90vh;
  border-radius: 8px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.5);
`;

const CloseButton = styled.button`
  position: absolute;
  top: 24px;
  right: 24px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: rotate(90deg);
  }
`;

const ActionRow = styled.div`
  display: flex;
  gap: 10px;
  width: 100%;
  margin-top: 20px;
  align-items: center;
`;

const EyeButton = styled.button`
  width: 42px;
  height: 42px;
  background: #F3F4F6;
  border: none;
  color: #1A1A1A;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: #E5E7EB;
    color: #000;
    transform: translateY(-1px);
  }
`;

const Photos = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('grid');
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showMsgModal, setShowMsgModal] = useState(false);
  const [customMsg, setCustomMsg] = useState('');
  const [activePhoto, setActivePhoto] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [viewImage, setViewImage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const axiosData = useAxios();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [highlightedId, setHighlightedId] = useState(null);
  const photoRefs = useRef({});

  const highlightText = (text, query) => {
    if (!query || !text) return text;
    const parts = String(text).split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ?
        <HighlightedText key={index}>{part}</HighlightedText> : part
    );
  };

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('All Branches');
  const [selectedTemplate, setSelectedTemplate] = useState('All Templates');
  const [selectedDateFilter, setSelectedDateFilter] = useState('All Time');
  const [selectedVisitFilter, setSelectedVisitFilter] = useState('All Visits');

  // Dropdown visibility states
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showVisitDropdown, setShowVisitDropdown] = useState(false);

  // Refs for outside click detection
  const branchRef = useRef(null);
  const templateRef = useRef(null);
  const dateRef = useRef(null);
  const visitRef = useRef(null);

  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    shares: 0,
    rating: '4.8'
  });

  const itemsPerPage = 12;

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (branchRef.current && !branchRef.current.contains(event.target)) setShowBranchDropdown(false);
      if (templateRef.current && !templateRef.current.contains(event.target)) setShowTemplateDropdown(false);
      if (dateRef.current && !dateRef.current.contains(event.target)) setShowDateDropdown(false);
      if (visitRef.current && !visitRef.current.contains(event.target)) setShowVisitDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const response = await axiosData.get(`upload/all?adminid=${user._id || user.id}`);
      const data = response.data.filter(item =>
        item.source === 'Photo Merge App'
      );

      // 1. Group by Customer to count total uploads (Visits)
      const customerCounts = {};
      data.forEach(item => {
        const phone = item.whatsapp || item.mobile || '';
        const key = phone && phone !== 'N/A' ? phone : (item.name || 'Unknown');
        customerCounts[key] = (customerCounts[key] || 0) + 1;
      });

      // 2. Process Individual Photos with Grouped Count
      const processed = data.map((item, index) => {
        const phone = item.whatsapp || item.mobile || '';
        const key = phone && phone !== 'N/A' ? phone : (item.name || 'Unknown');

        return {
          id: item._id || index,
          url: (item.photoId || item.posterVideoId)
            ? `https://api.bilimbebrandactivations.com/api/upload/file/${item.photoId || item.posterVideoId}`
            : 'https://via.placeholder.com/300',
          category: item.template_name || item.templatename || item.type,
          template_name: item.template_name || item.templatename || item.type,
          branch: item.source || 'Head Office',
          customer: item.name || 'Anonymous',
          phone: phone, // Added phone field
          date: new Date(item.date || item.createdAt).toLocaleDateString(),
          timestamp: new Date(item.date || item.createdAt).getTime(),
          views: customerCounts[key] || 0,
          shares: (item.whatsappsharecount || 0) +
            (item.facebooksharecount || 0) +
            (item.twittersharecount || 0) +
            (item.instagramsharecount || 0),
          downloads: item.downloadcount || 0,
          rating: (Math.random() * 2 + 3).toFixed(1)
        };
      }).sort((a, b) => b.timestamp - a.timestamp);

      setPhotos(processed);

      // Calculate Global Stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayCount = processed.filter(p => p.timestamp >= today.getTime()).length;
      const totalShares = processed.reduce((acc, curr) => acc + curr.shares + curr.downloads, 0);

      setStats({
        total: processed.length,
        today: todayCount,
        shares: totalShares,
        rating: (Math.random() * 0.5 + 4.4).toFixed(1)
      });

    } catch (error) {
      console.error("Error fetching photos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Independent effect for highlighting
  useEffect(() => {
    const { highlightedPhotoId, query } = location.state || {};

    if (highlightedPhotoId && photos.length > 0) {
      const id = highlightedPhotoId;
      setHighlightedId(id);

      if (query) setSearchQuery(query);

      const photoIndex = photos.findIndex(p => p.id === id);
      if (photoIndex !== -1) {
        // Calculate page
        const pageNum = Math.floor(photoIndex / itemsPerPage) + 1;
        setCurrentPage(pageNum);

        // Scroll after render
        setTimeout(() => {
          if (photoRefs.current[id]) {
            photoRefs.current[id].scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 500);

        // Clear state asynchronously
        setTimeout(() => {
          navigate(location.pathname, { replace: true, state: {} });
        }, 100);

        // Clear highlight
        const timer = setTimeout(() => setHighlightedId(null), 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [location.state, location.key, photos, navigate, location.pathname, itemsPerPage]);



  // Derived Filter Options
  const branches = ['All Branches', ...new Set(photos.map(p => p.branch))];
  const templates = ['All Templates', ...new Set(photos.map(p => p.template_name))];
  const dateFilters = ['All Time', 'Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days'];
  const visitFilters = ['All Visits', 'Most Visited (>10)', 'Low Engagement (<5)'];

  const filteredPhotos = photos.filter(photo => {
    const matchesSearch = photo.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.template_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBranch = selectedBranch === 'All Branches' || photo.branch === selectedBranch;
    const matchesTemplate = selectedTemplate === 'All Templates' || photo.template_name === selectedTemplate;

    let matchesDate = true;
    if (selectedDateFilter !== 'All Time') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const photoDate = new Date(photo.timestamp);
      photoDate.setHours(0, 0, 0, 0);

      if (selectedDateFilter === 'Today') matchesDate = photoDate.getTime() === today.getTime();
      else if (selectedDateFilter === 'Yesterday') {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        matchesDate = photoDate.getTime() === yesterday.getTime();
      }
      else if (selectedDateFilter === 'Last 7 Days') {
        const last7 = new Date(today);
        last7.setDate(last7.getDate() - 7);
        matchesDate = photoDate >= last7;
      }
      else if (selectedDateFilter === 'Last 30 Days') {
        const last30 = new Date(today);
        last30.setDate(last30.getDate() - 30);
        matchesDate = photoDate >= last30;
      }
    }

    let matchesVisits = true;
    if (selectedVisitFilter === 'Most Visited (>10)') matchesVisits = photo.views > 10;
    else if (selectedVisitFilter === 'Low Engagement (<5)') matchesVisits = photo.views < 5;

    return matchesSearch && matchesBranch && matchesTemplate && matchesDate && matchesVisits;
  });

  const exportToExcel = (dataToExport = null) => {
    const finalData = dataToExport || (selectedPhotos.length > 0
      ? filteredPhotos.filter(p => selectedPhotos.includes(p.id))
      : filteredPhotos);

    const csvContent = "Customer,Category,Template,Date,Visit Count,Total Shares\n"
      + finalData.map(e => `${e.customer},${e.category},${e.template_name},${e.date},${e.views},${e.shares}`).join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Photos_Report_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleMessage = (photo) => {
    setActivePhoto(photo);
    setCustomMsg(`Hello ${photo.customer}, check out your photo from ${photo.template_name}: ${photo.url}`);
    setShowMsgModal(true);
  };

  const confirmSendMessage = async () => {
    if (!activePhoto) return;
    if (!activePhoto.phone || activePhoto.phone === 'N/A') {
      alert("Customer phone number not available.");
      return;
    }

    setIsSending(true);

    try {
      // Call the NEW custom-share endpoint
      const response = await axiosData.post('/upload/custom-share', {
        mobile: activePhoto.phone,
        _id: activePhoto.id,
        message: customMsg,
        userName: activePhoto.customer,
      });

      if (response.data.success) {
        // alert("Message sent successfully via ChatMyBot!");
        setShowMsgModal(false);
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      console.error("Messaging Error:", error);
      alert("Failed to send message via WhatsApp.");
      setShowMsgModal(false);
    } finally {
      setIsSending(false);
    }
  };

  const sendBulkWhatsApp = async () => {
    const photosToMessage = selectedPhotos.length > 0
      ? filteredPhotos.filter(p => selectedPhotos.includes(p.id))
      : [];

    if (photosToMessage.length === 0) {
      alert("Please select photos to send bulk messages.");
      return;
    }

    const bulkMsg = prompt("Enter bulk message (photo link will be appended):", "Check out our latest collection! ");
    if (!bulkMsg) return;

    if (window.confirm(`Send messages to ${photosToMessage.length} customers?`)) {
      for (const photo of photosToMessage) {
        try {
          await axiosData.post('/upload/custom-share', {
            mobile: photo.phone,
            _id: photo.id,
            message: `${bulkMsg}\n\nPhoto: ${photo.url}`
          });
        } catch (err) {
          console.error("Bulk Send Error for", photo.customer, err);
        }
        await new Promise(r => setTimeout(r, 500));
      }
      alert("Bulk messaging process completed.");
    }
  };

  const toggleSelect = (id) => {
    if (selectedPhotos.includes(id)) {
      setSelectedPhotos(selectedPhotos.filter(pid => pid !== id));
    } else {
      setSelectedPhotos([...selectedPhotos, id]);
    }
  };



  // Pagination Logic
  const totalPages = Math.ceil(filteredPhotos.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPhotos = filteredPhotos.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = () => {
    const pageNumbers = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 4) {
        pageNumbers.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pageNumbers.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pageNumbers.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }

    return (
      <PaginationContainer>
        <PageButton
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft size={20} />
        </PageButton>

        {pageNumbers.map((number, index) => (
          number === '...' ? (
            <PageEllipsis key={index}>...</PageEllipsis>
          ) : (
            <PageButton
              key={index}
              $active={currentPage === number}
              onClick={() => handlePageChange(number)}
            >
              {number}
            </PageButton>
          )
        ))}

        <PageButton
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight size={20} />
        </PageButton>
      </PaginationContainer>
    );
  };

  return (
    <PageContainer>
      <HeaderSection>
        <HeaderTitle>
          <h1>Photo Gallery</h1>
          <p>Manage customer photos, interactions, and engagement</p>
        </HeaderTitle>
        <HeaderActions>
          <ActionButton $variant="outline" onClick={() => exportToExcel()}>
            <Download size={18} />
            Export as Excel
          </ActionButton>
          <ActionButton $variant="success" onClick={() => sendBulkWhatsApp()}>
            <MessageCircle size={18} />
            Bulk WhatsApp
          </ActionButton>
        </HeaderActions>
      </HeaderSection>

      <KPIBox>
        {[
          {
            label: 'Total Photos',
            value: stats.total.toLocaleString(),
            change: '+12.5%',
            icon: <Image size={20} />,
            bgColor: '#FFF0E5',
            trendColor: '#D47D52',
            points: "M10,40 C25,38 35,45 50,35 S80,10 90,15",
            endX: 85, endY: 14
          },
          {
            label: 'Photos Today',
            value: stats.today.toLocaleString(),
            change: '+8.2%',
            icon: <Calendar size={20} />,
            bgColor: '#F4F9E9',
            trendColor: '#6B8E23',
            points: "M10,35 C25,38 35,25 50,30 S80,25 90,28",
            endX: 85, endY: 27
          },
          {
            label: 'Total Shares',
            value: stats.shares.toLocaleString(),
            change: '+23.1%',
            icon: <Share2 size={20} />,
            bgColor: '#F7F2FA',
            trendColor: '#8E44AD',
            points: "M10,42 C25,35 35,40 50,30 S85,5 90,10",
            endX: 85, endY: 8
          },
          {
            label: 'Avg Rating',
            value: stats.rating,
            change: '+2.1%',
            icon: <Star size={20} />,
            bgColor: '#FFF9E5',
            trendColor: '#B58B00',
            points: "M10,38 C25,35 35,38 50,32 S80,20 90,25",
            endX: 85, endY: 23
          }
        ].map((kpi, idx) => (
          <KPICard key={idx} $bgColor={kpi.bgColor}>
            <KPITop>
              <KPIIconWrapper>
                {kpi.icon}
              </KPIIconWrapper>
              <KPILabel>{kpi.label}</KPILabel>
            </KPITop>

            <KPIContent>
              <KPIMain>
                <KPIValue>{kpi.value}</KPIValue>
                <TrendIndicator $color={kpi.trendColor}>
                  ▲ {kpi.change}
                </TrendIndicator>
              </KPIMain>

              <div style={{ position: 'relative', width: '100px', height: '50px' }}>
                <svg width="100%" height="100%" viewBox="0 0 100 50" style={{ overflow: 'visible' }}>
                  <path
                    d={kpi.points}
                    fill="none"
                    stroke={kpi.trendColor}
                    strokeWidth="3"
                    strokeLinecap="round"
                    style={{ filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.1))' }}
                  />
                  <circle
                    cx={kpi.endX}
                    cy={kpi.endY}
                    r="4"
                    fill="white"
                    stroke={kpi.trendColor}
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </KPIContent>
          </KPICard>
        ))}
      </KPIBox>

      <FilterSection>
        <ControlBar>
          {/* Template Filter */}
          <DropdownContainer ref={templateRef}>
            <DropdownButton
              $isOpen={showTemplateDropdown}
              onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
            >
              {selectedTemplate}
              <ChevronDown size={16} />
            </DropdownButton>
            <DropdownMenu $isOpen={showTemplateDropdown}>
              {templates.map(t => (
                <DropdownItem
                  key={t}
                  $active={selectedTemplate === t}
                  onClick={() => {
                    setSelectedTemplate(t);
                    setShowTemplateDropdown(false);
                    setCurrentPage(1);
                  }}
                >
                  {t}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </DropdownContainer>

          {/* Date Filter */}
          <DropdownContainer ref={dateRef}>
            <DropdownButton
              $isOpen={showDateDropdown}
              onClick={() => setShowDateDropdown(!showDateDropdown)}
            >
              <Calendar size={16} style={{ marginRight: 8, color: '#666' }} />
              {selectedDateFilter}
              <ChevronDown size={16} />
            </DropdownButton>
            <DropdownMenu $isOpen={showDateDropdown}>
              {dateFilters.map(d => (
                <DropdownItem
                  key={d}
                  $active={selectedDateFilter === d}
                  onClick={() => {
                    setSelectedDateFilter(d);
                    setShowDateDropdown(false);
                    setCurrentPage(1);
                  }}
                >
                  {d}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </DropdownContainer>

          {/* Visits Filter */}
          <DropdownContainer ref={visitRef}>
            <DropdownButton
              $isOpen={showVisitDropdown}
              onClick={() => setShowVisitDropdown(!showVisitDropdown)}
            >
              <BarChart2 size={16} style={{ marginRight: 8, color: '#666' }} />
              {selectedVisitFilter}
              <ChevronDown size={16} />
            </DropdownButton>
            <DropdownMenu $isOpen={showVisitDropdown}>
              {visitFilters.map(v => (
                <DropdownItem
                  key={v}
                  $active={selectedVisitFilter === v}
                  onClick={() => {
                    setSelectedVisitFilter(v);
                    setShowVisitDropdown(false);
                    setCurrentPage(1);
                  }}
                >
                  {v}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </DropdownContainer>

          {/* Branch Filter */}


          <SearchBox>
            <Search size={18} />
            <input
              placeholder="Search by customer or template..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </SearchBox>
        </ControlBar>

        <ViewControls>
          <ViewButton
            $active={viewMode === 'grid'}
            onClick={() => setViewMode('grid')}
          >
            <Grid size={20} />
          </ViewButton>
          <ViewButton
            $active={viewMode === 'list'}
            onClick={() => setViewMode('list')}
          >
            <ListIcon size={20} />
          </ViewButton>
        </ViewControls>
      </FilterSection>

      {filteredPhotos.length === 0 ? (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '80px 20px',
          flexDirection: 'column',
          alignItems: 'center',
          background: '#FFF',
          borderRadius: '32px',
          border: '1px solid #F0F0F0',
          marginTop: '24px'
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
            <Image size={40} />
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#111827', marginBottom: '8px' }}>
            No photos found
          </div>
          <div style={{ color: '#6B7280', textAlign: 'center', maxWidth: '400px', fontSize: '15px', lineHeight: '1.6' }}>
            {searchQuery || selectedTemplate !== 'All Templates' || selectedBranch !== 'All Branches' || selectedDateFilter !== 'All Time' || selectedVisitFilter !== 'All Visits'
              ? `We couldn't find any photos matching your current search or filter criteria.`
              : "Your gallery is currently empty. Photos will appear here once customers start creating them."}
          </div>
          {(searchQuery || selectedTemplate !== 'All Templates' || selectedBranch !== 'All Branches' || selectedDateFilter !== 'All Time' || selectedVisitFilter !== 'All Visits') && (
            <ActionButton
              style={{ marginTop: '24px', background: '#F3F4F6', color: '#374151' }}
              onClick={() => {
                setSearchQuery('');
                setSelectedTemplate('All Templates');
                setSelectedBranch('All Branches');
                setSelectedDateFilter('All Time');
                setSelectedVisitFilter('All Visits');
                setCurrentPage(1);
              }}
            >
              Reset All Filters
            </ActionButton>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <PhotoGrid>
          {currentPhotos.map(photo => (
            <PhotoCard
              key={photo.id}
              ref={el => photoRefs.current[photo.id] = el}
              $highlighted={photo.id === highlightedId}
            >
              {/* <MenuButton>
                <MoreVertical size={18} />
              </MenuButton> */}

              <SelectionOverlay>
                <Checkbox
                  type="checkbox"
                  checked={selectedPhotos.includes(photo.id)}
                  onChange={() => toggleSelect(photo.id)}
                />
              </SelectionOverlay>

              <GalleryImage src={photo.url} alt={photo.customer} />

              <PhotoInfo>
                <CustomerName>{highlightText(photo.customer, searchQuery)}</CustomerName>
                <CategoryBadge>{highlightText(photo.category, searchQuery)}</CategoryBadge>
                <DateText>
                  Uploaded on {highlightText(photo.date, searchQuery)} • {photo.views} visits
                </DateText>

                <EngagementBar>
                  <EngagementMetric>
                    <Share2 /> {photo.shares}
                  </EngagementMetric>
                  <EngagementMetric>
                    <Download /> {photo.downloads}
                  </EngagementMetric>
                </EngagementBar>

                <ActionRow>
                  <SendMessageButton onClick={() => handleMessage(photo)}>
                    <MessageCircle size={16} />
                    Message
                  </SendMessageButton>
                  <EyeButton onClick={() => setViewImage(photo.url)} title="View Full Image">
                    <Eye size={18} />
                  </EyeButton>
                </ActionRow>
              </PhotoInfo>
            </PhotoCard>
          ))}
        </PhotoGrid>
      ) : (
        <PhotoTable>
          <TableHeader>
            <ColumnLabel>Select</ColumnLabel>
            <ColumnLabel>Photo</ColumnLabel>
            <ColumnLabel>Customer</ColumnLabel>
            <ColumnLabel>Template</ColumnLabel>
            <ColumnLabel>Engagement</ColumnLabel>
            <ColumnLabel>Date</ColumnLabel>
            <ColumnLabel>Actions</ColumnLabel>
          </TableHeader>
          {currentPhotos.map(photo => (
            <TableRow
              key={photo.id}
              ref={el => photoRefs.current[photo.id] = el}
              $highlighted={photo.id === highlightedId}
            >
              <Checkbox
                type="checkbox"
                checked={selectedPhotos.includes(photo.id)}
                onChange={() => toggleSelect(photo.id)}
              />
              <ListThumbnail
                src={photo.url}
                alt={photo.customer}
                onClick={() => setViewImage(photo.url)}
              />
              <CustomerInfo>
                <ListCustomerName>{highlightText(photo.customer, searchQuery)}</ListCustomerName>
                <ListCategory>{highlightText(photo.category, searchQuery)}</ListCategory>
              </CustomerInfo>
              <div style={{ fontSize: '14px' }}>{highlightText(photo.template_name, searchQuery)}</div>
              <ListEngagement>
                <span><Share2 size={14} /> {photo.shares}</span>
                <span><Download size={14} /> {photo.downloads}</span>
                <span><Eye size={14} /> {photo.views}</span>
              </ListEngagement>
              <div style={{ fontSize: '13px', color: '#666' }}>{highlightText(photo.date, searchQuery)}</div>
              <ListActions>
                <ListActionButton title="Send Message" onClick={() => handleMessage(photo)}>
                  <MessageCircle size={16} />
                </ListActionButton>
                <ListActionButton
                  title="View Full Image"
                  onClick={() => setViewImage(photo.url)}
                >
                  <Eye size={16} />
                </ListActionButton>
                {/*<ListActionButton title="More">
                  <MoreVertical size={16} />
                </ListActionButton>*/}
              </ListActions>
            </TableRow>
          ))}
        </PhotoTable>
      )
      }

      {totalPages > 1 && renderPagination()}

      {
        viewImage && (
          <LightboxOverlay onClick={() => setViewImage(null)}>
            <CloseButton onClick={() => setViewImage(null)}>
              <X size={24} />
            </CloseButton>
            <LightboxImage src={viewImage} onClick={(e) => e.stopPropagation()} />
          </LightboxOverlay>
        )
      }

      {/* Selection Bar */}
      <SelectionBar $show={selectedPhotos.length > 0}>
        <SelectionCount>
          <CheckCircle size={18} />
          <span>{selectedPhotos.length} Photos Selected</span>
        </SelectionCount>
        <div style={{ display: 'flex', gap: '12px' }}>
          <SelectionAction onClick={() => exportToExcel()}>
            <Download size={18} />
            Export Selected
          </SelectionAction>
          <SelectionAction $variant="danger" onClick={() => setSelectedPhotos([])}>
            <Trash2 size={18} />
            Clear
          </SelectionAction>
        </div>
      </SelectionBar>

      {
        showMsgModal && (
          <ModalOverlay onClick={() => setShowMsgModal(false)}>
            <ModalContainer onClick={e => e.stopPropagation()}>
              <ModalHeader>
                <ModalTitle>Compose Message</ModalTitle>
                <IconButton onClick={() => setShowMsgModal(false)}>
                  <X size={20} />
                </IconButton>
              </ModalHeader>
              <TextArea
                value={customMsg}
                onChange={e => setCustomMsg(e.target.value)}
                placeholder="Type your message here..."
              />
              <ModalFooter>
                <ActionButton onClick={() => setShowMsgModal(false)}>Cancel</ActionButton>
                <ActionButton
                  $variant="success"
                  onClick={confirmSendMessage}
                  disabled={isSending}
                >
                  {isSending ? 'Sending...' : 'Send Message'}
                </ActionButton>
              </ModalFooter>
            </ModalContainer>
          </ModalOverlay>
        )
      }
    </PageContainer >
  );
};

export default Photos;
