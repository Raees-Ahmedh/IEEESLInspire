import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Eye, Trash2, Calendar, User, Tag, Globe, EyeOff, AlertCircle, CheckCircle, X } from 'lucide-react';
import { newsService } from '../../services/apiService';
import AddNewsModal from './AddNewsModal';

interface NewsArticle {
  id: number;
  title: string;
  content: string;
  description?: string;
  imageUrl?: string;
  category?: string;
  tags?: string[];
  status: string;
  publishDate?: string;
  author: {
    id: number;
    firstName: string;
    lastName?: string;
    email: string;
  };
  auditInfo: any;
}

interface NewsManagementProps {
  onAddNews?: () => void;
  onEditNews?: (news: NewsArticle) => void;
}

const NewsManagement: React.FC<NewsManagementProps> = ({ onAddNews, onEditNews }) => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsArticle | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Load news on mount
  useEffect(() => {
    loadNews();
  }, []);

  // Filter news when search term or filters change
  useEffect(() => {
    filterNews();
  }, [news, searchTerm, statusFilter, categoryFilter]);

  const loadNews = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Loading news...');
      const response = await newsService.getAllNews();
      console.log('🔍 News response:', response);
      
      if (response.success && response.data) {
        setNews(response.data);
        console.log('🔍 News loaded:', response.data.length);
      } else {
        console.error('🔍 News API error:', response.error);
        setError(response.error || 'Failed to load news articles');
      }
    } catch (error) {
      console.error('🔍 News network error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filterNews = () => {
    let filtered = [...news];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(article =>
        article.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(article => article.status === statusFilter);
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(article => article.category === categoryFilter);
    }

    setFilteredNews(filtered);
  };

  const handleDeleteNews = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this news article?')) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await newsService.deleteNews(id);
      if (response.success) {
        setSuccess('News article deleted successfully!');
        loadNews();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.error || 'Failed to delete news article');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Error deleting news article:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    
    setIsSubmitting(true);
    try {
      const response = await newsService.updateNewsStatus(id, newStatus);
      if (response.success) {
        setSuccess(`News article ${newStatus === 'published' ? 'published' : 'unpublished'} successfully!`);
        loadNews();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.error || 'Failed to update news article status');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Error updating news status:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      draft: { bg: 'bg-gray-100', text: 'text-gray-800', icon: EyeOff },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertCircle },
      approved: { bg: 'bg-blue-100', text: 'text-blue-800', icon: CheckCircle },
      published: { bg: 'bg-green-100', text: 'text-green-800', icon: Globe },
      archived: { bg: 'bg-red-100', text: 'text-red-800', icon: X }
    };
    const config = statusMap[status as keyof typeof statusMap] || statusMap.draft;
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
      </span>
    );
  };

  const getCategoryBadge = (category: string) => {
    const categoryMap = {
      general: { bg: 'bg-blue-100', text: 'text-blue-800' },
      scholarship: { bg: 'bg-green-100', text: 'text-green-800' },
      intake: { bg: 'bg-purple-100', text: 'text-purple-800' },
      announcement: { bg: 'bg-orange-100', text: 'text-orange-800' }
    };
    const config = categoryMap[category as keyof typeof categoryMap] || categoryMap.general;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {category ? category.charAt(0).toUpperCase() + category.slice(1) : 'General'}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2 text-gray-600">Loading news articles...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">News Management</h1>
          <p className="text-gray-600">Manage news articles and announcements</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add News</span>
          </button>
          <button
            onClick={loadNews}
            className="flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 w-full sm:w-auto"
          >
            <Search className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {(success || error) && (
        <div className={`p-4 rounded-lg flex items-center space-x-2 ${
          success ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {success ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{success || error}</span>
          <button 
            onClick={() => { setSuccess(null); setError(null); }}
            className="ml-auto text-gray-600 hover:text-gray-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Search news articles..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Categories</option>
              <option value="general">General</option>
              <option value="scholarship">Scholarship</option>
              <option value="intake">Intake</option>
              <option value="announcement">Announcement</option>
            </select>
          </div>
        </div>
      </div>

      {/* News List */}
      {filteredNews.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No news articles found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
              ? 'Try adjusting your filters to see more results.'
              : 'Get started by creating your first news article.'
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredNews.map((article) => (
            <div key={article.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="mb-2">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{article.title}</h3>
                    <div className="flex flex-wrap items-center gap-2">
                      {getStatusBadge(article.status)}
                      {article.category && getCategoryBadge(article.category)}
                    </div>
                  </div>
                  <p className="text-gray-600 mb-3">{article.description || (article.content ? article.content.substring(0, 150) + '...' : 'No content available')}</p>
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{article.author?.firstName || 'Unknown'} {article.author?.lastName || ''}</span>
                    </div>
                    {article.publishDate && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(article.publishDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {article.tags && article.tags.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <Tag className="w-4 h-4" />
                        <span>{article.tags?.join(', ') || 'No tags'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  Created: {article.auditInfo?.createdAt ? new Date(article.auditInfo.createdAt).toLocaleDateString() : 'Unknown'}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedNews(article);
                      setShowViewModal(true);
                    }}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors flex items-center space-x-1"
                  >
                    <Eye className="w-3 h-3" />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => {
                      if (onEditNews) {
                        onEditNews(article);
                      } else {
                        setSelectedNews(article);
                        setShowEditModal(true);
                      }
                    }}
                    className="px-3 py-1 bg-yellow-600 text-white rounded text-xs font-medium hover:bg-yellow-700 transition-colors flex items-center space-x-1"
                  >
                    <Edit className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleToggleStatus(article.id, article.status)}
                    disabled={isSubmitting}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors flex items-center space-x-1 ${
                      article.status === 'published'
                        ? 'bg-gray-600 text-white hover:bg-gray-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {article.status === 'published' ? <EyeOff className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                    <span>{article.status === 'published' ? 'Unpublish' : 'Publish'}</span>
                  </button>
                  <button
                    onClick={() => handleDeleteNews(article.id)}
                    disabled={isSubmitting}
                    className="px-3 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition-colors flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add News Modal */}
      <AddNewsModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          loadNews();
          setShowAddModal(false);
        }}
      />
    </div>
  );
};

export default NewsManagement;
