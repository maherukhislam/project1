import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, FileText, Award, Bell, ChevronRight, User, Target, BookOpen } from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';

const DashboardHome: React.FC = () => {
  const { profile } = useAuth();
  const [applicationCount, setApplicationCount] = useState(0);
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appCountData, recentAppsData, matchData] = await Promise.all([
          api.get('/api/applications', { count_only: '1' }),
          api.get('/api/applications', { limit: '3', minimal: '1' }),
          profile ? api.post('/api/university-match', {
            gpa: profile.gpa,
            english_score: profile.english_score,
            budget_max: profile.budget_max,
            preferred_country: profile.preferred_country,
            preferred_subject: profile.preferred_subject,
            study_level: profile.study_level,
            limit: 4
          }) : Promise.resolve([])
        ]);
        setApplicationCount(appCountData.count || 0);
        setRecentApplications(recentAppsData);
        setRecommendations(matchData);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };
    if (profile) fetchData();
  }, [profile]);

  const stats = [
    { icon: FileText, label: 'Applications', value: applicationCount, color: 'from-blue-500 to-indigo-600' },
    { icon: GraduationCap, label: 'Matches', value: recommendations.length, color: 'from-green-500 to-emerald-600' },
    { icon: Award, label: 'Scholarships', value: 0, color: 'from-amber-500 to-orange-600' },
    { icon: Bell, label: 'Notifications', value: 2, color: 'from-purple-500 to-pink-600' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <GlassCard className="p-8" hover={false}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Welcome back, {profile?.name?.split(' ')[0] || 'Student'}! 👋
              </h1>
              <p className="text-slate-600">
                Track your applications and discover new opportunities.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-slate-500">Profile Completion</p>
                <p className="text-2xl font-bold text-sky-600">{profile?.profile_completion || 0}%</p>
              </div>
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          {(profile?.profile_completion || 0) < 100 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Complete your profile to get better recommendations</span>
                <Link to="/dashboard/profile" className="text-sm text-sky-600 hover:text-sky-700 font-medium">
                  Complete Profile &gt;
                </Link>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 to-blue-600 rounded-full transition-all"
                  style={{ width: `${profile?.profile_completion || 0}%` }}
                />
              </div>
            </div>
          )}
        </GlassCard>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <GlassCard className="p-6">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-slate-500 text-sm">{stat.label}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Applications */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard className="p-6" hover={false}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">Recent Applications</h2>
              <Link to="/dashboard/applications" className="text-sky-600 hover:text-sky-700 text-sm font-medium">
                View All
              </Link>
            </div>

            {recentApplications.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 mb-4">No applications yet</p>
                <Link
                  to="/dashboard/universities"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors text-sm font-medium"
                >
                  Browse Universities
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentApplications.map((app) => (
                  <div key={app.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/50 border border-slate-100">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                      <GraduationCap className="w-6 h-6 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-slate-900 truncate">
                        {app.programs?.name || 'Program'}
                      </h3>
                      <p className="text-sm text-slate-500 truncate">
                        {app.programs?.universities?.name || 'University'}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      app.status === 'accepted' ? 'bg-green-100 text-green-700' :
                      app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      app.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* Recommended Universities */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard className="p-6" hover={false}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">Recommended For You</h2>
              <Link to="/dashboard/match" className="text-sky-600 hover:text-sky-700 text-sm font-medium">
                View All
              </Link>
            </div>

            {recommendations.length === 0 ? (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 mb-4">Complete your profile to get recommendations</p>
                <Link
                  to="/dashboard/profile"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors text-sm font-medium"
                >
                  Complete Profile
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recommendations.map((prog) => (
                  <div key={prog.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/50 border border-slate-100">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-100 to-blue-200 flex items-center justify-center">
                      <GraduationCap className="w-6 h-6 text-sky-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-slate-900 truncate">{prog.name}</h3>
                      <p className="text-sm text-slate-500 truncate">
                        {prog.universities?.name} • {prog.universities?.country}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sky-600 font-semibold">{prog.match_score}%</span>
                      <p className="text-xs text-slate-500">match</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: Target, title: 'Find Universities', desc: 'Get matched with programs', link: '/dashboard/match', color: 'from-sky-500 to-blue-600' },
            { icon: FileText, title: 'Upload Documents', desc: 'Manage your documents', link: '/dashboard/documents', color: 'from-green-500 to-emerald-600' },
            { icon: BookOpen, title: 'View Applications', desc: 'Track application status', link: '/dashboard/applications', color: 'from-purple-500 to-pink-600' }
          ].map((action, i) => (
            <Link key={i} to={action.link}>
              <GlassCard className="p-6 h-full group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">{action.title}</h3>
                <p className="text-sm text-slate-600 mb-3">{action.desc}</p>
                <span className="text-sky-600 text-sm font-medium inline-flex items-center gap-1">
                  Open
                  <ChevronRight className="w-4 h-4" />
                </span>
              </GlassCard>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardHome;
