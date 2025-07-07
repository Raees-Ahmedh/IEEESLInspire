import React from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
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


// Helper components for route params
const ArticleDetailWrapper = () => {
  const { id } = useParams();
  return <ArticleDetail articleId={Number(id)} onBack={() => window.history.back()} />;
};

const UniversityDetailWrapper = () => {
  const { id } = useParams();
  return (
    <div className="pt-20">
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
          >
            ← Back to Universities
          </button>
          <div className="text-center py-20">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              University Details
            </h1>
            <p className="text-gray-600 mb-4">
              University ID: {id}
            </p>
            <p className="text-gray-500">
              This page will show detailed university information, courses, and programs.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppInitializer>
        <Router>
          <div className="min-h-screen">
            <Header 
              onLogoClick={() => window.location.href = '/'}
              onFindDegreeClick={() => window.location.href = '/course-flow'}
              onSignUpClick={() => window.location.href = '/signup'}
              onDashboardClick={() => window.location.href = '/userdashboard'}
              onAdminClick={() => window.location.href = '/admin'}
            />
            <Routes>
              <Route path="/" element={
                <div className="pt-20">
                  <Hero onFindDegree={() => window.location.href = '/course-flow'} />
                  <HowItWorks />
                  <BlogSection 
                    onViewAllArticles={() => window.location.href = '/all-articles'}
                    onViewArticle={id => window.location.href = `/article/${id}`}
                  />
                  <Institutes onViewAllUniversities={() => window.location.href = '/all-universities'} />
                  <Footer />
                </div>
              } />
              <Route path="/all-articles" element={
                <div className="pt-20">
                  <AllArticlesPage 
                    onBack={() => window.location.href = '/'}
                    onViewArticle={id => window.location.href = `/article/${id}`}
                  />
                  <Footer />
                </div>
              } />
              <Route path="/article/:id" element={<ArticleDetailWrapper />} />
              <Route path="/all-universities" element={
                <div className="pt-20">
                  <AllUniversitiesPage 
                    onBack={() => window.location.href = '/'}
                    onViewUniversity={id => window.location.href = `/university/${id}`}
                  />
                  <Footer />
                </div>
              } />
              <Route path="/university/:id" element={<UniversityDetailWrapper />} />
              <Route path="/course-flow" element={<CourseFlowManager onLogoClick={() => window.location.href = '/'} />} />
              <Route path="/signup" element={<SignUpPage onGoBack={() => window.location.href = '/'} onLoginClick={() => window.location.href = '/login'} onSuccessRedirect={() => window.location.href = '/userdashboard'} />} />
              <Route path="/login" element={<LoginPage onGoBack={() => window.location.href = '/'} onSignUpClick={() => window.location.href = '/signup'} onSuccessRedirect={() => window.location.href = '/userdashboard'} onAdminRedirect={() => window.location.href = '/admin'} />} />
              <Route path="/userdashboard" element={<UserDashboard onGoHome={() => window.location.href = '/'} />} />
              <Route path="/admin" element={<AdminDashboard onGoBack={() => window.location.href = '/'} />} />
              <Route path="*" element={<div>Unknown page state</div>} />
            </Routes>
          </div>
        </Router>
      </AppInitializer>
    </Provider>
  );
};

export default App;