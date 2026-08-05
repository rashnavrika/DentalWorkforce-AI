import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseKey && 
  !supabaseUrl.includes('your-supabase-project')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Stateful local memory database for out-of-the-box demo execution
const defaultPasswordHash = bcrypt.hashSync('Password123!', 10);

export const mockDb = {
  clinics: [
    { id: 'c1', name: 'Downtown Dental Excellence', code: 'DNT-01', address: '101 Main St, Suite 400', capacity_chairs: 8 },
    { id: 'c2', name: 'Westside Pediatric & Family Dentistry', code: 'WST-02', address: '450 West Ave, Bldg B', capacity_chairs: 6 },
    { id: 'c3', name: 'Metro Orthodontics & Implants', code: 'MTR-03', address: '88 Tech Blvd, Fl 2', capacity_chairs: 10 },
    { id: 'c4', name: 'Northside Dental Specialists', code: 'NRT-04', address: '120 Northway Rd', capacity_chairs: 5 },
    { id: 'c5', name: 'Harbor Smile Center', code: 'HBR-05', address: '300 Harbor Dr', capacity_chairs: 7 },
    { id: 'c6', name: 'Eastgate Endodontic Clinic', code: 'EST-06', address: '77 Eastgate Plaza', capacity_chairs: 4 },
    { id: 'c7', name: 'Summit Periodontics & Implants', code: 'SMT-07', address: '990 Summit Ridge', capacity_chairs: 6 },
    { id: 'c8', name: 'Riverside Family Care', code: 'RVR-08', address: '14 Riverside Way', capacity_chairs: 8 },
    { id: 'c9', name: 'Valley Sedation & Oral Surgery', code: 'VLY-09', address: '500 Valley View Rd', capacity_chairs: 6 },
    { id: 'c10', name: 'Central Laser & Cosmetic Dental', code: 'CTR-10', address: '22 Central Sq', capacity_chairs: 9 }
  ],

  users: [
    {
      id: 'u1',
      email: 'admin@dentalworkforce.ai',
      password_hash: defaultPasswordHash,
      full_name: 'Dr. Sarah Jenkins',
      role: 'HR Admin',
      job_title: 'Chief Medical & HR Officer',
      clinic_id: 'c1',
      is_active: true
    },
    {
      id: 'u2',
      email: 'planner@dentalworkforce.ai',
      password_hash: defaultPasswordHash,
      full_name: 'Marcus Vance',
      role: 'Workforce Planner',
      job_title: 'Network Capacity Planner',
      clinic_id: 'c1',
      is_active: true
    },
    {
      id: 'u3',
      email: 'lead@dentalworkforce.ai',
      password_hash: defaultPasswordHash,
      full_name: 'Dr. Robert Chen',
      role: 'Team Lead',
      job_title: 'Lead Endodontist & Clinic Director',
      clinic_id: 'c1',
      is_active: true
    },
    {
      id: 'u4',
      email: 'dentist@dentalworkforce.ai',
      password_hash: defaultPasswordHash,
      full_name: 'Dr. Elena Rostova',
      role: 'Employee',
      job_title: 'Senior Associate Dentist',
      clinic_id: 'c1',
      is_active: true
    },
    {
      id: 'u5',
      email: 'hygienist@dentalworkforce.ai',
      password_hash: defaultPasswordHash,
      full_name: 'Jessica Taylor, RDH',
      role: 'Employee',
      job_title: 'Lead Registered Dental Hygienist',
      clinic_id: 'c1',
      is_active: true
    },
    {
      id: 'u6',
      email: 'dr.alvarez@dentalworkforce.ai',
      password_hash: defaultPasswordHash,
      full_name: 'Dr. Carlos Alvarez',
      role: 'Employee',
      job_title: 'Implantologist & Oral Surgeon',
      clinic_id: 'c3',
      is_active: true
    },
    {
      id: 'u7',
      email: 'dr.kim@dentalworkforce.ai',
      password_hash: defaultPasswordHash,
      full_name: 'Dr. Hannah Kim',
      role: 'Employee',
      job_title: 'Pediatric Specialist',
      clinic_id: 'c2',
      is_active: true
    },
    {
      id: 'u8',
      email: 'dr.patel@dentalworkforce.ai',
      password_hash: defaultPasswordHash,
      full_name: 'Dr. Dev Patel',
      role: 'Team Lead',
      job_title: 'Ortho Team Director',
      clinic_id: 'c3',
      is_active: true
    }
  ],

  skills: [
    { id: 's1', name: 'Root Canal Therapy (RCT)', category: 'Surgical', description: 'Molar and complex multi-canal endodontic procedures' },
    { id: 's2', name: 'Dental Implants & Bone Grafting', category: 'Surgical', description: 'Single/multi-unit placement and ridge augmentation' },
    { id: 's3', name: 'Clear Aligner & Orthodontics', category: 'Ortho', description: 'Iterative aligner planning and malocclusion correction' },
    { id: 's4', name: 'Scaling & Deep Prophylaxis', category: 'Preventive', description: 'Periodontal scaling, root planing, and ultrasonic cleaning' },
    { id: 's5', name: 'Pediatric Pulpotomy & Behavior Mgmt', category: 'Pediatric', description: 'Child anxiety management and pediatric restorative treatments' },
    { id: 's6', name: 'Laser Periodontal Surgery', category: 'Surgical', description: 'Soft-tissue laser gingivectomy and decontamination' },
    { id: 's7', name: 'IV Sedation & Nitrous Monitoring', category: 'Sedation', description: 'Moderate conscious sedation and vital signs management' },
    { id: 's8', name: 'Diagnostic Exam & Digital Impression', category: 'General', description: 'CBCT 3D scanning, intraoral imaging, and treatment planning' }
  ],

  worker_profiles: [
    {
      id: 'wp1',
      user_id: 'u4',
      years_experience: 9,
      employment_type: 'Full-Time',
      weekly_capacity_hours: 40,
      burnout_risk_level: 'Low',
      burnout_score: 24,
      development_goals: 'Mastering laser-assisted endodontics and IV sedation certification.'
    },
    {
      id: 'wp2',
      user_id: 'u3',
      years_experience: 16,
      employment_type: 'Full-Time',
      weekly_capacity_hours: 45,
      burnout_risk_level: 'Medium',
      burnout_score: 58,
      development_goals: 'Expanding clinic leadership and complex sinus lift surgery.'
    },
    {
      id: 'wp3',
      user_id: 'u5',
      years_experience: 6,
      employment_type: 'Full-Time',
      weekly_capacity_hours: 36,
      burnout_risk_level: 'Low',
      burnout_score: 18,
      development_goals: 'Advanced laser hygiene therapy certification.'
    },
    {
      id: 'wp4',
      user_id: 'u6',
      years_experience: 12,
      employment_type: 'Full-Time',
      weekly_capacity_hours: 50,
      burnout_risk_level: 'High',
      burnout_score: 79,
      development_goals: 'Zygomatic implant surgery and soft tissue grafting.'
    },
    {
      id: 'wp5',
      user_id: 'u7',
      years_experience: 7,
      employment_type: 'Part-Time',
      weekly_capacity_hours: 24,
      burnout_risk_level: 'Low',
      burnout_score: 15,
      development_goals: 'Interceptive orthodontic growth guidance for adolescents.'
    },
    {
      id: 'wp6',
      user_id: 'u8',
      years_experience: 14,
      employment_type: 'Full-Time',
      weekly_capacity_hours: 42,
      burnout_risk_level: 'Medium',
      burnout_score: 62,
      development_goals: '3D printed custom surgical guides and clear aligner biomechanics.'
    }
  ],

  worker_skills: [
    { id: 'ws1', worker_id: 'wp1', skill_id: 's1', proficiency_level: 5, verified_by_manager: true },
    { id: 'ws2', worker_id: 'wp1', skill_id: 's8', proficiency_level: 5, verified_by_manager: true },
    { id: 'ws3', worker_id: 'wp1', skill_id: 's7', proficiency_level: 3, verified_by_manager: false },
    { id: 'ws4', worker_id: 'wp2', skill_id: 's1', proficiency_level: 5, verified_by_manager: true },
    { id: 'ws5', worker_id: 'wp2', skill_id: 's2', proficiency_level: 4, verified_by_manager: true },
    { id: 'ws6', worker_id: 'wp3', skill_id: 's4', proficiency_level: 5, verified_by_manager: true },
    { id: 'ws7', worker_id: 'wp3', skill_id: 's8', proficiency_level: 4, verified_by_manager: true },
    { id: 'ws8', worker_id: 'wp4', skill_id: 's2', proficiency_level: 5, verified_by_manager: true },
    { id: 'ws9', worker_id: 'wp4', skill_id: 's7', proficiency_level: 5, verified_by_manager: true },
    { id: 'ws10', worker_id: 'wp5', skill_id: 's5', proficiency_level: 5, verified_by_manager: true },
    { id: 'ws11', worker_id: 'wp6', skill_id: 's3', proficiency_level: 5, verified_by_manager: true }
  ],

  worker_certifications: [
    { id: 'wc1', worker_id: 'wp1', title: 'Board Certified Endodontist', issuing_body: 'American Board of Endodontics', issue_date: '2018-05-15', expiry_date: '2027-05-15', verification_status: 'Active' },
    { id: 'wc2', worker_id: 'wp1', title: 'BLS & ACLS Certification', issuing_body: 'American Heart Association', issue_date: '2024-01-10', expiry_date: '2026-08-15', verification_status: 'Expiring_Soon' },
    { id: 'wc3', worker_id: 'wp4', title: 'Intravenous Sedation Permit', issuing_body: 'State Dental Board', issue_date: '2021-09-01', expiry_date: '2026-08-10', verification_status: 'Expiring_Soon' },
    { id: 'wc4', worker_id: 'wp3', title: 'Laser Safety Specialist', issuing_body: 'Academy of Laser Dentistry', issue_date: '2022-03-20', expiry_date: '2028-03-20', verification_status: 'Active' },
    { id: 'wc5', worker_id: 'wp6', title: 'Master Aligner Provider', issuing_body: 'Global Ortho Institute', issue_date: '2020-11-12', expiry_date: '2025-11-12', verification_status: 'Active' }
  ],

  patients: [
    { id: 'p1', first_name: 'Arthur', last_name: 'Pendleton', medical_history_summary: 'Severe dental anxiety, allergy to Penicillin, history of root fracture.' },
    { id: 'p2', first_name: 'Sophia', last_name: 'Martinez', medical_history_summary: 'Hypertension controlled, routine prophylactic recall.' },
    { id: 'p3', first_name: 'Liam', last_name: 'O\'Connor', medical_history_summary: 'Pediatric patient, sensitive gag reflex.' },
    { id: 'p4', first_name: 'Emma', last_name: 'Watson', medical_history_summary: 'Edentulous posterior ridge, scheduled for surgical implant placement.' }
  ],

  appointments: [
    {
      id: 'a1',
      clinic_id: 'c1',
      patient_id: 'p1',
      assigned_worker_id: 'wp1',
      procedure_name: 'Complex Molar Root Canal Therapy',
      required_skill_id: 's1',
      scheduled_start: '2026-08-05T09:00:00.000Z',
      scheduled_end: '2026-08-05T10:30:00.000Z',
      status: 'Scheduled',
      chair_number: 3
    },
    {
      id: 'a2',
      clinic_id: 'c1',
      patient_id: 'p2',
      assigned_worker_id: 'wp3',
      procedure_name: 'Periodontal Maintenance & Deep Scaling',
      required_skill_id: 's4',
      scheduled_start: '2026-08-05T11:00:00.000Z',
      scheduled_end: '2026-08-05T12:00:00.000Z',
      status: 'Scheduled',
      chair_number: 2
    },
    {
      id: 'a3',
      clinic_id: 'c3',
      patient_id: 'p4',
      assigned_worker_id: 'wp4',
      procedure_name: 'Dual Implant Placement with Sinus Lift',
      required_skill_id: 's2',
      scheduled_start: '2026-08-05T13:30:00.000Z',
      scheduled_end: '2026-08-05T15:30:00.000Z',
      status: 'Scheduled',
      chair_number: 1
    }
  ],

  ai_recommendations: [
    {
      id: 'rec1',
      recommendation_type: 'Candidate_Matching',
      target_entity_id: 'a1',
      input_snapshot: {
        appointment: 'Complex Molar Root Canal Therapy',
        requiredSkill: 'Root Canal Therapy (RCT)',
        candidatesEvaluated: ['wp1', 'wp2']
      },
      output_payload: {
        recommendedWorkerId: 'wp1',
        recommendedWorkerName: 'Dr. Elena Rostova',
        confidenceScore: 0.94,
        matchReasoning: 'Dr. Rostova holds a Level 5 proficiency in Molar RCT, active Board Certification in Endodontics, and low burnout index (24/100). Chair 3 shift schedule is fully open.',
        skillFitPercentage: 98,
        burnoutRiskImpact: 'Negligible',
        missingCertifications: [],
        fairnessAuditPassed: true
      },
      confidence_score: 0.94,
      explanation: 'Optimal match based on verified endodontic mastery, zero conflict on Chair 3, and low burnout score.',
      model_version: 'Grok-Workforce-v2.5',
      status: 'Pending_Review',
      created_at: new Date().toISOString()
    }
  ],

  manager_approvals: [],

  audit_logs: [
    {
      id: 'aud1',
      user_id: 'u1',
      action_type: 'SYSTEM_INIT',
      entity_affected: 'SYSTEM',
      details: { message: 'DentalWorkforce AI Platform initialized successfully' },
      ip_address: '127.0.0.1',
      created_at: new Date().toISOString()
    }
  ],

  notifications: [
    {
      id: 'n1',
      user_id: 'u1',
      title: 'Certification Expiry Alert',
      message: 'Dr. Elena Rostova\'s BLS & ACLS Certification expires in 11 days.',
      type: 'Warning',
      is_read: false,
      created_at: new Date().toISOString()
    },
    {
      id: 'n2',
      user_id: 'u1',
      title: 'High Burnout Warning',
      message: 'Dr. Carlos Alvarez (Clinic MTR-03) reached a high burnout risk index of 79/100.',
      type: 'Urgent',
      is_read: false,
      created_at: new Date().toISOString()
    }
  ]
};
