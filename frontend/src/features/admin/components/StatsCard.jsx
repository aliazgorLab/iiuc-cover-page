import React from 'react';

/**
 * Reusable stat card for admin and student dashboard overview metrics.
 */
export const StatsCard = ({ label, value, icon: Icon, color = 'emerald', sub }) => {
  const colors = {
    emerald: { bg: 'bg-emerald-50', text: 'text-[#006A4E]', border: 'border-emerald-200/80', shadow: 'shadow-emerald-500/5' },
    navy:    { bg: 'bg-indigo-50',  text: 'text-[#172554]', border: 'border-indigo-200/80',  shadow: 'shadow-indigo-500/5' },
    amber:   { bg: 'bg-amber-50',   text: 'text-amber-700', border: 'border-amber-200/80',   shadow: 'shadow-amber-500/5' },
    slate:   { bg: 'bg-slate-50',   text: 'text-slate-600', border: 'border-slate-200',      shadow: 'shadow-slate-500/5' },
    red:     { bg: 'bg-red-50',     text: 'text-red-600',   border: 'border-red-200/80',     shadow: 'shadow-red-500/5' },
  };
  const c = colors[color] || colors.emerald;

  const isNumeric = typeof value === 'number' || (typeof value === 'string' && /^\d+$/.test(value.trim()));
  const isShortText = typeof value === 'string' && value.length <= 6;

  return (
    <div className={`bg-white rounded-2xl border ${c.border} p-4 sm:p-5 flex items-center gap-3.5 shadow-sm ${c.shadow} hover:shadow-md transition-all`}>
      <div className={`p-3 rounded-xl ${c.bg} shrink-0`}>
        <Icon className={`h-5 w-5 ${c.text}`} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-0.5">
          {label}
        </div>
        <div
          className={`font-black tracking-tight leading-tight truncate ${
            isNumeric
              ? 'text-2xl sm:text-3xl text-slate-900'
              : isShortText
              ? 'text-lg sm:text-xl text-[#006A4E]'
              : 'text-sm sm:text-base text-slate-900'
          }`}
          title={String(value || '')}
        >
          {value ?? <span className="text-slate-300">—</span>}
        </div>
        {sub && <div className="text-[11px] text-slate-500 font-medium truncate mt-0.5">{sub}</div>}
      </div>
    </div>
  );
};

export default StatsCard;
