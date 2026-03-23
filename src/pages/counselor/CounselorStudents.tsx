import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Mail,
  Phone,
  MapPin,
  Circle,
  Clock,
  Eye,
  X,
  FileText,
  GraduationCap,
  CheckCircle
} from 'lucide-react';
import { api } from '../../lib/api';
import LoadingSpinner from '../../components/LoadingSpinner';

// Helper to format last seen time
const formatLastSeen = (lastSeenAt: string | null): string => {
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
const isUserOnline = (student: any): boolean => {
  if (student.is_online === true) {
    if (student.last_seen_at) {
      const lastSeen = new Date(student.last_seen_at);
      const diffMs = Date.now() - lastSeen.getTime();
      return diffMs < 5 * 60 * 1000;
    }
    return true;
  }
  return false;
};

const stageLabels: Record<string, string> = {
  new_lead: 'New Lead',
  profile_incomplete: 'Profile Incomplete',
  ready_to_apply: 'Ready to Apply',
  applied: 'Applied',
  offer_received: 'Offer Received',
  visa_processing: 'Visa Processing',
  completed: 'Completed'
};

const CounselorStudents: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'offline'>('all');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await api.get('/api/admin/students', { minimal: '1' });
        setStudents(data || []);
      } catch (error) {
        console.error('Failed to fetch students:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesSearch = !searchQuery || 
        s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'online' && isUserOnline(s)) ||
        (filterStatus === 'offline' && !isUserOnline(s));
      
      return matchesSearch && matchesStatus;
    });
  }, [students, searchQuery, filterStatus]);

  // Stats
  const stats = useMemo(() => ({
    totalStudents: students.length,
    onlineNow: students.filter(s => isUserOnline(s)).length,
    readyToApply: students.filter(s => s.pipeline_stage === 'ready_to_apply').length,
    profileComplete: students.filter(s => (s.profile_completion || 0) >= 80).length
  }), [students]);

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
        className="rounded-3xl border border-white/10 bg-white/5 p-6"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
              My Students
            </div>
            <h1 className="mt-4 text-3xl font-bold text-white">Assigned Students</h1>
            <p className="mt-2 max-w-2xl text-emerald-50/70">
              View your assigned students, track their activity status, and manage their progress.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[420px]">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-emerald-50/60">Total</p>
              <p className="mt-2 text-2xl font-bold text-white">{stats.totalStudents}</p>
            </div>
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-emerald-400 flex items-center gap-1.5">
                <Circle className="h-2 w-2 fill-emerald-400" />
                Online
              </p>
              <p className="mt-2 text-2xl font-bold text-emerald-400">{stats.onlineNow}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-emerald-50/60">Ready</p>
              <p className="mt-2 text-2xl font-bold text-white">{stats.readyToApply}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-emerald-50/60">Complete</p>
              <p className="mt-2 text-2xl font-bold text-white">{stats.profileComplete}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-50/40" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white placeholder:text-emerald-50/40 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        
        <div className="flex gap-2">
          {(['all', 'online', 'offline'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                filterStatus === status
                  ? 'bg-emerald-500 text-white'
                  : 'border border-white/10 bg-white/5 text-emerald-50/70 hover:bg-white/10'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 xl:grid-cols-[1fr_400px]">
        {/* Student List */}
        <div className="space-y-3">
          {filteredStudents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-12 text-center">
              <Users className="mx-auto h-12 w-12 text-emerald-50/30" />
              <p className="mt-4 text-lg font-medium text-emerald-50/60">No students found</p>
              <p className="mt-1 text-sm text-emerald-50/40">
                {searchQuery ? 'Try adjusting your search' : 'No students assigned yet'}
              </p>
            </div>
          ) : (
            filteredStudents.map((student) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedStudent(student)}
                className={`cursor-pointer rounded-2xl border p-4 transition-all hover:border-emerald-500/50 ${
                  selectedStudent?.id === student.id
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-white/10 bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {/* Avatar with online indicator */}
                    <div className="relative">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-base font-semibold text-white">
                        {student.profile_picture_url ? (
                          <img src={student.profile_picture_url} alt={student.name || 'Student'} className="h-full w-full rounded-full object-cover" />
                        ) : (
                          student.name?.charAt(0) || 'S'
                        )}
                      </div>
                      <span
                        className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-black/30 ${
                          isUserOnline(student) ? 'bg-emerald-500' : 'bg-slate-500'
                        }`}
                        title={isUserOnline(student) ? 'Online' : `Last seen: ${formatLastSeen(student.last_seen_at)}`}
                      />
                    </div>
                    
                    <div>
                      <p className="font-semibold text-white">{student.name || 'Student'}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-sm text-emerald-50/60">{student.email}</p>
                        <span className={`text-xs ${isUserOnline(student) ? 'text-emerald-400' : 'text-emerald-50/40'}`}>
                          {isUserOnline(student) ? 'Online' : formatLastSeen(student.last_seen_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="hidden sm:inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-emerald-100">
                      {stageLabels[student.pipeline_stage] || 'New Lead'}
                    </span>
                    <span className="text-sm text-emerald-50/60">
                      {student.profile_completion || 0}%
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Selected Student Detail */}
        {selectedStudent ? (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl border border-white/10 bg-white/5 p-6"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-lg font-bold text-white">
                    {selectedStudent.profile_picture_url ? (
                      <img src={selectedStudent.profile_picture_url} alt={selectedStudent.name || 'Student'} className="h-full w-full rounded-full object-cover" />
                    ) : (
                      selectedStudent.name?.charAt(0) || 'S'
                    )}
                  </div>
                  <span
                    className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-black/30 ${
                      isUserOnline(selectedStudent) ? 'bg-emerald-500' : 'bg-slate-500'
                    }`}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xl font-bold text-white">{selectedStudent.name}</p>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        isUserOnline(selectedStudent)
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                      }`}
                    >
                      <Circle className={`h-2 w-2 ${isUserOnline(selectedStudent) ? 'fill-emerald-400' : 'fill-slate-400'}`} />
                      {isUserOnline(selectedStudent) ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  <p className="text-sm text-emerald-50/60">{selectedStudent.email}</p>
                  {!isUserOnline(selectedStudent) && selectedStudent.last_seen_at && (
                    <p className="text-xs text-emerald-50/40 mt-0.5">
                      Last active: {formatLastSeen(selectedStudent.last_seen_at)}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="rounded-lg p-1.5 text-emerald-50/40 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Student Details */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Circle, label: 'Status', value: isUserOnline(selectedStudent) ? 'Online now' : 'Offline' },
                  { icon: Clock, label: 'Last Active', value: selectedStudent.last_seen_at ? formatLastSeen(selectedStudent.last_seen_at) : 'Never' },
                  { icon: CheckCircle, label: 'Profile', value: `${selectedStudent.profile_completion || 0}% complete` },
                  { icon: GraduationCap, label: 'Stage', value: stageLabels[selectedStudent.pipeline_stage] || 'New Lead' },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-white/10 bg-black/20 p-3">
                    <div className="flex items-center gap-2 text-emerald-50/40">
                      <item.icon className="h-4 w-4" />
                      <p className="text-xs uppercase tracking-wider">{item.label}</p>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-white">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Contact Info */}
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <h3 className="text-sm font-semibold text-white mb-3">Contact Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-emerald-50/40" />
                    <span className="text-emerald-50/70">{selectedStudent.email}</span>
                  </div>
                  {selectedStudent.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-emerald-50/40" />
                      <span className="text-emerald-50/70">{selectedStudent.phone}</span>
                    </div>
                  )}
                  {selectedStudent.country && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-emerald-50/40" />
                      <span className="text-emerald-50/70">{selectedStudent.country}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <h3 className="text-sm font-semibold text-white mb-3">Profile Scores</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-emerald-50/40 uppercase">Lead Score</p>
                    <p className="text-lg font-bold text-white">{selectedStudent.lead_score || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-emerald-50/40 uppercase">Strength</p>
                    <p className="text-lg font-bold text-white">{selectedStudent.profile_strength_score || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-emerald-50/40 uppercase">Docs</p>
                    <p className="text-lg font-bold text-white">{selectedStudent.document_readiness?.score || 0}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-emerald-50/40 uppercase">Visa Risk</p>
                    <p className="text-lg font-bold text-white">{selectedStudent.visa_risk_level || 'Unknown'}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-12 text-center">
            <Eye className="mx-auto h-12 w-12 text-emerald-50/30" />
            <p className="mt-4 text-lg font-medium text-emerald-50/60">Select a student</p>
            <p className="mt-1 text-sm text-emerald-50/40">
              Click on a student to view their details and activity status
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CounselorStudents;
