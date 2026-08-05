import React from 'react';
import { ShieldCheck, Lock, EyeOff, CheckCircle2, AlertOctagon, FileText, Sparkles } from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { Table } from '../components/common/Table';

export const FairnessReviewPage = () => {
  const protectedAttributesExcluded = [
    { name: 'Gender & Sex', status: 'STRICTLY EXCLUDED', rationale: 'Removed from vector embeddings' },
    { name: 'Age & Birthdate', status: 'STRICTLY EXCLUDED', rationale: 'Filtered from candidate payload' },
    { name: 'Race & Ethnicity', status: 'STRICTLY EXCLUDED', rationale: 'Zero feature presence' },
    { name: 'Religion & Beliefs', status: 'STRICTLY EXCLUDED', rationale: 'Not collected or evaluated' },
    { name: 'Marital & Family Status', status: 'STRICTLY EXCLUDED', rationale: 'Completely unmapped' },
  ];

  const verifiableEvidenceIncluded = [
    { name: 'Skill Proficiency Level (1–5 Scale)', impact: 'Primary Weight (45%)', source: 'Manager Verified Matrix' },
    { name: 'Active Board Certifications', impact: 'Gatekeeper Criterion (30%)', source: 'State Dental Board API' },
    { name: 'Burnout Risk & Overtime Hours', impact: 'Safety Factor (15%)', source: 'Workload Telemetry' },
    { name: 'Shift & Chair Availability', impact: 'Hard Constraint (10%)', source: 'Clinic Operating Schedule' },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-black text-white tracking-tight">Assignment Fairness & Evidence Audit Review</h1>
          <Badge variant="success" size="lg">
            <ShieldCheck className="w-4 h-4 mr-1 inline" /> 100% Bias-Audited
          </Badge>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Governance audit portal verifying strict non-bias compliance. Protected personal demographics are prohibited from entering AI candidate decision loops.
        </p>
      </div>

      {/* Grid: Excluded vs Included Feature Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prohibited Attributes Excluded */}
        <div className="glass-panel p-6 rounded-2xl border border-emerald-500/30 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-emerald-400" /> Prohibited Demographics (Excluded)
            </h3>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
              AUDITED PASSED
            </span>
          </div>

          <div className="space-y-2.5">
            {protectedAttributesExcluded.map((attr, idx) => (
              <div key={idx} className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-white flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" /> {attr.name}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{attr.rationale}</p>
                </div>
                <Badge variant="success">{attr.status}</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Verifiable Objective Evidence Included */}
        <div className="glass-panel p-6 rounded-2xl border border-sky-500/30 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-sky-400" /> Verifiable Evidence Evaluated (Included)
            </h3>
            <span className="text-xs font-mono font-bold text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded border border-sky-500/20">
              OBJECTIVE FEATURES ONLY
            </span>
          </div>

          <div className="space-y-2.5">
            {verifiableEvidenceIncluded.map((ev, idx) => (
              <div key={idx} className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-white">{ev.name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Source: {ev.source}</p>
                </div>
                <Badge variant="primary">{ev.impact}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fairness Audit Log Summary */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-sky-400" /> Human Override Bias Inspection Certificate
        </h3>

        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2 text-xs text-slate-300">
          <div className="flex items-center gap-2 text-sky-400 font-bold">
            <Sparkles className="w-4 h-4" /> Grok AI Bias Audit Model Version: Grok-Workforce-v2.5
          </div>
          <p className="leading-relaxed">
            All candidate match requests execute against sanitized JSON feature schemas. Human overrides recorded by Clinic Managers are periodically cross-audited to ensure no algorithmic bias or arbitrary practitioner favoring occurs.
          </p>
        </div>
      </div>
    </div>
  );
};
