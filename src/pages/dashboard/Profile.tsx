import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Save, ShieldAlert, Upload, User } from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import supabase from '../../lib/supabase';

const countries = ['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'Netherlands', 'France', 'Ireland', 'New Zealand', 'Singapore'];
const nationalities = ['American', 'British', 'Canadian', 'Chinese', 'Indian', 'Nigerian', 'Pakistani', 'Bangladeshi', 'Vietnamese', 'Indonesian', 'Other'];
const subjects = ['Computer Science', 'Business Administration', 'Engineering', 'Medicine', 'Law', 'Arts & Design', 'Social Sciences', 'Natural Sciences', 'Education', 'Other'];
const MIN_LAST_EDUCATION_YEAR = 1980;
const MAX_LAST_EDUCATION_YEAR = new Date().getFullYear() + 2;

const emptyForm = {
  name: '',
  phone: '',
  nationality: '',
  preferred_country: '',
  education_level: '',
  academic_system: '',
  gpa: '',
  gpa_scale: '',
  medium_of_instruction: '',
  english_score: '',
  english_test_type: '',
  last_education_year: '',
  study_level: '',
  preferred_subject: '',
  preferred_intake_name: '',
  preferred_intake_year: '',
  budget_min: '',
  budget_max: ''
};

const Profile: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    if (!profile) return;
    setFormData({
      name: profile.name || '',
      phone: profile.phone || '',
      nationality: profile.nationality || '',
      preferred_country: profile.preferred_country || '',
      education_level: profile.education_level || '',
      academic_system: profile.academic_system || '',
      gpa: profile.gpa?.toString() || '',
      gpa_scale: profile.gpa_scale?.toString() || '',
      medium_of_instruction: profile.medium_of_instruction || '',
      english_score: profile.english_score?.toString() || '',
      english_test_type: profile.english_test_type || '',
      last_education_year: profile.last_education_year?.toString() || '',
      study_level: profile.study_level || '',
      preferred_subject: profile.preferred_subject || '',
      preferred_intake_name: profile.preferred_intake_name || '',
      preferred_intake_year: profile.preferred_intake_year?.toString() || '',
      budget_min: profile.budget_min?.toString() || '',
      budget_max: profile.budget_max?.toString() || ''
    });
    setValidationErrors(profile.validation_errors || {});
  }, [profile]);

  const setField = (field: string, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setValidationErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    setError('');

    try {
      const updates: Record<string, string | number | null> = { ...formData };
      ['gpa', 'gpa_scale', 'english_score'].forEach((field) => {
        updates[field] = formData[field as keyof typeof formData] ? parseFloat(formData[field as keyof typeof formData]) : null;
      });
      ['budget_min', 'budget_max', 'last_education_year', 'preferred_intake_year'].forEach((field) => {
        updates[field] = formData[field as keyof typeof formData] ? parseInt(formData[field as keyof typeof formData], 10) : null;
      });
      updates.intake = updates.preferred_intake_name && updates.preferred_intake_year
        ? `${updates.preferred_intake_name} ${updates.preferred_intake_year}`
        : null;

      const updated = await api.put('/api/profile', updates);
      setValidationErrors(updated.validation_errors || {});
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const uploadProfilePicture = async (file: File) => {
    setUploadingPhoto(true);
    setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('You must be logged in.');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('kind', 'profile_picture');

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: formData
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || 'Profile picture upload failed.');

      await api.put('/api/profile', { profile_picture_url: payload.url });
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error('Profile picture upload failed:', err);
      setError(err instanceof Error ? err.message : 'Profile picture upload failed');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const fieldHint = (field: string) =>
    validationErrors[field] ? <p className="mt-2 text-xs text-red-600">{validationErrors[field]}</p> : null;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
            <p className="text-slate-600">Matching and applications unlock only when all required fields are valid.</p>
          </div>
          <div className={`flex items-center gap-2 rounded-2xl px-4 py-3 ${profile?.profile_status === 'complete' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
            {profile?.profile_status === 'complete' ? <CheckCircle className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
            <span className="font-semibold">{profile?.profile_completion || 0}% Complete</span>
          </div>
        </div>
      </motion.div>

      {(error || profile?.blocking_reasons?.length || profile?.improvement_flags?.length) && (
        <GlassCard className="p-6" hover={false}>
          {error && <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          {profile?.blocking_reasons?.length ? (
            <div className="mb-4">
              <p className="mb-2 text-sm font-semibold text-slate-900">Blocking issues</p>
              <div className="space-y-2">
                {profile.blocking_reasons.map((reason) => (
                  <div key={reason} className="flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          {profile?.improvement_flags?.length ? (
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-900">Recommendations</p>
              <div className="flex flex-wrap gap-2">
                {profile.improvement_flags.map((flag) => (
                  <span key={flag} className="rounded-full bg-sky-50 px-3 py-1 text-sm text-sky-700">
                    {flag}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </GlassCard>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <GlassCard className="p-6" hover={false}>
          <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-slate-900">
            <User className="h-5 w-5 text-sky-500" />
            Basic Information
          </h2>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Profile Picture</label>
              <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white/60 p-4">
                <div className="h-16 w-16 overflow-hidden rounded-full bg-slate-200">
                  {profile?.profile_picture_url ? (
                    <img src={profile.profile_picture_url} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-500">
                      <User className="h-6 w-6" />
                    </div>
                  )}
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:border-sky-400 hover:text-sky-700">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadProfilePicture(file);
                    }}
                    disabled={uploadingPhoto}
                  />
                  {uploadingPhoto ? <LoadingSpinner size="sm" /> : <Upload className="h-4 w-4" />}
                  {uploadingPhoto ? 'Uploading...' : 'Upload Photo'}
                </label>
                <p className="text-xs text-slate-500">JPG, PNG, or WebP recommended.</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Full Name *</label>
              <input value={formData.name} onChange={(e) => setField('name', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 outline-none transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20" />
              {fieldHint('name')}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number *</label>
              <input value={formData.phone} onChange={(e) => setField('phone', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 outline-none transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20" />
              {fieldHint('phone')}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Nationality *</label>
              <select value={formData.nationality} onChange={(e) => setField('nationality', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 outline-none focus:border-sky-500">
                <option value="">Select nationality</option>
                {nationalities.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              {fieldHint('nationality')}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Preferred Study Country *</label>
              <select value={formData.preferred_country} onChange={(e) => setField('preferred_country', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 outline-none focus:border-sky-500">
                <option value="">Select country</option>
                {countries.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              {fieldHint('preferred_country')}
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6" hover={false}>
          <h2 className="mb-6 text-xl font-semibold text-slate-900">Academic Eligibility</h2>
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Previous Education Level *</label>
              <select value={formData.education_level} onChange={(e) => setField('education_level', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 outline-none focus:border-sky-500">
                <option value="">Select level</option>
                <option value="High School">High School</option>
                <option value="Bachelor">Bachelor&apos;s Degree</option>
                <option value="Master">Master&apos;s Degree</option>
                <option value="PhD">PhD</option>
              </select>
              {fieldHint('education_level')}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Academic System *</label>
              <select value={formData.academic_system} onChange={(e) => setField('academic_system', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 outline-none focus:border-sky-500">
                <option value="">Select system</option>
                <option value="SSC/HSC">SSC/HSC</option>
                <option value="A Levels">A Levels</option>
                <option value="Others">Others</option>
              </select>
              {fieldHint('academic_system')}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">GPA / Score *</label>
              <input type="number" step="0.01" value={formData.gpa} onChange={(e) => setField('gpa', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 outline-none transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20" />
              {fieldHint('gpa')}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">GPA Scale *</label>
              <input type="number" step="0.01" value={formData.gpa_scale} onChange={(e) => setField('gpa_scale', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 outline-none transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20" />
              <p className="mt-2 text-xs text-slate-500">Use `5.0` for SSC/HSC, converted value for A Levels, `4.0` for normalized systems.</p>
              {fieldHint('gpa_scale')}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Medium of Instruction *</label>
              <select value={formData.medium_of_instruction} onChange={(e) => setField('medium_of_instruction', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 outline-none focus:border-sky-500">
                <option value="">Select medium</option>
                <option value="English Medium">English Medium</option>
                <option value="Bangla Medium">Bangla Medium</option>
              </select>
              {fieldHint('medium_of_instruction')}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Last Education Year *</label>
              <input
                type="number"
                min={MIN_LAST_EDUCATION_YEAR}
                max={MAX_LAST_EDUCATION_YEAR}
                value={formData.last_education_year}
                onChange={(e) => setField('last_education_year', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 outline-none transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
              />
              <p className="mt-2 text-xs text-slate-500">Use a year between {MIN_LAST_EDUCATION_YEAR} and {MAX_LAST_EDUCATION_YEAR}.</p>
              {fieldHint('last_education_year')}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">English Test Type</label>
              <select value={formData.english_test_type} onChange={(e) => setField('english_test_type', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 outline-none focus:border-sky-500">
                <option value="">Select test</option>
                <option value="IELTS">IELTS</option>
                <option value="TOEFL">TOEFL</option>
                <option value="Duolingo">Duolingo</option>
                <option value="PTE">PTE</option>
              </select>
              {fieldHint('english_test_type')}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">English Test Score</label>
              <input type="number" step="0.5" value={formData.english_score} onChange={(e) => setField('english_score', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 outline-none transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20" />
              <p className="mt-2 text-xs text-slate-500">IELTS 0-9, TOEFL 0-120, Duolingo 0-160.</p>
              {fieldHint('english_score')}
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6" hover={false}>
          <h2 className="mb-6 text-xl font-semibold text-slate-900">Study Preferences</h2>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Intended Study Level *</label>
              <select value={formData.study_level} onChange={(e) => setField('study_level', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 outline-none focus:border-sky-500">
                <option value="">Select level</option>
                <option value="Bachelor">Bachelor&apos;s</option>
                <option value="Master">Master&apos;s</option>
                <option value="PhD">PhD</option>
              </select>
              {fieldHint('study_level')}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Preferred Subject *</label>
              <select value={formData.preferred_subject} onChange={(e) => setField('preferred_subject', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 outline-none focus:border-sky-500">
                <option value="">Select subject</option>
                {subjects.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              {fieldHint('preferred_subject')}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Preferred Intake *</label>
              <select value={formData.preferred_intake_name} onChange={(e) => setField('preferred_intake_name', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 outline-none focus:border-sky-500">
                <option value="">Select intake</option>
                <option value="Spring">Spring</option>
                <option value="Summer">Summer</option>
                <option value="Fall">Fall</option>
                <option value="Winter">Winter</option>
              </select>
              {fieldHint('preferred_intake_name')}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Preferred Intake Year *</label>
              <input
                type="number"
                min={new Date().getFullYear() - 1}
                max={new Date().getFullYear() + 4}
                value={formData.preferred_intake_year}
                onChange={(e) => setField('preferred_intake_year', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 outline-none transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                placeholder={String(new Date().getFullYear())}
              />
              {fieldHint('preferred_intake_year')}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Budget Min (USD/year) *</label>
              <input type="number" value={formData.budget_min} onChange={(e) => setField('budget_min', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 outline-none transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20" />
              {fieldHint('budget_min')}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Budget Max (USD/year) *</label>
              <input type="number" value={formData.budget_max} onChange={(e) => setField('budget_max', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 outline-none transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20" />
              {fieldHint('budget_max')}
            </div>
          </div>
        </GlassCard>

        {profile?.completion_details?.missing_required_fields?.length ? (
          <GlassCard className="p-6" hover={false}>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">Still required</h2>
            <div className="flex flex-wrap gap-2">
              {profile.completion_details.missing_required_fields.map((field) => (
                <span key={field} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                  {field.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </GlassCard>
        ) : null}

        <div className="flex justify-end">
          <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-8 py-3 font-medium text-white shadow-lg shadow-sky-500/25 transition-all hover:from-sky-600 hover:to-blue-700 disabled:opacity-50">
            {loading ? <LoadingSpinner size="sm" /> : saved ? <><CheckCircle className="h-5 w-5" />Saved!</> : <><Save className="h-5 w-5" />Save Profile</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
