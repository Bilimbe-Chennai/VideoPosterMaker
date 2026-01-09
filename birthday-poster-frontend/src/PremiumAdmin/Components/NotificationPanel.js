import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { X, Check, AlertCircle, Info, Trash2 } from 'react-feather';
import useAxios from '../../useAxios';
import { formatDate, getStoredDateFormat } from '../../utils/dateUtils';

const PanelOverlay = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 999;
  display: ${({ $isOpen }) => $isOpen ? 'block' : 'none'};
  animation: fadeIn 0.2s ease;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const PanelContainer = styled.div`
  position: fixed;
  top: 0;
  right: ${({ $isOpen }) => $isOpen ? '0' : '-400px'};
  width: 400px;
  height: 100vh;
  background: ${({ theme }) => theme.colors.primaryLight};
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  transition: right 0.3s ease;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    width: 100%;
    right: ${({ $isOpen }) => $isOpen ? '0' : '-100%'};
  }
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
`;

const PanelTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.borderRadius.round};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textSecondary};
  transition: all 0.3s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.accentPurple};
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const NotificationTabs = styled.div`
  display: flex;
  padding: ${({ theme }) => theme.spacing.md};
  gap: ${({ theme }) => theme.spacing.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
`;

const Tab = styled.button`
  flex: 1;
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  background: ${({ $active, theme }) => $active ? theme.colors.accentPurple : 'transparent'};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  color: ${({ $active, theme }) => $active ? theme.colors.textPrimary : theme.colors.textLight};
  font-weight: ${({ $active }) => $active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.accentPurple};
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const NotificationList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.md};

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.borderLight};
    border-radius: 3px;
  }
`;

const NotificationItem = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ $isRead, theme }) => $isRead ? 'transparent' : theme.colors.accentPurple};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid ${({ theme }) => theme.colors.borderLight};

  &:hover {
    background: ${({ theme }) => theme.colors.accentPurple};
    transform: translateX(-4px);
  }
`;

const NotificationIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.borderRadius.round};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: ${({ $type, theme }) => {
    switch ($type) {
      case 'success': return 'rgba(34, 197, 94, 0.1)';
      case 'error': return 'rgba(239, 68, 68, 0.1)';
      case 'warning': return 'rgba(251, 191, 36, 0.1)';
      default: return 'rgba(59, 130, 246, 0.1)';
    }
  }};
  color: ${({ $type }) => {
    switch ($type) {
      case 'success': return '#22c55e';
      case 'error': return '#ef4444';
      case 'warning': return '#fbbf24';
      default: return '#3b82f6';
    }
  }};
`;

const NotificationContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const NotificationTitle = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 4px;
`;

const NotificationMessage = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textLight};
  line-height: 1.4;
`;

const NotificationTime = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textLight};
  margin-top: 4px;
`;

const NotificationActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  align-items: center;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textLight};
  transition: all 0.3s ease;

  &:hover {
    background: ${({ danger, theme }) => danger ? 'rgba(239, 68, 68, 0.1)' : theme.colors.borderLight};
    color: ${({ danger }) => danger ? '#ef4444' : 'inherit'};
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xl};
  text-align: center;
  color: ${({ theme }) => theme.colors.textLight};
`;

const EmptyIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: ${({ theme }) => theme.borderRadius.round};
  background: ${({ theme }) => theme.colors.accentPurple};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.textLight};
`;

const EmptyText = styled.p`
  margin: 0;
  font-size: 14px;
`;

const ClearAllButton = styled.button`
  margin: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.accentPurple};
    border-color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const NotificationPanel = ({ isOpen, onClose }) => {
  const axiosData = useAxios();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  // Get user-specific localStorage key
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const storageKey = `readNotificationIds_${user._id || user.id || 'default'}`;

  const [readIds, setReadIds] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Error reading readNotificationIds from localStorage:', e);
      return [];
    }
  });

  // Sync readIds to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(readIds));
    } catch (e) {
      console.error('Error saving readNotificationIds to localStorage:', e);
    }
  }, [readIds, storageKey]);

  // Helper function to get relative time
  const getRelativeTime = (dateString) => {
    if (!dateString) return 'Just now';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return formatDate(date, getStoredDateFormat());
  };

  // Listen for storage changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === storageKey) {
        let newReadIds = [];
        try {
          newReadIds = JSON.parse(localStorage.getItem(storageKey) || '[]');
        } catch (err) {
          console.error('Error reading readNotificationIds from localStorage:', err);
        }
        setReadIds(newReadIds);
        // Refresh notifications to update read status
        if (isOpen) {
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
          Promise.all([
            axiosData.get(`/photomerge/templates?adminid=${currentUser._id || currentUser.id}`),
            axiosData.get(`/upload/all?adminid=${currentUser._id || currentUser.id}`)
          ]).then(([templatesRes, photosRes]) => {
            const generatedNotifications = [];
            let currentReadIds = [];
            try {
              currentReadIds = JSON.parse(localStorage.getItem(storageKey) || '[]');
            } catch (err) {
              console.error('Error reading readNotificationIds from localStorage:', err);
            }

            // Templates
            (templatesRes.data || []).sort((a, b) => {
              const timeA = Math.max(new Date(a.createdAt || a.createdDate).getTime(), new Date(a.updatedDate).getTime());
              const timeB = Math.max(new Date(b.createdAt || b.createdDate).getTime(), new Date(b.updatedDate).getTime());
              return timeB - timeA;
            }).forEach(template => {
              const createdAt = template.createdAt || template.createdDate;
              const createdTime = new Date(createdAt).getTime();
              const updatedTime = new Date(template.updatedDate).getTime();
              const isUpdate = updatedTime > createdTime;
              const notificationId = `template-${template._id}`;
              generatedNotifications.push({
                id: notificationId,
                type: 'success',
                title: isUpdate ? 'Template Updated' : 'New Template Added',
                message: `Template "${template.templatename}" has been ${isUpdate ? 'updated' : 'successfully uploaded'}.`,
                time: getRelativeTime(isUpdate ? template.updatedDate : createdAt),
                isRead: currentReadIds.includes(notificationId),
                data: template
              });
            });

            // Photos
            (photosRes.data || []).filter(item => item.source === 'Photo Merge App')
              .sort((a, b) => {
                const timeA = Math.max(new Date(a.createdAt || a.date).getTime(), new Date(a.updatedAt || a.date).getTime());
                const timeB = Math.max(new Date(b.createdAt || b.date).getTime(), new Date(b.updatedAt || b.date).getTime());
                return timeB - timeA;
              }).forEach(photo => {
                const createdAt = photo.createdAt || photo.date;
                const updatedAt = photo.updatedAt || photo.date;
                const createdTime = new Date(createdAt).getTime();
                const updatedTime = new Date(updatedAt).getTime();
                const isUpdate = updatedTime > createdTime;
                const notificationId = `photo-${photo._id}`;
                generatedNotifications.push({
                  id: notificationId,
                  type: 'info',
                  title: isUpdate ? 'Photo Merge Updated' : 'Photo Merge Completed',
                  message: `Photo merge for "${photo.name || 'customer'}" has been ${isUpdate ? 'modified' : 'processed'}.`,
                  time: getRelativeTime(isUpdate ? updatedAt : createdAt),
                  isRead: currentReadIds.includes(notificationId),
                  data: photo
                });
              });

            setNotifications(generatedNotifications);
          }).catch(err => console.error('Error refreshing notifications:', err));
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('notificationStateChange', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('notificationStateChange', handleStorageChange);
    };
  }, [isOpen, axiosData, storageKey]);

  // Generate notifications from real data
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!isOpen && notifications.length > 0) return;

      setLoading(true);
      // Always read from localStorage to get the latest readIds
      let currentReadIds = [];
      try {
        currentReadIds = JSON.parse(localStorage.getItem(storageKey) || '[]');
      } catch (e) {
        console.error('Error reading readNotificationIds from localStorage:', e);
        currentReadIds = [];
      }

      try {
        const [templatesRes, photosRes] = await Promise.all([
          axiosData.get(`/photomerge/templates?adminid=${user._id || user.id}`),
          axiosData.get(`/upload/all?adminid=${user._id || user.id}`)
        ]);

        const generatedNotifications = [];

        // Recent templates
        const recentTemplates = (templatesRes.data || [])
          .sort((a, b) => {
            const timeA = Math.max(new Date(a.createdAt || a.createdDate).getTime(), new Date(a.updatedDate).getTime());
            const timeB = Math.max(new Date(b.createdAt || b.createdDate).getTime(), new Date(b.updatedDate).getTime());
            return timeB - timeA;
          });

        recentTemplates.forEach(template => {
          const createdAt = template.createdAt || template.createdDate;
          const createdTime = new Date(createdAt).getTime();
          const updatedTime = new Date(template.updatedDate).getTime();
          const isUpdate = updatedTime > createdTime;
          const notificationId = `template-${template._id}`;

          generatedNotifications.push({
            id: notificationId,
            type: 'success',
            title: isUpdate ? 'Template Updated' : 'New Template Added',
            message: `Template "${template.templatename}" has been ${isUpdate ? 'updated' : 'successfully uploaded'}.`,
            time: getRelativeTime(isUpdate ? template.updatedDate : createdAt),
            isRead: currentReadIds.includes(notificationId),
            data: template
          });
        });

        // Recent photos
        const recentPhotos = (photosRes.data || [])
          .filter(item => item.source === 'Photo Merge App')
          .sort((a, b) => {
            const timeA = Math.max(new Date(a.createdAt || a.date).getTime(), new Date(a.updatedAt || a.date).getTime());
            const timeB = Math.max(new Date(b.createdAt || b.date).getTime(), new Date(b.updatedAt || b.date).getTime());
            return timeB - timeA;
          });

        recentPhotos.forEach(photo => {
          const createdAt = photo.createdAt || photo.date;
          const updatedAt = photo.updatedAt || photo.date;
          const createdTime = new Date(createdAt).getTime();
          const updatedTime = new Date(updatedAt).getTime();
          const isUpdate = updatedTime > createdTime;
          const notificationId = `photo-${photo._id}`;

          generatedNotifications.push({
            id: notificationId,
            type: 'info',
            title: isUpdate ? 'Photo Merge Updated' : 'Photo Merge Completed',
            message: `Photo merge for "${photo.name || 'customer'}" has been ${isUpdate ? 'modified' : 'processed'}.`,
            time: getRelativeTime(isUpdate ? updatedAt : createdAt),
            isRead: currentReadIds.includes(notificationId),
            data: photo
          });
        });



        setNotifications(generatedNotifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, axiosData, readIds, storageKey]);

  const getIconByType = (type) => {
    switch (type) {
      case 'success': return <Check size={20} />;
      case 'error': return <X size={20} />;
      case 'warning': return <AlertCircle size={20} />;
      default: return <Info size={20} />;
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notif.isRead;
    return notif.isRead;
  });

  const handleMarkAsRead = (id, e) => {
    if (e) e.stopPropagation();
    // Always read from localStorage to ensure we have the latest state
    let currentReadIds = [];
    try {
      currentReadIds = JSON.parse(localStorage.getItem(storageKey) || '[]');
    } catch (e) {
      console.error('Error reading readNotificationIds from localStorage:', e);
      currentReadIds = [];
    }
    if (!currentReadIds.includes(id)) {
      const newReadIds = [...currentReadIds, id];
      setReadIds(newReadIds);
      try {
        localStorage.setItem(storageKey, JSON.stringify(newReadIds));
      } catch (e) {
        console.error('Error saving readNotificationIds to localStorage:', e);
      }
      window.dispatchEvent(new Event('notificationStateChange'));
      // Update local state immediately
      setNotifications(prev => prev.map(notif =>
        notif.id === id ? { ...notif, isRead: true } : notif
      ));
    }
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleNotificationClick = (notif) => {
    handleMarkAsRead(notif.id, { stopPropagation: () => { } });
    onClose();

    // Navigation logic based on notification type/title
    const data = notif.data;
    if (!data) return;

    if (notif.title.includes('Template')) {
      navigate('/admin/templates', { state: { highlightedTemplateId: data._id } });
    } else if (notif.title.includes('Photo') || notif.title.includes('merge')) {
      navigate('/admin/photos', { state: { highlightedPhotoId: data._id } });
    } else if (notif.title.includes('User') || notif.title.includes('registered')) {
      navigate('/admin/customers', { state: { highlightedUserId: data._id } });
    }
  };

  return (
    <>
      <PanelOverlay $isOpen={isOpen} onClick={onClose} />
      <PanelContainer $isOpen={isOpen}>
        <PanelHeader>
          <PanelTitle>Notifications</PanelTitle>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </PanelHeader>

        <NotificationTabs>
          <Tab $active={activeTab === 'all'} onClick={() => setActiveTab('all')}>All</Tab>
          <Tab $active={activeTab === 'unread'} onClick={() => setActiveTab('unread')}>Unread</Tab>
          <Tab $active={activeTab === 'read'} onClick={() => setActiveTab('read')}>Read</Tab>
        </NotificationTabs>

        <NotificationList>
          {loading && notifications.length === 0 ? (
            <EmptyState>
              <EmptyText>Loading notifications...</EmptyText>
            </EmptyState>
          ) : filteredNotifications.length === 0 && !loading ? (
            <EmptyState>
              <EmptyIcon><Check size={40} /></EmptyIcon>
              <EmptyText>No notifications</EmptyText>
            </EmptyState>
          ) : (
            <>
              {loading && notifications.length > 0 && (
                <div style={{ padding: '8px 16px', fontSize: '11px', color: '#A0A0A0', textAlign: 'center' }}>
                  Checking for new notifications...
                </div>
              )}
              {filteredNotifications.map(notif => (
                <NotificationItem
                  key={notif.id}
                  $isRead={notif.isRead}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <NotificationIcon $type={notif.type}>
                    {getIconByType(notif.type)}
                  </NotificationIcon>
                  <NotificationContent>
                    <NotificationTitle>{notif.title}</NotificationTitle>
                    <NotificationMessage>{notif.message}</NotificationMessage>
                    <NotificationTime>{notif.time}</NotificationTime>
                  </NotificationContent>
                  <NotificationActions>
                    {!notif.isRead && (
                      <ActionButton onClick={(e) => handleMarkAsRead(notif.id, e)} title="Mark as read">
                        <Check size={16} />
                      </ActionButton>
                    )}
                    <ActionButton danger onClick={(e) => handleDelete(notif.id, e)} title="Delete">
                      <Trash2 size={16} />
                    </ActionButton>
                  </NotificationActions>
                </NotificationItem>
              ))}
            </>
          )}
        </NotificationList>

        {notifications.length > 0 && (
          <ClearAllButton onClick={handleClearAll}>
            Clear All Notifications
          </ClearAllButton>
        )}
      </PanelContainer>
    </>
  );
};

export default NotificationPanel;
