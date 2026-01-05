import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import Sidebar from '../Components/Sidebar';
import TopBar from '../Components/TopBar';

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.primaryLight};
  position: relative;
`;

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
  z-index: 999;
  display: none;

  @media (max-width: 1200px) {
    display: ${({ $show }) => ($show ? 'block' : 'none')};
  }
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: ${({ $sidebarOpen }) => ($sidebarOpen ? '280px' : '0')};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

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
    padding: 16px;
  }
`;

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1200);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <LayoutContainer>
      <Backdrop $show={sidebarOpen} onClick={() => setSidebarOpen(false)} />
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} onClose={() => setSidebarOpen(false)} />
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
