import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, GraduationCap, BookOpen, Award, FileText, Upload, LogOut, Menu, X, Globe, BarChart3, ShieldPlus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const navItems = [
    { path: '/admin', icon: Home, label: 'Dashboard', exact: true },
    { path: '/admin/students', icon: Users, label: 'Students' },
    { path: '/admin/admins', icon: ShieldPlus, label: 'Admins' },
    { path: '/admin/applications', icon: FileText, label: 'Applications' },
    { path: '/admin/universities', icon: GraduationCap, label: 'Universities' },
    { path: '/admin/programs', icon: BookOpen, label: 'Programs' },
    { path: '/admin/scholarships', icon: Award, label: 'Scholarships' },
    { path: '/admin/documents', icon: Upload, label: 'Documents' },
    { path: '/admin/blog', icon: BarChart3, label: 'Blog / Content' },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path) && (path !== '/admin' || location.pathname === '/admin');
  };

  // Check if user is admin
  if (profile && profile.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center p-8 rounded-2xl bg-slate-800/50 border border-slate-700">
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-slate-400 mb-4">You don't have permission to access the admin area.</p>
          <Link to="/dashboard" className="text-sky-400 hover:text-sky-300 font-medium">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-800/90 backdrop-blur-xl border-b border-slate-700">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <Globe className="w-8 h-8 text-sky-400" />
            <span className="text-xl font-bold text-white">Admin</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-700"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-40 h-full w-72
        bg-slate-800/90 backdrop-blur-xl border-r border-slate-700
        transform transition-transform duration-300
        lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-slate-700 hidden lg:block">
            <Link to="/" className="flex items-center gap-2">
              <Globe className="w-8 h-8 text-sky-400" />
              <div>
                <span className="text-xl font-bold text-white">StudyGlobal</span>
                <span className="text-xs text-slate-500 block">Admin Panel</span>
              </div>
            </Link>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-slate-700 mt-14 lg:mt-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white font-semibold text-lg">
                {profile?.name?.charAt(0) || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">{profile?.name || 'Admin'}</p>
                <p className="text-sm text-slate-400 truncate">{profile?.email}</p>
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
                        ? 'bg-sky-500/20 text-sky-400 font-medium'
                        : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-700 space-y-2">
            <Link
              to="/"
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-700/50 hover:text-white transition-all"
            >
              <Globe className="w-5 h-5" />
              View Website
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-all"
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
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
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

export default AdminLayout;
