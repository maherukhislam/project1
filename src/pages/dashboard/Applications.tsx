import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, GraduationCap, MapPin, Calendar, ChevronRight, Plus, Clock, CheckCircle, XCircle, AlertCircle, Compass } from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { api } from '../../lib/api';

const Applications: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const data = await api.get('/api/applications', { minimal: '1' });
        setApplications(data);
      } catch (err) {
        console.error('Failed to fetch applications:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const filteredApps = filter === 'all'
    ? applications
    : applications.filter((app) => app.status === filter);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'under_review': return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case 'submitted': return <Clock className="w-5 h-5 text-blue-500" />;
      case 'visa_processing': return <Compass className="w-5 h-5 text-purple-500" />;
      default: return <FileText className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'under_review': return 'bg-amber-100 text-amber-700';
      case 'submitted': return 'bg-blue-100 text-blue-700';
      case 'visa_processing': return 'bg-purple-100 text-purple-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const stats = [
    { label: 'All', value: applications.length },
    { label: 'Submitted', value: applications.filter((app) => app.status === 'submitted').length },
    { label: 'Review', value: applications.filter((app) => app.status === 'under_review').length },
    { label: 'Accepted', value: applications.filter((app) => app.status === 'accepted').length }
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[2rem] border border-sky-100 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.16),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(240,249,255,0.95))] p-8 shadow-[0_24px_70px_rgba(14,116,144,0.1)]"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
              Application Tracker
            </div>
            <h1 className="mt-4 text-3xl font-bold text-slate-900">My Applications</h1>
            <p className="mt-2 max-w-2xl text-slate-600">
              Follow every draft, submission, and decision from one organized view.
            </p>
          </div>

          <Link
            to="/dashboard/match"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 transition-all font-medium shadow-lg shadow-sky-500/20"
          >
            <Plus className="w-5 h-5" />
            Start New Application
          </Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white/75 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{stat.label}</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="flex flex-wrap gap-2">
        {['all', 'draft', 'submitted', 'under_review', 'accepted', 'rejected', 'visa_processing'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === status
                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25'
                : 'bg-white/80 text-slate-600 hover:bg-sky-50 hover:text-sky-600 border border-slate-200'
            }`}
          >
            {status === 'all' ? 'All' : status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
          </button>
        ))}
      </div>

      {filteredApps.length === 0 ? (
        <GlassCard className="p-12 text-center" hover={false}>
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {filter === 'all' ? 'No Applications Yet' : `No ${filter.replace('_', ' ')} Applications`}
          </h2>
          <p className="text-slate-600 mb-6">
            {filter === 'all'
              ? 'Start by finding universities that match your profile.'
              : 'Try selecting a different filter.'}
          </p>
          {filter === 'all' && (
            <Link
              to="/dashboard/match"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 transition-all font-medium"
            >
              Find Universities
              <ChevronRight className="w-5 h-5" />
            </Link>
          )}
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {filteredApps.map((app, i) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <GlassCard className="p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="mt-1">{getStatusIcon(app.status)}</div>
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-7 h-7 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 text-lg truncate">
                        {app.programs?.name || 'Program'}
                      </h3>
                      <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">
                          {app.programs?.universities?.name} • {app.programs?.universities?.country}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-500">
                        <span className={`inline-flex px-3 py-1 rounded-full font-medium ${getStatusColor(app.status)}`}>
                          {app.status.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </span>
                        {app.intake && <span className="inline-flex px-3 py-1 rounded-full bg-slate-100 text-slate-700">{app.intake}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 lg:min-w-[220px] lg:justify-end">
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1 text-sm text-slate-500">
                        <Calendar className="w-4 h-4" />
                        {formatDate(app.created_at)}
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        {app.status === 'draft' ? 'Draft saved, ready to submit later.' : 'Status updated by counselor or admin.'}
                      </p>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Applications;
