import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: './frontend/.env' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function inspect() {
  console.log("Checking Supabase connection...");
  const { data, error } = await supabase.from('pneus').select('*').limit(1);
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Success! Row sample:", data);
  }
}

inspect();
