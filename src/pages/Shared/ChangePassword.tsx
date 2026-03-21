import React, { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const ChangePassword: React.FC = () => {
  const { updatePassword, profile } = useAuth();
  const isAdmin = profile?.role === 'admin';

  const [current, setCurrent]     = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [showCur, setShowCur]     = useState(false);
  const [showPw, setShowPw]       = useState(false);
  const [showCf, setShowCf]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);
  const [error, setError]         = useState('');

  const strength = (() => {
    if (!password) return null;
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1) return { label: 'Weak', color: isAdmin ? 'bg-red-500' : 'bg-red-500', width: 'w-1/5' };
    if (score <= 2) return { label: 'Fair', color: 'bg-orange-400', width: 'w-2/5' };
    if (score <= 3) return { label: 'Good', color: 'bg-yellow-400', width: 'w-3/5' };
    if (score <= 4) return { label: 'Strong', color: 'bg-teal-500', width: 'w-4/5' };
    return { label: 'Very strong', color: 'bg-emerald-500', width: 'w-full' };
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!current) {
      setError("Please enter your current password to verify it's you.");
      return;
    }
    if (password.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('New passwords do not match.');
      return;
    }
    if (current === password) {
      setError('New password must be different from your current password.');
      return;
    }

    setLoading(true);
    try {
      await updatePassword(password);
      setSuccess(true);
      setCurrent('');
      setPassword('');
      setConfirm('');
    } catch (err: any) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  // Theme tokens
  const accent     = isAdmin ? 'teal' : 'teal';
  const focusBorder  = `focus:border-${accent}-500`;
  const focusRing    = `focus:ring-${accent}-500/20`;
  const btnClass   = isAdmin
    ? 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 shadow-teal-900/30'
    : 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 shadow-teal-500/20';
  const cardClass  = isAdmin
    ? 'rounded-2xl border border-white/10 bg-white/5 p-6'
    : 'rounded-2xl border border-slate-200 bg-white p-6 shadow-sm';
  const labelClass = isAdmin ? 'text-slate-300' : 'text-slate-700';
  const inputClass = isAdmin
    ? 'bg-white/5 border-white/10 text-white placeholder-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'
    : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20';
  const iconClass  = isAdmin ? 'text-slate-500' : 'text-slate-400';
  const subText    = isAdmin ? 'text-slate-400' : 'text-slate-500';

  const FieldInput = ({
    label, value, onChange, show, setShow, placeholder, autoComplete,
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    show: boolean;
    setShow: (v: boolean) => void;
    placeholder: string;
    autoComplete: string;
  }) => (
    <div>
      <label className={`block text-sm font-medium mb-2 ${labelClass}`}>{label}</label>
      <div className="relative">
        <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${iconClass}`} />
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          className={`w-full pl-11 pr-11 py-3 rounded-xl border outline-none transition-all text-sm ${inputClass}`}
          placeholder={placeholder}
          required
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className={`absolute right-4 top-1/2 -translate-y-1/2 ${iconClass} hover:text-slate-300 transition-colors`}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-lg">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <ShieldCheck className={`h-5 w-5 ${isAdmin ? 'text-teal-400' : 'text-teal-600'}`} />
          <h2 className={`text-lg font-bold ${isAdmin ? 'text-white' : 'text-slate-900'}`}>
            Change Password
          </h2>
        </div>
        <p className={`text-sm ${subText}`}>
          Update your account password. You'll stay logged in after the change.
        </p>
      </div>

      <div className={cardClass}>
        {success && (
          <div className={`flex items-center gap-3 rounded-xl p-4 mb-5 ${
            isAdmin ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300' : 'bg-teal-50 border border-teal-200 text-teal-700'
          }`}>
            <CheckCircle className="h-5 w-5 shrink-0" />
            <span className="text-sm font-medium">Password updated successfully!</span>
          </div>
        )}

        {error && (
          <div className={`rounded-xl p-4 mb-5 text-sm ${
            isAdmin ? 'bg-red-500/10 border border-red-500/20 text-red-300' : 'bg-red-50 border border-red-200 text-red-600'
          }`}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <FieldInput
            label="Current password"
            value={current}
            onChange={setCurrent}
            show={showCur}
            setShow={setShowCur}
            placeholder="Your current password"
            autoComplete="current-password"
          />

          <div className="pt-1">
            <FieldInput
              label="New password"
              value={password}
              onChange={setPassword}
              show={showPw}
              setShow={setShowPw}
              placeholder="Min. 8 characters"
              autoComplete="new-password"
            />
            {strength && (
              <div className="mt-2">
                <div className={`h-1.5 w-full rounded-full ${isAdmin ? 'bg-white/10' : 'bg-slate-100'}`}>
                  <div className={`h-1.5 rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                </div>
                <p className={`text-xs mt-1 ${subText}`}>{strength.label}</p>
              </div>
            )}
          </div>

          <div>
            <FieldInput
              label="Confirm new password"
              value={confirm}
              onChange={setConfirm}
              show={showCf}
              setShow={setShowCf}
              placeholder="Repeat new password"
              autoComplete="new-password"
            />
            {confirm && confirm !== password && (
              <p className="text-xs text-red-400 mt-1">Passwords do not match.</p>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl text-white font-medium text-sm shadow-lg transition-all disabled:opacity-50 ${btnClass}`}
            >
              {loading ? 'Updating…' : 'Update password'}
            </button>
          </div>
        </form>
      </div>

      <p className={`text-xs mt-4 ${subText}`}>
        Use a strong, unique password with at least 8 characters, including uppercase letters and numbers.
      </p>
    </div>
  );
};

export default ChangePassword;
