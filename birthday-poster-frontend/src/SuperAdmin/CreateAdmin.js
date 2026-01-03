import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { ThemeProvider } from 'styled-components';
import {
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import { ChevronLeft, Check, Save } from 'react-feather';
import useAxios from "../useAxios";
import { theme } from '../PremiumAdmin/theme';

// --- Styled Components (Matching Templates.js pattern) ---

const PageContainer = styled.div`
  padding: 0;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const HeaderInfo = styled.div`
  h1 {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
    color: #1A1A1A;
  }
  p {
    margin: 4px 0 0 0;
    color: #666;
    font-size: 14px;
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: white;
  border: 1px solid #EEE;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #FAFAFA;
    transform: translateX(-2px);
  }
`;

const FormCard = styled.div`
  background: white;
  border-radius: 24px;
  padding: 32px;
  box-shadow: ${theme.shadows.card};
  border: 1px solid rgba(0,0,0,0.03);
`;

const StyledTextField = styled(TextField)`
  & .MuiOutlinedInput-root {
    border-radius: 12px;
    background: #FAFAFA;
    transition: all 0.2s;
    
    & fieldset {
      border-color: #EEE;
    }
    
    &:hover {
      background: #FFF;
      & fieldset {
        border-color: #1A1A1A;
      }
    }
    
    &.Mui-focused {
      background: #FFF;
      & fieldset {
        border-color: #1A1A1A;
        border-width: 1px;
      }
    }
  }
  & .MuiInputLabel-root.Mui-focused {
    color: #1A1A1A;
  }
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: #1A1A1A;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: '';
    display: block;
    width: 4px;
    height: 16px;
    background: #1A1A1A;
    border-radius: 2px;
  }
`;

const PermissionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
`;

const PermissionCard = styled.div`
  background: ${props => props.$active ? '#F5F5F5' : '#FFF'};
  border: 1px solid ${props => props.$active ? '#1A1A1A' : '#EEE'};
  padding: 12px 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: space-between;

  &:hover {
    transform: translateY(-2px);
    border-color: #1A1A1A;
  }

  span {
    font-size: 14px;
    font-weight: 500;
    color: #333;
  }
`;

const SubmitButton = styled(Button)`
  && {
    background: #1A1A1A;
    color: white;
    padding: 12px 32px;
    border-radius: 12px;
    font-weight: 600;
    text-transform: none;
    font-size: 15px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);

    &:hover {
      background: #333;
      box-shadow: 0 6px 16px rgba(0,0,0,0.15);
    }
    
    &:disabled {
      background: #EEE;
      color: #999;
    }
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
      await axiosData.post('/users', {
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
        navigate('/superadmin/admins');
      }, 1500);
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
            <p>Add a new administrator with specific permissions</p>
          </HeaderInfo>
          <BackButton onClick={() => navigate(-1)}>
            <ChevronLeft size={16} />
            Back to List
          </BackButton>
        </Header>

        <FormCard>
          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: '12px',
                border: '1px solid rgba(211, 47, 47, 0.2)'
              }}
            >
              {error}
            </Alert>
          )}
          {success && (
            <Alert
              severity="success"
              sx={{
                mb: 3,
                borderRadius: '12px',
                border: '1px solid rgba(46, 125, 50, 0.2)'
              }}
            >
              {success}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <StyledTextField
                  required
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
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
                  placeholder="john@example.com"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <StyledTextField
                  fullWidth
                  label="Branch Name"
                  name="branchName"
                  value={formData.branchName}
                  onChange={handleChange}
                  placeholder="e.g. Main Branch"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <StyledTextField
                  type="number"
                  fullWidth
                  label="Template Count"
                  name="templateCount"
                  value={formData.templateCount}
                  onChange={handleChange}
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <StyledTextField
                  required
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <StyledTextField
                  required
                  fullWidth
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
              </Grid>
            </Grid>

            {/* Status Section */}
            <SectionTitle>Account Status</SectionTitle>
            <PermissionGrid>
              {['active', 'inactive'].map((statusOption) => {
                const isActive = formData.status === statusOption;
                return (
                  <PermissionCard
                    key={statusOption}
                    $active={isActive}
                    onClick={() => handleStatusToggle(statusOption)}
                  >
                    <span style={{ textTransform: 'capitalize' }}>{statusOption}</span>
                    {isActive && <Check size={16} color="#1A1A1A" />}
                  </PermissionCard>
                );
              })}
            </PermissionGrid>

            <div style={{ marginBottom: 32 }}></div>

            <SectionTitle>Permissions & Access</SectionTitle>
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
                    {isActive && <Check size={16} color="#1A1A1A" />}
                  </PermissionCard>
                );
              })}
            </PermissionGrid>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
              <SubmitButton
                type="submit"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save size={18} />}
              >
                {loading ? 'Creating Account...' : 'Create Admin Account'}
              </SubmitButton>
            </div>
          </form>
        </FormCard>
      </PageContainer>
    </ThemeProvider>
  );
};

export default CreateAdmin;
