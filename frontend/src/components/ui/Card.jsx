import React from 'react';

export const Card = ({ children, className = '', hover = false, padding = 'p-5' }) => (
  <div
    className={`bg-white border border-slate-200 rounded-xl shadow-sm ${
      hover ? 'hover:shadow-md hover:border-slate-300 transition-all' : ''
    } ${padding} ${className}`}
  >
    {children}
  </div>
);

export default Card;
