import React, { useState, useEffect } from 'react';
import { Settings, FileText, Sliders, Plus, ShieldCheck, RefreshCw } from 'lucide-react';
import api from '../services/api';
import { Badge } from '../components/common/Badge';
import { Table } from '../components/common/Table';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';

export const AuditSettingsPage = () => {
  const [logs, setLogs] = useState([]);
  const [taxonomy, setTaxonomy] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.85);

  // New Skill Form Modal
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Surgical');
  const [newSkillDesc, setNewSkillDesc] = useState('');

  const { user } = useAuth();

  const fetchAuditData = async () => {
    setLoading(true);
    try {
      const [logsRes, taxRes] = await Promise.all([
        api.get('/audit/logs'),
        api.get('/audit/taxonomy'),
      ]);
      setLogs(logsRes.data.logs);
      setTaxonomy(taxRes.data.taxonomy);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditData();
  }, []);

  const handleAddSkillTaxonomy = async (e) => {
    e.preventDefault();
    try {
      await api.post('/audit/taxonomy', {
        name: newSkillName,
        category: newSkillCategory,
        description: newSkillDesc,
      });
      setIsSkillModalOpen(false);
      setNewSkillName('');
      setNewSkillDesc('');
      fetchAuditData();
    } catch (err) {
      console.error('Error adding skill:', err);
      alert('Failed to add skill to master taxonomy.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-black text-white tracking-tight">Audit Logs & System Settings</h1>
        <p className="text-xs text-slate-400 mt-1">Append-only system audit trails, AI confidence threshold sliders, and master skill taxonomy management.</p>
      </div>

      {/* AI Confidence Threshold Configuration */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Sliders className="w-5 h-5 text-sky-400" /> Grok AI Model Governance Thresholds
        </h3>

        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-200">Minimum AI Recommendation Confidence Threshold</span>
            <span className="font-mono font-extrabold text-sky-400 text-sm">
              {Math.round(confidenceThreshold * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0.50"
            max="0.99"
            step="0.01"
            value={confidenceThreshold}
            onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
          />
          <p className="text-[11px] text-slate-400">
            Recommendations below this threshold flag an explicit low-confidence warning requiring senior manager approval.
          </p>
        </div>
      </div>

      {/* Master Skill Taxonomy Management */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-400" /> Master Dental Skill Taxonomy ({taxonomy.length} Entries)
          </h3>
          {user?.role === 'HR Admin' && (
            <button
              onClick={() => setIsSkillModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Master Skill
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {taxonomy.map((sk) => (
            <div key={sk.id} className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white truncate">{sk.name}</span>
                <Badge variant="purple">{sk.category}</Badge>
              </div>
              <p className="text-[10px] text-slate-400 line-clamp-2">{sk.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Immutable Append-Only System Audit Logs Viewer */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-400" /> Immutable System Audit Log Trails
        </h3>

        <Table headers={['Timestamp', 'User Operator', 'Action Event Type', 'Target Entity', 'IP Address', 'Metadata Details']}>
          {logs.map((log) => (
            <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
              <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{new Date(log.created_at).toLocaleString()}</td>
              <td className="py-3 px-4 font-bold text-white text-xs">
                {log.user_name}
                <span className="text-[10px] text-slate-400 font-normal block">{log.user_role}</span>
              </td>
              <td className="py-3 px-4">
                <Badge variant="primary">{log.action_type}</Badge>
              </td>
              <td className="py-3 px-4 text-xs font-mono text-sky-300">{log.entity_affected}</td>
              <td className="py-3 px-4 text-xs font-mono text-slate-400">{log.ip_address}</td>
              <td className="py-3 px-4 text-[11px] text-slate-300 font-mono max-w-xs truncate">
                {JSON.stringify(log.details)}
              </td>
            </tr>
          ))}
        </Table>
      </div>

      {/* Add Master Skill Modal */}
      <Modal isOpen={isSkillModalOpen} onClose={() => setIsSkillModalOpen(false)} title="Add Master Skill to Taxonomy">
        <form onSubmit={handleAddSkillTaxonomy} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Skill Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Zygomatic Implant Surgery"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-sky-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Domain Category</label>
            <select
              value={newSkillCategory}
              onChange={(e) => setNewSkillCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-sky-500"
            >
              <option value="Surgical">Surgical</option>
              <option value="Preventive">Preventive</option>
              <option value="Ortho">Ortho</option>
              <option value="Pediatric">Pediatric</option>
              <option value="Sedation">Sedation</option>
              <option value="General">General</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Skill Description</label>
            <textarea
              rows={2}
              placeholder="Clinical description of procedures covered under this skill..."
              value={newSkillDesc}
              onChange={(e) => setNewSkillDesc(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-sky-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsSkillModalOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow"
            >
              Add Skill
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
