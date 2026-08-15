import React from 'react';

export const LoadingSpinner = ({ label = 'Loading...', size = 'md' }) => {
  const sizes = { sm: 'h-4 w-4 border-2', md: 'h-8 w-8 border-3', lg: 'h-12 w-12 border-4' };
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <div className={`border-[#006A4E] border-t-transparent rounded-full animate-spin ${sizes[size] || sizes.md}`} />
      {label && <p className="text-xs font-bold text-slate-500">{label}</p>}
    </div>
  );
};

export default LoadingSpinner;
