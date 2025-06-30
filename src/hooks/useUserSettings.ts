import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';

interface UserSettings {
  theme: 'default' | 'dark' | 'light';
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyReports: boolean;
  autoSave: boolean;
  publicProfile: boolean;
  language: string;
  timezone: string;
}

export function useUserSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'default',
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: false,
    autoSave: true,
    publicProfile: false,
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSettings({
        theme: 'default',
        emailNotifications: true,
        pushNotifications: true,
        weeklyReports: false,
        autoSave: true,
        publicProfile: false,
        language: 'en',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
      });
      setLoading(false);
      return;
    }

    // Try to load from localStorage first for immediate display
    const loadFromLocalStorage = () => {
      try {
        const savedSettings = localStorage.getItem(`futurepath-settings-${user.id}`);
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          setSettings(parsedSettings);
          applyTheme(parsedSettings.theme);
        }
      } catch (error) {
        console.error('Error loading settings from localStorage:', error);
      }
    };

    // Load from localStorage first
    loadFromLocalStorage();
    
    // Then load from Supabase
    loadUserSettings();
  }, [user]);

  const loadUserSettings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Try to load from Supabase
      const { data: userSettings, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading user settings:', error);
        await createInitialSettings();
        return;
      }

      if (userSettings) {
        const loadedSettings = {
          ...userSettings.settings,
          timezone: userSettings.settings.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
        };
        setSettings(loadedSettings);
        applyTheme(loadedSettings.theme);
        
        // Save to localStorage for faster loading next time
        localStorage.setItem(`futurepath-settings-${user.id}`, JSON.stringify(loadedSettings));
      } else {
        await createInitialSettings();
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
      await createInitialSettings();
    } finally {
      setLoading(false);
    }
  };

  const createInitialSettings = async () => {
    if (!user) return;

    const defaultSettings = {
      theme: 'default' as const,
      emailNotifications: true,
      pushNotifications: true,
      weeklyReports: false,
      autoSave: true,
      publicProfile: false,
      language: 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
    };

    // Set local state immediately
    setSettings(defaultSettings);
    applyTheme(defaultSettings.theme);
    
    // Save to localStorage
    localStorage.setItem(`futurepath-settings-${user.id}`, JSON.stringify(defaultSettings));

    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          settings: defaultSettings,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error creating initial settings:', error);
      }
    } catch (error) {
      console.error('Error creating initial settings:', error);
    }
  };

  const saveToSupabase = async (newSettings: UserSettings) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          settings: newSettings,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error saving settings to Supabase:', error);
      }
    } catch (error) {
      console.error('Error saving settings to Supabase:', error);
    }
  };

  const saveToLocalStorage = (newSettings: UserSettings) => {
    if (user) {
      localStorage.setItem(`futurepath-settings-${user.id}`, JSON.stringify(newSettings));
    }
  };

  const updateSettings = async (updates: Partial<UserSettings>) => {
    const newSettings = { ...settings, ...updates };
    
    setSettings(newSettings);

    // Save to localStorage immediately for instant feedback
    saveToLocalStorage(newSettings);

    // Apply theme changes immediately
    if (updates.theme) {
      applyTheme(updates.theme);
    }

    // Save to Supabase in the background
    setTimeout(() => {
      saveToSupabase(newSettings);
    }, 0);
  };

  const applyTheme = (theme: string) => {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('theme-default', 'theme-dark', 'theme-light');
    
    // Apply new theme
    root.classList.add(`theme-${theme}`);
    
    // Update CSS variables based on theme
    switch (theme) {
      case 'dark':
        root.style.setProperty('--bg-primary', '#1a1a1a');
        root.style.setProperty('--bg-secondary', '#2d2d2d');
        root.style.setProperty('--text-primary', '#ffffff');
        root.style.setProperty('--text-secondary', '#a0a0a0');
        root.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.1)');
        break;
      case 'light':
        root.style.setProperty('--bg-primary', '#ffffff');
        root.style.setProperty('--bg-secondary', '#f8f9fa');
        root.style.setProperty('--text-primary', '#000000');
        root.style.setProperty('--text-secondary', '#6b7280');
        root.style.setProperty('--border-color', 'rgba(0, 0, 0, 0.1)');
        break;
      default: // default theme
        root.style.setProperty('--bg-primary', '');
        root.style.setProperty('--bg-secondary', '');
        root.style.setProperty('--text-primary', '');
        root.style.setProperty('--text-secondary', '');
        root.style.setProperty('--border-color', '');
        break;
    }
  };

  return {
    settings,
    loading,
    updateSettings
  };
}