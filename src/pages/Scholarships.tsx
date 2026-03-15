import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, Award, Calendar, DollarSign, GraduationCap, X, ExternalLink } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { api } from '../lib/api';

const Scholarships: React.FC = () => {
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    country: searchParams.get('country') || '',
    fundingType: searchParams.get('funding') || '',
    minGpa: searchParams.get('minGpa') || ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params: any = {};
        if (filters.country) params.country = filters.country;
        if (filters.fundingType) params.funding_type = filters.fundingType;
        if (filters.minGpa) params.min_gpa = filters.minGpa;

        const [scholarshipData, countryData] = await Promise.all([
          api.get('/api/scholarships', params),
          api.get('/api/countries')
        ]);
        setScholarships(scholarshipData);
        setCountries(countryData);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters]);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({ country: '', fundingType: '', minGpa: '' });
    setSearchParams({});
  };

  const hasActiveFilters = Object.values(filters).some(v => v);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-32 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-blue-50" />
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-72 h-72 bg-sky-200/30 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div
            className="max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl font-bold text-slate-900 mb-4">
              Find
              <span className="bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent"> Scholarships</span>
            </h1>
            <p className="text-xl text-slate-600">
              Discover scholarships that match your profile and fund your education abroad.
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
                  placeholder="Search scholarships..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/50 border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl border transition-all ${
                  showFilters || hasActiveFilters
                    ? 'bg-sky-50 border-sky-200 text-sky-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Filter className="w-5 h-5" />
                Filters
              </button>
            </div>

            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="mt-4 pt-4 border-t border-slate-200"
              >
                <div className="grid md:grid-cols-3 gap-4">
                  <select
                    value={filters.country}
                    onChange={(e) => handleFilterChange('country', e.target.value)}
                    className="px-4 py-3 rounded-xl bg-white/50 border border-slate-200 focus:border-sky-500 outline-none"
                  >
                    <option value="">All Countries</option>
                    {countries.map(c => (
                      <option key={c.id} value={c.name}>{c.flag_emoji} {c.name}</option>
                    ))}
                  </select>

                  <select
                    value={filters.fundingType}
                    onChange={(e) => handleFilterChange('fundingType', e.target.value)}
                    className="px-4 py-3 rounded-xl bg-white/50 border border-slate-200 focus:border-sky-500 outline-none"
                  >
                    <option value="">All Funding Types</option>
                    <option value="Full">Full Funding</option>
                    <option value="Partial">Partial Funding</option>
                    <option value="Tuition">Tuition Only</option>
                  </select>

                  <select
                    value={filters.minGpa}
                    onChange={(e) => handleFilterChange('minGpa', e.target.value)}
                    className="px-4 py-3 rounded-xl bg-white/50 border border-slate-200 focus:border-sky-500 outline-none"
                  >
                    <option value="">Any GPA</option>
                    <option value="3.0">3.0+</option>
                    <option value="3.5">3.5+</option>
                    <option value="3.8">3.8+</option>
                  </select>
                </div>

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 flex items-center gap-2 text-sm text-slate-600 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                    Clear all filters
                  </button>
                )}
              </motion.div>
            )}
          </GlassCard>
        </div>
      </section>

      {/* Results */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : scholarships.length === 0 ? (
            <div className="text-center py-20">
              <Award className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No scholarships found</h3>
              <p className="text-slate-600">Try adjusting your filters.</p>
            </div>
          ) : (
            <>
              <p className="text-slate-600 mb-6">{scholarships.length} scholarships found</p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {scholarships.map((scholarship, i) => (
                  <motion.div
                    key={scholarship.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    viewport={{ once: true }}
                  >
                    <GlassCard className="h-full">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                            <Award className="w-6 h-6 text-white" />
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            scholarship.funding_type === 'Full'
                              ? 'bg-green-100 text-green-700'
                              : scholarship.funding_type === 'Partial'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {scholarship.funding_type} Funding
                          </span>
                        </div>

                        <h3 className="text-lg font-semibold text-slate-900 mb-2">{scholarship.name}</h3>
                        
                        {scholarship.universities && (
                          <p className="text-slate-500 text-sm mb-3">
                            {scholarship.universities.name} • {scholarship.universities.country}
                          </p>
                        )}

                        <p className="text-slate-600 text-sm line-clamp-2 mb-4">
                          {scholarship.description || scholarship.eligibility}
                        </p>

                        <div className="space-y-2 mb-4">
                          {scholarship.amount && (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <DollarSign className="w-4 h-4 text-green-500" />
                              Up to ${scholarship.amount.toLocaleString()}
                            </div>
                          )}
                          {scholarship.min_gpa_required && (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <GraduationCap className="w-4 h-4 text-blue-500" />
                              Min GPA: {scholarship.min_gpa_required}
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Calendar className="w-4 h-4 text-red-500" />
                            Deadline: {formatDate(scholarship.deadline)}
                          </div>
                        </div>

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
