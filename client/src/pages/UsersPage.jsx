import React, { useState, useEffect } from 'react';
import { UserCog, Plus, Shield, CheckCircle2, Lock } from 'lucide-react';
import api from '../services/api';
import { Badge } from '../components/common/Badge';
import { Table } from '../components/common/Table';
import { Modal } from '../components/common/Modal';

export const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/workers');
      setUsers(res.data.workers);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">User Provisioning & Role Access</h1>
          <p className="text-xs text-slate-400 mt-1">Access controls for Employee, Team Lead, Workforce Planner, and HR Admin access tiers.</p>
        </div>
      </div>

      <Table headers={['User', 'Role Tier', 'Job Title', 'Clinic Network', 'Status', 'Access Controls']}>
        {users.map((u) => (
          <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
            <td className="py-3.5 px-4 font-bold text-white text-xs">
              <p>{u.full_name}</p>
              <p className="text-[11px] text-slate-400 font-normal">{u.email}</p>
            </td>
            <td className="py-3.5 px-4">
              <Badge variant={u.role === 'HR Admin' ? 'purple' : u.role === 'Workforce Planner' ? 'primary' : 'default'}>
                {u.role}
              </Badge>
            </td>
            <td className="py-3.5 px-4 text-xs text-slate-300 font-semibold">{u.job_title}</td>
            <td className="py-3.5 px-4 text-xs text-sky-400 font-medium">{u.clinic_name}</td>
            <td className="py-3.5 px-4">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active
              </span>
            </td>
            <td className="py-3.5 px-4">
              <button className="px-3 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold rounded-lg transition-colors">
                Configure RLS Policy
              </button>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
};
