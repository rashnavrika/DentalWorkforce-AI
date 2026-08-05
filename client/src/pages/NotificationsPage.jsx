import React from 'react';
import { Bell, CheckCheck, Trash2, ShieldAlert, Sparkles } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { Badge } from '../components/common/Badge';

export const NotificationsPage = () => {
  const { notifications, markAsRead, clearAll } = useNotification();

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Notifications & Telemetry Alerts</h1>
          <p className="text-xs text-slate-400 mt-1">Real-time operational alerts, certification renewal warnings, and pending manager sign-offs.</p>
        </div>
        <button
          onClick={clearAll}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-850 hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 border border-slate-700 text-xs font-semibold rounded-xl transition-colors self-start sm:self-auto"
        >
          <Trash2 className="w-4 h-4" /> Clear All Alerts
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
              n.is_read ? 'bg-slate-900/60 border-slate-800 opacity-75' : 'bg-slate-900 border-sky-500/30 shadow-md'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    n.type === 'Urgent'
                      ? 'danger'
                      : n.type === 'Warning'
                      ? 'warning'
                      : n.type === 'AI_Alert'
                      ? 'primary'
                      : 'default'
                  }
                >
                  {n.type}
                </Badge>
                <h4 className="font-extrabold text-sm text-white">{n.title}</h4>
                <span className="text-[10px] text-slate-500 font-mono">{n.timestamp}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{n.message}</p>
            </div>
            {!n.is_read && (
              <button
                onClick={() => markAsRead(n.id)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 text-xs font-semibold rounded-lg transition-colors flex-shrink-0 flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark Read
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
