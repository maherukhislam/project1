import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, X, Save, Globe, Users, DollarSign, GraduationCap, Building } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { api } from '../../lib/api';

interface Country {
  id: number;
  name: string;
  description: string;
  flag_emoji: string;
  image_url: string;
  university_count: number;
  avg_tuition: number;
  intl_students: string;
  popular_cities: string;
  highlights: string;
}

const AdminDestinations: React.FC = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Country | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    flag_emoji: '',
    image_url: '',
    university_count: '',
    avg_tuition: '',
    intl_students: '',
    popular_cities: '',
    highlights: ''
  });

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const data = await api.get('/api/countries');
      setCountries(data);
    } catch (err) {
      console.error('Failed to fetch countries:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      flag_emoji: '',
      image_url: '',
      university_count: '',
      avg_tuition: '',
      intl_students: '',
      popular_cities: '',
      highlights: ''
    });
    setEditing(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const payload: any = {
        name: formData.name,
        description: formData.description,
        flag_emoji: formData.flag_emoji || null,
        image_url: formData.image_url || null,
        intl_students: formData.intl_students || null,
        popular_cities: formData.popular_cities || null,
        highlights: formData.highlights || null
      };
      if (formData.university_count) payload.university_count = parseInt(formData.university_count);
      if (formData.avg_tuition) payload.avg_tuition = parseInt(formData.avg_tuition);

      if (editing) {
        await api.put('/api/countries', { id: editing.id, ...payload });
      } else {
        await api.post('/api/countries', payload);
      }

      setShowModal(false);
      resetForm();
      fetchCountries();
    } catch (err) {
      console.error('Failed to save destination:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (country: Country) => {
    setEditing(country);
    setFormData({
      name: country.name || '',
      description: country.description || '',
      flag_emoji: country.flag_emoji || '',
      image_url: country.image_url || '',
      university_count: country.university_count?.toString() || '',
      avg_tuition: country.avg_tuition?.toString() || '',
      intl_students: country.intl_students || '',
      popular_cities: country.popular_cities || '',
      highlights: country.highlights || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this destination? This may affect universities associated with this country.')) return;
    try {
      await api.delete('/api/countries', { id });
      fetchCountries();
    } catch (err) {
      console.error('Failed to delete destination:', err);
    }
  };

  const filteredCountries = countries.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
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
          <h1 className="text-3xl font-bold text-white mb-2">Destinations</h1>
          <p className="text-slate-400">Manage study destinations ({countries.length} countries)</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:border-teal-500 outline-none w-full md:w-64"
            />
          </div>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-medium transition-all shadow-lg shadow-teal-500/25"
          >
            <Plus className="w-5 h-5" />
            Add Destination
          </button>
        </div>
      </motion.div>

      {/* Destinations Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCountries.map((country, i) => (
          <motion.div
            key={country.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition-all group overflow-hidden"
          >
            {/* Image header */}
            <div className="h-40 bg-gradient-to-br from-teal-500/20 to-emerald-500/20 relative">
              {country.image_url ? (
                <img src={country.image_url} alt={country.name} className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-6xl">{country.flag_emoji || '🌍'}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
              <div className="absolute bottom-3 left-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>{country.flag_emoji}</span>
                  {country.name}
                </h3>
              </div>
            </div>

            <div className="p-5">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <GraduationCap className="w-4 h-4 text-teal-400" />
                  <span className="text-slate-300">{country.university_count || 0} universities</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span className="text-slate-300">${country.avg_tuition?.toLocaleString() || 'N/A'}/yr</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-sky-400" />
                  <span className="text-slate-300">{country.intl_students || 'N/A'} students</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Building className="w-4 h-4 text-amber-400" />
                  <span className="text-slate-300 truncate">{country.popular_cities?.split(',')[0] || 'N/A'}</span>
                </div>
              </div>

              <p className="text-slate-400 text-sm line-clamp-2 mb-4">{country.description || 'No description'}</p>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                <div className="text-xs text-slate-500">
                  {country.highlights?.split(',').length || 0} highlights
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(country)}
                    className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-teal-400 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(country.id)}
                    className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredCountries.length === 0 && (
        <div className="text-center py-12 rounded-2xl bg-slate-800/30 border border-slate-700">
          <Globe className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No destinations found</p>
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
                {editing ? 'Edit Destination' : 'Add Destination'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Country Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:border-teal-500 outline-none"
                    placeholder="e.g., United States"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Flag Emoji</label>
                    <input
                      type="text"
                      value={formData.flag_emoji}
                      onChange={(e) => setFormData({ ...formData, flag_emoji: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:border-teal-500 outline-none"
                      placeholder="e.g., US or 🇺🇸"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">University Count</label>
                    <input
                      type="number"
                      value={formData.university_count}
                      onChange={(e) => setFormData({ ...formData, university_count: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:border-teal-500 outline-none"
                      placeholder="e.g., 500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:border-teal-500 outline-none resize-none"
                    placeholder="Brief description of studying in this country..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Avg. Tuition (USD/year)</label>
                    <input
                      type="number"
                      value={formData.avg_tuition}
                      onChange={(e) => setFormData({ ...formData, avg_tuition: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:border-teal-500 outline-none"
                      placeholder="e.g., 35000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Int'l Students</label>
                    <input
                      type="text"
                      value={formData.intl_students}
                      onChange={(e) => setFormData({ ...formData, intl_students: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:border-teal-500 outline-none"
                      placeholder="e.g., 1,000,000+"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Popular Cities</label>
                  <input
                    type="text"
                    value={formData.popular_cities}
                    onChange={(e) => setFormData({ ...formData, popular_cities: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:border-teal-500 outline-none"
                    placeholder="e.g., New York, Boston, Chicago"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Key Highlights</label>
                  <textarea
                    value={formData.highlights}
                    onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:border-teal-500 outline-none resize-none"
                    placeholder="Comma-separated highlights, e.g., Top universities, Diverse campuses, Strong research"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Image URL</label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:border-teal-500 outline-none"
                    placeholder="https://example.com/country-image.jpg"
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
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-medium transition-all disabled:opacity-50"
                  >
                    {saving ? <LoadingSpinner size="sm" /> : <Save className="w-5 h-5" />}
                    {editing ? 'Update' : 'Add'} Destination
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

export default AdminDestinations;
