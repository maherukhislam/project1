import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Globe className="w-8 h-8 text-sky-400" />
              <span className="text-xl font-bold">StudyGlobal</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Your trusted partner in international education. We help students achieve their dreams of studying abroad.
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-sky-500 flex items-center justify-center transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {['About Us', 'Services', 'Universities', 'Scholarships', 'Blog', 'Contact'].map((link) => (
                <li key={link}>
                  <Link
                    to={`/${link.toLowerCase().replace(' ', '-')}`}
                    className="text-slate-400 hover:text-sky-400 text-sm transition-colors"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Destinations */}
          <div>
            <h3 className="font-semibold mb-4">Study Destinations</h3>
            <ul className="space-y-2">
              {['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'Netherlands'].map((country) => (
                <li key={country}>
                  <Link
                    to={`/destinations?country=${country}`}
                    className="text-slate-400 hover:text-sky-400 text-sm transition-colors"
                  >
                    {country}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <span className="text-slate-400 text-sm">123 Education Street, New York, NY 10001</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-sky-400 shrink-0" />
                <span className="text-slate-400 text-sm">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-sky-400 shrink-0" />
                <span className="text-slate-400 text-sm">info@studyglobal.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm">
            © {new Date().getFullYear()} StudyGlobal. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-slate-400 hover:text-sky-400 text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-slate-400 hover:text-sky-400 text-sm transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
