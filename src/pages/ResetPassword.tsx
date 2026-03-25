import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Globe, CheckCircle, AlertTriangle } from 'lucide-react';
import supabase, { supabaseEnabled } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import GlassCard from '../components/GlassCard';

type PageState = 'waiting' | 'ready' | 'success' | 'invalid';

const ResetPassword: React.FC = () => {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  const [pageState, setPageState] = useState<PageState>('waiting');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [showCf, setShowCf]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  useEffect(() => {
    if (!supabaseEnabled) {
      setPageState('invalid');
      return;
    }

    // Supabase fires PASSWORD_RECOVERY when the recovery link is followed.
    // This is the ONLY event that should unlock the form — an existing normal
    // session must NOT be treated as a recovery session.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setPageState('ready');
      }
    });

    // If no PASSWORD_RECOVERY event fires within 2 seconds, show invalid.
    const timeout = setTimeout(() => {
      setPageState((s) => s === 'waiting' ? 'invalid' : s);
    }, 2000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await updatePassword(password);
      setPageState('success');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  const strength = (() => {
    if (!password) return null;
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1) return { label: 'Weak', color: 'bg-red-500', width: 'w-1/5' };
    if (score <= 2) return { label: 'Fair', color: 'bg-orange-400', width: 'w-2/5' };
    if (score <= 3) return { label: 'Good', color: 'bg-yellow-400', width: 'w-3/5' };
    if (score <= 4) return { label: 'Strong', color: 'bg-teal-500', width: 'w-4/5' };
    return { label: 'Very strong', color: 'bg-emerald-500', width: 'w-full' };
  })();

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-32">
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Set new password</h1>
          <p className="text-slate-600">Choose a strong password for your account.</p>
        </div>

        <GlassCard className="p-8" hover={false}>
          {/* Waiting */}
          {pageState === 'waiting' && (
            <div className="py-8 text-center text-slate-500">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent mx-auto mb-3" />
              Verifying reset link…
            </div>
          )}

          {/* Invalid / expired */}
          {pageState === 'invalid' && (
            <div className="py-6 text-center">
              <AlertTriangle className="w-12 h-12 text-orange-400 mx-auto mb-3" />
              <h2 className="text-lg font-semibold text-slate-900 mb-2">Link expired or invalid</h2>
              <p className="text-slate-600 text-sm mb-5">
                This reset link has expired or has already been used. Request a new one.
              </p>
              <Link
                to="/forgot-password"
                className="inline-block py-2.5 px-6 rounded-xl text-white bg-gradient-to-r from-sky-500 to-blue-600 font-medium text-sm"
              >
                Request new link
              </Link>
            </div>
          )}

          {/* Success */}
          {pageState === 'success' && (
            <div className="py-6 text-center">
              <CheckCircle className="w-14 h-14 text-teal-500 mx-auto mb-3" />
              <h2 className="text-lg font-semibold text-slate-900 mb-2">Password updated!</h2>
              <p className="text-slate-600 text-sm">
                Your password has been changed. Redirecting you to login…
              </p>
            </div>
          )}

          {/* Ready — show form */}
          {pageState === 'ready' && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">New password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 rounded-xl bg-white/50 border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all"
                    placeholder="Min. 8 characters"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {/* Strength bar */}
                {strength && (
                  <div className="mt-2">
                    <div className="h-1.5 w-full rounded-full bg-slate-100">
                      <div className={`h-1.5 rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{strength.label}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Confirm new password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showCf ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className={`w-full pl-12 pr-12 py-3 rounded-xl bg-white/50 border outline-none transition-all ${
                      confirm && confirm !== password
                        ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-400/20'
                        : 'border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20'
                    }`}
                    placeholder="Repeat password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCf(!showCf)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showCf ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {confirm && confirm !== password && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match.</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-lg shadow-sky-500/25 transition-all font-medium disabled:opacity-50"
              >
                {loading ? 'Updating…' : 'Update password'}
              </button>
            </form>
          )}

          <p className="text-center text-slate-600 mt-6 text-sm">
            <Link to="/login" className="text-sky-600 hover:text-sky-700 font-medium">
              Back to login
            </Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
