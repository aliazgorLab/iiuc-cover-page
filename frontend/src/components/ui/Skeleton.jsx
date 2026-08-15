import React from 'react';

export const Skeleton = ({ className = '', height = 'h-4', width = 'w-full' }) => (
  <div
    className={`bg-slate-200 animate-pulse rounded ${height} ${width} ${className}`}
  />
);

export default Skeleton;
