import { FileText, Edit, Download, Lightbulb, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Guideline = () => {
  const steps = [
    {
      number: 1,
      icon: FileText,
      title: 'Choose Your Template',
      description: 'Go to the Create page and select "Assignment", "Lab Report", "Lab Index", or "Project" from the sidebar tabs.',
      color: 'from-blue-500 to-blue-600',
    },
    {
      number: 2,
      icon: Edit,
      title: 'Enter Your Details',
      description: 'Fill in your Course Code, Title, and Teacher\'s name. The layout adjusts automatically as you type.',
      color: 'from-purple-500 to-purple-600',
    },
    {
      number: 3,
      icon: Download,
      title: 'Download PDF',
      description: 'Click Download PDF for printing or Download JPG to share online. It\'s that easy!',
      color: 'from-green-500 to-green-600',
    },
  ];

  const proTips = [
    {
      icon: '👥',
      text: 'Use the "Project" tab to add multiple group members (up to 4)!',
    },
    {
      icon: '📝',
      text: 'Leave the Department field empty to see the placeholder preview.',
    },
    {
      icon: '🎯',
      text: 'The live preview updates instantly as you type - no need to click anything!',
    },
    {
      icon: '💾',
      text: 'Both PDF and JPG formats maintain professional quality for submission.',
    },
  ];

  return (
    <div className="min-h-screen pt-32 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-20 animate-fadeInUp">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
            How to Generate Your
            <span className="text-[#006A4E]"> Cover Page</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
            Follow these 3 simple steps to create a professional cover page in seconds.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="group relative bg-green-50 rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-[#006A4E]/30"
            >
              {/* Step Number Badge */}
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-[#006A4E] rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg group-hover:scale-110 transition-transform">
                {step.number}
              </div>

              {/* Icon */}
              <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${step.color} mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                <step.icon className="h-10 w-10 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-[#006A4E] transition-colors">
                {step.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Pro Tips Section */}
        <div className="bento-card p-8 md:p-12 mb-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-gradient-to-br from-[#F3CF45] to-[#e6c43d] rounded-xl">
              <Lightbulb className="h-8 w-8 text-gray-900" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Pro Tips</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {proTips.map((tip, index) => (
              <div 
                key={index}
                className="flex items-start gap-4 p-5 rounded-xl hover:bg-[#006A4E]/5 transition-all duration-300 border-2 border-transparent hover:border-[#006A4E]/20"
              >
                <span className="text-3xl shrink-0">{tip.icon}</span>
                <p className="text-gray-700 leading-relaxed pt-1">
                  {tip.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Link 
            to="/create"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-[#006A4E] to-[#00805d] text-white px-10 py-5 rounded-2xl text-xl font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
          >
            <span>Start Creating Now</span>
            <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
          </Link>
          <p className="mt-6 text-gray-500">
            No signup required • Instant download • Completely free
          </p>
        </div>
      </div>
    </div>
  );
};

export default Guideline;
