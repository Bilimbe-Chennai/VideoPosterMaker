import React, { useState, useEffect } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import {
  Edit2,
  Trash2,
  Plus,
  Shield,
  Search,
  MoreVertical,
  Check,
  X
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
  margin-bottom: 32px;
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

const ActionButton = styled.button`
  background: #1A1A1A;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #000;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
`;

const TableCard = styled.div`
  background: white;
  border-radius: 24px;
  box-shadow: ${theme.shadows.card};
  overflow: hidden;
  border: 1px solid rgba(0,0,0,0.03);
`;

const TableHeader = styled.div`
  padding: 24px;
  border-bottom: 1px solid #F0F0F0;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
  }
`;

const SearchInputWrapper = styled.div`
  position: relative;
  width: 300px;
  
  input {
    width: 100%;
    padding: 10px 16px 10px 40px;
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
  }
  
  tr:last-child td {
    border-bottom: none;
  }
  
  tr:hover td {
    background: #FAFAFA;
  }
`;

const AdminAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${props => props.$bg || '#E0E0E0'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
`;

const StatusBadge = styled.span`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => props.$active ? '#E8F5E9' : '#FFEBEE'};
  color: ${props => props.$active ? '#2E7D32' : '#C62828'};
  display: inline-flex;
  align-items: center;
  gap: 4px;
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
  max-width: 500px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
  animation: modalSlideUp 0.3s ease;
  
  @keyframes modalSlideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  h2 {
    margin-top: 0;
    margin-bottom: 24px;
    font-size: 20px;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  
  label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 600;
    color: #333;
  }
  
  input {
    width: 100%;
    padding: 12px;
    border-radius: 12px;
    border: 1px solid #E0E0E0;
    font-size: 14px;
    
    &:focus {
      outline: none;
      border-color: #1A1A1A;
      box-shadow: 0 0 0 2px rgba(0,0,0,0.05);
    }
  }
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  
  button {
    padding: 10px 20px;
    border-radius: 12px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .cancel {
    background: transparent;
    border: 1px solid #E0E0E0;
    color: #666;
    
    &:hover {
      background: #F5F5F5;
    }
  }
  
  .save {
    background: #1A1A1A;
    border: none;
    color: white;
    
    &:hover {
      background: #000;
    }
  }
  
  .delete {
    background: #D32F2F;
    border: none;
    color: white;
    
    &:hover {
      background: #B71C1C;
    }
  }
`;

const AdminList = () => {
  const axiosData = useAxios();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    accessType: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await axiosData.get('users?type=admin');
      setAdmins(response.data.data);
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (adminId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const response = await axiosData.patch(`/users/${adminId}/status`, {
        status: newStatus
      });
      fetchAdmins();
      
      // Dispatch event to notify logged-in users of the update
      if (response.data?.success && response.data?.data) {
        window.dispatchEvent(new CustomEvent('userUpdated', { 
          detail: { userId: adminId, user: response.data.data } 
        }));
      }
    } catch (error) {
      console.error('Error toggling admin status:', error);
    }
  };

  const handleEditClick = (admin) => {
    setSelectedAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      accessType: admin.accessType?.join(', ') || ''
    });
    setEditDialog(true);
  };

  const handleUpdateAdmin = async () => {
    try {
      const response = await axiosData.put(`/users/${selectedAdmin._id}`, {
        ...selectedAdmin,
        ...formData,
        accessType: formData.accessType.split(',').map(opt => opt.trim())
      });
      setEditDialog(false);
      fetchAdmins();
      
      // Dispatch event to notify logged-in users of the update
      if (response.data?.success && response.data?.data) {
        window.dispatchEvent(new CustomEvent('userUpdated', { 
          detail: { userId: selectedAdmin._id, user: response.data.data } 
        }));
      }
    } catch (error) {
      console.error('Error updating admin:', error);
    }
  };

  const handleDeleteClick = (admin) => {
    setSelectedAdmin(admin);
    setDeleteDialog(true);
  };

  const handleDeleteAdmin = async () => {
    try {
      await axiosData.delete(`/users/${selectedAdmin._id}`);
      setDeleteDialog(false);
      fetchAdmins();
    } catch (error) {
      console.error('Error deleting admin:', error);
    }
  };

  const filteredAdmins = admins.filter(admin =>
    admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div>Loading...</div>;

  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #6B8DD6 0%, #8E37D7 100%)',
    'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 99%, #FECFEF 100%)',
    'linear-gradient(135deg, #accbee 0%, #e7f0fd 100%)'
  ];

  return (
    <ThemeProvider theme={theme}>
      <PageContainer>
        <Header>
          <TitleSection>
            <h1>Admin Management</h1>
            <p>Manage administrator access and permissions</p>
          </TitleSection>
          <ActionButton onClick={() => navigate('/superadmin/admins/create')}>
            <Plus size={18} />
            Create New Admin
          </ActionButton>
        </Header>

        <TableCard>
          <TableHeader>
            <h3>All Administrators</h3>
            <SearchInputWrapper>
              <Search />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchInputWrapper>
          </TableHeader>
          <StyledTable>
            <thead>
              <tr>
                <th>Admin Profile</th>
                <th>Email Address</th>
                <th>Permissions</th>
                <th>Status</th>
                <th>Date Added</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdmins.map((admin, idx) => (
                <tr key={admin._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <AdminAvatar $bg={gradients[idx % gradients.length]}>
                        {admin.name.charAt(0).toUpperCase()}
                      </AdminAvatar>
                      <span style={{ fontWeight: 600 }}>{admin.name}</span>
                    </div>
                  </td>
                  <td>{admin.email}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {admin.accessType?.map((role, i) => (
                        <span key={i} style={{
                          fontSize: '11px',
                          background: '#F5F5F5',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          border: '1px solid #E0E0E0'
                        }}>
                          {role}
                        </span>
                      )) || 'No Permissions'}
                    </div>
                  </td>
                  <td>
                    <div
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleToggleStatus(admin._id, admin.status)}
                    >
                      <StatusBadge $active={admin.status === 'active'}>
                        {admin.status === 'active' ? <Check size={12} /> : <X size={12} />}
                        {admin.status === 'active' ? 'Active' : 'Inactive'}
                      </StatusBadge>
                    </div>
                  </td>
                  <td>{new Date(admin.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <ActionButtonSmall onClick={() => handleEditClick(admin)}>
                        <Edit2 size={16} />
                      </ActionButtonSmall>
                      <ActionButtonSmall className="delete" onClick={() => handleDeleteClick(admin)}>
                        <Trash2 size={16} />
                      </ActionButtonSmall>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </StyledTable>
        </TableCard>

        {/* Edit Modal */}
        {editDialog && (
          <ModalOverlay onClick={() => setEditDialog(false)}>
            <ModalContent onClick={e => e.stopPropagation()}>
              <h2>Edit Administrator</h2>
              <FormGroup>
                <label>Full Name</label>
                <input
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </FormGroup>
              <FormGroup>
                <label>Email Address</label>
                <input
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </FormGroup>
              <FormGroup>
                <label>Permissions (comma separated)</label>
                <input
                  value={formData.accessType}
                  onChange={e => setFormData({ ...formData, accessType: e.target.value })}
                  placeholder="e.g. users, templates, settings"
                />
              </FormGroup>
              <ModalActions>
                <button className="cancel" onClick={() => setEditDialog(false)}>Cancel</button>
                <button className="save" onClick={handleUpdateAdmin}>Save Changes</button>
              </ModalActions>
            </ModalContent>
          </ModalOverlay>
        )}

        {/* Delete Modal */}
        {deleteDialog && (
          <ModalOverlay onClick={() => setDeleteDialog(false)}>
            <ModalContent onClick={e => e.stopPropagation()}>
              <h2>Delete Administrator?</h2>
              <p>Are you sure you want to delete <b>{selectedAdmin?.name}</b>? This action cannot be undone.</p>
              <ModalActions>
                <button className="cancel" onClick={() => setDeleteDialog(false)}>Cancel</button>
                <button className="delete" onClick={handleDeleteAdmin}>Delete Admin</button>
              </ModalActions>
            </ModalContent>
          </ModalOverlay>
        )}
      </PageContainer>
    </ThemeProvider>
  );
};

export default AdminList;
