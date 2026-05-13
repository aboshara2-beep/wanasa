import { useState, useEffect, useCallback } from 'react';
import { NotificationsAPI } from '../api/notifications';
import { parseError }       from '../api/errors';
import { socket }           from '../api/websocket';
import type { Notification }from '../api/types';

export function useNotifications() {
  const [notifs,   setNotifs]   = useState<Notification[]>([]);
  const [loading,  setLoading]  = useState(false);
  const unreadCount = notifs.filter(n => !n.isRead).length;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await NotificationsAPI.getAll();
      setNotifs(res.data ?? []);
    } catch (err) {
      console.error(parseError(err).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const markRead = useCallback(async (id: string) => {
    // Optimistic
    setNotifs(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
    try {
      await NotificationsAPI.markRead(id);
    } catch {
      load(); // rollback
    }
  }, [load]);

  const markAllRead = useCallback(async () => {
    setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
    try {
      await NotificationsAPI.markAllRead();
    } catch {
      load();
    }
  }, [load]);

  useEffect(() => {
    load();

    // WS: إشعار فوري
    const unsub = socket.on('notification', (notif: Notification) => {
      setNotifs(prev => [notif, ...prev]);
    });

    return () => { unsub(); };
  }, [load]);

  return {
    notifs, loading, unreadCount,
    markRead, markAllRead, refresh: load,
  };
}
