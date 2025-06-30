import React, { useState } from 'react';
import { ArrowRight, Users, Award, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import AuthModal from './auth/AuthModal';

const Hero = () => {
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
      <section className="relative pt-20 pb-24 min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Enhanced Animated Background */}
        <div className="absolute inset-0">
          {/* Multiple Floating Orbs with better positioning */}
          <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse animation-delay-4000"></div>
          <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse animation-delay-1000"></div>
          <div className="absolute bottom-40 right-20 w-80 h-80 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse animation-delay-3000"></div>
          
          {/* Animated Grid Pattern */}
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          
          {/* Enhanced Floating Particles */}
          <div className="absolute inset-0">
            {[...Array(30)].map((_, i) => (
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
                  animationDuration: `${3 + Math.random() * 4}s`
                }}
              ></div>
            ))}
          </div>

          {/* Gradient Overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-50/30"></div>
        </div>

        {/* Bolt.new Badge - Smaller and More to the Left */}
        <div className="absolute top-32 right-16 z-20">
          <a
            href="https://bolt.new"
            target="_blank"
            rel="noopener noreferrer"
            className="block hover:scale-110 transition-transform duration-300 drop-shadow-xl"
            title="Built with Bolt.new"
          >
            <img
              src="/black_circle_360x360.png"
              alt="Built with Bolt.new"
              className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32"
            />
          </a>
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              Your AI Career Mentor for 
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent block mt-8 pb-4">
                Ages 13–18
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl sm:text-2xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
              Unlock your future. One smart decision at a time. Get personalized career guidance, 
              skill roadmaps, and opportunities—powered by cutting-edge AI.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <button 
                onClick={handleGetStarted}
                className="group bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-10 py-5 rounded-full font-bold text-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 hover:scale-105 flex items-center justify-center space-x-3"
              >
                <span>{user ? 'Go to Dashboard' : 'Start Your Journey'}</span>
                <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center group hover:scale-110 transition-transform duration-300">
                <div className="flex items-center justify-center mb-3">
                  <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-3 rounded-full shadow-lg">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">1K+</div>
                <div className="text-gray-600 font-medium">Active Users</div>
              </div>
              <div className="text-center group hover:scale-110 transition-transform duration-300">
                <div className="flex items-center justify-center mb-3">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-3 rounded-full shadow-lg">
                    <Award className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">500+</div>
                <div className="text-gray-600 font-medium">Career Paths</div>
              </div>
              <div className="text-center group hover:scale-110 transition-transform duration-300">
                <div className="flex items-center justify-center mb-3">
                  <div className="bg-gradient-to-r from-yellow-500 to-orange-600 p-3 rounded-full shadow-lg">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">4.9/5</div>
                <div className="text-gray-600 font-medium">User Rating</div>
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

export default Hero;