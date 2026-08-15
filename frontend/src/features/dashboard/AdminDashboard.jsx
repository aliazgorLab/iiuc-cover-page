import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, Layers, FileText, Building2, BookOpen, Settings, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../../config/apiConfig';

export const AdminDashboard = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTemplates: 4,
    totalCovers: 0,
    totalDepartments: 1,
  });
  const [userList, setUserList] = useState([]);
  const [templateList, setTemplateList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch Dashboard Stats
        const statsRes = await fetch(`${API_BASE_URL}/admin/dashboard-stats`, { headers });
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        // Fetch Users List
        const usersRes = await fetch(`${API_BASE_URL}/admin/users`, { headers });
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUserList(usersData);
        }

        // Fetch Templates List
        const tplRes = await fetch(`${API_BASE_URL}/admin/templates`, { headers });
        if (tplRes.ok) {
          const tplData = await tplRes.json();
          setTemplateList(tplData);
        }
      } catch (err) {
        toast.error('Failed to load administrative portal telemetry.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const adminRole = user?.role ? user.role.toUpperCase() : 'ADMIN';

  return (
    <div className="space-y-8 animate-fadeInUp">
      {/* IIUC Administration Portal Header */}
      <div className="bg-gradient-to-r from-[#1a1a50] via-[#006A4E] to-[#1a1a50] text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs font-black text-[#F3CF45]">
            <ShieldCheck className="h-4 w-4" />
            <span>IIUC Administration Portal</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight">
            Institutional Governance & Control Panel
          </h1>
          <p className="text-xs text-slate-200 font-medium">
            Authenticated Administrator: <span className="font-bold text-[#F3CF45]">{user?.name || 'Administrator'}</span> ({adminRole})
          </p>
        </div>
      </div>

      {/* Admin Module Navigation Bar */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
          { id: 'templates', label: 'Template Governance', icon: Layers },
          { id: 'students', label: 'Registered Students', icon: Users },
          { id: 'teachers', label: 'Faculty Directory', icon: ShieldCheck },
          { id: 'courses', label: 'Course Catalog', icon: BookOpen },
          { id: 'departments', label: 'Departments', icon: Building2 },
          { id: 'settings', label: 'System Settings', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#006A4E] text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Dashboard Statistics Overview */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="institutional-card p-6 space-y-2">
              <div className="p-3 bg-[#006A4E]/10 text-[#006A4E] rounded-xl w-fit">
                <Layers className="h-6 w-6" />
              </div>
              <div className="text-2xl font-black text-slate-900">{stats.totalTemplates}</div>
              <div className="text-xs font-extrabold text-[#006A4E] uppercase tracking-wider">Active Templates</div>
              <p className="text-[11px] font-medium text-slate-500">Standardized document formats</p>
            </div>

            <div className="institutional-card p-6 space-y-2">
              <div className="p-3 bg-indigo-50 text-[#1a1a50] rounded-xl w-fit">
                <Users className="h-6 w-6" />
              </div>
              <div className="text-2xl font-black text-slate-900">{stats.totalStudents}</div>
              <div className="text-xs font-extrabold text-[#1a1a50] uppercase tracking-wider">Registered Students</div>
              <p className="text-[11px] font-medium text-slate-500">IIUC academic accounts</p>
            </div>

            <div className="institutional-card p-6 space-y-2">
              <div className="p-3 bg-amber-50 text-amber-800 rounded-xl w-fit">
                <FileText className="h-6 w-6" />
              </div>
              <div className="text-2xl font-black text-slate-900">{stats.totalCovers}</div>
              <div className="text-xs font-extrabold text-amber-800 uppercase tracking-wider">Covers Generated</div>
              <p className="text-[11px] font-medium text-slate-500">Cloud submissions logged</p>
            </div>

            <div className="institutional-card p-6 space-y-2">
              <div className="p-3 bg-emerald-50 text-[#006A4E] rounded-xl w-fit">
                <Building2 className="h-6 w-6" />
              </div>
              <div className="text-2xl font-black text-slate-900">{stats.totalDepartments}</div>
              <div className="text-xs font-extrabold text-[#006A4E] uppercase tracking-wider">Departments</div>
              <p className="text-[11px] font-medium text-slate-500">Academic faculties</p>
            </div>
          </div>
        </div>
      )}

      {/* Templates Panel */}
      {activeTab === 'templates' && (
        <div className="institutional-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900">Registered Document Templates</h3>
            <span className="text-xs font-bold text-[#006A4E] bg-emerald-50 px-2 py-0.5 rounded">
              {templateList.length} Formats
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {templateList.map((tpl) => (
              <div key={tpl._id || tpl.slug} className="py-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-slate-900">{tpl.name}</span>
                  <p className="text-[11px] font-medium text-slate-500">{tpl.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase">
                    {tpl.type}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {tpl.status || 'ACTIVE'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Students Directory Panel */}
      {activeTab === 'students' && (
        <div className="institutional-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900">Student User Directory</h3>
            <span className="text-xs font-bold text-[#1a1a50] bg-indigo-50 px-2 py-0.5 rounded">
              {userList.length} Verified Users
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {userList.map((u) => (
              <div key={u._id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-extrabold text-slate-900">{u.name}</span>
                  <p className="text-[11px] text-slate-500">{u.email}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-700">{u.studentId || 'N/A'}</span>
                  <p className="text-[10px] text-slate-400">{u.department || 'CSE'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
