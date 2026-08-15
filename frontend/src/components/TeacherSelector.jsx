import React from 'react';
import FormInput from './FormInput';
import SearchSelect from './SearchSelect';
import { filterTeachers } from '../utils/autoSuggest';

export const TeacherSelector = ({
  teacherName,
  teacherDesignation,
  teacherDept,
  isGuest,
  onUpdateField,
  onToggleGuest,
}) => {
  const [suggestions, setSuggestions] = React.useState([]);
  const [showSuggestions, setShowSuggestions] = React.useState(false);

  const handleSearch = async (e) => {
    const value = e.target.value;
    onUpdateField('teacherName', value);

    if (!isGuest && value.trim()) {
      try {
        const filtered = await filterTeachers(value);
        if (Array.isArray(filtered)) {
          setSuggestions(filtered);
          setShowSuggestions(filtered.length > 0);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (err) {
        console.warn('Teacher search error:', err);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelect = (teacher) => {
    if (!teacher) return;
    onUpdateField('teacherName', teacher.name || '');
    onUpdateField('teacherDesignation', teacher.designation || '');
    onUpdateField('teacherDept', teacher.department || '');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className="space-y-4">
      {/* Guest Teacher Toggle */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="guestTeacherCheckbox"
          checked={isGuest}
          onChange={(e) => onToggleGuest(e.target.checked)}
          className="w-4 h-4 text-[#006A4E] rounded focus:ring-2 focus:ring-[#006A4E]/30"
        />
        <label
          htmlFor="guestTeacherCheckbox"
          className="text-xs font-semibold text-gray-700 cursor-pointer"
        >
          Guest / External Teacher? (Type details manually)
        </label>
      </div>

      {/* Teacher Name Input with Dropdown */}
      <div className="relative z-30">
        <FormInput
          label="Teacher Name"
          value={teacherName}
          onChange={handleSearch}
          placeholder={
            isGuest ? 'Type guest teacher name' : 'Start typing teacher name...'
          }
        />
        <SearchSelect
          show={!isGuest && showSuggestions}
          items={suggestions}
          onSelect={handleSelect}
          renderItem={(teacher) => (
            <div>
              <div className="font-semibold text-gray-900">{teacher.name}</div>
              <div className="text-xs text-gray-600">{teacher.designation}</div>
              <div className="text-[11px] text-[#006A4E] font-medium">{teacher.department}</div>
            </div>
          )}
        />
      </div>

      {/* Designation & Department */}
      <div className="grid md:grid-cols-2 gap-4">
        <FormInput
          label="Designation"
          value={teacherDesignation}
          onChange={(e) => onUpdateField('teacherDesignation', e.target.value)}
          placeholder="Professor / Lecturer"
          disabled={!isGuest}
        />
        <FormInput
          label="Department"
          value={teacherDept}
          onChange={(e) => onUpdateField('teacherDept', e.target.value)}
          placeholder="Dept. of CSE, IIUC"
          disabled={!isGuest}
        />
      </div>
    </div>
  );
};

export default TeacherSelector;
