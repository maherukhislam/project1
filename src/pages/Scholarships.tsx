import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Award, DollarSign, GraduationCap, X,
  ExternalLink, CheckCircle, AlertCircle, XCircle, Zap, Star,
  Clock, Layers, TrendingUp, BookOpen, ChevronDown, ChevronUp
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { api } from '../lib/api';
import {
  rankScholarships, checkEligibility, calculateFinalTuition,
  getDeadlineLabel, getDeadlineUrgency,
  getBudgetFit, isExpired, intakeMatches,
  type StudentProfile, type Scholarship, type EligibilityResult
} from '../lib/scholarshipUtils';

const STUDY_LEVELS = ['Any', 'Bachelor', 'Master', 'PhD', 'Diploma'];
const INTAKES      = ['Any', 'January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];

const EligibilityBadge: React.FC<{ result: EligibilityResult }> = ({ result }) => {
  if (result.status === 'eligible') {
    return (
      <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
        <CheckCircle className="w-3 h-3" /> Eligible
      </span>
    );
  }
  if (result.status === 'conditional') {
    return (
      <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
        <AlertCircle className="w-3 h-3" /> Conditional
      </span>
    );
  }
  if (result.status === 'not_eligible') {
    return (
      <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
        <XCircle className="w-3 h-3" /> Not Eligible
      </span>
    );
  }
  return null;
};

const DeadlineBadge: React.FC<{ deadline?: string | null }> = ({ deadline }) => {
  const urgency = getDeadlineUrgency(deadline);
  const label   = getDeadlineLabel(deadline);

  const colours: Record<string, string> = {
    urgent:  'bg-red-100 text-red-700',
    soon:    'bg-amber-100 text-amber-700',
    ok:      'bg-slate-100 text-slate-600',
    expired: 'bg-slate-100 text-slate-400',
    none:    'bg-slate-100 text-slate-500'
  };

  return (
    <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colours[urgency]}`}>
      <Clock className="w-3 h-3" />
      {label}
    </span>
  );
};

const FundingBadge: React.FC<{ type: string }> = ({ type }) => {
  const map: Record<string, string> = {
    Full:    'bg-green-100 text-green-700',
    Partial: 'bg-blue-100 text-blue-700',
    Tuition: 'bg-purple-100 text-purple-700'
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${map[type] ?? 'bg-slate-100 text-slate-700'}`}>
      {type} Funding
    </span>
  );
};

const ProfileChecker: React.FC<{
  profile: StudentProfile;
  onChange: (p: StudentProfile) => void;
  visible: boolean;
}> = ({ profile, onChange, visible }) => {
  const set = (k: keyof StudentProfile, v: string) =>
    onChange({ ...profile, [k]: v || null });

  if (!visible) return null;
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="mt-4 pt-4 border-t border-slate-200"
    >
      <p className="text-sm font-medium text-slate-700 mb-3">
        Enter your profile to check eligibility and see personalised rankings
      </p>
      <div className="grid md:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs text-slate-500 mb-1">GPA (out of 4.0)</label>
          <input
            type="number" step="0.1" min="0" max="4" placeholder="e.g. 3.5"
            value={profile.gpa ?? ''}
            onChange={e => onChange({ ...profile, gpa: e.target.value ? parseFloat(e.target.value) : null })}
            className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm focus:border-sky-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Study Level</label>
          <select
            value={profile.study_level ?? ''}
            onChange={e => set('study_level', e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm focus:border-sky-500 outline-none"
          >
            <option value="">Select level</option>
            {STUDY_LEVELS.filter(l => l !== 'Any').map(l => <option key={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">English Test</label>
          <select
            value={profile.english_test_type ?? ''}
            onChange={e => set('english_test_type', e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm focus:border-sky-500 outline-none"
          >
            <option value="">None</option>
            <option>IELTS</option><option>TOEFL</option><option>Duolingo</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">English Score</label>
          <input
            type="number" step="0.5" placeholder="e.g. 6.5"
            value={profile.english_score ?? ''}
            onChange={e => onChange({ ...profile, english_score: e.target.value ? parseFloat(e.target.value) : null })}
            className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm focus:border-sky-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Max Budget (USD/yr)</label>
          <input
            type="number" step="500" placeholder="e.g. 20000"
            value={profile.budget_max ?? ''}
            onChange={e => onChange({ ...profile, budget_max: e.target.value ? parseInt(e.target.value) : null })}
            className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm focus:border-sky-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Tuition (USD/yr, for impact calc)</label>
          <input
            type="number" step="500" placeholder="e.g. 15000"
            value={(profile as any)._tuition ?? ''}
            onChange={e => onChange({ ...profile, [('_tuition' as any)]: e.target.value ? parseInt(e.target.value) : null } as any)}
            className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm focus:border-sky-500 outline-none"
          />
        </div>
      </div>
    </motion.div>
  );
};

const ScholarshipCard: React.FC<{
  scholarship: Scholarship & { _eligibility?: EligibilityResult; _score?: number };
  profile: StudentProfile;
  index: number;
  profileActive: boolean;
}> = ({ scholarship, profile, index, profileActive }) => {
  const [expanded, setExpanded] = useState(false);
  const eligibility = scholarship._eligibility ?? checkEligibility(scholarship, profile);
  const tuition     = (profile as any)._tuition as number | null;
  const finalTuition = tuition ? calculateFinalTuition(scholarship, tuition) : null;
  const budgetFit    = finalTuition ? getBudgetFit(finalTuition, profile.budget_max) : null;
  const expired      = isExpired(scholarship.deadline);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      viewport={{ once: true }}
    >
      <GlassCard className={`h-full ${expired ? 'opacity-60' : ''}`}>
        <div className="p-6">
          {/* Header row */}
          <div className="flex items-start justify-between mb-3 gap-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5 text-white" />
              </div>
              {scholarship.is_featured && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
                  <Star className="w-3 h-3" /> Featured
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1 justify-end">
              <FundingBadge type={scholarship.funding_type} />
              {profileActive && <EligibilityBadge result={eligibility} />}
            </div>
          </div>

          <h3 className="text-base font-semibold text-slate-900 mb-1">{scholarship.name}</h3>

          {scholarship.universities && (
            <p className="text-slate-500 text-xs mb-3">
              {scholarship.universities.name} · {scholarship.universities.country}
            </p>
          )}

          {/* Key details */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {scholarship.amount ? (
              <span className="flex items-center gap-1 text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded-lg">
                <DollarSign className="w-3 h-3 text-green-500" />
                Up to ${scholarship.amount.toLocaleString()}
              </span>
            ) : scholarship.funding_percentage ? (
              <span className="flex items-center gap-1 text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded-lg">
                <TrendingUp className="w-3 h-3 text-green-500" />
                {scholarship.funding_percentage}% off tuition
              </span>
            ) : null}

            {scholarship.min_gpa_required && (
              <span className="flex items-center gap-1 text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded-lg">
                <GraduationCap className="w-3 h-3 text-blue-500" />
                Min GPA {scholarship.min_gpa_required}
              </span>
            )}

            {scholarship.study_level && scholarship.study_level !== 'Any' && (
              <span className="flex items-center gap-1 text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded-lg">
                <BookOpen className="w-3 h-3 text-violet-500" />
                {scholarship.study_level}
              </span>
            )}

            {scholarship.is_stackable && (
              <span className="flex items-center gap-1 text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded-lg">
                <Layers className="w-3 h-3 text-sky-500" />
                Stackable
              </span>
            )}

            {scholarship.merit_based && (
              <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">Merit</span>
            )}
            {scholarship.need_based && (
              <span className="text-xs text-rose-600 bg-rose-50 px-2 py-1 rounded-lg">Need-based</span>
            )}
          </div>

          {/* Deadline */}
          <div className="flex items-center justify-between mb-3">
            <DeadlineBadge deadline={scholarship.deadline} />
            <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${
              scholarship.application_type === 'auto'
                ? 'bg-sky-50 text-sky-700'
                : 'bg-slate-50 text-slate-600'
            }`}>
              <Zap className="w-3 h-3" />
              {scholarship.application_type === 'auto' ? 'Auto-applied' : 'Manual apply'}
            </span>
          </div>

          {/* Budget impact */}
          {finalTuition !== null && (
            <div className={`rounded-xl p-3 mb-3 text-xs ${
              budgetFit === 'within'        ? 'bg-green-50 border border-green-200' :
              budgetFit === 'slightly_above'? 'bg-amber-50 border border-amber-200' :
                                             'bg-red-50 border border-red-200'
            }`}>
              <p className="font-medium text-slate-700">Budget Impact</p>
              <p className="text-slate-600">
                Tuition after scholarship:{' '}
                <strong>${Math.round(finalTuition).toLocaleString()}/yr</strong>
              </p>
              {budgetFit === 'within' && <p className="text-green-700 font-medium">✓ Within your budget</p>}
              {budgetFit === 'slightly_above' && <p className="text-amber-700 font-medium">~ Slightly above budget</p>}
              {budgetFit === 'expensive' && <p className="text-red-700 font-medium">✗ Still expensive for your budget</p>}
            </div>
          )}

          {/* Eligibility detail */}
          {profileActive && eligibility.status === 'conditional' && eligibility.improvements.length > 0 && (
            <div className="rounded-xl p-3 mb-3 bg-amber-50 border border-amber-200 text-xs">
              <p className="font-semibold text-amber-800 mb-1">Possible with improvement:</p>
              <ul className="space-y-0.5">
                {eligibility.improvements.map((imp, i) => (
                  <li key={i} className="text-amber-700">• {imp}</li>
                ))}
              </ul>
            </div>
          )}
          {profileActive && eligibility.status === 'not_eligible' && eligibility.reasons.length > 0 && (
            <div className="rounded-xl p-3 mb-3 bg-red-50 border border-red-200 text-xs">
              <ul className="space-y-0.5">
                {eligibility.reasons.map((r, i) => (
                  <li key={i} className="text-red-700">✗ {r}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Description toggle */}
          {(scholarship.description || scholarship.eligibility) && (
            <button
              onClick={() => setExpanded(e => !e)}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 mb-3"
            >
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {expanded ? 'Show less' : 'Show details'}
            </button>
          )}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                {scholarship.description && (
                  <p className="text-xs text-slate-600 mb-2">{scholarship.description}</p>
                )}
                {scholarship.eligibility && (
                  <p className="text-xs text-slate-600 mb-2">
                    <strong>Eligibility:</strong> {scholarship.eligibility}
                  </p>
                )}
                {scholarship.application_type === 'manual' && scholarship.additional_requirements && (
                  <p className="text-xs text-slate-600">
                    <strong>Additional requirements:</strong> {scholarship.additional_requirements}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <Link
            to="/signup"
            className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors text-sm font-medium"
          >
            Apply Now
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </GlassCard>
    </motion.div>
  );
};

const Scholarships: React.FC = () => {
  const [allScholarships, setAllScholarships] = useState<Scholarship[]>([]);
  const [ranked, setRanked] = useState<Array<Scholarship & { _eligibility: EligibilityResult; _score: number }>>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const [filters, setFilters] = useState({
    country:     searchParams.get('country')     || '',
    fundingType: searchParams.get('funding')     || '',
    studyLevel:  searchParams.get('level')       || '',
    intake:      searchParams.get('intake')      || '',
    appType:     searchParams.get('appType')     || '',
    meritBased:  searchParams.get('merit')       || '',
    needBased:   searchParams.get('need')        || '',
    search:      ''
  });

  const [profile, setProfile] = useState<StudentProfile>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params: any = {};
        if (filters.country)    params.country       = filters.country;
        if (filters.fundingType) params.funding_type = filters.fundingType;
        if (filters.studyLevel) params.study_level   = filters.studyLevel;
        if (filters.appType)    params.application_type = filters.appType;
        if (filters.meritBased) params.merit_based   = filters.meritBased;
        if (filters.needBased)  params.need_based    = filters.needBased;

        const [scholarshipData, countryData] = await Promise.all([
          api.get('/api/scholarships', params),
          api.get('/api/countries')
        ]);
        setAllScholarships(scholarshipData);
        setCountries(countryData);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters.country, filters.fundingType, filters.studyLevel, filters.appType,
      filters.meritBased, filters.needBased]);

  useEffect(() => {
    const profileActive = Object.values(profile).some(v => v != null && v !== '');
    let list = allScholarships.filter(s =>
      !filters.search ||
      s.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      s.universities?.name?.toLowerCase().includes(filters.search.toLowerCase())
    );

    list = list.filter(s => intakeMatches(s, filters.intake || null));

    if (profileActive) {
      setRanked(rankScholarships(list, profile) as any);
    } else {
      setRanked(list.map(s => ({ ...s, _eligibility: { status: 'unknown' as any, reasons: [], improvements: [] }, _score: 0 })));
    }
  }, [allScholarships, filters.search, filters.intake, profile]);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    const params = new URLSearchParams();
    if (newFilters.country)    params.set('country',  newFilters.country);
    if (newFilters.fundingType) params.set('funding', newFilters.fundingType);
    if (newFilters.studyLevel) params.set('level',    newFilters.studyLevel);
    if (newFilters.intake)     params.set('intake',   newFilters.intake);
    if (newFilters.appType)    params.set('appType',  newFilters.appType);
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({ country: '', fundingType: '', studyLevel: '', intake: '', appType: '', meritBased: '', needBased: '', search: '' });
    setSearchParams({});
  };

  const hasActiveFilters = Object.entries(filters).some(([k, v]) => k !== 'search' && v);
  const profileActive = Object.values(profile).some(v => v != null && v !== '');

  const recommended = ranked.filter(s => s._eligibility?.status === 'eligible' && s._score > 120);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-32 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-blue-50" />
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-72 h-72 bg-sky-200/30 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div className="max-w-3xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl font-bold text-slate-900 mb-4">
              Find
              <span className="bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent"> Scholarships</span>
            </h1>
            <p className="text-xl text-slate-600">
              Discover scholarships that match your profile, check your eligibility, and see the real cost after funding.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <GlassCard className="p-4" hover={false}>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search scholarships or universities..."
                  value={filters.search}
                  onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/50 border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl border transition-all ${
                  showFilters || hasActiveFilters ? 'bg-sky-50 border-sky-200 text-sky-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Filter className="w-5 h-5" />
                Filters {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-sky-500" />}
              </button>
              <button
                onClick={() => setShowProfile(!showProfile)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl border transition-all ${
                  showProfile || profileActive ? 'bg-amber-50 border-amber-200 text-amber-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CheckCircle className="w-5 h-5" />
                {profileActive ? 'My Profile ✓' : 'Check Eligibility'}
              </button>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-4 pt-4 border-t border-slate-200 overflow-hidden"
                >
                  <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-3">
                    <select value={filters.country} onChange={e => handleFilterChange('country', e.target.value)}
                      className="px-3 py-2 rounded-xl bg-white/50 border border-slate-200 focus:border-sky-500 outline-none text-sm">
                      <option value="">All Countries</option>
                      {countries.map(c => <option key={c.id} value={c.name}>{c.flag_emoji} {c.name}</option>)}
                    </select>

                    <select value={filters.fundingType} onChange={e => handleFilterChange('fundingType', e.target.value)}
                      className="px-3 py-2 rounded-xl bg-white/50 border border-slate-200 focus:border-sky-500 outline-none text-sm">
                      <option value="">All Funding</option>
                      <option value="Full">Full Funding</option>
                      <option value="Partial">Partial</option>
                      <option value="Tuition">Tuition Only</option>
                    </select>

                    <select value={filters.studyLevel} onChange={e => handleFilterChange('studyLevel', e.target.value)}
                      className="px-3 py-2 rounded-xl bg-white/50 border border-slate-200 focus:border-sky-500 outline-none text-sm">
                      <option value="">All Levels</option>
                      {STUDY_LEVELS.filter(l => l !== 'Any').map(l => <option key={l}>{l}</option>)}
                    </select>

                    <select value={filters.intake} onChange={e => handleFilterChange('intake', e.target.value)}
                      className="px-3 py-2 rounded-xl bg-white/50 border border-slate-200 focus:border-sky-500 outline-none text-sm">
                      <option value="">Any Intake</option>
                      {INTAKES.filter(i => i !== 'Any').map(i => <option key={i}>{i}</option>)}
                    </select>

                    <select value={filters.appType} onChange={e => handleFilterChange('appType', e.target.value)}
                      className="px-3 py-2 rounded-xl bg-white/50 border border-slate-200 focus:border-sky-500 outline-none text-sm">
                      <option value="">Any Application</option>
                      <option value="auto">Auto-applied</option>
                      <option value="manual">Manual</option>
                    </select>

                    <div className="flex gap-2">
                      <label className="flex items-center gap-1 text-sm text-slate-600 cursor-pointer">
                        <input type="checkbox" checked={filters.meritBased === 'true'}
                          onChange={e => handleFilterChange('meritBased', e.target.checked ? 'true' : '')}
                          className="rounded" />
                        Merit
                      </label>
                      <label className="flex items-center gap-1 text-sm text-slate-600 cursor-pointer">
                        <input type="checkbox" checked={filters.needBased === 'true'}
                          onChange={e => handleFilterChange('needBased', e.target.checked ? 'true' : '')}
                          className="rounded" />
                        Need
                      </label>
                    </div>
                  </div>

                  {hasActiveFilters && (
                    <button onClick={clearFilters} className="mt-3 flex items-center gap-1 text-sm text-slate-500 hover:text-red-600">
                      <X className="w-4 h-4" /> Clear all filters
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <ProfileChecker profile={profile} onChange={setProfile} visible={showProfile} />
          </GlassCard>
        </div>
      </section>

      {/* Results */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
          ) : ranked.length === 0 ? (
            <div className="text-center py-20">
              <Award className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No scholarships found</h3>
              <p className="text-slate-600">Try adjusting your filters.</p>
            </div>
          ) : (
            <>
              {/* Recommended section */}
              {profileActive && recommended.length > 0 && (
                <div className="mb-10">
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-5 h-5 text-amber-500" />
                    <h2 className="text-lg font-bold text-slate-900">Recommended for You</h2>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">{recommended.length}</span>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recommended.slice(0, 3).map((s, i) => (
                      <ScholarshipCard key={s.id} scholarship={s} profile={profile} index={i} profileActive={profileActive} />
                    ))}
                  </div>
                  <div className="my-10 border-t border-slate-200" />
                </div>
              )}

              <div className="flex items-center justify-between mb-6">
                <p className="text-slate-600">
                  {ranked.length} scholarship{ranked.length !== 1 ? 's' : ''} found
                  {profileActive && ' · sorted by eligibility & value'}
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ranked.map((s, i) => (
                  <ScholarshipCard key={s.id} scholarship={s} profile={profile} index={i} profileActive={profileActive} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Scholarships;
