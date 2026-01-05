import React from 'react';
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
  X
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
  padding: ${({ theme }) => theme.spacing.sm} 0;
  flex: 1;
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: 12px 24px;
  color: rgba(255, 255, 255, 0.75);
  text-decoration: none;
  transition: all 0.2s ease;
  margin: 4px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  background: transparent;
  border: none;
  width: calc(100% - 24px); /* Account for margins */
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

const Sidebar = ({ isOpen, onToggle }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const navItems = [
    { icon: <Home size={18} />, text: 'Dashboard', path: 'dashboard' },
    { icon: <Users size={18} />, text: 'Customers', path: 'customers' },
    { icon: <Image size={18} />, text: 'Photos', path: 'photos' },
    { icon: <Layers size={18} />, text: 'Templates', path: 'templates' },
    { icon: <PieChart size={18} />, text: 'Analytics', path: 'analytics' },
    { icon: <Share2 size={18} />, text: 'Share Tracking', path: 'share-tracking' },
    { icon: <Send size={18} />, text: 'Campaigns', path: 'campaigns' },
    { icon: <FileText size={18} />, text: 'Reports', path: 'reports' },
    { icon: <Settings size={18} />, text: 'Settings', path: 'settings' },
  ];

  return (
    <SidebarContainer $isOpen={isOpen}>
      <LogoSection>
        <Logo>
          <LogoIcon>{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</LogoIcon>
          <LogoText>{user.name || 'User'}</LogoText>
        </Logo>
        <ToggleButton onClick={onToggle}>
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </ToggleButton>
      </LogoSection>

      <NavSection>
        {navItems.map((item) => (
          <NavItem
            key={item.path}
            to={item.path}
            end={item.path === 'dashboard'}
          >
            {item.icon}
            <NavText>{item.text}</NavText>
          </NavItem>
        ))}
      </NavSection>

      <BottomSection>
        <NavItem as="button" onClick={() => {
          if (window.confirm('Are you sure you want to logout?')) {
            localStorage.clear();
            window.location.href = '/admin/login'; // Using href to ensure clean state or use navigate from hook
          }
        }} style={{ padding: '8px 12px', margin: 0 }}>
          <LogOut size={18} />
          <NavText>Logout</NavText>
        </NavItem>
      </BottomSection>
    </SidebarContainer>
  );
};

export default Sidebar;
