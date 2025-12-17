import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip,
  Divider,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  LinearProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import PhotoIcon from '@mui/icons-material/Photo';
import HistoryIcon from '@mui/icons-material/History';
import InfoIcon from '@mui/icons-material/Info';
import DeleteIcon from '@mui/icons-material/Delete';
import useAxios from "../useAxios";

const UserDetails = () => {
   const axiosData = useAxios();
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      const response = await axiosData.get(`/users/${id}`);
      setUser(response.data);
    } catch (err) {
      setError('Failed to load user details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleDeletePhoto = async (photoType) => {
    if (window.confirm(`Are you sure you want to delete ${photoType} photo?`)) {
      try {
        await axiosData.put(`/users/${id}/remove-photo`, { photoType });
        fetchUser();
      } catch (err) {
        console.error('Error deleting photo:', err);
      }
    }
  };

  if (loading) return <LinearProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!user) return <Alert severity="info">User not found</Alert>;

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/users')}
          sx={{ mr: 2 }}
        >
          Back to Users
        </Button>
        <Typography variant="h4" component="h1">
          User Details
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/users/edit/${id}`)}
          sx={{ mr: 2 }}
        >
          Edit User
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* User Info Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                <Avatar
                  sx={{ width: 100, height: 100, mb: 2 }}
                  src={user.originalPhoto || `https://ui-avatars.com/api/?name=${user.name}&size=100`}
                />
                <Typography variant="h5">{user.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
                <Chip 
                  label={user.status} 
                  color={
                    user.status === 'active' ? 'success' :
                    user.status === 'inactive' ? 'error' : 'warning'
                  }
                  sx={{ mt: 1 }}
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography>
                  <strong>WhatsApp:</strong> {user.whatsappNumber || 'N/A'}
                </Typography>
                <Typography>
                  <strong>Place:</strong> {user.place || 'N/A'}
                </Typography>
                <Typography>
                  <strong>Joined:</strong> {new Date(user.date).toLocaleDateString()}
                </Typography>
                <Typography>
                  <strong>User ID:</strong> {user._id.slice(-8)}
                </Typography>
              </Box>

              {user.template && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" gutterBottom>
                    Assigned Template:
                  </Typography>
                  <Chip 
                    label={user.template.name} 
                    color="primary"
                    size="small"
                  />
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <Paper>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab icon={<InfoIcon />} label="Information" />
              <Tab icon={<PhotoIcon />} label="Photos" />
              <Tab icon={<HistoryIcon />} label="Activity" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Contact Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography>
                        <strong>Full Name:</strong> {user.name}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography>
                        <strong>Email Address:</strong> {user.email}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography>
                        <strong>Phone:</strong> {user.whatsappNumber || 'Not provided'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography>
                        <strong>Location:</strong> {user.place || 'Not provided'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Account Status
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Chip 
                      label={`Status: ${user.status}`}
                      color={
                        user.status === 'active' ? 'success' :
                        user.status === 'inactive' ? 'error' : 'warning'
                      }
                    />
                    <Chip 
                      label={`Verified: ${user.verified ? 'Yes' : 'No'}`}
                      color={user.verified ? 'success' : 'default'}
                    />
                    <Chip 
                      label={`Last Active: ${new Date(user.lastActive || user.date).toLocaleDateString()}`}
                    />
                  </Box>
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Original Photo
                  </Typography>
                  {user.originalPhoto ? (
                    <Box sx={{ position: 'relative' }}>
                      <img
                        src={user.originalPhoto}
                        alt="Original"
                        style={{ width: '100%', borderRadius: 8 }}
                      />
                      <IconButton
                        sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.5)' }}
                        onClick={() => handleDeletePhoto('original')}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ) : (
                    <Alert severity="info">
                      No original photo uploaded
                    </Alert>
                  )}
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Selected/Processed Photo
                  </Typography>
                  {user.selectedPhoto ? (
                    <Box sx={{ position: 'relative' }}>
                      <img
                        src={user.selectedPhoto}
                        alt="Selected"
                        style={{ width: '100%', borderRadius: 8 }}
                      />
                      <IconButton
                        sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.5)' }}
                        onClick={() => handleDeletePhoto('selected')}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ) : (
                    <Alert severity="info">
                      No processed photo available
                    </Alert>
                  )}
                </Grid>

                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    startIcon={<PhotoIcon />}
                    onClick={() => navigate(`/upload?userId=${id}`)}
                  >
                    Upload New Photos
                  </Button>
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Activity</TableCell>
                      <TableCell>Details</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>{new Date(user.date).toLocaleDateString()}</TableCell>
                      <TableCell>Account Created</TableCell>
                      <TableCell>User registered in the system</TableCell>
                    </TableRow>
                    {user.originalPhoto && (
                      <TableRow>
                        <TableCell>{new Date(user.date).toLocaleDateString()}</TableCell>
                        <TableCell>Photo Uploaded</TableCell>
                        <TableCell>Original photo uploaded</TableCell>
                      </TableRow>
                    )}
                    {user.selectedPhoto && (
                      <TableRow>
                        <TableCell>{new Date(user.date).toLocaleDateString()}</TableCell>
                        <TableCell>Photo Processed</TableCell>
                        <TableCell>Photo processed with template</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default UserDetails;