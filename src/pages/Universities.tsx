import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, MapPin, Star, GraduationCap, DollarSign, Award, X } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { api } from '../lib/api';

const Universities: React.FC = () => {
  const [universities, setUniversities] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    country: searchParams.get('country') || '',
    degreeLevel: searchParams.get('degree') || '',
    maxTuition: searchParams.get('maxTuition') || '',
    scholarship: searchParams.get('scholarship') || ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params: any = {};
        if (filters.search) params.search = filters.search;
        if (filters.country) params.country = filters.country;
        if (filters.degreeLevel) params.degree_level = filters.degreeLevel;
        if (filters.maxTuition) params.max_tuition = filters.maxTuition;
        if (filters.scholarship) params.scholarship = filters.scholarship;

        const [uniData, countryData] = await Promise.all([
          api.get('/api/universities', params),
          api.get('/api/countries')
        ]);
        setUniversities(uniData);
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
    setFilters({ search: '', country: '', degreeLevel: '', maxTuition: '', scholarship: '' });
    setSearchParams({});
  };

  const hasActiveFilters = Object.values(filters).some(v => v);

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
              Explore
              <span className="bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent"> Universities</span>
            </h1>
            <p className="text-xl text-slate-600">
              Browse our partner universities and find the perfect fit for your academic journey.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="py-6 sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <GlassCard className="p-4" hover={false}>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search universities..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
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
                {hasActiveFilters && (
                  <span className="w-5 h-5 rounded-full bg-sky-500 text-white text-xs flex items-center justify-center">
                    {Object.values(filters).filter(v => v).length}
                  </span>
                )}
              </button>
            </div>

            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="mt-4 pt-4 border-t border-slate-200"
              >
                <div className="grid md:grid-cols-4 gap-4">
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
                    value={filters.degreeLevel}
                    onChange={(e) => handleFilterChange('degreeLevel', e.target.value)}
                    className="px-4 py-3 rounded-xl bg-white/50 border border-slate-200 focus:border-sky-500 outline-none"
                  >
                    <option value="">All Degree Levels</option>
                    <option value="Bachelor">Bachelor's</option>
                    <option value="Master">Master's</option>
                    <option value="PhD">PhD</option>
                  </select>

                  <select
                    value={filters.maxTuition}
                    onChange={(e) => handleFilterChange('maxTuition', e.target.value)}
                    className="px-4 py-3 rounded-xl bg-white/50 border border-slate-200 focus:border-sky-500 outline-none"
                  >
                    <option value="">Any Tuition</option>
                    <option value="10000">Under $10,000</option>
                    <option value="20000">Under $20,000</option>
                    <option value="30000">Under $30,000</option>
                    <option value="50000">Under $50,000</option>
                  </select>

                  <select
                    value={filters.scholarship}
                    onChange={(e) => handleFilterChange('scholarship', e.target.value)}
                    className="px-4 py-3 rounded-xl bg-white/50 border border-slate-200 focus:border-sky-500 outline-none"
                  >
                    <option value="">Scholarships</option>
                    <option value="true">With Scholarships</option>
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
          ) : universities.length === 0 ? (
            <div className="text-center py-20">
              <GraduationCap className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No universities found</h3>
              <p className="text-slate-600">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <>
              <p className="text-slate-600 mb-6">{universities.length} universities found</p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {universities.map((uni, i) => (
                  <motion.div
                    key={uni.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    viewport={{ once: true }}
                  >
                    <Link to={`/universities/${uni.id}`}>
                      <GlassCard className="h-full">
                        <div className="p-6">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                              {uni.logo_url ? (
                                <img src={uni.logo_url} alt={uni.name} className="w-full h-full object-cover" />
                              ) : (
                                <GraduationCap className="w-8 h-8 text-slate-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-semibold text-slate-900 mb-1 truncate">{uni.name}</h3>
                              <div className="flex items-center gap-1 text-slate-500 text-sm">
                                <MapPin className="w-4 h-4 shrink-0" />
                                <span className="truncate">{uni.country}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-4">
                            {uni.ranking && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-100 text-amber-700 text-xs font-medium">
                                <Star className="w-3 h-3 fill-current" />
                                Rank #{uni.ranking}
                              </span>
                            )}
                            {uni.programs?.some((p: any) => p.scholarship_available) && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-green-100 text-green-700 text-xs font-medium">
                                <Award className="w-3 h-3" />
                                Scholarships
                              </span>
                            )}
                          </div>

                          <p className="text-slate-600 text-sm line-clamp-2 mb-4">{uni.description}</p>

                          <div className="flex items-center justify-between text-sm border-t border-slate-100 pt-4">
                            <div className="flex items-center gap-1 text-slate-500">
                              <GraduationCap className="w-4 h-4" />
                              {uni.programs?.length || 0} Programs
                            </div>
                            {uni.tuition_min && (
                              <div className="flex items-center gap-1 text-slate-500">
                                <DollarSign className="w-4 h-4" />
                                From ${uni.tuition_min?.toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </GlassCard>
                    </Link>
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

export default Universities;
