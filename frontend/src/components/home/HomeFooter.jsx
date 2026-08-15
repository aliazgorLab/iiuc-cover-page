import { Link } from 'react-router-dom';
import { FileText, Github, Mail, Heart } from 'lucide-react';

const HomeFooter = () => {
  return (
    <footer className="bg-gradient-to-b from-gray-50 to-gray-100 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="p-2 bg-gradient-to-br from-[#006A4E] to-[#00805d] rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">
                  IIUC Cover Page
                </div>
                <div className="text-sm text-gray-600">
                  Generator
                </div>
              </div>
            </Link>
            <p className="text-gray-600 max-w-md leading-relaxed">
              Create professional, perfectly formatted cover pages for your IIUC assignments in seconds. Built by students, for students.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/create" 
                  className="text-gray-600 hover:text-[#006A4E] transition-colors inline-flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 bg-[#006A4E] rounded-full group-hover:w-2 transition-all"></span>
                  Create Cover
                </Link>
              </li>
              <li>
                <Link 
                  to="/guideline" 
                  className="text-gray-600 hover:text-[#006A4E] transition-colors inline-flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 bg-[#006A4E] rounded-full group-hover:w-2 transition-all"></span>
                  Guidelines
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className="text-gray-600 hover:text-[#006A4E] transition-colors inline-flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 bg-[#006A4E] rounded-full group-hover:w-2 transition-all"></span>
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Connect</h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="mailto:support@iiuccover.com"
                  className="text-gray-600 hover:text-[#006A4E] transition-colors inline-flex items-center gap-2 group"
                >
                  <Mail className="w-4 h-4" />
                  <span>Support</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-[#006A4E] transition-colors inline-flex items-center gap-2 group"
                >
                  <Github className="w-4 h-4" />
                  <span>GitHub</span>
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600">
            <p className="flex items-center gap-2">
              © {new Date().getFullYear()} IIUC Cover Page Generator. Made with 
              <Heart className="w-4 h-4 text-red-500 fill-current inline animate-pulse" /> 
              for IIUC students
            </p>
            <div className="flex gap-6">
              <Link to="/guideline" className="hover:text-[#006A4E] transition-colors">
                Terms
              </Link>
              <Link to="/guideline" className="hover:text-[#006A4E] transition-colors">
                Privacy
              </Link>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default HomeFooter;
