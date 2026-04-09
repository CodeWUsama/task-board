import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Notification } from '../types';
import { BellIcon } from '../icons';
import { UserAvatar } from './UserAvatar';
import { SkeletonPulse } from './SkeletonPulse';
import { formatDateTime, getInitials } from '../utils/helpers';
import { NOTIFICATION_POLL_INTERVAL } from '../utils/constants';
import { useTaskBoardContext } from '../context/TaskBoardProvider';

export interface NotificationBellProps {
  onOpenTask: (taskId: string, projectSlug: string) => void;
}

export function NotificationBell({ onOpenTask }: NotificationBellProps) {
  const { service, config } = useTaskBoardContext();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchCount = useCallback(async () => {
    try {
      const count = await service.getNotificationCount();
      setUnreadCount(count);
    } catch (err) {
      config.onError?.(err instanceof Error ? err : new Error(String(err)));
    }
  }, [service, config]);

  useEffect(() => {
    fetchCount();
    pollRef.current = setInterval(fetchCount, NOTIFICATION_POLL_INTERVAL);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchCount]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await service.listNotifications();
      setNotifications(data);
    } catch (err) {
      config.onError?.(err instanceof Error ? err : new Error(String(err)));
    } finally { setLoading(false); }
  };

  const toggleOpen = () => {
    if (!open) fetchNotifications();
    setOpen(!open);
  };

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const markAsRead = async (id: string) => {
    try {
      await service.markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      config.onError?.(err instanceof Error ? err : new Error(String(err)));
    }
  };

  const markAllRead = async () => {
    try {
      await service.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      config.onError?.(err instanceof Error ? err : new Error(String(err)));
    }
  };

  const handleClick = (n: Notification) => {
    if (!n.read) markAsRead(n.id);
    setOpen(false);
    onOpenTask(n.task_id, n.project_slug);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={toggleOpen}
        className="relative flex items-center justify-center w-9 h-9 rounded-lg border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-colors"
        title="Notifications"
      >
        <BellIcon size={16} className="text-neutral-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-[#FF5E00] text-white text-[9px] font-bold">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[360px] bg-white rounded-xl shadow-xl border border-neutral-200 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
            <h3 className="text-sm font-medium text-neutral-900">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-[11px] font-medium text-[#FF5E00] hover:text-[#E05200] transition-colors">
                Mark all as read
              </button>
            )}
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="px-4 py-6 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-neutral-200 shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <SkeletonPulse className="h-3 w-3/4" />
                      <SkeletonPulse className="h-2.5 w-full" />
                      <SkeletonPulse className="h-2 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <BellIcon size={32} className="text-neutral-300 mx-auto mb-2" />
                <p className="text-xs text-neutral-400">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-neutral-50 transition-colors border-b border-neutral-50 last:border-b-0 ${
                    !n.read ? "bg-[#FF5E00]/[0.03]" : ""
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-[#FF5E00] text-white text-[10px] font-semibold flex items-center justify-center shrink-0 mt-0.5">
                    {getInitials(n.actor_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-neutral-700 leading-relaxed">
                      <span className="font-semibold text-neutral-900">{n.actor_name}</span>
                      {" mentioned you in "}
                      {n.context === "description" ? "the description of " : "a comment on "}
                      <span className="font-medium text-neutral-800">{n.task_title}</span>
                    </p>
                    {n.snippet && <p className="text-[11px] text-neutral-400 mt-0.5 truncate">{n.snippet}</p>}
                    <p className="text-[10px] text-neutral-400 mt-1">{formatDateTime(n.created_at)}</p>
                  </div>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-[#FF5E00] shrink-0 mt-2" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
