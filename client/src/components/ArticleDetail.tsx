// client/src/components/ArticleDetail.tsx - Full article view component
import React, { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, User, Clock, Eye, Tag, Share2 } from 'lucide-react';

interface ArticleDetailProps {
  articleId: number;
  onBack: () => void;
}

interface FullArticle {
  id: number;
  title: string;
  content: string;
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

const ArticleDetail: React.FC<ArticleDetailProps> = ({ articleId, onBack }) => {
  const [article, setArticle] = useState<FullArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`🔄 Fetching article ${articleId}...`);
        
        const response = await fetch(`${API_BASE_URL}/news/${articleId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Article fetched:', data);

        if (data.success) {
          setArticle(data.data);
        } else {
          throw new Error('Failed to fetch article');
        }

      } catch (error: any) {
        console.error('❌ Error fetching article:', error);
        setError(error.message || 'Failed to load article');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [articleId, API_BASE_URL]);

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category: string): string => {
    const colors: { [key: string]: string } = {
      'scholarship': 'bg-green-100 text-green-800 border-green-200',
      'intake': 'bg-blue-100 text-blue-800 border-blue-200',
      'general': 'bg-purple-100 text-purple-800 border-purple-200',
      'announcement': 'bg-pink-100 text-pink-800 border-pink-200',
      'Admissions': 'bg-blue-100 text-blue-800 border-blue-200',
      'Scholarships': 'bg-green-100 text-green-800 border-green-200',
      'Career Guidance': 'bg-purple-100 text-purple-800 border-purple-200',
      'default': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    
    return colors[category] || colors['default'];
  };

  const handleShare = () => {
    if (navigator.share && article) {
      navigator.share({
        title: article.title,
        text: article.excerpt,
        url: window.location.href,
      });
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Article URL copied to clipboard!');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={onBack}
            className="flex items-center text-purple-600 hover:text-purple-700 mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Articles
          </button>
          
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading article...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={onBack}
            className="flex items-center text-purple-600 hover:text-purple-700 mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Articles
          </button>
          
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-red-600" />
              </div>
              <p className="text-red-600 text-lg mb-4">Failed to load article</p>
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center text-purple-600 hover:text-purple-700 mb-8 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Articles
        </button>

        {/* Article Container */}
        <article className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Featured Image */}
          {article.imageUrl && (
            <div className="w-full h-64 md:h-80 lg:h-96 overflow-hidden">
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Article Content */}
          <div className="p-8 lg:p-12">
            {/* Category Badge */}
            <div className="mb-6">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(article.category)}`}>
                {article.category || 'General'}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              {article.title}
            </h1>

            {/* Article Meta */}
            <div className="flex flex-wrap items-center gap-6 mb-8 text-sm text-gray-600">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                <span className="font-medium">{article.authorName}</span>
              </div>
              
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{formatDate(article.publishDate)}</span>
              </div>
              
              {article.readTime && (
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{article.readTime} min read</span>
                </div>
              )}
              
              <div className="flex items-center">
                <Eye className="w-4 h-4 mr-2" />
                <span>{article.viewCount} views</span>
              </div>
            </div>

            {/* Share Button */}
            <div className="mb-8">
              <button
                onClick={handleShare}
                className="flex items-center text-purple-600 hover:text-purple-700 transition-colors group"
              >
                <Share2 className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                Share Article
              </button>
            </div>

            {/* Article Content */}
            <div className="prose prose-lg max-w-none">
              {/* Convert content to HTML or render markdown */}
              <div 
                className="text-gray-800 leading-relaxed"
                style={{ whiteSpace: 'pre-wrap' }}
                dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br/>') }}
              />
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Author Info */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                  <User className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{article.authorName}</h4>
                  {article.authorEmail && (
                    <p className="text-gray-600 text-sm">{article.authorEmail}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};

export default ArticleDetail;