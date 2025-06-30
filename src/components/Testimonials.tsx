import React from 'react';
import { Star, Quote } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      name: "Eliana",
      age: 16,
      location: "NJ",
      text: "FuturePath found me a summer research program I never would've known about. I got in!",
      rating: 5,
      avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
    },
    {
      name: "Aaryan",
      age: 17,
      location: "CA",
      text: "The AI literally told me what to do each week to get better at ML. It's like having a private tutor that doesn't sleep.",
      rating: 5,
      avatar: "https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
    },
    {
      name: "Maya L.",
      role: "Parent",
      location: "TX",
      text: "I'm a parent and I actually feel hopeful now. My son finally knows what he wants to be, and how to get there.",
      rating: 5,
      avatar: "https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
    },
    {
      name: "Jordan",
      age: 15,
      location: "WA",
      text: "The scholarship finder is insane. I've applied to 12 scholarships in the past month and already won 2!",
      rating: 5,
      avatar: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
    },
    {
      name: "Priya",
      age: 17,
      location: "FL",
      text: "My resume went from 'meh' to 'wow' overnight. Got my first internship interview thanks to FuturePath!",
      rating: 5,
      avatar: "https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
    },
    {
      name: "Marcus",
      age: 16,
      location: "GA",
      text: "Finally found my passion in cybersecurity. The AI mentor helped me build a clear path to my dream college program.",
      rating: 5,
      avatar: "https://images.pexels.com/photos/1043473/pexels-photo-1043473.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
    }
  ];

  const TestimonialCard = ({ testimonial }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center space-x-1 mb-4">
        {[...Array(testimonial.rating)].map((_, i) => (
          <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
        ))}
      </div>
      
      <Quote className="h-8 w-8 text-purple-200 mb-4" />
      
      <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.text}"</p>
      
      <div className="flex items-center space-x-3">
        <img
          src={testimonial.avatar}
          alt={testimonial.name}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <p className="font-semibold text-gray-900">
            {testimonial.name}
            {testimonial.age && `, ${testimonial.age}`}
            {testimonial.role && ` (${testimonial.role})`}
          </p>
          <p className="text-gray-500 text-sm">{testimonial.location}</p>
        </div>
      </div>
    </div>
  );

  return (
    <section id="testimonials" className="py-16 relative overflow-hidden">
      {/* Enhanced Background - Similar to Hero */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Multiple Floating Orbs */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-gray-400 to-slate-400 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-slate-400 to-zinc-400 rounded-full mix-blend-multiply filter blur-2xl opacity-25 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-zinc-300 to-gray-300 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-pulse animation-delay-4000"></div>
        
        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        {/* Enhanced Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(25)].map((_, i) => (
            <div
              key={i}
              className={`absolute rounded-full opacity-20 animate-float ${
                i % 3 === 0 ? 'w-3 h-3 bg-indigo-400' : 
                i % 3 === 1 ? 'w-2 h-2 bg-purple-400' : 
                'w-4 h-4 bg-pink-400'
              }`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${4 + Math.random() * 4}s`
              }}
            ></div>
          ))}
        </div>

        {/* Gradient Overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-50/30"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 mb-4 border border-white/20 shadow-sm">
              <span className="text-2xl">❤️</span>
              <span className="text-gray-700 font-semibold">What Our Early Users Say</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-700 to-slate-700 bg-clip-text text-transparent mb-4">
              Real stories from real teens
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of students already building their dream futures
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} testimonial={testimonial} />
            ))}
          </div>

          {/* Stats */}
          <div className="mt-16 bg-gradient-to-br from-white/80 to-gray-50/80 backdrop-blur-sm rounded-2xl p-8 sm:p-12 border border-white/20 shadow-lg">
            <div className="grid sm:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-2">1,000+</div>
                <div className="text-gray-600">Active Students</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-2">$500K+</div>
                <div className="text-gray-600">Scholarships Won</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-2">95%</div>
                <div className="text-gray-600">College Acceptance Rate</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-2">4.9/5</div>
                <div className="text-gray-600">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;