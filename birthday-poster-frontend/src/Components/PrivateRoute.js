import React from 'react';
import { Navigate } from 'react-router-dom';
import { showGlobalAlert } from '../utils/globalAlert';

const PrivateRoute = ({ children }) => {
  const user = localStorage.getItem('user');

  if (!user) {
    showGlobalAlert('You are logged out. Please login and continue browsing.', 'error', () => {
      // Alert will close and redirect happens via Navigate
    });
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default PrivateRoute;