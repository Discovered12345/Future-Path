import React, { useState, useEffect } from 'react';
import { Menu, X, Compass } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import AuthModal from './auth/AuthModal';

const Header = () => {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLoginClick = () => {
    setAuthModalMode('login');
    setAuthModalOpen(true);
  };

  const handleSignupClick = () => {
    setAuthModalMode('signup');
    setAuthModalOpen(true);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const handleDashboardClick = () => {
    window.location.href = '/dashboard';
  };

  const handleHomeClick = () => {
    window.location.href = '/';
  };

  return (
    <>
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white/90 backdrop-blur-md'
      } border-b border-gray-100`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={handleHomeClick}>
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg">
                <Compass className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                FuturePath
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button onClick={() => scrollToSection('features')} className="text-gray-700 hover:text-purple-600 transition-colors">
                Features
              </button>
              <button onClick={() => scrollToSection('how-it-works')} className="text-gray-700 hover:text-purple-600 transition-colors">
                How It Works
              </button>
              <button onClick={() => scrollToSection('testimonials')} className="text-gray-700 hover:text-purple-600 transition-colors">
                Reviews
              </button>
              
              {user ? (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleDashboardClick}
                    className="text-gray-700 hover:text-purple-600 transition-colors"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={signOut}
                    className="text-gray-700 hover:text-purple-600 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleLoginClick}
                    className="text-gray-700 hover:text-purple-600 transition-colors"
                  >
                    Log In
                  </button>
                  <button
                    onClick={handleSignupClick}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                  >
                    Get Started Free
                  </button>
                </div>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 space-y-4">
              <button onClick={() => scrollToSection('features')} className="block w-full text-left text-gray-700 hover:text-purple-600 transition-colors">
                Features
              </button>
              <button onClick={() => scrollToSection('how-it-works')} className="block w-full text-left text-gray-700 hover:text-purple-600 transition-colors">
                How It Works
              </button>
              <button onClick={() => scrollToSection('testimonials')} className="block w-full text-left text-gray-700 hover:text-purple-600 transition-colors">
                Reviews
              </button>
              
              {user ? (
                <>
                  <button
                    onClick={handleDashboardClick}
                    className="block text-gray-700 hover:text-purple-600 transition-colors"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={signOut}
                    className="block w-full text-left text-gray-700 hover:text-purple-600 transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleLoginClick}
                    className="block w-full text-left text-gray-700 hover:text-purple-600 transition-colors"
                  >
                    Log In
                  </button>
                  <button
                    onClick={handleSignupClick}
                    className="block w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all"
                  >
                    Get Started Free
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </>
  );
};

export default Header;