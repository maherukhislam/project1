import React from 'react';
import { Link } from 'react-router-dom';
import GlassCard from '../components/GlassCard';

const ForgotPassword: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-sky-50 to-blue-100 px-4">
      <GlassCard className="w-full max-w-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-3">Reset password</h1>
        <p className="text-slate-600 mb-6">
          Password reset is currently handled through Supabase email recovery. Please use your configured
          recovery flow to request a reset link.
        </p>
        <Link to="/login" className="text-sky-600 hover:text-sky-700 font-medium">
          Back to login
        </Link>
      </GlassCard>
    </div>
  );
};

export default ForgotPassword;
