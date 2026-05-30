import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://xsrilpwdbqwhqsgsjjxh.supabase.co";

const supabaseKey =
  "sb_publishable_Eq6NXbT-vIj-msgvAE9ZUw_h-LXyfGi";

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);
update supabase config
