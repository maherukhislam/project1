import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/services', label: 'Services' },
    { path: '/destinations', label: 'Destinations' },
    { path: '/universities', label: 'Universities' },
    { path: '/scholarships', label: 'Scholarships' },
    { path: '/blog', label: 'Blog' },
    { path: '/contact', label: 'Contact' },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (profile?.role === 'admin') return '/admin';
    return '/dashboard';
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-4 mt-4">
        <div className="max-w-7xl mx-auto px-6 py-4 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative">
                <Globe className="w-8 h-8 text-sky-500 group-hover:text-sky-600 transition-colors" />
                <div className="absolute inset-0 bg-sky-400/30 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                StudyGlobal
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    location.pathname === link.path
                      ? 'bg-sky-100 text-sky-700'
                      : 'text-slate-600 hover:text-sky-600 hover:bg-sky-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Auth Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              {user ? (
                <>
                  <Link
                    to={getDashboardLink()}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-sky-600 hover:bg-sky-50 transition-all"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-sky-600 hover:bg-sky-50 transition-all"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 transition-all"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-sky-50 transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="lg:hidden overflow-hidden"
              >
                <div className="pt-4 pb-2 space-y-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className={`block px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        location.pathname === link.path
                          ? 'bg-sky-100 text-sky-700'
                          : 'text-slate-600 hover:text-sky-600 hover:bg-sky-50'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="pt-2 border-t border-slate-200/50 mt-2 space-y-1">
                    {user ? (
                      <>
                        <Link
                          to={getDashboardLink()}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-sky-600 hover:bg-sky-50"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard
                        </Link>
                        <button
                          onClick={() => { handleSignOut(); setIsOpen(false); }}
                          className="flex items-center gap-2 w-full px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/login"
                          onClick={() => setIsOpen(false)}
                          className="block px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-sky-600 hover:bg-sky-50"
                        >
                          Sign In
                        </Link>
                        <Link
                          to="/signup"
                          onClick={() => setIsOpen(false)}
                          className="block px-4 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-sky-500 to-blue-600 text-center"
                        >
                          Get Started
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
