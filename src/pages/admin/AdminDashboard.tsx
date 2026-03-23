import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, GraduationCap, Award, FileText, BookOpen, ChevronRight, AlertCircle, ShieldPlus, Circle } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { api } from '../../lib/api';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [recentApps, setRecentApps] = useState<any[]>([]);
  const [recentStudents, setRecentStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, appsData, studentsData] = await Promise.all([
          api.get('/api/admin/stats'),
          api.get('/api/applications', { limit: '5', minimal: '1' }),
          api.get('/api/admin/students', { limit: '5', minimal: '1' })
        ]);
        setStats(statsData);
        setRecentApps(appsData);
        setRecentStudents(studentsData);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const statCards = [
    { icon: Users, label: 'Total Students', value: stats?.totalStudents || 0, color: 'from-blue-500 to-indigo-600', link: '/admin/students' },
    { icon: GraduationCap, label: 'Universities', value: stats?.totalUniversities || 0, color: 'from-green-500 to-emerald-600', link: '/admin/universities' },
    { icon: BookOpen, label: 'Programs', value: stats?.totalPrograms || 0, color: 'from-cyan-500 to-teal-600', link: '/admin/programs' },
    { icon: FileText, label: 'Applications', value: stats?.totalApplications || 0, color: 'from-purple-500 to-pink-600', link: '/admin/applications' },
    { icon: Award, label: 'Scholarships', value: stats?.totalScholarships || 0, color: 'from-amber-500 to-orange-600', link: '/admin/scholarships' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-500/20 text-green-400';
      case 'rejected': return 'bg-red-500/20 text-red-400';
      case 'under_review': return 'bg-amber-500/20 text-amber-400';
      case 'visa_processing': return 'bg-purple-500/20 text-purple-400';
      case 'submitted': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const statusCounts = stats?.applicationsByStatus || {};
  const totalStudents = stats?.totalStudents || 0;
  const totalApplications = stats?.totalApplications || 0;
  const pendingReviews = (statusCounts.submitted || 0) + (statusCounts.under_review || 0);
  const decisioned = (statusCounts.accepted || 0) + (statusCounts.rejected || 0);
  const visaProcessing = statusCounts.visa_processing || 0;
  const attentionStudents = recentStudents.filter((student) => (student.profile_completion || 0) < 60).slice(0, 4);

  const workflow = [
    {
      label: 'Intake',
      count: statusCounts.draft || 0,
      hint: 'New leads and draft applications'
    },
    {
      label: 'Review',
      count: pendingReviews,
      hint: 'Counselor queue'
    },
    {
      label: 'Decision',
      count: decisioned,
      hint: 'Accepted or rejected cases'
    },
    {
      label: 'Visa',
      count: visaProcessing,
      hint: 'Final processing stage'
    }
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="relative overflow-hidden rounded-3xl border border-slate-700 bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.16),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.12),transparent_35%)]" />
          <div className="relative grid gap-8 lg:grid-cols-[1.5fr_0.9fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">
                Live operations
              </div>
              <h1 className="mt-4 text-4xl font-bold text-white">Admin Dashboard</h1>
              <p className="mt-3 max-w-2xl text-slate-300 leading-7">
                Control the admissions pipeline, monitor student progress, and keep the platform moving with a single operations view.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
                <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Students</p>
                  <p className="mt-2 text-2xl font-bold text-white">{totalStudents}</p>
                </div>
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-emerald-400 flex items-center gap-1.5">
                    <Circle className="h-2 w-2 fill-emerald-400" />
                    Online now
                  </p>
                  <p className="mt-2 text-2xl font-bold text-emerald-400">{stats?.onlineStudentsCount || 0}</p>
                </div>
                <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Applications</p>
                  <p className="mt-2 text-2xl font-bold text-white">{totalApplications}</p>
                </div>
                <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Reviews</p>
                  <p className="mt-2 text-2xl font-bold text-white">{pendingReviews}</p>
                </div>
                <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Visa</p>
                  <p className="mt-2 text-2xl font-bold text-white">{visaProcessing}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              {workflow.map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-white">{item.label}</p>
                      <p className="mt-1 text-xs text-slate-400">{item.hint}</p>
                    </div>
                    <span className="text-2xl font-bold text-white">{item.count}</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-700">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500"
                      style={{ width: `${Math.min(100, Math.max(8, item.count * 8))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {statCards.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Link to={stat.link}>
              <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-5 transition-all hover:border-sky-500/40 hover:bg-slate-700/50">
                <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color}`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <div className="mt-1 flex items-center justify-between gap-3">
                  <p className="text-sm text-slate-400">{stat.label}</p>
                  <ChevronRight className="h-4 w-4 text-slate-500 transition-colors group-hover:text-sky-400" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.35fr_0.85fr]">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.18 }}
          className="rounded-3xl border border-slate-700 bg-slate-800/50 p-6"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Pipeline Snapshot</h2>
              <p className="mt-1 text-sm text-slate-400">Admissions flow across the active queue.</p>
            </div>
            <Link to="/admin/applications" className="text-sm font-medium text-sky-400 hover:text-sky-300">
              Open board
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {workflow.map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-700 bg-slate-900/50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-white">{item.label}</p>
                    <p className="text-sm text-slate-400">{item.hint}</p>
                  </div>
                  <span className="rounded-full bg-slate-700 px-3 py-1 text-sm font-semibold text-white">
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {recentApps.length > 0 ? recentApps.slice(0, 4).map((app) => (
              <div key={app.id} className="rounded-2xl border border-slate-700 bg-slate-900/50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-white">{app.profiles?.name || 'Student'}</p>
                    <p className="mt-1 truncate text-sm text-slate-400">{app.programs?.name || 'Program'}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(app.status)}`}>
                    {app.status?.replace('_', ' ')}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>{app.programs?.universities?.name || 'University'}</span>
                  <span>{formatDate(app.created_at)}</span>
                </div>
              </div>
            )) : (
              <div className="rounded-2xl border border-slate-700 bg-slate-900/50 p-6 text-sm text-slate-400">
                No recent applications yet.
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.24 }}
          className="space-y-8"
        >
          <div className="rounded-3xl border border-slate-700 bg-slate-800/50 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">Needs Attention</h2>
                <p className="mt-1 text-sm text-slate-400">Cases that should move this week.</p>
              </div>
              <AlertCircle className="h-5 w-5 text-amber-400" />
            </div>

            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-slate-700 bg-slate-900/50 px-4 py-3">
                <div>
                  <p className="font-medium text-white">Pending review</p>
                  <p className="text-sm text-slate-400">Submitted and under review applications</p>
                </div>
                <span className="text-lg font-bold text-amber-300">{pendingReviews}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-slate-700 bg-slate-900/50 px-4 py-3">
                <div>
                  <p className="font-medium text-white">Incomplete profiles</p>
                  <p className="text-sm text-slate-400">Students below 60 percent completion</p>
                </div>
                <span className="text-lg font-bold text-sky-300">{attentionStudents.length}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-slate-700 bg-slate-900/50 px-4 py-3">
                <div>
                  <p className="font-medium text-white">Decisioned cases</p>
                  <p className="text-sm text-slate-400">Accepted or rejected outcomes</p>
                </div>
                <span className="text-lg font-bold text-emerald-300">{decisioned}</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-700 bg-slate-800/50 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">Student Health</h2>
                <p className="mt-1 text-sm text-slate-400">Latest registrations that need follow-up.</p>
              </div>
              <Users className="h-5 w-5 text-sky-400" />
            </div>
            <div className="mt-5 space-y-3">
              {attentionStudents.length > 0 ? attentionStudents.map((student) => (
                <Link key={student.id} to="/admin/students" className="block rounded-2xl border border-slate-700 bg-slate-900/50 p-4 hover:border-sky-500/40">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-white">{student.name || 'Student'}</p>
                      <p className="text-sm text-slate-400">{student.email}</p>
                    </div>
                    <span className="text-sm font-semibold text-sky-300">{student.profile_completion || 0}%</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-700">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-500"
                      style={{ width: `${student.profile_completion || 0}%` }}
                    />
                  </div>
                </Link>
              )) : (
                <p className="rounded-2xl border border-slate-700 bg-slate-900/50 p-4 text-sm text-slate-400">
                  No profile gaps in the latest registrations.
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.34 }}
      >
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Quick Actions</h2>
            <p className="mt-1 text-sm text-slate-400">Open the core management modules.</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[
            { label: 'Manage Students', desc: 'Lead view, profile progress, and pipeline actions.', link: '/admin/students', icon: Users, color: 'from-blue-500 to-indigo-600' },
            { label: 'Review Applications', desc: 'Move cases through review, decision, and visa processing.', link: '/admin/applications', icon: FileText, color: 'from-purple-500 to-pink-600' },
            { label: 'Universities', desc: 'Maintain the institution database and logos.', link: '/admin/universities', icon: GraduationCap, color: 'from-green-500 to-emerald-600' },
            { label: 'Programs', desc: 'Edit course requirements and intake settings.', link: '/admin/programs', icon: BookOpen, color: 'from-cyan-500 to-teal-600' },
            { label: 'Documents', desc: 'Approve, reject, or request re-uploads.', link: '/admin/documents', icon: Award, color: 'from-amber-500 to-orange-600' },
            { label: 'Admin & Roles', desc: 'Control access for admins and counselors.', link: '/admin/admins', icon: ShieldPlus, color: 'from-slate-500 to-slate-700' }
          ].map((action, i) => (
            <Link key={i} to={action.link}>
              <div className="group h-full rounded-2xl border border-slate-700 bg-slate-800/50 p-5 transition-all hover:-translate-y-0.5 hover:border-sky-500/40 hover:bg-slate-700/50">
                <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${action.color}`}>
                  <action.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-white">{action.label}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{action.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-sky-400">
                  Open module
                  <ChevronRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
