import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';
import SignupForm from '../components/auth/SignupForm';
import { useAuth } from '../hooks/useAuth';

export default function Signup() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [signupSuccess, setSignupSuccess] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (user || signupSuccess) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSignupSuccess = () => {
    setSignupSuccess(true);
    // The Navigate component will handle the actual redirection
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg">
              <Compass className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              FuturePath
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create your account</h1>
          <p className="text-gray-600">Start building your future today</p>
        </div>

        <SignupForm 
          onSuccess={handleSignupSuccess}
          onSwitchToLogin={() => navigate('/login')}
        />

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Back to home</span>
          </button>
        </div>
      </div>
    </div>
  );
}