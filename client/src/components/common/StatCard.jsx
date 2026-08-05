import React from 'react';

export const StatCard = ({ title, value, unit = '', trend, trendType = 'positive', icon: Icon, description }) => {
  const trendColor = trendType === 'positive' ? 'text-emerald-400' : 'text-rose-400';

  return (
    <div className="glass-card p-5 rounded-xl flex flex-col justify-between hover:border-sky-500/30 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">{value}</span>
            {unit && <span className="text-sm font-medium text-slate-400">{unit}</span>}
          </div>
        </div>
        {Icon && (
          <div className="p-2.5 bg-sky-500/10 border border-sky-500/20 rounded-lg text-sky-400">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(trend || description) && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          {trend && (
            <span className={`font-semibold ${trendColor} flex items-center gap-1`}>
              {trend}
            </span>
          )}
          {description && <span className="text-slate-400 truncate">{description}</span>}
        </div>
      )}
    </div>
  );
};
