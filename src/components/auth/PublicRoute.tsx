import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function PublicRoute({ children, redirectTo = '/dashboard' }: PublicRouteProps) {
  const { user, loading } = useAuth();

  // Check for redirect after login
  useEffect(() => {
    if (user) {
      const savedRedirect = sessionStorage.getItem('redirectAfterLogin');
      if (savedRedirect) {
        sessionStorage.removeItem('redirectAfterLogin');
      }
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    // Check if there's a saved redirect path
    const savedRedirect = sessionStorage.getItem('redirectAfterLogin');
    if (savedRedirect) {
      sessionStorage.removeItem('redirectAfterLogin');
      return <Navigate to={savedRedirect} replace />;
    }
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}