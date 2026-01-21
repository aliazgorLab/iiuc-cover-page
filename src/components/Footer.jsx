import footerImg from '../Image/footer.png';

const Footer = () => {
  return (
    <footer className="w-full bg-[#006A4E] text-white mt-auto overflow-x-hidden">
      {/* Footer Image */}
      <div className="w-full overflow-hidden">
        <img 
          src={footerImg} 
          alt="IIUC Campus" 
          className="w-full h-48 object-cover"
        />
      </div>

      {/* Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-xl font-bold mb-4">IIUC Cover Page Generator</h3>
            <p className="text-gray-200 text-sm">
              Create professional cover pages for your academic assignments, lab reports, and lab indexes with ease.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="text-gray-200 hover:text-[#F3CF45] transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/create" className="text-gray-200 hover:text-[#F3CF45] transition-colors">
                  Create Cover Page
                </a>
              </li>
              <li>
                <a href="/guideline" className="text-gray-200 hover:text-[#F3CF45] transition-colors">
                  Guidelines
                </a>
              </li>
              <li>
                <a href="/about" className="text-gray-200 hover:text-[#F3CF45] transition-colors">
                  About
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">Contact</h3>
            <div className="text-gray-200 text-sm space-y-2">
              <p>International Islamic University Chittagong</p>
              <p>Kumira, Chittagong, Bangladesh</p>
              <p className="mt-4">
                <span className="text-[#F3CF45]">Email:</span> ali.azgor0810@gmail.com
              </p>
              <p>
                <span className="text-[#F3CF45]">Phone:</span> +880 01867704636
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-[#F3CF45]/30 mt-8 pt-6 text-center">
          <p className="text-sm text-gray-200">
            © {new Date().getFullYear()} IIUC Cover Page Generator. Made for IIUC Students.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
