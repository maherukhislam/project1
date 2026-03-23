import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Mail, MapPin, Phone, Send } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-slate-200 bg-[linear-gradient(160deg,#0f172a,#111827_45%,#0b1220)] text-slate-200">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -top-24 left-16 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute -bottom-32 right-10 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.1fr]">
          <div>
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-cyan-300">
                <Compass className="h-5 w-5" />
              </div>
              <div>
                <span className="brand-display block text-xl font-semibold tracking-tight text-white">StudyGlobal</span>
                <span className="block text-[10px] uppercase tracking-[0.22em] text-slate-400">Admissions Platform</span>
              </div>
            </Link>
            <p className="mt-5 max-w-md text-sm leading-7 text-slate-400">
              A modern student admissions experience for discovering universities, managing documents, and tracking applications end-to-end.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">Explore</h3>
            <ul className="mt-4 space-y-2 text-sm">
              {[
                ['About', '/about'],
                ['Services', '/services'],
                ['Destinations', '/destinations'],
                ['Universities', '/universities'],
                ['Scholarships', '/scholarships'],
                ['Blog', '/blog']
              ].map(([label, path]) => (
                <li key={path}>
                  <Link to={path} className="text-slate-400 transition-colors hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">Support</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link to="/contact" className="text-slate-400 transition-colors hover:text-white">Contact</Link></li>
              <li><Link to="/terms" className="text-slate-400 transition-colors hover:text-white">Terms</Link></li>
              <li><Link to="/privacy" className="text-slate-400 transition-colors hover:text-white">Privacy</Link></li>
              <li><Link to="/login" className="text-slate-400 transition-colors hover:text-white">Student Login</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">Get In Touch</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-cyan-300" />
                123 Education Street, New York, NY
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-cyan-300" />
                +1 (555) 123-4567
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-cyan-300" />
                info@studyglobal.com
              </li>
            </ul>
            <Link
              to="/contact"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100"
            >
              <Send className="h-4 w-4" />
              Talk to Advisor
            </Link>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-xs text-slate-500">
          &copy; {new Date().getFullYear()} StudyGlobal. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
