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
import CourseDetailPage from './pages/CourseDetailPage';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import EditorDashboard from './pages/EditorDashboard';
// Article and University imports
import AllArticlesPage from './pages/AllArticlesPage';
import ArticleDetail from './components/ArticleDetail';
import AllUniversitiesPage from './pages/AllUniversitiesPage';
import EventsSection from './components/EventsSection';
import { api } from './services/apiService';

// Helper components for route params
const ArticleDetailWrapper = () => {
  const { id } = useParams();
  return <ArticleDetail articleId={Number(id)} onBack={() => window.history.back()} />;
};

const UniversityDetailWrapper = () => {
  const { id } = useParams();
  const [university, setUniversity] = React.useState<any>(null);
  const [courses, setCourses] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const uniId = Number(id);

  React.useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [u, c] = await Promise.all([
          api.universities.getUniversityById(uniId),
          api.courses.getAllCourses({ universityId: uniId })
        ]);
        if (!isMounted) return;
        setUniversity(u.success ? u.data : null);
        setCourses(c.success ? (c.data || []) : []);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, [uniId]);

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
          {loading ? (
            <div className="text-center py-16">Loading...</div>
          ) : (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                <h1 className="text-2xl font-bold text-gray-900">{university?.name || 'University'}</h1>
                <p className="text-gray-600">Type: {university?.type}</p>
                {university?.address && <p className="text-gray-600">{university.address}</p>}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Courses</h2>
                {courses.length === 0 ? (
                  <p className="text-gray-600">No courses found for this university.</p>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {courses.map((course: any) => (
                      <div key={course.id} className="bg-white rounded-lg border p-4">
                        <div className="font-medium text-gray-900">{course.name}</div>
                        <div className="text-sm text-gray-600">{course.courseCode}</div>
                        <button
                          onClick={() => window.location.href = `/course/${course.id}`}
                          className="mt-3 inline-flex items-center px-3 py-1.5 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                        >View</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
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
              onEditorClick={() => window.location.href = '/editor'}
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
                  <EventsSection 
                    onViewAllEvents={() => window.location.href = '/all-events'}
                    onViewEvent={id => window.location.href = `/event/${id}`}
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
              <Route path="/course/:id" element={
                <CourseDetailPage onGoBack={() => window.location.href = '/course-flow'} />
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
                  onEditorRedirect={() => window.location.href = '/editor'} 
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
              <Route path="/editor" element={
                <EditorDashboard onGoBack={() => window.location.href = '/'} />
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