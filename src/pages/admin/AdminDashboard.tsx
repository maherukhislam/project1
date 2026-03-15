import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, GraduationCap, Award, FileText, BookOpen, ChevronRight, Clock, CheckCircle, XCircle, AlertCircle, Eye } from 'lucide-react';
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
          api.get('/api/applications'),
          api.get('/api/admin/students')
        ]);
        setStats(statsData);
        setRecentApps(appsData.slice(0, 5));
        setRecentStudents(studentsData.slice(0, 5));
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'under_review': return <AlertCircle className="w-4 h-4 text-amber-400" />;
      case 'visa_processing': return <Eye className="w-4 h-4 text-purple-400" />;
      default: return <Clock className="w-4 h-4 text-blue-400" />;
    }
  };

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

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-slate-400">Overview of your study abroad platform</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link to={stat.link}>
              <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700 hover:bg-slate-700/50 transition-all group">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-white mb-0.5">{stat.value}</p>
                <div className="flex items-center justify-between">
                  <p className="text-slate-400 text-sm">{stat.label}</p>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 transition-colors" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Applications by Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700"
      >
        <h2 className="text-xl font-semibold text-white mb-4">Applications by Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {['draft', 'submitted', 'under_review', 'accepted', 'rejected', 'visa_processing'].map((status) => (
            <div key={status} className="p-4 rounded-xl bg-slate-700/30 text-center">
              <div className="flex justify-center mb-2">
                {getStatusIcon(status)}
              </div>
              <p className="text-2xl font-bold text-white">
                {stats?.applicationsByStatus?.[status] || 0}
              </p>
              <p className="text-xs text-slate-400 capitalize">{status.replace('_', ' ')}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Applications */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Recent Applications</h2>
            <Link to="/admin/applications" className="text-sky-400 hover:text-sky-300 text-sm font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {recentApps.length > 0 ? recentApps.map((app) => (
              <div key={app.id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-700/30 hover:bg-slate-700/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                  {app.profiles?.name?.charAt(0) || 'S'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{app.profiles?.name || 'Student'}</p>
                  <p className="text-slate-400 text-sm truncate">{app.programs?.name || 'Program'}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                    {app.status?.replace('_', ' ')}
                  </span>
                  <p className="text-slate-500 text-xs mt-1">{formatDate(app.created_at)}</p>
                </div>
              </div>
            )) : (
              <p className="text-slate-500 text-center py-4">No applications yet</p>
            )}
          </div>
        </motion.div>

        {/* Recent Students */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Recent Registrations</h2>
            <Link to="/admin/students" className="text-sky-400 hover:text-sky-300 text-sm font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {recentStudents.length > 0 ? recentStudents.map((student) => (
              <div key={student.id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-700/30 hover:bg-slate-700/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white font-semibold text-sm">
                  {student.name?.charAt(0) || 'S'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{student.name || 'Unknown'}</p>
                  <p className="text-slate-400 text-sm truncate">{student.email}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <div className="w-12 h-1.5 bg-slate-600 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-sky-500 rounded-full"
                        style={{ width: `${student.profile_completion || 0}%` }}
                      />
                    </div>
                    <span className="text-slate-400 text-xs">{student.profile_completion || 0}%</span>
                  </div>
                  <p className="text-slate-500 text-xs mt-1">{formatDate(student.created_at)}</p>
                </div>
              </div>
            )) : (
              <p className="text-slate-500 text-center py-4">No students yet</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { label: 'Add University', link: '/admin/universities', icon: GraduationCap, color: 'from-green-500 to-emerald-600' },
            { label: 'Add Program', link: '/admin/programs', icon: BookOpen, color: 'from-cyan-500 to-teal-600' },
            { label: 'Add Scholarship', link: '/admin/scholarships', icon: Award, color: 'from-amber-500 to-orange-600' },
            { label: 'View Students', link: '/admin/students', icon: Users, color: 'from-blue-500 to-indigo-600' }
          ].map((action, i) => (
            <Link key={i} to={action.link}>
              <div className="p-4 rounded-xl bg-slate-700/30 border border-slate-700 hover:bg-slate-700/50 hover:border-sky-500/50 transition-all flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-medium">{action.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
