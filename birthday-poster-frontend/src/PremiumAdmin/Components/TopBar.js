import React from 'react';
import styled from 'styled-components';
import { Search, Bell, User } from 'react-feather';

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
    return (
        <TopBarContainer>
            <SearchBar>
                <Search size={18} color="#A0A0A0" />
                <SearchInput placeholder="Search..." />
            </SearchBar>

            <RightSection>
                <IconButton>
                    <Bell size={20} />
                    <NotificationBadge />
                </IconButton>

                <UserProfile>
                    <UserAvatar>
                        <User size={20} />
                    </UserAvatar>
                    <UserInfo>
                        <UserName>Admin User</UserName>
                        <UserRole>Store Manager</UserRole>
                    </UserInfo>
                </UserProfile>
            </RightSection>
        </TopBarContainer>
    );
};

export default TopBar;
