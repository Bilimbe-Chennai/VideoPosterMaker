import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Search, Bell, User, Menu } from 'react-feather';
import { useNavigate } from 'react-router-dom';
import useAxios from '../../useAxios';
import NotificationPanel from './NotificationPanel';
import SearchResults from './SearchResults';

const TopBarContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => `${theme.spacing.lg} ${theme.spacing.xl}`};
  background: ${({ theme }) => theme.colors.primaryLight};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: ${({ theme }) => theme.shadows.card};

  @media (max-width: 768px) {
    padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
`;

const MenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  padding: 8px;
  margin-right: 12px;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  @media (max-width: 1200px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const SearchBarWrapper = styled.div`
  position: relative;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  background: ${({ theme }) => theme.colors.primaryLight};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  width: 300px;
  transition: all 0.3s ease;

  &:focus-within {
    border-color: ${({ theme }) => theme.colors.textSecondary};
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.05);
  }

  @media (max-width: 768px) {
    width: 200px;
  }

  @media (max-width: 480px) {
    display: none; /* Hide search on very small screens to save space */
  }
`;

const SearchInput = styled.input`
  border: none;
  outline: none;
  background: none;
  flex: 1;
  margin-left: ${({ theme }) => theme.spacing.sm};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textPrimary};

  &::placeholder {
    color: ${({ theme }) => theme.colors.textLight};
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 480px) {
    gap: 12px;
  }
`;

const IconButton = styled.button`
  background: none;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.borderRadius.round};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textSecondary};
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    background: ${({ theme }) => theme.colors.accentPurple};
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  @media (max-width: 480px) {
    width: 36px;
    height: 36px;
  }
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: 2px;
  right: 2px;
  min-width: ${({ $hasCount }) => $hasCount ? '18px' : '8px'};
  height: ${({ $hasCount }) => $hasCount ? '18px' : '8px'};
  background: ${({ theme }) => theme.colors.danger};
  border-radius: ${({ $hasCount }) => $hasCount ? '9px' : '50%'};
  display: ${({ $show }) => $show ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
  color: white;
  padding: ${({ hasCount }) => hasCount ? '0 4px' : '0'};
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  cursor: pointer;
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.borderRadius.round};
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;

  @media (max-width: 480px) {
    width: 36px;
    height: 36px;
  }
`;

const UserInfo = styled.div`
  display: none;

  @media (min-width: 768px) {
    display: block;
  }
`;

const UserName = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const UserRole = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textLight};
`;

const TopBar = ({ onMenuClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const axiosData = useAxios();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Fetch notification count
  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const [templatesRes, photosRes] = await Promise.all([
          axiosData.get(`/photomerge/templates?adminid=${user._id || user.id}`),
          axiosData.get(`/upload/all?adminid=${user._id || user.id}`)
        ]);

        // Count all items that are UNREAD - use user-specific key
        const storageKey = `readNotificationIds_${user._id || user.id || 'default'}`;
        let savedReadIds = [];
        try {
          savedReadIds = JSON.parse(localStorage.getItem(storageKey) || '[]');
        } catch (e) {
          console.error('Error reading readNotificationIds from localStorage:', e);
          savedReadIds = [];
        }

        const unreadTemplates = (templatesRes.data || [])
          .filter(t => !savedReadIds.includes(`template-${t._id}`));

        const unreadPhotos = (photosRes.data || [])
          .filter(p => p.source === 'Photo Merge App' && !savedReadIds.includes(`photo-${p._id}`));

        const count = unreadTemplates.length + unreadPhotos.length;
        setNotificationCount(count);
        document.title = count > 0 ? `(${count}) Premium Admin` : 'Premium Admin';
      } catch (error) {
        console.error('Error fetching notification count:', error);
      }
    };

    fetchNotificationCount();
    // Refresh count every 5 minutes
    const interval = setInterval(fetchNotificationCount, 5 * 60 * 1000);

    // Listen for storage changes AND custom event from NotificationPanel
    const storageKey = `readNotificationIds_${user._id || user.id || 'default'}`;
    const handleStorageChange = (e) => {
      if (e.key === storageKey || e.type === 'notificationStateChange') {
        fetchNotificationCount();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('notificationStateChange', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('notificationStateChange', handleStorageChange);
    };
  }, [axiosData]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSearchResults(value.length > 0);
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  const handleSearchResultClick = (type, item) => {
    console.log('Search result clicked:', type, item);
    setShowSearchResults(false);
    setSearchQuery('');

    // Navigation logic based on type
    if (type === 'template') {
      navigate('/admin/templates', { state: { highlightedTemplateId: item.id, query: searchQuery } });
    } else if (type === 'user') {
      navigate('/admin/customers', {
        state: {
          highlightedUserId: item.id,
          highlightedUserEmail: item.email,
          highlightedUserPhone: item.phone,
          query: searchQuery
        }
      });
    } else if (type === 'photo') {
      navigate('/admin/photos', { state: { highlightedPhotoId: item.id, query: searchQuery } });
    }
  };

  return (
    <>
      <TopBarContainer>

        <LeftSection>
          <MenuButton onClick={onMenuClick} title="Open Menu">
            <Menu size={24} />
          </MenuButton>
          <SearchBarWrapper ref={searchRef}>
            <SearchBar>
              <Search size={18} color="#A0A0A0" />
              <SearchInput
                placeholder="Search templates, users, photos..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </SearchBar>
            <SearchResults
              query={searchQuery}
              show={showSearchResults}
              onResultClick={handleSearchResultClick}
            />
          </SearchBarWrapper>
        </LeftSection>



        <RightSection>
          <IconButton onClick={handleNotificationClick}>
            <Bell size={20} />
            <NotificationBadge
              $show={notificationCount > 0}
              $hasCount={notificationCount > 0}
            >
              {notificationCount > 0 && (notificationCount > 99 ? '99+' : notificationCount)}
            </NotificationBadge>
          </IconButton>

          <UserProfile>
            <UserAvatar>
              {user.name ? user.name.charAt(0).toUpperCase() : <User size={20} />}
            </UserAvatar>
            <UserInfo>
              <UserName>{user.name || 'Admin User'}</UserName>
              <UserRole>{user.type || 'Manager'}</UserRole>
            </UserInfo>
          </UserProfile>
        </RightSection>
      </TopBarContainer>

      <NotificationPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </>
  );
};

export default TopBar;
