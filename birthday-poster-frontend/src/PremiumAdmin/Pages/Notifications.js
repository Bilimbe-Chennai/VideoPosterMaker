import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Bell, Check, Trash2, AlertCircle, Info, Filter, Search } from 'react-feather';
import useAxios from '../../useAxios';
import Card from '../Components/Card';

const PageContainer = styled.div``;

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

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
`;

const ActionButton = styled.button`
  padding: 10px 20px;
  border-radius: 12px;
  border: 1px solid #E5E7EB;
  background: #FFF;
  color: #374151;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover {
    background: #F9FAFB;
    border-color: #D1D5DB;
  }
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const SearchBox = styled.div`
  position: relative;
  flex: 1;

  input {
    width: 100%;
    padding: 12px 16px 12px 44px;
    border-radius: 16px;
    border: 1.5px solid #EEE;
    font-size: 14px;
    outline: none;
    transition: all 0.2s;

    &:focus {
      border-color: #6366F1;
      box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
    }
  }

  svg {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: #9CA3AF;
  }
`;

const ListContainer = styled(Card)`
  padding: 0;
  border-radius: 24px;
  overflow: hidden;
`;

const NotificationList = styled.div`
  display: flex;
  flex-direction: column;
`;

const NotificationItem = styled.div`
  display: flex;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #F3F4F6;
  background: ${props => props.$isRead ? '#FFF' : '#F9FAFB'};
  transition: all 0.2s;

  &:hover {
    background: #F3F4F6;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const IconWrapper = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  background: ${props => {
        switch (props.$type) {
            case 'success': return '#ECFDF5';
            case 'error': return '#FEF2F2';
            case 'warning': return '#FFFBEB';
            default: return '#EFF6FF';
        }
    }};
  color: ${props => {
        switch (props.$type) {
            case 'success': return '#059669';
            case 'error': return '#DC2626';
            case 'warning': return '#D97706';
            default: return '#2563EB';
        }
    }};
`;

const Content = styled.div`
  flex: 1;
`;

const TitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
`;

const Title = styled.h4`
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #111827;
`;

const Time = styled.span`
  font-size: 12px;
  color: #6B7280;
`;

const Message = styled.p`
  margin: 0;
  font-size: 14px;
  color: #4B5563;
  line-height: 1.5;
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  margin-left: 16px;
`;

const RoundButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: #9CA3AF;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$danger ? '#FEF2F2' : '#F3F4F6'};
    color: ${props => props.$danger ? '#EF4444' : '#6366F1'};
  }
`;

const StatusBadge = styled.span`
    padding: 2px 8px;
    border-radius: 100px;
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    margin-left: 8px;
    background: ${props => props.$update ? '#DBEAFE' : '#D1FAE5'};
    color: ${props => props.$update ? '#1E40AF' : '#065F46'};
`;

const Notifications = () => {
    const axiosData = useAxios();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    
    // Get user-specific localStorage key
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

    useEffect(() => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(readIds));
        } catch (e) {
            console.error('Error saving readNotificationIds to localStorage:', e);
        }
    }, [readIds, storageKey]);

    // Listen for storage changes from other tabs/windows
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === storageKey || e.type === 'notificationStateChange') {
                try {
                    const newReadIds = JSON.parse(localStorage.getItem(storageKey) || '[]');
                    setReadIds(newReadIds);
                    // The useEffect with readIds dependency will automatically trigger fetchAllData
                } catch (err) {
                    console.error('Error reading readNotificationIds from localStorage:', err);
                }
            }
        };
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('notificationStateChange', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('notificationStateChange', handleStorageChange);
        };
    }, [storageKey]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            // Always read from localStorage to get the latest readIds
            let currentReadIds = [];
            try {
                currentReadIds = JSON.parse(localStorage.getItem(storageKey) || '[]');
            } catch (e) {
                console.error('Error reading readNotificationIds from localStorage:', e);
                currentReadIds = [];
            }
            
            const [templatesRes, photosRes] = await Promise.all([
                axiosData.get(`/photomerge/templates?adminid=${user._id || user.id}`),
                axiosData.get(`/upload/all?adminid=${user._id || user.id}`)
            ]);

            const allNotifs = [];

            // Templates Notifications
            (templatesRes.data || []).forEach(t => {
                const createdAt = t.createdAt || t.createdDate;
                const createdTime = new Date(createdAt).getTime();
                const updatedTime = new Date(t.updatedDate).getTime();
                const isUpdate = updatedTime > createdTime;
                const notificationId = `template-${t._id}`;
                allNotifs.push({
                    id: notificationId,
                    type: 'success',
                    title: isUpdate ? 'Template Updated' : 'New Template Created',
                    isUpdate,
                    message: `Template "${t.templatename}" has been ${isUpdate ? 'updated' : 'created'}.`,
                    timestamp: isUpdate ? updatedTime : createdTime,
                    date: isUpdate ? t.updatedDate : createdAt,
                    category: 'templates',
                    isRead: currentReadIds.includes(notificationId)
                });
            });

            // Photos Notifications
            (photosRes.data || []).filter(p => p.source === 'Photo Merge App').forEach(p => {
                const createdAt = p.createdAt || p.date;
                const updatedAt = p.updatedAt || p.date;
                const createdTime = new Date(createdAt).getTime();
                const updatedTime = new Date(updatedAt).getTime();
                const isUpdate = updatedTime > createdTime;
                const notificationId = `photo-${p._id}`;
                allNotifs.push({
                    id: notificationId,
                    type: 'info',
                    title: isUpdate ? 'Photo Updated' : 'Photo Created',
                    isUpdate,
                    message: `Photo merge for "${p.name || 'Customer'}" has been ${isUpdate ? 'modified' : 'processed'}.`,
                    timestamp: isUpdate ? updatedTime : createdTime,
                    date: isUpdate ? updatedAt : createdAt,
                    category: 'photos',
                    isRead: currentReadIds.includes(notificationId)
                });
            });



            setNotifications(allNotifs.sort((a, b) => b.timestamp - a.timestamp));
        } catch (error) {
            console.error("Error fetching notifications", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, [readIds]);

    const handleMarkAsRead = (id) => {
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
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            window.dispatchEvent(new Event('notificationStateChange'));
        }
    };

    const handleDelete = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const handleMarkAllRead = () => {
        // Always read from localStorage to ensure we have the latest state
        let currentReadIds = [];
        try {
            currentReadIds = JSON.parse(localStorage.getItem(storageKey) || '[]');
        } catch (e) {
            console.error('Error reading readNotificationIds from localStorage:', e);
            currentReadIds = [];
        }
        const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
        const newReadIds = [...new Set([...currentReadIds, ...unreadIds])];
        setReadIds(newReadIds);
        try {
            localStorage.setItem(storageKey, JSON.stringify(newReadIds));
        } catch (e) {
            console.error('Error saving readNotificationIds to localStorage:', e);
        }
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        window.dispatchEvent(new Event('notificationStateChange'));
    };

    const filteredNotifications = notifications.filter(n => {
        const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.message.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filter === 'all' ||
            (filter === 'unread' && !n.isRead) ||
            (filter === 'read' && n.isRead);
        return matchesSearch && matchesType;
    });

    return (
        <PageContainer>
            <HeaderSection>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <h1 style={{ marginBottom: 0 }}>System Notifications</h1>
                        <span style={{
                            background: '#FEE2E2',
                            color: '#DC2626',
                            padding: '4px 12px',
                            borderRadius: '100px',
                            fontSize: '12px',
                            fontWeight: 700
                        }}>
                            {notifications.filter(n => !n.isRead).length} New
                        </span>
                    </div>
                    <p style={{ color: '#6B7280', marginTop: '8px' }}>Monitor all creation and update events across your workspace.</p>
                </div>
                <ActionButtons>
                    <ActionButton onClick={handleMarkAllRead}>
                        <Check size={18} />
                        Mark All as Read
                    </ActionButton>
                    <ActionButton onClick={() => setNotifications([])}>
                        <Trash2 size={18} />
                        Clear All
                    </ActionButton>
                </ActionButtons>
            </HeaderSection>

            <FilterGrid>
                <SearchBox>
                    <Search size={20} />
                    <input
                        placeholder="Search notifications..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </SearchBox>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {['all', 'unread', 'read'].map(f => (
                        <ActionButton
                            key={f}
                            style={{
                                background: filter === f ? '#EEF2FF' : '#FFF',
                                borderColor: filter === f ? '#6366F1' : '#E5E7EB',
                                color: filter === f ? '#4F46E5' : '#374151'
                            }}
                            onClick={() => setFilter(f)}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </ActionButton>
                    ))}
                </div>
            </FilterGrid>

            <ListContainer>
                {loading ? (
                    <div style={{ padding: '80px', textAlign: 'center', color: '#6B7280' }}>
                        Loading system activities...
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        padding: '100px 20px',
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
                            <Bell size={40} />
                        </div>
                        <div style={{ fontSize: '20px', fontWeight: 800, color: '#111827', marginBottom: '8px' }}>
                            No notifications found
                        </div>
                        <div style={{ color: '#6B7280', textAlign: 'center', maxWidth: '400px', fontSize: '14px' }}>
                            {searchQuery || filter !== 'all'
                                ? "We couldn't find any notifications matching your filters."
                                : "Everything is quiet! New activities will appear here as they happen."}
                        </div>
                    </div>
                ) : (
                    <NotificationList>
                        {filteredNotifications.map(notif => (
                            <NotificationItem key={notif.id} $isRead={notif.isRead} onClick={() => handleMarkAsRead(notif.id)}>
                                <IconWrapper $type={notif.type}>
                                    {notif.type === 'success' ? <Check size={24} /> :
                                        notif.type === 'error' ? <AlertCircle size={24} /> :
                                            <Info size={24} />}
                                </IconWrapper>
                                <Content>
                                    <TitleRow>
                                        <Title>
                                            {notif.title}
                                            <StatusBadge $update={notif.isUpdate}>
                                                {notif.isUpdate ? 'Updated' : 'Created'}
                                            </StatusBadge>
                                        </Title>
                                        <Time>{new Date(notif.date).toLocaleString()}</Time>
                                    </TitleRow>
                                    <Message>{notif.message}</Message>
                                </Content>
                                <Actions>
                                    {!notif.isRead && (
                                        <RoundButton onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notif.id); }} title="Mark as read">
                                            <Check size={18} />
                                        </RoundButton>
                                    )}
                                    <RoundButton $danger onClick={(e) => { e.stopPropagation(); handleDelete(notif.id); }} title="Delete">
                                        <Trash2 size={18} />
                                    </RoundButton>
                                </Actions>
                            </NotificationItem>
                        ))}
                    </NotificationList>
                )}
            </ListContainer>
        </PageContainer>
    );
};

export default Notifications;
