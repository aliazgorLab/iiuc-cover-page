import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Clock } from 'lucide-react';

const FinalCTA = () => {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-br from-[#004d38] via-[#006A4E] to-[#00805d]">
      
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#F3CF45] rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-[#F3CF45] rounded-2xl shadow-2xl mb-8 animate-bounce">
          <Sparkles className="w-10 h-10 text-[#004d38]" />
        </div>

        {/* Headline */}
        <div className="space-y-6 mb-10">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
            Stop Wasting Time on Formatting.
          </h2>
          <p className="text-xl sm:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            Generate your perfectly formatted cover page now. It's free, fast, and follows all IIUC guidelines.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="inline-flex flex-wrap items-center justify-center gap-6 mb-10 px-8 py-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
          <div className="flex items-center gap-2 text-white">
            <Clock className="w-5 h-5 text-[#F3CF45]" />
            <span className="font-semibold">30 seconds</span>
          </div>
          <div className="w-px h-6 bg-white/30"></div>
          <div className="flex items-center gap-2 text-white">
            <Sparkles className="w-5 h-5 text-[#F3CF45]" />
            <span className="font-semibold">100% Free</span>
          </div>
          <div className="w-px h-6 bg-white/30"></div>
          <div className="flex items-center gap-2 text-white">
            <svg className="w-5 h-5 text-[#F3CF45]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold">IIUC Official</span>
          </div>
        </div>

        {/* CTA Button */}
        <Link
          to="/create"
          className="group inline-flex items-center justify-center gap-3 px-12 py-6 bg-[#F3CF45] text-[#004d38] rounded-2xl font-bold text-xl hover:bg-[#F8E186] transition-all transform hover:scale-105 shadow-2xl hover:shadow-[#F3CF45]/50"
        >
          <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
          Start Free Now
          <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </Link>

        {/* Trust Message */}
        <p className="mt-8 text-white/80 text-sm">
          🎓 Join <span className="font-bold text-white">1,000+ IIUC students</span> who already use this tool
        </p>

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 border-4 border-white/10 rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 border-4 border-white/10 rounded-full"></div>
        <div className="absolute top-1/2 left-20 w-16 h-16 border-4 border-[#F3CF45]/20 rounded-lg rotate-45"></div>
        <div className="absolute top-1/3 right-32 w-12 h-12 border-4 border-[#F3CF45]/20 rounded-lg rotate-12"></div>

      </div>
    </section>
  );
};

export default FinalCTA;
