import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, GraduationCap, MapPin, Calendar, ChevronRight, Plus, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
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
        const data = await api.get('/api/applications');
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
    : applications.filter(app => app.status === filter);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'under_review': return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case 'submitted': return <Clock className="w-5 h-5 text-blue-500" />;
      default: return <FileText className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'under_review': return 'bg-amber-100 text-amber-700';
      case 'submitted': return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">My Applications</h1>
          <p className="text-slate-600">Track and manage your university applications</p>
        </div>
        <Link
          to="/dashboard/match"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 transition-all font-medium"
        >
          <Plus className="w-5 h-5" />
          New Application
        </Link>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'draft', 'submitted', 'under_review', 'accepted', 'rejected'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === status
                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25'
                : 'bg-white/70 text-slate-600 hover:bg-sky-50 hover:text-sky-600 border border-slate-200'
            }`}
          >
            {status === 'all' ? 'All' : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Applications List */}
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
              transition={{ delay: i * 0.05 }}
            >
              <GlassCard className="p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    {getStatusIcon(app.status)}
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                      <GraduationCap className="w-7 h-7 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 truncate">
                        {app.programs?.name || 'Program'}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">
                          {app.programs?.universities?.name} • {app.programs?.universities?.country}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                        {app.status.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </span>
                      <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(app.created_at)}
                      </div>
                    </div>
                    <Link
                      to={`/dashboard/applications/${app.id}`}
                      className="p-2 rounded-xl hover:bg-sky-50 text-slate-400 hover:text-sky-600 transition-colors"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </Link>
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
