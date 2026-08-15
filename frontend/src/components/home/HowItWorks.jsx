import { Edit3, Eye, Download } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Edit3,
    title: 'Enter Your Details',
    description: 'Fill in your name, ID, course information, and department. Simple form, no hassle.'
  },
  {
    number: '02',
    icon: Eye,
    title: 'Preview Instantly',
    description: 'See your formatted cover page in real-time. Make adjustments if needed.'
  },
  {
    number: '03',
    icon: Download,
    title: 'Download PDF',
    description: 'Get your professional cover page as a high-quality PDF. Ready to submit.'
  }
];

const HowItWorks = () => {
  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16 lg:mb-20 space-y-4">
          <span className="inline-block px-4 py-2 bg-[#F3CF45]/20 text-[#006A4E] rounded-full text-sm font-semibold border border-[#F3CF45]">
            SIMPLE PROCESS
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900">
            Create Your Cover Page in{' '}
            <span className="text-[#006A4E]">3 Simple Steps</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            From start to finish in less than a minute
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          
          {/* Connector Line - Desktop Only */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-[#006A4E] via-[#00805d] to-[#006A4E] opacity-20" style={{ width: '80%', margin: '0 auto' }}></div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
            {steps.map((step, index) => (
              <div
                key={index}
                className="relative text-center group"
              >
                {/* Step Number Badge */}
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-[#006A4E] rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  <div className="relative w-20 h-20 mx-auto bg-gradient-to-br from-[#006A4E] to-[#00805d] rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                    <span className="text-3xl font-bold text-white">{step.number}</span>
                  </div>
                </div>

                {/* Icon */}
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F3CF45] rounded-2xl shadow-lg mb-6 group-hover:rotate-6 transition-transform">
                  <step.icon className="w-8 h-8 text-[#004d38]" />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>

                {/* Arrow - Desktop Only */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-24 -right-6 text-[#006A4E] opacity-30">
                    <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Message */}
        <div className="text-center mt-16 p-8 bg-gradient-to-r from-[#006A4E]/5 to-[#F3CF45]/5 rounded-2xl border border-[#006A4E]/10">
          <p className="text-lg font-semibold text-gray-900">
            ⚡ Average completion time: <span className="text-[#006A4E]">30 seconds</span>
          </p>
        </div>

      </div>
    </section>
  );
};

export default HowItWorks;
