import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Award,
  Briefcase,
  Compass,
  GraduationCap,
  MapPin,
  Sparkles,
  Users
} from 'lucide-react';
import WaterGlobe from '../components/WaterGlobe';
import GlassCard from '../components/GlassCard';
import { api } from '../lib/api';

const Home: React.FC = () => {
  const [universities, setUniversities] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [uniData, countryData] = await Promise.all([
          api.get('/api/universities', { limit: '6' }),
          api.get('/api/countries')
        ]);
        setUniversities(uniData || []);
        setCountries(countryData || []);
      } catch (error) {
        console.error('Failed to fetch home data:', error);
      }
    };
    void fetchData();
  }, []);

  const stats = [
    { value: '10K+', label: 'Students Guided' },
    { value: '500+', label: 'Universities' },
    { value: '50+', label: 'Destinations' },
    { value: '95%', label: 'Visa Success' }
  ];

  const features = [
    {
      icon: Compass,
      title: 'Smart Program Discovery',
      desc: 'Match students to programs by profile, intake timing, and budget readiness.'
    },
    {
      icon: Briefcase,
      title: 'Application Workboard',
      desc: 'Track documents, deadlines, and counselor actions from one modern dashboard.'
    },
    {
      icon: Award,
      title: 'Scholarship Visibility',
      desc: 'Surface realistic scholarship paths based on eligibility and timeline fit.'
    },
    {
      icon: Users,
      title: 'Human + AI Counseling',
      desc: 'Blend data-backed recommendations with counselor support and decisions.'
    }
  ];

  return (
    <div className="relative overflow-hidden pt-24">
      <section className="relative px-6 pb-20 pt-10 md:pt-16">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-aurora" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-30" />

        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.15fr_0.85fr]">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-700">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              Admissions, Reimagined
            </div>
            <h1 className="brand-display mt-6 text-5xl font-semibold leading-[1.06] tracking-tight text-slate-900 md:text-6xl lg:text-7xl">
              A Modern Path To
              <span className="mt-2 block gradient-text">Global Education</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              StudyGlobal helps students plan smarter with profile-driven matching, transparent timelines, and a cleaner admissions workflow from shortlist to visa.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3.5 text-sm font-medium text-white shadow-[0_16px_30px_rgba(15,23,42,0.24)] hover:bg-slate-800"
              >
                Start Your Plan
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/universities"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white/80 px-6 py-3.5 text-sm font-medium text-slate-700 hover:border-slate-400 hover:text-slate-900"
              >
                Browse Universities
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mx-auto"
          >
            <WaterGlobe />
          </motion.div>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto max-w-6xl">
          <GlassCard className="p-7 md:p-10" hover={false}>
            <div className="grid gap-8 md:grid-cols-4">
              {stats.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                >
                  <p className="brand-display text-4xl font-semibold tracking-tight text-slate-900">{item.value}</p>
                  <p className="mt-2 text-sm uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,rgba(255,255,255,0.65),rgba(237,245,243,0.7))] px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14">
            <h2 className="brand-display text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">Built For Modern Admissions Teams</h2>
            <p className="mt-3 max-w-3xl text-lg text-slate-600">
              A sharper interface for students and counselors, designed to reduce friction at every admissions milestone.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <GlassCard className="h-full p-6">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-white">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{feature.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="brand-display text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">Top Destinations</h2>
              <p className="mt-2 text-slate-600">Student demand across major study markets.</p>
            </div>
            <Link to="/destinations" className="text-sm font-semibold text-teal-700 hover:text-teal-800">
              View all destinations
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {countries.slice(0, 6).map((country, index) => (
              <motion.div
                key={country.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Link to={`/destinations?country=${encodeURIComponent(country.name)}`}>
                  <GlassCard className="overflow-hidden">
                    <div className="h-44 overflow-hidden">
                      {country.image_url ? (
                        <img src={country.image_url} alt={country.name} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
                      ) : (
                        <div className="grid h-full place-items-center bg-gradient-to-br from-cyan-200 to-emerald-200 text-5xl">
                          {country.flag_emoji}
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="text-xl font-semibold text-slate-900">{country.name}</h3>
                      <div className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                        <MapPin className="h-4 w-4" />
                        {country.university_count || 0} universities
                      </div>
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{country.description}</p>
                    </div>
                  </GlassCard>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,#f7f6f1,#edf6f5)] px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="brand-display text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">Featured Universities</h2>
              <p className="mt-2 text-slate-600">Programs from globally recognized institutions.</p>
            </div>
            <Link to="/universities" className="text-sm font-semibold text-teal-700 hover:text-teal-800">
              View all universities
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {universities.slice(0, 6).map((university, index) => (
              <motion.div
                key={university.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
              >
                <Link to={`/universities/${university.id}`}>
                  <GlassCard className="h-full p-6">
                    <div className="mb-4 flex items-start gap-4">
                      <div className="grid h-14 w-14 place-items-center overflow-hidden rounded-2xl bg-slate-100">
                        {university.logo_url ? (
                          <img src={university.logo_url} alt={university.name} className="h-full w-full object-cover" />
                        ) : (
                          <GraduationCap className="h-6 w-6 text-slate-500" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{university.name}</h3>
                        <p className="mt-1 text-sm text-slate-500">{university.country}</p>
                      </div>
                    </div>
                    <p className="line-clamp-2 text-sm leading-6 text-slate-600">{university.description}</p>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-500">Rank #{university.ranking || '-'}</span>
                      <span className="font-semibold text-teal-700">Open profile</span>
                    </div>
                  </GlassCard>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <GlassCard className="relative overflow-hidden p-10 text-center md:p-14" hover={false}>
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.2),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.18),transparent_40%)]" />
            <div className="relative">
              <h2 className="brand-display text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
                Ready To Move Forward?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-600">
                Build your profile, discover realistic matches, and take the next step with counselor-backed planning.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link to="/signup" className="rounded-2xl bg-slate-900 px-6 py-3.5 text-sm font-medium text-white hover:bg-slate-800">
                  Create Free Account
                </Link>
                <Link to="/contact" className="rounded-2xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-medium text-slate-700 hover:border-slate-400 hover:text-slate-900">
                  Speak With Counselor
                </Link>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>
    </div>
  );
};

export default Home;
