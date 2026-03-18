import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  Award,
  BellDot,
  FileText,
  Globe,
  GraduationCap,
  Home,
  LogOut,
  Menu,
  Target,
  Upload,
  User,
  X
} from 'lucide-react';
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

  const completion = profile?.profile_completion || 0;

  return (
    <div className="min-h-screen bg-[#f5f1e8] text-slate-900">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(251,146,60,0.12),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(15,118,110,0.14),transparent_28%),linear-gradient(180deg,#f8f4ec_0%,#f6f3ee_45%,#eef4f3_100%)]" />
        <div className="absolute inset-y-0 right-0 w-[38rem] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.65),transparent_60%)]" />
      </div>

      <div className="fixed left-0 right-0 top-0 z-50 border-b border-white/50 bg-white/70 backdrop-blur-2xl lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-[0_14px_30px_rgba(15,23,42,0.22)]">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-xl font-bold tracking-tight text-slate-900">StudyGlobal</span>
              <span className="block text-xs uppercase tracking-[0.22em] text-slate-500">Student Atlas</span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-2xl border border-white/70 bg-white/80 p-2 text-slate-700 shadow-sm"
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <aside
        className={`
          fixed top-0 left-0 z-40 h-full w-80
          transform border-r border-white/40 bg-white/55 backdrop-blur-2xl transition-transform duration-300
          lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex h-full min-h-0 flex-col">
          <div className="hidden border-b border-white/40 p-6 lg:block">
            <div className="rounded-[2rem] border border-white/70 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.18),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(251,146,60,0.16),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.92),rgba(248,244,236,0.88))] p-5 shadow-[0_24px_55px_rgba(15,23,42,0.08)]">
              <Link to="/" className="flex items-center gap-2">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-xl font-bold tracking-tight text-slate-900">StudyGlobal</span>
                  <span className="block text-xs uppercase tracking-[0.22em] text-slate-500">Student Atlas</span>
                </div>
              </Link>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                A focused workspace for planning offers, documents, and next application moves.
              </p>
            </div>
          </div>

          <div className="mt-14 border-b border-white/40 p-6 lg:mt-0">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-[1.15rem] bg-gradient-to-br from-slate-900 via-slate-800 to-teal-800 text-lg font-semibold text-white shadow-[0_16px_30px_rgba(15,23,42,0.18)]">
                {profile?.name?.charAt(0) || 'S'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-slate-900">{profile?.name || 'Student'}</p>
                <p className="truncate text-sm text-slate-500">{profile?.email}</p>
              </div>
            </div>
            <div className="mt-5 rounded-[1.4rem] border border-white/70 bg-white/70 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.22em] text-slate-500">
                <span>Readiness</span>
                <span>{completion}%</span>
              </div>
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200/70">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-500"
                  style={{ width: `${completion}%` }}
                />
              </div>
            </div>
          </div>

          <nav className="min-h-0 flex-1 space-y-8 overflow-y-auto px-5 py-6 lg:space-y-6 lg:px-6">
            {navGroups.map((group) => (
              <div
                key={group.title}
                className="rounded-[1.8rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(248,244,236,0.78))] p-3 shadow-[0_14px_30px_rgba(15,23,42,0.05)] lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none"
              >
                <div className="mb-3 flex items-center justify-between px-3 lg:mb-2 lg:px-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                    {group.title}
                  </p>
                  <span className="rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 lg:bg-[#f3ede2]">
                    {group.items.length}
                  </span>
                </div>
                <ul className="space-y-2 lg:space-y-2.5 lg:border-l lg:border-slate-300/70 lg:pl-4">
                  {group.items.map((item) => (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`group flex min-h-15 items-center gap-3 rounded-[1.25rem] border px-4 py-3.5 text-[15px] transition-all lg:min-h-0 lg:rounded-[1.15rem] lg:px-3.5 lg:py-3 ${
                          isActive(item.path, item.exact)
                            ? 'border-slate-900 bg-slate-900 text-white shadow-[0_14px_28px_rgba(15,23,42,0.18)] lg:border-white/80 lg:bg-white lg:text-slate-900 lg:shadow-[0_10px_24px_rgba(15,23,42,0.08)]'
                            : 'border-transparent bg-white/55 text-slate-600 hover:border-white hover:bg-white hover:text-slate-900 lg:bg-transparent lg:hover:border-white/70 lg:hover:bg-white/70'
                        }`}
                      >
                        <span
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] transition-all ${
                            isActive(item.path, item.exact)
                              ? 'bg-white/12 text-white lg:bg-slate-900 lg:text-white'
                              : 'bg-[#f3ede2] text-slate-700 group-hover:bg-[#ede6d7]'
                          }`}
                        >
                          <item.icon className="h-5 w-5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <span className="block truncate font-medium">{item.label}</span>
                          <span className={`block text-xs ${isActive(item.path, item.exact) ? 'text-white/65 lg:text-slate-500' : 'text-slate-400'}`}>
                            {group.title === 'Overview' ? 'Your core workspace' : group.title === 'Plan' ? 'Explore options and shortlist' : 'Move toward submission'}
                          </span>
                        </div>
                        <ArrowUpRight className={`h-4 w-4 shrink-0 transition-all ${isActive(item.path, item.exact) ? 'text-white/70 lg:text-slate-400' : 'text-slate-300 group-hover:text-slate-500'}`} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <div className="shrink-0 border-t border-white/40 p-4">
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-slate-600 transition-all hover:bg-red-50/90 hover:text-red-600"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="relative min-h-screen pt-16 lg:ml-80 lg:pt-0">
        <div className="border-b border-white/30 px-6 py-4 lg:px-8">
          <div className="flex items-center justify-between rounded-[1.75rem] border border-white/50 bg-white/45 px-5 py-4 backdrop-blur-xl shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Student Dashboard</p>
              <h1 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">Plan applications with more clarity</h1>
            </div>
            <div className="hidden items-center gap-3 sm:flex">
              <div className="rounded-2xl border border-white/70 bg-white/75 px-4 py-2 text-right">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">View</p>
                <p className="text-sm font-medium text-slate-700">
                  {location.pathname === '/dashboard' ? 'Overview' : 'Workspace'}
                </p>
              </div>
              <button className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/70 bg-white/80 text-slate-700 shadow-sm">
                <BellDot className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
