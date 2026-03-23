import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  UserCog,
  MapPin,
  Circle,
  ChevronRight,
  X,
  Eye
} from 'lucide-react';
import { api } from '../../lib/api';
import LoadingSpinner from '../../components/LoadingSpinner';

// Helper to format last seen time
const formatLastSeen = (lastSeenAt: string | null | undefined): string => {
  if (!lastSeenAt) return 'Never';
  
  const lastSeen = new Date(lastSeenAt);
  const now = new Date();
  const diffMs = now.getTime() - lastSeen.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return lastSeen.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Determine if user is considered online (active within last 5 minutes)
const isUserOnline = (user: any): boolean => {
  if (user.is_online === true) {
    if (user.last_seen_at) {
      const lastSeen = new Date(user.last_seen_at);
      const diffMs = Date.now() - lastSeen.getTime();
      return diffMs < 5 * 60 * 1000;
    }
    return true;
  }
  return false;
};

interface Counselor {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: string;
  preferred_country?: string;
  counselor_specializations?: string[];
  counselor_capacity?: number;
  counselor_active?: boolean;
  created_at: string;
  is_online?: boolean;
  last_seen_at?: string | null;
  assigned_students_count?: number;
}

interface Student {
  id: string;
  user_id: string;
  name: string;
  email: string;
  assigned_counselor_id?: string;
  profile_completion?: number;
  pipeline_stage?: string;
  is_online?: boolean;
  last_seen_at?: string | null;
}

const AdminCounselors: React.FC = () => {
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCounselor, setSelectedCounselor] = useState<Counselor | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [adminsData, studentsData] = await Promise.all([
          api.get('/api/admin/admins'),
          api.get('/api/admin/students', { minimal: '1' })
        ]);
        
        // Filter only counselors
        const counselorsList = (adminsData || []).filter((a: any) => a.role === 'counselor');
        setCounselors(counselorsList);
        setStudents(studentsData || []);
      } catch (error) {
        console.error('Failed to fetch counselors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Count assigned students for each counselor
  const counselorsWithCounts = useMemo(() => {
    return counselors.map(counselor => ({
      ...counselor,
      assigned_students_count: students.filter(s => s.assigned_counselor_id === counselor.user_id).length
    }));
  }, [counselors, students]);

  // Filter counselors
  const filteredCounselors = useMemo(() => {
    return counselorsWithCounts.filter(c => {
      const matchesSearch = !searchQuery || 
        c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'active' && c.counselor_active !== false) ||
        (filterStatus === 'inactive' && c.counselor_active === false);
      
      return matchesSearch && matchesStatus;
    });
  }, [counselorsWithCounts, searchQuery, filterStatus]);

  // Get assigned students for selected counselor
  const assignedStudents = useMemo(() => {
    if (!selectedCounselor) return [];
    return students.filter(s => s.assigned_counselor_id === selectedCounselor.user_id);
  }, [selectedCounselor, students]);

  // Stats
  const stats = useMemo(() => ({
    totalCounselors: counselors.length,
    activeCounselors: counselors.filter(c => c.counselor_active !== false).length,
    onlineNow: counselors.filter(c => isUserOnline(c)).length,
    totalCapacity: counselors.reduce((sum, c) => sum + (c.counselor_capacity || 30), 0)
  }), [counselors]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-slate-700 bg-slate-800/50 p-6"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-200">
              Team Management
            </div>
            <h1 className="mt-4 text-3xl font-bold text-white">Counselor Management</h1>
            <p className="mt-2 max-w-2xl text-slate-400">
              Monitor counselor activity, view assigned students, and track workload distribution.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[420px]">
            <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Total</p>
              <p className="mt-2 text-2xl font-bold text-white">{stats.totalCounselors}</p>
            </div>
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-emerald-400 flex items-center gap-1.5">
                <Circle className="h-2 w-2 fill-emerald-400" />
                Online
              </p>
              <p className="mt-2 text-2xl font-bold text-emerald-400">{stats.onlineNow}</p>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Active</p>
              <p className="mt-2 text-2xl font-bold text-white">{stats.activeCounselors}</p>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Capacity</p>
              <p className="mt-2 text-2xl font-bold text-white">{stats.totalCapacity}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search counselors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-900/60 py-3 pl-10 pr-4 text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>
        
        <div className="flex gap-2">
          {(['all', 'active', 'inactive'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                filterStatus === status
                  ? 'bg-sky-500 text-white'
                  : 'border border-slate-700 bg-slate-900/60 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 xl:grid-cols-[1fr_400px]">
        {/* Counselor List */}
        <div className="space-y-3">
          {filteredCounselors.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-12 text-center">
              <UserCog className="mx-auto h-12 w-12 text-slate-600" />
              <p className="mt-4 text-lg font-medium text-slate-400">No counselors found</p>
              <p className="mt-1 text-sm text-slate-500">
                {searchQuery ? 'Try adjusting your search' : 'Add counselors from the Admin & Roles page'}
              </p>
            </div>
          ) : (
            filteredCounselors.map((counselor) => (
              <motion.div
                key={counselor.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedCounselor(counselor)}
                className={`cursor-pointer rounded-2xl border p-4 transition-all hover:border-sky-500/50 ${
                  selectedCounselor?.id === counselor.id
                    ? 'border-sky-500 bg-sky-500/10'
                    : 'border-slate-700 bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {/* Avatar with online indicator */}
                    <div className="relative">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-500 text-base font-semibold text-white">
                        {counselor.name?.charAt(0) || 'C'}
                      </div>
                      <span
                        className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-slate-800 ${
                          isUserOnline(counselor) ? 'bg-emerald-500' : 'bg-slate-500'
                        }`}
                        title={isUserOnline(counselor) ? 'Online' : `Last seen: ${formatLastSeen(counselor.last_seen_at)}`}
                      />
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-white">{counselor.name || 'Counselor'}</p>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                            counselor.counselor_active !== false
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {counselor.counselor_active !== false ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-sm text-slate-400">{counselor.email}</p>
                        <span className={`text-xs ${isUserOnline(counselor) ? 'text-emerald-400' : 'text-slate-500'}`}>
                          {isUserOnline(counselor) ? 'Online' : formatLastSeen(counselor.last_seen_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {/* Stats */}
                    <div className="hidden sm:flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-slate-500">Students</p>
                        <p className="font-semibold text-white">
                          {counselor.assigned_students_count || 0} / {counselor.counselor_capacity || 30}
                        </p>
                      </div>
                      {counselor.preferred_country && (
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <MapPin className="h-4 w-4" />
                          <span>{counselor.preferred_country}</span>
                        </div>
                      )}
                    </div>
                    
                    <ChevronRight className="h-5 w-5 text-slate-500" />
                  </div>
                </div>

                {/* Specializations */}
                {counselor.counselor_specializations && counselor.counselor_specializations.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {counselor.counselor_specializations.slice(0, 4).map((spec, idx) => (
                      <span
                        key={idx}
                        className="rounded-full border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-300"
                      >
                        {spec}
                      </span>
                    ))}
                    {counselor.counselor_specializations.length > 4 && (
                      <span className="text-xs text-slate-500">
                        +{counselor.counselor_specializations.length - 4} more
                      </span>
                    )}
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>

        {/* Selected Counselor Detail */}
        {selectedCounselor ? (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl border border-slate-700 bg-slate-900/60 p-6"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-500 text-lg font-bold text-white">
                    {selectedCounselor.name?.charAt(0) || 'C'}
                  </div>
                  <span
                    className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-slate-800 ${
                      isUserOnline(selectedCounselor) ? 'bg-emerald-500' : 'bg-slate-500'
                    }`}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xl font-bold text-white">{selectedCounselor.name}</p>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        isUserOnline(selectedCounselor)
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                      }`}
                    >
                      <Circle className={`h-2 w-2 ${isUserOnline(selectedCounselor) ? 'fill-emerald-400' : 'fill-slate-400'}`} />
                      {isUserOnline(selectedCounselor) ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400">{selectedCounselor.email}</p>
                  {!isUserOnline(selectedCounselor) && selectedCounselor.last_seen_at && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      Last active: {formatLastSeen(selectedCounselor.last_seen_at)}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedCounselor(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-3">
                <p className="text-xs text-slate-500 uppercase tracking-wider">Assigned</p>
                <p className="mt-1 text-lg font-semibold text-white">
                  {selectedCounselor.assigned_students_count || 0} students
                </p>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-3">
                <p className="text-xs text-slate-500 uppercase tracking-wider">Capacity</p>
                <p className="mt-1 text-lg font-semibold text-white">
                  {selectedCounselor.counselor_capacity || 30} max
                </p>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-3">
                <p className="text-xs text-slate-500 uppercase tracking-wider">Status</p>
                <p className={`mt-1 text-lg font-semibold ${selectedCounselor.counselor_active !== false ? 'text-emerald-400' : 'text-red-400'}`}>
                  {selectedCounselor.counselor_active !== false ? 'Active' : 'Inactive'}
                </p>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-3">
                <p className="text-xs text-slate-500 uppercase tracking-wider">Joined</p>
                <p className="mt-1 text-lg font-semibold text-white">
                  {new Date(selectedCounselor.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Assigned Students */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-white">Assigned Students</h3>
                <span className="text-sm text-slate-500">{assignedStudents.length} total</span>
              </div>
              
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {assignedStudents.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-700 bg-slate-800/30 p-6 text-center">
                    <Users className="mx-auto h-8 w-8 text-slate-600" />
                    <p className="mt-2 text-sm text-slate-500">No students assigned</p>
                  </div>
                ) : (
                  assignedStudents.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-800/50 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 text-sm font-semibold text-white">
                            {student.name?.charAt(0) || 'S'}
                          </div>
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-slate-800 ${
                              isUserOnline(student) ? 'bg-emerald-500' : 'bg-slate-500'
                            }`}
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{student.name || 'Student'}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-slate-500">{student.email}</p>
                            <span className={`text-xs ${isUserOnline(student) ? 'text-emerald-400' : 'text-slate-500'}`}>
                              {isUserOnline(student) ? 'Online' : formatLastSeen(student.last_seen_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">
                          {student.profile_completion || 0}%
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-12 text-center">
            <Eye className="mx-auto h-12 w-12 text-slate-600" />
            <p className="mt-4 text-lg font-medium text-slate-400">Select a counselor</p>
            <p className="mt-1 text-sm text-slate-500">
              Click on a counselor to view their details and assigned students
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCounselors;
