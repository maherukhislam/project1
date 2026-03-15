import React from 'react';
import { motion } from 'framer-motion';
import { Target, Eye, Heart, Users, Award, Globe2, CheckCircle } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const About: React.FC = () => {
  const values = [
    { icon: Heart, title: 'Student-First Approach', desc: 'Your success is our priority. We tailor our services to meet your unique needs and aspirations.' },
    { icon: Award, title: 'Excellence', desc: 'We partner with top-ranked universities and maintain the highest standards in our services.' },
    { icon: Users, title: 'Community', desc: 'Join a global network of students and alumni who support each other throughout their journey.' },
    { icon: Globe2, title: 'Global Perspective', desc: 'We embrace diversity and help students thrive in multicultural environments.' },
  ];

  const team = [
    { name: 'Dr. Sarah Chen', role: 'Founder & CEO', image: null },
    { name: 'Michael Roberts', role: 'Head of Admissions', image: null },
    { name: 'Priya Sharma', role: 'Scholarship Director', image: null },
    { name: 'James Wilson', role: 'Visa Specialist', image: null },
  ];

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
            className="max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
              Empowering Dreams,
              <span className="block bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
                Building Futures
              </span>
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              Since 2010, StudyGlobal has been helping students achieve their dreams of studying at world-class universities. We believe that education has the power to transform lives and create a better world.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <GlassCard className="p-8 h-full">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center mb-6">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Mission</h2>
                <p className="text-slate-600 leading-relaxed">
                  To democratize access to quality international education by providing personalized guidance, comprehensive support, and innovative solutions that help students from all backgrounds achieve their academic goals.
                </p>
              </GlassCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <GlassCard className="p-8 h-full">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-6">
                  <Eye className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Vision</h2>
                <p className="text-slate-600 leading-relaxed">
                  To be the world's most trusted education consultancy, known for our integrity, expertise, and commitment to student success. We envision a world where every talented student can access the education they deserve.
                </p>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gradient-to-b from-white to-sky-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Our Values</h2>
            <p className="text-xl text-slate-600">The principles that guide everything we do</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <GlassCard className="p-6 h-full text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{value.title}</h3>
                  <p className="text-slate-600 text-sm">{value.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-slate-900 mb-6">Why Choose StudyGlobal?</h2>
              <p className="text-xl text-slate-600 mb-8">
                With over a decade of experience, we've helped thousands of students achieve their dreams.
              </p>
              <ul className="space-y-4">
                {[
                  '500+ Partner Universities Worldwide',
                  'Personalized University Matching',
                  'Scholarship Guidance & Support',
                  'Visa Application Assistance',
                  'Pre-departure Orientation',
                  '24/7 Student Support'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-sky-500 shrink-0" />
                    <span className="text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              className="grid grid-cols-2 gap-4"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              {[
                { value: '10K+', label: 'Students Placed' },
                { value: '50+', label: 'Countries' },
                { value: '95%', label: 'Success Rate' },
                { value: '14+', label: 'Years Experience' }
              ].map((stat, i) => (
                <GlassCard key={i} className="p-6 text-center">
                  <div className="text-4xl font-bold bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-slate-600">{stat.label}</div>
                </GlassCard>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-gradient-to-b from-sky-50/50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-slate-600">Experienced professionals dedicated to your success</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <GlassCard className="p-6 text-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">{member.name.charAt(0)}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">{member.name}</h3>
                  <p className="text-slate-500 text-sm">{member.role}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
