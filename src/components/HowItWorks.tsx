import React, { useState } from 'react';
import { UserCheck, Compass, TrendingUp, CheckCircle, Sparkles, Zap, Star } from 'lucide-react';

const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const steps = [
    {
      icon: UserCheck,
      number: "01",
      title: "Create your profile",
      subtitle: "(5 mins)",
      description: "Answer a few simple questions about your interests, grades, values, and goals.",
      color: "from-violet-500 via-purple-500 to-fuchsia-500",
      bgColor: "from-violet-50 to-purple-50",
      details: ["Personality assessment", "Interest mapping", "Goal setting", "Academic background"]
    },
    {
      icon: Compass,
      number: "02",
      title: "Meet your Mentor",
      subtitle: "AI builds your personalized career roadmap",
      description: "Our AI analyzes your profile and creates a custom path tailored specifically to your strengths and aspirations.",
      color: "from-cyan-500 via-blue-500 to-indigo-500",
      bgColor: "from-cyan-50 to-blue-50",
      details: ["AI analysis", "Career matching", "Skill gap identification", "Custom roadmap creation"]
    },
    {
      icon: TrendingUp,
      number: "03",
      title: "Start learning, winning, and growing",
      subtitle: "Track your progress every step of the way",
      description: "View your career dashboard, track skills and progress, earn badges for challenges, and get reminders that keep you on track.",
      color: "from-emerald-500 via-teal-500 to-cyan-500",
      bgColor: "from-emerald-50 to-teal-50",
      details: ["Progress tracking", "Skill development", "Achievement badges", "Daily coaching"]
    }
  ];

  const features = [
    "View your career dashboard",
    "Track your skills and progress", 
    "Earn badges for challenges",
    "Get reminders and nudges that keep you on track"
  ];

  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden">
      {/* Unique Background - Wave Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-orange-50 to-amber-100">
        {/* Wave-like shapes */}
        <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-amber-300 to-yellow-300 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-pulse animation-delay-4000"></div>
        
        {/* Wave pattern */}
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f59e0b' fill-opacity='0.06'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm30 0c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
        
        {/* Floating circles */}
        <div className="absolute inset-0">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className={`absolute rounded-full opacity-20 animate-float ${
                i % 3 === 0 ? 'w-6 h-6 bg-rose-400' : 
                i % 3 === 1 ? 'w-4 h-4 bg-orange-400' : 
                'w-8 h-8 bg-amber-400'
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
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 mb-6 shadow-lg border border-white/20">
              <Zap className="h-6 w-6 text-orange-600" />
              <span className="text-orange-600 font-bold text-lg">How It Works</span>
              <Sparkles className="h-5 w-5 text-yellow-500" />
            </div>
            <h2 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-rose-600 via-orange-600 to-amber-600 bg-clip-text text-transparent mb-6">
              Get started in minutes
            </h2>
            <p className="text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Three simple steps to unlock your personalized career roadmap
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-16 mb-20">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className="relative"
                onMouseEnter={() => setActiveStep(index)}
                onMouseLeave={() => setActiveStep(null)}
              >
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-8 top-32 w-1 h-20 bg-gradient-to-b from-orange-300 to-amber-300 hidden sm:block opacity-50"></div>
                )}
                
                <div className={`group bg-white/80 backdrop-blur-sm rounded-3xl p-8 sm:p-16 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-white/20 relative overflow-hidden ${
                  activeStep === index ? 'scale-105' : ''
                }`}>
                  {/* Animated Background */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${step.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl`}></div>
                  
                  <div className="flex flex-col lg:flex-row items-start space-y-8 lg:space-y-0 lg:space-x-12 relative z-10">
                    {/* Step Icon & Number */}
                    <div className="flex-shrink-0">
                      <div className={`bg-gradient-to-r ${step.color} rounded-3xl p-6 mb-6 w-fit shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                        <step.icon className="h-12 w-12 text-white" />
                      </div>
                      <div className="text-8xl font-bold text-gray-200 group-hover:text-gray-300 transition-colors duration-300">
                        {step.number}
                      </div>
                    </div>

                    {/* Step Content */}
                    <div className="flex-1">
                      <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-rose-600 group-hover:to-amber-600 transition-all duration-300">
                        {step.title}
                      </h3>
                      <p className="text-orange-600 font-bold text-lg mb-6">{step.subtitle}</p>
                      <p className="text-gray-700 text-xl leading-relaxed mb-8">{step.description}</p>
                      
                      {/* Step Details */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        {step.details.map((detail, detailIndex) => (
                          <div 
                            key={detailIndex}
                            className={`flex items-center space-x-3 transform transition-all duration-300 ${
                              activeStep === index ? 'translate-x-2' : ''
                            }`}
                            style={{ transitionDelay: `${detailIndex * 100}ms` }}
                          >
                            <div className={`w-2 h-2 bg-gradient-to-r ${step.color} rounded-full`}></div>
                            <span className="text-gray-600 font-medium">{detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Interactive Visual */}
                    <div className="lg:w-1/3">
                      <div className={`relative bg-gradient-to-br ${step.color} rounded-2xl p-8 text-white shadow-2xl transform group-hover:scale-105 group-hover:rotate-1 transition-all duration-500`}>
                        {/* Floating Elements */}
                        <div className="absolute top-4 right-4 w-6 h-6 bg-white/20 rounded-full animate-pulse"></div>
                        <div className="absolute bottom-4 left-4 w-4 h-4 bg-white/30 rounded-full animate-pulse animation-delay-2000"></div>
                        
                        {/* Main Icon */}
                        <div className="flex items-center justify-center h-32 relative">
                          <step.icon className={`h-16 w-16 text-white/90 transform transition-all duration-500 ${
                            activeStep === index ? 'scale-125 rotate-12' : ''
                          }`} />
                          
                          {/* Animated Rings */}
                          <div className={`absolute inset-0 border-2 border-white/30 rounded-full animate-ping ${
                            activeStep === index ? 'opacity-100' : 'opacity-0'
                          } transition-opacity duration-300`}></div>
                        </div>
                        
                        {/* Progress Bars */}
                        <div className="mt-6 space-y-2">
                          {[...Array(3)].map((_, i) => (
                            <div
                              key={i}
                              className={`h-1.5 bg-white/30 rounded-full transform transition-all duration-500 ${
                                activeStep === index ? 'scale-x-100' : 'scale-x-75'
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
                </div>
              </div>
            ))}
          </div>

          {/* Features List */}
          <div className="bg-gradient-to-br from-white/80 to-orange-50/80 backdrop-blur-sm rounded-3xl p-8 sm:p-16 shadow-2xl border border-white/20 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-6 right-6 w-8 h-8 bg-orange-400/20 rounded-full animate-pulse"></div>
            <div className="absolute bottom-6 left-6 w-6 h-6 bg-amber-400/20 rounded-full animate-pulse animation-delay-2000"></div>

            <div className="relative z-10">
              <h3 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent mb-12 text-center">
                What you can do:
              </h3>
              <div className="grid sm:grid-cols-2 gap-8">
                {features.map((feature, index) => (
                  <div key={index} className="group flex items-center space-x-4 p-4 rounded-2xl hover:bg-white/50 transition-all duration-300">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-3 rounded-full group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-gray-700 font-semibold text-lg group-hover:text-gray-900 transition-colors">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;