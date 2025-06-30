import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import WhatIsFuturePath from './components/WhatIsFuturePath';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import TakeAssessment from './pages/TakeAssessment';
import ViewRoadmap from './pages/ViewRoadmap';
import ExploreOpportunities from './pages/ExploreOpportunities';
import ViewProgress from './pages/ViewProgress';
import ResumeBuilder from './pages/ResumeBuilder';
import CollegeMatching from './pages/CollegeMatching';
import { useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';

function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <WhatIsFuturePath />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Footer />
    </div>
  );
}

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public routes - accessible to everyone */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/signup" element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        } />
        
        {/* Dashboard and feature routes - accessible to authenticated users */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/take-assessment" element={
          <ProtectedRoute>
            <TakeAssessment />
          </ProtectedRoute>
        } />
        <Route path="/view-roadmap" element={
          <ProtectedRoute>
            <ViewRoadmap />
          </ProtectedRoute>
        } />
        <Route path="/explore-opportunities" element={
          <ProtectedRoute>
            <ExploreOpportunities />
          </ProtectedRoute>
        } />
        <Route path="/view-progress" element={
          <ProtectedRoute>
            <ViewProgress />
          </ProtectedRoute>
        } />
        <Route path="/resume-builder" element={
          <ProtectedRoute>
            <ResumeBuilder />
          </ProtectedRoute>
        } />
        <Route path="/college-matching" element={
          <ProtectedRoute>
            <CollegeMatching />
          </ProtectedRoute>
        } />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;