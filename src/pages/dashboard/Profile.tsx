import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Save, CheckCircle } from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';

const Profile: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    nationality: '',
    preferred_country: '',
    education_level: '',
    gpa: '',
    english_score: '',
    english_test_type: '',
    study_level: '',
    preferred_subject: '',
    budget_min: '',
    budget_max: '',
    intake: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        nationality: profile.nationality || '',
        preferred_country: profile.preferred_country || '',
        education_level: profile.education_level || '',
        gpa: profile.gpa?.toString() || '',
        english_score: profile.english_score?.toString() || '',
        english_test_type: profile.english_test_type || '',
        study_level: profile.study_level || '',
        preferred_subject: profile.preferred_subject || '',
        budget_min: profile.budget_min?.toString() || '',
        budget_max: profile.budget_max?.toString() || '',
        intake: profile.intake || ''
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    try {
      const updates: any = { ...formData };
      if (updates.gpa) updates.gpa = parseFloat(updates.gpa);
      if (updates.english_score) updates.english_score = parseFloat(updates.english_score);
      if (updates.budget_min) updates.budget_min = parseInt(updates.budget_min);
      if (updates.budget_max) updates.budget_max = parseInt(updates.budget_max);

      await api.put('/api/profile', updates);
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const countries = ['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'Netherlands', 'France', 'Ireland', 'New Zealand', 'Singapore'];
  const nationalities = ['American', 'British', 'Canadian', 'Chinese', 'Indian', 'Nigerian', 'Pakistani', 'Bangladeshi', 'Vietnamese', 'Indonesian', 'Other'];
  const subjects = ['Computer Science', 'Business Administration', 'Engineering', 'Medicine', 'Law', 'Arts & Design', 'Social Sciences', 'Natural Sciences', 'Education', 'Other'];

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
            <p className="text-slate-600">Complete your profile to get personalized recommendations</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-50 text-sky-600">
            <span className="font-semibold">{profile?.profile_completion || 0}%</span>
            <span className="text-sm">Complete</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <GlassCard className="p-6" hover={false}>
            <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-sky-500" />
              Basic Information
            </h2>
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/50 border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/50 border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nationality</label>
                <select
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/50 border border-slate-200 focus:border-sky-500 outline-none"
                >
                  <option value="">Select nationality</option>
                  {nationalities.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Preferred Study Country</label>
                <select
                  value={formData.preferred_country}
                  onChange={(e) => setFormData({ ...formData, preferred_country: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/50 border border-slate-200 focus:border-sky-500 outline-none"
                >
                  <option value="">Select country</option>
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </GlassCard>

          {/* Academic Information */}
          <GlassCard className="p-6" hover={false}>
            <h2 className="text-xl font-semibold text-slate-900 mb-6">🎓 Academic Information</h2>
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Previous Education Level</label>
                <select
                  value={formData.education_level}
                  onChange={(e) => setFormData({ ...formData, education_level: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/50 border border-slate-200 focus:border-sky-500 outline-none"
                >
                  <option value="">Select level</option>
                  <option value="High School">High School</option>
                  <option value="Bachelor">Bachelor's Degree</option>
                  <option value="Master">Master's Degree</option>
                  <option value="PhD">PhD</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">GPA (out of 4.0)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                  value={formData.gpa}
                  onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/50 border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all"
                  placeholder="3.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">English Test Type</label>
                <select
                  value={formData.english_test_type}
                  onChange={(e) => setFormData({ ...formData, english_test_type: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/50 border border-slate-200 focus:border-sky-500 outline-none"
                >
                  <option value="">Select test</option>
                  <option value="IELTS">IELTS</option>
                  <option value="TOEFL">TOEFL</option>
                  <option value="Duolingo">Duolingo</option>
                  <option value="PTE">PTE</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">English Test Score</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.english_score}
                  onChange={(e) => setFormData({ ...formData, english_score: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/50 border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all"
                  placeholder="7.0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Intended Study Level</label>
                <select
                  value={formData.study_level}
                  onChange={(e) => setFormData({ ...formData, study_level: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/50 border border-slate-200 focus:border-sky-500 outline-none"
                >
                  <option value="">Select level</option>
                  <option value="Bachelor">Bachelor's</option>
                  <option value="Master">Master's</option>
                  <option value="PhD">PhD</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Preferred Subject</label>
                <select
                  value={formData.preferred_subject}
                  onChange={(e) => setFormData({ ...formData, preferred_subject: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/50 border border-slate-200 focus:border-sky-500 outline-none"
                >
                  <option value="">Select subject</option>
                  {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </GlassCard>

          {/* Preferences */}
          <GlassCard className="p-6" hover={false}>
            <h2 className="text-xl font-semibold text-slate-900 mb-6">⚙️ Preferences</h2>
            <div className="grid md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Budget Min (USD/year)</label>
                <input
                  type="number"
                  value={formData.budget_min}
                  onChange={(e) => setFormData({ ...formData, budget_min: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/50 border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all"
                  placeholder="10000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Budget Max (USD/year)</label>
                <input
                  type="number"
                  value={formData.budget_max}
                  onChange={(e) => setFormData({ ...formData, budget_max: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/50 border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all"
                  placeholder="50000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Preferred Intake</label>
                <select
                  value={formData.intake}
                  onChange={(e) => setFormData({ ...formData, intake: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/50 border border-slate-200 focus:border-sky-500 outline-none"
                >
                  <option value="">Select intake</option>
                  <option value="Fall 2025">Fall 2025</option>
                  <option value="Spring 2025">Spring 2025</option>
                  <option value="Fall 2026">Fall 2026</option>
                  <option value="Spring 2026">Spring 2026</option>
                </select>
              </div>
            </div>
          </GlassCard>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 transition-all font-medium disabled:opacity-50"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : saved ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Profile
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Profile;
