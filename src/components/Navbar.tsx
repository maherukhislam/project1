import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Compass, LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'About' },
  { path: '/services', label: 'Services' },
  { path: '/destinations', label: 'Destinations' },
  { path: '/universities', label: 'Universities' },
  { path: '/scholarships', label: 'Scholarships' },
  { path: '/blog', label: 'Blog' },
  { path: '/contact', label: 'Contact' }
];

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const dashboardLink = profile?.role === 'admin' ? '/admin' : '/dashboard';

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between rounded-3xl border border-white/65 bg-white/75 px-5 py-3 shadow-[0_18px_55px_rgba(15,23,42,0.12)] backdrop-blur-xl md:px-7">
        <Link to="/" className="group inline-flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-900 text-white shadow-[0_12px_24px_rgba(15,23,42,0.25)] transition-transform group-hover:scale-105">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <span className="brand-display block text-lg font-semibold tracking-tight text-slate-900">StudyGlobal</span>
            <span className="block text-[10px] uppercase tracking-[0.22em] text-slate-500">Modern Admissions</span>
          </div>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => {
            const active = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                  active
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          {user ? (
            <>
              <Link
                to={dashboardLink}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-300 hover:text-slate-900"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-xl px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900">
                Sign In
              </Link>
              <Link to="/signup" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
                Start Free
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 lg:hidden"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mx-auto mt-2 w-full max-w-7xl rounded-3xl border border-white/70 bg-white/92 p-4 shadow-[0_18px_48px_rgba(15,23,42,0.12)] backdrop-blur-xl lg:hidden"
          >
            <div className="space-y-1">
              {navLinks.map((link) => {
                const active = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`block rounded-xl px-4 py-2 text-sm font-medium ${
                      active ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
            <div className="mt-3 border-t border-slate-200 pt-3">
              {user ? (
                <div className="space-y-2">
                  <Link
                    to={dashboardLink}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      void handleSignOut();
                      setIsOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link to="/login" onClick={() => setIsOpen(false)} className="block rounded-xl px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                    Sign In
                  </Link>
                  <Link to="/signup" onClick={() => setIsOpen(false)} className="block rounded-xl bg-slate-900 px-4 py-2 text-center text-sm font-medium text-white">
                    Start Free
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
