import { Sparkles, FileCheck, Download, Layout } from 'lucide-react';

const features = [
  {
    icon: Layout,
    title: 'Automatic Formatting',
    description: 'No more wrestling with margins, fonts, or alignment. Everything is formatted according to IIUC standards automatically.',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: FileCheck,
    title: 'Official IIUC Structure',
    description: 'Pre-built templates that match official university requirements. Your cover page will always meet academic standards.',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: Download,
    title: 'Instant PDF Download',
    description: 'Generate and download your cover page as a high-quality PDF in seconds. Ready to print or submit digitally.',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: Sparkles,
    title: 'No Design Skills Needed',
    description: 'Simply fill in your information and let our tool handle the design. Perfect results every time, guaranteed.',
    color: 'from-orange-500 to-red-500'
  }
];

const Features = () => {
  return (
    <section className="py-20 lg:py-32 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16 lg:mb-20 space-y-4">
          <span className="inline-block px-4 py-2 bg-[#006A4E]/10 text-[#006A4E] rounded-full text-sm font-semibold border border-[#006A4E]/20">
            FEATURES
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900">
            Why Students Love It
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to create professional cover pages without the hassle
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Icon Container */}
              <div className="relative inline-block mb-6">
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity`}></div>
                <div className={`relative p-4 bg-gradient-to-br ${feature.color} rounded-2xl shadow-lg`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>

              {/* Decorative Element */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#006A4E]/5 to-transparent rounded-bl-full"></div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-lg text-gray-600 mb-4">
            Join thousands of students who have already simplified their workflow
          </p>
          <div className="flex justify-center gap-2">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-6 h-6 text-[#F3CF45] fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-2">Rated 5/5 by IIUC students</p>
        </div>

      </div>
    </section>
  );
};

export default Features;
