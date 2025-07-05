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
// Add new imports for articles
import AllArticlesPage from './pages/AllArticlesPage';
import ArticleDetail from './components/ArticleDetail';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'home' | 'course-flow' | 'signup' | 'login' | 'userdashboard' | 'admin' | 'all-articles' | 'article-detail'>('home');
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);

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

  // Add new handlers for articles
  const handleViewAllArticles = () => {
    console.log('handleViewAllArticles called');
    setCurrentPage('all-articles');
  };

  const handleViewArticle = (articleId: number) => {
    console.log('handleViewArticle called with ID:', articleId);
    setSelectedArticleId(articleId);
    setCurrentPage('article-detail');
  };

  const handleBackToArticles = () => {
    console.log('handleBackToArticles called');
    setCurrentPage('all-articles');
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
                <BlogSection 
                  onViewAllArticles={handleViewAllArticles}
                  onViewArticle={handleViewArticle}
                />
                <Institutes />
                <Footer />
              </div>
            </>
          ) : currentPage === 'all-articles' ? (
            <>
              <Header 
                onLogoClick={handleGoHome} 
                onFindDegreeClick={handleFindDegree}
                onSignUpClick={handleSignUp}
                onDashboardClick={handleDashboard}
                onAdminClick={handleAdmin}
              />
              <div className="pt-20">
                <AllArticlesPage 
                  onBack={handleGoHome}
                  onViewArticle={handleViewArticle}
                />
                <Footer />
              </div>
            </>
          ) : currentPage === 'article-detail' && selectedArticleId ? (
            <>
              <Header 
                onLogoClick={handleGoHome} 
                onFindDegreeClick={handleFindDegree}
                onSignUpClick={handleSignUp}
                onDashboardClick={handleDashboard}
                onAdminClick={handleAdmin}
              />
              <div className="pt-20">
                <ArticleDetail 
                  articleId={selectedArticleId}
                  onBack={handleBackToArticles}
                />
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