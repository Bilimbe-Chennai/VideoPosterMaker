import React, { useState } from 'react';
import styled from 'styled-components';
import Header from './Header';
import Sidebar from './Sidebar';

const drawerWidth = 280;

const LayoutRoot = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #F8F9FA;
`;

const MainContent = styled.main`
  flex-grow: 1;
  padding: 32px;
  width: calc(100% - ${drawerWidth}px);
  margin-left: ${drawerWidth}px;
  background-color: #F8F9FA;
  min-height: 100vh;
  transition: margin-left 0.3s ease;

  @media (max-width: 1200px) {
    width: 100%;
    margin-left: 0;
  }
`;

const Layout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <LayoutRoot>
      <Header
        drawerWidth={drawerWidth}
        handleDrawerToggle={handleDrawerToggle}
      />

      <Sidebar
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
      />

      <MainContent>
        {/* Spacer for fixed Header */}
        <div style={{ height: '80px' }} />
        {children}
      </MainContent>
    </LayoutRoot>
  );
};

export default Layout;