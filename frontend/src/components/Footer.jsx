import { Link } from 'react-router-dom';
import footerImg from '../Image/footer.png';
import iiucLogo from '../Image/logo.png';

const Footer = () => {
  return (
    <footer className="mt-0 border-none">
      {/* Institutional Campus Footer Art */}
      <div className="w-full overflow-hidden leading-none">
        <img
          src={footerImg}
          alt="IIUC Campus Footer"
          className="w-full h-24 md:h-36 object-cover object-center opacity-85 block"
        />
      </div>

      {/* Main Footer Container */}
      <div className="bg-[#1a1a50] text-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Column 1: Brand & Institutional Statement */}
            <div className="space-y-4 md:col-span-1">
              <div className="flex items-center gap-3">
                <img src={iiucLogo} alt="IIUC Emblem" className="w-9 h-9 object-contain" />
                <span className="font-extrabold text-lg tracking-tight text-white">
                  IIUC Cover Page
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                A standardized academic document platform engineered for students at International Islamic University Chittagong.
              </p>
              <div className="text-[11px] font-bold text-[#F3CF45] uppercase tracking-wider">
                Official A4 Dimensions • Vector PDF Output
              </div>
            </div>

            {/* Column 2: Document Products */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#F3CF45]">
                Document Utilities
              </h4>
              <ul className="space-y-2 text-xs font-semibold text-slate-300">
                <li>
                  <Link to="/create" className="hover:text-white transition-colors">
                    Assignment Cover
                  </Link>
                </li>
                <li>
                  <Link to="/create" className="hover:text-white transition-colors">
                    Lab Report Cover
                  </Link>
                </li>
                <li>
                  <Link to="/create" className="hover:text-white transition-colors">
                    Lab Index Generator
                  </Link>
                </li>
                <li>
                  <Link to="/create" className="hover:text-white transition-colors">
                    Group Project Cover
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Student Account & Portal */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#F3CF45]">
                Student Portal
              </h4>
              <ul className="space-y-2 text-xs font-semibold text-slate-300">
                <li>
                  <Link to="/login" className="hover:text-white transition-colors">
                    Academic Sign In (@ugrad.iiuc.ac.bd)
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="hover:text-white transition-colors">
                    Student Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard/profile" className="hover:text-white transition-colors">
                    Academic Profile
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard/history" className="hover:text-white transition-colors">
                    Cloud Cover History
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Information & Guidelines */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#F3CF45]">
                Information
              </h4>
              <ul className="space-y-2 text-xs font-semibold text-slate-300">
                <li>
                  <Link to="/guideline" className="hover:text-white transition-colors">
                    Document Guidelines
                  </Link>
                </li>
                <li>
                  <Link to="/templates" className="hover:text-white transition-colors">
                    Template Catalog
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-white transition-colors">
                    About Platform
                  </Link>
                </li>
              </ul>
              <div className="pt-2 text-[11px] text-slate-400">
                Main Campus: Kumira, Chittagong, Bangladesh
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-6 border-t border-slate-700/60 text-center flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>© {new Date().getFullYear()} IIUC Cover Page. Designed for IIUC Student Utility.</p>
            <div className="flex items-center gap-4 text-[11px]">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <span>•</span>
              <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <span>•</span>
              <Link to="/guideline" className="hover:text-white transition-colors">A4 Print Standards</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
