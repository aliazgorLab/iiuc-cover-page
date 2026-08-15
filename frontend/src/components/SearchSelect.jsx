import React from 'react';

export const SearchSelect = ({ items, onSelect, renderItem, show }) => {
  if (!show || !items || !Array.isArray(items) || items.length === 0) return null;

  return (
    <div className="absolute z-[100] w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto divide-y divide-gray-100">
      {(items || []).map((item, index) => (
        <div
          key={index}
          onClick={() => onSelect(item)}
          className="px-4 py-3 hover:bg-[#006A4E]/5 cursor-pointer transition-colors"
        >
          {renderItem(item)}
        </div>
      ))}
    </div>
  );
};

export default SearchSelect;
