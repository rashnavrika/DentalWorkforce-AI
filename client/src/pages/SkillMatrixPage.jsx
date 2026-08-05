import React, { useState, useEffect } from 'react';
import { Grid, Flame, ShieldAlert, Sparkles, Filter, CheckCircle2, Plus, Edit3, Save } from 'lucide-react';
import api from '../services/api';
import { Badge } from '../components/common/Badge';
import { Table } from '../components/common/Table';
import { Modal } from '../components/common/Modal';

export const SkillMatrixPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Edit Skill Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [newProficiency, setNewProficiency] = useState(4);

  const fetchMatrix = async () => {
    setLoading(true);
    try {
      const res = await api.get('/workers/skills/matrix');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load matrix:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatrix();
  }, []);

  const handleEditSkillLevel = (practitioner, skill) => {
    setSelectedSkill({ practitioner, skill });
    setNewProficiency(practitioner.skills[skill.id]?.proficiency || 3);
    setIsModalOpen(true);
  };

  const handleSaveSkillLevel = () => {
    if (selectedSkill && data) {
      const updatedMatrix = data.matrix.map(w => {
        if (w.worker_id === selectedSkill.practitioner.worker_id) {
          return {
            ...w,
            skills: {
              ...w.skills,
              [selectedSkill.skill.id]: {
                proficiency: Number(newProficiency),
                verified: true
              }
            }
          };
        }
        return w;
      });
      setData({ ...data, matrix: updatedMatrix });
      setIsModalOpen(false);
    }
  };

  if (loading || !data) {
    return <div className="p-8 text-center text-sky-400 font-semibold text-xs">Loading Competency Grid...</div>;
  }

  const { skillsTaxonomy, matrix, gapHeatMap } = data;

  const filteredSkills = selectedCategory
    ? skillsTaxonomy.filter((s) => s.category === selectedCategory)
    : skillsTaxonomy;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Dynamic Skill Matrix & Heat Maps</h1>
          <p className="text-xs text-slate-400 mt-1">Cross-clinic 1-5 proficiency grid mapping and real-time gap heat maps.</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-sky-500"
          >
            <option value="">All Categories</option>
            <option value="Surgical">Surgical</option>
            <option value="Preventive">Preventive</option>
            <option value="Ortho">Ortho</option>
            <option value="Pediatric">Pediatric</option>
            <option value="Sedation">Sedation</option>
            <option value="General">General</option>
          </select>
        </div>
      </div>

      {/* Clinic Gap Heat Map Widget */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" /> Clinic Skill Deficit & Capacity Heat Map
          </h3>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1 text-emerald-400"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Green (Optimal)</span>
            <span className="flex items-center gap-1 text-amber-400"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Yellow (Moderate Gap)</span>
            <span className="flex items-center gap-1 text-rose-400"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Red (Critical Deficit)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {gapHeatMap.map((gap) => (
            <div
              key={gap.skill_id}
              className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                gap.status === 'Red'
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  : gap.status === 'Yellow'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider opacity-80">
                  <span>{gap.category}</span>
                  <span>{gap.status}</span>
                </div>
                <h4 className="font-extrabold text-xs text-white mt-1 leading-snug">{gap.skill_name}</h4>
              </div>
              <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-semibold">
                <span>Qualified Experts (L4-5):</span>
                <span className="font-mono text-xs font-bold">{gap.expertCount} Staff</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cross-Practitioner Skill Matrix Grid */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Grid className="w-5 h-5 text-sky-400" /> Cross-Practitioner Competency Grid (Click any level to Edit Data)
        </h3>

        <div className="w-full overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 min-w-[180px]">Practitioner</th>
                <th className="py-3 px-4 min-w-[140px]">Clinic</th>
                {filteredSkills.map((s) => (
                  <th key={s.id} className="py-3 px-3 text-center min-w-[110px]" title={s.description}>
                    <p className="text-[11px] font-bold text-slate-200">{s.name}</p>
                    <p className="text-[9px] text-slate-500 normal-case">{s.category}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs text-slate-200">
              {matrix.map((w) => (
                <tr key={w.worker_id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-bold text-white">{w.name}</p>
                    <p className="text-[10px] text-slate-400">{w.job_title}</p>
                  </td>
                  <td className="py-3 px-4 text-[11px] font-semibold text-sky-400 truncate max-w-[140px]">
                    {w.clinic_name}
                  </td>
                  {filteredSkills.map((s) => {
                    const skillData = w.skills[s.id];
                    const level = skillData ? skillData.proficiency : 0;
                    return (
                      <td key={s.id} className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleEditSkillLevel(w, s)}
                          className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg bg-slate-850 hover:bg-sky-500/20 hover:border-sky-500/50 border border-slate-700/80 transition-all group"
                          title="Click to edit skill level"
                        >
                          <span
                            className={`font-mono font-extrabold text-xs ${
                              level >= 4 ? 'text-emerald-400' : level >= 3 ? 'text-sky-400' : level > 0 ? 'text-amber-400' : 'text-slate-500'
                            }`}
                          >
                            {level > 0 ? `L${level}` : '+ Add'}
                          </span>
                          <Edit3 className="w-3 h-3 text-slate-500 group-hover:text-sky-400 transition-colors" />
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Skill Level Modal */}
      {selectedSkill && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Update Skill Rating: ${selectedSkill.skill.name}`}>
          <div className="space-y-4">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs">
              <p className="font-bold text-white">{selectedSkill.practitioner.name}</p>
              <p className="text-slate-400">{selectedSkill.practitioner.job_title} — {selectedSkill.practitioner.clinic_name}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Skill Proficiency Level (1 to 5 Scale)</label>
              <select
                value={newProficiency}
                onChange={(e) => setNewProficiency(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
              >
                <option value="1">Level 1 - Fundamental / Novice</option>
                <option value="2">Level 2 - Basic Competency</option>
                <option value="3">Level 3 - Intermediate Practitioner</option>
                <option value="4">Level 4 - Advanced Specialist</option>
                <option value="5">Level 5 - Expert / Clinical Master</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSkillLevel}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-sky-500/20"
              >
                <Save className="w-4 h-4" /> Save Skill Rating
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
