import { createClient } from "@supabase/supabase-js";
console.log("KEY:", process.env.SUPABASE_KEY ? "here" : "undefined");
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
);
