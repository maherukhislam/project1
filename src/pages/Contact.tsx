import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Clock, MessageSquare, CheckCircle } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { useCms } from '../contexts/CmsContext';
import { useFormDraft } from '../hooks/useFormDraft';

const Contact: React.FC = () => {
  const { content: { contact: cms } } = useCms();

  const [formData, setFormData, clearDraft, hasRestored] = useFormDraft('contact-form', {
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearDraft();
    setSubmitted(true);
  };

  const contactInfo = [
    { icon: Mail, label: 'Email', value: cms.email, href: `mailto:${cms.email}` },
    { icon: Phone, label: 'Phone', value: cms.phone, href: `tel:${cms.phone.replace(/\D/g, '')}` },
    { icon: MapPin, label: 'Address', value: cms.address, href: null },
    { icon: Clock, label: 'Hours', value: cms.hours, href: null }
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
              {cms.heroTitle1}
              <span className="bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent"> {cms.heroTitle2}</span>
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed">{cms.heroDesc}</p>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Contact Information</h2>
                <div className="space-y-4">
                  {contactInfo.map((item) => (
                    <GlassCard key={item.label} className="p-4">
                      {item.href ? (
                        <a href={item.href} className="flex items-start gap-4 group">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shrink-0">
                            <item.icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-medium text-slate-900 group-hover:text-sky-600 transition-colors">{item.label}</h3>
                            <p className="text-slate-600 text-sm">{item.value}</p>
                          </div>
                        </a>
                      ) : (
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shrink-0">
                            <item.icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-medium text-slate-900">{item.label}</h3>
                            <p className="text-slate-600 text-sm">{item.value}</p>
                          </div>
                        </div>
                      )}
                    </GlassCard>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                viewport={{ once: true }}
              >
                <GlassCard className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <MessageSquare className="w-6 h-6 text-sky-500" />
                    <h3 className="font-semibold text-slate-900">Live Chat</h3>
                  </div>
                  <p className="text-slate-600 text-sm mb-4">{cms.liveChatDesc}</p>
                  <button className="w-full py-2 rounded-xl bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors font-medium text-sm">
                    Start Chat
                  </button>
                </GlassCard>
              </motion.div>
            </div>

            {/* Contact Form */}
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <GlassCard className="p-8" hover={false}>
                {submitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Message Sent!</h3>
                    <p className="text-slate-600">
                      Thank you for reaching out. We'll get back to you within 24 hours.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-slate-900">Send us a Message</h2>
                      {hasRestored && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-medium border border-amber-200/50">
                          <Clock className="w-3.5 h-3.5" /> Draft restored
                        </span>
                      )}
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-white/50 border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all"
                            placeholder="John Doe"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-white/50 border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all"
                            placeholder="you@example.com"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-white/50 border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all"
                            placeholder="+1 (555) 000-0000"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
                          <select
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-white/50 border border-slate-200 focus:border-sky-500 outline-none"
                            required
                          >
                            <option value="">Select a subject</option>
                            <option value="general">General Inquiry</option>
                            <option value="admission">Admission Help</option>
                            <option value="visa">Visa Assistance</option>
                            <option value="scholarship">Scholarship Info</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                        <textarea
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          rows={5}
                          className="w-full px-4 py-3 rounded-xl bg-white/50 border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all resize-none"
                          placeholder="Tell us how we can help you..."
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 rounded-xl text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 transition-all font-medium flex items-center justify-center gap-2"
                      >
                        Send Message
                        <Send className="w-5 h-5" />
                      </button>
                    </form>
                  </>
                )}
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
