export type UserRole = 'admin' | 'member';
export type PostStatus = 'pending' | 'approved' | 'rejected' | 'flagged';
export type WaitlistStatus = 'pending' | 'approved' | 'rejected';

export interface Profile {
  id: string; // References auth.users.id
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
}

export interface WaitlistEntry {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  status: WaitlistStatus;
  created_at: string;
}

export interface Post {
  id: string;
  author_id: string; // References profiles.id
  title: string;
  content: string;
  category: string;
  image_url: string | null;
  status: PostStatus;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

// Helper types for Database Insert DTOs
export interface ProfileInsert {
  id: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
  role?: UserRole;
  created_at?: string;
}

export interface WaitlistEntryInsert {
  id?: string;
  email: string;
  full_name?: string | null;
  phone?: string | null;
  status?: WaitlistStatus;
  created_at?: string;
}

export interface PostInsert {
  id?: string;
  author_id: string;
  title: string;
  content: string;
  category: string;
  image_url?: string | null;
  status?: PostStatus;
  rejection_reason?: string | null;
  created_at?: string;
  updated_at?: string;
}

// Helper types for Database Update DTOs
export interface ProfileUpdate {
  email?: string;
  full_name?: string | null;
  avatar_url?: string | null;
  role?: UserRole;
  created_at?: string;
}

export interface WaitlistEntryUpdate {
  email?: string;
  full_name?: string | null;
  phone?: string | null;
  status?: WaitlistStatus;
  created_at?: string;
}

export interface PostUpdate {
  author_id?: string;
  title?: string;
  content?: string;
  category?: string;
  image_url?: string | null;
  status?: PostStatus;
  rejection_reason?: string | null;
  created_at?: string;
  updated_at?: string;
}

// Supabase Database Schema representation
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      waitlist: {
        Row: WaitlistEntry;
        Insert: WaitlistEntryInsert;
        Update: WaitlistEntryUpdate;
      };
      posts: {
        Row: Post;
        Insert: PostInsert;
        Update: PostUpdate;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: UserRole;
      post_status: PostStatus;
      waitlist_status: WaitlistStatus;
    };
  };
}
