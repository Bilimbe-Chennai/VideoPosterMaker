import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createGlobalStyle } from 'styled-components';
import { theme } from './theme';
import AdminLayout from './Layout/AdminLayout';
import Dashboard from './Pages/Dashboard';
import Customers from './Pages/Customers';
import Photos from './Pages/Photos';
import Templates from './Pages/Templates';
import Analytics from './Pages/Analytics';
import ShareTracking from './Pages/ShareTracking';
import Campaigns from './Pages/Campaigns';
import Reports from './Pages/Reports';
import Billing from './Pages/Billing';
import Subscription from './Pages/Subscription';
import Settings from './Pages/Settings';
import Notifications from './Pages/Notifications';
import Placeholder from './Components/Placeholder';
import PrivateRoute from '../Components/PrivateRoute';
import useAxios from '../useAxios';
import { setupUserRefreshListener, startUserDataPolling } from '../utils/userRefresh';

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
  const axiosData = useAxios();

  useEffect(() => {
    // Set up user refresh listener for real-time updates
    const cleanupListener = setupUserRefreshListener(axiosData, (updatedUser) => {
      console.log('User data refreshed:', updatedUser);
      // Optionally show a notification to the user
      if (window.showGlobalAlert) {
        window.showGlobalAlert('Your account information has been updated.', 'info');
      }
    });

    // Start polling as a fallback (checks every 30 seconds)
    const stopPolling = startUserDataPolling(axiosData, 30000);

    // Cleanup on unmount
    return () => {
      cleanupListener();
      stopPolling();
    };
  }, [axiosData]);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Routes>
        <Route path="/" element={
          <PrivateRoute>
            <AdminLayout />
          </PrivateRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="customers" element={<Customers />} />
          <Route path="photos" element={<Photos />} />
          <Route path="templates" element={<Templates />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="share-tracking" element={<ShareTracking />} />
          <Route path="campaigns" element={<Campaigns />} />
          <Route path="reports" element={<Reports />} />
          <Route path="billing" element={<Billing />} />
          <Route path="subscription" element={<Subscription />} />
          <Route path="settings" element={<Settings />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
}

export default PremiumAdminApp;
