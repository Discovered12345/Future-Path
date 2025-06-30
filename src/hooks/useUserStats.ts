import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';

interface UserStats {
  skillsTracked: number;
  opportunitiesFound: number;
  daysActive: number;
  goalsCompleted: number;
  assessmentsTaken: number;
  roadmapsCreated: number;
  messagesWithAI: number;
  profileCompleteness: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  type: string;
  earned: boolean;
  earnedAt?: Date;
  requirement: number;
  currentProgress: number;
}

interface Activity {
  id: string;
  action: string;
  type: string;
  timestamp: Date;
  points: number;
}

export function useUserStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    skillsTracked: 0,
    opportunitiesFound: 0,
    daysActive: 1,
    goalsCompleted: 0,
    assessmentsTaken: 0,
    roadmapsCreated: 0,
    messagesWithAI: 0,
    profileCompleteness: 25
  });
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      resetStats();
      return;
    }

    // Try to load from localStorage first for immediate display
    const loadFromLocalStorage = () => {
      try {
        const savedStats = localStorage.getItem(`futurepath-stats-${user.id}`);
        const savedAchievements = localStorage.getItem(`futurepath-achievements-${user.id}`);
        const savedActivities = localStorage.getItem(`futurepath-activities-${user.id}`);
        
        if (savedStats) {
          setStats(JSON.parse(savedStats));
        }
        
        if (savedAchievements) {
          setAchievements(JSON.parse(savedAchievements).map((achievement: any) => ({
            ...achievement,
            earnedAt: achievement.earnedAt ? new Date(achievement.earnedAt) : undefined
          })));
        }
        
        if (savedActivities) {
          setRecentActivities(JSON.parse(savedActivities).map((activity: any) => ({
            ...activity,
            timestamp: new Date(activity.timestamp)
          })));
        }
      } catch (error) {
        console.error('Error loading from localStorage:', error);
      }
    };

    // Load from localStorage first for immediate display
    loadFromLocalStorage();
    
    // Then load from Supabase
    loadUserData();
  }, [user]);

  const resetStats = () => {
    setStats({
      skillsTracked: 0,
      opportunitiesFound: 0,
      daysActive: 1,
      goalsCompleted: 0,
      assessmentsTaken: 0,
      roadmapsCreated: 0,
      messagesWithAI: 0,
      profileCompleteness: 25
    });
    setAchievements([]);
    setRecentActivities([]);
    setLoading(false);
  };

  const loadUserData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Load from Supabase
      const { data: userData, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .maybeSingle();

      if (error) {
        console.error('Error loading user data:', error);
        
        // If there's an error, try to create initial profile
        if (error.code !== 'PGRST116') {
          await createInitialProfile();
        }
        return;
      }

      if (userData) {
        // Use Supabase data
        setStats(userData.stats || getInitialStats());
        setAchievements((userData.achievements || []).map((achievement: any) => ({
          ...achievement,
          earnedAt: achievement.earnedAt ? new Date(achievement.earnedAt) : undefined
        })));
        setRecentActivities((userData.recent_activities || []).map((activity: any) => ({
          ...activity,
          timestamp: new Date(activity.timestamp)
        })));
        
        // Save to localStorage for faster loading next time
        saveToLocalStorage(
          userData.stats || getInitialStats(),
          userData.achievements || [],
          userData.recent_activities || []
        );
      } else {
        await createInitialProfile();
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      await createInitialProfile();
    } finally {
      setLoading(false);
    }
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const createInitialProfile = async () => {
    if (!user) return;

    const initialStats = getInitialStats();
    const initialAchievements = getInitialAchievements();
    const initialActivities: Activity[] = [];

    // Set local state immediately
    setStats(initialStats);
    setAchievements(initialAchievements);
    setRecentActivities(initialActivities);
    
    // Save to localStorage
    saveToLocalStorage(initialStats, initialAchievements, initialActivities);

    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          stats: initialStats,
          achievements: initialAchievements,
          recent_activities: initialActivities,
          profile_data: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error creating initial profile:', error);
      }
    } catch (error) {
      console.error('Error creating initial profile:', error);
    }
  };

  const getInitialStats = (): UserStats => ({
    skillsTracked: 0,
    opportunitiesFound: 0,
    daysActive: 1, // First day active
    goalsCompleted: 0,
    assessmentsTaken: 0,
    roadmapsCreated: 0,
    messagesWithAI: 0,
    profileCompleteness: 25 // Basic profile setup
  });

  const getInitialAchievements = (): Achievement[] => [
    {
      id: 'first-login',
      title: 'Welcome to FuturePath!',
      description: 'Created your account and logged in',
      type: 'milestone',
      earned: true,
      earnedAt: new Date(),
      requirement: 1,
      currentProgress: 1
    },
    {
      id: 'first-assessment',
      title: 'Assessment Explorer',
      description: 'Complete your first career assessment',
      type: 'assessment',
      earned: false,
      requirement: 1,
      currentProgress: 0
    },
    {
      id: 'skill-tracker',
      title: 'Skill Tracker',
      description: 'Track 5 different skills',
      type: 'skill',
      earned: false,
      requirement: 5,
      currentProgress: 0
    },
    {
      id: 'opportunity-hunter',
      title: 'Opportunity Hunter',
      description: 'Find 10 opportunities',
      type: 'opportunity',
      earned: false,
      requirement: 10,
      currentProgress: 0
    },
    {
      id: 'goal-achiever',
      title: 'Goal Achiever',
      description: 'Complete 3 goals',
      type: 'goal',
      earned: false,
      requirement: 3,
      currentProgress: 0
    },
    {
      id: 'consistent-learner',
      title: 'Consistent Learner',
      description: 'Active for 7 days',
      type: 'streak',
      earned: false,
      requirement: 7,
      currentProgress: 1
    },
    {
      id: 'ai-conversationalist',
      title: 'AI Conversationalist',
      description: 'Send 20 messages to AI mentor',
      type: 'ai',
      earned: false,
      requirement: 20,
      currentProgress: 0
    }
  ];

  const saveToSupabase = async (newStats: UserStats, newAchievements: Achievement[], newActivities: Activity[]) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          stats: newStats,
          achievements: newAchievements,
          recent_activities: newActivities,
          updated_at: new Date().toISOString(),
          deleted_at: null
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error saving to Supabase:', error);
      }
    } catch (error) {
      console.error('Error saving to Supabase:', error);
    }
  };

  const saveToLocalStorage = (newStats: UserStats, newAchievements: Achievement[], newActivities: Activity[]) => {
    if (user) {
      localStorage.setItem(`futurepath-stats-${user.id}`, JSON.stringify(newStats));
      localStorage.setItem(`futurepath-achievements-${user.id}`, JSON.stringify(newAchievements));
      localStorage.setItem(`futurepath-activities-${user.id}`, JSON.stringify(newActivities));
    }
  };

  const addActivity = (action: string, type: string, points: number = 10) => {
    const newActivity: Activity = {
      id: Date.now().toString(),
      action,
      type,
      timestamp: new Date(),
      points
    };

    const updatedActivities = [newActivity, ...recentActivities].slice(0, 10); // Keep only last 10
    setRecentActivities(updatedActivities);
    
    return updatedActivities;
  };

  const checkAchievements = (newStats: UserStats, newAchievements: Achievement[]) => {
    let updatedAchievements = [...newAchievements];
    let hasNewAchievement = false;

    updatedAchievements = updatedAchievements.map(achievement => {
      if (achievement.earned) return achievement;

      let currentProgress = 0;
      let shouldEarn = false;

      switch (achievement.id) {
        case 'first-assessment':
          currentProgress = newStats.assessmentsTaken;
          shouldEarn = newStats.assessmentsTaken >= 1;
          break;
        case 'skill-tracker':
          currentProgress = newStats.skillsTracked;
          shouldEarn = newStats.skillsTracked >= 5;
          break;
        case 'opportunity-hunter':
          currentProgress = newStats.opportunitiesFound;
          shouldEarn = newStats.opportunitiesFound >= 10;
          break;
        case 'goal-achiever':
          currentProgress = newStats.goalsCompleted;
          shouldEarn = newStats.goalsCompleted >= 3;
          break;
        case 'consistent-learner':
          currentProgress = newStats.daysActive;
          shouldEarn = newStats.daysActive >= 7;
          break;
        case 'ai-conversationalist':
          currentProgress = newStats.messagesWithAI;
          shouldEarn = newStats.messagesWithAI >= 20;
          break;
      }

      if (shouldEarn && !achievement.earned) {
        hasNewAchievement = true;
        
        return {
          ...achievement,
          earned: true,
          earnedAt: new Date(),
          currentProgress
        };
      }

      return {
        ...achievement,
        currentProgress
      };
    });

    return { updatedAchievements, hasNewAchievement };
  };

  const updateStats = (updates: Partial<UserStats>, activityAction?: string, activityType?: string) => {
    const newStats = { ...stats, ...updates };
    let newActivities = recentActivities;

    if (activityAction && activityType) {
      newActivities = addActivity(activityAction, activityType);
    }

    const { updatedAchievements, hasNewAchievement } = checkAchievements(newStats, achievements);

    setStats(newStats);
    setAchievements(updatedAchievements);
    setRecentActivities(newActivities);

    // Save to both localStorage and Supabase
    saveToLocalStorage(newStats, updatedAchievements, newActivities);
    
    // Save to Supabase in the background
    setTimeout(() => {
      saveToSupabase(newStats, updatedAchievements, newActivities);
    }, 0);
    
    // Show achievement notification if there's a new one
    if (hasNewAchievement) {
      const newAchievement = updatedAchievements.find(a => a.earned && !achievements.find(old => old.id === a.id && old.earned));
      if (newAchievement) {
        setTimeout(() => {
          alert(`🏆 Achievement Unlocked!\n\n${newAchievement.title}\n\n${newAchievement.description}\n\nCongratulations on reaching this milestone!`);
        }, 500);
      }
    }
  };

  const incrementStat = (statName: keyof UserStats, amount: number = 1, activityAction?: string, activityType?: string) => {
    const updates = {
      [statName]: stats[statName] + amount
    };
    updateStats(updates, activityAction, activityType);
  };

  return {
    stats,
    achievements,
    recentActivities,
    loading,
    updateStats,
    incrementStat,
    addActivity
  };
}