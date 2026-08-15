import React from 'react';

export const Badge = ({ children, variant = 'emerald', className = '' }) => {
  const variants = {
    emerald: 'bg-emerald-50 text-[#006A4E] border-emerald-200',
    navy:    'bg-indigo-50 text-[#1a1a50] border-indigo-200',
    amber:   'bg-amber-50 text-amber-800 border-amber-200',
    red:     'bg-red-50 text-red-700 border-red-200',
    slate:   'bg-slate-100 text-slate-600 border-slate-200',
    gold:    'bg-[#F3CF45]/20 text-amber-900 border-[#F3CF45]/40',
  };

  return (
    <span
      className={`inline-flex items-center text-[11px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-[0.05em] ${
        variants[variant] || variants.emerald
      } ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
