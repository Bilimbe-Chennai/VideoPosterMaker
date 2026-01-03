import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  if (!token || !user) {
    alert('You are logged out kindly login and continue browsing');
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default PrivateRoute;