import React from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import AppInitializer from './components/AppInitializer';
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
import ManagerDashboard from './pages/ManagerDashboard';
// Article and University imports
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
              onLoginClick={() => window.location.href = '/login'}
              onDashboardClick={() => window.location.href = '/userdashboard'}
              onAdminClick={() => window.location.href = '/admin'}
              onManagerClick={() => window.location.href = '/manager'}
            />
            <Routes>
              {/* Home Page */}
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

              {/* Articles Routes */}
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

              {/* Universities Routes */}
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

              {/* Course Flow */}
              <Route path="/course-flow" element={
                <CourseFlowManager onLogoClick={() => window.location.href = '/'} />
              } />

              {/* Authentication Routes */}
              <Route path="/signup" element={
                <SignUpPage 
                  onGoBack={() => window.location.href = '/'} 
                  onLoginClick={() => window.location.href = '/login'} 
                  onSuccessRedirect={() => window.location.href = '/userdashboard'} 
                />
              } />
              <Route path="/login" element={
                <LoginPage 
                  onGoBack={() => window.location.href = '/'} 
                  onSignUpClick={() => window.location.href = '/signup'} 
                  onSuccessRedirect={() => window.location.href = '/userdashboard'} 
                  onAdminRedirect={() => window.location.href = '/admin'} 
                  onManagerRedirect={() => window.location.href = '/manager'} 
                />
              } />

              {/* Dashboard Routes */}
              <Route path="/userdashboard" element={
                <UserDashboard onGoHome={() => window.location.href = '/'} />
              } />
              <Route path="/admin" element={
                <AdminDashboard onGoBack={() => window.location.href = '/'} />
              } />
              <Route path="/manager" element={
                <ManagerDashboard onGoBack={() => window.location.href = '/'} />
              } />

              {/* 404 Route */}
              <Route path="*" element={
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                    <p className="text-xl text-gray-600 mb-8">Page not found</p>
                    <button
                      onClick={() => window.location.href = '/'}
                      className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all"
                    >
                      Go Home
                    </button>
                  </div>
                </div>
              } />
            </Routes>
          </div>
        </Router>
      </AppInitializer>
    </Provider>
  );
};

export default App;