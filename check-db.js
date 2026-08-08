/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDb() {
  console.log("Checking Branches...");
  const { data: branches, error: err1 } = await supabase.from('branches').select('*');
  console.log("Branches Data:", branches);
  if (err1) console.error("Branches Error:", err1);

  console.log("\nChecking Services...");
  const { data: services, error: err2 } = await supabase.from('services').select('*');
  console.log("Services Data:", services);
  if (err2) console.error("Services Error:", err2);

  console.log("\nChecking Barbers...");
  const { data: barbers, error: err3 } = await supabase.from('barbers').select('*');
  console.log("Barbers Data:", barbers);
  if (err3) console.error("Barbers Error:", err3);
}

checkDb();
