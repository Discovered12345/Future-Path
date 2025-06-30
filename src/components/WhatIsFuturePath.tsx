import React, { useState } from 'react';
import { Brain, Target, Rocket, Sparkles, Zap, Star } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import AuthModal from './auth/AuthModal';

const WhatIsFuturePath = () => {
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const handleGetStarted = () => {
    if (user) {
      window.location.href = '/dashboard';
    } else {
      setAuthModalOpen(true);
    }
  };

  return (
    <>
      <section className="py-24 relative overflow-hidden">
        {/* Unique Background - Geometric Patterns */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100">
          {/* Geometric Shapes */}
          <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-cyan-400 to-blue-400 transform rotate-45 mix-blend-multiply filter blur-2xl opacity-25 animate-pulse animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-teal-300 to-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-4000"></div>
          
          {/* Hexagonal Pattern */}
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2314b8a6' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
          
          {/* Floating Triangles */}
          <div className="absolute inset-0">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="absolute w-0 h-0 animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  borderLeft: `${8 + Math.random() * 8}px solid transparent`,
                  borderRight: `${8 + Math.random() * 8}px solid transparent`,
                  borderBottom: `${12 + Math.random() * 12}px solid rgba(20, 184, 166, 0.2)`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${4 + Math.random() * 4}s`
                }}
              ></div>
            ))}
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 mb-6 shadow-lg border border-white/20">
                <Target className="h-6 w-6 text-emerald-600" />
                <span className="text-emerald-600 font-bold text-lg">What is FuturePath?</span>
                <Sparkles className="h-5 w-5 text-yellow-500" />
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-8">
                Your all-in-one AI career companion
              </h2>
            </div>

            {/* Main Content */}
            <div className="bg-gradient-to-br from-white/80 to-emerald-50/80 backdrop-blur-sm rounded-3xl p-8 sm:p-16 mb-16 shadow-2xl border border-white/20 relative overflow-hidden">
              {/* Floating Elements */}
              <div className="absolute top-6 right-6 w-8 h-8 bg-emerald-400/20 rounded-full animate-pulse"></div>
              <div className="absolute bottom-6 left-6 w-6 h-6 bg-teal-400/20 rounded-full animate-pulse animation-delay-2000"></div>
              <div className="absolute top-1/2 right-12 w-4 h-4 bg-cyan-400/20 rounded-full animate-pulse animation-delay-4000"></div>

              <div className="relative z-10">
                <p className="text-xl text-gray-700 leading-relaxed mb-8">
                  FuturePath is your all-in-one, AI-powered career companion built exclusively for teens aged 13 to 18. 
                  Whether you're still exploring your interests or already dreaming of Silicon Valley or Stanford, 
                  FuturePath is your guide, coach, and motivator—all in your pocket.
                </p>
                
                <p className="text-xl text-gray-700 leading-relaxed mb-12">
                  Unlike generic advice apps or outdated school counselors, FuturePath uses cutting-edge AI models, 
                  live market insights, and your personal strengths to build a custom roadmap to your dream career—with zero fluff.
                </p>

                {/* Key Questions */}
                <div className="grid sm:grid-cols-3 gap-8">
                  <div className="group bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-4 w-fit mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      <Rocket className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-bold text-xl text-gray-900 mb-3">"Where do I start?"</h3>
                    <p className="text-gray-600 leading-relaxed">Discover your perfect career path with AI-powered assessments</p>
                    <div className="mt-4 flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-semibold text-emerald-600">500+ Career Paths</span>
                    </div>
                  </div>
                  
                  <div className="group bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                    <div className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl p-4 w-fit mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      <Brain className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-bold text-xl text-gray-900 mb-3">"What should I learn next?"</h3>
                    <p className="text-gray-600 leading-relaxed">Get personalized skill roadmaps tailored to your goals</p>
                    <div className="mt-4 flex items-center space-x-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-semibold text-teal-600">10K+ Resources</span>
                    </div>
                  </div>
                  
                  <div className="group bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                    <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl p-4 w-fit mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      <Target className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-bold text-xl text-gray-900 mb-3">"How do I stand out?"</h3>
                    <p className="text-gray-600 leading-relaxed">Build impressive portfolios and find exclusive opportunities</p>
                    <div className="mt-4 flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-semibold text-cyan-600">95% Success Rate</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent mb-8">
                FuturePath answers it all—smarter, faster, better.
              </p>
              <button 
                onClick={handleGetStarted}
                className="group bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white px-10 py-5 rounded-full font-bold text-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 hover:scale-105 flex items-center justify-center space-x-3 mx-auto"
              >
                <span>{user ? 'Go to Dashboard' : 'Start Your Journey'}</span>
                <Sparkles className="h-6 w-6 group-hover:rotate-180 transition-transform duration-500" />
              </button>
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

export default WhatIsFuturePath;