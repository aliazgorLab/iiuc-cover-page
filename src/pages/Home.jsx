import { Link } from 'react-router-dom';
import { FileText, BookOpen, Users, Sparkles, Zap, Award, Clock } from 'lucide-react';
import heroImg from '../Image/hero.png';

const Home = () => {
  return (
    <>
      {/* Hero Section - Full Screen with Absolute Positioning */}
      <div className="relative w-full min-h-screen overflow-hidden">
        {/* 1. The Background Image Layer (Fixed to top) */}
        <div 
          className="absolute inset-0 w-full h-full z-0"
          style={{
            backgroundImage: `url(${heroImg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/60 z-0"></div>
          
          {/* White Fade Overlay (at bottom for smooth transition) */}
          <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-white via-white/60 to-transparent z-1"></div>
        </div>

        {/* 2. The Content Layer (On top of image) */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4">
          <div className="max-w-7xl mx-auto space-y-8 pt-24">
            {/* Icon with Glow Effect */}
            <div className="inline-block relative animate-fadeInUp">
              <div className="absolute inset-0 bg-[#F3CF45] blur-2xl opacity-50 rounded-3xl"></div>
              <div className="relative p-5 glass-dark rounded-3xl shadow-2xl">
                <FileText className="h-20 w-20 text-white animate-float" />
              </div>
            </div>
            
            {/* Main Heading */}
            <div className="space-y-4 animate-fadeInUp" style={{animationDelay: '0.2s'}}>
              <h1 className="text-5xl md:text-7xl font-extrabold leading-tight text-white">
                <span className="block">IIUC Cover Page</span>
                <span className="block text-[#F3CF45] animate-shimmer">
                  Generator
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-white max-w-3xl mx-auto leading-relaxed font-medium">
                Create stunning, professional cover pages in seconds. 
                <span className="block mt-2 text-[#F3CF45] font-bold">✨ Designed for Excellence ✨</span>
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center pt-8 animate-fadeInUp" style={{animationDelay: '0.4s'}}>
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
                className="group relative inline-flex items-center px-10 py-5 glass border-2 border-white/30 text-[#005423] rounded-2xl font-bold text-lg hover:bg-white/20 transition-all hover:shadow-xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/30 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <BookOpen className="mr-2 h-6 w-6 relative z-10" />
                <span className="relative z-10">View Guidelines</span>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 pt-12 pb-10 animate-fadeInUp" style={{animationDelay: '0.6s'}}>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-extrabold text-green-800">1000+</div>
                <div className="text-sm md:text-base font-semibold text-green-700 mt-1">Happy Students</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-extrabold text-green-800">5 Min</div>
                <div className="text-sm md:text-base font-semibold text-green-700 mt-1">Average Time</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-extrabold text-green-800">100%</div>
                <div className="text-sm md:text-base font-semibold text-green-700 mt-1">Free Forever</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-2 bg-[#006A4E]/10 text-[#006A4E] rounded-full text-sm font-semibold mb-4 border border-[#006A4E]/20">
              ✨ FEATURES
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
              Why Choose
              <span className="text-[#006A4E]"> Our Tool?</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Designed specifically for IIUC students with powerful features that save time and ensure excellence
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 - Bento Card */}
            <div className="bento-card group p-8 hover:-translate-y-2">
              <div className="relative">
                <div className="inline-flex p-4 bg-gradient-to-br from-[#006A4E] to-[#00805d] rounded-2xl mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-[#006A4E]/30">
                  <FileText className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Professional Design
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Pre-designed templates following IIUC branding guidelines and academic standards with pixel-perfect layouts
                </p>
              </div>
            </div>

            {/* Feature 2 - Bento Card */}
            <div className="bento-card group p-8 hover:-translate-y-2">
              <div className="relative">
                <div className="inline-flex p-4 bg-gradient-to-br from-[#006A4E] to-[#00805d] rounded-2xl mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-[#006A4E]/30">
                  <Zap className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Lightning Fast
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Simple form-based interface. Fill in your details and generate professional PDFs instantly in seconds
                </p>
              </div>
            </div>

            {/* Feature 3 - Bento Card */}
            <div className="bento-card group p-8 hover:-translate-y-2">
              <div className="relative">
                <div className="inline-flex p-4 bg-gradient-to-br from-[#006A4E] to-[#00805d] rounded-2xl mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-[#006A4E]/30">
                  <Users className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Built for Students
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Created by students, for students. Save time and focus on what really matters - your actual work
                </p>
              </div>
            </div>
          </div>

          {/* Additional Benefits - Bento Grid */}
          <div className="mt-20 grid md:grid-cols-4 gap-6">
            <div className="bento-card text-center p-6">
              <Award className="h-12 w-12 text-[#006A4E] mx-auto mb-3" />
              <h4 className="font-bold text-gray-900 mb-1">Quality Assured</h4>
              <p className="text-sm text-gray-600">Professional standards</p>
            </div>
            <div className="bento-card text-center p-6">
              <Clock className="h-12 w-12 text-[#006A4E] mx-auto mb-3" />
              <h4 className="font-bold text-gray-900 mb-1">Save Time</h4>
              <p className="text-sm text-gray-600">5-minute generation</p>
            </div>
            <div className="bento-card text-center p-6">
              <Sparkles className="h-12 w-12 text-[#F3CF45] mx-auto mb-3" />
              <h4 className="font-bold text-gray-900 mb-1">Easy Export</h4>
              <p className="text-sm text-gray-600">High-quality PDFs</p>
            </div>
            <div className="bento-card text-center p-6">
              <FileText className="h-12 w-12 text-[#006A4E] mx-auto mb-3" />
              <h4 className="font-bold text-gray-900 mb-1">Always Free</h4>
              <p className="text-sm text-gray-600">No hidden costs</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#006A4E] via-[#00805d] to-[#004d38]">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 right-20 w-96 h-96 bg-[#F3CF45] rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          </div>
        </div>
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="glass-dark rounded-3xl p-12 md:p-16 shadow-2xl">
            <Sparkles className="h-16 w-16 text-[#F3CF45] mx-auto mb-6 animate-float" />
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
              Ready to Create Your
              <span className="block mt-2 text-[#F3CF45]">Professional Cover Page?</span>
            </h2>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
              Join <span className="font-bold text-[#F3CF45]">1000+</span> IIUC students who are already creating stunning cover pages with our tool
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <Link
                to="/create"
                className="group inline-flex items-center justify-center px-10 py-5 bg-[#F3CF45] text-[#004d38] rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-[#F3CF45]/50 transition-all transform hover:scale-105"
              >
                <Sparkles className="mr-2 h-6 w-6 group-hover:animate-spin" />
                Get Started Free
                <span className="ml-2 text-2xl group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center justify-center px-10 py-5 glass border-2 border-white/30 text-white rounded-2xl font-bold text-lg hover:bg-white/20 transition-all"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
