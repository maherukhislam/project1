import React from 'react';
import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Award,
  ChevronsRight,
  Compass,
  FileText,
  GraduationCap,
  HelpCircle,
  Home,
  LogOut,
  Menu,
  Settings,
  Target,
  Upload,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import NotificationBell from '../../components/NotificationBell';

// ── Nav definition ─────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { path: '/dashboard',             icon: Home,          label: 'Dashboard',    exact: true },
  { path: '/dashboard/profile',     icon: User,          label: 'My Profile' },
  { path: '/dashboard/match',       icon: Target,        label: 'Find Matches' },
  { path: '/dashboard/universities',icon: GraduationCap, label: 'Universities' },
  { path: '/dashboard/scholarships',icon: Award,         label: 'Scholarships' },
  { path: '/dashboard/applications',icon: FileText,      label: 'Applications' },
  { path: '/dashboard/documents',   icon: Upload,        label: 'Documents' },
];

const ACCOUNT_ITEMS = [
  { icon: Settings,   label: 'Change Password', path: '/dashboard/change-password' },
  { icon: HelpCircle, label: 'Help & Support',  path: null },
];

// ── Sidebar ────────────────────────────────────────────────────────────────
interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  setMobileOpen: (v: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed, setMobileOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  const isActive = (path: string, exact?: boolean) =>
    exact ? location.pathname === path : location.pathname.startsWith(path);

  const handleSignOut = async () => { await signOut(); navigate('/'); };

  const completion = profile?.profile_completion || 0;
  const initials   = profile?.name?.charAt(0)?.toUpperCase() || 'S';

  // SVG progress ring
  const R = 16, CIRC = 2 * Math.PI * R;
  const dash = CIRC * (1 - completion / 100);

  return (
    <nav
      className={`relative flex h-full shrink-0 flex-col border-r border-slate-200 bg-white transition-all duration-300 ease-in-out ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Teal left accent */}
      <div className="absolute inset-y-0 left-0 w-0.5 bg-gradient-to-b from-teal-400 via-emerald-400 to-sky-400" />

      {/* ── Brand ─────────────────────────────────────────── */}
      <div className={`border-b border-slate-100 ${collapsed ? 'p-3' : 'p-4'}`}>
        <Link
          to="/"
          className={`flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-slate-50 ${collapsed ? 'justify-center' : ''}`}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 shadow-md shadow-teal-500/20">
            <Compass className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-bold leading-none text-slate-900">StudyGlobal</p>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-teal-600">
                Student Portal
              </p>
            </div>
          )}
        </Link>
      </div>

      {/* ── User ──────────────────────────────────────────── */}
      <div className={`border-b border-slate-100 ${collapsed ? 'p-3' : 'p-4'}`}>
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          {/* Avatar with progress ring */}
          <div className="relative shrink-0">
            <svg width="36" height="36" className="-rotate-90">
              <circle cx="18" cy="18" r={R} fill="none" stroke="#e2e8f0" strokeWidth="2.5" />
              <circle
                cx="18" cy="18" r={R} fill="none"
                stroke="url(#dashProgGrad)" strokeWidth="2.5"
                strokeDasharray={CIRC} strokeDashoffset={dash}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="dashProgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#14b8a6" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-800">
              {initials}
            </span>
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">{profile?.name || 'Student'}</p>
              <p className="truncate text-xs text-slate-400">{profile?.email}</p>
            </div>
          )}
          {!collapsed && (
            <span className="shrink-0 rounded-md bg-teal-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-teal-600 ring-1 ring-teal-200">
              {completion}%
            </span>
          )}
        </div>
      </div>

      {/* ── Main nav ──────────────────────────────────────── */}
      <div className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.path, item.exact);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? item.label : undefined}
              className={`relative flex h-10 w-full items-center rounded-md transition-all duration-150 ${
                active
                  ? 'border-l-2 border-teal-500 bg-teal-50 text-teal-700'
                  : 'border-l-2 border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className={`grid h-full shrink-0 place-content-center ${collapsed ? 'w-full' : 'w-12'}`}>
                <item.icon className="h-4 w-4" />
              </div>
              {!collapsed && (
                <span className="flex-1 text-sm font-medium">{item.label}</span>
              )}
            </Link>
          );
        })}
      </div>

      {/* ── Account section ───────────────────────────────── */}
      {!collapsed && (
        <div className="border-t border-slate-100 p-2">
          <p className="mb-1 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Account
          </p>
          {ACCOUNT_ITEMS.map(({ icon: Icon, label, path }) =>
            path ? (
              <Link
                key={label}
                to={path}
                onClick={() => setMobileOpen(false)}
                className="flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-medium text-slate-500 transition-all hover:bg-slate-50 hover:text-slate-900"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ) : (
              <button
                key={label}
                className="flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-medium text-slate-500 transition-all hover:bg-slate-50 hover:text-slate-900"
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            )
          )}
          <button
            onClick={handleSignOut}
            className="flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-medium text-slate-500 transition-all hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      )}

      {/* ── Collapse toggle ────────────────────────────────── */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center border-t border-slate-100 p-3 transition-colors hover:bg-slate-50"
      >
        <div className="grid h-10 w-10 shrink-0 place-content-center">
          <ChevronsRight
            className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${collapsed ? '' : 'rotate-180'}`}
          />
        </div>
        {!collapsed && (
          <span className="text-sm font-medium text-slate-400">Collapse</span>
        )}
      </button>
    </nav>
  );
};

// ── Layout ─────────────────────────────────────────────────────────────────
const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const { profile } = useAuth();
  const [collapsed, setCollapsed]   = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  if (profile?.role === 'admin') return <Navigate to="/admin" replace />;
  if (profile?.role === 'counselor') return <Navigate to="/counselor" replace />;

  // Page label from current path
  const currentNav = NAV_ITEMS.find(n =>
    n.exact ? location.pathname === n.path : location.pathname.startsWith(n.path)
  );
  const pageLabel = currentNav?.label ?? 'Dashboard';

  return (
    <div className="flex min-h-screen w-full bg-[#f5f1e8] text-slate-900">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(15,118,110,0.10),transparent_28%),linear-gradient(180deg,#f8f4ec_0%,#f6f3ee_45%,#eef4f3_100%)]" />
      </div>

      {/* ── Desktop sidebar ────────────────────────────────── */}
      <div className="relative sticky top-0 hidden h-screen lg:flex">
        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          setMobileOpen={setMobileOpen}
        />
      </div>

      {/* ── Mobile sidebar ─────────────────────────────────── */}
      <div
        className={`fixed inset-y-0 left-0 z-50 flex h-full transition-transform duration-300 lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar
          collapsed={false}
          setCollapsed={() => {}}
          setMobileOpen={setMobileOpen}
        />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Content area ───────────────────────────────────── */}
      <div className="relative flex min-w-0 flex-1 flex-col">

        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/60 bg-white/80 px-5 py-3 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 shadow-sm lg:hidden"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-teal-600">Student Dashboard</p>
              <h1 className="text-base font-semibold leading-tight text-slate-900">{pageLabel}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <NotificationBell isDark={false} />
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 text-xs font-bold text-white shadow-sm">
              {profile?.name?.charAt(0)?.toUpperCase() || 'S'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-5 lg:p-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
