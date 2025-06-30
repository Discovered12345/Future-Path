import React, { useState, useEffect } from 'react';
import { 
  User, 
  Settings, 
  LogOut, 
  Brain, 
  Target, 
  Award, 
  TrendingUp, 
  Calendar, 
  MessageCircle, 
  FileText, 
  Search, 
  GraduationCap,
  Briefcase,
  Star,
  Zap,
  CheckCircle,
  Clock,
  ArrowRight,
  Plus,
  BookOpen,
  Users,
  Sparkles,
  X,
  Mail,
  Lock,
  Trash2,
  DollarSign,
  Globe,
  Lightbulb
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useUserStats } from '../hooks/useUserStats';
import { useUserSettings } from '../hooks/useUserSettings';
import { supabase } from '../lib/supabase';
import AIChat from '../components/AIChat';
import AcademicProfileModal from '../components/AcademicProfileModal';
import { useAcademicProfile } from '../hooks/useAcademicProfile';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const { stats, achievements, recentActivities, loading: statsLoading } = useUserStats();
  const { settings, loading: settingsLoading } = useUserSettings();
  const { profile: academicProfile, loading: academicLoading } = useAcademicProfile();
  const [showAIChat, setShowAIChat] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAcademicProfile, setShowAcademicProfile] = useState(false);
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);

  // Mark page as loaded after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoaded(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Navigation functions
  const navigateTo = (path: string) => {
    window.location.href = path;
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      // Force redirect to home page even if signOut fails
      window.location.href = '/';
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmail.trim()) {
      alert('❌ Missing Information\n\nPlease enter a new email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail.trim())) {
      alert('❌ Invalid Email Format\n\nPlease enter a valid email address');
      return;
    }

    if (newEmail.trim().toLowerCase() === user?.email?.toLowerCase()) {
      alert('❌ Same Email\n\nThe new email address is the same as your current email address.');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail.trim().toLowerCase()
      });

      if (error) {
        alert(`⚠️ Email Update Failed\n\n${error.message}\n\nPlease try again or contact support.`);
      } else {
        alert('✅ Email Updated Successfully!\n\nYour email has been changed immediately. The page will refresh to show your new email address.');
        setNewEmail('');
        setShowChangeEmail(false);
        
        // Force page refresh to show new email
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      alert(`💥 Unexpected Error\n\nAn unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      alert('❌ Missing Information\n\nPlease fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('❌ Password Mismatch\n\nNew passwords do not match. Please make sure both password fields are identical.');
      return;
    }

    if (newPassword.length < 6) {
      alert('❌ Password Too Short\n\nPassword must be at least 6 characters long for security.');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        alert(`❌ Password Update Failed\n\nError: ${error.message}\n\nPlease try again or contact support if the issue persists.`);
      } else {
        alert('✅ Password Updated Successfully!\n\nYour new password is now active and you can use it for future logins.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowChangePassword(false);
      }
    } catch (error) {
      alert(`💥 Unexpected Error\n\nAn unexpected error occurred while updating your password: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease try again or contact support.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = prompt(
      '⚠️ PERMANENT ACCOUNT DELETION\n\nThis action cannot be undone and will permanently delete:\n• All your assessments and progress\n• Your roadmaps and saved opportunities\n• Your AI chat history\n• All personal data and settings\n\nType "DELETE" to confirm (case-sensitive):'
    );

    if (confirmation !== 'DELETE') {
      if (confirmation !== null) {
        alert('❌ Deletion Cancelled\n\nAccount deletion cancelled. You must type "DELETE" exactly to confirm.');
      }
      return;
    }

    const finalConfirmation = confirm(
      '🚨 FINAL WARNING\n\nThis will permanently delete ALL your data including:\n• Assessments and career progress\n• Learning roadmaps\n• Saved opportunities and applications\n• AI conversation history\n• Account settings and preferences\n\nThis action is IRREVERSIBLE.\n\nAre you absolutely sure you want to delete your account?'
    );

    if (!finalConfirmation) {
      alert('✅ Account Preserved\n\nAccount deletion cancelled. Your data is safe.');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.rpc('delete_my_account');

      if (error) {
        alert(`❌ Account Deletion Failed\n\nError: ${error.message}\n\nPlease try again or contact support for assistance.`);
      } else {
        alert('✅ Account Deleted Successfully\n\nYour account and all associated data have been permanently deleted.\n\nYou will now be redirected to the home page.');
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      }
    } catch (error) {
      alert(`💥 Unexpected Error\n\nAn unexpected error occurred while deleting your account: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease try again or contact support.`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to access your dashboard</h1>
          <button
            onClick={() => navigateTo('/login')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // Show loading state only if page hasn't loaded yet
  if (!pageLoaded && (statsLoading || settingsLoading || academicLoading)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const allActions = [
    {
      title: "Take Career Assessment",
      description: "Discover careers that match your interests and personality",
      icon: Brain,
      color: "from-purple-500 to-pink-500",
      path: "/take-assessment",
      stats: "20 questions • 10 min",
      category: "Assessment"
    },
    {
      title: "View Learning Roadmap",
      description: "Follow your personalized step-by-step learning path",
      icon: Target,
      color: "from-blue-500 to-cyan-500",
      path: "/view-roadmap",
      stats: "4-year plan • AI-powered",
      category: "Learning"
    },
    {
      title: "Find Opportunities",
      description: "Scholarships, internships, and competitions for teens",
      icon: Award,
      color: "from-green-500 to-emerald-500",
      path: "/explore-opportunities",
      stats: "$2.3M+ won by users",
      category: "Opportunities"
    },
    {
      title: "Track Your Progress",
      description: "See your achievements and skill development",
      icon: TrendingUp,
      color: "from-orange-500 to-red-500",
      path: "/view-progress",
      stats: `${achievements.filter(a => a.earned).length} achievements earned`,
      category: "Progress"
    },
    {
      title: "Build Professional Resume",
      description: "Create ATS-friendly resumes with AI assistance",
      icon: FileText,
      color: "from-indigo-500 to-purple-500",
      path: "/resume-builder",
      stats: "95% success rate",
      category: "Career Tools"
    },
    {
      title: "College Matching",
      description: "Find colleges that fit your goals and profile",
      icon: GraduationCap,
      color: "from-teal-500 to-blue-500",
      path: "/college-matching",
      stats: "2,000+ colleges",
      category: "Education"
    }
  ];

  // Filter to only show earned achievements
  const recentAchievements = achievements.filter(a => a.earned).slice(0, 3);

  // Career insights based on user data
  const getCareerInsights = () => {
    const insights = [];
    
    if (stats.assessmentsTaken === 0) {
      insights.push({
        title: "Take Your First Assessment",
        description: "Discover career paths that match your personality",
        action: "Start Assessment",
        path: "/take-assessment",
        color: "bg-purple-100 text-purple-800"
      });
    }
    
    if (stats.roadmapsCreated === 0 && stats.assessmentsTaken > 0) {
      insights.push({
        title: "Create Your Learning Roadmap",
        description: "Get a personalized 4-year high school plan",
        action: "Build Roadmap",
        path: "/view-roadmap",
        color: "bg-blue-100 text-blue-800"
      });
    }
    
    if (stats.opportunitiesFound < 5) {
      insights.push({
        title: "Explore More Opportunities",
        description: "Find scholarships and internships for your career",
        action: "Find Opportunities",
        path: "/explore-opportunities",
        color: "bg-green-100 text-green-800"
      });
    }

    return insights.slice(0, 2);
  };

  const careerInsights = getCareerInsights();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  FuturePath
                </h1>
                <p className="text-sm text-gray-600">Welcome back, {user.user_metadata?.full_name || user.email?.split('@')[0] || 'Student'}!</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAIChat(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full hover:shadow-lg transition-all"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="hidden sm:inline">AI Mentor</span>
              </button>
              
              <button
                onClick={() => setShowAcademicProfile(true)}
                className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full border border-gray-200 hover:border-purple-300 transition-all"
              >
                <GraduationCap className="h-4 w-4 text-purple-600" />
                <span className="hidden sm:inline text-gray-700">Academic Profile</span>
              </button>
              
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-all"
              >
                <Settings className="h-5 w-5" />
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
              >
                <Globe className="h-5 w-5" />
              </button>
              
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-3xl p-8 mb-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-2">Ready to shape your future?</h2>
              <p className="text-purple-100 text-lg mb-6">
                You're {stats.profileCompleteness}% complete with your profile. Let's keep building your path to success!
              </p>
              <div className="w-full bg-white/20 rounded-full h-3 mb-4">
                <div 
                  className="bg-white h-3 rounded-full transition-all duration-500"
                  style={{ width: `${stats.profileCompleteness}%` }}
                ></div>
              </div>
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>{stats.daysActive} days active</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="h-4 w-4" />
                  <span>{achievements.filter(a => a.earned).length} achievements</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4" />
                  <span>{stats.goalsCompleted} goals completed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Career Insights */}
          {careerInsights.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-white/20">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                <span>Personalized Insights</span>
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {careerInsights.map((insight, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-2">{insight.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{insight.description}</p>
                    <button
                      onClick={() => navigateTo(insight.path)}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${insight.color}`}
                    >
                      {insight.action}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats Overview - Using Real Data */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.skillsTracked}</p>
                  <p className="text-gray-600 text-sm">Skills Tracked</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-lg">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.opportunitiesFound}</p>
                  <p className="text-gray-600 text-sm">Opportunities</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.daysActive}</p>
                  <p className="text-gray-600 text-sm">Days Active</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-lg">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.goalsCompleted}</p>
                  <p className="text-gray-600 text-sm">Goals Completed</p>
                </div>
              </div>
            </div>
          </div>

          {/* All Actions */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Career Development Tools</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => navigateTo(action.path)}
                  className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 text-left"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className={`bg-gradient-to-r ${action.color} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                          {action.title}
                        </h4>
                        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{action.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-purple-600 font-medium">{action.category}</span>
                        <span className="text-xs text-gray-500">{action.stats}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Achievements & Activity - Using Real Data */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Recent Achievements */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Recent Achievements</h3>
                <button
                  onClick={() => navigateTo('/view-progress')}
                  className="text-purple-600 hover:text-purple-700 font-semibold text-sm flex items-center space-x-1"
                >
                  <span>View All</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              
              {recentAchievements.length > 0 ? (
                <div className="space-y-4">
                  {recentAchievements.map((achievement, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="bg-green-500 p-2 rounded-full">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                        <p className="text-gray-600 text-sm">{achievement.description}</p>
                        {achievement.earnedAt && (
                          <p className="text-gray-500 text-xs">
                            Earned {new Date(achievement.earnedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Complete actions to earn achievements!</p>
                  <p className="text-gray-400 text-sm mt-2">Take an assessment or explore opportunities to get started</p>
                </div>
              )}
            </div>

            {/* Recent Activity - Using Real Data */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h3>
              
              {recentActivities.length > 0 ? (
                <div className="space-y-4">
                  {recentActivities.slice(0, 5).map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-2 rounded-full">
                        <Zap className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{activity.action}</p>
                        <p className="text-gray-500 text-sm">{new Date(activity.timestamp).toLocaleDateString()}</p>
                      </div>
                      <div className="text-purple-600 font-semibold text-sm">
                        +{activity.points} pts
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Your activity will appear here</p>
                  <p className="text-gray-400 text-sm mt-2">Start using FuturePath to see your progress!</p>
                </div>
              )}
            </div>
          </div>

          {/* Get Started Section */}
          <div className="mt-8 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to take the next step?</h3>
            <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
              {stats.assessmentsTaken === 0 
                ? "Start with a career assessment to discover paths that match your interests and personality."
                : stats.roadmapsCreated === 0
                ? "Great! You've taken an assessment. Now create a learning roadmap to guide your journey."
                : "You're making great progress! Keep exploring opportunities and tracking your growth."
              }
            </p>
            <button
              onClick={() => navigateTo(
                stats.assessmentsTaken === 0 
                  ? '/take-assessment' 
                  : stats.roadmapsCreated === 0
                  ? '/view-roadmap'
                  : '/explore-opportunities'
              )}
              className="bg-white text-purple-600 px-8 py-3 rounded-full font-bold hover:shadow-lg transition-all transform hover:-translate-y-1"
            >
              {stats.assessmentsTaken === 0 
                ? "Take Assessment Now"
                : stats.roadmapsCreated === 0
                ? "Create Your Roadmap"
                : "Find Opportunities"
              }
            </button>
          </div>
        </div>
      </div>

      {/* AI Chat Modal */}
      <AIChat isOpen={showAIChat} onClose={() => setShowAIChat(false)} />

      {/* Academic Profile Modal */}
      <AcademicProfileModal isOpen={showAcademicProfile} onClose={() => setShowAcademicProfile(false)} />

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Account Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Current Email Display */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Current Email</p>
                    <p className="font-medium text-gray-900">{user.email}</p>
                  </div>
                </div>
              </div>

              {/* Change Email */}
              <button
                onClick={() => setShowChangeEmail(!showChangeEmail)}
                className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Mail className="h-5 w-5 text-blue-600" />
                <span className="text-gray-700">Change Email Address</span>
              </button>

              {showChangeEmail && (
                <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                  <input
                    type="email"
                    placeholder="New email address"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleChangeEmail}
                      disabled={isLoading || !newEmail.trim()}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {isLoading ? 'Updating...' : 'Update Email'}
                    </button>
                    <button
                      onClick={() => setShowChangeEmail(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Change Password */}
              <button
                onClick={() => setShowChangePassword(!showChangePassword)}
                className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Lock className="h-5 w-5 text-green-600" />
                <span className="text-gray-700">Change Password</span>
              </button>

              {showChangePassword && (
                <div className="bg-green-50 rounded-lg p-4 space-y-3">
                  <input
                    type="password"
                    placeholder="New password (min 6 characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleChangePassword}
                      disabled={isLoading}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {isLoading ? 'Updating...' : 'Update Password'}
                    </button>
                    <button
                      onClick={() => setShowChangePassword(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
              {/* Sign Out */}
              <button
                onClick={handleSignOut}
                className="w-full flex items-center space-x-3 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>

              {/* Delete Account */}
              <button
                onClick={handleDeleteAccount}
                disabled={isLoading}
                className="w-full flex items-center space-x-3 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                <Trash2 className="h-5 w-5" />
                <span>{isLoading ? 'Deleting...' : 'Delete Account'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}