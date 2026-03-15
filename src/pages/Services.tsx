import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Globe2, Award, FileText, Users, Plane, Building, BookOpen, ArrowRight, CheckCircle } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const Services: React.FC = () => {
  const services = [
    {
      icon: GraduationCap,
      title: 'University Matching',
      desc: 'Our AI-powered system analyzes your profile to recommend universities that best match your academic background, preferences, and career goals.',
      features: ['Profile-based recommendations', 'Program compatibility analysis', 'Admission probability assessment', 'Deadline tracking']
    },
    {
      icon: Globe2,
      title: 'Visa Assistance',
      desc: 'Navigate the complex visa application process with confidence. Our experts guide you through documentation, interviews, and compliance requirements.',
      features: ['Document preparation', 'Interview coaching', 'Application review', 'Status tracking']
    },
    {
      icon: Award,
      title: 'Scholarship Guidance',
      desc: 'Discover scholarships you qualify for and get expert help with applications. We help you maximize your chances of securing financial aid.',
      features: ['Scholarship matching', 'Application assistance', 'Essay review', 'Interview preparation']
    },
    {
      icon: FileText,
      title: 'Application Support',
      desc: 'From personal statements to recommendation letters, we help you craft compelling applications that stand out to admissions committees.',
      features: ['SOP writing assistance', 'Document review', 'Application strategy', 'Timeline management']
    },
    {
      icon: Users,
      title: 'Personal Counseling',
      desc: 'Get one-on-one guidance from experienced counselors who understand your unique situation and can provide tailored advice.',
      features: ['Career counseling', 'Course selection', 'University shortlisting', 'Decision support']
    },
    {
      icon: Plane,
      title: 'Pre-departure Support',
      desc: 'Prepare for your journey with comprehensive pre-departure orientation covering accommodation, travel, and cultural adaptation.',
      features: ['Accommodation guidance', 'Travel planning', 'Cultural orientation', 'Student community access']
    },
    {
      icon: Building,
      title: 'Accommodation Assistance',
      desc: 'Find safe, comfortable, and affordable housing near your university with our accommodation support services.',
      features: ['Housing options', 'Roommate matching', 'Lease review', 'Area guidance']
    },
    {
      icon: BookOpen,
      title: 'Test Preparation',
      desc: 'Access resources and guidance for standardized tests like IELTS, TOEFL, GRE, and GMAT to achieve your target scores.',
      features: ['Study materials', 'Practice tests', 'Score improvement tips', 'Test booking assistance']
    }
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
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
              Comprehensive
              <span className="block bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
                Study Abroad Services
              </span>
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              From university selection to visa approval, we provide end-to-end support for your international education journey.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <GlassCard className="p-8 h-full">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shrink-0">
                      <service.icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">{service.title}</h3>
                      <p className="text-slate-600 mb-4">{service.desc}</p>
                      <ul className="space-y-2">
                        {service.features.map((feature, j) => (
                          <li key={j} className="flex items-center gap-2 text-sm text-slate-600">
                            <CheckCircle className="w-4 h-4 text-sky-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-b from-white to-sky-50/50">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <GlassCard className="p-12 text-center" hover={false}>
              <h2 className="text-4xl font-bold text-slate-900 mb-4">Ready to Get Started?</h2>
              <p className="text-xl text-slate-600 mb-8">
                Create your free account and start exploring your options today.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-xl shadow-sky-500/25 hover:shadow-sky-500/40 transition-all font-medium"
                >
                  Create Free Account
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-slate-700 bg-white/80 backdrop-blur border border-slate-200 hover:bg-white hover:border-slate-300 transition-all font-medium"
                >
                  Contact Us
                </Link>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Services;
