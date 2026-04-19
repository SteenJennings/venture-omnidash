export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      clips: {
        Row: {
          id: string;
          user_id: string;
          url: string | null;
          note: string;
          source_type: "tweet" | "article" | "conversation" | "thought";
          tags: string[] | null;
          company_id: string | null;
          founder_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          url?: string | null;
          note: string;
          source_type: "tweet" | "article" | "conversation" | "thought";
          tags?: string[] | null;
          company_id?: string | null;
          founder_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          url?: string | null;
          note?: string;
          source_type?: "tweet" | "article" | "conversation" | "thought";
          tags?: string[] | null;
          company_id?: string | null;
          founder_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      companies: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          sector: string | null;
          stage: string | null;
          /** watching | tracking | active | meeting | diligence | passed | invested | portfolio */
          status: string | null;
          thesis: string | null;
          key_unknowns: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          sector?: string | null;
          stage?: string | null;
          status?: string | null;
          thesis?: string | null;
          key_unknowns?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          sector?: string | null;
          stage?: string | null;
          status?: string | null;
          thesis?: string | null;
          key_unknowns?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      founders: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          twitter: string | null;
          linkedin: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          twitter?: string | null;
          linkedin?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          twitter?: string | null;
          linkedin?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      theses: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          /** numeric 0-100, null means unset */
          confidence: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          confidence?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          confidence?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      thesis_clips: {
        Row: {
          thesis_id: string;
          clip_id: string;
        };
        Insert: {
          thesis_id: string;
          clip_id: string;
        };
        Update: {
          thesis_id?: string;
          clip_id?: string;
        };
        Relationships: [];
      };
      thesis_companies: {
        Row: {
          thesis_id: string;
          company_id: string;
        };
        Insert: {
          thesis_id: string;
          company_id: string;
        };
        Update: {
          thesis_id?: string;
          company_id?: string;
        };
        Relationships: [];
      };
      deals: {
        Row: {
          id: string;
          user_id: string;
          company_id: string;
          /** sourced | meeting | diligence | passed | invested */
          stage: string | null;
          next_action: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          company_id: string;
          stage?: string | null;
          next_action?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          company_id?: string;
          stage?: string | null;
          next_action?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      journal_entries: {
        Row: {
          id: string;
          user_id: string;
          /** outreach | meeting | event | learning | milestone | note */
          entry_type: string;
          title: string;
          entry_date: string;
          notes: string | null;
          contact_name: string | null;
          contact_company: string | null;
          outcome: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          entry_type: string;
          title: string;
          entry_date: string;
          notes?: string | null;
          contact_name?: string | null;
          contact_company?: string | null;
          outcome?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          entry_type?: string;
          title?: string;
          entry_date?: string;
          notes?: string | null;
          contact_name?: string | null;
          contact_company?: string | null;
          outcome?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// Convenience row types
export type Clip = Database["public"]["Tables"]["clips"]["Row"];
export type Company = Database["public"]["Tables"]["companies"]["Row"];
export type Founder = Database["public"]["Tables"]["founders"]["Row"];
export type Thesis = Database["public"]["Tables"]["theses"]["Row"];
export type Deal = Database["public"]["Tables"]["deals"]["Row"];
export type JournalEntry = Database["public"]["Tables"]["journal_entries"]["Row"];
