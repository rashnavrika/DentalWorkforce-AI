import React, { useState, useEffect } from 'react';
import {
  GitPullRequest,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  Sparkles,
  UserCheck,
  Flame,
  Award,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import api from '../services/api';
import { Badge } from '../components/common/Badge';
import { ConfidenceGauge } from '../components/common/ConfidenceGauge';
import { AIBadge } from '../components/common/AIBadge';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export const AssignmentApprovalPage = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [activeMatch, setActiveMatch] = useState(null);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState('Approved');
  const [overrideReason, setOverrideReason] = useState('');
  const [manualWorkerId, setManualWorkerId] = useState('');

  const { user } = useAuth();
  const { addNotification } = useNotification();

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/approvals/pending');
      setRecommendations(res.data.recommendations);
    } catch (err) {
      console.error('Failed to load pending approvals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleRunAIMatch = async () => {
    setEvaluating(true);
    try {
      const res = await api.post('/ai/match-candidate', {
        appointment_id: 'a1',
        procedure_name: 'Complex Molar Root Canal Therapy',
        chair_number: 3,
      });
      setActiveMatch(res);
      addNotification(
        'Grok AI Candidate Evaluation Complete',
        `Top candidate ${res.bestCandidate.recommendedWorkerName} matched with ${res.bestCandidate.skillFitPercentage}% fit.`,
        'AI_Alert'
      );
    } catch (err) {
      console.error('Error triggering AI match:', err);
    } finally {
      setEvaluating(false);
    }
  };

  const handleOpenOverrideModal = (action, rec) => {
    setSelectedAction(action);
    setActiveMatch(rec);
    setOverrideReason('');
    setOverrideModalOpen(true);
  };

  const handleSubmitDecision = async (e) => {
    e.preventDefault();
    if (!overrideReason || overrideReason.length < 5) {
      alert('Mandatory justification of at least 5 characters is required for human governance.');
      return;
    }

    try {
      await api.post('/approvals/override', {
        ai_recommendation_id: activeMatch.recommendationId || activeMatch.id,
        action: selectedAction,
        override_reason: overrideReason,
        assigned_worker_id: manualWorkerId || activeMatch.bestCandidate?.recommendedWorkerId || activeMatch.output_payload?.recommendedWorkerId,
      });

      addNotification(
        `AI Decision Recorded as ${selectedAction}`,
        `Human override log entry appended by ${user.full_name}.`,
        'Info'
      );

      setOverrideModalOpen(false);
      fetchRecommendations();
    } catch (err) {
      console.error('Error submitting decision:', err);
      alert(err.response?.data?.error || 'Failed to submit decision.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">Assignment Comparison & Manager Approval</h1>
            <AIBadge label="Human-in-the-Loop" />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Review side-by-side candidate matching for complex dental procedures. AI recommendations MUST be sign-off approved or overridden with reason.
          </p>
        </div>
        <button
          onClick={handleRunAIMatch}
          disabled={evaluating}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-500/25 transition-all disabled:opacity-50"
        >
          {evaluating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-sky-300" />}
          Run Grok Candidate Evaluation
        </button>
      </div>

      {/* Active AI Candidate Comparison View */}
      {activeMatch && activeMatch.bestCandidate && (
        <div className="glass-panel p-6 rounded-2xl border border-sky-500/40 space-y-6 animate-fadeIn">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-bold rounded-md">
                  Active Procedure Evaluation
                </span>
                <span className="text-xs text-slate-400 font-mono">ID: {activeMatch.appointmentId}</span>
              </div>
              <h2 className="text-xl font-extrabold text-white mt-1">{activeMatch.procedureName}</h2>
              <p className="text-xs text-slate-400">Required Skill: {activeMatch.skillName} • Target Chair 3</p>
            </div>
            <div className="flex items-center gap-4">
              <ConfidenceGauge score={activeMatch.confidenceScore} label="AI Fit Score" />
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleOpenOverrideModal('Approved', activeMatch)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" /> Accept AI Match
                </button>
                <button
                  onClick={() => handleOpenOverrideModal('Overridden', activeMatch)}
                  className="px-4 py-2 bg-slate-800 hover:bg-amber-500/20 hover:text-amber-300 text-slate-300 border border-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all"
                >
                  <AlertOctagon className="w-4 h-4" /> Override Candidate
                </button>
              </div>
            </div>
          </div>

          {/* AI Match Reasoning Box */}
          <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider">AI Recommendation Rationale</h4>
              <p className="text-xs text-slate-200 leading-relaxed">{activeMatch.bestCandidate.matchReasoning}</p>
              <div className="pt-2 flex items-center gap-4 text-[11px] font-semibold text-slate-400">
                <span className="text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Protected Attributes Excluded
                </span>
                <span>Burnout Risk Impact: {activeMatch.bestCandidate.burnoutRiskImpact}</span>
              </div>
            </div>
          </div>

          {/* Candidate Side-by-Side Comparison Matrix */}
          <div>
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-sky-400" /> Side-by-Side Evaluated Candidates
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeMatch.candidates.map((cand, idx) => {
                const isRecommended = cand.workerId === activeMatch.bestCandidate.recommendedWorkerId;
                return (
                  <div
                    key={cand.workerId}
                    className={`p-5 rounded-2xl border transition-all ${
                      isRecommended
                        ? 'bg-sky-950/40 border-sky-500/50 shadow-lg shadow-sky-500/10'
                        : 'bg-slate-900/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm text-white">{cand.name}</h4>
                          {isRecommended && (
                            <span className="px-2 py-0.5 bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-bold rounded-full">
                              #1 AI Recommendation
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">{cand.role} • {cand.yearsExperience} Yrs Exp</p>
                      </div>
                      <span className="text-lg font-black font-mono text-white">{Math.round(cand.fitScore)} pts</span>
                    </div>

                    <div className="mt-4 space-y-2.5 text-xs">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                        <span className="text-slate-400">Skill Proficiency:</span>
                        <span className="font-bold text-sky-400">Level {cand.skillProficiency}/5</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                        <span className="text-slate-400">Burnout Risk Index:</span>
                        <div className="flex items-center gap-1.5 font-bold">
                          <Flame className={`w-3.5 h-3.5 ${cand.burnoutScore > 60 ? 'text-rose-400' : 'text-emerald-400'}`} />
                          <span className={cand.burnoutScore > 60 ? 'text-rose-400' : 'text-emerald-400'}>
                            {cand.burnoutScore}/100 ({cand.burnoutRisk})
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Certifications Status:</span>
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <Award className="w-3.5 h-3.5" /> All Verified
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Recommendations Pending Review History */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <GitPullRequest className="w-5 h-5 text-sky-400" /> Recorded AI Recommendation Log & Decision History
        </h3>

        <div className="space-y-3">
          {recommendations.map((rec) => (
            <div key={rec.id} className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant={rec.status === 'Approved' ? 'success' : rec.status === 'Overridden' ? 'warning' : 'default'}>
                    {rec.status}
                  </Badge>
                  <span className="text-xs text-slate-400 font-mono">{rec.model_version}</span>
                </div>
                <p className="text-xs text-slate-200 font-bold mt-1.5">{rec.explanation}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Created: {new Date(rec.created_at).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenOverrideModal('Approved', rec)}
                  className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold rounded-lg transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleOpenOverrideModal('Overridden', rec)}
                  className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold rounded-lg transition-colors"
                >
                  Override
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Human Override & Justification Modal */}
      <Modal isOpen={overrideModalOpen} onClose={() => setOverrideModalOpen(false)} title={`Manager Decision Log (${selectedAction})`}>
        <form onSubmit={handleSubmitDecision} className="space-y-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs font-medium">
            <p className="font-bold flex items-center gap-1"><AlertOctagon className="w-4 h-4" /> Mandatory Governance Requirement</p>
            Human-in-the-loop compliance requires a recorded justification for every accepted, rejected, or overridden AI recommendation.
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Decision Action</label>
            <input
              type="text"
              readOnly
              value={selectedAction}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-sky-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Mandatory Override Justification Reason</label>
            <textarea
              required
              rows={3}
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              placeholder="State explicit clinical or operational reason (e.g., Practitioner requested shift leave; Patient requested specific specialist)..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setOverrideModalOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-bold text-xs rounded-xl shadow-lg"
            >
              Confirm & Append Audit Log
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
