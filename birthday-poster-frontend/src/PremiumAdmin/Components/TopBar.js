import React from 'react';
import styled from 'styled-components';
import { Search, Bell, User, Menu } from 'react-feather';

const TopBarContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => `${theme.spacing.lg} ${theme.spacing.xl}`};
  background: ${({ theme }) => theme.colors.primaryLight};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: ${({ theme }) => theme.shadows.card};

  @media (max-width: 768px) {
    padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
`;

const MenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  padding: 8px;
  margin-right: 12px;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  @media (max-width: 1200px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  background: ${({ theme }) => theme.colors.primaryLight};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  width: 300px;
  transition: all 0.3s ease;

  &:focus-within {
    border-color: ${({ theme }) => theme.colors.textSecondary};
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.05);
  }

  @media (max-width: 768px) {
    width: 200px;
  }

  @media (max-width: 480px) {
    display: none; /* Hide search on very small screens to save space */
  }
`;

const SearchInput = styled.input`
  border: none;
  outline: none;
  background: none;
  flex: 1;
  margin-left: ${({ theme }) => theme.spacing.sm};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textPrimary};

  &::placeholder {
    color: ${({ theme }) => theme.colors.textLight};
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 480px) {
    gap: 12px;
  }
`;

const IconButton = styled.button`
  background: none;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.borderRadius.round};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textSecondary};
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    background: ${({ theme }) => theme.colors.accentPurple};
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  @media (max-width: 480px) {
    width: 36px;
    height: 36px;
  }
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: 2px;
  right: 2px;
  width: 8px;
  height: 8px;
  background: ${({ theme }) => theme.colors.danger};
  border-radius: 50%;
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  cursor: pointer;
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.borderRadius.round};
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;

  @media (max-width: 480px) {
    width: 36px;
    height: 36px;
  }
`;

const UserInfo = styled.div`
  display: none;

  @media (min-width: 768px) {
    display: block;
  }
`;

const UserName = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const UserRole = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textLight};
`;

const TopBar = ({ onMenuClick }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <TopBarContainer>
      <LeftSection>
        <MenuButton onClick={onMenuClick} title="Open Menu">
          <Menu size={24} />
        </MenuButton>
        <SearchBar>
          <Search size={18} color="#A0A0A0" />
          <SearchInput placeholder="Search..." />
        </SearchBar>
      </LeftSection>

      <RightSection>
        <IconButton>
          <Bell size={20} />
          <NotificationBadge />
        </IconButton>

        <UserProfile>
          <UserAvatar>
            {user.name ? user.name.charAt(0).toUpperCase() : <User size={20} />}
          </UserAvatar>
          <UserInfo>
            <UserName>{user.name || 'Admin User'}</UserName>
            <UserRole>{user.type || 'Manager'}</UserRole>
          </UserInfo>
        </UserProfile>
      </RightSection>
    </TopBarContainer>
  );
};

export default TopBar;
