import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ArrowRight, ShieldCheck, FileText, Microscope, Table, Users } from 'lucide-react';
import { useTemplateStore } from '../../stores/useTemplateStore';
import { useCoverStore } from '../../stores/useCoverStore';
import AssignmentCover from '../cover-generator/assignment/AssignmentCover';
import LabReportCover from '../cover-generator/lab-report/LabReportCover';
import LabIndexCover from '../cover-generator/lab-index/LabIndexCover';
import ProjectCover from '../../components/covers/ProjectCover';

export const TemplateGallery = () => {
  const navigate = useNavigate();
  const { templates, fetchTemplates, isLoading } = useTemplateStore();
  const { setActiveTab } = useCoverStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const mapTypeToTab = (type) => {
    switch (type?.toUpperCase()) {
      case 'ASSIGNMENT':
        return 'assignment';
      case 'LAB_REPORT':
        return 'labReport';
      case 'LAB_INDEX':
        return 'labIndex';
      case 'PROJECT':
        return 'project';
      default:
        return 'assignment';
    }
  };

  const handleUseTemplate = (type) => {
    const tab = mapTypeToTab(type);
    setActiveTab(tab);
    
    // Map URL slug for clean routing
    const slugMap = {
      assignment: 'assignment',
      labReport: 'lab-report',
      labIndex: 'lab-index',
      project: 'project',
    };

    navigate(`/create?type=${slugMap[tab] || 'assignment'}`);
  };

  const filteredTemplates = templates.filter((tpl) => {
    const matchesSearch =
      tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tpl.description && tpl.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory =
      categoryFilter === 'ALL' || tpl.type?.toUpperCase() === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const sampleData = {
    assignmentTitle: 'Implementation of Cryptographic Hash Functions',
    courseCode: 'CSE-431',
    courseTitle: 'Information Security & Cryptography',
    teacherName: 'Prof. Dr. Md. Monirul Islam',
    teacherDesignation: 'Professor & Head',
    teacherDept: 'Dept. of Computer Science & Engineering',
    studentName: 'ALI AZGOR',
    studentId: 'C233093',
    section: 'A',
    semester: '8th',
    studentDept: 'Dept. of Computer Science & Engineering',
    submissionDate: '2026-08-15',
    experimentNo: '01',
    experimentName: 'Performance Analysis of AES Encryption Algorithm',
    departmentName: 'Dept. of Computer Science & Engineering',
    projectName: 'Cloud Document Portal for Academic Institutions',
    experiments: [
      { no: '1', date: '01/08/26', name: 'Study of AES Encryption', page: '01-05', mark: '10', dateSub: '05/08/26', sign: 'OK' },
      { no: '2', date: '08/08/26', name: 'Implementation of SHA-256', page: '06-10', mark: '10', dateSub: '12/08/26', sign: 'OK' },
    ],
    members: [
      { name: 'ALI AZGOR', id: 'C233093' },
      { name: 'MD. HASAN', id: 'C233094' },
    ],
  };

  const renderMiniCoverPreview = (type) => {
    switch (type?.toUpperCase()) {
      case 'ASSIGNMENT':
        return <AssignmentCover data={sampleData} />;
      case 'LAB_REPORT':
        return <LabReportCover data={sampleData} />;
      case 'LAB_INDEX':
        return <LabIndexCover data={sampleData} />;
      case 'PROJECT':
        return <ProjectCover {...sampleData} />;
      default:
        return <AssignmentCover data={sampleData} />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeInUp">
      
      {/* Catalog Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#006A4E]/10 border border-[#006A4E]/20 rounded-full text-xs font-black text-[#006A4E]">
          <ShieldCheck className="h-4 w-4" />
          <span>Official Academic Catalog</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Academic Document Templates
        </h1>
        <p className="text-sm font-medium text-slate-600">
          Find the right format for your coursework. Standardized A4 printable layouts for IIUC students.
        </p>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="institutional-card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates by title..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#006A4E] outline-none"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 w-full md:w-auto">
          {[
            { id: 'ALL', label: 'All Templates' },
            { id: 'ASSIGNMENT', label: 'Assignment' },
            { id: 'LAB_REPORT', label: 'Lab Report' },
            { id: 'LAB_INDEX', label: 'Lab Index' },
            { id: 'PROJECT', label: 'Project' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                categoryFilter === cat.id
                  ? 'bg-[#006A4E] text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Catalog Grid */}
      {isLoading ? (
        <div className="text-center py-16 text-xs font-bold text-slate-500">
          Loading academic template catalog...
        </div>
      ) : filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredTemplates.map((tpl) => (
            <div key={tpl._id || tpl.slug} className="institutional-card p-4 flex flex-col justify-between space-y-4 group">
              <div className="space-y-3">
                
                {/* Scaled Realistic Cover Document Preview */}
                <div className="w-full h-72 bg-slate-100 border border-slate-200 rounded-xl overflow-hidden relative shadow-inner flex items-center justify-center">
                  <div className="transform scale-[0.32] origin-top-left -mr-[130%] -mb-[120%] pointer-events-none select-none">
                    {renderMiniCoverPreview(tpl.type)}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-extrabold text-[#006A4E] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {tpl.type}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">v{tpl.version || '1.0'}</span>
                  </div>

                  <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-[#006A4E] transition-colors">
                    {tpl.name}
                  </h3>
                  <p className="text-[11px] font-medium text-slate-500 line-clamp-2 mt-1">
                    {tpl.description}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleUseTemplate(tpl.type)}
                className="w-full btn-iiuc-primary text-xs !py-2.5 shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Use Template</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="institutional-card p-12 text-center text-slate-500 font-bold text-xs">
          No templates match your search criteria.
        </div>
      )}
    </div>
  );
};

export default TemplateGallery;
