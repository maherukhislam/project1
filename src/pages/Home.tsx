import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, GraduationCap, Globe2, Award, Users, ChevronRight, Star, MapPin } from 'lucide-react';
import WaterGlobe from '../components/WaterGlobe';
import GlassCard from '../components/GlassCard';
import { api } from '../lib/api';

const Home: React.FC = () => {
  const [universities, setUniversities] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [uniData, countryData] = await Promise.all([
          api.get('/api/universities', { limit: '6' }),
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
  }, []);

  const services = [
    { icon: GraduationCap, title: 'University Matching', desc: 'Find the perfect university based on your profile and preferences' },
    { icon: Globe2, title: 'Visa Assistance', desc: 'Expert guidance through the visa application process' },
    { icon: Award, title: 'Scholarship Guidance', desc: 'Discover scholarships that match your qualifications' },
    { icon: Users, title: 'Personal Counseling', desc: 'One-on-one support throughout your journey' },
  ];

  const stats = [
    { value: '10K+', label: 'Students Placed' },
    { value: '500+', label: 'Partner Universities' },
    { value: '50+', label: 'Countries' },
    { value: '95%', label: 'Success Rate' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-aurora" />
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute inset-0">
          <div className="absolute top-16 left-8 w-72 h-72 bg-sky-200/35 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-[520px] h-[520px] bg-indigo-200/30 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[920px] h-[920px] bg-gradient-to-r from-sky-100/20 to-blue-100/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 pt-32 pb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 text-sky-700 text-sm font-medium mb-6 border border-white/60 shadow-sm">
                <Star className="w-4 h-4 fill-current" />
                Trusted by 10,000+ Students Worldwide
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight mb-6">
                Your Journey to
                <span className="block bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
                  Global Education
                </span>
                Starts Here
              </h1>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                We connect ambitious students with world-class universities. Get personalized guidance, scholarship opportunities, and visa support.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/signup"
                  className="group inline-flex items-center gap-2 px-8 py-4 rounded-full text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-xl shadow-sky-500/25 hover:shadow-sky-500/40 transition-all font-medium"
                >
                  Start Your Journey
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/universities"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-slate-700 bg-white/80 backdrop-blur border border-slate-200 hover:bg-white hover:border-slate-300 transition-all font-medium"
                >
                  Explore Universities
                </Link>
              </div>
            </motion.div>

            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <WaterGlobe />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-16 -mt-24">
        <div className="max-w-5xl mx-auto px-6">
          <GlassCard className="p-8" hover={false}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-slate-600 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-gradient-to-b from-white/60 to-sky-50/60">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Our Services</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Comprehensive support at every step of your study abroad journey
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <GlassCard className="p-6 h-full">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-sky-500/25">
                    <service.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{service.title}</h3>
                  <p className="text-slate-600">{service.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Destinations Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Popular Destinations</h2>
              <p className="text-xl text-slate-600">Explore top study destinations worldwide</p>
            </div>
            <Link
              to="/destinations"
              className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-700 font-medium group"
            >
              View All Destinations
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {countries.slice(0, 6).map((country, i) => (
              <motion.div
                key={country.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Link to={`/destinations?country=${country.name}`}>
                  <GlassCard className="overflow-hidden group cursor-pointer">
                    <div className="h-48 bg-gradient-to-br from-sky-400 to-blue-500 relative overflow-hidden">
                      {country.image_url ? (
                        <img src={country.image_url} alt={country.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-6xl">{country.flag_emoji}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-4 left-4 text-white">
                        <h3 className="text-2xl font-bold">{country.name}</h3>
                        <div className="flex items-center gap-1 text-white/80 text-sm">
                          <MapPin className="w-4 h-4" />
                          {country.university_count || 0} Universities
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-slate-600 text-sm line-clamp-2">{country.description}</p>
                    </div>
                  </GlassCard>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Universities */}
      <section className="py-24 bg-gradient-to-b from-sky-50/60 to-white/80">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Featured Universities</h2>
              <p className="text-xl text-slate-600">Partner with world-renowned institutions</p>
            </div>
            <Link
              to="/universities"
              className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-700 font-medium group"
            >
              View All Universities
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {universities.map((uni, i) => (
              <motion.div
                key={uni.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Link to={`/universities/${uni.id}`}>
                  <GlassCard className="p-6 h-full">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden">
                        {uni.logo_url ? (
                          <img src={uni.logo_url} alt={uni.name} className="w-full h-full object-cover" />
                        ) : (
                          <GraduationCap className="w-8 h-8 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">{uni.name}</h3>
                        <div className="flex items-center gap-1 text-slate-500 text-sm">
                          <MapPin className="w-4 h-4" />
                          {uni.country}
                        </div>
                      </div>
                    </div>
                    {uni.ranking && (
                      <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-medium mb-3">
                        <Star className="w-4 h-4 fill-current" />
                        Rank #{uni.ranking}
                      </div>
                    )}
                    <p className="text-slate-600 text-sm line-clamp-2 mb-4">{uni.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">{uni.programs?.length || 0} Programs</span>
                      <span className="text-sky-600 font-medium">Learn More &gt;</span>
                    </div>
                  </GlassCard>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <GlassCard className="p-12 text-center relative overflow-hidden" hover={false}>
              <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 via-transparent to-blue-500/10" />
              <div className="relative">
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                  Ready to Start Your Journey?
                </h2>
                <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
                  Join thousands of students who have successfully achieved their dreams of studying abroad with our guidance.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link
                    to="/signup"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-xl shadow-sky-500/25 hover:shadow-sky-500/40 transition-all font-medium"
                  >
                    Create Free Account
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-slate-700 bg-white/80 backdrop-blur border border-slate-200 hover:bg-white hover:border-slate-300 transition-all font-medium"
                  >
                    Talk to Counselor
                  </Link>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;



