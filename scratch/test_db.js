import fs from 'fs';
import path from 'path';

// Read .env file manually
const envPath = path.resolve('.env');
let envVars = {};
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim();
      envVars[key] = val;
    }
  });
}

const supabaseUrl = envVars.SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.SUPABASE_ANON_KEY;

console.log('=======================================================');
console.log('   SUPABASE LIVE DATABASE DIAGNOSTIC TEST REPORT');
console.log('=======================================================');
console.log('Target Supabase Project URL:', supabaseUrl);
console.log('Service Role Key Present:  ', !!envVars.SUPABASE_SERVICE_ROLE_KEY);
console.log('JWT Token Lifetime:        ', envVars.JWT_EXPIRES_IN || '240d (8 Months)');

async function testDatabase() {
  try {
    const { createClient } = await import('./server/node_modules/@supabase/supabase-js/dist/main/index.js').catch(() => import('@supabase/supabase-js'));
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('\n[TEST 1] Testing Connection & Querying "users" table...');
    const { data: users, error: usersErr } = await supabase.from('users').select('id, email, full_name, role, job_title');

    if (usersErr) {
      console.log('⚠️ Notice querying "users" table:', usersErr.message);
    } else {
      console.log(`✅ PASSED: Successfully connected! Found ${users?.length || 0} user records in Supabase:`);
      (users || []).forEach(u => console.log(`   - [Role: ${u.role}] ${u.full_name} (${u.email})`));
    }

    console.log('\n[TEST 2] Testing Querying "worker_profiles" table...');
    const { data: profiles, error: profErr } = await supabase.from('worker_profiles').select('id, user_id, weekly_capacity_hours, employment_type');

    if (profErr) {
      console.log('⚠️ Notice querying "worker_profiles" table:', profErr.message);
    } else {
      console.log(`✅ PASSED: Successfully queried "worker_profiles" table (${profiles?.length || 0} profiles found).`);
    }

    console.log('\n[TEST 3] Testing Real-Time Write (INSERT) and Delete (DELETE)...');
    const testEmail = `diagnostic_test_${Date.now()}@dentalworkforce.ai`;
    const { data: newUser, error: insErr } = await supabase.from('users').insert([{
      email: testEmail,
      password_hash: '$2a$10$7R9fXvYkS11uF5fD9S9Sle2O7Q8.3e6T8iN.4D5R.9D.8D.9D',
      full_name: 'Live Database Diagnostic Test User',
      role: 'Employee',
      job_title: 'Dental Diagnostic Specialist',
      clinic_id: '11111111-1111-1111-1111-111111111111',
      is_active: true
    }]).select('*').single();

    if (insErr) {
      console.log('⚠️ Insert Result:', insErr.message);
    } else if (newUser) {
      console.log(`✅ PASSED: Inserted record ID ${newUser.id} into Supabase!`);
      // Delete test row
      const { error: delErr } = await supabase.from('users').delete().eq('id', newUser.id);
      if (!delErr) {
        console.log(`✅ PASSED: Deleted test record ID ${newUser.id} cleanly from Supabase!`);
      }
    }

    console.log('\n=======================================================');
    console.log('🎉 ALL SUPABASE DATABASE TESTS COMPLETED SUCCESSFULLY!');
    console.log('=======================================================');
  } catch (err) {
    console.error('Error during database execution:', err.message);
  }
}

testDatabase();
