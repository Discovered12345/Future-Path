import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';

export interface AcademicProfile {
  id?: string;
  user_id?: string;
  gpa: number;
  sat_score: number;
  act_score: number;
  class_rank: number;
  class_size: number;
  intended_major: string;
  extracurriculars: string[];
  achievements: string[];
  ap_courses: string[];
  honors_courses: string[];
  volunteer_hours: number;
  work_experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  leadership_roles: Array<{
    title: string;
    organization: string;
    duration: string;
    description: string;
  }>;
  created_at?: string;
  updated_at?: string;
}

const defaultProfile: AcademicProfile = {
  gpa: 0.0,
  sat_score: 0,
  act_score: 0,
  class_rank: 0,
  class_size: 0,
  intended_major: '',
  extracurriculars: [],
  achievements: [],
  ap_courses: [],
  honors_courses: [],
  volunteer_hours: 0,
  work_experience: [],
  leadership_roles: []
};

export function useAcademicProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<AcademicProfile>(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadProfile();
    } else {
      setProfile(defaultProfile);
      setLoading(false);
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('user_academic_profiles')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading academic profile:', error);
        setError('Failed to load academic profile');
        return;
      }

      if (data) {
        setProfile({
          id: data.id,
          user_id: data.user_id,
          gpa: data.gpa || 0.0,
          sat_score: data.sat_score || 0,
          act_score: data.act_score || 0,
          class_rank: data.class_rank || 0,
          class_size: data.class_size || 0,
          intended_major: data.intended_major || '',
          extracurriculars: data.extracurriculars || [],
          achievements: data.achievements || [],
          ap_courses: data.ap_courses || [],
          honors_courses: data.honors_courses || [],
          volunteer_hours: data.volunteer_hours || 0,
          work_experience: data.work_experience || [],
          leadership_roles: data.leadership_roles || [],
          created_at: data.created_at,
          updated_at: data.updated_at
        });
      } else {
        // Create default profile
        await createProfile();
      }
    } catch (error) {
      console.error('Error loading academic profile:', error);
      setError('Failed to load academic profile');
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async () => {
    if (!user) return;

    try {
      setError(null);
      
      const { data, error } = await supabase
        .from('user_academic_profiles')
        .insert({
          user_id: user.id,
          ...defaultProfile
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating academic profile:', error);
        setError('Failed to create academic profile');
        return;
      }

      if (data) {
        setProfile({
          ...defaultProfile,
          id: data.id,
          user_id: data.user_id,
          created_at: data.created_at,
          updated_at: data.updated_at
        });
      }
    } catch (error) {
      console.error('Error creating academic profile:', error);
      setError('Failed to create academic profile');
    }
  };

  const saveProfile = async (updatedProfile: Partial<AcademicProfile>) => {
    if (!user) return false;

    try {
      setSaving(true);
      setError(null);
      
      const profileData = {
        ...profile,
        ...updatedProfile,
        user_id: user.id
      };

      // Remove non-database fields
      const { id, created_at, updated_at, ...dataToSave } = profileData;

      const { data, error } = await supabase
        .from('user_academic_profiles')
        .upsert({
          user_id: user.id,
          ...dataToSave,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving academic profile:', error);
        setError('Failed to save academic profile');
        return false;
      }

      if (data) {
        setProfile({
          ...profileData,
          id: data.id,
          created_at: data.created_at,
          updated_at: data.updated_at
        });
      }

      return true;
    } catch (error) {
      console.error('Error saving academic profile:', error);
      setError('Failed to save academic profile');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const updateProfile = (updates: Partial<AcademicProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const getProfileCompleteness = () => {
    let completedFields = 0;
    let totalFields = 0;

    // Academic stats (weighted more heavily)
    if (profile.gpa > 0) { completedFields += 2; totalFields += 2; }
    if (profile.sat_score > 0) { completedFields += 2; totalFields += 2; }
    else if (profile.act_score > 0) { completedFields += 2; totalFields += 2; }
    else { totalFields += 2; } // Count test scores as one field even if both are empty
    
    if (profile.intended_major) { completedFields += 1; totalFields += 1; }
    if (profile.class_rank > 0) { completedFields += 1; totalFields += 1; }
    if (profile.class_size > 0) { completedFields += 1; totalFields += 1; }

    // Course rigor
    if (profile.ap_courses.length > 0) { completedFields += 1; totalFields += 1; }
    if (profile.honors_courses.length > 0) { completedFields += 1; totalFields += 1; }

    // Activities and achievements
    if (profile.extracurriculars.length > 0) { completedFields += 1; totalFields += 1; }
    if (profile.achievements.length > 0) { completedFields += 1; totalFields += 1; }
    if (profile.volunteer_hours > 0) { completedFields += 1; totalFields += 1; }
    
    // Experience
    if (profile.work_experience.length > 0) { completedFields += 1; totalFields += 1; }
    if (profile.leadership_roles.length > 0) { completedFields += 1; totalFields += 1; }

    // Calculate percentage
    return Math.round((completedFields / totalFields) * 100);
  };

  return {
    profile,
    loading,
    saving,
    error,
    saveProfile,
    updateProfile,
    getProfileCompleteness,
    refreshProfile: loadProfile
  };
}