import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Plus, Search, Edit2, Trash2, X, Save, Award } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { api } from '../../lib/api';

const AdminPrograms: React.FC = () => {
  const [programs, setPrograms] = useState<any[]>([]);
  const [universities, setUniversities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [universityFilter, setUniversityFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    university_id: '',
    name: '',
    degree_level: '',
    duration: '',
    tuition_fee: '',
    min_gpa_required: '',
    min_english_score: '',
    intake_periods: '',
    scholarship_available: false
  });

  const degreeLevels = ['Bachelor', 'Master', 'PhD'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [programsData, uniData] = await Promise.all([
        api.get('/api/programs'),
        api.get('/api/universities')
      ]);
      setPrograms(programsData);
      setUniversities(uniData);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      university_id: '',
      name: '',
      degree_level: '',
      duration: '',
      tuition_fee: '',
      min_gpa_required: '',
      min_english_score: '',
      intake_periods: '',
      scholarship_available: false
    });
    setEditing(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const payload: any = {
        university_id: parseInt(formData.university_id),
        name: formData.name,
        degree_level: formData.degree_level,
        duration: formData.duration,
        intake_periods: formData.intake_periods,
        scholarship_available: formData.scholarship_available
      };
      if (formData.tuition_fee) payload.tuition_fee = parseInt(formData.tuition_fee);
      if (formData.min_gpa_required) payload.min_gpa_required = parseFloat(formData.min_gpa_required);
      if (formData.min_english_score) payload.min_english_score = parseFloat(formData.min_english_score);

      if (editing) {
        await api.put('/api/programs', { id: editing.id, ...payload });
      } else {
        await api.post('/api/programs', payload);
      }

      setShowModal(false);
      resetForm();
      fetchData();
    } catch (err) {
      console.error('Failed to save program:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (prog: any) => {
    setEditing(prog);
    setFormData({
      university_id: prog.university_id?.toString() || '',
      name: prog.name || '',
      degree_level: prog.degree_level || '',
      duration: prog.duration || '',
      tuition_fee: prog.tuition_fee?.toString() || '',
      min_gpa_required: prog.min_gpa_required?.toString() || '',
      min_english_score: prog.min_english_score?.toString() || '',
      intake_periods: prog.intake_periods || '',
      scholarship_available: prog.scholarship_available || false
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this program?')) return;
    try {
      await api.delete('/api/programs', { id });
      fetchData();
    } catch (err) {
      console.error('Failed to delete program:', err);
    }
  };

  const filteredPrograms = programs.filter(p => {
    const matchesSearch = !search || 
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.universities?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesUni = !universityFilter || p.university_id?.toString() === universityFilter;
    return matchesSearch && matchesUni;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Programs</h1>
          <p className="text-slate-400">Manage university programs ({programs.length} total)</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white font-medium transition-all shadow-lg shadow-cyan-500/25"
        >
          <Plus className="w-5 h-5" />
          Add Program
        </button>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search programs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:border-sky-500 outline-none"
          />
        </div>
        <select
          value={universityFilter}
          onChange={(e) => setUniversityFilter(e.target.value)}
          className="px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:border-sky-500 outline-none min-w-[200px]"
        >
          <option value="">All Universities</option>
          {universities.map(u => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
      </div>

      {/* Programs Table */}
      <div className="rounded-2xl bg-slate-800/50 border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left px-6 py-4 text-slate-400 font-medium">Program</th>
                <th className="text-left px-6 py-4 text-slate-400 font-medium hidden md:table-cell">University</th>
                <th className="text-left px-6 py-4 text-slate-400 font-medium hidden lg:table-cell">Level</th>
                <th className="text-left px-6 py-4 text-slate-400 font-medium hidden lg:table-cell">Tuition</th>
                <th className="text-left px-6 py-4 text-slate-400 font-medium hidden xl:table-cell">Requirements</th>
                <th className="text-left px-6 py-4 text-slate-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPrograms.map((prog) => (
                <tr key={prog.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-teal-500/20 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{prog.name}</p>
                        <p className="text-slate-400 text-sm md:hidden">{prog.universities?.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-300 hidden md:table-cell">
                    {prog.universities?.name}
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <span className="px-2 py-1 rounded-lg bg-slate-700/50 text-slate-300 text-sm">
                      {prog.degree_level}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-300 hidden lg:table-cell">
                    {prog.tuition_fee ? `$${prog.tuition_fee.toLocaleString()}` : '-'}
                  </td>
                  <td className="px-6 py-4 hidden xl:table-cell">
                    <div className="flex gap-2">
                      {prog.min_gpa_required && (
                        <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-xs">
                          GPA {prog.min_gpa_required}+
                        </span>
                      )}
                      {prog.min_english_score && (
                        <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs">
                          IELTS {prog.min_english_score}+
                        </span>
                      )}
                      {prog.scholarship_available && (
                        <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-400 text-xs">
                          <Award className="w-3 h-3 inline" /> Scholarship
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(prog)}
                        className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-sky-400 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(prog.id)}
                        className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredPrograms.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No programs found</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-800 border border-slate-700 p-6"
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-700 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-bold text-white mb-6">
                {editing ? 'Edit Program' : 'Add Program'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">University *</label>
                  <select
                    value={formData.university_id}
                    onChange={(e) => setFormData({ ...formData, university_id: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white focus:border-sky-500 outline-none"
                    required
                  >
                    <option value="">Select university</option>
                    {universities.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Program Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:border-sky-500 outline-none"
                    placeholder="e.g., Computer Science"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Degree Level *</label>
                    <select
                      value={formData.degree_level}
                      onChange={(e) => setFormData({ ...formData, degree_level: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white focus:border-sky-500 outline-none"
                      required
                    >
                      <option value="">Select level</option>
                      {degreeLevels.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Duration</label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:border-sky-500 outline-none"
                      placeholder="e.g., 2 years"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Tuition Fee (USD/year)</label>
                  <input
                    type="number"
                    value={formData.tuition_fee}
                    onChange={(e) => setFormData({ ...formData, tuition_fee: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:border-sky-500 outline-none"
                    placeholder="e.g., 45000"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Min GPA Required</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.min_gpa_required}
                      onChange={(e) => setFormData({ ...formData, min_gpa_required: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:border-sky-500 outline-none"
                      placeholder="e.g., 3.0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Min English Score</label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.min_english_score}
                      onChange={(e) => setFormData({ ...formData, min_english_score: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:border-sky-500 outline-none"
                      placeholder="e.g., 6.5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Intake Periods</label>
                  <input
                    type="text"
                    value={formData.intake_periods}
                    onChange={(e) => setFormData({ ...formData, intake_periods: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:border-sky-500 outline-none"
                    placeholder="e.g., Fall, Spring"
                  />
                </div>

                <label className="flex items-center gap-3 p-4 rounded-xl bg-slate-700/30 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.scholarship_available}
                    onChange={(e) => setFormData({ ...formData, scholarship_available: e.target.checked })}
                    className="w-5 h-5 rounded border-slate-600 text-sky-500 focus:ring-sky-500"
                  />
                  <div>
                    <p className="text-white font-medium">Scholarship Available</p>
                    <p className="text-slate-400 text-sm">This program offers scholarship opportunities</p>
                  </div>
                </label>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white font-medium transition-all disabled:opacity-50"
                  >
                    {saving ? <LoadingSpinner size="sm" /> : <Save className="w-5 h-5" />}
                    {editing ? 'Update' : 'Add'} Program
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

export default AdminPrograms;
