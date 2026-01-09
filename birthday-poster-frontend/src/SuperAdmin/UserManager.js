import React, { useState, useEffect, useCallback } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import {
  Edit2,
  Trash2,
  Plus,
  Search,
  Download,
  Filter,
  Users,
  Eye,
  Check,
  XCircle,
  Clock
} from 'react-feather';
import { useNavigate } from 'react-router-dom';
import useAxios from "../useAxios";
import { theme } from '../PremiumAdmin/theme';

// --- Styled Components ---

const PageContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const TitleSection = styled.div`
  h1 {
    font-size: 24px;
    font-weight: 700;
    color: #1A1A1A;
    margin: 0 0 8px 0;
  }
  p {
    color: #666;
    margin: 0;
    font-size: 14px;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled.button`
  background: ${props => props.$primary ? '#1A1A1A' : 'white'};
  color: ${props => props.$primary ? 'white' : '#1A1A1A'};
  border: ${props => props.$primary ? 'none' : '1px solid #E0E0E0'};
  border-radius: 12px;
  padding: 10px 20px;
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    background: ${props => props.$primary ? '#000' : '#F5F5F5'};
  }
`;

const ControlsCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 20px;
  box-shadow: ${theme.shadows.card};
  margin-bottom: 24px;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  align-items: center;
  border: 1px solid rgba(0,0,0,0.03);
`;

const InputWrapper = styled.div`
  position: relative;
  flex: 1;
  min-width: 200px;
  
  input {
    width: 100%;
    padding: 12px 16px 12px 40px;
    border-radius: 12px;
    border: 1px solid #E0E0E0;
    background: #FAFAFA;
    font-size: 14px;
    transition: all 0.2s;
    
    &:focus {
      outline: none;
      border-color: #1A1A1A;
      background: white;
      box-shadow: 0 0 0 4px rgba(0,0,0,0.05);
    }
  }
  
  svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #999;
    width: 16px;
    height: 16px;
  }
`;

const SelectWrapper = styled.div`
  position: relative;
  min-width: 180px;
  
  select {
    width: 100%;
    padding: 12px 32px 12px 16px;
    border-radius: 12px;
    border: 1px solid #E0E0E0;
    background: white;
    font-size: 14px;
    appearance: none;
    cursor: pointer;
    
    &:focus {
      outline: none;
      border-color: #1A1A1A;
    }
  }
  
  svg {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #666;
    pointer-events: none;
    width: 16px;
    height: 16px;
  }
`;

const TableCard = styled.div`
  background: white;
  border-radius: 24px;
  box-shadow: ${theme.shadows.card};
  overflow: hidden;
  border: 1px solid rgba(0,0,0,0.03);
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th {
    text-align: left;
    padding: 16px 24px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    color: #888;
    border-bottom: 1px solid #F0F0F0;
    background: #FAFAFA;
  }
  
  td {
    padding: 16px 24px;
    font-size: 14px;
    color: #333;
    border-bottom: 1px solid #F8F8F8;
    vertical-align: middle;
  }
  
  tr:last-child td {
    border-bottom: none;
  }
  
  tr:hover td {
    background: #FAFAFA;
  }
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.$bg || '#667eea'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  
  div {
    display: flex;
    flex-direction: column;
    
    span.name {
      font-weight: 600;
      color: #1A1A1A;
    }
    span.sub {
      font-size: 12px;
      color: #888;
    }
  }
`;

const StatusBadge = styled.span`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => {
    switch (props.$status) {
      case 'active': return '#E8F5E9';
      case 'inactive': return '#FFEBEE';
      default: return '#FFF3E0';
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'active': return '#2E7D32';
      case 'inactive': return '#C62828';
      default: return '#EF6C00';
    }
  }};
  display: inline-flex;
  align-items: center;
  gap: 4px;
  text-transform: capitalize;
`;

const ActionButtonSmall = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid transparent;
  background: transparent;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #F5F5F5;
    color: #1A1A1A;
    border-color: #E0E0E0;
  }
  
  &.delete:hover {
    background: #FFEBEE;
    color: #D32F2F;
    border-color: #FFCDD2;
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
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 24px;
  padding: 32px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
  
  h2 {
    margin-top: 0;
    font-size: 20px;
  }
  
  p {
    color: #666;
  }
  
  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
    
    button {
      padding: 10px 20px;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
    }
    
    .cancel { background: transparent; border: 1px solid #ddd; }
    .delete { background: #D32F2F; color: white; border: none; }
  }
`;

const UserManager = () => {
  const axiosData = useAxios();
  const [users, setUsers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTemplate, setFilterTemplate] = useState('all');
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      const [usersRes, templatesRes] = await Promise.all([
        axiosData.get('users'),
        axiosData.get('photomerge/templates'),
      ]);
      setUsers(usersRes.data.data || []);
      setTemplates(templatesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [axiosData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setDeleteDialog(true);
  };

  const handleDeleteUser = async () => {
    try {
      await axiosData.delete(`/users/${selectedUser._id}`);
      setDeleteDialog(false);
      fetchData();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleExport = () => {
    const csvContent = users.map(user =>
      `${user.name},${user.email},${user.whatsappNumber || ''},${user.status}`
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    a.click();
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.whatsappNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    const matchesTemplate = filterTemplate === 'all' || (user.template && user.template._id === filterTemplate);

    return matchesSearch && matchesStatus && matchesTemplate;
  });

  return (
    <ThemeProvider theme={theme}>
      <PageContainer>
        <Header>
          <TitleSection>
            <h1>User Management</h1>
            <p>Track and manage your application users</p>
          </TitleSection>
          <HeaderActions>
            <Button onClick={handleExport}>
              <Download size={18} /> Export CSV
            </Button>
            <Button $primary onClick={() => navigate('/superadmin/users/create')}>
              <Plus size={18} /> Add User
            </Button>
          </HeaderActions>
        </Header>

        <ControlsCard>
          <InputWrapper>
            <Search />
            <input
              placeholder="Search by name, email, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputWrapper>
          <SelectWrapper>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
            <Filter />
          </SelectWrapper>
          <SelectWrapper>
            <select value={filterTemplate} onChange={(e) => setFilterTemplate(e.target.value)}>
              <option value="all">All Templates</option>
              {templates.map(t => (
                <option key={t._id} value={t._id}>{t.name}</option>
              ))}
            </select>
            <Filter />
          </SelectWrapper>
        </ControlsCard>

        <TableCard>
          <StyledTable>
            <thead>
              <tr>
                <th>User Profile</th>
                <th>Branch</th>
                <th>User Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>
                    <UserInfo>
                      <UserAvatar $bg={theme.colors.gradientPrimary}>
                        {user.name.charAt(0).toUpperCase()}
                      </UserAvatar>
                      <div>
                        <span className="name">{user.name}</span>
                        <span className="sub">{user.email}</span>
                      </div>
                    </UserInfo>
                  </td>
                  <td>{user.branchName || 'N/A'}</td>
                  <td>
                    <span style={{
                      background: '#F0F0F0',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      textTransform: 'uppercase'
                    }}>
                      {user.type}
                    </span>
                  </td>
                  <td>
                    <StatusBadge $status={user.status}>
                      {user.status === 'active' ? <Check size={12} /> :
                        user.status === 'inactive' ? <XCircle size={12} /> : <Clock size={12} />}
                      {user.status}
                    </StatusBadge>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <ActionButtonSmall onClick={() => navigate(`/users/${user._id}`)}>
                        <Eye size={16} />
                      </ActionButtonSmall>
                      <ActionButtonSmall onClick={() => navigate(`/superadmin/users/edit/${user._id}`)}>
                        <Edit2 size={16} />
                      </ActionButtonSmall>
                      <ActionButtonSmall className="delete" onClick={() => handleDeleteClick(user)}>
                        <Trash2 size={16} />
                      </ActionButtonSmall>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </StyledTable>
        </TableCard>

        {deleteDialog && (
          <ModalOverlay onClick={() => setDeleteDialog(false)}>
            <ModalContent onClick={e => e.stopPropagation()}>
              <h2>Delete User?</h2>
              <p>Are you sure you want to delete <b>{selectedUser?.name}</b>?</p>
              <div className="actions">
                <button className="cancel" onClick={() => setDeleteDialog(false)}>Cancel</button>
                <button className="delete" onClick={handleDeleteUser}>Delete</button>
              </div>
            </ModalContent>
          </ModalOverlay>
        )}
      </PageContainer>
    </ThemeProvider>
  );
};

export default UserManager;