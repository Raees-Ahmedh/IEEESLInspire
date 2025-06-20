import React, { useState } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import Header from './components/Header';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import BlogSection from './components/BlogSection';
import Institutes from './components/Institutes';
import Footer from './components/Footer';
import FindYourDegree from './components/FindYourDegree';
import SignUpPage from './components/SignUpPage';
import LoginPage from './components/LoginPage'; 

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'home' | 'find-degree' | 'signup' | 'login'>('home');

  const handleFindDegree = () => {
    console.log('handleFindDegree called');
    setCurrentPage('find-degree');
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

  // Debug: Log current page whenever it changes
  console.log('Current page:', currentPage);

  return (
    <Provider store={store}>
      <div className="min-h-screen">
        {currentPage === 'home' ? (
          <>
            <Header 
              onLogoClick={handleGoHome} 
              onFindDegreeClick={handleFindDegree}
              onSignUpClick={handleSignUp}
            />
            <div className="pt-20"> {/* Add padding to account for fixed header */}
              <Hero onFindDegree={handleFindDegree} />
              <HowItWorks />
              <BlogSection />
              <Institutes />
              <Footer />
            </div>
          </>
        ) : currentPage === 'find-degree' ? (
          <FindYourDegree onGoBack={handleGoHome} />
        ) : currentPage === 'signup' ? (
          <SignUpPage onGoBack={handleGoHome} onLoginClick={handleLogin} />
        ) : currentPage === 'login' ? (
          <LoginPage onGoBack={handleGoHome} onSignUpClick={handleSignUp} />
        ) : (
          <div>Unknown page state: {currentPage}</div>
        )}
      </div>
    </Provider>
  );
};

export default App;