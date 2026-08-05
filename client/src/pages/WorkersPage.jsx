import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, Plus, Award, Flame, BookOpen, CheckCircle, Edit, Save, Trash2 } from 'lucide-react';
import api from '../services/api';
import { Badge } from '../components/common/Badge';
import { Table } from '../components/common/Table';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';

export const WorkersPage = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  
  // Modals state
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Edit Form State
  const [editForm, setEditForm] = useState({});
  // Create Form State
  const [createForm, setCreateForm] = useState({
    full_name: '',
    email: '',
    job_title: 'Senior Associate Dentist',
    role: 'Employee',
    years_experience: 5,
    weekly_capacity_hours: 40,
    development_goals: 'Mastering advanced dental procedures'
  });

  const { user } = useAuth();
  const canDelete = user?.role === 'HR Admin' || user?.role === 'Team Lead';

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/workers', {
        params: { search: searchQuery, role: roleFilter },
      });
      setWorkers(res.data.workers || []);
    } catch (err) {
      console.error('Error fetching workers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, [searchQuery, roleFilter]);

  const handleOpenDetail = (worker) => {
    setSelectedWorker(worker);
    setEditForm({
      full_name: worker.full_name,
      job_title: worker.job_title,
      role: worker.role,
      weekly_capacity_hours: worker.weekly_capacity_hours,
      development_goals: worker.development_goals,
      burnout_risk_level: worker.burnout_risk_level
    });
    setIsEditing(false);
    setIsDetailOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      await api.put(`/workers/${selectedWorker.id}`, editForm);
      setIsEditing(false);
      setIsDetailOpen(false);
      await fetchWorkers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update worker profile.');
    }
  };

  const handleCreateWorker = async (e) => {
    e.preventDefault();
    try {
      await api.post('/workers', createForm);
      setIsCreateOpen(false);
      setCreateForm({
        full_name: '',
        email: '',
        job_title: 'Senior Associate Dentist',
        role: 'Employee',
        years_experience: 5,
        weekly_capacity_hours: 40,
        development_goals: 'Mastering advanced dental procedures'
      });
      await fetchWorkers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create worker profile.');
    }
  };

  const handleDeleteWorker = async (workerId) => {
    if (window.confirm('Are you sure you want to delete this practitioner profile?')) {
      try {
        await api.delete(`/workers/${workerId}`);
        setIsDetailOpen(false);
        await fetchWorkers();
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to delete worker profile.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Worker Profiles Directory</h1>
          <p className="text-xs text-slate-400 mt-1">Practitioner skills, certifications, burnout indicators, and capacity profiles.</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Provision / Add New Practitioner
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 glass-card p-3 rounded-2xl border border-slate-800">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by practitioner name, skill (e.g. Root Canal), or job title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-sky-500"
          >
            <option value="">All Roles</option>
            <option value="Employee">Employee (Dentist/Hygienist)</option>
            <option value="Team Lead">Team Lead</option>
            <option value="Workforce Planner">Workforce Planner</option>
            <option value="HR Admin">HR Admin</option>
          </select>
        </div>
      </div>

      {/* Workers Directory Table */}
      <Table headers={['Practitioner Name', 'Clinic & Role', 'Experience & Capacity', 'Burnout Index', 'Top Skill Mastery', 'Actions']}>
        {workers.map((w) => (
          <tr key={w.id} className="hover:bg-slate-800/40 transition-colors">
            <td className="py-3.5 px-4">
              <p className="font-bold text-white text-xs">{w.full_name}</p>
              <p className="text-[11px] text-slate-400">{w.email}</p>
            </td>
            <td className="py-3.5 px-4">
              <p className="text-xs font-semibold text-slate-200">{w.job_title}</p>
              <span className="text-[10px] text-sky-400 font-medium">{w.clinic_name}</span>
            </td>
            <td className="py-3.5 px-4 text-xs text-slate-300">
              <p className="font-semibold">{w.years_experience} Years Exp</p>
              <p className="text-[11px] text-slate-400">{w.weekly_capacity_hours} hrs/wk ({w.employment_type})</p>
            </td>
            <td className="py-3.5 px-4">
              <div className="flex items-center gap-2">
                <Flame className={`w-4 h-4 ${w.burnout_score > 70 ? 'text-rose-400 animate-pulse' : 'text-slate-500'}`} />
                <span className="text-xs font-mono font-bold text-slate-200">{w.burnout_score}/100</span>
                <Badge variant={w.burnout_risk_level === 'High' ? 'danger' : 'success'}>
                  {w.burnout_risk_level} Risk
                </Badge>
              </div>
            </td>
            <td className="py-3.5 px-4">
              <div className="flex flex-wrap gap-1">
                {(w.skills || []).slice(0, 2).map((s) => (
                  <span key={s.id || s.name} className="px-2 py-0.5 bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-medium rounded-md">
                    {s.name} (L{s.proficiency_level})
                  </span>
                ))}
              </div>
            </td>
            <td className="py-3.5 px-4">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenDetail(w)}
                  className="px-2.5 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  <Edit className="w-3.5 h-3.5" /> View / Edit
                </button>
                {canDelete && (
                  <button
                    onClick={() => handleDeleteWorker(w.id)}
                    className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg transition-colors"
                    title="Delete practitioner"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </Table>

      {/* Worker Detail / Edit Modal */}
      {selectedWorker && (
        <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title={`Practitioner Profile: ${selectedWorker.full_name}`}>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-900 rounded-xl border border-slate-800">
              <div>
                <h4 className="text-base font-extrabold text-white">{selectedWorker.full_name}</h4>
                <p className="text-xs text-sky-400 font-semibold">{selectedWorker.job_title} • {selectedWorker.role}</p>
                <p className="text-xs text-slate-400 mt-0.5">{selectedWorker.clinic_name}</p>
              </div>
              <div className="flex items-center gap-2">
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 rounded-lg text-xs font-bold border border-sky-500/30 transition-all"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit Data
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => handleDeleteWorker(selectedWorker.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 rounded-lg text-xs font-bold border border-rose-500/30 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                )}
              </div>
            </div>

            {isEditing ? (
              /* EDIT FORM FOR ALL ROLES */
              <div className="space-y-4 p-4 bg-slate-900/90 rounded-2xl border border-sky-500/30">
                <h5 className="text-xs font-bold text-sky-400 uppercase tracking-wider">Modify Practitioner Data</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={editForm.full_name}
                      onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Job Title</label>
                    <input
                      type="text"
                      value={editForm.job_title}
                      onChange={(e) => setEditForm({ ...editForm, job_title: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Role</label>
                    <select
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    >
                      <option value="Employee">Employee</option>
                      <option value="Team Lead">Team Lead</option>
                      <option value="Workforce Planner">Workforce Planner</option>
                      <option value="HR Admin">HR Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Weekly Capacity Hours</label>
                    <input
                      type="number"
                      value={editForm.weekly_capacity_hours}
                      onChange={(e) => setEditForm({ ...editForm, weekly_capacity_hours: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Development Goals</label>
                  <textarea
                    rows={2}
                    value={editForm.development_goals}
                    onChange={(e) => setEditForm({ ...editForm, development_goals: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Changes
                  </button>
                </div>
              </div>
            ) : (
              /* VIEW MODE */
              <div className="space-y-4">
                <div>
                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400" /> Verified Skill Proficiencies
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(selectedWorker.skills || []).map((s) => (
                      <div key={s.id || s.name} className="p-3 bg-slate-850 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-white">{s.name}</p>
                          <p className="text-[10px] text-slate-400">{s.category}</p>
                        </div>
                        <span className="font-mono font-bold text-sky-300">Level {s.proficiency_level}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
                  <h5 className="text-xs font-bold text-sky-400 flex items-center gap-1.5 mb-1">
                    <BookOpen className="w-4 h-4" /> Personal Development Targets
                  </h5>
                  <p className="text-xs text-slate-300 leading-relaxed">{selectedWorker.development_goals}</p>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Provision New Worker Modal */}
      {isCreateOpen && (
        <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Provision New Practitioner Profile">
          <form onSubmit={handleCreateWorker} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={createForm.full_name}
                  onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })}
                  placeholder="Dr. Maya Lin"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  placeholder="maya@dentalclinic.com"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Job Title</label>
                <input
                  type="text"
                  required
                  value={createForm.job_title}
                  onChange={(e) => setCreateForm({ ...createForm, job_title: e.target.value })}
                  placeholder="Lead Endodontist"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Role Level</label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                >
                  <option value="Employee">Employee</option>
                  <option value="Team Lead">Team Lead</option>
                  <option value="Workforce Planner">Workforce Planner</option>
                  <option value="HR Admin">HR Admin</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Development Goals</label>
              <textarea
                rows={2}
                value={createForm.development_goals}
                onChange={(e) => setCreateForm({ ...createForm, development_goals: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-sky-500/20"
              >
                Create & Provision Worker
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
