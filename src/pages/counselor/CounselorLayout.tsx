import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  ChevronsRight,
  FileText,
  HelpCircle,
  Home,
  LogOut,
  Menu,
  Settings,
  Users,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import NotificationBell from '../../components/NotificationBell';

const NAV_ITEMS = [
  { path: '/counselor', icon: Home, label: 'Dashboard', exact: true },
  { path: '/counselor/students', icon: Users, label: 'My Students' },
  { path: '/counselor/applications', icon: FileText, label: 'My Applications' }
];

const ACCOUNT_ITEMS = [
  { icon: Settings, label: 'Change Password', path: '/counselor/change-password' },
  { icon: HelpCircle, label: 'Help & Support', path: null }
];

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
  setMobileOpen: (value: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed, setMobileOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  const isActive = (path: string, exact?: boolean) =>
    exact ? location.pathname === path : location.pathname.startsWith(path);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav
      className={`relative flex h-full shrink-0 flex-col border-r border-emerald-950/10 bg-[#11251f] transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.12),transparent_38%),linear-gradient(180deg,rgba(17,37,31,0.98),rgba(12,24,21,0.98))]" />

      <div className={`relative border-b border-white/10 ${collapsed ? 'p-3' : 'p-4'}`}>
        <Link
          to="/"
          className={`flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-white/5 ${collapsed ? 'justify-center' : ''}`}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-950/30">
            <Briefcase className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-bold text-white">StudyGlobal</p>
              <p className="text-[10px] uppercase tracking-[0.24em] text-emerald-300">Counselor Desk</p>
            </div>
          )}
        </Link>
      </div>

      <div className={`relative border-b border-white/10 ${collapsed ? 'p-3' : 'p-4'}`}>
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 text-xs font-bold text-white">
            {profile?.name?.charAt(0)?.toUpperCase() || 'C'}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{profile?.name || 'Counselor'}</p>
              <p className="truncate text-xs text-emerald-100/60">{profile?.email}</p>
            </div>
          )}
        </div>
      </div>

      <div className="relative flex-1 space-y-0.5 overflow-y-auto p-2">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.path, item.exact);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex h-10 items-center rounded-md border-l-2 transition-all ${
                active
                  ? 'border-emerald-400 bg-emerald-400/10 text-emerald-200'
                  : 'border-transparent text-emerald-50/70 hover:bg-white/5 hover:text-white'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <div className={`grid h-full place-content-center ${collapsed ? 'w-full' : 'w-12'}`}>
                <item.icon className="h-4 w-4" />
              </div>
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </div>

      {!collapsed && (
        <div className="relative border-t border-white/10 p-2">
          <p className="mb-1 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-100/40">
            Account
          </p>
          {ACCOUNT_ITEMS.map(({ icon: Icon, label, path }) =>
            path ? (
              <Link
                key={label}
                to={path}
                onClick={() => setMobileOpen(false)}
                className="flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-emerald-50/70 transition-all hover:bg-white/5 hover:text-white"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ) : (
              <button
                key={label}
                className="flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-medium text-emerald-50/70 transition-all hover:bg-white/5 hover:text-white"
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            )
          )}
          <button
            onClick={handleSignOut}
            className="flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-medium text-emerald-50/70 transition-all hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      )}

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="relative flex items-center border-t border-white/10 p-3 transition-colors hover:bg-white/5"
      >
        <div className="grid h-10 w-10 place-content-center">
          <ChevronsRight className={`h-4 w-4 text-emerald-100/50 transition-transform ${collapsed ? '' : 'rotate-180'}`} />
        </div>
        {!collapsed && <span className="text-sm font-medium text-emerald-100/50">Collapse</span>}
      </button>
    </nav>
  );
};

const CounselorLayout: React.FC = () => {
  const { profile } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  if (profile && profile.role !== 'counselor') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b1512]">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
          <h1 className="mb-2 text-2xl font-bold text-white">Access Denied</h1>
          <p className="mb-4 text-emerald-50/60">You do not have counselor access.</p>
          <Link to="/dashboard" className="font-medium text-emerald-300 hover:text-emerald-200">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const currentNav = NAV_ITEMS.find((item) =>
    item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path)
  );
  const pageLabel = currentNav?.label || 'Counselor';

  return (
    <div className="flex min-h-screen w-full bg-[#0b1512] text-white">
      <div className="sticky top-0 hidden h-screen lg:flex">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} setMobileOpen={setMobileOpen} />
      </div>

      <div
        className={`fixed inset-y-0 left-0 z-50 flex h-full transition-transform duration-300 lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar collapsed={false} setCollapsed={() => {}} setMobileOpen={setMobileOpen} />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <div className="relative flex min-w-0 flex-1 flex-col">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(45,212,191,0.10),transparent_28%),linear-gradient(180deg,#0b1512_0%,#11201b_45%,#132a23_100%)]" />
        </div>

        <header className="relative sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-[#10211c]/85 px-5 py-3 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-lg border border-white/10 bg-white/5 p-2 text-emerald-100/70 lg:hidden"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-300">Assigned Work</p>
              <h1 className="text-base font-semibold text-white">{pageLabel}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <NotificationBell isDark={true} />
            <div className="hidden rounded-lg bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-200 ring-1 ring-emerald-400/20 sm:flex">
              Counselor Online
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 text-xs font-bold text-white">
              {profile?.name?.charAt(0)?.toUpperCase() || 'C'}
            </div>
          </div>
        </header>

        <main className="relative flex-1 p-5 lg:p-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CounselorLayout;
