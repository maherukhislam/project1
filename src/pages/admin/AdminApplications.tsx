import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Search, Filter, Calendar, GraduationCap, MapPin, ChevronDown, X } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { api } from '../../lib/api';

const AdminApplications: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [universities, setUniversities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [universityFilter, setUniversityFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [appsData, uniData] = await Promise.all([
        api.get('/api/applications'),
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

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.put('/api/applications', { id, status });
      setApplications(applications.map(app => 
        app.id === id ? { ...app, status } : app
      ));
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const filteredApps = applications.filter(app => {
    const matchesSearch = !search || 
      app.profiles?.name?.toLowerCase().includes(search.toLowerCase()) ||
      app.profiles?.email?.toLowerCase().includes(search.toLowerCase()) ||
      app.programs?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || app.status === statusFilter;
    const matchesUni = !universityFilter || app.programs?.universities?.id?.toString() === universityFilter;
    return matchesSearch && matchesStatus && matchesUni;
  });

  const statuses = ['draft', 'submitted', 'under_review', 'accepted', 'rejected', 'visa_processing'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'under_review': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'visa_processing': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'submitted': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
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
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Applications</h1>
          <p className="text-slate-400">Manage all student applications ({applications.length} total)</p>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name, email, or program..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:border-sky-500 outline-none"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors ${
              showFilters || statusFilter || universityFilter
                ? 'bg-sky-500/20 border-sky-500/50 text-sky-400'
                : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <Filter className="w-5 h-5" />
            Filters
            {(statusFilter || universityFilter) && (
              <span className="w-5 h-5 rounded-full bg-sky-500 text-white text-xs flex items-center justify-center">
                {(statusFilter ? 1 : 0) + (universityFilter ? 1 : 0)}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex flex-wrap gap-4 p-4 rounded-xl bg-slate-800/30 border border-slate-700"
          >
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm text-slate-400 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white focus:border-sky-500 outline-none"
              >
                <option value="">All Statuses</option>
                {statuses.map(s => (
                  <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm text-slate-400 mb-2">University</label>
              <select
                value={universityFilter}
                onChange={(e) => setUniversityFilter(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white focus:border-sky-500 outline-none"
              >
                <option value="">All Universities</option>
                {universities.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
            {(statusFilter || universityFilter) && (
              <button
                onClick={() => { setStatusFilter(''); setUniversityFilter(''); }}
                className="flex items-center gap-1 px-3 py-2 text-sm text-slate-400 hover:text-red-400 self-end"
              >
                <X className="w-4 h-4" />
                Clear filters
              </button>
            )}
          </motion.div>
        )}
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApps.length > 0 ? filteredApps.map((app, i) => (
          <motion.div
            key={app.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition-colors"
          >
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Student Info */}
              <div className="flex items-center gap-3 lg:w-1/4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white font-semibold">
                  {app.profiles?.name?.charAt(0) || 'S'}
                </div>
                <div className="min-w-0">
                  <p className="text-white font-medium truncate">{app.profiles?.name || 'Student'}</p>
                  <p className="text-slate-400 text-sm truncate">{app.profiles?.email}</p>
                </div>
              </div>

              {/* Program Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <GraduationCap className="w-4 h-4 text-slate-400" />
                  <p className="text-white font-medium truncate">{app.programs?.name || 'Program'}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">{app.programs?.universities?.name} • {app.programs?.universities?.country}</span>
                </div>
              </div>

              {/* Date & Intake */}
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(app.created_at).toLocaleDateString()}
                </div>
                {app.intake && (
                  <span className="px-2 py-1 rounded bg-slate-700/50 text-slate-300">
                    {app.intake}
                  </span>
                )}
              </div>

              {/* Status Dropdown */}
              <div className="relative group">
                <button className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium ${getStatusColor(app.status)}`}>
                  {app.status?.replace('_', ' ')}
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 py-2 rounded-xl bg-slate-700 border border-slate-600 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  {statuses.map(status => (
                    <button
                      key={status}
                      onClick={() => updateStatus(app.id, status)}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-600 transition-colors ${
                        app.status === status ? 'text-sky-400' : 'text-slate-300'
                      }`}
                    >
                      {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )) : (
          <div className="text-center py-12 rounded-2xl bg-slate-800/30 border border-slate-700">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No applications found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminApplications;
