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

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const adminId = user._id || user.id;
            
            // Fetch notifications from API
            const [notificationsRes, templatesRes, photosRes] = await Promise.all([
                axiosData.get(`/notifications?adminid=${adminId}`),
                axiosData.get(`/photomerge/templates?adminid=${adminId}&page=1&limit=100`),
                axiosData.get(`/upload/all?adminid=${adminId}&page=1&limit=100`)
            ]);

            // Get existing notifications from API
            const existingNotifications = notificationsRes.data?.data || [];
            const existingNotificationIds = new Set(existingNotifications.map(n => n.notificationId));

            const allNotifs = [...existingNotifications];

            // Handle paginated responses
            const templatesArray = Array.isArray(templatesRes.data?.data) 
                ? templatesRes.data.data 
                : (Array.isArray(templatesRes.data) ? templatesRes.data : []);
            const photosArray = Array.isArray(photosRes.data?.data) 
                ? photosRes.data.data 
                : (Array.isArray(photosRes.data) ? photosRes.data : []);

            // Sync Templates Notifications
            for (const t of templatesArray) {
                const createdAt = t.createdAt || t.createdDate;
                const createdTime = new Date(createdAt).getTime();
                const updatedTime = new Date(t.updatedDate || createdAt).getTime();
                const isUpdate = updatedTime > createdTime;
                const notificationId = `template-${t._id}`;
                
                if (!existingNotificationIds.has(notificationId)) {
                    // Create new notification in API
                    try {
                        await axiosData.post('/notifications', {
                            adminid: adminId,
                            notificationId,
                            type: 'success',
                            title: isUpdate ? 'Template Updated' : 'New Template Created',
                            message: `Template "${t.templatename}" has been ${isUpdate ? 'updated' : 'created'}.`,
                            category: 'templates',
                            isUpdate,
                            timestamp: isUpdate ? updatedTime : createdTime,
                            date: isUpdate ? t.updatedDate : createdAt
                        });
                        
                        // Add to local list
                        allNotifs.push({
                            notificationId,
                            type: 'success',
                            title: isUpdate ? 'Template Updated' : 'New Template Created',
                            isUpdate,
                            message: `Template "${t.templatename}" has been ${isUpdate ? 'updated' : 'created'}.`,
                            timestamp: isUpdate ? updatedTime : createdTime,
                            date: isUpdate ? t.updatedDate : createdAt,
                            category: 'templates',
                            isRead: false
                        });
                    } catch (err) {
                        console.error('Error creating template notification:', err);
                    }
                }
            }

            // Sync Photos and Videos Notifications
            for (const p of photosArray.filter(p => p.source === 'Photo Merge App' || p.source === 'Video Merge App')) {
                const createdAt = p.createdAt || p.date;
                const updatedAt = p.updatedAt || p.date;
                const createdTime = new Date(createdAt).getTime();
                const updatedTime = new Date(updatedAt).getTime();
                const isUpdate = updatedTime > createdTime;
                const notificationId = `photo-${p._id}`;
                
                if (!existingNotificationIds.has(notificationId)) {
                    // Create new notification in API
                    const isVideo = p.source === 'Video Merge App';
                    try {
                        await axiosData.post('/notifications', {
                            adminid: adminId,
                            notificationId,
                            type: 'info',
                            title: isUpdate ? (isVideo ? 'Video Updated' : 'Photo Updated') : (isVideo ? 'Video Created' : 'Photo Created'),
                            message: `${isVideo ? 'Video merge' : 'Photo merge'} for "${p.name || 'Customer'}" has been ${isUpdate ? 'modified' : 'processed'}.`,
                            category: isVideo ? 'videos' : 'photos',
                            isUpdate,
                            timestamp: isUpdate ? updatedTime : createdTime,
                            date: isUpdate ? updatedAt : createdAt
                        });
                        
                        // Add to local list
                        allNotifs.push({
                            notificationId,
                            type: 'info',
                            title: isUpdate ? (isVideo ? 'Video Updated' : 'Photo Updated') : (isVideo ? 'Video Created' : 'Photo Created'),
                            isUpdate,
                            message: `${isVideo ? 'Video merge' : 'Photo merge'} for "${p.name || 'Customer'}" has been ${isUpdate ? 'modified' : 'processed'}.`,
                            timestamp: isUpdate ? updatedTime : createdTime,
                            date: isUpdate ? updatedAt : createdAt,
                            category: isVideo ? 'videos' : 'photos',
                            isRead: false
                        });
                    } catch (err) {
                        console.error('Error creating photo/video notification:', err);
                    }
                }
            }

            // Map API response to frontend format
            const mappedNotifications = allNotifs.map(n => ({
                id: n.notificationId || n.id,
                type: n.type,
                title: n.title,
                message: n.message,
                isUpdate: n.isUpdate,
                timestamp: n.timestamp,
                date: n.date || (n.timestamp ? new Date(n.timestamp) : new Date()),
                category: n.category,
                isRead: n.isRead || false
            }));

            setNotifications(mappedNotifications.sort((a, b) => b.timestamp - a.timestamp));
        } catch (error) {
            console.error("Error fetching notifications", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const handleMarkAsRead = async (id) => {
        try {
            const adminId = user._id || user.id;
            await axiosData.post(`/notifications/${id}/read`, { adminid: adminId });
            
            // Update local state optimistically
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error('Error marking notification as read:', error);
            // Revert on error
            fetchAllData();
        }
    };

    const handleDelete = async (id) => {
        try {
            const adminId = user._id || user.id;
            await axiosData.delete(`/notifications/${id}?adminid=${adminId}`);
            
            // Update local state optimistically
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (error) {
            console.error('Error deleting notification:', error);
            // Revert on error
            fetchAllData();
        }
    };

    const handleMarkAllRead = async () => {
        try {
            const adminId = user._id || user.id;
            await axiosData.post('/notifications/mark-all-read', { adminid: adminId });
            
            // Update local state optimistically
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            // Revert on error
            fetchAllData();
        }
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
                    <ActionButton onClick={async () => {
                        const adminId = user._id || user.id;
                        const deletePromises = notifications.map(n => 
                            axiosData.delete(`/notifications/${n.id}?adminid=${adminId}`).catch(err => console.error('Error deleting:', err))
                        );
                        await Promise.all(deletePromises);
                        setNotifications([]);
                    }}>
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
                                        <Time>{notif.date ? new Date(notif.date).toLocaleString() : (notif.timestamp ? new Date(notif.timestamp).toLocaleString() : 'N/A')}</Time>
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
