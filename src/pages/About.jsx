import { Info, Github, Mail, Heart, Users, Target, Zap } from 'lucide-react';
import { FaLinkedin, FaFacebook, FaInstagram } from 'react-icons/fa';

const About = () => {
  return (
    <div className="min-h-screen pt-32 py-16 bg-gradient-to-br from-gray-50 via-green-50/30 to-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-fadeInUp">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-[#006A4E] rounded-3xl blur-xl opacity-30 animate-pulse"></div>
            <div className="relative p-5 bg-gradient-to-br from-[#006A4E] to-[#00805d] rounded-3xl">
              <Info className="h-16 w-16 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
            About
            <span className="text-[#006A4E]"> This Project</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A student initiative to make academic life easier and more efficient
          </p>
        </div>

        {/* Mission Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bento-card group p-6">
            <Target className="h-12 w-12 text-[#006A4E] mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Our Mission</h3>
            <p className="text-sm text-gray-600">Help students save time and focus on learning</p>
          </div>
          <div className="bento-card group p-6">
            <Users className="h-12 w-12 text-[#006A4E] mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Community</h3>
            <p className="text-sm text-gray-600">By students, for students at IIUC</p>
          </div>
          <div className="bento-card group p-6">
            <Zap className="h-12 w-12 text-[#F3CF45] mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Innovation</h3>
            <p className="text-sm text-gray-600">Modern solutions for academic needs</p>
          </div>
        </div>

        {/* About Content */}
        <div className="bento-card p-10 mb-10">
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="mr-3 text-3xl">🎯</span>
                Our Mission
              </h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                The IIUC Cover Page Generator was created to help students at
                International Islamic University Chittagong (IIUC) quickly generate
                professional and consistent cover pages for their lab reports and
                academic submissions. We understand the time and effort that goes
                into formatting documents, so we built this tool to automate that
                process.
              </p>
            </div>

            <div className="border-t-2 border-gray-100 pt-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="mr-3 text-3xl">💡</span>
                Why We Built This
              </h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                After countless hours spent formatting cover pages manually, we
                realized there had to be a better way. This tool ensures that every
                student can create a perfectly formatted cover page that meets IIUC
                standards, allowing them to focus on what really matters – their
                actual coursework and learning.
              </p>
            </div>

            <div className="border-t-2 border-gray-100 pt-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="mr-3 text-3xl">✨</span>
                Features
              </h2>
              <ul className="grid md:grid-cols-2 gap-4">
                {[
                  'Professional templates following IIUC branding guidelines',
                  'Easy-to-use form interface',
                  'Instant PDF generation and download',
                  'Mobile-friendly responsive design',
                  'Free to use for all IIUC students',
                  'Regular updates and improvements'
                ].map((feature, index) => (
                  <li key={index} className="flex items-start group">
                    <span className="shrink-0 w-6 h-6 bg-gradient-to-br from-[#006A4E] to-[#00805d] rounded-full flex items-center justify-center mr-3 mt-0.5 group-hover:scale-110 transition-transform">
                      <span className="text-white text-xs font-bold">✓</span>
                    </span>
                    <span className="text-gray-600 text-lg">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t-2 border-gray-100 pt-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="mr-3 text-3xl">🛠️</span>
                Technology Stack
              </h2>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                This project is built with modern web technologies to ensure a fast,
                reliable, and pleasant user experience:
              </p>
              <div className="flex flex-wrap gap-3">
                {['React', 'Vite', 'Tailwind CSS', 'React Router', 'Lucide Icons', 'React to Print'].map((tech, index) => (
                  <span 
                    key={index}
                    className="px-5 py-3 bg-gradient-to-br from-[#006A4E]/10 to-[#F3CF45]/10 text-[#006A4E] rounded-xl text-base font-bold hover:from-[#006A4E]/20 hover:to-[#F3CF45]/20 transition-all hover:scale-105 shadow-sm border border-[#006A4E]/10"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-br from-[#006A4E] via-[#00805d] to-[#004d38] text-white rounded-3xl shadow-2xl p-10 mb-10 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#F3CF45] rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative">
            <h2 className="text-3xl font-bold mb-4 flex items-center">
              <span className="mr-3 text-3xl">💬</span>
              Get in Touch
            </h2>
            <p className="mb-8 text-white/95 text-lg">
              Have suggestions, found a bug, or want to contribute? We'd love to
              hear from you!
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <a
                href="mailto:support@iiuc-coverpage.com"
                className="flex items-center gap-4 p-5 glass-dark rounded-2xl text-white hover:bg-white/20 transition-all group"
              >
                <div className="w-12 h-12 bg-[#F3CF45]/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Mail className="h-6 w-6 text-[#F3CF45]" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-white/80">Email Us</div>
                  <div className="text-base">ali.azgor0810@gmail.com</div>
                </div>
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-5 glass-dark rounded-2xl text-white hover:bg-white/20 transition-all group"
              >
                <div className="w-12 h-12 bg-[#F3CF45]/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Github className="h-6 w-6 text-[#F3CF45]" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-white/80">Contribute</div>
                  <div className="text-base">GitHub Repository</div>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Developer Profile Card */}
        <div className="flex justify-center">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full p-10 text-center border border-gray-100">
            {/* Header */}
            <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-3">
              About the Developer
            </p>
            
            {/* Main Title */}
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Md Ali Azgor
            </h2>
            
            {/* Role/Description */}
            <p className="text-base text-gray-500 mb-8">
              a CSE undergraduate student at International Islamic University Chittagong
            </p>
            
            {/* Divider */}
            <hr className="border-gray-200 mb-8" />
            
            {/* Social Section */}
            <p className="text-base font-semibold text-gray-700 mb-6">
              Connect with me:
            </p>
            
            <div className="flex justify-center items-center gap-6 mb-8">
              <a
                href="https://www.linkedin.com/in/ali-azgor/"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-4 rounded-2xl bg-gray-50 hover:bg-[#0077B5] transition-all duration-300 hover:scale-110 hover:shadow-xl"
                aria-label="LinkedIn"
              >
                <FaLinkedin className="text-3xl text-gray-600 group-hover:text-white transition-colors" />
              </a>
              <a
                href="https://www.facebook.com/ali.azgor.92317/"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-4 rounded-2xl bg-gray-50 hover:bg-[#1877F2] transition-all duration-300 hover:scale-110 hover:shadow-xl"
                aria-label="Facebook"
              >
                <FaFacebook className="text-3xl text-gray-600 group-hover:text-white transition-colors" />
              </a>
              <a
                href="https://www.instagram.com/aliazgor_/"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-4 rounded-2xl bg-gray-50 hover:bg-gradient-to-br hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF] transition-all duration-300 hover:scale-110 hover:shadow-xl"
                aria-label="Instagram"
              >
                <FaInstagram className="text-3xl text-gray-600 group-hover:text-white transition-colors" />
              </a>
            </div>
            
            {/* Footer */}
            <p className="text-sm text-gray-500">
              © 2026 IIUC Cover Page Generator. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
