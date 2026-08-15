import React from 'react';

export const Button = ({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'
  size = 'md',        // 'sm' | 'md' | 'lg'
  isLoading = false,
  disabled = false,
  icon: Icon,
  className = '',
  ...props
}) => {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold tracking-[0.01em] rounded-lg transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed';

  const variants = {
    primary:   'bg-[#006A4E] text-white hover:bg-[#005540] shadow-sm',
    secondary: 'bg-[#1a1a50] text-white hover:bg-[#12123b] shadow-sm',
    outline:   'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
    danger:    'bg-red-600 text-white hover:bg-red-700 shadow-sm',
    ghost:     'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  return (
    <button
      className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : Icon ? (
        <Icon className="h-4 w-4" />
      ) : null}
      <span>{children}</span>
    </button>
  );
};

export default Button;
