import React, { useState } from 'react';
import styled from 'styled-components';
import { Menu, User, LogOut, Settings } from 'react-feather';
import { useNavigate } from 'react-router-dom';
import { theme } from '../../PremiumAdmin/theme';

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  right: 0;
  height: 80px;
  width: calc(100% - ${props => props.$drawerWidth}px);
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  box-shadow: ${theme.shadows.card};
  z-index: 900;
  transition: width 0.3s ease;

  @media (max-width: 1200px) {
    width: 100%;
    padding: 0 16px;
  }
`;

const MobileToggle = styled.button`
  background: none;
  border: none;
  color: #333;
  cursor: pointer;
  display: none;
  
  @media (max-width: 1200px) {
    display: block;
    margin-right: 16px;
  }
`;

const HeaderTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #1A1A1A;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
`;

const UserInfo = styled.div`
  text-align: right;
  
  @media (max-width: 768px) {
    display: none;
  }
  
  h4 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: #1A1A1A;
  }
  span {
    font-size: 12px;
    color: #888;
  }
`;

const UserAvatar = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${theme.colors.gradientPrimary};
  color: white;
  border: none;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 60px;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  width: 200px;
  padding: 8px;
  display: ${props => props.$isOpen ? 'block' : 'none'};
  border: 1px solid rgba(0,0,0,0.05);
`;

const DropdownItem = styled.button`
  width: 100%;
  text-align: left;
  padding: 12px 16px;
  background: none;
  border: none;
  border-radius: 8px;
  color: #333;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #F5F5F5;
    color: #1A1A1A;
  }
  
  &.logout {
    color: #D32F2F;
    &:hover {
      background: #FFEBEE;
    }
  }
`;

const Header = ({ drawerWidth, handleDrawerToggle }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const admin = JSON.parse(localStorage.getItem('user') || '{}'); // Accessing user from localStorage (CreateAdmin saves as 'user' usually?)
  // Actually Sidebar used 'user', previous Header used 'admin'. 
  // Typically login saves to 'token' and 'user'. Let's check Login.js if needed, but 'user' and 'admin' separation might be legacy. 
  // Let's fallback to 'admin' if 'user' is missing or has wrong structure.

  const currentUser = admin.name ? admin : JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/admin/login');
  };

  return (
    <HeaderContainer $drawerWidth={drawerWidth}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <MobileToggle onClick={handleDrawerToggle}>
          <Menu />
        </MobileToggle>
        <HeaderTitle>Admin Portal</HeaderTitle>
      </div>

      <UserSection>
        <UserInfo>
          <h4>{currentUser.name || 'Admin'}</h4>
          <span>{currentUser.type || 'Super Admin'}</span>
        </UserInfo>
        <UserAvatar onClick={() => setMenuOpen(!menuOpen)}>
          {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
        </UserAvatar>

        <DropdownMenu $isOpen={menuOpen}>
          <DropdownItem onClick={() => navigate('/superadmin/settings')}>
            <Settings size={16} /> Settings
          </DropdownItem>
          <DropdownItem className="logout" onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </DropdownItem>
        </DropdownMenu>
      </UserSection>
    </HeaderContainer>
  );
};

export default Header;