import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import {
  Home,
  Users,
  Image,
  Layers,
  PieChart,
  Share2,
  Send,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  AlertCircle,
  CreditCard,
  Shield
} from 'react-feather';

const SidebarContainer = styled.aside`
  width: 280px;
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
  padding: 20px 24px;
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 18px;
`;

const LogoText = styled.div`
  font-size: 18px;
  font-weight: 700;
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
  padding: 12px 0;
  flex: 1;
  overflow-y: auto;
  
  /* Modern scrollbar */
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
  }
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 20px;
  color: rgba(255, 255, 255, 0.75);
  text-decoration: none;
  transition: all 0.2s ease;
  margin: 4px 12px;
  border-radius: 12px;
  background: transparent;
  border: none;
  width: calc(100% - 24px);
  cursor: pointer;
  font-family: inherit;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    color: white;
  }

  &.active {
    color: white;
    background: rgba(255, 255, 255, 0.05);
  }
`;

const NavText = styled.span`
  font-size: 14px;
  font-weight: 500;
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

const Sidebar = ({ isOpen, onToggle, onClose }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));

  React.useEffect(() => {
    const handleUserUpdate = () => {
      setUser(JSON.parse(localStorage.getItem('user') || '{}'));
    };
    window.addEventListener('userUpdated', handleUserUpdate);
    return () => window.removeEventListener('userUpdated', handleUserUpdate);
  }, []);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const navItems = [
    { icon: <Home size={18} />, text: 'Dashboard', path: 'dashboard' },
    { icon: <Users size={18} />, text: 'Customers', path: 'customers' },
    { icon: <Image size={18} />, text: 'Gallery', path: 'photos' },
    { icon: <Layers size={18} />, text: 'Templates', path: 'templates' },
    { icon: <PieChart size={18} />, text: 'Analytics', path: 'analytics' },
    { icon: <Share2 size={18} />, text: 'Share Tracking', path: 'share-tracking' },
    { icon: <Send size={18} />, text: 'Campaigns', path: 'campaigns' },
    { icon: <FileText size={18} />, text: 'Reports', path: 'reports' },
    { icon: <Shield size={18} />, text: 'Subscription', path: 'subscription' },
    { icon: <CreditCard size={18} />, text: 'Billing', path: 'billing' },
    { icon: <Settings size={18} />, text: 'Settings', path: 'settings' },
  ];

  const handleNavClick = () => {
    if (window.innerWidth <= 1200) {
      onClose();
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/admin/login';
  };

  return (
    <SidebarContainer $isOpen={isOpen}>
      <LogoSection>
        <Logo>
          <LogoIcon>{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</LogoIcon>
          <LogoText>{user.name || 'User'}</LogoText>
        </Logo>
        <ToggleButton onClick={onToggle}>
          <X size={20} />
        </ToggleButton>
      </LogoSection>

      <NavSection>
        {navItems.map((item) => (
          <NavItem
            key={item.path}
            to={item.path}
            end={item.path === 'dashboard'}
            onClick={handleNavClick}
          >
            {item.icon}
            <NavText>{item.text}</NavText>
          </NavItem>
        ))}
      </NavSection>

      <BottomSection>
        <NavItem
          as="button"
          onClick={() => setShowLogoutConfirm(true)}
          style={{ padding: '8px 12px', margin: 0 }}
        >
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
  );
};

export default Sidebar;
