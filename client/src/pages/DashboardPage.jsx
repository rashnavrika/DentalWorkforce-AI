import React, { useState, useEffect } from 'react';
import {
  Activity,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Armchair,
  TrendingUp,
  Sparkles,
  RefreshCw,
  UserCheck,
  Award,
  Calendar,
  ShieldCheck,
  Briefcase,
  FileCheck,
  ChevronRight,
  Zap,
  Building2
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import api from '../services/api';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import { Table } from '../components/common/Table';
import { AIBadge } from '../components/common/AIBadge';
import { useAuth } from '../context/AuthContext';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/metrics');
      setData(res.data);
    } catch (err) {
      console.error('Error loading metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const chartData = [
    { time: '08:00', utilization: 65, waitTime: 8 },
    { time: '09:30', utilization: 88, waitTime: 14 },
    { time: '11:00', utilization: 94, waitTime: 18 },
    { time: '12:30', utilization: 72, waitTime: 10 },
    { time: '14:00', utilization: 96, waitTime: 16 },
    { time: '15:30', utilization: 90, waitTime: 12 },
    { time: '17:00', utilization: 78, waitTime: 9 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-sky-400 font-semibold gap-2">
        <RefreshCw className="w-5 h-5 animate-spin" /> Loading Telemetry for {user?.role}...
      </div>
    );
  }

  const roleView = data?.roleView || user?.role || 'Employee';

  return (
    <div className="space-y-6">
      {/* Personalized Welcome Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/60 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-2xl shadow-inner">
            <UserCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-white">Welcome, {user?.full_name || 'Practitioner'}</h2>
              <span className="text-xs px-2.5 py-0.5 bg-sky-500/20 text-sky-300 font-mono rounded-lg border border-sky-500/30">
                {user?.role}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {roleView === 'Employee' && `Personal Workstation Dashboard • Assigned to ${user?.clinic_name || 'Downtown Dental'}`}
              {roleView === 'Team Lead' && `Clinic Operations & Shift Supervision Dashboard • ${user?.clinic_name || 'Downtown Dental'}`}
              {roleView === 'Workforce Planner' && 'Network Capacity Planning & Load Rebalancing Telemetry'}
              {roleView === 'HR Admin' && 'Executive HR Governance, User Management & Compliance Telemetry'}
            </p>
          </div>
        </div>
        <button
          onClick={fetchDashboardData}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-850 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-sky-400 rounded-xl transition-all self-start md:self-auto"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Telemetry
        </button>
      </div>

      {/* ========================================================= */}
      {/* 1. EMPLOYEE DASHBOARD VIEW                                */}
      {/* ========================================================= */}
      {roleView === 'Employee' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Assigned Chair" value={data.kpis.assignedChair} unit="" trend="Active Shift" trendType="positive" icon={Armchair} description="Main Operatory Room" />
            <StatCard title="Weekly Capacity Hours" value={data.kpis.weeklyHoursWorked} unit="" trend="On Schedule" trendType="positive" icon={Clock} description="Full-Time Contract" />
            <StatCard title="My Burnout Score" value={data.kpis.burnoutScore} unit="" trend="Low Risk" trendType="positive" icon={Activity} description="Optimal Wellness Index" />
            <StatCard title="Today's Appointments" value={data.kpis.completedAppointments} unit="" trend="3 Scheduled" trendType="positive" icon={Calendar} description="On Time" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* My Patient Schedule Today */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-sky-400" /> My Assigned Patient Appointments Today
                </h3>
                <span className="text-xs text-sky-400 font-mono">3 Patients</span>
              </div>
              <Table headers={['Procedure Name', 'Patient Name', 'Scheduled Time', 'Assigned Operatory', 'Status']}>
                {data.myAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white text-xs">{apt.procedure}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-300">{apt.patient}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-400 font-mono">{apt.time}</td>
                    <td className="py-3.5 px-4"><Badge variant="primary">{apt.chair}</Badge></td>
                    <td className="py-3.5 px-4"><Badge variant={apt.status === 'In-Progress' ? 'success' : 'neutral'}>{apt.status}</Badge></td>
                  </tr>
                ))}
              </Table>
            </div>

            {/* My Skill Ratings & Certifications */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-sky-400" /> My Verified Clinical Skills
                </h3>
                <span className="text-[10px] text-emerald-400 font-mono">3 Skills Active</span>
              </div>
              <div className="space-y-3">
                {data.mySkills.map((s, idx) => (
                  <div key={idx} className="p-3 bg-slate-850 rounded-xl border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">{s.name}</span>
                      <span className="text-[10px] text-sky-400 font-mono font-semibold">{s.proficiency}</span>
                    </div>
                    <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Manager Verified
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. TEAM LEAD DASHBOARD VIEW                               */}
      {/* ========================================================= */}
      {roleView === 'Team Lead' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Clinic Chair Capacity" value={data.kpis.clinicCapacity} unit="" trend="+3.5% vs target" trendType="positive" icon={Armchair} description="Optimal Shift Loading" />
            <StatCard title="Active Team Practitioners" value={data.kpis.activeTeamMembers} unit="Members" trend="All On Shift" trendType="positive" icon={Users} description="Full Staffing" />
            <StatCard title="Pending AI Approvals" value={data.kpis.pendingApprovals} unit="Requests" trend="Requires Action" trendType="negative" icon={Sparkles} description="Candidate Matches" />
            <StatCard title="High Burnout Risk Flags" value={data.kpis.highBurnoutFlags} unit="Practitioner" trend="Review Shift" trendType="negative" icon={AlertTriangle} description="Dr. Alvarez" />
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-sky-400" /> Team Practitioners Shift & Wellness Monitor
              </h3>
              <AIBadge label="Clinic Shift Telemetry" />
            </div>
            <Table headers={['Practitioner Name', 'Job Title', 'Weekly Hours', 'Burnout Index', 'Shift Status']}>
              {data.teamMembers.map((tm) => (
                <tr key={tm.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white text-xs">{tm.name}</td>
                  <td className="py-3.5 px-4 text-xs text-slate-300">{tm.title}</td>
                  <td className="py-3.5 px-4 text-xs text-slate-400 font-mono">{tm.hours}</td>
                  <td className="py-3.5 px-4">
                    <span className={`text-xs font-bold ${tm.burnoutScore > 70 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {tm.burnoutScore}/100 ({tm.burnoutRisk})
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant={tm.status === 'Overloaded' ? 'danger' : 'success'}>{tm.status}</Badge>
                  </td>
                </tr>
              ))}
            </Table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. WORKFORCE PLANNER DASHBOARD VIEW                      */}
      {/* ========================================================= */}
      {roleView === 'Workforce Planner' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Network Chair Utilization" value={data.kpis.chairUtilization} unit="" trend="+4.2% optimal" trendType="positive" icon={Armchair} description="Across 10 Clinics" />
            <StatCard title="Total Managed Clinics" value={data.kpis.networkClinics} unit="Locations" trend="100% Online" trendType="positive" icon={Building2} description="Active Telemetry" />
            <StatCard title="Unassigned Procedures" value={data.kpis.unassignedProcedures} unit="Procedures" trend="Needs Matching" trendType="negative" icon={Zap} description="AI Match Available" />
            <StatCard title="Rebalancing Efficiency" value={data.kpis.rebalancingEfficiency} unit="" trend="Optimal" trendType="positive" icon={TrendingUp} description="Load Balancing" />
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-sky-400" /> Network Clinic Capacity & Loading Summary
            </h3>
            <Table headers={['Clinic Facility Name', 'Total Operatory Chairs', 'Chair Utilization Rate', 'Capacity Status']}>
              {data.networkSummary.map((net, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white text-xs">{net.clinic}</td>
                  <td className="py-3.5 px-4 text-xs text-slate-300 font-mono">{net.chairs} Operatory Chairs</td>
                  <td className="py-3.5 px-4 font-bold text-sky-400 text-xs">{net.utilization}</td>
                  <td className="py-3.5 px-4">
                    <Badge variant={net.status === 'Near Overload' ? 'danger' : net.status === 'Underutilized' ? 'neutral' : 'success'}>
                      {net.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </Table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. HR ADMIN DASHBOARD VIEW                                */}
      {/* ========================================================= */}
      {roleView === 'HR Admin' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Registered Users" value={data.kpis.totalStaffCount} unit="Users" trend="Active Database" trendType="positive" icon={Users} description="Supabase Auth" />
            <StatCard title="Network Clinic Locations" value={data.kpis.totalClinics} unit="Clinics" trend="10 active" trendType="positive" icon={Building2} description="Full Access" />
            <StatCard title="System HR Compliance" value={data.kpis.complianceRate} unit="" trend="Audited" trendType="positive" icon={ShieldCheck} description="HIPAA Compliant" />
            <StatCard title="Audit Logs Today" value={data.kpis.auditLogsToday} unit="Events" trend="Recorded" trendType="positive" icon={FileCheck} description="Security Log" />
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-sky-400" /> System Staffing & Role Governance Board
              </h3>
              <AIBadge label="Full Organization Telemetry" />
            </div>
            <Table headers={['Practitioner Name', 'Role & Access', 'Job Title', 'Assigned Clinic', 'Burnout Score', 'Status']}>
              {data.staffingBoard.map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white text-xs">{s.name}</td>
                  <td className="py-3.5 px-4"><Badge variant="primary">{s.role}</Badge></td>
                  <td className="py-3.5 px-4 text-xs text-slate-300">{s.job_title}</td>
                  <td className="py-3.5 px-4 text-xs text-slate-300">{s.clinic_name}</td>
                  <td className="py-3.5 px-4 font-mono text-xs font-semibold text-slate-300">{s.burnout_score}/100</td>
                  <td className="py-3.5 px-4"><Badge variant={s.burnout_risk === 'High' ? 'danger' : 'success'}>{s.status}</Badge></td>
                </tr>
              ))}
            </Table>
          </div>
        </div>
      )}
    </div>
  );
};
