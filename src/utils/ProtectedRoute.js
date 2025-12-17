import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, hasRole, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Show a loading spinner or placeholder while checking auth status
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has the required role (if specified)
  if (requiredRole && !hasRole(requiredRole)) {
    // Redirect to home or unauthorized page if user doesn't have the required role
    return <Navigate to="/unauthorized" replace />;
  }

  // If authenticated (and has required role if specified), render the children
  return children;
};

export default ProtectedRoute;
