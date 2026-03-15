import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Plus, Search, Edit2, Trash2, X, Save, Eye, EyeOff, Image } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { api } from '../../lib/api';

const AdminBlog: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    image_url: '',
    category: '',
    published: true
  });

  const categories = ['Study Guides', 'Visa Tips', 'Scholarships', 'Student Life', 'Career', 'News'];

  useEffect(() => {
    fetchPosts();
  }, []);

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

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      image_url: '',
      category: '',
      published: true
    });
    setEditing(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const payload = {
        ...formData,
        slug: formData.slug || generateSlug(formData.title)
      };

      if (editing) {
        await api.put('/api/blog', { id: editing.id, ...payload });
      } else {
        await api.post('/api/blog', payload);
      }

      setShowModal(false);
      resetForm();
      fetchPosts();
    } catch (err) {
      console.error('Failed to save post:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (post: any) => {
    setEditing(post);
    setFormData({
      title: post.title || '',
      slug: post.slug || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      image_url: post.image_url || '',
      category: post.category || '',
      published: post.published ?? true
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.delete('/api/blog', { id });
      fetchPosts();
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
  };

  const togglePublished = async (post: any) => {
    try {
      await api.put('/api/blog', { id: post.id, published: !post.published });
      setPosts(posts.map(p => p.id === post.id ? { ...p, published: !p.published } : p));
    } catch (err) {
      console.error('Failed to update post:', err);
    }
  };

  const filteredPosts = posts.filter(p =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Blog Posts</h1>
          <p className="text-slate-400">Manage blog content and study guides ({posts.length} total)</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:border-sky-500 outline-none w-full md:w-64"
            />
          </div>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-medium transition-all shadow-lg shadow-purple-500/25"
          >
            <Plus className="w-5 h-5" />
            New Post
          </button>
        </div>
      </motion.div>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.map((post, i) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition-all"
          >
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              {/* Thumbnail */}
              <div className="w-full md:w-32 h-20 rounded-xl bg-slate-700 overflow-hidden shrink-0">
                {post.image_url ? (
                  <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image className="w-8 h-8 text-slate-500" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">{post.title}</h3>
                    <p className="text-slate-400 text-sm line-clamp-1">{post.excerpt}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {post.category && (
                      <span className="px-2 py-1 rounded-lg bg-purple-500/20 text-purple-400 text-xs">
                        {post.category}
                      </span>
                    )}
                    <span className={`px-2 py-1 rounded-lg text-xs ${
                      post.published ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'
                    }`}>
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-slate-500 text-sm">{formatDate(post.created_at)}</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => togglePublished(post)}
                      className={`p-2 rounded-lg transition-colors ${
                        post.published 
                          ? 'hover:bg-amber-500/20 text-slate-400 hover:text-amber-400'
                          : 'hover:bg-green-500/20 text-slate-400 hover:text-green-400'
                      }`}
                      title={post.published ? 'Unpublish' : 'Publish'}
                    >
                      {post.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleEdit(post)}
                      className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-sky-400 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-12 rounded-2xl bg-slate-800/30 border border-slate-700">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No posts found</p>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-800 border border-slate-700 p-6"
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-700 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-bold text-white mb-6">
                {editing ? 'Edit Post' : 'New Post'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value, slug: generateSlug(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:border-sky-500 outline-none"
                    placeholder="Post title"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Slug</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:border-sky-500 outline-none"
                      placeholder="auto-generated"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white focus:border-sky-500 outline-none"
                    >
                      <option value="">Select category</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Excerpt</label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:border-sky-500 outline-none resize-none"
                    placeholder="Brief summary of the post..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Content</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:border-sky-500 outline-none resize-none"
                    placeholder="Full post content..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Featured Image URL</label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:border-sky-500 outline-none"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <label className="flex items-center gap-3 p-4 rounded-xl bg-slate-700/30 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="w-5 h-5 rounded border-slate-600 text-sky-500 focus:ring-sky-500"
                  />
                  <div>
                    <p className="text-white font-medium">Publish immediately</p>
                    <p className="text-slate-400 text-sm">Make this post visible to the public</p>
                  </div>
                </label>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-medium transition-all disabled:opacity-50"
                  >
                    {saving ? <LoadingSpinner size="sm" /> : <Save className="w-5 h-5" />}
                    {editing ? 'Update' : 'Publish'} Post
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminBlog;
