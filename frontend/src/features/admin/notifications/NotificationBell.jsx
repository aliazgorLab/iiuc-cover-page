import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2, ShieldAlert, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';

import { API_BASE_URL as API } from '../../../config/apiConfig';


const ICON_MAP = {
  INFO:    <Info className="h-4 w-4 text-blue-500" />,
  SUCCESS: <CheckCircle className="h-4 w-4 text-[#006A4E]" />,
  WARNING: <AlertTriangle className="h-4 w-4 text-amber-500" />,
  ALERT:   <ShieldAlert className="h-4 w-4 text-red-500" />,
};

export const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/admin/notifications`, { headers });
      if (!res.ok) return;
      const json = await res.json();
      setNotifications(json.data.notifications || []);
      setUnreadCount(json.data.unreadCount || 0);
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAsRead = async (id) => {
    try {
      await fetch(`${API}/admin/notifications/${id}/read`, {
        method: 'PATCH',
        headers,
      });
      fetchNotifications();
    } catch {}
  };

  const deleteNotif = async (id) => {
    try {
      await fetch(`${API}/admin/notifications/${id}`, {
        method: 'DELETE',
        headers,
      });
      toast.success('Notification removed.');
      fetchNotifications();
    } catch {}
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer"
        title="Admin Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-red-600 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-bounce">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Panel */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-[#006A4E]" />
              <h3 className="text-xs font-black text-slate-900">Admin Notification Center</h3>
            </div>
            {unreadCount > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-[#006A4E] text-white rounded-full">
                {unreadCount} Unread
              </span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 font-medium">
                No notifications right now.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={`p-3.5 flex items-start gap-3 transition-colors ${
                    n.isRead ? 'bg-white' : 'bg-emerald-50/40'
                  }`}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {ICON_MAP[n.type] || ICON_MAP.INFO}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{n.title}</h4>
                      <span className="text-[9px] text-slate-400 font-medium whitespace-nowrap">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium mt-0.5 leading-snug">{n.message}</p>
                  </div>
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    {!n.isRead && (
                      <button
                        onClick={() => markAsRead(n._id)}
                        className="p-1 text-[#006A4E] hover:bg-emerald-100 rounded transition-all cursor-pointer"
                        title="Mark as read"
                      >
                        <Check className="h-3 w-3" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotif(n._id)}
                      className="p-1 text-slate-400 hover:text-red-500 rounded transition-all cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
