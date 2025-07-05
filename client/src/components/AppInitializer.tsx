// client/src/components/AppInitializer.tsx - Enhanced with university data fetching
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { initializeAuth, fetchUserProfile } from '../store/slices/authSlice';
import { 
  fetchUniversities, 
  selectUniversities, 
  selectLastFetched 
} from '../store/slices/universitiesSlice';
import authService from '../services/authService';

interface AppInitializerProps {
  children: React.ReactNode;
}

const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Auth state
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);
  
  // Universities state
  const universities = useSelector((state: RootState) => state.universities.universities);
  const lastFetched = useSelector((state: RootState) => state.universities.lastFetched);

  useEffect(() => {
    const initializeApp = async () => {
      console.log('🚀 Initializing application...');

      // 1. Initialize auth state first
      dispatch(initializeAuth());

      // 2. If user is authenticated, fetch their profile
      if (authService.isAuthenticated()) {
        try {
          await dispatch(fetchUserProfile()).unwrap();
          console.log('✅ User profile fetched successfully');
        } catch (error) {
          console.error('❌ Failed to fetch user profile:', error);
          // If profile fetch fails, the user will be logged out
        }
      }

      // 3. Initialize app data (universities, etc.)
      await initializeAppData();
    };

    const initializeAppData = async () => {
      console.log('🔄 Initializing app data...');

      // Check if we need to fetch universities
      const shouldFetchUniversities = 
        universities.length === 0 || 
        !lastFetched || 
        (Date.now() - new Date(lastFetched).getTime()) > 5 * 60 * 1000; // 5 minutes cache

      if (shouldFetchUniversities) {
        console.log('🏫 Fetching universities...');
        try {
          await dispatch(fetchUniversities()).unwrap();
          console.log('✅ Universities initialized successfully');
        } catch (error) {
          console.error('❌ Failed to initialize universities:', error);
          // Don't block the app if this fails - the components will handle the error state
        }
      } else {
        console.log('✅ Universities already loaded, skipping fetch');
      }

      // Add other app data initialization here in the future
      // Examples:
      // - fetchSubjects()
      // - fetchFrameworks()
      // - fetchSettings()
      
      console.log('✅ App data initialization complete');
    };

    initializeApp();
  }, [dispatch, universities.length, lastFetched]);

  // Don't render children until auth initialization is complete
  if (isLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
          <p className="text-gray-500 text-sm mt-2">Initializing application data...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AppInitializer;