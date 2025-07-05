// client/src/components/AllArticlesPage.tsx - Fixed version
import React, { useEffect, useState } from 'react';
import { Clock, User, ArrowRight, BookOpen, Calendar, Eye, Tag, ArrowLeft, Search, Filter } from 'lucide-react';

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

interface AllArticlesPageProps {
  onBack: () => void;
  onViewArticle: (articleId: number) => void;
}

const AllArticlesPage: React.FC<AllArticlesPageProps> = ({ onBack, onViewArticle }) => {
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
  
  // Filter state
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredArticles, setFilteredArticles] = useState<NewsArticle[]>([]);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

  // Fetch all articles
  useEffect(() => {
    const fetchAllArticles = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Fetching all articles...');
        
        const response = await fetch(`${API_BASE_URL}/news?limit=50&status=published`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: NewsResponse = await response.json();
        console.log('✅ All articles fetched:', data);

        if (data.success) {
          setNewsArticles(data.data);
          setFilteredArticles(data.data);
        } else {
          throw new Error('Failed to fetch articles');
        }

      } catch (error: any) {
        console.error('❌ Error fetching articles:', error);
        setError(error.message || 'Failed to load articles');
      } finally {
        setLoading(false);
      }
    };

    fetchAllArticles();
  }, [API_BASE_URL]);

  // Filter articles based on category and search
  useEffect(() => {
    let filtered = newsArticles;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article => 
        article.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(query) ||
        article.excerpt?.toLowerCase().includes(query) ||
        article.authorName.toLowerCase().includes(query) ||
        article.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    setFilteredArticles(filtered);
  }, [newsArticles, selectedCategory, searchQuery]);

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(newsArticles.map(article => article.category).filter(Boolean)))];

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

  const handleArticleClick = (articleId: number) => {
    onViewArticle(articleId);
  };

  const handleBackToHome = () => {
    onBack();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBackToHome}
            className="flex items-center text-purple-600 hover:text-purple-700 mb-6 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </button>
          
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">All News & Articles</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Browse through all our latest news, updates, and educational content
            </p>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search articles, authors, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Category Filter */}
            <div className="lg:w-64">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* Results Summary */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredArticles.length} of {newsArticles.length} articles
            {selectedCategory !== 'all' && ` in ${selectedCategory}`}
            {searchQuery && ` matching "${searchQuery}"`}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading articles...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
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
        )}

        {/* No Results */}
        {!loading && !error && filteredArticles.length === 0 && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-gray-600 text-lg">No articles found</p>
              <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filter criteria</p>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="mt-4 text-purple-600 hover:text-purple-700 transition-colors"
              >
                Clear filters
              </button>
            </div>
          </div>
        )}

        {/* Articles Grid */}
        {!loading && !error && filteredArticles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article) => {
              const fallbackClass = generateFallbackClass(article.category || 'general');
              const categoryIcon = getCategoryIcon(article.category || 'general');
              const hasImage = article.imageUrl && !failedImages.has(article.id);

              return (
                <article 
                  key={article.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 group hover:-translate-y-1 border border-gray-200 cursor-pointer"
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
                    
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-xs font-medium shadow-lg flex items-center gap-1">
                      <span>{categoryIcon}</span>
                      {article.category || 'General'}
                    </div>

                    {/* Reading Time & Views */}
                    <div className="absolute top-4 right-4 flex flex-col gap-1">
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
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-6">
                    {/* Author & Date */}
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

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    
                    {/* Excerpt */}
                    {article.excerpt && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {article.excerpt}
                      </p>
                    )}

                    {/* Tags */}
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
                    
                    {/* Read More Button */}
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
        )}
      </div>
    </div>
  );
};

export default AllArticlesPage;