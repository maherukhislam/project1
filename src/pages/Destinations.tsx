import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, GraduationCap, DollarSign, Users, ChevronRight } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { api } from '../lib/api';

const Destinations: React.FC = () => {
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const selectedCountry = searchParams.get('country');

  useEffect(() => {
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
    fetchCountries();
  }, []);

  const selectedCountryData = countries.find(c => c.name === selectedCountry);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-blue-50" />
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-72 h-72 bg-sky-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
              Study
              <span className="block bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
                Destinations
              </span>
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              Explore top study destinations around the world and find the perfect country for your education.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Country Detail or Grid */}
      {selectedCountryData ? (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <Link
              to="/destinations"
              className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-700 mb-8"
            >
              ← Back to All Destinations
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <GlassCard className="overflow-hidden" hover={false}>
                <div className="h-64 bg-gradient-to-br from-sky-400 to-blue-500 relative">
                  {selectedCountryData.image_url ? (
                    <img
                      src={selectedCountryData.image_url}
                      alt={selectedCountryData.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-9xl">{selectedCountryData.flag_emoji}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-6 left-6">
                    <h2 className="text-4xl font-bold text-white mb-2">
                      {selectedCountryData.flag_emoji} {selectedCountryData.name}
                    </h2>
                  </div>
                </div>

                <div className="p-8">
                  <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <div className="text-center p-4 rounded-xl bg-sky-50">
                      <GraduationCap className="w-8 h-8 text-sky-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-slate-900">{selectedCountryData.university_count || 0}</div>
                      <div className="text-slate-600 text-sm">Universities</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-green-50">
                      <DollarSign className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-slate-900">${selectedCountryData.avg_tuition || 'N/A'}</div>
                      <div className="text-slate-600 text-sm">Avg. Tuition/Year</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-purple-50">
                      <Users className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-slate-900">{selectedCountryData.intl_students || 'N/A'}</div>
                      <div className="text-slate-600 text-sm">Int'l Students</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-amber-50">
                      <MapPin className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-slate-900">{selectedCountryData.popular_cities || 'N/A'}</div>
                      <div className="text-slate-600 text-sm">Major Cities</div>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-slate-900 mb-4">About Studying in {selectedCountryData.name}</h3>
                  <p className="text-slate-600 leading-relaxed mb-6">{selectedCountryData.description}</p>

                  {selectedCountryData.highlights && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-slate-900 mb-3">Key Highlights</h4>
                      <ul className="grid md:grid-cols-2 gap-2">
                        {selectedCountryData.highlights.split(',').map((highlight: string, i: number) => (
                          <li key={i} className="flex items-center gap-2 text-slate-600">
                            <ChevronRight className="w-4 h-4 text-sky-500" />
                            {highlight.trim()}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <Link
                      to={`/universities?country=${selectedCountryData.name}`}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 transition-all font-medium"
                    >
                      View Universities
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                    <Link
                      to={`/scholarships?country=${selectedCountryData.name}`}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all font-medium"
                    >
                      View Scholarships
                    </Link>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </section>
      ) : (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {countries.map((country, i) => (
                <motion.div
                  key={country.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Link to={`/destinations?country=${country.name}`}>
                    <GlassCard className="overflow-hidden h-full">
                      <div className="h-48 bg-gradient-to-br from-sky-400 to-blue-500 relative">
                        {country.image_url ? (
                          <img
                            src={country.image_url}
                            alt={country.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-7xl">{country.flag_emoji}</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-4 left-4">
                          <h3 className="text-2xl font-bold text-white">{country.name}</h3>
                          <div className="flex items-center gap-1 text-white/80 text-sm">
                            <GraduationCap className="w-4 h-4" />
                            {country.university_count || 0} Universities
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-slate-600 text-sm line-clamp-2">{country.description}</p>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-sky-600 font-medium text-sm">Explore &gt;</span>
                        </div>
                      </div>
                    </GlassCard>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Destinations;


