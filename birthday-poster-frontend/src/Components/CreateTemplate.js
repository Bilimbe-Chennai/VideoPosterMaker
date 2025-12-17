import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Divider,
  Chip,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import PreviewIcon from '@mui/icons-material/Preview';
import useAxios from "../useAxios";

const steps = ['Basic Info', 'Settings', 'Preview'];

const CreateTemplate = () => {
   const axiosData = useAxios();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'basic',
    settings: {
      allowUpload: true,
      maxFileSize: 5,
      allowedFormats: ['jpg', 'png', 'pdf'],
      requireApproval: false,
      autoGenerate: true,
      watermark: false,
      compression: 'medium',
    },
    customFields: [],
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [newField, setNewField] = useState({ name: '', type: 'text' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSettingsChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      settings: {
        ...formData.settings,
        [field]: value,
      },
    });
  };

  const handleAddField = () => {
    if (newField.name.trim()) {
      setFormData({
        ...formData,
        customFields: [...formData.customFields, { ...newField, id: Date.now() }],
      });
      setNewField({ name: '', type: 'text' });
    }
  };

  const handleRemoveField = (id) => {
    setFormData({
      ...formData,
      customFields: formData.customFields.filter(field => field.id !== id),
    });
  };

  const handleNext = () => {
    if (activeStep === 0 && (!formData.name || !formData.type)) {
      setError('Please fill in all required fields');
      return;
    }
    setError('');
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      await axiosData.post('/templates', formData);
      setSuccess('Template created successfully!');
      
      setTimeout(() => {
        navigate('/templates');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create template');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Template Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                margin="normal"
                helperText="Enter a descriptive name for the template"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                margin="normal"
                multiline
                rows={3}
                helperText="Describe the purpose of this template"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Template Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  label="Template Type"
                >
                  <MenuItem value="basic">Basic</MenuItem>
                  <MenuItem value="advanced">Advanced</MenuItem>
                  <MenuItem value="custom">Custom</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Upload Settings
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.settings.allowUpload}
                    onChange={handleSettingsChange('allowUpload')}
                  />
                }
                label="Allow File Upload"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.settings.requireApproval}
                    onChange={handleSettingsChange('requireApproval')}
                  />
                }
                label="Require Approval"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.settings.autoGenerate}
                    onChange={handleSettingsChange('autoGenerate')}
                  />
                }
                label="Auto-generate Preview"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.settings.watermark}
                    onChange={handleSettingsChange('watermark')}
                  />
                }
                label="Add Watermark"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Max File Size (MB)"
                type="number"
                value={formData.settings.maxFileSize}
                onChange={handleSettingsChange('maxFileSize')}
                margin="normal"
                InputProps={{ inputProps: { min: 1, max: 100 } }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Compression Level</InputLabel>
                <Select
                  value={formData.settings.compression}
                  onChange={handleSettingsChange('compression')}
                  label="Compression Level"
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" gutterBottom>
                Custom Fields
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  label="Field Name"
                  value={newField.name}
                  onChange={(e) => setNewField({...newField, name: e.target.value})}
                  size="small"
                />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={newField.type}
                    onChange={(e) => setNewField({...newField, type: e.target.value})}
                    label="Type"
                  >
                    <MenuItem value="text">Text</MenuItem>
                    <MenuItem value="number">Number</MenuItem>
                    <MenuItem value="date">Date</MenuItem>
                    <MenuItem value="dropdown">Dropdown</MenuItem>
                  </Select>
                </FormControl>
                <Button onClick={handleAddField} variant="outlined">
                  Add Field
                </Button>
              </Box>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.customFields.map((field) => (
                  <Chip
                    key={field.id}
                    label={`${field.name} (${field.type})`}
                    onDelete={() => handleRemoveField(field.id)}
                    color="primary"
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Template Preview
                  </Typography>
                  <Typography variant="body1">
                    <strong>Name:</strong> {formData.name}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Type:</strong> {formData.type}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Description:</strong> {formData.description}
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle1" gutterBottom>
                    Settings:
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="body2">
                      • Allow Upload: {formData.settings.allowUpload ? 'Yes' : 'No'}
                    </Typography>
                    <Typography variant="body2">
                      • Max File Size: {formData.settings.maxFileSize} MB
                    </Typography>
                    <Typography variant="body2">
                      • Require Approval: {formData.settings.requireApproval ? 'Yes' : 'No'}
                    </Typography>
                    <Typography variant="body2">
                      • Auto-generate: {formData.settings.autoGenerate ? 'Yes' : 'No'}
                    </Typography>
                    <Typography variant="body2">
                      • Watermark: {formData.settings.watermark ? 'Yes' : 'No'}
                    </Typography>
                    <Typography variant="body2">
                      • Compression: {formData.settings.compression}
                    </Typography>
                  </Box>

                  {formData.customFields.length > 0 && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle1" gutterBottom>
                        Custom Fields ({formData.customFields.length}):
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {formData.customFields.map((field) => (
                          <Chip
                            key={field.id}
                            label={`${field.name} (${field.type})`}
                            size="small"
                          />
                        ))}
                      </Box>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/templates')}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1">
          Create New Template
        </Typography>
      </Box>

      <Paper sx={{ p: 4 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

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

        {renderStepContent(activeStep)}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Back
          </Button>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                startIcon={<SaveIcon />}
              >
                {loading ? 'Creating...' : 'Create Template'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateTemplate;