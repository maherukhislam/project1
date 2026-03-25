import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, ArrowLeft, BookOpen, Tag } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { api } from '../lib/api';

const sanitizeHtml = (html: string) => {
  if (!html) return '';
  return html
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, '')
    .replace(/on\w+="[^"]*"/gim, '')
    .replace(/on\w+='[^']*'/gim, '')
    .replace(/on\w+=\w+/gim, '')
    .replace(/javascript:/gim, '');
};

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) { setNotFound(true); setLoading(false); return; }
    const fetchPost = async () => {
      try {
        const data = await api.get(`/api/blog/${slug}`);
        if (!data || !data.id) { setNotFound(true); } else { setPost(data); }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-32">
        <BookOpen className="w-16 h-16 text-slate-300 mb-4" />
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Post not found</h1>
        <p className="text-slate-600 mb-6">This article may have been removed or the link is incorrect.</p>
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-32 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-blue-50" />
        <div className="absolute top-20 right-20 w-72 h-72 bg-sky-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-sm font-medium text-sky-600 hover:text-sky-700 mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>

            {post.category && (
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-4 h-4 text-sky-500" />
                <span className="text-sm font-medium text-sky-600 bg-sky-50 px-3 py-1 rounded-full">
                  {post.category}
                </span>
              </div>
            )}

            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-4">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-xl text-slate-600 leading-relaxed mb-6">{post.excerpt}</p>
            )}

            <div className="flex items-center gap-4 text-sm text-slate-500">
              {post.created_at && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {formatDate(post.created_at)}
                </span>
              )}
              {post.author && (
                <span className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-[10px] font-bold text-white">
                    {post.author.charAt(0).toUpperCase()}
                  </div>
                  {post.author}
                </span>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Cover image */}
      {post.image_url && (
        <div className="max-w-3xl mx-auto px-6 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl overflow-hidden shadow-xl"
          >
            <img src={post.image_url} alt={post.title} className="w-full h-64 md:h-80 object-cover" />
          </motion.div>
        </div>
      )}

      {/* Content */}
      <section className="pb-24">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard className="p-8 md:p-12" hover={false}>
              {post.content ? (
                <div
                  className="prose prose-slate prose-lg max-w-none prose-headings:font-bold prose-a:text-sky-600 prose-a:no-underline hover:prose-a:underline"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
                />
              ) : (
                <p className="text-slate-600 text-lg leading-relaxed">
                  {post.excerpt || 'No content available for this post.'}
                </p>
              )}
            </GlassCard>
          </motion.div>

          <div className="mt-8 flex justify-center">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:border-slate-300 hover:text-slate-900 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogPost;
