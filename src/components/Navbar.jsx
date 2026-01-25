import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, FileText, Sparkles } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/', icon: '🏠' },
    { name: 'Create', path: '/create', icon: '✨' },
    { name: 'Guideline', path: '/guideline', icon: '📖' },
    { name: 'About', path: '/about', icon: 'ℹ️' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Main Floating Pill Navbar */}
      <nav
        className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[95%] max-w-7xl bg-white shadow-2xl rounded-full px-6 py-3 flex justify-between items-center transition-all duration-300"
      >
        {/* Logo Section */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-[#006A4E] rounded-xl blur-md opacity-30 group-hover:opacity-50 transition-opacity"></div>
            <FileText className="h-8 w-8 text-[#006A4E] relative group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" />
          </div>
          <div className="hidden sm:block">
            <span className="text-lg font-bold text-[#006A4E]">
              IIUC Cover Page
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`relative px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                isActive(link.path)
                  ? 'text-white bg-[#006A4E] shadow-lg shadow-[#006A4E]/30'
                  : 'text-gray-700 hover:bg-[#006A4E]/10 hover:text-[#006A4E]'
              }`}
            >
              <span className="flex items-center space-x-2">
                <span>{link.icon}</span>
                <span>{link.name}</span>
              </span>
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 rounded-full text-gray-700 hover:text-[#006A4E] hover:bg-[#006A4E]/10 focus:outline-none transition-all duration-300"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </nav>

      {/* Mobile Navigation Menu - Separate floating card */}
      {isMenuOpen && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 w-[90%] max-w-md bg-white shadow-2xl rounded-3xl p-4 md:hidden animate-fadeInUp">
          <div className="space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                  isActive(link.path)
                    ? 'bg-[#006A4E] text-white shadow-lg'
                    : 'text-gray-700 hover:bg-[#006A4E]/10 hover:text-[#006A4E]'
                }`}
              >
                <span className="text-xl">{link.icon}</span>
                <span>{link.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
