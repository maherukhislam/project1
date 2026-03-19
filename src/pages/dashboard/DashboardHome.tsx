import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  BookOpen,
  CalendarRange,
  CheckCircle,
  ChevronRight,
  Clock3,
  Compass,
  FileText,
  GraduationCap,
  MapPin,
  ShieldCheck,
  Sparkles,
  Target,
  Upload,
  User
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
  const [profileState, setProfileState] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recentAppsData, matchData, docsData] = await Promise.all([
          api.get('/api/applications', { limit: '4', minimal: '1' }),
          profile
            ? api.post('/api/university-match', {
                gpa: profile.gpa,
                english_score: profile.english_score,
                budget_max: profile.budget_max,
                preferred_country: profile.preferred_country,
                preferred_subject: profile.preferred_subject,
                study_level: profile.study_level,
                limit: 4
              })
            : Promise.resolve([]),
          api.get('/api/documents', { minimal: '1' })
        ]);
        setRecentApplications(recentAppsData);
        setRecommendations(matchData.matches || []);
        setProfileState(matchData.profile || null);
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
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const profileCompletion = profileState?.profile_completion || profile?.profile_completion || 0;
  const documentTypes = profileState?.document_requirements || ['passport', 'academic_certificate', 'transcript', 'english_test', 'cv'];
  const uploadedRequiredCount = documentTypes.filter((type: string) => documents.some((doc) => doc.document_type === type)).length;
  const applicationCount = recentApplications.length;
  const submittedCount = recentApplications.filter((app) =>
    ['submitted', 'under_review', 'accepted', 'visa_processing'].includes(app.status)
  ).length;

  const nextStep =
    profileState?.profile_status === 'incomplete'
      ? {
          title: 'Complete your profile',
          desc: profileState?.blocking_reasons?.[0] || 'Add all required details to unlock matching and applications.',
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
    { icon: User, label: 'Profile', value: `${profileCompletion}%`, note: 'Completion', color: 'from-sky-500 to-cyan-500' },
    { icon: FileText, label: 'Applications', value: `${applicationCount}`, note: `${submittedCount} active`, color: 'from-slate-900 to-slate-700' },
    { icon: Upload, label: 'Documents', value: `${uploadedRequiredCount}/${documentTypes.length}`, note: 'Required ready', color: 'from-emerald-500 to-teal-600' },
    { icon: GraduationCap, label: 'Matches', value: `${recommendations.length}`, note: 'Recommended now', color: 'from-amber-500 to-orange-500' }
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
        <div className="relative overflow-hidden rounded-[2.2rem] border border-white/60 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.2),transparent_26%),radial-gradient(circle_at_top_right,rgba(251,146,60,0.18),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(13,148,136,0.16),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.9),rgba(246,241,232,0.92))] p-8 shadow-[0_32px_90px_rgba(15,23,42,0.1)]">
          <div className="pointer-events-none absolute right-8 top-8 hidden h-32 w-32 rounded-full border border-white/50 bg-white/20 blur-3xl lg:block" />
          <div className="grid gap-8 lg:grid-cols-[1.5fr_0.95fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
                <Compass className="h-3.5 w-3.5 text-teal-600" />
                Your Study Plan
              </div>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
                Welcome back, {profile?.name?.split(' ')[0] || 'Student'}
              </h1>
              <p className="mt-3 max-w-2xl text-[15px] leading-7 text-slate-600">
                A cleaner command center for profile readiness, document prep, and shortlisting universities that fit your goals.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[1.8rem] border border-white/70 bg-white/78 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Next best action</p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{nextStep.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{nextStep.desc}</p>
                  </div>
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <Link
                      to={nextStep.link}
                      className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-[0_16px_28px_rgba(15,23,42,0.2)] transition-all hover:bg-slate-800"
                    >
                      {nextStep.cta}
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                    <span className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-[#f8f4ec] px-4 py-3 text-sm text-slate-600">
                      <CalendarRange className="h-4 w-4 text-amber-600" />
                      Review this week
                    </span>
                  </div>
                </div>

                <div className="rounded-[1.8rem] border border-white/70 bg-slate-900 p-5 text-white shadow-[0_24px_45px_rgba(15,23,42,0.16)]">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-white/60">Momentum</p>
                      <p className="mt-1 text-3xl font-semibold tracking-tight">
                        {submittedCount > 0 ? `${submittedCount} active` : 'Ready to start'}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white/10 p-3">
                      <ShieldCheck className="h-6 w-6 text-emerald-300" />
                    </div>
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-white/45">Documents</p>
                      <p className="mt-2 text-2xl font-semibold">{uploadedRequiredCount}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-white/45">Matches</p>
                      <p className="mt-2 text-2xl font-semibold">{recommendations.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[1.9rem] border border-white/70 bg-white/72 p-6 shadow-[0_18px_42px_rgba(15,23,42,0.06)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Profile strength</p>
                  <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{profileCompletion}%</p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-teal-500 text-white">
                  <Sparkles className="h-7 w-7" />
                </div>
              </div>

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-200/80">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-500 transition-all"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>

              <div className="mt-6 space-y-3">
                {[
                  { label: 'Academics', ready: Boolean(profile?.gpa && profile?.study_level && profile?.academic_system) },
                  { label: 'Preferences', ready: Boolean(profile?.preferred_country && profile?.preferred_subject && profile?.medium_of_instruction) },
                  { label: 'Budget & Intake', ready: Boolean(profile?.budget_max && (profile?.preferred_intake_name || profile?.intake) && (profile?.preferred_intake_year || profile?.intake) && profile?.last_education_year) }
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-[#faf7f1] px-4 py-3"
                  >
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
            <GlassCard className="h-full border-white/70 bg-white/68 p-6">
              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.color} text-white`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <p className="text-3xl font-bold tracking-tight text-slate-900">{stat.value}</p>
              <p className="mt-1 text-sm font-medium text-slate-700">{stat.label}</p>
              <p className="mt-1 text-sm text-slate-500">{stat.note}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 }}>
          <GlassCard className="border-white/70 bg-white/68 p-6" hover={false}>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Recent Applications</h2>
                <p className="mt-1 text-sm text-slate-500">Your latest drafts and active submissions.</p>
              </div>
              <Link to="/dashboard/applications" className="text-sm font-medium text-sky-700 hover:text-sky-800">
                View All
              </Link>
            </div>

            {recentApplications.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-[#faf7f1] py-12 text-center">
                <FileText className="mx-auto mb-3 h-12 w-12 text-slate-300" />
                <p className="mb-4 text-slate-600">No applications yet</p>
                <Link
                  to="/dashboard/match"
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
                >
                  Find Matches
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentApplications.map((app) => (
                  <div key={app.id} className="rounded-2xl border border-slate-200/80 bg-[#fcfbf8] p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="truncate font-medium text-slate-900">{app.programs?.name || 'Program'}</h3>
                        <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                          <MapPin className="h-4 w-4" />
                          <span className="truncate">{app.programs?.universities?.name || 'University'}</span>
                        </div>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusTone(app.status)}`}>
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
          <GlassCard className="border-white/70 bg-white/68 p-6" hover={false}>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Recommended Matches</h2>
                <p className="mt-1 text-sm text-slate-500">Programs that fit your profile and budget.</p>
              </div>
              <Link to="/dashboard/match" className="text-sm font-medium text-sky-700 hover:text-sky-800">
                View All
              </Link>
            </div>

            {recommendations.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-[#faf7f1] py-12 text-center">
                <Target className="mx-auto mb-3 h-12 w-12 text-slate-300" />
                <p className="mb-4 text-slate-600">Complete your profile to unlock recommendations</p>
                <Link
                  to="/dashboard/profile"
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
                >
                  Complete Profile
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recommendations.map((prog) => (
                  <div key={prog.id} className="rounded-2xl border border-slate-200/80 bg-[#fcfbf8] p-4 transition-colors hover:bg-white">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="truncate font-medium text-slate-900">{prog.name}</h3>
                        <p className="mt-1 truncate text-sm text-slate-500">
                          {prog.universities?.name} • {prog.universities?.country}
                        </p>
                      </div>
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
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
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-slate-900">Quick Actions</h2>
          <span className="hidden rounded-full border border-white/70 bg-white/60 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-500 sm:inline-flex">
            Keep moving
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Target,
              title: 'Find Universities',
              desc: 'Explore recommended programs and start a draft application.',
              link: '/dashboard/match',
              color: 'from-sky-500 to-cyan-500'
            },
            {
              icon: Upload,
              title: 'Manage Documents',
              desc: 'Upload the required files before you submit applications.',
              link: '/dashboard/documents',
              color: 'from-emerald-500 to-teal-600'
            },
            {
              icon: BookOpen,
              title: 'Update Profile',
              desc: 'Keep your academics, budget, and preferences current.',
              link: '/dashboard/profile',
              color: 'from-amber-500 to-orange-500'
            }
          ].map((action) => (
            <Link key={action.title} to={action.link}>
              <GlassCard className="group h-full border-white/70 bg-white/68 p-6">
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${action.color} transition-transform group-hover:scale-110`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-1 font-semibold text-slate-900">{action.title}</h3>
                <p className="mb-3 text-sm text-slate-600">{action.desc}</p>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-slate-900">
                  Open
                  <ArrowUpRight className="h-4 w-4" />
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
