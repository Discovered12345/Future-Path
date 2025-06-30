import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing');
}

// Validate that the environment variables are not placeholder values
if (supabaseUrl?.includes('your-project-id') || supabaseAnonKey?.includes('your_supabase_anon_key')) {
  console.error('⚠️  Supabase environment variables contain placeholder values. Please update your .env file with actual values from your Supabase project.');
  console.error('1. Go to your Supabase project dashboard');
  console.error('2. Navigate to Settings > API');
  console.error('3. Copy your Project URL and anon/public key');
  console.error('4. Update the .env file with these values');
  console.error('5. Restart your development server');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'futurepath_auth_token',
    flowType: 'pkce',
    debug: false // Set to true for debugging auth issues
  },
  global: {
    headers: {
      'X-Client-Info': 'futurepath-web'
    }
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Add some debugging for development
if (import.meta.env.DEV) {
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('🔐 Auth state changed:', event, session?.user?.id);
  });
}

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          stats: any;
          achievements: any;
          recent_activities: any;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          profile_data: any;
        };
        Insert: {
          user_id: string;
          stats?: any;
          achievements?: any;
          recent_activities?: any;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          profile_data?: any;
        };
        Update: {
          user_id?: string;
          stats?: any;
          achievements?: any;
          recent_activities?: any;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          profile_data?: any;
        };
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          settings: any;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          user_id: string;
          settings?: any;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          user_id?: string;
          settings?: any;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      user_notes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          category: string;
          tags: any;
          is_favorite: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          user_id: string;
          title?: string;
          content?: string;
          category?: string;
          tags?: any;
          is_favorite?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          user_id?: string;
          title?: string;
          content?: string;
          category?: string;
          tags?: any;
          is_favorite?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      user_assessments: {
        Row: {
          id: string;
          user_id: string;
          assessment_name: string;
          assessment_type: string;
          questions: any;
          answers: any;
          results: any;
          score: number;
          completed_at: string;
          created_at: string;
          deleted_at: string | null;
        };
        Insert: {
          user_id: string;
          assessment_name: string;
          assessment_type?: string;
          questions?: any;
          answers?: any;
          results?: any;
          score?: number;
          completed_at?: string;
          created_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          user_id?: string;
          assessment_name?: string;
          assessment_type?: string;
          questions?: any;
          answers?: any;
          results?: any;
          score?: number;
          completed_at?: string;
          created_at?: string;
          deleted_at?: string | null;
        };
      };
      user_roadmaps: {
        Row: {
          id: string;
          user_id: string;
          roadmap_name: string;
          career_track: string;
          steps: any;
          progress_percentage: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          user_id: string;
          roadmap_name: string;
          career_track: string;
          steps?: any;
          progress_percentage?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          user_id?: string;
          roadmap_name?: string;
          career_track?: string;
          steps?: any;
          progress_percentage?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      user_opportunities: {
        Row: {
          id: string;
          user_id: string;
          opportunity_title: string;
          opportunity_type: string;
          description: string;
          amount: string;
          deadline: string | null;
          location: string;
          requirements: any;
          skills: any;
          application_status: string;
          application_date: string | null;
          notes: string;
          external_url: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          user_id: string;
          opportunity_title: string;
          opportunity_type: string;
          description?: string;
          amount?: string;
          deadline?: string | null;
          location?: string;
          requirements?: any;
          skills?: any;
          application_status?: string;
          application_date?: string | null;
          notes?: string;
          external_url?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          user_id?: string;
          opportunity_title?: string;
          opportunity_type?: string;
          description?: string;
          amount?: string;
          deadline?: string | null;
          location?: string;
          requirements?: any;
          skills?: any;
          application_status?: string;
          application_date?: string | null;
          notes?: string;
          external_url?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      user_ai_chats: {
        Row: {
          id: string;
          user_id: string;
          chat_title: string;
          messages: any;
          message_count: number;
          last_message_at: string;
          is_archived: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          user_id: string;
          chat_title?: string;
          messages?: any;
          message_count?: number;
          last_message_at?: string;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          user_id?: string;
          chat_title?: string;
          messages?: any;
          message_count?: number;
          last_message_at?: string;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      user_academic_profiles: {
        Row: {
          id: string;
          user_id: string;
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
          work_experience: any[];
          leadership_roles: any[];
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          user_id: string;
          gpa?: number;
          sat_score?: number;
          act_score?: number;
          class_rank?: number;
          class_size?: number;
          intended_major?: string;
          extracurriculars?: string[];
          achievements?: string[];
          ap_courses?: string[];
          honors_courses?: string[];
          volunteer_hours?: number;
          work_experience?: any[];
          leadership_roles?: any[];
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          user_id?: string;
          gpa?: number;
          sat_score?: number;
          act_score?: number;
          class_rank?: number;
          class_size?: number;
          intended_major?: string;
          extracurriculars?: string[];
          achievements?: string[];
          ap_courses?: string[];
          honors_courses?: string[];
          volunteer_hours?: number;
          work_experience?: any[];
          leadership_roles?: any[];
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      saved_colleges: {
        Row: {
          id: string;
          user_id: string;
          college_id: number;
          college_name: string;
          notes: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          user_id: string;
          college_id: number;
          college_name: string;
          notes?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          user_id?: string;
          college_id?: number;
          college_name?: string;
          notes?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
    };
  };
};