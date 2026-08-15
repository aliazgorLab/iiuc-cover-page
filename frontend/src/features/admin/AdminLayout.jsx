import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, FileText,
  Activity, Settings, BarChart2, LogOut, Menu, X, ChevronRight, UserCheck, Shield, Building2, Layers
} from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { NotificationBell } from './notifications/NotificationBell';
import { toast } from 'react-toastify';
import logo from '../../Image/logo.png';

const NAV_SECTIONS = [
  {
    heading: 'MAIN',
    items: [
      { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    ],
  },
  {
    heading: 'ACADEMIC MANAGEMENT',
    items: [
      { to: '/admin/students',       label: 'Students',      icon: Users },
      { to: '/admin/teachers',       label: 'Teachers',      icon: GraduationCap },
      { to: '/admin/courses',        label: 'Courses',       icon: BookOpen },
      { to: '/admin/lab-templates',  label: 'Lab Templates', icon: FileText },
      { to: '/admin/departments',    label: 'Departments',   icon: Building2 },
      { to: '/admin/templates',      label: 'Templates',     icon: Layers },
    ],
  },
  {
    heading: 'SYSTEM',
    items: [
      { to: '/admin/analytics', label: 'Analytics',     icon: BarChart2 },
      { to: '/admin/activity',  label: 'Activity Logs', icon: Activity },
      { to: '/admin/profile',   label: 'Admin Profile', icon: Shield },
      { to: '/admin/settings',  label: 'Settings',      icon: Settings },
    ],
  },
];

const NavItem = ({ to, label, icon: Icon, end, onClick }) => (
  <NavLink
    to={to}
    end={end}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs tracking-[0.01em] transition-all group ${
        isActive
          ? 'bg-[#006A4E] text-white font-bold shadow-sm'
          : 'text-slate-300 font-medium hover:bg-white/10 hover:text-white'
      }`
    }
  >
    <Icon className="h-4 w-4 flex-shrink-0" />
    <span className="flex-1 truncate">{label}</span>
    <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
  </NavLink>
);

const SidebarContent = ({ onClose }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.info('Signed out from IIUC Admin Portal.');
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-5 pt-5 pb-4 border-b border-white/10">
        <Link to="/admin" onClick={onClose} className="flex items-center gap-3">
          <img src={logo} alt="IIUC" className="h-9 w-9 object-contain flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-white font-black text-sm leading-tight">IIUC Admin</div>
            <div className="text-[#F3CF45] text-[10px] font-bold uppercase tracking-widest">Management Portal</div>
          </div>
        </Link>
      </div>

      {/* Admin profile badge */}
      <Link to="/admin/profile" onClick={onClose} className="px-4 py-3 border-b border-white/10 hover:bg-white/5 transition-all">
        <div className="flex items-center gap-3">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="h-9 w-9 rounded-full object-cover ring-2 ring-[#F3CF45] flex-shrink-0" />
          ) : (
            <div className="h-9 w-9 rounded-full bg-[#006A4E] flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-black">{user?.name?.[0]?.toUpperCase() || 'A'}</span>
            </div>
          )}
          <div className="min-w-0">
            <div className="text-white text-xs font-bold truncate">{user?.name || 'Administrator'}</div>
            <span className="inline-block text-[9px] font-black px-1.5 py-0.5 bg-[#F3CF45]/20 text-[#F3CF45] rounded uppercase tracking-wide">
              {user?.role || 'ADMIN'}
            </span>
          </div>
        </div>
      </Link>

      {/* Navigation sections */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {NAV_SECTIONS.map(({ heading, items }) => (
          <div key={heading}>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-3 mb-1.5">
              {heading}
            </p>
            <div className="space-y-0.5">
              {items.map((item) => (
                <NavItem key={item.to} {...item} onClick={onClose} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/10 space-y-0.5">
        <Link
          to="/dashboard"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-all"
        >
          <GraduationCap className="h-4 w-4" />
          <span>Student Portal</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export const AdminLayout = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-slate-100 flex">

      {/* ── DESKTOP SIDEBAR (fixed) ─────────────────── */}
      <aside className="hidden lg:flex w-60 bg-[#1a1a50] flex-col fixed inset-y-0 left-0 z-40">
        <SidebarContent onClose={() => {}} />
      </aside>

      {/* ── MOBILE DRAWER ───────────────────────────── */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          {/* Drawer panel */}
          <aside className="relative w-64 bg-[#1a1a50] flex flex-col h-full shadow-2xl">
            <button
              onClick={() => setDrawerOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-all cursor-pointer z-10"
            >
              <X className="h-4 w-4" />
            </button>
            <SidebarContent onClose={() => setDrawerOpen(false)} />
          </aside>
        </div>
      )}

      {/* ── MAIN CONTENT ────────────────────────────── */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">

        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-sm font-black text-slate-900 leading-tight">IIUC Administration Portal</h1>
              <p className="text-[10px] font-medium text-slate-400 hidden sm:block">
                International Islamic University Chittagong
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <NotificationBell />

            {/* Profile Avatar Button */}
            <Link
              to="/admin/profile"
              className="flex items-center gap-2 p-1 hover:bg-slate-100 rounded-lg transition-all"
              title="Admin Profile"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="h-7 w-7 rounded-full object-cover ring-2 ring-[#006A4E]" />
              ) : (
                <div className="h-7 w-7 rounded-full bg-[#1a1a50] text-white flex items-center justify-center text-[10px] font-black">
                  {user?.name?.[0]?.toUpperCase() || 'A'}
                </div>
              )}
            </Link>

            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-[#006A4E] text-[10px] font-black rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-[#006A4E] animate-pulse" />
              SYSTEM ONLINE
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
