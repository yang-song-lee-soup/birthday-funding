/**
 * Supabase `public` schema types.
 *
 * Regenerate after linking a project:
 *   npx supabase gen types typescript --linked > lib/supabase/database.types.ts
 */

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
      funding: {
        Row: {
          id: number;
          product_id: number | null;
          user_id: string | null;
          description: string | null;
          category: string | null;
          price: number | null;
          discount_percentage: number | null;
          rating: number | null;
          brand: string | null;
          images: string[] | null;
          thumbnail: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          product_id?: number | null;
          user_id?: string | null;
          description?: string | null;
          category?: string | null;
          price?: number | null;
          discount_percentage?: number | null;
          rating?: number | null;
          brand?: string | null;
          images?: string[] | null;
          thumbnail?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          product_id?: number | null;
          user_id?: string | null;
          description?: string | null;
          category?: string | null;
          price?: number | null;
          discount_percentage?: number | null;
          rating?: number | null;
          brand?: string | null;
          images?: string[] | null;
          thumbnail?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
