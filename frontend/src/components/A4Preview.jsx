import React from 'react';
import { FileText } from 'lucide-react';

export const A4Preview = ({ children, title = 'Live Preview', badge = '' }) => {
  return (
    <div className="bento-card p-4 sm:p-6 w-full max-w-full">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-[#006A4E]" />
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        </div>
        {badge && (
          <span className="px-3 py-1 bg-[#F3CF45]/20 text-[#004d38] rounded-lg text-xs font-bold border border-[#F3CF45]/40">
            {badge}
          </span>
        )}
      </div>

      {/* A4 Document Scale Frame */}
      <div className="w-full max-w-[100vw] overflow-hidden">
        <div className="w-full flex justify-center overflow-hidden h-[600px] lg:h-[780px] border border-gray-200 rounded-2xl bg-gray-100/80 shadow-inner">
          <div className="transform scale-[0.45] sm:scale-[0.55] lg:scale-[0.63] origin-top mt-4 transition-transform duration-300">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default A4Preview;
