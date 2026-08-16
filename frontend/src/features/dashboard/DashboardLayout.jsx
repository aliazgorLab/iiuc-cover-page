import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, User, History, FileText, ArrowLeft, Shield, LogOut, Layers } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { toast } from 'react-toastify';

export const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(user?.role ? user.role.toUpperCase() : '');

  const links = [
    { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { path: '/dashboard/profile', label: 'Student Profile', icon: User },
    { path: '/dashboard/history', label: 'Cover History', icon: History },
    { path: '/dashboard/lab-index-history', label: 'My Lab Indexes', icon: Layers },
    { path: '/dashboard/templates', label: 'Saved Templates', icon: FileText },
    ...(isAdmin ? [{ path: '/admin', label: 'Admin Portal', icon: Shield }] : []),
  ];

  const handleLogout = () => {
    logout();
    toast.info('Logged out from IIUC Portal.');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-20">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-grow grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="md:col-span-1 space-y-4">
          <div className="bento-card p-4 space-y-2">
            <Link
              to="/create"
              className="flex items-center gap-2 text-xs font-bold text-[#006A4E] hover:underline mb-4 px-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Generator
            </Link>

            {links.map((link) => {
              const Icon = link.icon;
              const active = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => {
                    console.log({
                      targetPath: link.path,
                      pathname: window.location.pathname,
                      userRole: user?.role,
                      isAdmin,
                    });
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    active
                      ? 'bg-[#006A4E] text-white shadow-md'
                      : 'text-gray-700 hover:bg-[#006A4E]/10 hover:text-[#006A4E]'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            <div className="pt-4 border-t border-gray-100 mt-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-all cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="md:col-span-3">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
