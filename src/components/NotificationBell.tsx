import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  CheckCircle,
  Info,
  Trash2,
  X,
} from 'lucide-react';
import { useNotifications, type Notification, type NotificationType } from '../hooks/useNotifications';

// ── Helpers ────────────────────────────────────────────────────────────────
const relativeTime = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

const TYPE_META: Record<NotificationType, { icon: React.ElementType; light: string; dark: string }> = {
  info:    { icon: Info,          light: 'text-sky-500 bg-sky-50',     dark: 'text-sky-400 bg-sky-500/10' },
  success: { icon: CheckCircle,   light: 'text-emerald-600 bg-emerald-50', dark: 'text-emerald-400 bg-emerald-500/10' },
  warning: { icon: AlertTriangle, light: 'text-orange-500 bg-orange-50',   dark: 'text-orange-400 bg-orange-500/10' },
  error:   { icon: AlertCircle,   light: 'text-red-500 bg-red-50',         dark: 'text-red-400 bg-red-500/10' },
};

// ── Single item ────────────────────────────────────────────────────────────
const NotifItem: React.FC<{
  n: Notification;
  isDark: boolean;
  onRead: (id: number) => void;
  onDelete: (id: number) => void;
  onClose: () => void;
}> = ({ n, isDark, onRead, onDelete, onClose }) => {
  const navigate = useNavigate();
  const meta = TYPE_META[n.type];
  const Icon = meta.icon;
  const iconCls = isDark ? meta.dark : meta.light;

  const handleClick = () => {
    if (!n.read) onRead(n.id);
    if (n.link) { navigate(n.link); onClose(); }
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative flex gap-3 px-4 py-3 transition-colors ${
        n.link ? 'cursor-pointer' : 'cursor-default'
      } ${
        !n.read
          ? isDark ? 'bg-white/5' : 'bg-teal-50/60'
          : isDark ? 'hover:bg-white/3' : 'hover:bg-slate-50'
      }`}
    >
      {/* Unread dot */}
      {!n.read && (
        <span className={`absolute left-1.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full ${
          isDark ? 'bg-teal-400' : 'bg-teal-500'
        }`} />
      )}

      {/* Type icon */}
      <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconCls}`}>
        <Icon className="h-4 w-4" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-semibold leading-snug ${isDark ? 'text-white' : 'text-slate-900'} ${!n.read ? '' : isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          {n.title}
        </p>
        {n.message && (
          <p className={`mt-0.5 line-clamp-2 text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {n.message}
          </p>
        )}
        <p className={`mt-1 text-[10px] font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          {relativeTime(n.created_at)}
        </p>
      </div>

      {/* Delete */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(n.id); }}
        className={`mt-0.5 shrink-0 rounded-md p-1 opacity-0 transition-opacity group-hover:opacity-100 ${
          isDark ? 'text-slate-500 hover:text-red-400 hover:bg-red-500/10' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'
        }`}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

// ── Bell component ─────────────────────────────────────────────────────────
interface NotificationBellProps {
  isDark?: boolean;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ isDark = false }) => {
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const bellBtn = isDark
    ? 'border-white/10 bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10'
    : 'border-slate-200 bg-white text-slate-500 shadow-sm hover:text-slate-900';

  const panelBg = isDark
    ? 'bg-slate-900 border-white/10 shadow-2xl shadow-black/50'
    : 'bg-white border-slate-200 shadow-xl shadow-slate-200/60';

  const headerBorder = isDark ? 'border-white/8' : 'border-slate-100';
  const headerText   = isDark ? 'text-white' : 'text-slate-900';
  const subText      = isDark ? 'text-slate-400' : 'text-slate-500';
  const markAllBtn   = isDark ? 'text-teal-400 hover:text-teal-300' : 'text-teal-600 hover:text-teal-700';
  const divider      = isDark ? 'divide-white/5' : 'divide-slate-100';
  const emptyIcon    = isDark ? 'text-slate-600' : 'text-slate-300';
  const emptyText    = isDark ? 'text-slate-500' : 'text-slate-400';
  const footerBg     = isDark ? 'bg-slate-800/50 border-white/8' : 'bg-slate-50 border-slate-100';
  const footerText   = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="relative" ref={ref}>
      {/* ── Bell button ── */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
        className={`relative flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${bellBtn}`}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown panel ── */}
      {open && (
        <div
          className={`absolute right-0 top-11 z-50 w-80 rounded-2xl border overflow-hidden ${panelBg}`}
        >
          {/* Header */}
          <div className={`flex items-center justify-between border-b px-4 py-3 ${headerBorder}`}>
            <div className="flex items-center gap-2">
              <h3 className={`text-sm font-bold ${headerText}`}>Notifications</h3>
              {unreadCount > 0 && (
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  isDark ? 'bg-teal-500/15 text-teal-400' : 'bg-teal-50 text-teal-600'
                }`}>
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className={`text-xs font-medium transition-colors ${markAllBtn}`}
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className={`rounded-md p-1 transition-colors ${isDark ? 'text-slate-500 hover:text-slate-300 hover:bg-white/5' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className={`max-h-[360px] overflow-y-auto divide-y ${divider}`}>
            {loading ? (
              <div className={`flex items-center justify-center py-10 ${subText}`}>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                <Bell className={`h-10 w-10 mb-3 ${emptyIcon}`} />
                <p className={`text-sm font-medium ${emptyText}`}>No notifications yet</p>
                <p className={`text-xs mt-1 ${emptyText} opacity-70`}>
                  You'll see updates about your activity here.
                </p>
              </div>
            ) : (
              notifications.map(n => (
                <NotifItem
                  key={n.id}
                  n={n}
                  isDark={isDark}
                  onRead={markAsRead}
                  onDelete={deleteNotification}
                  onClose={() => setOpen(false)}
                />
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className={`border-t px-4 py-2.5 ${footerBg} ${headerBorder}`}>
              <p className={`text-center text-xs ${footerText}`}>
                Showing {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
