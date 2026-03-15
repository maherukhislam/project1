import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Plus, Search, Edit2, Trash2, X, Save, Calendar, DollarSign, GraduationCap } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { api } from '../../lib/api';

const AdminScholarships: React.FC = () => {
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [universities, setUniversities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    university_id: '',
    funding_type: '',
    amount: '',
    description: '',
    eligibility: '',
    min_gpa_required: '',
    deadline: ''
  });

  const fundingTypes = ['Full', 'Partial', 'Tuition'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [scholarshipsData, uniData] = await Promise.all([
        api.get('/api/scholarships'),
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

  const resetForm = () => {
    setFormData({
      name: '',
      university_id: '',
      funding_type: '',
      amount: '',
      description: '',
      eligibility: '',
      min_gpa_required: '',
      deadline: ''
    });
    setEditing(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const payload: any = {
        name: formData.name,
        funding_type: formData.funding_type,
        description: formData.description,
        eligibility: formData.eligibility
      };
      if (formData.university_id) payload.university_id = parseInt(formData.university_id);
      if (formData.amount) payload.amount = parseInt(formData.amount);
      if (formData.min_gpa_required) payload.min_gpa_required = parseFloat(formData.min_gpa_required);
      if (formData.deadline) payload.deadline = formData.deadline;

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

  const handleEdit = (scholarship: any) => {
    setEditing(scholarship);
    setFormData({
      name: scholarship.name || '',
      university_id: scholarship.university_id?.toString() || '',
      funding_type: scholarship.funding_type || '',
      amount: scholarship.amount?.toString() || '',
      description: scholarship.description || '',
      eligibility: scholarship.eligibility || '',
      min_gpa_required: scholarship.min_gpa_required?.toString() || '',
      deadline: scholarship.deadline ? scholarship.deadline.split('T')[0] : ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this scholarship?')) return;
    try {
      await api.delete('/api/scholarships', { id });
      fetchData();
    } catch (err) {
      console.error('Failed to delete scholarship:', err);
    }
  };

  const filteredScholarships = scholarships.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.universities?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const getFundingColor = (type: string) => {
    switch (type) {
      case 'Full': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Partial': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Tuition': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'No deadline';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

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
          <h1 className="text-3xl font-bold text-white mb-2">Scholarships</h1>
          <p className="text-slate-400">Manage scholarship opportunities ({scholarships.length} total)</p>
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
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-medium transition-all shadow-lg shadow-amber-500/25"
          >
            <Plus className="w-5 h-5" />
            Add Scholarship
          </button>
        </div>
      </motion.div>

      {/* Scholarships Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredScholarships.map((scholarship, i) => (
          <motion.div
            key={scholarship.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                <Award className="w-6 h-6 text-amber-400" />
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getFundingColor(scholarship.funding_type)}`}>
                {scholarship.funding_type} Funding
              </span>
            </div>

            <h3 className="text-lg font-semibold text-white mb-2">{scholarship.name}</h3>
            
            {scholarship.universities && (
              <p className="text-slate-400 text-sm mb-3">
                {scholarship.universities.name} • {scholarship.universities.country}
              </p>
            )}

            <div className="space-y-2 mb-4">
              {scholarship.amount && (
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  Up to ${scholarship.amount.toLocaleString()}
                </div>
              )}
              {scholarship.min_gpa_required && (
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <GraduationCap className="w-4 h-4 text-blue-400" />
                  Min GPA: {scholarship.min_gpa_required}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Calendar className="w-4 h-4 text-red-400" />
                Deadline: {formatDate(scholarship.deadline)}
              </div>
            </div>

            <p className="text-slate-400 text-sm line-clamp-2 mb-4">
              {scholarship.eligibility || scholarship.description || 'No description'}
            </p>

            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleEdit(scholarship)}
                className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-sky-400 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(scholarship.id)}
                className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredScholarships.length === 0 && (
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
                {editing ? 'Edit Scholarship' : 'Add Scholarship'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Scholarship Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:border-sky-500 outline-none"
                    placeholder="e.g., Merit Scholarship"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">University (Optional)</label>
                  <select
                    value={formData.university_id}
                    onChange={(e) => setFormData({ ...formData, university_id: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white focus:border-sky-500 outline-none"
                  >
                    <option value="">General / Multiple Universities</option>
                    {universities.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Funding Type *</label>
                    <select
                      value={formData.funding_type}
                      onChange={(e) => setFormData({ ...formData, funding_type: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white focus:border-sky-500 outline-none"
                      required
                    >
                      <option value="">Select type</option>
                      {fundingTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Amount (USD)</label>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:border-sky-500 outline-none"
                      placeholder="e.g., 50000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:border-sky-500 outline-none resize-none"
                    placeholder="Brief description of the scholarship..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Eligibility Criteria</label>
                  <textarea
                    value={formData.eligibility}
                    onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:border-sky-500 outline-none resize-none"
                    placeholder="Who can apply for this scholarship..."
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
                      placeholder="e.g., 3.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Application Deadline</label>
                    <input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white focus:border-sky-500 outline-none"
                    />
                  </div>
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
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-medium transition-all disabled:opacity-50"
                  >
                    {saving ? <LoadingSpinner size="sm" /> : <Save className="w-5 h-5" />}
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
