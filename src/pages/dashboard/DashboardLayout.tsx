import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { Home, User, Target, FileText, Upload, Award, GraduationCap, LogOut, Menu, X, Globe } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard', exact: true },
    { path: '/dashboard/profile', icon: User, label: 'My Profile' },
    { path: '/dashboard/match', icon: Target, label: 'University Match' },
    { path: '/dashboard/applications', icon: FileText, label: 'Applications' },
    { path: '/dashboard/documents', icon: Upload, label: 'Documents' },
    { path: '/dashboard/scholarships', icon: Award, label: 'Scholarships' },
    { path: '/dashboard/universities', icon: GraduationCap, label: 'Browse Universities' },
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
            <span className="text-xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
              StudyGlobal
            </span>
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
            <Link to="/" className="flex items-center gap-2">
              <Globe className="w-8 h-8 text-sky-500" />
              <span className="text-xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                StudyGlobal
              </span>
            </Link>
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
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive(item.path, item.exact)
                        ? 'bg-sky-50 text-sky-600 font-medium'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Sign Out */}
          <div className="p-4 border-t border-slate-200">
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
