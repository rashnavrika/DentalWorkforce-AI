import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, LogOut, ShieldAlert, Sparkles, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount } = useNotification();
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Search / Context Indicator */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-xs text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span className="font-semibold text-slate-200">Grok Decision Support:</span>
          <span className="text-emerald-400 font-mono text-[11px]">Human-in-the-Loop Active</span>
        </div>
      </div>

      {/* Actions & Profile */}
      <div className="flex items-center gap-4">
        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative p-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition-colors border border-slate-800"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 glass-panel rounded-2xl shadow-2xl p-4 border border-slate-700 z-50 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Live System Alerts</h4>
                <span className="text-[10px] text-sky-400 font-medium px-2 py-0.5 bg-sky-500/10 rounded">
                  {unreadCount} New
                </span>
              </div>
              <div className="space-y-2.5 max-h-64 overflow-y-auto">
                {notifications.slice(0, 4).map((n) => (
                  <div key={n.id} className="p-2.5 bg-slate-850/80 rounded-xl border border-slate-800/80 text-xs">
                    <div className="flex items-center justify-between font-semibold text-slate-200">
                      <span>{n.title}</span>
                      <span className="text-[10px] text-slate-500">{n.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{n.message}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  setShowNotifMenu(false);
                  navigate('/notifications');
                }}
                className="w-full mt-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-semibold rounded-lg transition-colors text-center block"
              >
                View All Notifications →
              </button>
            </div>
          )}
        </div>

        {/* User Menu */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2.5 p-1.5 pl-3 rounded-xl bg-slate-850 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center text-xs font-bold">
                {user.full_name?.charAt(0) || 'U'}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-xs font-bold text-white leading-none">{user.full_name}</p>
                <p className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">{user.role}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 glass-panel rounded-xl shadow-2xl p-2 border border-slate-700 z-50">
                <div className="px-3 py-2 border-b border-slate-800">
                  <p className="text-xs font-bold text-white">{user.full_name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                  <p className="text-[10px] text-sky-400 font-medium mt-1">{user.job_title}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full mt-1 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
