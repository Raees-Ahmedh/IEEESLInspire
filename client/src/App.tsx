import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import Header from './components/Header';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import BlogSection from './components/BlogSection';
import Institutes from './components/Institutes';
import Footer from './components/Footer';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <div className="min-h-screen">
        <Header />
        <Hero />
        <HowItWorks />
        <BlogSection />
        <Institutes />
        <Footer />
      </div>
    </Provider>
  );
};

export default App;