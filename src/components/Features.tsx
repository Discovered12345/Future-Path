import React, { useState } from 'react';
import { Search, Brain, FileText, Award, GraduationCap, Calendar, MessageCircle, Sparkles, Zap, Star } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import AuthModal from './auth/AuthModal';

const Features = () => {
  const { user } = useAuth();
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const handleGetStarted = () => {
    if (user) {
      window.location.href = '/dashboard';
    } else {
      setAuthModalOpen(true);
    }
  };

  const features = [
    {
      icon: Search,
      title: "AI Career Discovery Engine",
      subtitle: "Not a boring quiz. Not guesswork.",
      description: "Our AI matches your interests, personality, and goals with real-world, high-growth careers using up-to-date job market data. From astrophysics to ethical hacking to biomedical design—we help you discover paths you never knew existed.",
      color: "from-violet-500 via-purple-500 to-fuchsia-500",
      bgColor: "from-violet-50 to-purple-50",
      accentColor: "violet-500",
      stats: "500+ Career Paths"
    },
    {
      icon: Brain,
      title: "Skill Path Builder (Personalized)",
      subtitle: "Want to become a software engineer? Entrepreneur? Doctor? Game designer?",
      description: "FuturePath gives you a step-by-step roadmap to master the skills needed—based on your grade, background, and dream universities. Suggests free and paid learning paths from top educational platforms.",
      color: "from-cyan-500 via-blue-500 to-indigo-500",
      bgColor: "from-cyan-50 to-blue-50",
      accentColor: "blue-500",
      stats: "10K+ Learning Resources"
    },
    {
      icon: FileText,
      title: "AI Resume & Portfolio Generator",
      subtitle: "Your first resume? We'll make it look like your third.",
      description: "FuturePath builds clean, standout resumes and project portfolios automatically as you complete challenges, competitions, and skill badges.",
      color: "from-emerald-500 via-teal-500 to-cyan-500",
      bgColor: "from-emerald-50 to-teal-50",
      accentColor: "emerald-500",
      stats: "95% Success Rate"
    },
    {
      icon: Award,
      title: "Scholarships, Competitions, & Internships Finder",
      subtitle: "No more hours wasted searching for scholarships or contests.",
      description: "Our AI scans 10,000+ sources weekly to recommend verified, relevant, and deadline-specific scholarships (need- or merit-based), competitions (coding, science, writing, design), research programs, hackathons, and internships.",
      color: "from-orange-500 via-amber-500 to-yellow-500",
      bgColor: "from-orange-50 to-amber-50",
      accentColor: "orange-500",
      stats: "$2.3M+ Won by Users"
    },
    {
      icon: GraduationCap,
      title: "Smart College & Major Matching",
      subtitle: "Tells you which majors fit your brain and heart—not just your GPA.",
      description: "Matches you to colleges based on your ambitions, budget, test scores, and preferred vibe. Shows real admissions data (acceptance rates, essay tips, recent student stats).",
      color: "from-rose-500 via-pink-500 to-fuchsia-500",
      bgColor: "from-rose-50 to-pink-50",
      accentColor: "rose-500",
      stats: "2,000+ Colleges"
    },
    {
      icon: Calendar,
      title: "Daily Micro-Coaching",
      subtitle: "Bite-sized, daily AI coaching.",
      description: "Get tasks like 'Watch this 3-min TED talk,' 'Apply to this $2K scholarship,' or 'Build your personal site today.' Designed to keep you moving forward—one smart step at a time.",
      color: "from-indigo-500 via-purple-500 to-pink-500",
      bgColor: "from-indigo-50 to-purple-50",
      accentColor: "indigo-500",
      stats: "Daily Personalized Tasks"
    },
    {
      icon: MessageCircle,
      title: "Ask Me Anything (AI Chat Mentor)",
      subtitle: "Feeling stuck? Just ask.",
      description: "'Should I take AP Chem?' 'Is Python or Java better for AI?' 'What are my chances at MIT?' Your personalized AI mentor gives answers tailored to you, not the internet.",
      color: "from-teal-500 via-cyan-500 to-blue-500",
      bgColor: "from-teal-50 to-cyan-50",
      accentColor: "teal-500",
      stats: "24/7 AI Support"
    }
  ];

  return (
    <>
      <section id="features" className="py-24 relative overflow-hidden">
        {/* Animated Background - Floating Squares */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-100">
          {/* Animated floating squares */}
          <div className="absolute inset-0">
            {[...Array(25)].map((_, i) => (
              <div
                key={i}
                className={`absolute animate-float opacity-20 ${
                  i % 4 === 0 ? 'w-8 h-8 bg-violet-400 rotate-45' : 
                  i % 4 === 1 ? 'w-6 h-6 bg-purple-400 rotate-12' : 
                  i % 4 === 2 ? 'w-10 h-10 bg-fuchsia-400 rotate-90' :
                  'w-4 h-4 bg-pink-400 rotate-180'
                }`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${3 + Math.random() * 4}s`
                }}
              ></div>
            ))}
          </div>
          
          {/* Rotating geometric shapes */}
          <div className="absolute inset-0">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className={`absolute animate-spin opacity-10 ${
                  i % 3 === 0 ? 'w-16 h-16 border-4 border-violet-500 rounded-full' : 
                  i % 3 === 1 ? 'w-12 h-12 border-4 border-purple-500 transform rotate-45' : 
                  'w-20 h-20 border-4 border-fuchsia-500 rounded-lg transform rotate-12'
                }`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${8 + Math.random() * 4}s`
                }}
              ></div>
            ))}
          </div>
          
          {/* Pulsing orbs */}
          <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-violet-400 to-purple-400 rounded-full mix-blend-multiply filter blur-2xl opacity-25 animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-fuchsia-400 to-pink-400 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-pulse animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-gradient-to-r from-purple-300 to-violet-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse animation-delay-4000"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-20">
              <div className="inline-flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 mb-6 shadow-lg border border-white/20">
                <Sparkles className="h-6 w-6 text-purple-600" />
                <span className="text-purple-600 font-bold text-lg">Key Features</span>
                <Zap className="h-6 w-6 text-yellow-500" />
              </div>
              <h2 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
                Why Teens Love FuturePath
              </h2>
              <p className="text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Powerful AI-driven tools designed specifically for your generation's career success
              </p>
            </div>

            {/* Features Grid */}
            <div className="space-y-12">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`group relative bg-white/70 backdrop-blur-sm rounded-3xl p-8 sm:p-12 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ${
                    index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                  } lg:flex lg:items-center lg:space-x-12`}
                  onMouseEnter={() => setHoveredFeature(index)}
                  onMouseLeave={() => setHoveredFeature(null)}
                >
                  {/* Animated Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${feature.bgColor} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                  
                  {/* Content */}
                  <div className="lg:w-1/2 mb-8 lg:mb-0 relative z-10">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className={`bg-gradient-to-r ${feature.color} p-4 rounded-2xl shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                        <feature.icon className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-indigo-600 group-hover:to-purple-600 transition-all duration-300">
                          {feature.title}
                        </h3>
                        <p className={`text-sm font-semibold text-${feature.accentColor} mt-1`}>
                          {feature.subtitle}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 leading-relaxed text-lg mb-6">
                      {feature.description}
                    </p>
                    
                    <div className={`inline-flex items-center space-x-2 bg-gradient-to-r ${feature.color} text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg`}>
                      <Star className="h-4 w-4" />
                      <span>{feature.stats}</span>
                    </div>
                  </div>
                  
                  {/* Interactive Visual */}
                  <div className="lg:w-1/2 relative z-10">
                    <div className={`relative bg-gradient-to-br ${feature.color} rounded-2xl p-8 sm:p-12 text-white shadow-2xl transform group-hover:scale-105 group-hover:rotate-1 transition-all duration-500`}>
                      {/* Floating Elements */}
                      <div className="absolute top-4 right-4 w-6 h-6 bg-white/20 rounded-full animate-pulse"></div>
                      <div className="absolute bottom-4 left-4 w-4 h-4 bg-white/30 rounded-full animate-pulse animation-delay-2000"></div>
                      <div className="absolute top-1/2 left-4 w-3 h-3 bg-white/25 rounded-full animate-pulse animation-delay-4000"></div>
                      
                      {/* Main Icon */}
                      <div className="flex items-center justify-center h-40 relative">
                        <feature.icon className={`h-24 w-24 text-white/90 transform transition-all duration-500 ${
                          hoveredFeature === index ? 'scale-125 rotate-12' : ''
                        }`} />
                        
                        {/* Animated Rings */}
                        <div className={`absolute inset-0 border-2 border-white/30 rounded-full animate-ping ${
                          hoveredFeature === index ? 'opacity-100' : 'opacity-0'
                        } transition-opacity duration-300`}></div>
                        <div className={`absolute inset-4 border-2 border-white/20 rounded-full animate-ping animation-delay-2000 ${
                          hoveredFeature === index ? 'opacity-100' : 'opacity-0'
                        } transition-opacity duration-300`}></div>
                      </div>
                      
                      {/* Interactive Elements */}
                      <div className="mt-6 space-y-3">
                        {[...Array(3)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-2 bg-white/30 rounded-full transform transition-all duration-500 ${
                              hoveredFeature === index ? 'scale-x-100' : 'scale-x-75'
                            }`}
                            style={{
                              width: `${60 + i * 15}%`,
                              transitionDelay: `${i * 100}ms`
                            }}
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="mt-20 text-center">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-white/20">
                <h3 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
                  Ready to unlock your potential?
                </h3>
                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                  Join thousands of teens who are already building their dream futures with FuturePath
                </p>
                <button 
                  onClick={handleGetStarted}
                  className="group bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-10 py-5 rounded-full font-bold text-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 hover:scale-105 flex items-center justify-center space-x-3 mx-auto"
                >
                  <span>{user ? 'Go to Dashboard' : 'Start Your Journey'}</span>
                  <Sparkles className="h-6 w-6 group-hover:rotate-180 transition-transform duration-500" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode="signup"
      />
    </>
  );
};

export default Features;