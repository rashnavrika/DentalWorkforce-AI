import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Grid,
  GitPullRequest,
  BrainCircuit,
  ShieldCheck,
  GraduationCap,
  FileBarChart,
  Bell,
  UserCog,
  Settings,
  Activity,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role || 'Employee';

  // Role-Specific Navigation Definitions with Strict Role Permitting
  const allNavItems = [
    {
      label: role === 'Employee' ? 'My Workstation' : role === 'Team Lead' ? 'Clinic Capacity' : role === 'Workforce Planner' ? 'Network Capacity' : 'Workforce Capacity',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['Employee', 'Team Lead', 'Workforce Planner', 'HR Admin']
    },
    {
      label: role === 'Employee' ? 'My Profile' : 'Worker Profiles',
      path: '/workers',
      icon: Users,
      roles: ['Employee', 'Team Lead', 'Workforce Planner', 'HR Admin']
    },
    {
      label: role === 'Employee' ? 'My Skill Matrix' : 'Skill Matrix',
      path: '/skill-matrix',
      icon: Grid,
      roles: ['Employee', 'Team Lead', 'Workforce Planner', 'HR Admin']
    },
    {
      label: 'Assignment Approvals',
      path: '/assignment-approval',
      icon: GitPullRequest,
      roles: ['Team Lead', 'Workforce Planner', 'HR Admin']
    },
    {
      label: 'Skill Intelligence',
      path: '/skill-intelligence',
      icon: BrainCircuit,
      roles: ['Team Lead', 'Workforce Planner', 'HR Admin']
    },
    {
      label: 'Fairness & Bias Review',
      path: '/fairness-review',
      icon: ShieldCheck,
      roles: ['Team Lead', 'Workforce Planner', 'HR Admin']
    },
    {
      label: 'Learning & Mobility',
      path: '/learning-mobility',
      icon: GraduationCap,
      roles: ['Employee', 'Team Lead', 'Workforce Planner', 'HR Admin']
    },
    {
      label: 'Reports & Analytics',
      path: '/reports',
      icon: FileBarChart,
      roles: ['Team Lead', 'Workforce Planner', 'HR Admin']
    },
    {
      label: 'Notifications & Alerts',
      path: '/notifications',
      icon: Bell,
      roles: ['Employee', 'Team Lead', 'Workforce Planner', 'HR Admin']
    },
    {
      label: 'User & Role Access',
      path: '/users',
      icon: UserCog,
      roles: ['HR Admin', 'Workforce Planner']
    },
    {
      label: 'Audit Logs & Settings',
      path: '/audit-settings',
      icon: Settings,
      roles: ['HR Admin', 'Team Lead']
    },
  ];

  // Completely filter out unaccessed pages so they are hidden from the user's sidebar
  const visibleNavItems = allNavItems.filter((item) => item.roles.includes(role));

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="p-2 bg-gradient-to-tr from-sky-600 to-indigo-600 rounded-xl shadow-lg shadow-sky-500/20 text-white">
          <Activity className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-extrabold text-base text-white tracking-tight flex items-center gap-1">
            DentalWorkforce <span className="text-xs px-1.5 py-0.5 bg-sky-500/20 text-sky-400 rounded font-mono border border-sky-500/30">AI</span>
          </h1>
          <p className="text-[11px] text-slate-400 font-medium truncate">Role-Tailored Intelligence</p>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          {role} Portal Links ({visibleNavItems.length})
        </p>
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Active User Context Footer */}
      {user && (
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="p-3 bg-slate-850 rounded-xl border border-slate-800/80">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Account</p>
            <p className="text-xs font-bold text-slate-200 mt-0.5 truncate">{user.full_name}</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[11px] text-sky-400 font-semibold px-2 py-0.5 bg-sky-500/10 rounded border border-sky-500/20">
                {user.role}
              </span>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> Live
              </span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
