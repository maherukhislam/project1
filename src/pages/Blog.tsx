import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight, BookOpen } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { api } from '../lib/api';

const Blog: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await api.get('/api/blog');
        setPosts(data);
      } catch (err) {
        console.error('Failed to fetch posts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const categories = ['All', 'Study Guides', 'Visa Tips', 'Scholarships', 'Student Life', 'Career'];
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredPosts = useMemo(
    () => activeCategory === 'All' ? posts : posts.filter(p => p.category === activeCategory),
    [posts, activeCategory]
  );

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-32 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-blue-50" />
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-72 h-72 bg-sky-200/30 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div
            className="max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl font-bold text-slate-900 mb-4">
              Study Abroad
              <span className="bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent"> Blog</span>
            </h1>
            <p className="text-xl text-slate-600">
              Tips, guides, and insights to help you succeed in your international education journey.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25'
                    : 'bg-white/70 text-slate-600 hover:bg-sky-50 hover:text-sky-600 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Posts */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No posts found</h3>
              <p className="text-slate-600">Check back later for new content.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  viewport={{ once: true }}
                >
                  <Link to={`/blog/${post.slug}`}>
                    <GlassCard className="h-full overflow-hidden">
                      <div className="h-48 bg-gradient-to-br from-sky-400 to-blue-500 relative">
                        {post.image_url ? (
                          <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <BookOpen className="w-16 h-16 text-white/50" />
                          </div>
                        )}
                        {post.category && (
                          <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/90 text-sky-600 text-xs font-medium">
                            {post.category}
                          </span>
                        )}
                      </div>
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2">{post.title}</h3>
                        <p className="text-slate-600 text-sm line-clamp-2 mb-4">{post.excerpt}</p>
                        <div className="flex items-center justify-between text-sm text-slate-500">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(post.created_at)}
                            </span>
                          </div>
                          <span className="flex items-center gap-1 text-sky-600 font-medium">
                            Read more
                            <ArrowRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </GlassCard>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Blog;
