// src/Auth/ProtectedRoute.tsx
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthService from '../services/common/Authservices';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const authenticated = AuthService.isAuthenticated();
      setIsAuth(authenticated);
      setIsChecking(false);
    };

    checkAuth();

    // Set up interval to check token expiry every minute
    const interval = setInterval(() => {
      const authenticated = AuthService.isAuthenticated();
      if (!authenticated && isAuth) {
        // Token expired, clear state and force redirect
        setIsAuth(false);
        window.location.href = '/login';
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [isAuth]);

  // Show loading state while checking
  if (isChecking) {
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

  // Redirect to login if not authenticated
  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;