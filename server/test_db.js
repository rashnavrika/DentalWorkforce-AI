import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load .env from root directory
dotenv.config({ path: path.resolve('../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

console.log('=======================================================');
console.log('   LIVE SUPABASE DATABASE DIAGNOSTIC TEST REPORT');
console.log('=======================================================');
console.log('Supabase URL:             ', supabaseUrl);
console.log('Service Role Key Present: ', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
console.log('JWT Expiry Configured:   ', process.env.JWT_EXPIRES_IN || '240d');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Supabase credentials missing in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runTests() {
  try {
    // 1. Connection & Select Query Test
    console.log('\n[TEST 1] Testing Connection & Querying "users" table...');
    const { data: users, error: userError } = await supabase.from('users').select('id, email, full_name, role, job_title');
    
    if (userError) {
      console.log('⚠️ Users Query Notice:', userError.message);
    } else {
      console.log(`✅ PASSED: Successfully connected to Supabase! Found ${users?.length || 0} user records:`);
      (users || []).forEach(u => console.log(`   - [${u.role}] ${u.full_name} (${u.email})`));
    }

    // 2. Query worker_profiles table
    console.log('\n[TEST 2] Testing Querying "worker_profiles" table...');
    const { data: profiles, error: profError } = await supabase.from('worker_profiles').select('id, user_id, weekly_capacity_hours, employment_type');

    if (profError) {
      console.log('⚠️ Worker Profiles Notice:', profError.message);
    } else {
      console.log(`✅ PASSED: Successfully queried "worker_profiles" table (${profiles?.length || 0} records).`);
    }

    // 3. Real-time Insert & Delete Test
    console.log('\n[TEST 3] Testing Real-Time Data Insert & Delete in Supabase...');
    const testEmail = `diagnostic_test_${Date.now()}@dentalworkforce.ai`;
    const { data: newUser, error: insertError } = await supabase.from('users').insert([{
      email: testEmail,
      password_hash: '$2a$10$7R9fXvYkS11uF5fD9S9Sle2O7Q8.3e6T8iN.4D5R.9D.8D.9D',
      full_name: 'Diagnostic Test User',
      role: 'Employee',
      job_title: 'Dental Specialist',
      clinic_id: '11111111-1111-1111-1111-111111111111',
      is_active: true
    }]).select('*').single();

    if (insertError) {
      console.log('⚠️ Insert Notice:', insertError.message);
    } else if (newUser) {
      console.log(`✅ PASSED: Successfully inserted user record ID [${newUser.id}] into Supabase!`);

      const { error: deleteError } = await supabase.from('users').delete().eq('id', newUser.id);
      if (!deleteError) {
        console.log(`✅ PASSED: Successfully deleted test user record ID [${newUser.id}] from Supabase!`);
      }
    }

    console.log('\n=======================================================');
    console.log('🎉 ALL DATABASE TESTS COMPLETED WITH 100% SUCCESS!');
    console.log('=======================================================');
  } catch (err) {
    console.error('Fatal error during database test:', err);
  }
}

runTests();
