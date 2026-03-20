import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Award, BarChart3, BookOpen, ExternalLink, FileText,
  GraduationCap, Home, LogOut, Menu, ShieldPlus, Upload, Users, X, Zap,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const NAV_GROUPS = [
  {
    title: 'Overview',
    accent: '#14b8a6',
    items: [
      { path: '/admin', icon: Home, label: 'Dashboard', exact: true },
    ],
  },
  {
    title: 'Admissions',
    accent: '#10b981',
    items: [
      { path: '/admin/students',     icon: Users,    label: 'Leads & Students' },
      { path: '/admin/applications', icon: FileText, label: 'Applications' },
      { path: '/admin/documents',    icon: Upload,   label: 'Documents' },
    ],
  },
  {
    title: 'Academics',
    accent: '#0ea5e9',
    items: [
      { path: '/admin/universities', icon: GraduationCap, label: 'Universities' },
      { path: '/admin/programs',     icon: BookOpen,      label: 'Programs' },
      { path: '/admin/scholarships', icon: Award,         label: 'Scholarships' },
    ],
  },
  {
    title: 'System',
    accent: '#a78bfa',
    items: [
      { path: '/admin/admins', icon: ShieldPlus, label: 'Admin & Roles' },
      { path: '/admin/blog',   icon: BarChart3,  label: 'Content / CMS' },
    ],
  },
];

const AdminLayout: React.FC = () => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { profile, signOut } = useAuth();
  const [open, setOpen] = React.useState(false);

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path) && (path !== '/admin' || location.pathname === '/admin');
  };

  const handleSignOut = async () => { await signOut(); navigate('/'); };

  if (profile && profile.role !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
          <h1 className="mb-2 text-2xl font-bold text-white">Access Denied</h1>
          <p className="mb-4 text-slate-400">You don't have permission to access this area.</p>
          <Link to="/dashboard" className="font-medium text-teal-400 hover:text-teal-300">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const initials = profile?.name?.charAt(0)?.toUpperCase() || 'A';

  const Sidebar = (
    <div className="flex h-full flex-col">

      {/* ── Logo ──────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-6 py-5">
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg shadow-teal-500/30">
          <Zap className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-[15px] font-bold tracking-tight text-white">StudyGlobal</p>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-teal-400">Ops Dashboard</p>
        </div>
        {/* Admin badge */}
        <span className="ml-auto rounded-md bg-teal-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-teal-400 ring-1 ring-teal-500/30">
          Admin
        </span>
      </div>

      {/* ── User card ─────────────────────────────────────── */}
      <div className="mx-4 mb-5 rounded-2xl bg-white/5 p-3.5 ring-1 ring-white/10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 text-sm font-bold text-white shadow-md shadow-teal-900/40">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{profile?.name || 'Admin'}</p>
            <p className="truncate text-xs text-slate-400">{profile?.email}</p>
          </div>
          <span className="rounded-lg bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400 ring-1 ring-emerald-500/20">
            ●&nbsp;Live
          </span>
        </div>
      </div>

      {/* ── Nav ───────────────────────────────────────────── */}
      <nav className="flex-1 space-y-5 overflow-y-auto px-4 py-1">
        {NAV_GROUPS.map((group) => (
          <div key={group.title}>
            {/* Section header */}
            <div className="mb-1.5 flex items-center gap-2 px-2">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: group.accent }} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
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
                          ? 'bg-teal-500/15 text-teal-300 ring-1 ring-teal-500/25'
                          : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                      }`}
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all ${
                          active
                            ? 'bg-teal-500/20 text-teal-300'
                            : 'bg-white/5 text-slate-500'
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                      </span>
                      {item.label}
                      {active && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-teal-400" />
                      )}
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
        <div className="space-y-0.5 rounded-2xl bg-white/5 p-1 ring-1 ring-white/10">
          <Link
            to="/"
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition-all hover:bg-white/5 hover:text-slate-200"
          >
            <ExternalLink className="h-4 w-4" />
            View Website
          </Link>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition-all hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950">

      {/* ── Mobile top bar ──────────────────────────────── */}
      <div className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-slate-900/90 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-white">StudyGlobal</span>
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside
        className={`fixed left-0 top-0 z-40 h-full w-64 border-r border-white/8 bg-slate-900 shadow-2xl transition-transform duration-300 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Teal left accent */}
        <div className="absolute inset-y-0 left-0 w-0.5 bg-gradient-to-b from-teal-500 via-emerald-500 to-violet-500 opacity-60" />
        {/* Subtle glow overlay */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(20,184,166,0.06),transparent_60%)]" />

        <div className="h-14 lg:h-0" />
        {Sidebar}
      </aside>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Main ──────────────────────────────────────────── */}
      <main className="relative min-h-screen pt-14 lg:ml-64 lg:pt-0">
        {/* Top bar */}
        <div className="sticky top-0 z-20 border-b border-white/8 bg-slate-900/80 px-6 py-3 backdrop-blur-xl lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-teal-500">Operations Hub</p>
              <h1 className="text-base font-semibold text-white">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 ring-1 ring-emerald-500/20">
                ● System Online
              </div>
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

export default AdminLayout;
