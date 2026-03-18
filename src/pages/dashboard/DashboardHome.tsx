import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  FileText,
  Upload,
  ChevronRight,
  User,
  Target,
  BookOpen,
  CheckCircle,
  Clock3,
  Sparkles,
  MapPin
} from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';

const DashboardHome: React.FC = () => {
  const { profile } = useAuth();
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recentAppsData, matchData, docsData] = await Promise.all([
          api.get('/api/applications', { limit: '4', minimal: '1' }),
          profile ? api.post('/api/university-match', {
            gpa: profile.gpa,
            english_score: profile.english_score,
            budget_max: profile.budget_max,
            preferred_country: profile.preferred_country,
            preferred_subject: profile.preferred_subject,
            study_level: profile.study_level,
            limit: 4
          }) : Promise.resolve([]),
          api.get('/api/documents', { minimal: '1' })
        ]);
        setRecentApplications(recentAppsData);
        setRecommendations(matchData);
        setDocuments(docsData);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (profile) fetchData();
  }, [profile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const profileCompletion = profile?.profile_completion || 0;
  const documentTypes = ['passport', 'academic_certificate', 'transcript', 'english_test', 'cv'];
  const uploadedRequiredCount = documentTypes.filter((type) => documents.some((doc) => doc.document_type === type)).length;
  const applicationCount = recentApplications.length;
  const submittedCount = recentApplications.filter((app) => ['submitted', 'under_review', 'accepted', 'visa_processing'].includes(app.status)).length;
  const nextStep = profileCompletion < 80
    ? {
        title: 'Complete your profile',
        desc: 'Add academics, budget, and intake preferences to unlock accurate matching.',
        link: '/dashboard/profile',
        cta: 'Update Profile'
      }
    : uploadedRequiredCount < documentTypes.length
      ? {
          title: 'Upload missing documents',
          desc: 'Keep your application pack ready before you submit to universities.',
          link: '/dashboard/documents',
          cta: 'Open Documents'
        }
      : applicationCount === 0
        ? {
            title: 'Create your first application',
            desc: 'Choose a recommended program and start a draft application.',
            link: '/dashboard/match',
            cta: 'Find Matches'
          }
        : {
            title: 'Track your active applications',
            desc: 'Review statuses, deadlines, and document readiness from one place.',
            link: '/dashboard/applications',
            cta: 'View Applications'
          };

  const stats = [
    { icon: User, label: 'Profile', value: `${profileCompletion}%`, note: 'Completion', color: 'from-sky-500 to-blue-600' },
    { icon: FileText, label: 'Applications', value: `${applicationCount}`, note: `${submittedCount} active`, color: 'from-indigo-500 to-violet-600' },
    { icon: Upload, label: 'Documents', value: `${uploadedRequiredCount}/${documentTypes.length}`, note: 'Required ready', color: 'from-emerald-500 to-green-600' },
    { icon: GraduationCap, label: 'Matches', value: `${recommendations.length}`, note: 'Recommended now', color: 'from-amber-500 to-orange-600' }
  ];

  const statusTone = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'submitted':
        return 'bg-sky-100 text-sky-700';
      case 'under_review':
        return 'bg-amber-100 text-amber-700';
      case 'visa_processing':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="relative overflow-hidden rounded-[2rem] border border-sky-100 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.18),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.14),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.97),rgba(240,249,255,0.95))] p-8 shadow-[0_30px_80px_rgba(14,116,144,0.12)]">
          <div className="grid gap-8 lg:grid-cols-[1.5fr_0.9fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                Your Study Plan
              </div>
              <h1 className="mt-4 text-4xl font-bold text-slate-900">
                Welcome back, {profile?.name?.split(' ')[0] || 'Student'}
              </h1>
              <p className="mt-3 max-w-2xl text-slate-600 leading-7">
                Stay on top of profile progress, recommended programs, documents, and application activity from one guided dashboard.
              </p>

              <div className="mt-6 rounded-3xl border border-slate-200 bg-white/75 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Next best action</p>
                    <h2 className="mt-1 text-xl font-semibold text-slate-900">{nextStep.title}</h2>
                    <p className="mt-1 text-sm text-slate-600">{nextStep.desc}</p>
                  </div>
                  <Link
                    to={nextStep.link}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-sky-500/25 transition-all hover:from-sky-600 hover:to-blue-700"
                  >
                    {nextStep.cta}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-slate-200 bg-white/80 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Profile strength</p>
                  <p className="mt-1 text-3xl font-bold text-slate-900">{profileCompletion}%</p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white">
                  <Sparkles className="h-7 w-7" />
                </div>
              </div>

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-600 transition-all"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>

              <div className="mt-6 space-y-3">
                {[
                  { label: 'Academics', ready: Boolean(profile?.gpa && profile?.study_level) },
                  { label: 'Preferences', ready: Boolean(profile?.preferred_country && profile?.preferred_subject) },
                  { label: 'Budget & Intake', ready: Boolean(profile?.budget_max && profile?.intake) }
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                    <span className="text-sm font-medium text-slate-700">{item.label}</span>
                    {item.ready ? (
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <Clock3 className="h-5 w-5 text-amber-500" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <GlassCard className="p-6 h-full">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.color} text-white mb-4`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
              <p className="mt-1 text-sm font-medium text-slate-700">{stat.label}</p>
              <p className="mt-1 text-sm text-slate-500">{stat.note}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 }}>
          <GlassCard className="p-6" hover={false}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Recent Applications</h2>
                <p className="mt-1 text-sm text-slate-500">Your latest drafts and active submissions.</p>
              </div>
              <Link to="/dashboard/applications" className="text-sky-600 hover:text-sky-700 text-sm font-medium">
                View All
              </Link>
            </div>

            {recentApplications.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 py-12 text-center">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 mb-4">No applications yet</p>
                <Link
                  to="/dashboard/match"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors text-sm font-medium"
                >
                  Find Matches
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentApplications.map((app) => (
                  <div key={app.id} className="rounded-2xl border border-slate-200 bg-white/70 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="font-medium text-slate-900 truncate">{app.programs?.name || 'Program'}</h3>
                        <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate">{app.programs?.universities?.name || 'University'}</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusTone(app.status)}`}>
                        {app.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="mt-3 text-sm text-slate-500">
                      {app.intake ? `Intake: ${app.intake}` : 'Intake not selected yet'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.18 }}>
          <GlassCard className="p-6" hover={false}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Recommended Matches</h2>
                <p className="mt-1 text-sm text-slate-500">Programs that fit your profile and budget.</p>
              </div>
              <Link to="/dashboard/match" className="text-sky-600 hover:text-sky-700 text-sm font-medium">
                View All
              </Link>
            </div>

            {recommendations.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 py-12 text-center">
                <Target className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 mb-4">Complete your profile to unlock recommendations</p>
                <Link
                  to="/dashboard/profile"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors text-sm font-medium"
                >
                  Complete Profile
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recommendations.map((prog) => (
                  <div key={prog.id} className="rounded-2xl border border-slate-200 bg-white/70 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="font-medium text-slate-900 truncate">{prog.name}</h3>
                        <p className="mt-1 text-sm text-slate-500 truncate">
                          {prog.universities?.name} • {prog.universities?.country}
                        </p>
                      </div>
                      <span className="rounded-full bg-sky-50 px-3 py-1 text-sm font-semibold text-sky-700">
                        {prog.match_score}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: Target, title: 'Find Universities', desc: 'Explore recommended programs and start a draft application.', link: '/dashboard/match', color: 'from-sky-500 to-blue-600' },
            { icon: Upload, title: 'Manage Documents', desc: 'Upload the required files before you submit applications.', link: '/dashboard/documents', color: 'from-emerald-500 to-green-600' },
            { icon: BookOpen, title: 'Update Profile', desc: 'Keep your academics, budget, and preferences current.', link: '/dashboard/profile', color: 'from-purple-500 to-fuchsia-600' }
          ].map((action) => (
            <Link key={action.title} to={action.link}>
              <GlassCard className="p-6 h-full group">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
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
