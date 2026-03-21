import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Award,
  BarChart3,
  BookOpen,
  ChevronsRight,
  ExternalLink,
  FileText,
  GraduationCap,
  HelpCircle,
  Home,
  LogOut,
  Menu,
  PenLine,
  Settings,
  ShieldPlus,
  Upload,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import NotificationBell from '../../components/NotificationBell';

// ── Nav definition ─────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { path: '/admin',              icon: Home,         label: 'Dashboard',      exact: true },
  { path: '/admin/students',     icon: Users,        label: 'Students',       notifs: 4 },
  { path: '/admin/applications', icon: FileText,     label: 'Applications',   notifs: 7 },
  { path: '/admin/documents',    icon: Upload,       label: 'Documents' },
  { path: '/admin/universities', icon: GraduationCap,label: 'Universities' },
  { path: '/admin/programs',     icon: BookOpen,     label: 'Programs' },
  { path: '/admin/scholarships', icon: Award,        label: 'Scholarships' },
  { path: '/admin/admins',       icon: ShieldPlus,   label: 'Admin & Roles' },
  { path: '/admin/blog',         icon: BarChart3,    label: 'Content / CMS' },
  { path: '/admin/cms',          icon: PenLine,      label: 'Page Editor' },
];

const ACCOUNT_ITEMS = [
  { icon: Settings,   label: 'Change Password', path: '/admin/change-password' },
  { icon: HelpCircle, label: 'Help & Support',  path: null },
];

// ── Sidebar ────────────────────────────────────────────────────────────────
interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed, setMobileOpen }) => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { profile, signOut } = useAuth();

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path) && (path !== '/admin' || location.pathname === '/admin');
  };

  const handleSignOut = async () => { await signOut(); navigate('/'); };

  return (
    <nav
      className={`relative flex h-full shrink-0 flex-col border-r border-white/8 bg-slate-900 transition-all duration-300 ease-in-out ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Subtle teal glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(20,184,166,0.07),transparent_55%)]" />

      {/* ── Brand ─────────────────────────────────────────── */}
      <div className={`border-b border-white/8 ${collapsed ? 'p-3' : 'p-4'}`}>
        <Link
          to="/"
          className={`flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-white/5 ${collapsed ? 'justify-center' : ''}`}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 shadow-md shadow-teal-900/40">
            <Zap className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-bold leading-none text-white">StudyGlobal</p>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-teal-400">
                Ops Dashboard
              </p>
            </div>
          )}
        </Link>
      </div>

      {/* ── User ──────────────────────────────────────────── */}
      <div className={`border-b border-white/8 ${collapsed ? 'p-3' : 'p-4'}`}>
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 text-xs font-bold text-white shadow-sm">
            {profile?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{profile?.name || 'Admin'}</p>
              <p className="truncate text-xs text-slate-400">{profile?.email}</p>
            </div>
          )}
          {!collapsed && (
            <span className="shrink-0 rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-400 ring-1 ring-emerald-500/20">
              Live
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
                  ? 'border-l-2 border-teal-500 bg-teal-500/10 text-teal-300'
                  : 'border-l-2 border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              <div className={`grid h-full shrink-0 place-content-center ${collapsed ? 'w-full' : 'w-12'}`}>
                <item.icon className="h-4 w-4" />
              </div>
              {!collapsed && (
                <span className="flex-1 text-sm font-medium">{item.label}</span>
              )}
              {!collapsed && item.notifs && (
                <span className="mr-3 flex h-5 w-5 items-center justify-center rounded-full bg-teal-500/20 text-[10px] font-bold text-teal-300 ring-1 ring-teal-500/30">
                  {item.notifs}
                </span>
              )}
              {collapsed && item.notifs && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-teal-400" />
              )}
            </Link>
          );
        })}
      </div>

      {/* ── Account section ───────────────────────────────── */}
      {!collapsed && (
        <div className="border-t border-white/8 p-2">
          <p className="mb-1 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Account
          </p>
          {ACCOUNT_ITEMS.map(({ icon: Icon, label, path }) =>
            path ? (
              <Link
                key={label}
                to={path}
                onClick={() => setMobileOpen(false)}
                className="flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-medium text-slate-400 transition-all hover:bg-white/5 hover:text-slate-200"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ) : (
              <button
                key={label}
                className="flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-medium text-slate-400 transition-all hover:bg-white/5 hover:text-slate-200"
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            )
          )}
          <Link
            to="/"
            className="flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-medium text-slate-400 transition-all hover:bg-white/5 hover:text-slate-200"
          >
            <ExternalLink className="h-4 w-4" />
            View Website
          </Link>
          <button
            onClick={handleSignOut}
            className="flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-medium text-slate-400 transition-all hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      )}

      {/* ── Collapse toggle ────────────────────────────────── */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center border-t border-white/8 p-3 transition-colors hover:bg-white/5"
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
const AdminLayout: React.FC = () => {
  const { profile } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed]   = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

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

  // Page label from current path
  const currentNav = NAV_ITEMS.find(n =>
    n.exact ? location.pathname === n.path : location.pathname.startsWith(n.path)
  );
  const pageLabel = currentNav?.label ?? 'Admin';

  return (
    <div className="flex min-h-screen w-full bg-slate-950 text-slate-100">

      {/* ── Desktop sidebar ────────────────────────────────── */}
      <div className="sticky top-0 hidden h-screen lg:flex">
        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          mobileOpen={mobileOpen}
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
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Content area ───────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col">

        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/8 bg-slate-900/80 px-5 py-3 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-400 lg:hidden"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-teal-500">Operations Hub</p>
              <h1 className="text-base font-semibold leading-tight text-white">{pageLabel}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notification bell */}
            <NotificationBell isDark={true} />

            {/* System status */}
            <div className="hidden items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 ring-1 ring-emerald-500/20 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              System Online
            </div>

            {/* Avatar */}
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 text-xs font-bold text-white shadow-sm">
              {profile?.name?.charAt(0)?.toUpperCase() || 'A'}
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

export default AdminLayout;
