import React from 'react';

export const Badge = ({ children, variant = 'default', size = 'md' }) => {
  const base = 'inline-flex items-center font-medium rounded-full transition-colors';

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  const variants = {
    default: 'bg-slate-800 text-slate-300 border border-slate-700',
    primary: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
    success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    danger: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  };

  return (
    <span className={`${base} ${sizes[size]} ${variants[variant]}`}>
      {children}
    </span>
  );
};
