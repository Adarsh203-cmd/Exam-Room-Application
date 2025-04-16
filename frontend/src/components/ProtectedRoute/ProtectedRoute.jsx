import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const accessToken = localStorage.getItem('accessToken');

  if (!accessToken) {
    // No token? Kick the user to login
    return <Navigate to="/login" replace />;
  }

  // Token exists – allow access
  return children;
};

export default ProtectedRoute;
