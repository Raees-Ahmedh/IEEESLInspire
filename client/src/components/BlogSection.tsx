import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { setSelectedPost } from '../store/slices/blogSlice';

const BlogSection: React.FC = () => {
  const dispatch = useAppDispatch();
  const { posts, loading } = useAppSelector((state) => state.blog);

  const handleReadMore = (postId: number) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      dispatch(setSelectedPost(post));
      // Navigate to blog post detail page
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading blog posts...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Latest From our Blog</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Insights, tips, and news to help you navigate your educational journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article key={post.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
              <div className="relative overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {post.date}
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                  {post.title}
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {post.description}
                </p>
                {post.author && (
                  <p className="text-sm text-gray-500 mb-4">
                    By {post.author} • {post.readTime}
                  </p>
                )}
                <button
                  onClick={() => handleReadMore(post.id)}
                  className="flex items-center text-purple-600 font-medium group-hover:text-purple-700 transition-colors"
                >
                  Read More
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;