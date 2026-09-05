export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      competencies: {
        Row: {
          id: string;
          name: string;
          category: string;
          icon_key: string | null;
          proficiency_level: string | null;
          featured: boolean | null;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          icon_key?: string | null;
          proficiency_level?: string | null;
          featured?: boolean | null;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          icon_key?: string | null;
          proficiency_level?: string | null;
          featured?: boolean | null;
        };
        Relationships: [];
      };
      case_studies: {
        Row: {
          id: string;
          title: string;
          slug: string;
          client_industry: string | null;
          challenge: string;
          solution: string;
          metrics_achieved: Json | null;
          tech_stack: string[] | null;
          live_url: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          client_industry?: string | null;
          challenge: string;
          solution: string;
          metrics_achieved?: Json | null;
          tech_stack?: string[] | null;
          live_url?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          client_industry?: string | null;
          challenge?: string;
          solution?: string;
          metrics_achieved?: Json | null;
          tech_stack?: string[] | null;
          live_url?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      leads: {
        Row: {
          id: string;
          created_at: string | null;
          full_name: string;
          company: string | null;
          email: string;
          project_type: string | null;
          budget_range: string | null;
          estimated_timeline: string | null;
          details: string | null;
          status: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string | null;
          full_name: string;
          company?: string | null;
          email: string;
          project_type?: string | null;
          budget_range?: string | null;
          estimated_timeline?: string | null;
          details?: string | null;
          status?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string | null;
          full_name?: string;
          company?: string | null;
          email?: string;
          project_type?: string | null;
          budget_range?: string | null;
          estimated_timeline?: string | null;
          details?: string | null;
          status?: string | null;
        };
        Relationships: [];
      };
      proposals: {
        Row: {
          id: string;
          access_token: string | null;
          lead_id: string | null;
          client_name: string;
          title: string;
          scope_breakdown: Json;
          total_estimate: number | null;
          expires_at: string | null;
          view_count: number | null;
          status: string | null;
        };
        Insert: {
          id?: string;
          access_token?: string | null;
          lead_id?: string | null;
          client_name: string;
          title: string;
          scope_breakdown: Json;
          total_estimate?: number | null;
          expires_at?: string | null;
          view_count?: number | null;
          status?: string | null;
        };
        Update: {
          id?: string;
          access_token?: string | null;
          lead_id?: string | null;
          client_name?: string;
          title?: string;
          scope_breakdown?: Json;
          total_estimate?: number | null;
          expires_at?: string | null;
          view_count?: number | null;
          status?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          professional_title: string | null;
          bio: string | null;
          avatar_url: string | null;
          created_at: string | null;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          professional_title?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          professional_title?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          tech_stack: string[] | null;
          live_url: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description: string;
          tech_stack?: string[] | null;
          live_url?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          tech_stack?: string[] | null;
          live_url?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

/* ==========================================================================
   Convenience Helper Types
   ========================================================================== */

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

export type Competency = Tables<'competencies'>;
export type CompetencyInsert = TablesInsert<'competencies'>;
export type CompetencyUpdate = TablesUpdate<'competencies'>;

export type CaseStudy = Tables<'case_studies'>;
export type CaseStudyInsert = TablesInsert<'case_studies'>;
export type CaseStudyUpdate = TablesUpdate<'case_studies'>;

export type Lead = Tables<'leads'>;
export type LeadInsert = TablesInsert<'leads'>;
export type LeadUpdate = TablesUpdate<'leads'>;

export type Proposal = Tables<'proposals'>;
export type ProposalInsert = TablesInsert<'proposals'>;
export type ProposalUpdate = TablesUpdate<'proposals'>;

export type Profile = Tables<'profiles'>;
export type ProfileInsert = TablesInsert<'profiles'>;
export type ProfileUpdate = TablesUpdate<'profiles'>;

export type Project = Tables<'projects'>;
export type ProjectInsert = TablesInsert<'projects'>;
export type ProjectUpdate = TablesUpdate<'projects'>;
