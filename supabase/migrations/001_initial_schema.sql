-- Dental Care Workforce Skill & Capacity Intelligence Platform Schema
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ORGANIZATIONS / CLINICS
CREATE TABLE IF NOT EXISTS clinics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    address TEXT,
    operating_hours JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. USERS & ROLES
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Employee', 'Team Lead', 'Workforce Planner', 'HR Admin')),
    job_title VARCHAR(100) NOT NULL,
    clinic_id UUID REFERENCES clinics(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. WORKER PROFILES
CREATE TABLE IF NOT EXISTS worker_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    years_experience INT DEFAULT 0,
    employment_type VARCHAR(50) DEFAULT 'Full-Time',
    weekly_capacity_hours INT DEFAULT 40,
    burnout_risk_level VARCHAR(20) DEFAULT 'Low' CHECK (burnout_risk_level IN ('Low', 'Medium', 'High', 'Critical')),
    development_goals TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. SKILL TAXONOMY & WORKER SKILLS
CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS worker_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worker_id UUID REFERENCES worker_profiles(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    proficiency_level INT NOT NULL CHECK (proficiency_level BETWEEN 1 AND 5),
    verified_by_manager BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(worker_id, skill_id)
);

-- 5. CERTIFICATIONS
CREATE TABLE IF NOT EXISTS worker_certifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worker_id UUID REFERENCES worker_profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    issuing_body VARCHAR(255) NOT NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    verification_status VARCHAR(50) DEFAULT 'Active' CHECK (verification_status IN ('Active', 'Expiring_Soon', 'Expired'))
);

-- 6. PATIENTS & APPOINTMENTS
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    medical_history_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    assigned_worker_id UUID REFERENCES worker_profiles(id) ON DELETE SET NULL,
    procedure_name VARCHAR(255) NOT NULL,
    required_skill_id UUID REFERENCES skills(id),
    scheduled_start TIMESTAMP WITH TIME ZONE NOT NULL,
    scheduled_end TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'In-Progress', 'Completed', 'Cancelled')),
    chair_number INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. AI RUNS & RECOMMENDATIONS
CREATE TABLE IF NOT EXISTS ai_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recommendation_type VARCHAR(100) NOT NULL,
    target_entity_id UUID,
    input_snapshot JSONB NOT NULL,
    output_payload JSONB NOT NULL,
    confidence_score NUMERIC(5,2) NOT NULL,
    explanation TEXT NOT NULL,
    model_version VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending_Review' CHECK (status IN ('Pending_Review', 'Approved', 'Rejected', 'Overridden')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. HUMAN OVERRIDES & APPROVALS
CREATE TABLE IF NOT EXISTS manager_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ai_recommendation_id UUID REFERENCES ai_recommendations(id) ON DELETE CASCADE,
    reviewed_by_user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL CHECK (action IN ('Approved', 'Rejected', 'Overridden')),
    override_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action_type VARCHAR(100) NOT NULL,
    entity_affected VARCHAR(100) NOT NULL,
    details JSONB NOT NULL,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'Info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ROW LEVEL SECURITY (RLS) RULES
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Base Public / User Isolation Policies
DROP POLICY IF EXISTS "Users can view own data or managers can view clinic staff" ON users;
CREATE POLICY "Users can view own data or managers can view clinic staff" ON users
    FOR SELECT USING (
        auth.uid() = id OR 
        EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('Team Lead', 'Workforce Planner', 'HR Admin'))
    );

DROP POLICY IF EXISTS "HR Admin has full write access to users" ON users;
CREATE POLICY "HR Admin has full write access to users" ON users
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'HR Admin')
    );

DROP POLICY IF EXISTS "Audit logs insertable by service role, viewable by HR Admin" ON audit_logs;
CREATE POLICY "Audit logs insertable by service role, viewable by HR Admin" ON audit_logs
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'HR Admin')
    );
