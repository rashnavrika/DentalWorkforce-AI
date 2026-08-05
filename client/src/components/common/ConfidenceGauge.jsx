import React from 'react';

export const ConfidenceGauge = ({ score = 0.92, label = 'AI Match Confidence' }) => {
  const percent = Math.round(score * 100);
  
  let colorClass = 'text-emerald-400 stroke-emerald-500';
  if (percent < 70) colorClass = 'text-rose-400 stroke-rose-500';
  else if (percent < 85) colorClass = 'text-amber-400 stroke-amber-500';

  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-3 glass-card rounded-xl">
      <div className="relative flex items-center justify-center w-24 h-24">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            className="stroke-slate-800"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            className={`${colorClass} transition-all duration-1000 ease-out`}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-xl font-extrabold text-white">{percent}%</span>
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Fit</span>
        </div>
      </div>
      <span className="mt-2 text-xs font-semibold text-slate-300 text-center">{label}</span>
    </div>
  );
};
