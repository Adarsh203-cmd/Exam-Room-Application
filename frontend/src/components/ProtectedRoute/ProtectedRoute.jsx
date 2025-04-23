import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ allowedRole, children }) => {
  const accessToken = localStorage.getItem('accessToken');
  const userRole = localStorage.getItem('role');

  // Log the values to verify if they are being retrieved correctly
  console.log("User Role:", userRole);
  console.log("Access Token:", accessToken);

  const isAllowed = Array.isArray(allowedRole)
    ? allowedRole.includes(userRole)
    : allowedRole === userRole;

  // Check if token exists and the role matches the allowedRole
  if (!accessToken || !userRole || !isAllowed) {
    // If token is missing or role doesn't match, redirect to login
    return <Navigate to="/login" replace />;
  }

  return children; // Render children if everything is valid
};

export default ProtectedRoute;
