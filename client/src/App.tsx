import React, { useState } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import AppInitializer from './components/AppInitializer'; // Add this import
import Header from './components/Header';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import BlogSection from './components/BlogSection';
import Institutes from './components/Institutes';
import Footer from './components/Footer';
import CourseFlowManager from './pages/CourseFlowManager';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard'; 

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'home' | 'course-flow' | 'signup' | 'login' | 'userdashboard' | 'admin'>('home');

  const handleFindDegree = () => {
    console.log('handleFindDegree called');
    setCurrentPage('course-flow');
  };

  const handleGoHome = () => {
    console.log('handleGoHome called');
    setCurrentPage('home');
  };

  const handleSignUp = () => {
    console.log('handleSignUp called');
    setCurrentPage('signup');
  };

  const handleLogin = () => {
    console.log('handleLogin called');
    setCurrentPage('login');
  };

  const handleDashboard = () => {
    console.log('handleDashboard called');
    setCurrentPage('userdashboard');
  };

  const handleAdminDashboard = () => {
    console.log('handleAdminDashboard called');
    setCurrentPage('admin');
  };

  const handleAdmin = () => {
    console.log('handleAdmin called');
    setCurrentPage('admin');
  };

  // Debug: Log current page whenever it changes
  console.log('Current page:', currentPage);

  return (
    <Provider store={store}>
      <AppInitializer> {/* Add this wrapper */}
        <div className="min-h-screen">
          {currentPage === 'home' ? (
            <>
              <Header 
                onLogoClick={handleGoHome} 
                onFindDegreeClick={handleFindDegree}
                onSignUpClick={handleSignUp}
                onDashboardClick={handleDashboard}
                onAdminClick={handleAdmin}
              />
              <div className="pt-20"> {/* Add padding to account for fixed header */}
                <Hero onFindDegree={handleFindDegree} />
                <HowItWorks />
                <BlogSection />
                <Institutes />
                <Footer />
              </div>
            </>
          ) : currentPage === 'course-flow' ? (
            <CourseFlowManager onLogoClick={handleGoHome} />
          ) : currentPage === 'signup' ? (
            <SignUpPage onGoBack={handleGoHome} onLoginClick={handleLogin} onSuccessRedirect={handleDashboard} />
          ) : currentPage === 'login' ? (
            <LoginPage 
              onGoBack={handleGoHome} 
              onSignUpClick={handleSignUp} 
              onSuccessRedirect={handleDashboard} 
              onAdminRedirect={handleAdminDashboard} 
            />
          ) : currentPage === 'userdashboard' ? (
            <UserDashboard onGoHome={handleGoHome} />
          ) : currentPage === 'admin' ? (
            <AdminDashboard onGoBack={handleGoHome} />
          ) : (
            <div>Unknown page state: {currentPage}</div>
          )}
        </div>
      </AppInitializer> {/* Close the wrapper */}
    </Provider>
  );
};

export default App;