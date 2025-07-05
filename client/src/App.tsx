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
import AllUniversitiesPage from './pages/AllUniversitiesPage';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'home' | 'course-flow' | 'signup' | 'login' | 'userdashboard' | 'admin' | 'all-articles' | 'article-detail'| 'all-universities' |'university-detail'>('home');
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);
  const [selectedUniversityId, setSelectedUniversityId] = useState<number | null>(null);

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

  // Add new handlers for universities
  const handleViewAllUniversities = () => {
    console.log('handleViewAllUniversities called');
    setCurrentPage('all-universities');
  };

  const handleViewUniversity = (universityId: number) => {
    console.log('handleViewUniversity called with ID:', universityId);
    setSelectedUniversityId(universityId);
    setCurrentPage('university-detail');
  };

  const handleBackToUniversities = () => {
    console.log('handleBackToUniversities called');
    setCurrentPage('all-universities');
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
                <Institutes onViewAllUniversities={handleViewAllUniversities} />
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
          ) : currentPage === 'all-universities' ? (
            <>
              <Header 
                onLogoClick={handleGoHome} 
                onFindDegreeClick={handleFindDegree}
                onSignUpClick={handleSignUp}
                onDashboardClick={handleDashboard}
                onAdminClick={handleAdmin}
              />
              <div className="pt-20">
                <AllUniversitiesPage 
                  onBack={handleGoHome}
                  onViewUniversity={handleViewUniversity}
                />
                <Footer />
              </div>
            </>
          ) : currentPage === 'university-detail' && selectedUniversityId ? (
            <>
              <Header 
                onLogoClick={handleGoHome} 
                onFindDegreeClick={handleFindDegree}
                onSignUpClick={handleSignUp}
                onDashboardClick={handleDashboard}
                onAdminClick={handleAdmin}
              />
              <div className="pt-20">
                <div className="min-h-screen bg-gray-50 py-8">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <button 
                      onClick={handleBackToUniversities}
                      className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
                    >
                      ← Back to Universities
                    </button>
                    <div className="text-center py-20">
                      <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        University Details
                      </h1>
                      <p className="text-gray-600 mb-4">
                        University ID: {selectedUniversityId}
                      </p>
                      <p className="text-gray-500">
                        This page will show detailed university information, courses, and programs.
                      </p>
                    </div>
                  </div>
                </div>
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