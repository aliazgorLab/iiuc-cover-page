import { BookOpen, CheckCircle, AlertCircle } from 'lucide-react';

const Guideline = () => {
  const guidelines = [
    {
      title: 'Fill All Required Fields',
      description: 'Make sure to provide all necessary information including your name, student ID, course details, and submission date.',
      icon: '📝',
    },
    {
      title: 'Use Official Email',
      description: 'Always use your IIUC email address (@iiuc.ac.bd) for formal lab reports and submissions.',
      icon: '📧',
    },
    {
      title: 'Follow Naming Convention',
      description: 'Save your PDF with a clear naming format: CourseCode_StudentID_LabNumber.pdf',
      icon: '📂',
    },
    {
      title: 'Check Information Carefully',
      description: 'Double-check all entered information before generating the PDF to avoid errors.',
      icon: '✅',
    },
    {
      title: 'Maintain Academic Integrity',
      description: 'Only use this tool for your own work. Do not share or duplicate cover pages for others.',
      icon: '🎓',
    },
    {
      title: 'Keep PDF Quality',
      description: 'Always download in high quality. Do not compress or reduce the resolution of the generated PDF.',
      icon: '⭐',
    },
  ];

  return (
    <div className="min-h-screen py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-fadeInUp">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-[#006A4E] rounded-3xl blur-xl opacity-30"></div>
            <div className="relative p-5 bg-gradient-to-br from-[#006A4E] to-[#00805d] rounded-3xl">
              <BookOpen className="h-16 w-16 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
            Usage
            <span className="text-[#006A4E]"> Guidelines</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Follow these best practices to create professional and compliant cover pages
          </p>
        </div>

        {/* Guidelines List */}
        <div className="bento-card p-8 md:p-12 mb-12">
          <div className="space-y-8">
            {guidelines.map((guideline, index) => (
              <div 
                key={index} 
                className="group flex gap-5 p-6 rounded-2xl hover:bg-[#006A4E]/5 transition-all duration-300 border-2 border-transparent hover:border-[#006A4E]/20"
              >
                <div className="shrink-0">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#006A4E] to-[#00805d] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-lg">
                    {guideline.icon}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#006A4E] transition-colors">
                      {guideline.title}
                    </h3>
                    <CheckCircle className="h-6 w-6 text-[#F3CF45] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    {guideline.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Information Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Help Card */}
          <div className="bg-gradient-to-br from-[#006A4E] to-[#00805d] rounded-2xl p-8 text-white shadow-xl">
            <div className="flex items-center space-x-3 mb-4">
              <AlertCircle className="h-8 w-8" />
              <h3 className="text-2xl font-bold">Need Help?</h3>
            </div>
            <p className="text-white/90 mb-6 leading-relaxed">
              If you encounter any issues or have questions about using this tool,
              please refer to the About page for contact information or visit the
              IIUC computer lab for assistance.
            </p>
            <div className="flex items-center space-x-2 text-[#F3CF45] text-sm font-semibold">
              <span>💡</span>
              <span>We're here to help you succeed!</span>
            </div>
          </div>

          {/* Reminder Card */}
          <div className="bento-card p-8">
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-4xl">📋</span>
              <h3 className="text-2xl font-bold text-gray-900">Quick Reminder</h3>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">
              This tool is designed to help you create professional cover
              pages quickly and easily. Always follow your instructor's specific
              requirements for lab report formatting.
            </p>
            <div className="flex items-center space-x-2 text-[#006A4E] text-sm font-semibold">
              <span>✨</span>
              <span>Quality matters - Double check everything!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Guideline;
