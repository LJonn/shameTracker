import { createClient } from "@supabase/supabase-js";
const SUPABASE_URL = import.meta.env.PUBLIC_PROJECT_URL;
const SUPABASE_API = import.meta.env.PUBLIC_SUPABASE_ANON;
const supabase = createClient(SUPABASE_URL, SUPABASE_API);
if (supabase) {
    console.log("supabase client loaded");
}
else {
    throw new Error("supabase client failed to load");
}
export default supabase;