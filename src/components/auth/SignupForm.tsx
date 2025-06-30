import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Eye, EyeOff, User, Lock, AlertCircle } from 'lucide-react';

interface SignupFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export default function SignupForm({ onSuccess, onSwitchToLogin }: SignupFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Basic validation
    if (!email.trim()) {
      setError('❌ Email Required\n\nPlease enter your email address.');
      setLoading(false);
      return;
    }

    if (!password.trim()) {
      setError('❌ Password Required\n\nPlease enter a password.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('❌ Password Mismatch\n\nPasswords do not match. Please make sure both password fields are identical.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('❌ Password Too Short\n\nPassword must be at least 6 characters long for security.');
      setLoading(false);
      return;
    }

    try {
      // Disable email confirmation for easier testing
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            email_confirmed: true // This helps bypass email confirmation
          }
        },
      });

      if (signUpError) {
        // Handle specific error cases
        if (signUpError.message.includes('User already registered')) {
          setError('❌ Account Already Exists\n\nAn account with this email already exists. Please sign in instead.');
        } else if (signUpError.message.includes('Password should be at least')) {
          setError('❌ Password Requirements\n\nPassword must be at least 6 characters long');
        } else if (signUpError.message.includes('Invalid email')) {
          setError('❌ Invalid Email\n\nPlease enter a valid email address');
        } else if (signUpError.message.includes('email_address_invalid') || 
                  (signUpError.message.includes('Email address') && signUpError.message.includes('invalid'))) {
          setError(`❌ Email Format Not Supported\n\nThis email address format is not supported by our authentication service.\n\n🔧 Please try:\n• A different email address\n• Gmail, Outlook, or Yahoo email\n• Removing special characters from your email`);
        } else if (signUpError.message.includes('Failed to fetch') || 
                  signUpError.message.includes('network') ||
                  signUpError.message.includes('fetch')) {
          setError('🌐 Connection Error\n\nUnable to connect to our servers. Please check:\n\n• Your internet connection\n• Try refreshing the page\n• Disable any VPN or proxy\n• Check if your firewall is blocking the connection');
        } else {
          setError(`❌ Signup Failed\n\n${signUpError.message}\n\nPlease try again or contact support.`);
        }
        setLoading(false);
        return;
      }

      // Success case
      if (data.user) {
        // Auto-login the user without email confirmation
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password
        });

        if (signInError) {
          console.error("Auto-login failed:", signInError);
          setSuccess('✅ Account Created Successfully!\n\nPlease sign in with your new account.');
        } else if (signInData.session) {
          // User is automatically signed in
          setSuccess('✅ Account Created Successfully!\n\nYou are now signed in and will be redirected to your dashboard.');
          setTimeout(() => {
            onSuccess?.();
          }, 1000);
        }
      } else {
        setSuccess('✅ Account Created!\n\nPlease sign in with your new account.');
      }
      
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
        setError('🌐 Network Connection Error\n\nCannot connect to our authentication servers.\n\n🔧 Please check:\n• Your internet connection is stable\n• Try disabling VPN or proxy\n• Refresh the page and try again');
      } else if (err instanceof Error) {
        setError(`💥 Unexpected Error\n\nAn unexpected error occurred: ${err.message}\n\nPlease try again or contact support.`);
      } else {
        setError('💥 Unknown Error\n\nAn unknown error occurred during signup.\n\nPlease try again or contact support.');
      }
    } finally {
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
            {error.includes('account with this email already exists') && onSwitchToLogin && (
              <div className="mt-3 pt-3 border-t border-red-200">
                <p className="text-sm">
                  <button
                    type="button"
                    onClick={onSwitchToLogin}
                    className="underline hover:no-underline font-medium"
                  >
                    Sign in to your existing account
                  </button>
                </p>
              </div>
            )}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            <p className="text-sm font-medium whitespace-pre-line">{success}</p>
            {success.includes('Please sign in') && onSwitchToLogin && (
              <p className="text-sm mt-2">
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="underline hover:no-underline font-medium"
                >
                  Sign in here
                </button>
              </p>
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
          <p className="mt-1 text-xs text-gray-500">
            We recommend using Gmail, Outlook, or Yahoo email addresses
          </p>
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
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Minimum 6 characters
          </p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Confirm your password"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
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
              <span>Creating account...</span>
            </div>
          ) : 'Create Account'}
        </button>
      </form>

      {onSwitchToLogin && !success && (
        <p className="mt-6 text-center text-gray-600">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-purple-600 hover:text-purple-700 font-semibold"
          >
            Sign in
          </button>
        </p>
      )}
    </div>
  );
}