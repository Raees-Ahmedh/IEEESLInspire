import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { initializeAuth, fetchUserProfile } from '../store/slices/authSlice';
import authService from '../services/authService';

interface AppInitializerProps {
  children: React.ReactNode;
}

const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const initializeApp = async () => {
      // Initialize auth state
      dispatch(initializeAuth());

      // If user is authenticated, fetch their profile
      if (authService.isAuthenticated()) {
        try {
          await dispatch(fetchUserProfile()).unwrap();
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          // If profile fetch fails, the user will be logged out
        }
      }
    };

    initializeApp();
  }, [dispatch]);

  // Don't render children until auth initialization is complete
  if (isLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AppInitializer;