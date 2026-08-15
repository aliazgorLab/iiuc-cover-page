import React from 'react';
import { User, CheckCircle } from 'lucide-react';

export const StudentProfileCard = ({
  studentName,
  studentId,
  departmentName,
  autoSaved,
}) => {
  return (
    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/60 rounded-2xl p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-[#006A4E] text-white rounded-xl shadow-md">
          <User className="h-6 w-6" />
        </div>
        <div>
          <h4 className="font-bold text-gray-900 text-base">
            {studentName || 'Student Name'}
          </h4>
          <p className="text-xs text-gray-600 font-medium">
            ID: <span className="text-[#006A4E] font-bold">{studentId || 'CXXXXXX'}</span> | Dept: {departmentName || 'N/A'}
          </p>
        </div>
      </div>
      {autoSaved && (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full animate-fadeInUp">
          <CheckCircle className="h-3.5 w-3.5 text-green-600" />
          Auto-saved
        </span>
      )}
    </div>
  );
};

export default StudentProfileCard;
