import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { Home, User, Target, FileText, Upload, Award, GraduationCap, LogOut, Menu, X, Globe, Compass, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const navGroups: Array<{
    title: string;
    items: Array<{
      path: string;
      icon: React.ComponentType<{ className?: string }>;
      label: string;
      exact?: boolean;
    }>;
  }> = [
    {
      title: 'Overview',
      items: [
        { path: '/dashboard', icon: Home, label: 'Dashboard', exact: true },
        { path: '/dashboard/profile', icon: User, label: 'My Profile' }
      ]
    },
    {
      title: 'Plan',
      items: [
        { path: '/dashboard/match', icon: Target, label: 'Find Matches' },
        { path: '/dashboard/universities', icon: GraduationCap, label: 'Browse Universities' },
        { path: '/dashboard/scholarships', icon: Award, label: 'Scholarships' }
      ]
    },
    {
      title: 'Prepare',
      items: [
        { path: '/dashboard/applications', icon: FileText, label: 'Applications' },
        { path: '/dashboard/documents', icon: Upload, label: 'Documents' }
      ]
    }
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <Globe className="w-8 h-8 text-sky-500" />
            <div>
              <span className="block text-xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                StudyGlobal
              </span>
              <span className="block text-xs text-slate-500">Student Hub</span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-40 h-full w-72
        bg-white/80 backdrop-blur-xl border-r border-slate-200
        transform transition-transform duration-300
        lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-slate-200 hidden lg:block">
            <div className="rounded-3xl border border-sky-100 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.18),transparent_35%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(240,249,255,0.92))] p-5 shadow-[0_20px_45px_rgba(14,116,144,0.08)]">
              <Link to="/" className="flex items-center gap-2">
                <Globe className="w-8 h-8 text-sky-500" />
                <div>
                  <span className="block text-xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                    StudyGlobal
                  </span>
                  <span className="block text-xs uppercase tracking-[0.18em] text-sky-600/70">Student Hub</span>
                </div>
              </Link>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                Keep your profile, matches, applications, and documents in one guided workspace.
              </p>
            </div>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-slate-200 mt-14 lg:mt-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white font-semibold text-lg">
                {profile?.name?.charAt(0) || 'S'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 truncate">{profile?.name || 'Student'}</p>
                <p className="text-sm text-slate-500 truncate">{profile?.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto space-y-6">
            {navGroups.map((group) => (
              <div key={group.title}>
                <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {group.title}
                </p>
                <ul className="space-y-1">
                  {group.items.map((item) => (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                          isActive(item.path, item.exact)
                            ? 'bg-sky-50 text-sky-600 font-medium ring-1 ring-sky-100'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          {/* Sign Out */}
          <div className="p-4 border-t border-slate-200 space-y-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-2 text-slate-700">
                <Compass className="w-4 h-4 text-sky-500" />
                <span className="text-sm font-medium">Current focus</span>
              </div>
              <p className="mt-2 text-sm text-slate-500">
                {(profile?.profile_completion || 0) < 100 ? 'Complete your profile for better recommendations.' : 'Review your latest matches and next application steps.'}
              </p>
            </div>
            <Link
              to="/dashboard/match"
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-600 hover:bg-sky-50 hover:text-sky-700 transition-all"
            >
              <Sparkles className="w-5 h-5" />
              Explore Matches
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-72 min-h-screen pt-16 lg:pt-0">
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
