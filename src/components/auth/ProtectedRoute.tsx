import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function ProtectedRoute({ children, redirectTo = '/login' }: ProtectedRouteProps) {
  const { user, loading, error } = useAuth();
  const location = useLocation();

  // Log authentication status for debugging
  useEffect(() => {
    if (error) {
      console.error('Auth error in ProtectedRoute:', error);
    }
  }, [error]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying your account...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Save the attempted URL for redirecting back after login
    sessionStorage.setItem('redirectAfterLogin', location.pathname);
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}