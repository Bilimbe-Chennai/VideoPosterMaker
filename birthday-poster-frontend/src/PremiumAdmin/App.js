import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createGlobalStyle } from 'styled-components';
import { theme } from './theme';
import AdminLayout from './Layout/AdminLayout';
import Dashboard from './Pages/Dashboard';
import Customers from './Pages/Customers';
import Photos from './Pages/Photos';
import Analytics from './Pages/Analytics';
import Placeholder from './Components/Placeholder';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: ${theme.typography.fontFamily};
    background-color: ${theme.colors.primaryLight};
    color: ${theme.colors.textPrimary};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
    margin-bottom: ${theme.spacing.md};
  }

  h1 {
    font-size: ${theme.typography.h1.fontSize};
    font-weight: ${theme.typography.h1.fontWeight};
  }

  h2 {
    font-size: ${theme.typography.h2.fontSize};
    font-weight: ${theme.typography.h2.fontWeight};
  }

  h3 {
    font-size: ${theme.typography.h3.fontSize};
    font-weight: ${theme.typography.h3.fontWeight};
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  button {
    font-family: inherit;
    cursor: pointer;
  }

  .number-display {
    font-size: ${theme.typography.number.fontSize};
    font-weight: ${theme.typography.number.fontWeight};
    line-height: ${theme.typography.number.lineHeight};
  }
`;

function PremiumAdminApp() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Routes>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="customers" element={<Customers />} />
          <Route path="photos" element={<Photos />} />
          <Route path="templates" element={<Placeholder title="Templates" />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="share-tracking" element={<Placeholder title="Share Tracking" />} />
          <Route path="campaigns" element={<Placeholder title="Campaigns" />} />
          <Route path="reports" element={<Placeholder title="Reports" />} />
          <Route path="settings" element={<Placeholder title="Settings" />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
}

export default PremiumAdminApp;
