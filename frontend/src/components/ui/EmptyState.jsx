import React from 'react';

export const EmptyState = ({
  icon: Icon,
  title = 'No Items Found',
  description = 'There are no records to display at this time.',
  actionLabel,
  onAction,
}) => (
  <div className="py-12 px-6 text-center bg-white border border-slate-200 rounded-xl space-y-3">
    {Icon && (
      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
        <Icon className="h-6 w-6" />
      </div>
    )}
    <h3 className="text-sm font-black text-slate-900">{title}</h3>
    <p className="text-xs font-medium text-slate-500 max-w-sm mx-auto leading-relaxed">{description}</p>
    {actionLabel && onAction && (
      <button
        onClick={onAction}
        className="inline-flex items-center gap-2 px-4 py-2 bg-[#006A4E] text-white text-xs font-bold rounded-lg hover:bg-[#005540] transition-all cursor-pointer mt-2"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

export default EmptyState;
