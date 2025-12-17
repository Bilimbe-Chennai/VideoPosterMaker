import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Switch,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Typography,
  Chip,
  Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import useAxios from "../useAxios";

const AdminList = () => {
   const axiosData = useAxios();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    enabledOptions: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await axiosData.get('/admins');
      setAdmins(response.data);
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (adminId, currentStatus) => {
    try {
      await axiosData.put(`/admins/${adminId}/toggle-status`, {
        isEnabled: !currentStatus
      });
      fetchAdmins();
    } catch (error) {
      console.error('Error toggling admin status:', error);
    }
  };

  const handleEditClick = (admin) => {
    setSelectedAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      mobile: admin.mobile || '',
      enabledOptions: admin.enabledOptions?.join(', ') || ''
    });
    setEditDialog(true);
  };

  const handleUpdateAdmin = async () => {
    try {
      await axiosData.put(`/admins/${selectedAdmin._id}`, {
        ...formData,
        enabledOptions: formData.enabledOptions.split(',').map(opt => opt.trim())
      });
      setEditDialog(false);
      fetchAdmins();
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
      await axiosData.delete(`/admins/${selectedAdmin._id}`);
      setDeleteDialog(false);
      fetchAdmins();
    } catch (error) {
      console.error('Error deleting admin:', error);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Admins Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/admins/create')}
        >
          Create Admin
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Logo</TableCell>
              <TableCell>Admin Name</TableCell>
              <TableCell>Email ID</TableCell>
              <TableCell>Created Date</TableCell>
              <TableCell>Mobile</TableCell>
              <TableCell>Counts</TableCell>
              <TableCell>Enabled Options</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {admins.map((admin) => (
              <TableRow key={admin._id} hover>
                <TableCell>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: admin.isSuperAdmin ? 'secondary.main' : 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  >
                    {admin.name.charAt(0).toUpperCase()}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body1" fontWeight="medium">
                      {admin.name}
                    </Typography>
                    {admin.isSuperAdmin && (
                      <Chip label="Super Admin" size="small" color="secondary" />
                    )}
                  </Box>
                </TableCell>
                <TableCell>{admin.email}</TableCell>
                <TableCell>
                  {new Date(admin.createdDate).toLocaleDateString()}
                </TableCell>
                <TableCell>{admin.mobile || 'N/A'}</TableCell>
                <TableCell>
                  <Chip label={admin.counts} color="primary" />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {admin.enabledOptions?.map((option, index) => (
                      <Chip key={index} label={option} size="small" />
                    )) || 'None'}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Switch
                      checked={admin.isEnabled}
                      onChange={() => handleToggleStatus(admin._id, admin.isEnabled)}
                      color="primary"
                    />
                    <Chip 
                      label={admin.isEnabled ? 'Enabled' : 'Disabled'} 
                      color={admin.isEnabled ? 'success' : 'error'}
                      size="small"
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Edit">
                      <IconButton onClick={() => handleEditClick(admin)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    {!admin.isSuperAdmin && (
                      <Tooltip title="Delete">
                        <IconButton onClick={() => handleDeleteClick(admin)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Admin</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Name"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Email"
            fullWidth
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Mobile"
            fullWidth
            value={formData.mobile}
            onChange={(e) => setFormData({...formData, mobile: e.target.value})}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Enabled Options (comma separated)"
            fullWidth
            value={formData.enabledOptions}
            onChange={(e) => setFormData({...formData, enabledOptions: e.target.value})}
            helperText="Separate options with commas"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdateAdmin} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete admin "{selectedAdmin?.name}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteAdmin} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminList;