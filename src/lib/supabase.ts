import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      lists: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
      };
      items: {
        Row: {
          id: string;
          list_id: string;
          text: string;
          completed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          list_id: string;
          text: string;
          completed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          list_id?: string;
          text?: string;
          completed?: boolean;
          created_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          list_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          list_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          list_id?: string;
          content?: string;
          created_at?: string;
        };
      };
    };
  };
};
