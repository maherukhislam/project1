import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Target, GraduationCap, MapPin, DollarSign, CheckCircle, Award, Sparkles, LoaderCircle } from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';

const defaultIntake = (profileIntake?: string) => profileIntake || 'Fall 2026';

const UniversityMatch: React.FC = () => {
  const { profile } = useAuth();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingId, setCreatingId] = useState<number | null>(null);
  const [createdProgramIds, setCreatedProgramIds] = useState<number[]>([]);

  useEffect(() => {
    const fetchMatches = async () => {
      if (!profile) return;

      try {
        const data = await api.post('/api/university-match', {
          gpa: profile.gpa,
          english_score: profile.english_score,
          budget_max: profile.budget_max,
          preferred_country: profile.preferred_country,
          preferred_subject: profile.preferred_subject,
          study_level: profile.study_level
        });
        setMatches(data);
      } catch (err) {
        console.error('Failed to fetch matches:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, [profile]);

  const createApplication = async (programId: number) => {
    setCreatingId(programId);
    try {
      await api.post('/api/applications', {
        program_id: programId,
        intake: defaultIntake(profile?.intake),
        notes: 'Created from match recommendations'
      });
      setCreatedProgramIds((current) => [...current, programId]);
    } catch (err) {
      console.error('Failed to create application:', err);
    } finally {
      setCreatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const isProfileIncomplete = !profile?.gpa || !profile?.study_level;

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[2rem] border border-sky-100 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.18),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(240,249,255,0.95))] p-8 shadow-[0_24px_70px_rgba(14,116,144,0.1)]"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
              Smart Matching
            </div>
            <h1 className="mt-4 text-3xl font-bold text-slate-900">University Matching</h1>
            <p className="mt-2 max-w-2xl text-slate-600">
              Programs are ranked using your academics, budget, destination preferences, and subject interest.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white/75 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Study level</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{profile?.study_level || 'Not set'}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/75 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Preferred country</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{profile?.preferred_country || 'Flexible'}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {isProfileIncomplete ? (
        <GlassCard className="p-12 text-center" hover={false}>
          <Target className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Complete Your Profile</h2>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            Add your GPA and intended study level so the matching engine can recommend realistic programs.
          </p>
          <Link
            to="/dashboard/profile"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 transition-all font-medium"
          >
            Complete Profile
          </Link>
        </GlassCard>
      ) : matches.length === 0 ? (
        <GlassCard className="p-12 text-center" hover={false}>
          <GraduationCap className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">No Matches Found</h2>
          <p className="text-slate-600 mb-6">
            Update your profile to broaden your subject, country, or budget preferences.
          </p>
          <Link
            to="/dashboard/profile"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 transition-all font-medium"
          >
            Update Profile
          </Link>
        </GlassCard>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <p className="text-slate-600">{matches.length} programs matched to your profile</p>
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-sm font-medium text-sky-700">
              <Sparkles className="w-4 h-4" />
              Ordered by fit
            </div>
          </div>

          {matches.map((program, i) => {
            const isCreating = creatingId === program.id;
            const isCreated = createdProgramIds.includes(program.id);

            return (
              <motion.div
                key={program.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <GlassCard className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-100 to-blue-200 flex items-center justify-center shrink-0">
                        <GraduationCap className="w-8 h-8 text-sky-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-semibold text-slate-900 mb-1">{program.name}</h3>
                        <div className="flex items-center gap-2 text-slate-500 mb-3">
                          <MapPin className="w-4 h-4" />
                          <span>{program.universities?.name} • {program.universities?.country}</span>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {program.match_reasons?.map((reason: string, j: number) => (
                            <span key={j} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-green-50 text-green-700 text-xs">
                              <CheckCircle className="w-3 h-3" />
                              {reason}
                            </span>
                          ))}
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                          <span className="flex items-center gap-1">
                            <GraduationCap className="w-4 h-4 text-slate-400" />
                            {program.degree_level}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4 text-slate-400" />
                            ${program.tuition_fee?.toLocaleString()}/year
                          </span>
                          {program.duration && <span>{program.duration}</span>}
                          {program.scholarship_available && (
                            <span className="flex items-center gap-1 text-amber-600">
                              <Award className="w-4 h-4" />
                              Scholarship Available
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="relative w-20 h-20">
                          <svg className="w-20 h-20 transform -rotate-90">
                            <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="none" className="text-slate-100" />
                            <circle
                              cx="40"
                              cy="40"
                              r="36"
                              stroke="currentColor"
                              strokeWidth="8"
                              fill="none"
                              strokeDasharray={`${program.match_score * 2.26} 226`}
                              className="text-sky-500"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xl font-bold text-slate-900">{program.match_score}%</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Match Score</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => createApplication(program.id)}
                        disabled={isCreating || isCreated}
                        className={`px-6 py-3 rounded-xl transition-all font-medium whitespace-nowrap ${
                          isCreated
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700'
                        } disabled:opacity-70`}
                      >
                        {isCreating ? (
                          <span className="inline-flex items-center gap-2">
                            <LoaderCircle className="w-4 h-4 animate-spin" />
                            Creating...
                          </span>
                        ) : isCreated ? 'Draft Created' : 'Create Draft'}
                      </button>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UniversityMatch;
