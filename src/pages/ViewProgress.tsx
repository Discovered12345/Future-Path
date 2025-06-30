import React, { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, Award, Calendar, Target, CheckCircle, Clock, Star, BookOpen, Code, Heart, Briefcase, Lightbulb, Users } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useUserStats } from '../hooks/useUserStats';
import { supabase } from '../lib/supabase';

interface SkillProgress {
  name: string;
  level: number;
  category: string;
  lastUpdated: string;
}

export default function ViewProgress() {
  const { user } = useAuth();
  const { stats, achievements, recentActivities } = useUserStats();
  const [skillProgress, setSkillProgress] = useState<SkillProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadRealSkillProgress();
    }
  }, [user]);

  const loadRealSkillProgress = async () => {
    if (!user) return;

    try {
      // Load real skill progress from roadmaps and assessments
      const { data: roadmaps, error: roadmapError } = await supabase
        .from('user_roadmaps')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null);

      const { data: assessments, error: assessmentError } = await supabase
        .from('user_assessments')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null);

      if (roadmapError || assessmentError) {
        console.error('Error loading progress data:', roadmapError || assessmentError);
      }

      // Generate skill progress based on real data
      const skills: SkillProgress[] = [];

      // Add skills from roadmaps
      if (roadmaps && roadmaps.length > 0) {
        roadmaps.forEach(roadmap => {
          if (roadmap.steps && Array.isArray(roadmap.steps)) {
            roadmap.steps.forEach((step: any) => {
              if (step.skills && Array.isArray(step.skills)) {
                step.skills.forEach((skill: string) => {
                  const existingSkill = skills.find(s => s.name === skill);
                  if (!existingSkill) {
                    skills.push({
                      name: skill,
                      level: roadmap.progress_percentage || 0,
                      category: getCategoryFromCareerTrack(roadmap.career_track),
                      lastUpdated: roadmap.updated_at
                    });
                  }
                });
              }
            });
          }
        });
      }

      // Add skills from assessment results
      if (assessments && assessments.length > 0) {
        const latestAssessment = assessments[0];
        if (latestAssessment.results?.careers) {
          latestAssessment.results.careers.forEach((career: string) => {
            const skillsForCareer = getSkillsForCareer(career);
            skillsForCareer.forEach(skill => {
              const existingSkill = skills.find(s => s.name === skill.name);
              if (!existingSkill) {
                skills.push({
                  name: skill.name,
                  level: skill.level,
                  category: skill.category,
                  lastUpdated: latestAssessment.created_at
                });
              }
            });
          });
        }
      }

      // If no skills found, add some default ones based on user activity
      if (skills.length === 0) {
        skills.push(
          {
            name: "Critical Thinking",
            level: Math.min(stats.assessmentsTaken * 25, 100),
            category: "Cognitive",
            lastUpdated: new Date().toISOString()
          },
          {
            name: "Goal Setting",
            level: Math.min(stats.goalsCompleted * 30, 100),
            category: "Personal Development",
            lastUpdated: new Date().toISOString()
          },
          {
            name: "Research Skills",
            level: Math.min(stats.opportunitiesFound * 10, 100),
            category: "Academic",
            lastUpdated: new Date().toISOString()
          }
        );
      }

      setSkillProgress(skills.slice(0, 8)); // Limit to 8 skills for display
    } catch (error) {
      console.error('Error loading skill progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryFromCareerTrack = (careerTrack: string): string => {
    const categoryMap: { [key: string]: string } = {
      'software-engineering': 'Technical',
      'data-science': 'Technical',
      'product-design': 'Creative',
      'business': 'Business',
      'healthcare': 'Healthcare',
      'education': 'Education',
      'research-science': 'Research',
      'law': 'Legal',
      'medicine': 'Medical'
    };
    return categoryMap[careerTrack] || 'General';
  };

  const getSkillsForCareer = (career: string): SkillProgress[] => {
    const skillMap: { [key: string]: SkillProgress[] } = {
      'Software Engineer': [
        { name: 'Programming', level: 45, category: 'Technical', lastUpdated: new Date().toISOString() },
        { name: 'Problem Solving', level: 60, category: 'Cognitive', lastUpdated: new Date().toISOString() }
      ],
      'Data Scientist': [
        { name: 'Data Analysis', level: 40, category: 'Technical', lastUpdated: new Date().toISOString() },
        { name: 'Statistics', level: 35, category: 'Mathematical', lastUpdated: new Date().toISOString() }
      ],
      'UX/UI Designer': [
        { name: 'Design Thinking', level: 50, category: 'Creative', lastUpdated: new Date().toISOString() },
        { name: 'User Research', level: 40, category: 'Research', lastUpdated: new Date().toISOString() }
      ],
      'Healthcare Professional': [
        { name: 'Patient Care', level: 30, category: 'Healthcare', lastUpdated: new Date().toISOString() },
        { name: 'Medical Knowledge', level: 25, category: 'Medical', lastUpdated: new Date().toISOString() }
      ]
    };
    return skillMap[career] || [];
  };

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case 'milestone': return <Star className="h-6 w-6" />;
      case 'skill': return <TrendingUp className="h-6 w-6" />;
      case 'opportunity': return <Award className="h-6 w-6" />;
      case 'goal': return <Target className="h-6 w-6" />;
      case 'streak': return <Calendar className="h-6 w-6" />;
      case 'assessment': return <CheckCircle className="h-6 w-6" />;
      case 'ai': return <Users className="h-6 w-6" />;
      case 'roadmap': return <BookOpen className="h-6 w-6" />;
      default: return <CheckCircle className="h-6 w-6" />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'learning': return <TrendingUp className="h-4 w-4" />;
      case 'opportunity': return <Award className="h-4 w-4" />;
      case 'goal': return <Target className="h-4 w-4" />;
      case 'profile': return <Star className="h-4 w-4" />;
      case 'assessment': return <CheckCircle className="h-4 w-4" />;
      case 'ai': return <Users className="h-4 w-4" />;
      case 'roadmap': return <BookOpen className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to view your progress</h1>
          <button
            onClick={() => window.location.href = '/login'}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-full font-semibold"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-8">
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-lg border border-white/20 hover:shadow-xl transition-all"
            >
              <ArrowLeft className="h-6 w-6 text-gray-700" />
            </button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Your Progress
              </h1>
              <p className="text-gray-600">Track your career development journey</p>
            </div>
          </div>

          {/* Stats Overview */}
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

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Skill Progress */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Skill Development</h2>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-2 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : skillProgress.length > 0 ? (
                <div className="space-y-4">
                  {skillProgress.map((skill, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-900">{skill.name}</span>
                        <span className="text-sm text-gray-600">{skill.level}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${skill.level}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-gray-500">{skill.category}</p>
                        <p className="text-xs text-gray-400">
                          Updated {new Date(skill.lastUpdated).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No skills tracked yet</p>
                  <p className="text-gray-400 text-sm mt-2">Complete assessments and roadmaps to track your skills</p>
                </div>
              )}
            </div>

            {/* Achievements */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Achievements</h2>
              <div className="space-y-4">
                {achievements.map((achievement, index) => (
                  <div key={index} className={`flex items-center space-x-4 p-3 rounded-lg ${
                    achievement.earned ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                  }`}>
                    <div className={`p-2 rounded-full ${
                      achievement.earned ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'
                    }`}>
                      {achievement.earned ? (
                        getAchievementIcon(achievement.type)
                      ) : (
                        <Clock className="h-6 w-6" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${
                        achievement.earned ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {achievement.title}
                      </h3>
                      <p className={`text-sm ${
                        achievement.earned ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        {achievement.description}
                      </p>
                      {achievement.earned && achievement.earnedAt && (
                        <p className="text-xs text-green-600 mt-1">
                          Earned {new Date(achievement.earnedAt).toLocaleDateString()}
                        </p>
                      )}
                      {!achievement.earned && (
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div
                              className="bg-purple-500 h-1 rounded-full"
                              style={{ width: `${(achievement.currentProgress / achievement.requirement) * 100}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {achievement.currentProgress} / {achievement.requirement}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
            
            {recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-2 rounded-full text-white">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-600">{new Date(activity.timestamp).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-purple-600">+{activity.points} pts</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No recent activity</p>
                <p className="text-gray-400 text-sm mt-2">Start using FuturePath to see your activity here</p>
              </div>
            )}
          </div>

          {/* Back Button */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="border border-gray-300 text-gray-700 px-8 py-3 rounded-full font-semibold hover:border-purple-300 hover:text-purple-600 transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}