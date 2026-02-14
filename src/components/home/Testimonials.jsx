import { Quote, Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Ahmed Rahman',
    department: 'Computer Science & Engineering',
    batch: 'Batch 50',
    review: 'This tool saved me so much time! I used to spend 30 minutes formatting each cover page. Now it takes less than a minute. Absolutely game-changing.',
    rating: 5,
    avatar: 'AR'
  },
  {
    name: 'Tasnim Haque',
    department: 'Business Administration',
    batch: 'Batch 48',
    review: 'Finally, a tool that understands IIUC formatting requirements! Clean, professional, and exactly what we needed. Highly recommended to all students.',
    rating: 5,
    avatar: 'TH'
  },
  {
    name: 'Rafid Islam',
    department: 'Electrical & Electronic Engineering',
    batch: 'Batch 49',
    review: 'I was skeptical at first, but this exceeded my expectations. The PDF quality is perfect, and it follows all university guidelines. Makes assignment submission so much easier.',
    rating: 5,
    avatar: 'RI'
  }
];

const Testimonials = () => {
  return (
    <section className="py-20 lg:py-32 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16 lg:mb-20 space-y-4">
          <span className="inline-block px-4 py-2 bg-[#F3CF45]/20 text-[#006A4E] rounded-full text-sm font-semibold border border-[#F3CF45]">
            TESTIMONIALS
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900">
            What Students Are Saying
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Real feedback from IIUC students who use our tool daily
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 opacity-10">
                <Quote className="w-16 h-16 text-[#006A4E]" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-[#F3CF45] fill-[#F3CF45]" />
                ))}
              </div>

              {/* Review */}
              <p className="text-gray-700 leading-relaxed mb-6 relative z-10">
                "{testimonial.review}"
              </p>

              {/* Student Info */}
              <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
                {/* Avatar */}
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#006A4E] to-[#00805d] rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-sm">
                    {testimonial.avatar}
                  </span>
                </div>

                {/* Details */}
                <div>
                  <div className="font-bold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {testimonial.department}
                  </div>
                  <div className="text-xs text-[#006A4E] font-medium">
                    {testimonial.batch}
                  </div>
                </div>
              </div>

              {/* Decorative Element */}
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-[#F3CF45]/10 to-transparent rounded-tl-full"></div>
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-wrap justify-center items-center gap-8 px-8 py-6 bg-white rounded-2xl shadow-md border border-gray-100">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#006A4E]">1,000+</div>
              <div className="text-sm text-gray-600">Active Users</div>
            </div>
            <div className="hidden sm:block w-px h-12 bg-gray-200"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#006A4E]">5,000+</div>
              <div className="text-sm text-gray-600">Cover Pages Created</div>
            </div>
            <div className="hidden sm:block w-px h-12 bg-gray-200"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#006A4E]">100%</div>
              <div className="text-sm text-gray-600">Satisfaction Rate</div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Testimonials;
