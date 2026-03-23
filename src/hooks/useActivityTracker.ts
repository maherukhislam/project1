import { useEffect, useRef, useCallback } from 'react';
import { api } from '../lib/api';

interface UseActivityTrackerOptions {
  enabled: boolean;
  heartbeatInterval?: number; // in milliseconds, default 60 seconds
}

export function useActivityTracker({ enabled, heartbeatInterval = 60000 }: UseActivityTrackerOptions) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const sendHeartbeat = useCallback(async () => {
    try {
      await api.post('/api/activity', { action: 'heartbeat' });
    } catch (err) {
      // Silently fail - don't interrupt user experience for activity tracking
      console.debug('[activity] heartbeat failed:', err);
    }
  }, []);

  const markOffline = useCallback(async () => {
    try {
      await api.post('/api/activity', { action: 'offline' });
    } catch (err) {
      console.debug('[activity] offline marker failed:', err);
    }
  }, []);

  const handleActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Send initial heartbeat on mount
    sendHeartbeat();

    // Set up heartbeat interval
    intervalRef.current = setInterval(() => {
      // Only send heartbeat if user has been active recently (within 5 minutes)
      const inactiveTime = Date.now() - lastActivityRef.current;
      if (inactiveTime < 5 * 60 * 1000) {
        sendHeartbeat();
      }
    }, heartbeatInterval);

    // Track user activity events
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Handle tab visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        sendHeartbeat();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Handle page unload
    const handleBeforeUnload = () => {
      // Use sendBeacon for reliable delivery on page close
      const token = localStorage.getItem('sb-auth-token');
      if (token) {
        navigator.sendBeacon('/api/activity', JSON.stringify({ action: 'offline' }));
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // Mark offline when unmounting (e.g., logout)
      markOffline();
    };
  }, [enabled, heartbeatInterval, sendHeartbeat, markOffline, handleActivity]);

  return { sendHeartbeat, markOffline };
}
