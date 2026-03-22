import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award, Plus, Search, Edit2, Trash2, X, Save, DollarSign,
  GraduationCap, Zap, Star, Layers, ToggleLeft, ToggleRight, TrendingUp,
  Clock, BookOpen
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { api } from '../../lib/api';
import { getDeadlineLabel, getDaysRemaining } from '../../lib/scholarshipUtils';

const STUDY_LEVELS  = ['Any', 'Bachelor', 'Master', 'PhD', 'Diploma'];
const INTAKES       = ['Any', 'January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
const FUNDING_TYPES = ['Full', 'Partial', 'Tuition'];

const emptyForm = {
  name: '',
  university_id: '',
  funding_type: '',
  amount: '',
  funding_percentage: '',
  description: '',
  eligibility: '',
  min_gpa_required: '',
  gpa_tolerance: '0.2',
  min_english_score: '',
  english_test_type: '',
  study_level: 'Any',
  intake: 'Any',
  application_type: 'manual',
  additional_requirements: '',
  is_stackable: false,
  merit_based: true,
  need_based: false,
  is_featured: false,
  is_active: true,
  deadline: ''
};

const AdminScholarships: React.FC = () => {
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [universities, setUniversities] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState<any>(null);
  const [saving, setSaving]       = useState(false);
  const [formData, setFormData]   = useState<any>(emptyForm);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [scholarshipsData, uniData] = await Promise.all([
        api.get('/api/scholarships', { include_all: 'true' }),
        api.get('/api/universities')
      ]);
      setScholarships(scholarshipsData);
      setUniversities(uniData);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => { setFormData(emptyForm); setEditing(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = {
        name:                  formData.name,
        funding_type:          formData.funding_type,
        description:           formData.description || null,
        eligibility:           formData.eligibility || null,
        additional_requirements: formData.additional_requirements || null,
        study_level:           formData.study_level || 'Any',
        intake:                formData.intake || 'Any',
        application_type:      formData.application_type,
        is_stackable:          formData.is_stackable,
        merit_based:           formData.merit_based,
        need_based:            formData.need_based,
        is_featured:           formData.is_featured,
        is_active:             formData.is_active
      };

      if (formData.university_id)      payload.university_id      = parseInt(formData.university_id);
      if (formData.amount)             payload.amount             = parseInt(formData.amount);
      if (formData.funding_percentage) payload.funding_percentage = parseFloat(formData.funding_percentage);
      if (formData.min_gpa_required)   payload.min_gpa_required   = parseFloat(formData.min_gpa_required);
      if (formData.gpa_tolerance)      payload.gpa_tolerance      = parseFloat(formData.gpa_tolerance);
      if (formData.min_english_score)  payload.min_english_score  = parseFloat(formData.min_english_score);
      if (formData.english_test_type)  payload.english_test_type  = formData.english_test_type;
      if (formData.deadline)           payload.deadline            = formData.deadline;

      if (editing) {
        await api.put('/api/scholarships', { id: editing.id, ...payload });
      } else {
        await api.post('/api/scholarships', payload);
      }

      setShowModal(false);
      resetForm();
      fetchData();
    } catch (err) {
      console.error('Failed to save scholarship:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (s: any) => {
    setEditing(s);
    setFormData({
      name:                    s.name || '',
      university_id:           s.university_id?.toString() || '',
      funding_type:            s.funding_type || '',
      amount:                  s.amount?.toString() || '',
      funding_percentage:      s.funding_percentage?.toString() || '',
      description:             s.description || '',
      eligibility:             s.eligibility || '',
      min_gpa_required:        s.min_gpa_required?.toString() || '',
      gpa_tolerance:           s.gpa_tolerance?.toString() || '0.2',
      min_english_score:       s.min_english_score?.toString() || '',
      english_test_type:       s.english_test_type || '',
      study_level:             s.study_level || 'Any',
      intake:                  s.intake || 'Any',
      application_type:        s.application_type || 'manual',
      additional_requirements: s.additional_requirements || '',
      is_stackable:            s.is_stackable ?? false,
      merit_based:             s.merit_based ?? true,
      need_based:              s.need_based ?? false,
      is_featured:             s.is_featured ?? false,
      is_active:               s.is_active ?? true,
      deadline:                s.deadline ? s.deadline.split('T')[0] : ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this scholarship?')) return;
    try { await api.delete('/api/scholarships', { id }); fetchData(); }
    catch (err) { console.error(err); }
  };

  const toggleActive = async (s: any) => {
    try {
      await api.put('/api/scholarships', { id: s.id, is_active: !s.is_active });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const toggleFeatured = async (s: any) => {
    try {
      await api.put('/api/scholarships', { id: s.id, is_featured: !s.is_featured });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const filtered = scholarships.filter(s => {
    const matchSearch = s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.universities?.name?.toLowerCase().includes(search.toLowerCase());
    const matchActive =
      filterActive === 'all'      ? true :
      filterActive === 'active'   ? s.is_active :
                                    !s.is_active;
    return matchSearch && matchActive;
  });

  const getFundingColour = (type: string) => {
    const m: Record<string, string> = {
      Full: 'bg-green-500/20 text-green-400 border-green-500/30',
      Partial: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      Tuition: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    };
    return m[type] ?? 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  };

  const field = (label: string, node: React.ReactNode, hint?: string) => (
    <div>
      <label className="block text-sm font-medium text-slate-400 mb-1">{label}</label>
      {node}
      {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
    </div>
  );

  const input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
      {...props}
      className="w-full px-4 py-2.5 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:border-sky-500 outline-none text-sm"
    />
  );

  const select = (props: React.SelectHTMLAttributes<HTMLSelectElement>, children: React.ReactNode) => (
    <select
      {...props}
      className="w-full px-4 py-2.5 rounded-xl bg-slate-700/50 border border-slate-600 text-white focus:border-sky-500 outline-none text-sm"
    >
      {children}
    </select>
  );

  const toggle = (label: string, key: string, colour = 'sky') => (
    <label className="flex items-center gap-2 cursor-pointer">
      <button
        type="button"
        onClick={() => setFormData((f: any) => ({ ...f, [key]: !f[key] }))}
        className={`w-10 h-5 rounded-full transition-colors ${formData[key] ? `bg-${colour}-500` : 'bg-slate-600'} relative`}
      >
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${formData[key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
      <span className="text-sm text-slate-300">{label}</span>
    </label>
  );

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><LoadingSpinner size="lg" /></div>;

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Scholarships</h1>
          <p className="text-slate-400">
            {scholarships.filter(s => s.is_active).length} active ·{' '}
            {scholarships.filter(s => s.is_featured).length} featured ·{' '}
            {scholarships.length} total
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text" placeholder="Search..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:border-sky-500 outline-none w-56 text-sm"
            />
          </div>
          <select
            value={filterActive}
            onChange={e => setFilterActive(e.target.value as any)}
            className="px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-300 focus:border-sky-500 outline-none text-sm"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-medium transition-all shadow-lg shadow-amber-500/25 text-sm"
          >
            <Plus className="w-4 h-4" /> Add Scholarship
          </button>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((s, i) => {
          const days = getDaysRemaining(s.deadline);
          const expired = days !== null && days < 0;
          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`p-5 rounded-2xl border transition-all group ${
                s.is_active
                  ? 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                  : 'bg-slate-900/30 border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                    <Award className="w-5 h-5 text-amber-400" />
                  </div>
                  {s.is_featured && <Star className="w-4 h-4 text-amber-400" />}
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getFundingColour(s.funding_type)}`}>
                  {s.funding_type}
                </span>
              </div>

              <h3 className="text-base font-semibold text-white mb-1">{s.name}</h3>
              {s.universities && (
                <p className="text-slate-400 text-xs mb-3">
                  {s.universities.name} · {s.universities.country}
                </p>
              )}

              <div className="flex flex-wrap gap-1.5 mb-3">
                {s.amount && (
                  <span className="flex items-center gap-1 text-xs text-slate-300 bg-slate-700/50 px-2 py-1 rounded-lg">
                    <DollarSign className="w-3 h-3 text-green-400" />${s.amount.toLocaleString()}
                  </span>
                )}
                {s.funding_percentage && (
                  <span className="flex items-center gap-1 text-xs text-slate-300 bg-slate-700/50 px-2 py-1 rounded-lg">
                    <TrendingUp className="w-3 h-3 text-green-400" />{s.funding_percentage}%
                  </span>
                )}
                {s.min_gpa_required && (
                  <span className="flex items-center gap-1 text-xs text-slate-300 bg-slate-700/50 px-2 py-1 rounded-lg">
                    <GraduationCap className="w-3 h-3 text-blue-400" />GPA {s.min_gpa_required}+
                  </span>
                )}
                {s.study_level && s.study_level !== 'Any' && (
                  <span className="flex items-center gap-1 text-xs text-slate-300 bg-slate-700/50 px-2 py-1 rounded-lg">
                    <BookOpen className="w-3 h-3 text-violet-400" />{s.study_level}
                  </span>
                )}
                {s.application_type === 'auto' && (
                  <span className="flex items-center gap-1 text-xs text-sky-300 bg-sky-500/10 px-2 py-1 rounded-lg">
                    <Zap className="w-3 h-3" />Auto
                  </span>
                )}
                {s.is_stackable && (
                  <span className="flex items-center gap-1 text-xs text-slate-300 bg-slate-700/50 px-2 py-1 rounded-lg">
                    <Layers className="w-3 h-3 text-sky-400" />Stackable
                  </span>
                )}
                {s.merit_based && <span className="text-xs text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded-lg">Merit</span>}
                {s.need_based  && <span className="text-xs text-rose-300 bg-rose-500/10 px-2 py-1 rounded-lg">Need</span>}
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg ${
                  expired ? 'text-slate-500 bg-slate-700/30' : 'text-slate-300 bg-slate-700/50'
                }`}>
                  <Clock className="w-3 h-3" />
                  {getDeadlineLabel(s.deadline)}
                </span>
                {s.intake && s.intake !== 'Any' && (
                  <span className="text-xs text-slate-400 bg-slate-700/30 px-2 py-1 rounded-lg">
                    {s.intake}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleActive(s)}
                    title={s.is_active ? 'Deactivate' : 'Activate'}
                    className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                  >
                    {s.is_active ? <ToggleRight className="w-4 h-4 text-green-400" /> : <ToggleLeft className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => toggleFeatured(s)}
                    title={s.is_featured ? 'Unfeature' : 'Feature'}
                    className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-amber-400 transition-colors"
                  >
                    <Star className={`w-4 h-4 ${s.is_featured ? 'text-amber-400' : ''}`} />
                  </button>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(s)} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-sky-400 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 rounded-2xl bg-slate-800/30 border border-slate-700">
          <Award className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No scholarships found</p>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-800 border border-slate-700 p-6"
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-700 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-bold text-white mb-6">
                {editing ? 'Edit Scholarship' : 'Add Scholarship'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Basic info */}
                <div className="grid grid-cols-2 gap-4">
                  {field('Scholarship Name *',
                    input({ value: formData.name, onChange: e => setFormData((f: any) => ({ ...f, name: e.target.value })), placeholder: 'e.g. Global Merit Award', required: true })
                  )}
                  {field('University',
                    select({ value: formData.university_id, onChange: e => setFormData((f: any) => ({ ...f, university_id: e.target.value })) },
                      <>
                        <option value="">General / Multiple Universities</option>
                        {universities.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                      </>
                    )
                  )}
                </div>

                {/* Funding */}
                <div className="rounded-xl border border-slate-700 p-4 space-y-4">
                  <p className="text-sm font-semibold text-slate-300">Funding</p>
                  <div className="grid grid-cols-3 gap-4">
                    {field('Type *',
                      select({ value: formData.funding_type, onChange: e => setFormData((f: any) => ({ ...f, funding_type: e.target.value })), required: true },
                        <>
                          <option value="">Select</option>
                          {FUNDING_TYPES.map(t => <option key={t}>{t}</option>)}
                        </>
                      )
                    )}
                    {field('Amount (USD)', input({ type: 'number', value: formData.amount, onChange: e => setFormData((f: any) => ({ ...f, amount: e.target.value })), placeholder: '50000' }), 'Fixed dollar amount')}
                    {field('Percentage (%)', input({ type: 'number', step: '1', min: '0', max: '100', value: formData.funding_percentage, onChange: e => setFormData((f: any) => ({ ...f, funding_percentage: e.target.value })), placeholder: '50' }), '% of tuition covered')}
                  </div>
                </div>

                {/* Eligibility */}
                <div className="rounded-xl border border-slate-700 p-4 space-y-4">
                  <p className="text-sm font-semibold text-slate-300">Eligibility Requirements</p>
                  <div className="grid grid-cols-2 gap-4">
                    {field('Study Level', select({ value: formData.study_level, onChange: e => setFormData((f: any) => ({ ...f, study_level: e.target.value })) },
                      STUDY_LEVELS.map(l => <option key={l}>{l}</option>)
                    ))}
                    {field('Min GPA', input({ type: 'number', step: '0.1', min: '0', max: '4', value: formData.min_gpa_required, onChange: e => setFormData((f: any) => ({ ...f, min_gpa_required: e.target.value })), placeholder: '3.5' }))}
                    {field('GPA Tolerance', input({ type: 'number', step: '0.05', min: '0', max: '1', value: formData.gpa_tolerance, onChange: e => setFormData((f: any) => ({ ...f, gpa_tolerance: e.target.value })), placeholder: '0.2' }), 'How much below min GPA is still "conditional"')}
                    {field('English Test', select({ value: formData.english_test_type, onChange: e => setFormData((f: any) => ({ ...f, english_test_type: e.target.value })) },
                      <>
                        <option value="">None required</option>
                        <option>IELTS</option><option>TOEFL</option><option>Duolingo</option>
                      </>
                    ))}
                    {field('Min English Score', input({ type: 'number', step: '0.5', value: formData.min_english_score, onChange: e => setFormData((f: any) => ({ ...f, min_english_score: e.target.value })), placeholder: '6.5' }))}
                  </div>
                </div>

                {/* Scheduling */}
                <div className="grid grid-cols-3 gap-4">
                  {field('Intake', select({ value: formData.intake, onChange: e => setFormData((f: any) => ({ ...f, intake: e.target.value })) },
                    INTAKES.map(i => <option key={i}>{i}</option>)
                  ))}
                  {field('Application Type',
                    select({ value: formData.application_type, onChange: e => setFormData((f: any) => ({ ...f, application_type: e.target.value })) },
                      <>
                        <option value="manual">Manual</option>
                        <option value="auto">Auto (with university application)</option>
                      </>
                    )
                  )}
                  {field('Deadline',
                    input({ type: 'date', value: formData.deadline, onChange: e => setFormData((f: any) => ({ ...f, deadline: e.target.value })) })
                  )}
                </div>

                {/* Descriptions */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData((f: any) => ({ ...f, description: e.target.value }))}
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:border-sky-500 outline-none resize-none text-sm"
                    placeholder="Brief description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Eligibility Criteria (text)</label>
                  <textarea
                    value={formData.eligibility}
                    onChange={e => setFormData((f: any) => ({ ...f, eligibility: e.target.value }))}
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:border-sky-500 outline-none resize-none text-sm"
                    placeholder="Who can apply..."
                  />
                </div>

                {formData.application_type === 'manual' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Additional Requirements (manual only)</label>
                    <textarea
                      value={formData.additional_requirements}
                      onChange={e => setFormData((f: any) => ({ ...f, additional_requirements: e.target.value }))}
                      rows={2}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:border-sky-500 outline-none resize-none text-sm"
                      placeholder="Documents needed, separate application link..."
                    />
                  </div>
                )}

                {/* Flags */}
                <div className="rounded-xl border border-slate-700 p-4">
                  <p className="text-sm font-semibold text-slate-300 mb-3">Options</p>
                  <div className="grid grid-cols-2 gap-3">
                    {toggle('Stackable (can combine with others)', 'is_stackable')}
                    {toggle('Merit-based', 'merit_based', 'indigo')}
                    {toggle('Need-based', 'need_based', 'rose')}
                    {toggle('Featured (highlighted to students)', 'is_featured', 'amber')}
                    {toggle('Active (visible to students)', 'is_active', 'green')}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button" onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit" disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-medium transition-all disabled:opacity-50 text-sm"
                  >
                    {saving ? <LoadingSpinner size="sm" /> : <Save className="w-4 h-4" />}
                    {editing ? 'Update' : 'Add'} Scholarship
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminScholarships;
