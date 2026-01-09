import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import {
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import useAxios from '../useAxios';
import { theme } from '../PremiumAdmin/theme';
const GlobalLoginStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    background: ${theme.colors.gradientPrimary};
    min-height: 100vh;
    font-family: ${theme.typography.fontFamily};
  }
`;

const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: ${theme.spacing.md};
`;

const LoginCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: ${theme.spacing.xxl};
  border-radius: ${theme.borderRadius.xlarge};
  box-shadow: ${theme.shadows.hover};
  width: 100%;
  max-width: 440px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }

  @media (max-width: 480px) {
    padding: ${theme.spacing.xl};
  }
`;

const LogoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: ${theme.spacing.xl};
`;

const BrandName = styled.h1`
  font-size: ${theme.typography.h1.fontSize};
  font-weight: ${theme.typography.h1.fontWeight};
  color: ${theme.colors.primaryDark};
  margin: 0;
  background: linear-gradient(45deg, ${theme.colors.primaryDark}, #4A90E2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const SubText = styled.p`
  color: ${theme.colors.textSecondary};
  font-size: ${theme.typography.body2.fontSize};
  margin-top: ${theme.spacing.xs};
`;

const StyledTextField = styled(TextField)`
  & .MuiOutlinedInput-root {
    border-radius: ${theme.borderRadius.medium};
    background: ${theme.colors.primaryLight};
    
    & fieldset {
      border-color: ${theme.colors.borderMedium};
    }
    
    &:hover fieldset {
      border-color: ${theme.colors.primaryDark};
    }
    
    &.Mui-focused fieldset {
      border-color: ${theme.colors.primaryDark};
    }
  }
`;

const StyledButton = styled(Button)`
  && {
    margin-top: ${theme.spacing.xl};
    padding: ${theme.spacing.md};
    border-radius: ${theme.borderRadius.medium};
    background: ${theme.colors.primaryDark};
    font-weight: 600;
    text-transform: none;
    font-size: 16px;
    box-shadow: 0 4px 12px rgba(15, 16, 32, 0.2);
    
    &:hover {
      background: #1A1B2E;
      box-shadow: 0 6px 16px rgba(15, 16, 32, 0.3);
    }
    
    &:disabled {
      background: ${theme.colors.textLight};
    }
  }
`;

const Login = () => {
  const axiosData = useAxios();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [type] = useState(''); // setType removed
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    if (!val) {
      setEmailError('Email is required');
    } else if (!validateEmail(val)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    if (!val) {
      setPasswordError('Password is required');
    } else if (val.length < 6) {
      setPasswordError('Password must be at least 6 characters');
    } else {
      setPasswordError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Final validation before submit
    let isValid = true;
    if (!email || !validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }
    if (!password || password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }

    if (!isValid) return;

    setLoading(true);

    try {
      const response = await axiosData.post('users/login', {
        email,
        password,
        type
      });

      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.data));

        if (response.data.data.type === 'superadmin') {
          navigate('/superadmin');
        } else if (response.data.data.type === 'admin') {
          navigate('/admin/dashboard');
        } else {
          // Fallback or explicit other role handling
          navigate('/admin/login');
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = email && !emailError && password && !passwordError;

  return (
    <ThemeProvider theme={theme}>
      <GlobalLoginStyle />
      <LoginContainer>
        <LoginCard>
          <LogoContainer>
            <BrandName>Admin Login</BrandName>
            <SubText>Login to your account</SubText>
          </LogoContainer>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: theme.borderRadius.medium,
                backgroundColor: 'rgba(229, 57, 53, 0.1)',
                color: theme.colors.danger,
                border: `1px solid rgba(229, 57, 53, 0.2)`
              }}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            {/* <FormControl fullWidth margin="normal">
              <InputLabel>Signing in as</InputLabel>
              <Select
                value={type}
                label="Signing in as"
                onChange={(e) => setType(e.target.value)}
                sx={{ borderRadius: theme.borderRadius.medium }}
              >
                <MenuItem value="admin">Administrator</MenuItem>
                <MenuItem value="app user">App User</MenuItem>
              </Select>
            </FormControl> */}


            <StyledTextField
              margin="normal"
              required
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="admin@bilimbe.com"
              error={!!emailError}
              helperText={emailError}
            />
            <StyledTextField
              margin="normal"
              required
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={handlePasswordChange}
              placeholder="••••••••"
              error={!!passwordError}
              helperText={passwordError}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <StyledButton
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading || !isFormValid}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {loading ? 'Authenticating...' : 'Sign In to Portal'}
            </StyledButton>
          </form>
        </LoginCard>
      </LoginContainer>
    </ThemeProvider>
  );
};

export default Login;
