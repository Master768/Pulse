/**
 * PROTECTED ROUTE COMPONENT
 * 
 * This is a "Guard" component. It sits between the user and private pages 
 * (like the Dashboard). It checks if the user is logged in:
 * - If logged in: It allows entry to the requested page (via <Outlet />).
 * - If NOT logged in: It redirects them to the /login page.
 */

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  // 1. LOADING: Don't redirect until we know the authentication status 
  // (e.g., waiting for the session token to be verified)
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FBFB]">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  // 2. AUTHORIZATION:
  // <Outlet /> acts as a placeholder for the child routes defined in App.jsx.
  // <Navigate /> forces the browser to move to a different URL.
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;

