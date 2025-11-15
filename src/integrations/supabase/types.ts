export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          avatar_url: string | null
          preferred_language: string
          theme_preference: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          avatar_url?: string | null
          preferred_language?: string
          theme_preference?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          avatar_url?: string | null
          preferred_language?: string
          theme_preference?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      files: {
        Row: {
          id: string
          project_id: string
          name: string
          path: string
          content: string | null
          language: string
          is_directory: boolean
          parent_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          path: string
          content?: string | null
          language?: string
          is_directory?: boolean
          parent_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          path?: string
          content?: string | null
          language?: string
          is_directory?: boolean
          parent_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "files_parent_id_fkey"
            columns: ["parent_id"]
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "files_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
      ai_conversations: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          title: string
          context: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id?: string | null
          title: string
          context?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string | null
          title?: string
          context?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversations_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_conversations_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      ai_messages: {
        Row: {
          id: string
          conversation_id: string
          role: string
          content: string
          code_snippets: Json | null
          tokens_used: number
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          role: string
          content: string
          code_snippets?: Json | null
          tokens_used?: number
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          role?: string
          content?: string
          code_snippets?: Json | null
          tokens_used?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          }
        ]
      }
      code_executions: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          file_id: string | null
          code: string
          language: string
          output: string | null
          error: string | null
          execution_time: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id?: string | null
          file_id?: string | null
          code: string
          language: string
          output?: string | null
          error?: string | null
          execution_time?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string | null
          file_id?: string | null
          code?: string
          language?: string
          output?: string | null
          error?: string | null
          execution_time?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "code_executions_file_id_fkey"
            columns: ["file_id"]
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "code_executions_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "code_executions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          editor_font_size: number
          editor_theme: string
          auto_save: boolean
          line_numbers: boolean
          word_wrap: boolean
          ai_model_preference: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          editor_font_size?: number
          editor_theme?: string
          auto_save?: boolean
          line_numbers?: boolean
          word_wrap?: boolean
          ai_model_preference?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          editor_font_size?: number
          editor_theme?: string
          auto_save?: boolean
          line_numbers?: boolean
          word_wrap?: boolean
          ai_model_preference?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
