// components/ProtectedRoute/AdminProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminProtectedRoute = ({ children }) => {
  // Check if user is logged in and has admin role
  const accessToken = localStorage.getItem('accessToken');
  const role = localStorage.getItem('role');
  
  // If no token or not admin role, redirect to login
  if (!accessToken || role !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  
  // If authenticated and admin, render the protected component
  return children;
};

export default AdminProtectedRoute;