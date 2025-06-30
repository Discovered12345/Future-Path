import React, { useState } from 'react';
import { Compass, ArrowRight, Heart, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import AuthModal from './auth/AuthModal';

const Footer = () => {
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const handleGetStarted = () => {
    if (user) {
      window.location.href = '/dashboard';
    } else {
      setAuthModalOpen(true);
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <footer className="bg-gray-900 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-600 to-blue-600"></div>
          <div className="absolute top-10 left-10 w-32 h-32 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-30"></div>
        </div>

        {/* CTA Section */}
        <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 py-20">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-center space-x-2 mb-6">
                <Sparkles className="h-8 w-8 text-yellow-400" />
                <h2 className="text-4xl sm:text-5xl font-bold">
                  Ready to Start Your Future?
                </h2>
                <Sparkles className="h-8 w-8 text-yellow-400" />
              </div>
              <p className="text-xl sm:text-2xl text-purple-100 mb-10 leading-relaxed">
                Don't wait for college to figure it out. Build the career of your dreams today—step by step, choice by choice.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <button 
                  onClick={handleGetStarted}
                  className="group bg-white text-purple-600 px-10 py-5 rounded-full font-bold text-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 hover:scale-105 flex items-center justify-center space-x-3"
                >
                  <span>{user ? 'Go to Dashboard' : 'Start Your Journey'}</span>
                  <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              <p className="text-purple-100 text-lg mt-6 flex items-center justify-center space-x-2">
                <Heart className="h-5 w-5 text-pink-300" />
                <span>Free to get started. No credit card required.</span>
                <Heart className="h-5 w-5 text-pink-300" />
              </p>
            </div>
          </div>
        </div>

        {/* Footer Content */}
        <div className="relative py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-12">
              {/* Brand */}
              <div className="md:col-span-1">
                <div className="flex items-center space-x-3 mb-6 cursor-pointer" onClick={() => window.location.href = '/'}>
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-xl">
                    <Compass className="h-8 w-8 text-white" />
                  </div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">FuturePath</span>
                </div>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  Your AI career mentor for ages 13–18. Unlock your future, one smart decision at a time.
                </p>
              </div>

              {/* Product */}
              <div>
                <h3 className="font-bold text-lg mb-6 text-white">Product</h3>
                <ul className="space-y-4 text-gray-400">
                  <li><button onClick={() => scrollToSection('features')} className="hover:text-purple-400 transition-colors hover:underline">Features</button></li>
                  <li><span className="text-gray-500">Roadmap</span></li>
                  <li><span className="text-gray-500">API</span></li>
                  <li><span className="text-gray-500">Integrations</span></li>
                </ul>
              </div>

              {/* Company */}
              <div>
                <h3 className="font-bold text-lg mb-6 text-white">Company</h3>
                <ul className="space-y-4 text-gray-400">
                  <li><span className="text-gray-500">About</span></li>
                  <li><span className="text-gray-500">Blog</span></li>
                  <li><span className="text-gray-500">Careers</span></li>
                  <li><span className="text-gray-500">Press</span></li>
                  <li><span className="text-gray-500">Partners</span></li>
                </ul>
              </div>

              {/* Support */}
              <div>
                <h3 className="font-bold text-lg mb-6 text-white">Support</h3>
                <ul className="space-y-4 text-gray-400">
                  <li><span className="text-gray-500">For Parents</span></li>
                  <li><span className="text-gray-500">For Schools</span></li>
                  <li>
                    <a 
                      href="mailto:hockeyrider2025@gmail.com?subject=FuturePath Help Center - Support Request"
                      className="hover:text-purple-400 transition-colors hover:underline"
                    >
                      Help Center
                    </a>
                  </li>
                  <li>
                    <a 
                      href="mailto:hockeyrider2025@gmail.com?subject=FuturePath Contact - General Inquiry"
                      className="hover:text-purple-400 transition-colors hover:underline"
                    >
                      Contact
                    </a>
                  </li>
                  <li><span className="text-gray-500">Community</span></li>
                </ul>
              </div>
            </div>

            {/* Bottom */}
            <div className="border-t border-gray-800 mt-16 pt-8 flex flex-col sm:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm flex items-center space-x-2">
                <span>© 2025 FuturePath. All rights reserved.</span>
                <Heart className="h-4 w-4 text-pink-400" />
                <span>Made with love for the next generation</span>
              </p>
              <div className="flex space-x-8 mt-4 sm:mt-0">
                <a 
                  href="https://opensource.org/licenses/MIT" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-purple-400 transition-colors text-sm hover:underline"
                >
                  Privacy (MIT)
                </a>
                <a 
                  href="https://opensource.org/licenses/MIT" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-purple-400 transition-colors text-sm hover:underline"
                >
                  Terms (MIT)
                </a>
                <a 
                  href="https://www.ftc.gov/enforcement/rules/rulemaking-regulatory-reform-proceedings/childrens-online-privacy-protection-rule" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-purple-400 transition-colors text-sm hover:underline"
                >
                  COPPA Compliance
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode="signup"
      />
    </>
  );
};

export default Footer;