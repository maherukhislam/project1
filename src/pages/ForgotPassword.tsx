import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Globe, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import GlassCard from '../components/GlassCard';

const ForgotPassword: React.FC = () => {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await sendPasswordReset(email);
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-32">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-sky-50 via-white to-blue-50 -z-10" />
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-sky-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
      </div>

      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <Globe className="w-10 h-10 text-sky-500" />
            <span className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
              StudyGlobal
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Forgot password?</h1>
          <p className="text-slate-600">
            {sent ? 'Check your inbox.' : "Enter your email and we'll send a reset link."}
          </p>
        </div>

        <GlassCard className="p-8" hover={false}>
          {sent ? (
            <div className="text-center py-4">
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-14 h-14 text-teal-500" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">Reset link sent!</h2>
              <p className="text-slate-600 text-sm mb-6">
                We've sent a password reset link to <span className="font-medium text-slate-900">{email}</span>.
                Check your inbox (and spam folder) and click the link to set a new password.
              </p>
              <button
                onClick={() => { setSent(false); setEmail(''); }}
                className="text-sm text-sky-600 hover:text-sky-700 font-medium"
              >
                Send to a different address
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/50 border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-lg shadow-sky-500/25 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send reset link'}
                {!loading && <ArrowRight className="w-5 h-5" />}
              </button>
            </form>
          )}

          <p className="text-center text-slate-600 mt-6 text-sm">
            Remember your password?{' '}
            <Link to="/login" className="text-sky-600 hover:text-sky-700 font-medium">
              Back to login
            </Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
