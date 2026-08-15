import React from 'react';

export const FormSection = ({ title, icon: Icon, badge, children }) => {
  return (
    <div className="institutional-card p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className="p-2 bg-[#006A4E]/10 text-[#006A4E] rounded-xl">
              <Icon className="h-4 w-4" />
            </div>
          )}
          <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">{title}</h3>
        </div>
        {badge && (
          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
            {badge}
          </span>
        )}
      </div>

      <div className="space-y-4">{children}</div>
    </div>
  );
};

export default FormSection;
