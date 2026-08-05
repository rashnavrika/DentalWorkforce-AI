import React, { useState } from 'react';
import { GraduationCap, Award, BookOpen, UserCheck, AlertTriangle, Sparkles, RefreshCw, CheckCircle2, Plus, Edit3, Save } from 'lucide-react';
import api from '../services/api';
import { Badge } from '../components/common/Badge';
import { Table } from '../components/common/Table';
import { Modal } from '../components/common/Modal';

export const LearningMobilityPage = () => {
  const [learningPath, setLearningPath] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState('wp1');

  // Custom Target Goal Modal State
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [targetGoal, setTargetGoal] = useState('');
  const [targetCategory, setTargetCategory] = useState('Surgical');

  const certAlerts = [
    { practitioner: 'Dr. Elena Rostova', cert: 'BLS & ACLS Certification', expiry: '2026-08-15', status: 'Expiring_Soon', daysRemaining: 11 },
    { practitioner: 'Dr. Carlos Alvarez', cert: 'Intravenous Sedation Permit', expiry: '2026-08-10', status: 'Expiring_Soon', daysRemaining: 6 },
    { practitioner: 'Jessica Taylor, RDH', cert: 'Laser Safety Specialist', expiry: '2028-03-20', status: 'Active', daysRemaining: 580 },
  ];

  const handleGenerateLearningPath = async () => {
    setLoading(true);
    try {
      const res = await api.post('/ai/recommend-learning', { worker_id: selectedWorkerId });
      setLearningPath(res.data);
    } catch (err) {
      console.error('Failed to generate learning path:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGoal = () => {
    if (targetGoal) {
      setLearningPath({
        recommendedSkill: targetGoal,
        category: targetCategory,
        estimatedWeeksToComplete: 6,
        recommendedCourses: [
          { title: `Advanced Mastery: ${targetGoal}`, provider: 'American Dental Association (ADA)', format: 'Hands-on Clinical Seminar (16 CE Credits)' },
          { title: 'Intraoral Digital Impression & Laser Procedures', provider: 'Global Dental Academy', format: 'Interactive Virtual Masterclass (12 CE Credits)' }
        ],
        assignedMentor: 'Dr. Robert Chen (Chief Endodontist)',
        expectedImpactOnCapacity: '+18% increased procedure capacity & chair efficiency'
      });
      setIsGoalModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Automated Learning & Career Pathways</h1>
          <p className="text-xs text-slate-400 mt-1">30/15/7-day certification expiry tracking, upskilling pathways, and mentor pairing.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsGoalModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-850 hover:bg-slate-800 border border-slate-700 text-sky-400 text-xs font-bold rounded-xl transition-all"
          >
            <Edit3 className="w-4 h-4" /> Edit / Add Career Goal
          </button>
          <button
            onClick={handleGenerateLearningPath}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-500/25 transition-all disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-sky-300" />}
            Generate AI Upskilling Pathway
          </button>
        </div>
      </div>

      {/* Certification Expiry Alerts Widget */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-400" /> Proactive Certification Expiry Monitor
          </h3>
          <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
            2 Alerts Pending
          </span>
        </div>

        <Table headers={['Practitioner', 'Certification Title', 'Expiry Date', 'Days Remaining', 'Compliance Action']}>
          {certAlerts.map((c, idx) => (
            <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
              <td className="py-3 px-4 font-bold text-white text-xs">{c.practitioner}</td>
              <td className="py-3 px-4 text-xs text-slate-300">{c.cert}</td>
              <td className="py-3 px-4 text-xs font-mono text-slate-300">{c.expiry}</td>
              <td className="py-3 px-4">
                <span className={`text-xs font-bold font-mono ${c.daysRemaining <= 15 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {c.daysRemaining} Days
                </span>
              </td>
              <td className="py-3 px-4">
                <Badge variant={c.status === 'Active' ? 'success' : 'warning'}>
                  {c.status === 'Active' ? 'Verified' : 'Renewal Required'}
                </Badge>
              </td>
            </tr>
          ))}
        </Table>
      </div>

      {/* AI Learning & Mentor Pathway Output */}
      {learningPath && (
        <div className="glass-panel p-6 rounded-2xl border border-sky-500/40 space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="px-2.5 py-0.5 bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-bold rounded-md">
                Active Upskilling Plan
              </span>
              <h3 className="text-lg font-extrabold text-white mt-1">
                Target Skill: {learningPath.recommendedSkill} ({learningPath.category})
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-sky-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
              Duration: {learningPath.estimatedWeeksToComplete} Weeks
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Recommended CE Courses */}
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" /> Recommended Continuing Education (CE) Courses
              </h4>
              <div className="space-y-2 text-xs">
                {learningPath.recommendedCourses.map((crs, idx) => (
                  <div key={idx} className="p-3 bg-slate-850 rounded-lg border border-slate-800">
                    <p className="font-bold text-white">{crs.title}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{crs.provider} • {crs.format}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Mentor Pairing & Capacity Impact */}
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-4 h-4" /> Senior Mentor Pairing & Clinic Capacity Impact
              </h4>
              <div className="p-3 bg-slate-850 rounded-lg border border-slate-800 text-xs space-y-2">
                <p className="text-slate-300"><span className="font-bold text-white">Assigned Clinical Mentor:</span> {learningPath.assignedMentor}</p>
                <p className="text-slate-300"><span className="font-bold text-white">Target Capacity Impact:</span> {learningPath.expectedImpactOnCapacity}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Target Goal Modal */}
      {isGoalModalOpen && (
        <Modal isOpen={isGoalModalOpen} onClose={() => setIsGoalModalOpen(false)} title="Set Custom Upskilling Target Goal">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Dental Specialization / Skill</label>
              <input
                type="text"
                value={targetGoal}
                onChange={(e) => setTargetGoal(e.target.value)}
                placeholder="e.g. Zygomatic Implant Placement & Bone Grafting"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
              <select
                value={targetCategory}
                onChange={(e) => setTargetCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
              >
                <option value="Surgical">Surgical</option>
                <option value="Preventive">Preventive</option>
                <option value="Ortho">Ortho</option>
                <option value="Pediatric">Pediatric</option>
                <option value="Sedation">Sedation</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsGoalModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveGoal}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-sky-500/20"
              >
                <Save className="w-4 h-4" /> Save Career Pathway Goal
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
