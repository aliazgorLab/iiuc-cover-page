import React from 'react';
import FormInput from './FormInput';
import SearchSelect from './SearchSelect';
import {
  filterCoursesByCode,
  filterCoursesByTitle,
} from '../utils/autoSuggest';

export const CourseSelector = ({
  courseCode,
  courseTitle,
  onUpdateField,
}) => {
  const [codeSuggestions, setCodeSuggestions] = React.useState([]);
  const [titleSuggestions, setTitleSuggestions] = React.useState([]);
  const [activeField, setActiveField] = React.useState(''); // 'code' or 'title'

  const handleCodeSearch = async (e) => {
    const val = e.target.value;
    onUpdateField('courseCode', val);
    setActiveField('code');

    if (val.trim()) {
      try {
        const res = await filterCoursesByCode(val);
        setCodeSuggestions(Array.isArray(res) ? res : []);
      } catch (err) {
        setCodeSuggestions([]);
      }
    } else {
      setCodeSuggestions([]);
    }
  };

  const handleTitleSearch = async (e) => {
    const val = e.target.value;
    onUpdateField('courseTitle', val);
    setActiveField('title');

    if (val.trim()) {
      try {
        const res = await filterCoursesByTitle(val);
        setTitleSuggestions(Array.isArray(res) ? res : []);
      } catch (err) {
        setTitleSuggestions([]);
      }
    } else {
      setTitleSuggestions([]);
    }
  };

  const handleSelect = (course) => {
    if (!course) return;
    const finalCode = course.code || course.courseCode || '';
    const finalTitle = course.title || course.courseTitle || '';
    onUpdateField('courseCode', finalCode);
    onUpdateField('courseTitle', finalTitle);
    setCodeSuggestions([]);
    setTitleSuggestions([]);
    setActiveField('');
  };

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* Course Code Input */}
      <div className="relative z-40">
        <FormInput
          label="Course Code"
          value={courseCode}
          onChange={handleCodeSearch}
          placeholder="e.g., CSE-1101"
        />
        <SearchSelect
          show={activeField === 'code' && codeSuggestions.length > 0}
          items={codeSuggestions}
          onSelect={handleSelect}
          renderItem={(course) => (
            <div>
              <div className="font-bold text-[#006A4E]">{course?.code || course?.courseCode}</div>
              <div className="text-xs text-gray-700">{course?.title || course?.courseTitle}</div>
            </div>
          )}
        />
      </div>

      {/* Course Title Input */}
      <div className="relative z-40">
        <FormInput
          label="Course Title"
          value={courseTitle}
          onChange={handleTitleSearch}
          placeholder="e.g., Computer Fundamentals"
        />
        <SearchSelect
          show={activeField === 'title' && titleSuggestions.length > 0}
          items={titleSuggestions}
          onSelect={handleSelect}
          renderItem={(course) => (
            <div>
              <div className="font-semibold text-gray-900">{course?.title || course?.courseTitle}</div>
              <div className="text-xs text-[#006A4E] font-bold">{course?.code || course?.courseCode}</div>
            </div>
          )}
        />
      </div>
    </div>
  );
};

export default CourseSelector;
