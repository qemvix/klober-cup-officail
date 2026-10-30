export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      cups: {
        Row: {
          created_at: string
          elo_reward: number
          gamemode: string
          id: string
          name: string
          slots: number
          starts_at: string
        }
        Insert: {
          created_at?: string
          elo_reward?: number
          gamemode?: string
          id?: string
          name: string
          slots?: number
          starts_at: string
        }
        Update: {
          created_at?: string
          elo_reward?: number
          gamemode?: string
          id?: string
          name?: string
          slots?: number
          starts_at?: string
        }
        Relationships: []
      }
      elo_match_events: {
        Row: {
          event_id: string
          gamemode: string
          killer_elo_awarded: number
          killer_name: string
          killer_player_id: string
          occurred_at: string
          processed_at: string
          server_id: string
          victim_consecutive_deaths: number
          victim_daily_death_number: number
          victim_elo_penalty: number
          victim_is_tier_listed: boolean
          victim_key: string
          victim_name: string
          victim_player_id: string | null
        }
        Insert: {
          event_id: string
          gamemode: string
          killer_elo_awarded?: number
          killer_name: string
          killer_player_id: string
          occurred_at: string
          processed_at?: string
          server_id: string
          victim_consecutive_deaths?: number
          victim_daily_death_number?: number
          victim_elo_penalty?: number
          victim_is_tier_listed: boolean
          victim_key: string
          victim_name: string
          victim_player_id?: string | null
        }
        Update: {
          event_id?: string
          gamemode?: string
          killer_elo_awarded?: number
          killer_name?: string
          killer_player_id?: string
          occurred_at?: string
          processed_at?: string
          server_id?: string
          victim_consecutive_deaths?: number
          victim_daily_death_number?: number
          victim_elo_penalty?: number
          victim_is_tier_listed?: boolean
          victim_key?: string
          victim_name?: string
          victim_player_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "elo_match_events_killer_player_id_fkey"
            columns: ["killer_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "elo_match_events_victim_player_id_fkey"
            columns: ["victim_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      elo_player_state: {
        Row: {
          consecutive_deaths: number
          player_key: string
          updated_at: string
        }
        Insert: {
          consecutive_deaths?: number
          player_key: string
          updated_at?: string
        }
        Update: {
          consecutive_deaths?: number
          player_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          channel: string
          created_at: string
          description: string
          id: string
          image: string
          invite: string
          server: string
          starts_at: string
          title: string
        }
        Insert: {
          channel: string
          created_at?: string
          description?: string
          id?: string
          image?: string
          invite?: string
          server: string
          starts_at: string
          title: string
        }
        Update: {
          channel?: string
          created_at?: string
          description?: string
          id?: string
          image?: string
          invite?: string
          server?: string
          starts_at?: string
          title?: string
        }
        Relationships: []
      }
      mod_files: {
        Row: {
          created_at: string
          id: string
          label: string
          mc_version: string
          name: string
          path: string
          size: number
        }
        Insert: {
          created_at?: string
          id?: string
          label?: string
          mc_version?: string
          name: string
          path: string
          size?: number
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          mc_version?: string
          name?: string
          path?: string
          size?: number
        }
        Relationships: []
      }
      players: {
        Row: {
          created_at: string
          elo: Json
          id: string
          losses: number
          name: string
          region: string
          skin: string | null
          tier_override: string | null
          wins: number
        }
        Insert: {
          created_at?: string
          elo?: Json
          id?: string
          losses?: number
          name: string
          region?: string
          skin?: string | null
          tier_override?: string | null
          wins?: number
        }
        Update: {
          created_at?: string
          elo?: Json
          id?: string
          losses?: number
          name?: string
          region?: string
          skin?: string | null
          tier_override?: string | null
          wins?: number
        }
        Relationships: []
      }
      site_content: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      record_elo_kill: {
        Args: {
          p_event_id: string
          p_gamemode: string
          p_killer_name: string
          p_occurred_at: string
          p_server_id: string
          p_victim_name: string
        }
        Returns: Json
      }
      record_elo_kill_with_token: {
        Args: {
          p_event_id: string
          p_gamemode: string
          p_ingest_token: string
          p_killer_name: string
          p_occurred_at: string
          p_server_id: string
          p_victim_name: string
        }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
