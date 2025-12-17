import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  IconButton,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import PreviewIcon from '@mui/icons-material/Preview';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAxios from "../useAxios";

const PhotoUpload = () => {
   const axiosData = useAxios();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    userId: searchParams.get('userId') || '',
    templateId: '',
    originalPhoto: null,
    selectedPhoto: null,
    notes: '',
  });

  const [preview, setPreview] = useState({
    original: null,
    selected: null,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, templatesRes] = await Promise.all([
        axiosData.get('/users'),
        axiosData.get('/templates'),
      ]);
      setUsers(usersRes.data);
      setTemplates(templatesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleFileChange = (type) => (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size should be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        [type === 'original' ? 'originalPhoto' : 'selectedPhoto']: file,
      }));
      setPreview(prev => ({
        ...prev,
        [type]: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = (type) => {
    setFormData(prev => ({
      ...prev,
      [type === 'original' ? 'originalPhoto' : 'selectedPhoto']: null,
    }));
    setPreview(prev => ({
      ...prev,
      [type]: null,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setUploading(true);

    if (!formData.userId) {
      setError('Please select a user');
      setUploading(false);
      return;
    }

    if (!formData.originalPhoto) {
      setError('Please upload an original photo');
      setUploading(false);
      return;
    }

    const submitData = new FormData();
    submitData.append('userId', formData.userId);
    submitData.append('originalPhoto', formData.originalPhoto);
    
    if (formData.templateId) {
      submitData.append('templateId', formData.templateId);
    }
    
    if (formData.selectedPhoto) {
      submitData.append('selectedPhoto', formData.selectedPhoto);
    }
    
    if (formData.notes) {
      submitData.append('notes', formData.notes);
    }

    try {
      await axiosData.post('/photos/upload', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess('Photos uploaded successfully!');
      setFormData({
        userId: '',
        templateId: '',
        originalPhoto: null,
        selectedPhoto: null,
        notes: '',
      });
      setPreview({
        original: null,
        selected: null,
      });

      setTimeout(() => {
        navigate('/users');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const selectedUser = users.find(u => u._id === formData.userId);
  const selectedTemplate = templates.find(t => t._id === formData.templateId);

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Upload Photos
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Paper sx={{ p: 4 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* User Selection */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Select User</InputLabel>
                <Select
                  value={formData.userId}
                  onChange={(e) => setFormData({...formData, userId: e.target.value})}
                  label="Select User"
                  required
                >
                  <MenuItem value="">
                    <em>Select a user</em>
                  </MenuItem>
                  {users.map(user => (
                    <MenuItem key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {selectedUser && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="subtitle2">
                    Selected User: {selectedUser.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Email: {selectedUser.email} | WhatsApp: {selectedUser.whatsappNumber || 'N/A'}
                  </Typography>
                </Box>
              )}
            </Grid>

            {/* Template Selection */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Select Template (Optional)</InputLabel>
                <Select
                  value={formData.templateId}
                  onChange={(e) => setFormData({...formData, templateId: e.target.value})}
                  label="Select Template (Optional)"
                >
                  <MenuItem value="">
                    <em>No template</em>
                  </MenuItem>
                  {templates.map(template => (
                    <MenuItem key={template._id} value={template._id}>
                      {template.name} ({template.type})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {selectedTemplate && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="subtitle2">
                    Selected Template: {selectedTemplate.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Type: {selectedTemplate.type} | Description: {selectedTemplate.description || 'No description'}
                  </Typography>
                </Box>
              )}
            </Grid>

            {/* Original Photo Upload */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom align="center">
                    Original Photo
                  </Typography>
                  
                  {preview.original ? (
                    <Box sx={{ position: 'relative', mb: 2 }}>
                      <img
                        src={preview.original}
                        alt="Original Preview"
                        style={{ width: '100%', maxHeight: 300, objectFit: 'contain', borderRadius: 8 }}
                      />
                      <IconButton
                        sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.5)' }}
                        onClick={() => handleRemoveFile('original')}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        border: '2px dashed grey',
                        borderRadius: 2,
                        p: 4,
                        textAlign: 'center',
                        mb: 2,
                        cursor: 'pointer',
                        '&:hover': {
                          borderColor: 'primary.main',
                        },
                      }}
                      onClick={() => document.getElementById('original-upload').click()}
                    >
                      <CloudUploadIcon sx={{ fontSize: 48, color: 'grey.500', mb: 2 }} />
                      <Typography color="text.secondary">
                        Click to upload original photo
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Max size: 10MB
                      </Typography>
                    </Box>
                  )}

                  <input
                    id="original-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange('original')}
                    style={{ display: 'none' }}
                  />

                  <Button
                    fullWidth
                    variant="outlined"
                    component="label"
                    startIcon={<CloudUploadIcon />}
                  >
                    {preview.original ? 'Change Photo' : 'Upload Original Photo'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange('original')}
                      hidden
                    />
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Selected/Processed Photo Upload */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom align="center">
                    Selected/Processed Photo
                  </Typography>
                  
                  {preview.selected ? (
                    <Box sx={{ position: 'relative', mb: 2 }}>
                      <img
                        src={preview.selected}
                        alt="Selected Preview"
                        style={{ width: '100%', maxHeight: 300, objectFit: 'contain', borderRadius: 8 }}
                      />
                      <IconButton
                        sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.5)' }}
                        onClick={() => handleRemoveFile('selected')}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        border: '2px dashed grey',
                        borderRadius: 2,
                        p: 4,
                        textAlign: 'center',
                        mb: 2,
                        cursor: 'pointer',
                        '&:hover': {
                          borderColor: 'primary.main',
                        },
                      }}
                      onClick={() => document.getElementById('selected-upload').click()}
                    >
                      <CloudUploadIcon sx={{ fontSize: 48, color: 'grey.500', mb: 2 }} />
                      <Typography color="text.secondary">
                        Click to upload selected/processed photo
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Optional
                      </Typography>
                    </Box>
                  )}

                  <input
                    id="selected-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange('selected')}
                    style={{ display: 'none' }}
                  />

                  <Button
                    fullWidth
                    variant="outlined"
                    component="label"
                    startIcon={<CloudUploadIcon />}
                  >
                    {preview.selected ? 'Change Photo' : 'Upload Selected Photo'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange('selected')}
                      hidden
                    />
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Notes */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes (Optional)"
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Add any notes or comments about these photos..."
              />
            </Grid>

            {/* Upload Progress */}
            {uploading && (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography>Uploading...</Typography>
                  <LinearProgress sx={{ flexGrow: 1 }} />
                </Box>
              </Grid>
            )}

            {/* Actions */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/users')}
                  disabled={uploading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={uploading || !formData.userId || !formData.originalPhoto}
                >
                  {uploading ? 'Uploading...' : 'Upload Photos'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default PhotoUpload;