import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://xsrilpwdbqwhqsgsjjxh.supabase.co";

const supabaseKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable_Eq6NXbT-vIj-msgvAE9ZUw_h-LXyfGi";

export const supabase = createClient(supabaseUrl, supabaseKey);

export const isSupabaseReady = Boolean(supabaseUrl && supabaseKey);
