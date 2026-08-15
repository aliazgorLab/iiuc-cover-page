import React from 'react';

export const FormInput = ({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  small = false,
  disabled = false,
  error = '',
}) => {
  return (
    <div>
      {label && (
        <label
          className={`block font-semibold text-gray-700 mb-1.5 ${
            small ? 'text-xs' : 'text-sm'
          }`}
        >
          {label}
        </label>
      )}
      <input
        type={type}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-900 transition-all placeholder:text-gray-400 focus:border-[#006A4E] focus:outline-none focus:ring-2 focus:ring-[#006A4E]/20 ${
          small ? 'py-1.5 text-sm' : 'text-base'
        } ${disabled ? 'cursor-not-allowed bg-gray-100 opacity-75' : ''} ${
          error ? 'border-red-500 focus:ring-red-200' : ''
        }`}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default FormInput;
