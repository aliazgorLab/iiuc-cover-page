import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, FileText, User, LogIn, LogOut, ChevronDown, LayoutDashboard, History, Settings } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { toast } from 'react-toastify';
import iiucLogo from '../Image/logo.png';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    setIsProfileDropdownOpen(false);
    toast.info('Signed out from IIUC Portal.');
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Create Cover', path: '/create' },
    { name: 'Templates', path: '/templates' },
    { name: 'Features', path: '/features' },
    { name: 'About', path: '/about' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo & Institutional Tagline */}
          <Link to="/" className="flex items-center space-x-3 group">
            <img
              src={iiucLogo}
              alt="IIUC Crest"
              className="w-10 h-10 object-contain drop-shadow-xs group-hover:scale-105 transition-transform"
            />
            <div>
              <span className="text-base font-extrabold text-slate-900 tracking-tight block leading-none">
                IIUC Cover Page
              </span>
              <span className="text-[10px] font-bold text-[#006A4E] uppercase tracking-widest block mt-1">
                Academic Document Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                  isActive(link.path)
                    ? 'text-white bg-[#006A4E]'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-[#006A4E]'
                }`}
              >
                {link.name}
              </Link>
            ))}

            {/* Auth Widget State */}
            {isAuthenticated ? (
              <div className="relative ml-3" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all border border-slate-200 cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-[#006A4E] text-white flex items-center justify-center text-[11px] font-black">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
                  </div>
                  <span className="max-w-[120px] truncate">{user?.name || 'Student'}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
                </button>

                {/* Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-fadeInUp">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                      <p className="text-[11px] font-medium text-slate-500 truncate">{user?.email}</p>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#006A4E]"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Student Dashboard</span>
                    </Link>

                    <Link
                      to="/dashboard/profile"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#006A4E]"
                    >
                      <User className="h-4 w-4" />
                      <span>Academic Profile</span>
                    </Link>

                    <Link
                      to="/dashboard/history"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#006A4E]"
                    >
                      <History className="h-4 w-4" />
                      <span>Cover History</span>
                    </Link>

                    <div className="pt-1 border-t border-slate-100 mt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 text-left cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="ml-3 btn-iiuc-primary text-xs !py-2 !px-4 shadow-xs"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Academic Sign In</span>
              </Link>
            )}
          </div>

          {/* Mobile Navigation Toggle Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none"
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation Menu Drawer */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-100 space-y-2 animate-fadeInUp">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm font-semibold ${
                  isActive(link.path)
                    ? 'bg-[#006A4E] text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {link.name}
              </Link>
            ))}

            {isAuthenticated ? (
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <Link
                  to="/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold bg-[#F3CF45] text-[#1a1a50]"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Student Dashboard</span>
                </Link>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-red-600 bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3 bg-[#006A4E] text-white rounded-lg text-sm font-bold mt-2"
              >
                <LogIn className="h-4 w-4" />
                <span>Academic Sign In</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
