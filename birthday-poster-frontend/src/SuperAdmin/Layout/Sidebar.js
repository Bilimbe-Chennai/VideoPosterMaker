import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import styled, { ThemeProvider } from 'styled-components';
import {
  Home,
  Users,
  Image,
  Layers,
  Settings,
  LogOut,
  UserPlus,
  PlusSquare,
  UploadCloud,
  X,
  Menu,
  Shield, // Added Shield icon for Admins
  AlertCircle
} from 'react-feather'; // Ensure react-feather is installed
import { theme } from '../../PremiumAdmin/theme';

const SidebarContainer = styled.aside`
  width: 280px;
  background: white; /* Changed to white for a cleaner look, or use theme.colors.sidebarBg if exists. keeping white/light for now as per some designs or dark if premium is dark. Premium Reference was gradientPrimary. Let's stick to reference. */
  background: ${({ theme }) => theme.colors.gradientPrimary}; 
  color: white;
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  box-shadow: ${({ theme }) => theme.shadows.sidebar};
  transition: transform 0.3s ease;

  @media (max-width: 1200px) {
    transform: ${({ $isOpen }) => ($isOpen ? 'translateX(0)' : 'translateX(-100%)')};
  }
`;

const LogoSection = styled.div`
  padding: ${({ theme }) => `${theme.spacing.xl} ${theme.spacing.xl} ${theme.spacing.lg}`};
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const LogoIcon = styled.div`
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 18px;
  color: white;
`;

const LogoText = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: white;
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  display: none;

  @media (max-width: 1200px) {
    display: block;
  }
`;

const NavSection = styled.div`
  padding: ${({ theme }) => theme.spacing.sm} 0;
  flex: 1;
  overflow-y: auto;
  
  /* Custom Scrollbar for dark theme */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: 12px 24px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: all 0.2s ease;
  margin: 4px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  background: transparent;
  border: none;
  width: calc(100% - 24px);
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    transform: translateX(4px);
  }

  &.active {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const NavText = styled.span`
  /* font-size handled in NavItem */
`;

const BottomSection = styled.div`
  padding: 16px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  backdrop-filter: blur(5px);
`;

const ModalContent = styled.div`
  background: white;
  width: 100%;
  max-width: 450px;
  padding: 32px;
  border-radius: 32px;
  position: relative;
  text-align: center;
`;

const AlertIconWrapper = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #F59E0B20;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  color: #F59E0B;
`;

const ConfirmMessage = styled.div`
  font-size: 16px;
  color: #1A1A1A;
  margin-bottom: 32px;
  line-height: 1.6;
`;

const ModalActionFooter = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 24px;
`;

const ModalButton = styled.button`
  padding: 12px 24px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  
  &.outline {
    background: #F3F4F6;
    color: #374151;
    &:hover {
      background: #E5E7EB;
    }
  }
  
  &.primary {
    background: #1A1A1A;
    color: white;
    &:hover {
      background: #000;
      transform: translateY(-1px);
    }
  }
`;

const Sidebar = ({ mobileOpen, handleDrawerToggle }) => {
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  // const location = useLocation(); // NavLink handles active state automatically

  // Get user for role check
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isSuperAdmin = user.type === 'admin' && (user.email === 'admin@bilimbe.com' || user.isSuperAdmin);

  const navItems = [
    { text: 'Dashboard', icon: <Home size={18} />, path: '/superadmin/dashboard' },

    // Super Admin Only: Admins Management
    ...(isSuperAdmin ? [
      { text: 'Admins List', icon: <Shield size={18} />, path: '/superadmin/admins' },
      { text: 'Create Admin', icon: <UserPlus size={18} />, path: '/superadmin/admins/create' },
    ] : []),

    { text: 'Templates', icon: <Layers size={18} />, path: '/superadmin/templates' },
    { text: 'Create Template', icon: <PlusSquare size={18} />, path: '/superadmin/templates/create' },
    { text: 'Users', icon: <Users size={18} />, path: '/superadmin/users' },
    { text: 'Upload Photos', icon: <UploadCloud size={18} />, path: '/superadmin/upload' },
    { text: 'Settings', icon: <Settings size={18} />, path: '/superadmin/settings' },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/admin/login');
  };

  return (
    <ThemeProvider theme={theme}>
      <SidebarContainer $isOpen={mobileOpen}>
        <LogoSection>
          <Logo>
            {/* Placeholder Logo Icon matching premium theme style */}
            <LogoIcon>BA</LogoIcon>
            <LogoText>Bilimbe Admin</LogoText>
          </Logo>
          <ToggleButton onClick={handleDrawerToggle}>
            <X size={20} />
          </ToggleButton>
        </LogoSection>

        <NavSection>
          {navItems.map((item) => (
            <NavItem
              key={item.path}
              to={item.path}
              onClick={() => {
                // Close sidebar on mobile when item clicked
                if (window.innerWidth <= 1200 && mobileOpen) handleDrawerToggle();
              }}
            >
              {item.icon}
              <NavText>{item.text}</NavText>
            </NavItem>
          ))}
        </NavSection>

        <BottomSection>
          <NavItem as="button" onClick={() => setShowLogoutConfirm(true)} style={{ marginTop: 0 }}>
            <LogOut size={18} />
            <NavText>Logout</NavText>
          </NavItem>
        </BottomSection>

        {/* Logout Confirmation Modal */}
        {showLogoutConfirm && (
          <ModalOverlay onClick={() => setShowLogoutConfirm(false)}>
            <ModalContent onClick={e => e.stopPropagation()}>
              <AlertIconWrapper>
                <AlertCircle size={32} />
              </AlertIconWrapper>
              <ConfirmMessage>Are you sure you want to logout?</ConfirmMessage>
              <ModalActionFooter>
                <ModalButton
                  className="outline"
                  onClick={() => setShowLogoutConfirm(false)}
                >
                  Cancel
                </ModalButton>
                <ModalButton
                  className="primary"
                  onClick={handleLogout}
                >
                  Logout
                </ModalButton>
              </ModalActionFooter>
            </ModalContent>
          </ModalOverlay>
        )}
      </SidebarContainer>
    </ThemeProvider>
  );
};

export default Sidebar;
