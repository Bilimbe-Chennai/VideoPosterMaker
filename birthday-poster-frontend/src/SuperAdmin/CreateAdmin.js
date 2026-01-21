import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { ThemeProvider } from 'styled-components';
import {
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { ChevronLeft, Check, Save, Eye, EyeOff } from 'react-feather';
import useAxios from "../useAxios";
import { theme } from '../PremiumAdmin/theme';

// --- Styled Components (Matching Templates.js pattern) ---

const PageContainer = styled.div`
  padding: 40px 20px;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
`;

const HeaderInfo = styled.div`
  h1 {
    margin: 0;
    font-size: 32px;
    font-weight: 800;
    color: #0F1020;
    letter-spacing: -0.5px;
  }
  p {
    margin: 8px 0 0 0;
    color: #6B7280;
    font-size: 16px;
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);

  &:hover {
    background: #F9FAFB;
    border-color: #D1D5DB;
    transform: translateX(-4px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.05);
  }
`;

const FormCard = styled.div`
  background: white;
  border-radius: 32px;
  padding: 48px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.02);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 6px;
    background: linear-gradient(90deg, #E8D5FF 0%, #DBEAFE 100%);
  }
`;

const StyledTextField = styled(TextField)`
  & .MuiOutlinedInput-root {
    border-radius: 16px;
    background: #F9FAFB;
    transition: all 0.3s ease;
    font-size: 15px;
    
    & fieldset {
      border-color: #E5E7EB;
    }
    
    &:hover {
      background: #FFF;
      & fieldset {
        border-color: #9CA3AF;
      }
    }
    
    &.Mui-focused {
      background: #FFF;
      & fieldset {
        border-color: #0F1020;
        border-width: 1.5px;
      }
    }
  }

  & .MuiInputLabel-root {
    font-size: 14px;
    color: #6B7280;
    &.Mui-focused {
      color: #0F1020;
      font-weight: 600;
    }
  }

  & .MuiOutlinedInput-input {
    padding: 16.5px 14px;
  }
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #0F1020;
  margin: 32px 0 20px 0;
  display: flex;
  align-items: center;
  gap: 12px;

  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #E5E7EB;
    margin-left: 8px;
  }
`;

const PermissionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const PermissionCard = styled.div`
  background: ${props => props.$active ? '#F3F4F6' : 'white'};
  border: 1.5px solid ${props => props.$active ? '#0F1020' : '#E5E7EB'};
  padding: 16px 20px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: space-between;

  &:hover {
    transform: translateY(-3px);
    border-color: ${props => props.$active ? '#0F1020' : '#9CA3AF'};
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.05);
  }

  span {
    font-size: 14px;
    font-weight: 600;
    color: ${props => props.$active ? '#0F1020' : '#4B5563'};
  }
`;

const SubmitButton = styled(Button)`
  && {
    background: #0F1020;
    color: white;
    padding: 14px 40px;
    border-radius: 16px;
    font-weight: 700;
    text-transform: none;
    font-size: 16px;
    letter-spacing: 0.5px;
    box-shadow: 0 10px 25px rgba(15, 16, 32, 0.2);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      background: #1A1B2E;
      transform: translateY(-2px);
      box-shadow: 0 15px 30px rgba(15, 16, 32, 0.3);
    }
    
    &:disabled {
      background: #E5E7EB;
      color: #9CA3AF;
    }
  }
`;

const StatusBadge = styled.div`
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  background: ${props => props.$type === 'active' ? '#D1FAE5' : '#F3F4F6'};
  color: ${props => props.$type === 'active' ? '#065F46' : '#4B5563'};
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 16, 32, 0.4);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const SuccessModalContent = styled.div`
  background: white;
  padding: 48px;
  border-radius: 32px;
  text-align: center;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  max-width: 400px;
  width: 90%;
  animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);

  @keyframes slideUp {
    from { transform: translateY(30px) scale(0.95); opacity: 0; }
    to { transform: translateY(0) scale(1); opacity: 1; }
  }

  h2 {
    font-size: 24px;
    font-weight: 800;
    color: #0F1020;
    margin: 24px 0 12px;
  }

  p {
    color: #6B7280;
    font-size: 16px;
    line-height: 1.5;
    margin: 0;
  }
`;

const SuccessIconWrapper = styled.div`
  width: 80px;
  height: 80px;
  background: #D1FAE5;
  color: #059669;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  
  svg {
    animation: checkmark 0.5s ease-in-out forwards;
    opacity: 0;
    transform: scale(0.5);
  }

  @keyframes checkmark {
    to { opacity: 1; transform: scale(1); }
  }
`;

const CreateAdmin = () => {
  const axiosData = useAxios();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    accessType: [],
    branchName: '',
    templateCount: 3,
    status: 'active'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const availableOptions = [
    { value: 'photomerge', label: 'Photo Merge' },
    { value: 'videovideo', label: 'Video + Video' },
    { value: 'videovideovideo', label: 'Video + Video + Video' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleOptionToggle = (optionValue) => {
    setFormData({
      ...formData,
      accessType: formData.accessType.includes(optionValue)
        ? formData.accessType.filter((o) => o !== optionValue)
        : [...formData.accessType, optionValue],
    });
  };

  const handleStatusToggle = (newStatus) => {
    setFormData({ ...formData, status: newStatus });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await axiosData.post('users', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        type: 'admin',
        accessType: formData.accessType,
        status: formData.status,
        branchName: formData.branchName,
        templateCount: Number(formData.templateCount)
      });

      setSuccess('Admin account created successfully');
      setShowSuccessModal(true);
      setFormData({
        name: '',
        branchName: '',
        email: '',
        password: '',
        confirmPassword: '',
        accessType: [],
        templateCount: 1,
        status: 'active'
      });

      setTimeout(() => {
        navigate(-1);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <PageContainer>
        <Header>
          <HeaderInfo>
            <h1>Create New Admin</h1>
            <p>Onboard a new administrator with customized access permissions</p>
          </HeaderInfo>
          <BackButton onClick={() => navigate(-1)}>
            <ChevronLeft size={18} />
            Back to Overview
          </BackButton>
        </Header>

        <FormCard>
          {error && (
            <Alert
              severity="error"
              variant="outlined"
              sx={{
                mb: 4,
                borderRadius: '16px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fee2e2',
                color: '#991b1b',
                '& .MuiAlert-icon': { color: '#dc2626' }
              }}
            >
              {error}
            </Alert>
          )}
          {success && (
            <Alert
              severity="success"
              variant="outlined"
              sx={{
                mb: 4,
                borderRadius: '16px',
                backgroundColor: '#f0fdf4',
                border: '1px solid #dcfce7',
                color: '#166534',
                '& .MuiAlert-icon': { color: '#16a34a' }
              }}
            >
              {success}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <SectionTitle>Personal Details</SectionTitle>
            <Grid container spacing={4} sx={{ mb: 2 }}>
              <Grid item xs={12} md={6}>
                <StyledTextField
                  required
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter admin name"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <StyledTextField
                  required
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@example.com"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <StyledTextField
                  fullWidth
                  label="Branch Office"
                  name="branchName"
                  value={formData.branchName}
                  onChange={handleChange}
                  placeholder="e.g. Headquarters"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <StyledTextField
                  type="number"
                  fullWidth
                  label="Template Assignment Limit"
                  name="templateCount"
                  value={formData.templateCount}
                  onChange={handleChange}
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
            </Grid>

            <SectionTitle>Security Credentials</SectionTitle>
            <Grid container spacing={4} sx={{ mb: 2 }}>
              <Grid item xs={12} md={6}>
                <StyledTextField
                  required
                  fullWidth
                  label="Account Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{ color: '#6B7280', mr: 0.5 }}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <StyledTextField
                  required
                  fullWidth
                  label="Confirm Password"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat your password"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                          sx={{ color: '#6B7280', mr: 0.5 }}
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            <SectionTitle>Account Configuration</SectionTitle>
            <PermissionGrid>
              {['active', 'inactive'].map((statusOption) => {
                const isActive = formData.status === statusOption;
                return (
                  <PermissionCard
                    key={statusOption}
                    $active={isActive}
                    onClick={() => handleStatusToggle(statusOption)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>{statusOption}</span>
                      <StatusBadge $type={statusOption}>{statusOption}</StatusBadge>
                    </div>
                    {isActive && <Check size={18} strokeWidth={3} color="#0F1020" />}
                  </PermissionCard>
                );
              })}
            </PermissionGrid>

            <SectionTitle>Module Permissions</SectionTitle>
            <PermissionGrid>
              {availableOptions.map((option) => {
                const isActive = formData.accessType.includes(option.value);
                return (
                  <PermissionCard
                    key={option.value}
                    $active={isActive}
                    onClick={() => handleOptionToggle(option.value)}
                  >
                    <span>{option.label}</span>
                    {isActive ? (
                      <Check size={18} strokeWidth={3} color="#0F1020" />
                    ) : (
                      <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid #E5E7EB' }} />
                    )}
                  </PermissionCard>
                );
              })}
            </PermissionGrid>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '48px', gap: '16px' }}>
              <Button
                onClick={() => navigate(-1)}
                sx={{
                  borderRadius: '16px',
                  textTransform: 'none',
                  color: '#6B7280',
                  fontWeight: 600,
                  px: 4
                }}
              >
                Discard Changes
              </Button>
              <SubmitButton
                type="submit"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save size={18} />}
              >
                {loading ? 'Initializing...' : 'Create Admin Account'}
              </SubmitButton>
            </div>
          </form>
        </FormCard>

        {showSuccessModal && (
          <ModalOverlay>
            <SuccessModalContent>
              <SuccessIconWrapper>
                <Check size={40} strokeWidth={3} />
              </SuccessIconWrapper>
              <h2>User Created Successfully!</h2>
              <p>The new administrator account has been onboarded. Redirecting to previous page...</p>
            </SuccessModalContent>
          </ModalOverlay>
        )}
      </PageContainer>
    </ThemeProvider>
  );
};

export default CreateAdmin;
