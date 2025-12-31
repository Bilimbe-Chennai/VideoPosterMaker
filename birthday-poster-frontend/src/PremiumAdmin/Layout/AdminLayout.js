import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import Sidebar from '../Components/Sidebar';
import TopBar from '../Components/TopBar';

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.primaryLight};
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: ${({ $sidebarOpen }) => ($sidebarOpen ? '280px' : '0')};
  transition: margin-left 0.3s ease;

  @media (max-width: 1200px) {
    margin-left: 0;
  }
`;

const ContentArea = styled.main`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.xl};
  overflow-y: auto;
  background-color: ${({ theme }) => theme.colors.primaryLight};

  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.md};
  }
`;

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <LayoutContainer>
            <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
            <MainContent $sidebarOpen={sidebarOpen}>
                <TopBar onMenuClick={toggleSidebar} />
                <ContentArea>
                    <Outlet />
                </ContentArea>
            </MainContent>
        </LayoutContainer>
    );
};

export default AdminLayout;
