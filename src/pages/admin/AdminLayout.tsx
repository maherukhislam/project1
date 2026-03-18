import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, GraduationCap, BookOpen, Award, FileText, Upload, LogOut, Menu, X, Globe, BarChart3, ShieldPlus, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AdminLayout: React.FC = () => {
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
        { path: '/admin', icon: Home, label: 'Dashboard', exact: true }
      ]
    },
    {
      title: 'Admissions',
      items: [
        { path: '/admin/students', icon: Users, label: 'Leads / Students' },
        { path: '/admin/applications', icon: FileText, label: 'Applications' },
        { path: '/admin/documents', icon: Upload, label: 'Documents' }
      ]
    },
    {
      title: 'Academics',
      items: [
        { path: '/admin/universities', icon: GraduationCap, label: 'Universities' },
        { path: '/admin/programs', icon: BookOpen, label: 'Programs' },
        { path: '/admin/scholarships', icon: Award, label: 'Scholarships' }
      ]
    },
    {
      title: 'System',
      items: [
        { path: '/admin/admins', icon: ShieldPlus, label: 'Admin & Roles' },
        { path: '/admin/blog', icon: BarChart3, label: 'Content / CMS' }
      ]
    }
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
            <div>
              <span className="block text-xl font-bold text-white">StudyGlobal</span>
              <span className="block text-xs text-slate-400">Operations Hub</span>
            </div>
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
        <div className="flex h-full min-h-0 flex-col">
          <div className="p-6 border-b border-slate-700 hidden lg:block">
            <div className="rounded-2xl border border-sky-500/20 bg-gradient-to-br from-sky-500/15 to-indigo-500/10 p-4">
              <Link to="/" className="flex items-center gap-2 mb-3">
                <Globe className="w-8 h-8 text-sky-400" />
                <div>
                  <span className="text-xl font-bold text-white">StudyGlobal</span>
                  <span className="text-xs text-sky-200/70 block">Operations Hub</span>
                </div>
              </Link>
              <p className="text-sm text-slate-300 leading-6">
                Manage student intake, application workflow, content, and platform settings from one place.
              </p>
            </div>
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
          <nav className="min-h-0 flex-1 space-y-7 overflow-y-auto px-4 py-5">
            {navGroups.map((group) => (
              <div
                key={group.title}
                className="rounded-[1.5rem] border border-slate-700/80 bg-[linear-gradient(180deg,rgba(30,41,59,0.72),rgba(15,23,42,0.68))] p-3 shadow-[0_14px_28px_rgba(2,6,23,0.22)]"
              >
                <div className="mb-3 flex items-center justify-between px-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    {group.title}
                  </p>
                  <span className="rounded-full border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {group.items.length}
                  </span>
                </div>
                <ul className="space-y-2">
                  {group.items.map((item) => (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`group flex min-h-14 items-center gap-3 rounded-[1.15rem] border px-4 py-3.5 transition-all ${
                          isActive(item.path, item.exact)
                            ? 'border-sky-500/20 bg-sky-500/15 text-sky-300 shadow-[0_14px_28px_rgba(14,165,233,0.12)]'
                            : 'border-transparent bg-slate-800/45 text-slate-400 hover:border-slate-700 hover:bg-slate-700/50 hover:text-white'
                        }`}
                      >
                        <span
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] transition-all ${
                            isActive(item.path, item.exact)
                              ? 'bg-sky-400/10 text-sky-300'
                              : 'bg-slate-900/70 text-slate-300 group-hover:bg-slate-900'
                          }`}
                        >
                          <item.icon className="h-5 w-5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <span className="block truncate font-medium">{item.label}</span>
                          <span className={`block text-xs ${isActive(item.path, item.exact) ? 'text-sky-100/60' : 'text-slate-500'}`}>
                            {group.title === 'Overview' ? 'High-level performance view' : group.title === 'Admissions' ? 'Daily intake and processing' : group.title === 'Academics' ? 'Catalog and offering management' : 'Permissions and publishing'}
                          </span>
                        </div>
                        <ArrowUpRight className={`h-4 w-4 shrink-0 transition-all ${isActive(item.path, item.exact) ? 'text-sky-200/70' : 'text-slate-600 group-hover:text-slate-300'}`} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="shrink-0 space-y-2 border-t border-slate-700 p-4">
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
