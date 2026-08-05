import React from 'react';
import { Sparkles } from 'lucide-react';

export const AIBadge = ({ label = 'AI Recommendation', version = 'Grok-v2.5' }) => {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-sky-500/20 via-purple-500/20 to-indigo-500/20 border border-sky-500/30 rounded-full text-xs font-semibold text-sky-300 shadow-sm">
      <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
      <span>{label}</span>
      <span className="text-[10px] bg-slate-900/80 px-1.5 py-0.5 rounded text-sky-200 border border-sky-400/20">
        {version}
      </span>
    </div>
  );
};
