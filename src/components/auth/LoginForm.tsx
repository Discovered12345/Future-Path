import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Eye, EyeOff, User, Lock, AlertCircle } from 'lucide-react';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToSignup?: () => void;
}

export default function LoginForm({ onSuccess, onSwitchToSignup }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic validation
    if (!email.trim()) {
      setError('❌ Email Required\n\nPlease enter your email address.');
      setLoading(false);
      return;
    }

    if (!password.trim()) {
      setError('❌ Password Required\n\nPlease enter your password.');
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting to sign in with:', email.trim().toLowerCase());
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (signInError) {
        console.error('Sign in error:', signInError);
        
        // Provide more user-friendly error messages
        if (signInError.message.includes('Invalid login credentials') || 
            signInError.message.includes('invalid_credentials')) {
          setError('❌ Login Failed\n\nThe email or password you entered is incorrect.\n\n🔧 Please check:\n• Your email address is spelled correctly\n• Your password is correct\n• Your account has been confirmed via email');
        } else if (signInError.message.includes('Email not confirmed')) {
          setError('📧 Email Not Confirmed\n\nPlease check your email and click the confirmation link before signing in.');
        } else if (signInError.message.includes('Too many requests') || 
                   signInError.message.includes('rate limit')) {
          setError('⏰ Too Many Attempts\n\nToo many login attempts. Please wait 5-10 minutes before trying again.');
        } else if (signInError.message.includes('Failed to fetch') || 
                   signInError.message.includes('network') ||
                   signInError.message.includes('fetch')) {
          setError('🌐 Connection Error\n\nUnable to connect to our servers. Please check:\n\n• Your internet connection\n• Try refreshing the page\n• Disable any VPN or proxy');
        } else {
          // Generic error with the actual error message
          setError(`❌ Login Error\n\n${signInError.message}\n\n🔧 Troubleshooting:\n• Check your internet connection\n• Try refreshing the page\n• Contact support if the issue persists`);
        }
        setLoading(false);
        return;
      }

      // Success - check if we have a session
      if (data.session && data.user) {
        console.log('Login successful, redirecting...');
        onSuccess?.();
      } else {
        setError('❌ Login Incomplete\n\nLogin was successful but session could not be established.\n\nPlease try refreshing the page or contact support.');
        setLoading(false);
      }

    } catch (err) {
      console.error('Unexpected login error:', err);
      
      // Handle network errors and other exceptions
      if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
        setError('🌐 Network Connection Error\n\nCannot connect to our authentication servers.\n\n🔧 Please check:\n• Your internet connection is stable\n• Try disabling VPN or proxy\n• Refresh the page and try again');
      } else if (err instanceof Error) {
        setError(`💥 Unexpected Error\n\nAn unexpected error occurred: ${err.message}\n\n🔧 Please try:\n• Refreshing the page\n• Clearing your browser cache\n• Using a different browser`);
      } else {
        setError('💥 Unknown Error\n\nAn unknown error occurred during login.\n\n🔧 Please try:\n• Refreshing the page\n• Clearing your browser cache');
      }
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-sm whitespace-pre-line">{error}</p>
            </div>
            {(error.includes('email or password you entered is incorrect') || 
              error.includes('Account Not Found')) && onSwitchToSignup && (
              <div className="mt-3 pt-3 border-t border-red-200">
                <p className="text-sm">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={onSwitchToSignup}
                    className="underline hover:no-underline font-medium text-red-800"
                  >
                    Create one here
                  </button>
                </p>
              </div>
            )}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter your email"
              autoComplete="email"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter your password"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Signing in...</span>
            </div>
          ) : 'Sign In'}
        </button>
      </form>

      {onSwitchToSignup && (
        <p className="mt-6 text-center text-gray-600">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToSignup}
            className="text-purple-600 hover:text-purple-700 font-semibold"
          >
            Sign up
          </button>
        </p>
      )}
    </div>
  );
}