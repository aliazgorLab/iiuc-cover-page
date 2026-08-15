import React from 'react';

export const CoverTemplate = ({ title, type, description, icon, onSelect, active = false }) => {
  return (
    <div
      onClick={onSelect}
      className={`bento-card p-6 cursor-pointer transition-all duration-300 ${
        active
          ? 'border-[#006A4E] bg-emerald-50/50 shadow-lg scale-[1.02]'
          : 'hover:border-gray-300 hover:scale-[1.01]'
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">{icon}</span>
        <div>
          <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
          <span className="text-xs text-[#006A4E] font-semibold uppercase tracking-wider">
            {type}
          </span>
        </div>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
};

export default CoverTemplate;
