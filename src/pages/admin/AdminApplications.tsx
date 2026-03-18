import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Search,
  Filter,
  Calendar,
  GraduationCap,
  MapPin,
  X
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { api } from '../../lib/api';

const statuses = ['draft', 'submitted', 'under_review', 'accepted', 'rejected', 'visa_processing'] as const;

const statusMeta: Record<string, { label: string; tone: string; description: string }> = {
  draft: {
    label: 'Draft',
    tone: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    description: 'Pending student completion'
  },
  submitted: {
    label: 'Submitted',
    tone: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    description: 'Sent to the university'
  },
  under_review: {
    label: 'Under review',
    tone: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    description: 'Waiting on a decision'
  },
  accepted: {
    label: 'Accepted',
    tone: 'bg-green-500/20 text-green-300 border-green-500/30',
    description: 'Offer received'
  },
  rejected: {
    label: 'Rejected',
    tone: 'bg-red-500/20 text-red-300 border-red-500/30',
    description: 'Application closed'
  },
  visa_processing: {
    label: 'Visa processing',
    tone: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    description: 'Post-acceptance stage'
  }
};

const AdminApplications: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [universities, setUniversities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [universityFilter, setUniversityFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appsData, uniData] = await Promise.all([
          api.get('/api/applications', { minimal: '1' }),
          api.get('/api/universities')
        ]);
        setApplications(appsData);
        setUniversities(uniData);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.put('/api/applications', { id, status });
      setApplications((current) =>
        current.map((app) => (app.id === id ? { ...app, status } : app))
      );
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      !search ||
      app.profiles?.name?.toLowerCase().includes(search.toLowerCase()) ||
      app.profiles?.email?.toLowerCase().includes(search.toLowerCase()) ||
      app.programs?.name?.toLowerCase().includes(search.toLowerCase()) ||
      app.programs?.universities?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || app.status === statusFilter;
    const matchesUni = !universityFilter || app.programs?.universities?.name === universityFilter;
    return matchesSearch && matchesStatus && matchesUni;
  });

  const visibleStatuses = statusFilter ? [statusFilter] : statuses;
  const totalApplications = applications.length;
  const reviewCount = (applications.filter((app) => ['submitted', 'under_review'].includes(app.status)).length);
  const decisionCount = applications.filter((app) => ['accepted', 'rejected'].includes(app.status)).length;
  const visaCount = applications.filter((app) => app.status === 'visa_processing').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'rejected':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'under_review':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'visa_processing':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'submitted':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-slate-700 bg-slate-800/50 p-6"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">
              Pipeline board
            </div>
            <h1 className="mt-4 text-3xl font-bold text-white">Applications</h1>
            <p className="mt-2 max-w-2xl text-slate-400">
              Track every case by stage, move applications forward, and keep the admissions workflow visible at a glance.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[460px]">
            <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Total</p>
              <p className="mt-2 text-2xl font-bold text-white">{totalApplications}</p>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Review</p>
              <p className="mt-2 text-2xl font-bold text-white">{reviewCount}</p>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Decision</p>
              <p className="mt-2 text-2xl font-bold text-white">{decisionCount}</p>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Visa</p>
              <p className="mt-2 text-2xl font-bold text-white">{visaCount}</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student, program, or university..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-700 bg-slate-800/50 pl-12 pr-4 py-3 text-white placeholder-slate-500 outline-none focus:border-sky-500"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 rounded-2xl border px-4 py-3 transition-colors ${
            showFilters || statusFilter || universityFilter
              ? 'border-sky-500/50 bg-sky-500/20 text-sky-300'
              : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:text-white'
          }`}
        >
          <Filter className="w-5 h-5" />
          Filters
          {(statusFilter || universityFilter) && (
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-sky-500 text-xs font-semibold text-white">
              {(statusFilter ? 1 : 0) + (universityFilter ? 1 : 0)}
            </span>
          )}
        </button>
      </div>

      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="grid gap-4 rounded-3xl border border-slate-700 bg-slate-800/40 p-5 md:grid-cols-2 xl:grid-cols-3"
        >
          <div>
            <label className="mb-2 block text-sm text-slate-400">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-white outline-none focus:border-sky-500"
            >
              <option value="">All statuses</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {statusMeta[status].label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-400">University</label>
            <select
              value={universityFilter}
              onChange={(e) => setUniversityFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-white outline-none focus:border-sky-500"
            >
              <option value="">All universities</option>
              {universities.map((uni) => (
                <option key={uni.id} value={uni.name}>
                  {uni.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            {(statusFilter || universityFilter) && (
              <button
                onClick={() => {
                  setStatusFilter('');
                  setUniversityFilter('');
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-3 text-sm text-slate-400 hover:text-red-300"
              >
                <X className="w-4 h-4" />
                Clear filters
              </button>
            )}
          </div>
        </motion.div>
      )}

      <div className="grid gap-4 xl:grid-cols-6">
        {visibleStatuses.map((status, index) => {
          const cards = filteredApps.filter((app) => app.status === status);
          const meta = statusMeta[status];

          return (
            <motion.div
              key={status}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="rounded-3xl border border-slate-700 bg-slate-800/40 p-4"
            >
              <div className="mb-4 rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{meta.label}</p>
                    <p className="mt-1 text-xs text-slate-400">{meta.description}</p>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-medium ${meta.tone}`}>
                    {cards.length}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {cards.length > 0 ? cards.map((app) => (
                  <div key={app.id} className="rounded-2xl border border-slate-700 bg-slate-900/50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-white">{app.profiles?.name || 'Student'}</p>
                        <p className="truncate text-sm text-slate-400">{app.profiles?.email}</p>
                      </div>
                      <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${getStatusColor(app.status)}`}>
                        {app.status?.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="mt-3 space-y-2 text-sm text-slate-400">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        <span className="truncate">{app.programs?.name || 'Program'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate">
                          {app.programs?.universities?.name} • {app.programs?.universities?.country}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(app.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="mb-2 block text-xs uppercase tracking-[0.16em] text-slate-500">
                        Move stage
                      </label>
                      <select
                        value={app.status}
                        onChange={(e) => updateStatus(app.id, e.target.value)}
                        className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
                      >
                        {statuses.map((statusOption) => (
                          <option key={statusOption} value={statusOption}>
                            {statusMeta[statusOption].label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )) : (
                  <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-6 text-center">
                    <FileText className="mx-auto mb-3 h-10 w-10 text-slate-600" />
                    <p className="text-sm text-slate-400">No applications in this stage</p>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminApplications;
