import { Link } from 'react-router-dom';
import { Sparkles, BookOpen, Zap, Star } from 'lucide-react';
import heroImg from '../../Image/hero.png';

const Hero = () => {
  return (
    <section className="relative w-full min-h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={heroImg} 
          alt="Campus" 
          className="w-full h-full object-cover" 
        />
        {/* Dark Overlay - Makes text readable */}
        <div className="absolute inset-0 bg-black/50"></div>
        {/* Bottom White Fade */}
        <div className="absolute bottom-0 left-0 w-full h-96 bg-gradient-to-t from-white via-white/80 to-transparent"></div>
      </div>

      {/* Content Layer */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4">
        <div className="max-w-7xl mx-auto space-y-8 pt-24">
          
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-sm font-medium animate-fadeInUp">
            <Star className="w-4 h-4 fill-[#F3CF45] text-[#F3CF45]" />
            <span>Trusted by 1,000+ IIUC Students</span>
          </div>

          {/* Main Heading */}
          <div className="space-y-6 animate-fadeInUp">
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 drop-shadow-lg">
              IIUC Cover Page <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-yellow-300">
                Generator
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto drop-shadow-md">
              Create stunning, professional cover pages, lab reports, and project files in seconds. Designed for excellence.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center pt-8 mb-32 relative z-20 animate-fadeInUp">
            <Link
              to="/create"
              className="group relative inline-flex items-center px-10 py-5 bg-[#F3CF45] text-[#004d38] rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-[#F3CF45]/50 transition-all transform hover:scale-105 overflow-hidden"
            >
              <div className="absolute inset-0 bg-[#F8E186] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Sparkles className="mr-2 h-6 w-6 animate-pulse relative z-10" />
              <span className="relative z-10">Create Now</span>
              <Zap className="ml-2 h-5 w-5 relative z-10" />
            </Link>
            
            <Link
              to="/guideline"
              className="group relative inline-flex items-center px-10 py-5 glass border-2 border-white/30 text-white rounded-2xl font-bold text-lg hover:bg-white/20 transition-all hover:shadow-xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/30 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <BookOpen className="mr-2 h-6 w-6 relative z-10" />
              <span className="relative z-10">View Guidelines</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
