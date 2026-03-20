import React from 'react';
import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Award,
  Bell,
  FileText,
  GraduationCap,
  Home,
  LogOut,
  Menu,
  Target,
  Upload,
  User,
  X,
  Compass,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const NAV_GROUPS = [
  {
    title: 'Overview',
    color: '#14b8a6',
    items: [
      { path: '/dashboard',            icon: Home,         label: 'Dashboard',           exact: true },
      { path: '/dashboard/profile',    icon: User,         label: 'My Profile' },
    ],
  },
  {
    title: 'Plan',
    color: '#10b981',
    items: [
      { path: '/dashboard/match',        icon: Target,       label: 'Find Matches' },
      { path: '/dashboard/universities', icon: GraduationCap,label: 'Universities' },
      { path: '/dashboard/scholarships', icon: Award,        label: 'Scholarships' },
    ],
  },
  {
    title: 'Prepare',
    color: '#0ea5e9',
    items: [
      { path: '/dashboard/applications', icon: FileText,  label: 'Applications' },
      { path: '/dashboard/documents',    icon: Upload,    label: 'Documents' },
    ],
  },
];

const DashboardLayout: React.FC = () => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { profile, signOut } = useAuth();
  const [open, setOpen] = React.useState(false);

  const isActive = (path: string, exact?: boolean) =>
    exact ? location.pathname === path : location.pathname.startsWith(path);

  const handleSignOut = async () => { await signOut(); navigate('/'); };

  if (profile?.role === 'admin') return <Navigate to="/admin" replace />;

  const completion = profile?.profile_completion || 0;
  const initials   = profile?.name?.charAt(0)?.toUpperCase() || 'S';

  // SVG progress ring
  const R = 20, CIRC = 2 * Math.PI * R;
  const dash = CIRC * (1 - completion / 100);

  const Sidebar = (
    <div className="flex h-full flex-col">

      {/* ── Logo ──────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-6 py-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 shadow-lg shadow-teal-500/25">
          <Compass className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-[15px] font-bold tracking-tight text-slate-900">StudyGlobal</p>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-teal-600">Student Portal</p>
        </div>
      </div>

      {/* ── User card ─────────────────────────────────────── */}
      <div className="mx-4 mb-4 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 p-4 ring-1 ring-teal-100">
        <div className="flex items-center gap-3">
          {/* Avatar with progress ring */}
          <div className="relative shrink-0">
            <svg width="48" height="48" className="-rotate-90">
              <circle cx="24" cy="24" r={R} fill="none" stroke="#e2e8f0" strokeWidth="3" />
              <circle
                cx="24" cy="24" r={R} fill="none"
                stroke="url(#progGrad)" strokeWidth="3"
                strokeDasharray={CIRC} strokeDashoffset={dash}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="progGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#14b8a6" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-800">
              {initials}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">{profile?.name || 'Student'}</p>
            <p className="truncate text-xs text-slate-500">{profile?.email}</p>
            <p className="mt-1 text-[11px] font-medium text-teal-600">{completion}% ready</p>
          </div>
        </div>
      </div>

      {/* ── Nav ───────────────────────────────────────────── */}
      <nav className="flex-1 space-y-5 overflow-y-auto px-4 py-2">
        {NAV_GROUPS.map((group) => (
          <div key={group.title}>
            {/* Section label */}
            <div className="mb-1.5 flex items-center gap-2 px-2">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: group.color }} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {group.title}
              </span>
            </div>

            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.path, item.exact);
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                        active
                          ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md shadow-teal-500/20'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all ${
                          active ? 'bg-white/20' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                      </span>
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* ── Footer ────────────────────────────────────────── */}
      <div className="px-4 py-4">
        <div className="rounded-2xl bg-slate-50 p-1 ring-1 ring-slate-200/70">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition-all hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f1e8] text-slate-900">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(251,146,60,0.12),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(15,118,110,0.14),transparent_28%),linear-gradient(180deg,#f8f4ec_0%,#f6f3ee_45%,#eef4f3_100%)]" />
      </div>

      {/* ── Mobile top bar ──────────────────────────────── */}
      <div className="fixed left-0 right-0 top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500">
              <Compass className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-slate-900">StudyGlobal</span>
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-sm"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside
        className={`fixed left-0 top-0 z-40 h-full w-64 border-r border-slate-200/70 bg-white/90 shadow-xl shadow-slate-200/50 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Teal left accent bar */}
        <div className="absolute inset-y-0 left-0 w-0.5 bg-gradient-to-b from-teal-400 via-emerald-400 to-sky-400" />
        {/* Top padding on mobile to clear header */}
        <div className="h-14 lg:h-0" />
        {Sidebar}
      </aside>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/20 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Main ──────────────────────────────────────────── */}
      <main className="relative min-h-screen pt-14 lg:ml-64 lg:pt-0">
        {/* Top bar */}
        <div className="sticky top-0 z-20 border-b border-slate-200/50 bg-white/60 px-6 py-3 backdrop-blur-xl lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-teal-600">Student Dashboard</p>
              <h1 className="text-base font-semibold text-slate-900">Plan applications with clarity</h1>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm hover:text-slate-900 transition-colors">
                <Bell className="h-4 w-4" />
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
