import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Target, GraduationCap, MapPin, DollarSign, CheckCircle, Award } from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';

const UniversityMatch: React.FC = () => {
  const { profile } = useAuth();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const isProfileIncomplete = !profile?.gpa || !profile?.study_level;

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-slate-900 mb-2">University Matching</h1>
        <p className="text-slate-600">
          Programs matched to your profile based on GPA, test scores, budget, and preferences.
        </p>
      </motion.div>

      {isProfileIncomplete ? (
        <GlassCard className="p-12 text-center" hover={false}>
          <Target className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Complete Your Profile</h2>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            We need more information about your academic background to provide accurate university recommendations.
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
            Try adjusting your profile preferences to find more programs.
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
          <p className="text-slate-600">{matches.length} programs matched to your profile</p>
          
          {matches.map((program, i) => (
            <motion.div
              key={program.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <GlassCard className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-sky-100 to-blue-200 flex items-center justify-center shrink-0">
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
                        {program.duration && (
                          <span>{program.duration}</span>
                        )}
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
                          <circle
                            cx="40"
                            cy="40"
                            r="36"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            className="text-slate-100"
                          />
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

                    <Link
                      to={`/dashboard/apply/${program.id}`}
                      className="px-6 py-3 rounded-xl text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 transition-all font-medium whitespace-nowrap"
                    >
                      Apply Now
                    </Link>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UniversityMatch;
