import { Link } from 'react-router-dom';
import footerImg from '../Image/footer.png';

const Footer = () => {
  return (
    <footer>
      {/* Footer Image */}
      <div className="w-full">
        <img 
          src={footerImg} 
          alt="Footer" 
          className="w-full h-auto object-cover"
        />
      </div>
      
      {/* Footer Content */}
      <div className="bg-[#006A4E] text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            
            {/* Brand Section */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">IIUC Cover Page Generator</h3>
              <p className="text-white/90 text-sm leading-relaxed">
                Create professional cover pages for your academic assignments, lab reports, and lab indexes with ease.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xl font-semibold mb-6">Quick Links</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/" className="text-white/90 hover:text-[#F3CF45] transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/create" className="text-white/90 hover:text-[#F3CF45] transition-colors">
                    Create Cover Page
                  </Link>
                </li>
                <li>
                  <Link to="/guideline" className="text-white/90 hover:text-[#F3CF45] transition-colors">
                    Guidelines
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-white/90 hover:text-[#F3CF45] transition-colors">
                    About
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-xl font-semibold mb-6">Contact</h4>
              <div className="space-y-3 text-sm">
                <p className="text-white/90 leading-relaxed">
                  <span className="font-semibold">International Islamic University Chittagong</span><br />
                  Kumira, Chittagong, <span className="text-[#FFFFFF]">Bangladesh</span>
                </p>
                <p className="text-white/90">
                  <span className="text-[#F3CF45] font-medium">Email:</span> ali.azgor.0810@gmail.com
                </p>
                <p className="text-white/90">
                  <span className="text-[#F3CF45] font-medium">Phone:</span> +880 01867704636
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-8 border-t border-white/20 text-center">
            <p className="text-white/90 text-sm">
              © {new Date().getFullYear()} IIUC Cover Page Generator. Made for IIUC Students.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
