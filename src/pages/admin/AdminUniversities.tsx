import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Plus, Search, MapPin, Star, Edit2, Trash2, X, Save, Building } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { api } from '../../lib/api';

const AdminUniversities: React.FC = () => {
  const [universities, setUniversities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    description: '',
    ranking: '',
    logo_url: '',
    tuition_min: '',
    tuition_max: '',
    acceptance_rate: ''
  });

  const countries = ['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'Netherlands', 'France', 'Ireland', 'New Zealand', 'Singapore'];

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    try {
      const data = await api.get('/api/universities');
      setUniversities(data);
    } catch (err) {
      console.error('Failed to fetch universities:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      country: '',
      description: '',
      ranking: '',
      logo_url: '',
      tuition_min: '',
      tuition_max: '',
      acceptance_rate: ''
    });
    setEditing(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const payload: any = {
        name: formData.name,
        country: formData.country,
        description: formData.description,
        logo_url: formData.logo_url || null
      };
      if (formData.ranking) payload.ranking = parseInt(formData.ranking);
      if (formData.tuition_min) payload.tuition_min = parseInt(formData.tuition_min);
      if (formData.tuition_max) payload.tuition_max = parseInt(formData.tuition_max);
      if (formData.acceptance_rate) payload.acceptance_rate = parseFloat(formData.acceptance_rate);

      if (editing) {
        await api.put('/api/universities', { id: editing.id, ...payload });
      } else {
        await api.post('/api/universities', payload);
      }

      setShowModal(false);
      resetForm();
      fetchUniversities();
    } catch (err) {
      console.error('Failed to save university:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (uni: any) => {
    setEditing(uni);
    setFormData({
      name: uni.name || '',
      country: uni.country || '',
      description: uni.description || '',
      ranking: uni.ranking?.toString() || '',
      logo_url: uni.logo_url || '',
      tuition_min: uni.tuition_min?.toString() || '',
      tuition_max: uni.tuition_max?.toString() || '',
      acceptance_rate: uni.acceptance_rate?.toString() || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this university? This will also delete all associated programs.')) return;
    try {
      await api.delete('/api/universities', { id });
      fetchUniversities();
    } catch (err) {
      console.error('Failed to delete university:', err);
    }
  };

  const filteredUniversities = universities.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.country?.toLowerCase().includes(search.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold text-white mb-2">Universities</h1>
          <p className="text-slate-400">Manage partner universities ({universities.length} total)</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:border-sky-500 outline-none w-full md:w-64"
            />
          </div>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-medium transition-all shadow-lg shadow-sky-500/25"
          >
            <Plus className="w-5 h-5" />
            Add University
          </button>
        </div>
      </motion.div>

      {/* Universities Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredUniversities.map((uni, i) => (
          <motion.div
            key={uni.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition-all group"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-14 rounded-xl bg-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                {uni.logo_url ? (
                  <img src={uni.logo_url} alt={uni.name} className="w-full h-full object-cover" />
                ) : (
                  <Building className="w-7 h-7 text-slate-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-white truncate">{uni.name}</h3>
                <div className="flex items-center gap-1 text-slate-400 text-sm">
                  <MapPin className="w-4 h-4" />
                  {uni.country}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {uni.ranking && (
                <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-medium">
                  <Star className="w-3 h-3 fill-current" />
                  Rank #{uni.ranking}
                </span>
              )}
              {uni.acceptance_rate && (
                <span className="px-2 py-1 rounded-lg bg-slate-700/50 text-slate-300 text-xs">
                  {uni.acceptance_rate}% acceptance
                </span>
              )}
            </div>

            <p className="text-slate-400 text-sm line-clamp-2 mb-4">{uni.description || 'No description'}</p>

            <div className="flex items-center justify-between pt-3 border-t border-slate-700">
              <div className="text-sm">
                <span className="text-slate-500">{uni.programs?.length || 0} programs</span>
                {uni.tuition_min && (
                  <span className="text-slate-400 ml-2">
                    ${uni.tuition_min.toLocaleString()}{uni.tuition_max ? ` - $${uni.tuition_max.toLocaleString()}` : ''}
                  </span>
                )}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(uni)}
                  className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-sky-400 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(uni.id)}
                  className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredUniversities.length === 0 && (
        <div className="text-center py-12 rounded-2xl bg-slate-800/30 border border-slate-700">
          <GraduationCap className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No universities found</p>
        </div>
      )}

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
                {editing ? 'Edit University' : 'Add University'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">University Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:border-sky-500 outline-none"
                    placeholder="e.g., Harvard University"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Country *</label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white focus:border-sky-500 outline-none"
                    required
                  >
                    <option value="">Select country</option>
                    {countries.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:border-sky-500 outline-none resize-none"
                    placeholder="Brief description of the university..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">World Ranking</label>
                    <input
                      type="number"
                      value={formData.ranking}
                      onChange={(e) => setFormData({ ...formData, ranking: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:border-sky-500 outline-none"
                      placeholder="e.g., 5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Acceptance Rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.acceptance_rate}
                      onChange={(e) => setFormData({ ...formData, acceptance_rate: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:border-sky-500 outline-none"
                      placeholder="e.g., 15"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Min Tuition (USD/year)</label>
                    <input
                      type="number"
                      value={formData.tuition_min}
                      onChange={(e) => setFormData({ ...formData, tuition_min: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:border-sky-500 outline-none"
                      placeholder="e.g., 30000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Max Tuition (USD/year)</label>
                    <input
                      type="number"
                      value={formData.tuition_max}
                      onChange={(e) => setFormData({ ...formData, tuition_max: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:border-sky-500 outline-none"
                      placeholder="e.g., 50000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Logo URL</label>
                  <input
                    type="url"
                    value={formData.logo_url}
                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:border-sky-500 outline-none"
                    placeholder="https://example.com/logo.png"
                  />
                </div>

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
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-medium transition-all disabled:opacity-50"
                  >
                    {saving ? <LoadingSpinner size="sm" /> : <Save className="w-5 h-5" />}
                    {editing ? 'Update' : 'Add'} University
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

export default AdminUniversities;
