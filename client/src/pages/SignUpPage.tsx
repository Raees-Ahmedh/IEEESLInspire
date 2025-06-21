import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { signupStart, signupSuccess, signupFailure } from '../store/slices/authSlice';
import Logo from '../assets/images/logo.png';

interface SignUpPageProps {
  onGoBack?: () => void;
  onLoginClick?: () => void;
  onSuccessRedirect?: () => void;
}

const SignUpPage: React.FC<SignUpPageProps> = ({ onGoBack, onLoginClick, onSuccessRedirect }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      return;
    }

    dispatch(signupStart());
    
    try {
      // Simulate API call - replace with actual API call
      setTimeout(() => {
        // Simulate success
        if (email && password.length >= 6) {
          dispatch(signupSuccess({
            id: Date.now().toString(),
            email: email,
            name: email.split('@')[0], // Use email prefix as name
            role: 'user' // New users get 'user' role by default
          }));
          // Redirect to dashboard after successful signup
          if (onSuccessRedirect) {
            onSuccessRedirect();
          } else if (onGoBack) {
            onGoBack();
          }
        } else {
          dispatch(signupFailure('Password must be at least 6 characters'));
        }
      }, 1000);
    } catch (error) {
      dispatch(signupFailure('Signup failed. Please try again.'));
    }
  };

  const handleSocialSignUp = (provider: string) => {
    dispatch(signupStart());
    setTimeout(() => {
      dispatch(signupSuccess({
        id: Date.now().toString(),
        email: `user@${provider}.com`,
        name: `${provider} User`,
        role: 'user' // Social signup users get 'user' role by default
      }));
      // Redirect to dashboard after successful social signup
      if (onSuccessRedirect) {
        onSuccessRedirect();
      } else if (onGoBack) {
        onGoBack();
      }
    }, 1000);
  };

  const handleLogoClick = () => {
    if (onGoBack) {
      onGoBack();
    }
  };

  const handleLoginClick = () => {
    if (onLoginClick) {
      onLoginClick();
    }
    // If no login handler provided, you could navigate to a login page
    // or show a message that login functionality is not implemented yet
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
      {/* Go Back Button */}
      {onGoBack && (
        <button 
          onClick={onGoBack}
          className="absolute top-6 left-6 flex items-center text-gray-600 hover:text-gray-800 transition-colors z-10"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </button>
      )}
      
      {/* Logo - made clickable */}
      <div className="absolute top-1 right-8">
        <button onClick={handleLogoClick} className="hover:opacity-80 transition-opacity">
          <img src={Logo} alt="PathFinder Logo" className="h-20 w-auto" />
        </button>
      </div>
      
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Sign Up</h1>
          <p className="text-gray-600">Path Finder - SL Inspire</p>
        </div>

        {/* Info about account type */}
        {/* <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="text-sm font-semibold text-green-800 mb-1">Account Information:</h4>
          <p className="text-xs text-green-700">
            New accounts are created as standard user accounts with access to course search, 
            saved courses, and personal dashboard features.
          </p>
        </div> */}

        <form onSubmit={handleSignUp} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password (min. 6 characters)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              required
              minLength={6}
            />
            <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-lg font-semibold transition-all transform shadow-lg ${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 hover:scale-105'
            }`}
          >
            {isLoading ? 'Creating Account...' : 'Sign up'}
          </button>
        </form>

        <div className="my-6 text-center">
          <div className="flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-gray-500">or</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => handleSocialSignUp('google')}
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 border border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-gray-700 font-medium">Continue with Google</span>
          </button>

          {/* <button
            onClick={() => handleSocialSignUp('facebook')}
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 border border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span className="text-gray-700 font-medium">Continue with Facebook</span>
          </button> */}
        </div>

        <div className="mt-6 text-center">
          <div className="text-sm text-gray-600">
            Already have an account?{' '}
            <button 
              onClick={handleLoginClick}
              className="text-purple-600 hover:text-purple-700 font-semibold underline"
            >
              Log in
            </button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 text-center text-sm text-gray-500">
        2025 - All rights are reserved for PathFinder.
      </div>
    </div>
  );
};

export default SignUpPage;