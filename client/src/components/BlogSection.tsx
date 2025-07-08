// client/src/components/BlogSection.tsx - Updated to work with your existing App.tsx
import React, { useEffect, useState } from 'react';
import { Clock, User, ArrowRight, BookOpen, Calendar, Eye, Tag } from 'lucide-react';

interface NewsArticle {
  id: number;
  title: string;
  excerpt?: string;
  imageUrl?: string;
  authorName: string;
  authorEmail?: string;
  category: string;
  tags?: string[];
  publishDate?: string;
  readTime?: number;
  viewCount: number;
}

interface NewsResponse {
  success: boolean;
  data: NewsArticle[];
  count: number;
  timestamp: string;
}

interface BlogSectionProps {
  onViewAllArticles: () => void;
  onViewArticle: (articleId: number) => void;
}

const BlogSection: React.FC<BlogSectionProps> = ({ onViewAllArticles, onViewArticle }) => {
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());

  // API base URL
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

  // Fetch latest 3 articles for landing page
  useEffect(() => {
    const fetchNewsArticles = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Fetching latest 3 news articles for landing page...');
        
        const response = await fetch(`${API_BASE_URL}/news?limit=3&status=published`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: NewsResponse = await response.json();
        console.log('✅ Latest 3 articles fetched:', data);

        if (data.success) {
          setNewsArticles(data.data);
        } else {
          throw new Error('Failed to fetch news articles');
        }

      } catch (error: any) {
        console.error('❌ Error fetching news articles:', error);
        setError(error.message || 'Failed to load news articles');
      } finally {
        setLoading(false);
      }
    };

    fetchNewsArticles();
  }, [API_BASE_URL]);

  const handleImageError = (articleId: number) => {
    setFailedImages(prev => new Set(prev).add(articleId));
  };

  const generateFallbackClass = (category: string): string => {
    const fallbackImages: { [key: string]: string } = {
      'scholarship': 'bg-gradient-to-br from-green-400 to-green-600',
      'intake': 'bg-gradient-to-br from-blue-400 to-blue-600',
      'general': 'bg-gradient-to-br from-purple-400 to-purple-600',
      'announcement': 'bg-gradient-to-br from-pink-400 to-pink-600',
      'default': 'bg-gradient-to-br from-gray-400 to-gray-600'
    };
    
    return fallbackImages[category] || fallbackImages['default'];
  };

  const getCategoryIcon = (category: string): string => {
    const icons: { [key: string]: string } = {
      'scholarship': '💰',
      'intake': '🎓',
      'general': '📰',
      'announcement': '📢',
      'default': '📚'
    };
    
    return icons[category] || icons['default'];
  };

  const getTimeAgo = (dateString?: string): string => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  // Handle article click
  const handleArticleClick = (articleId: number) => {
    console.log('Article clicked:', articleId);
    onViewArticle(articleId);
  };

  // Handle view all articles
  const handleViewAllClick = () => {
    console.log('View all articles clicked');
    onViewAllArticles();
  };

  // Loading state
  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Latest News & Updates
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Stay informed with the latest news, announcements, and updates from universities across Sri Lanka
            </p>
          </div>
          
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading articles...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Latest News & Updates
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Stay informed with the latest news, announcements, and updates from universities across Sri Lanka
            </p>
          </div>
          
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-red-600" />
              </div>
              <p className="text-red-600 text-lg mb-4">Failed to load articles</p>
              <p className="text-gray-600 mb-6">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // No articles state
  if (newsArticles.length === 0) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Latest News & Updates
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Stay informed with the latest news, announcements, and updates from universities across Sri Lanka
            </p>
          </div>
          
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-gray-600 text-lg">No articles available at the moment</p>
              <p className="text-gray-500 text-sm mt-2">Check back soon for new content!</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Latest News & Updates
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay informed with the latest news, announcements, and updates from universities across Sri Lanka
          </p>
        </div>

        {/* News Articles Grid - Latest 3 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {newsArticles.map((article) => {
            const fallbackClass = generateFallbackClass(article.category || 'general');
            const categoryIcon = getCategoryIcon(article.category || 'general');
            const hasImage = article.imageUrl && !failedImages.has(article.id);

            return (
              <article 
                key={article.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 border border-gray-100 cursor-pointer"
                onClick={() => handleArticleClick(article.id)}
              >
                {/* Featured Image */}
                <div className="relative overflow-hidden h-48">
                  {hasImage ? (
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={() => handleImageError(article.id)}
                      loading="lazy"
                    />
                  ) : (
                    <div className={`w-full h-full ${fallbackClass} flex items-center justify-center`}>
                      <div className="text-white text-center p-4">
                        <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-80" />
                        <span className="text-2xl">{categoryIcon}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-xs font-medium shadow-lg flex items-center gap-1">
                    <span>{categoryIcon}</span>
                    {article.category || 'General'}
                  </div>

                  {/* <div className="absolute top-4 right-4 flex flex-col gap-1">
                    {article.readTime && (
                      <div className="bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {article.readTime} min
                      </div>
                    )}
                    <div className="bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {article.viewCount}
                    </div>
                  </div> */}
                </div>
                
                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">
                        {article.authorName || 'Anonymous'}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span className="text-xs">{getTimeAgo(article.publishDate)}</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  
                  {article.excerpt && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {article.excerpt}
                    </p>
                  )}

                  {article.tags && Array.isArray(article.tags) && article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {article.tags.slice(0, 2).map((tag, index) => (
                        <span 
                          key={index}
                          className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full flex items-center gap-1"
                        >
                          <Tag className="w-2 h-2" />
                          {tag}
                        </span>
                      ))}
                      {article.tags.length > 2 && (
                        <span className="text-gray-400 text-xs px-2 py-1">
                          +{article.tags.length - 2} more
                        </span>
                      )}
                    </div>
                  )}
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleArticleClick(article.id);
                    }}
                    className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium text-sm transition-colors group/btn"
                  >
                    Read More
                    <ArrowRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {/* View All Articles Button */}
        <div className="text-center">
          <button 
            onClick={handleViewAllClick}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center gap-2"
          >
            <BookOpen className="w-5 h-5" />
            View All Articles
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Blog Stats */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center bg-gray-50 rounded-full px-6 py-3">
            <BookOpen className="w-5 h-5 text-purple-600 mr-2" />
            <span className="text-gray-700 font-medium">
              {newsArticles.length} Latest Articles • 
              <span className="text-purple-600 ml-1">
                Updated Regularly
              </span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;