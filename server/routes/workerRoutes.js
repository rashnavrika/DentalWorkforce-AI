import express from 'express';
import { isSupabaseConfigured, supabase, mockDb } from '../config/db.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';
import { recordAuditLog } from '../services/auditService.js';

const router = express.Router();

// GET /api/workers — Query all worker profiles (Combines Supabase DB + Local Memory)
router.get('/', authenticateToken, async (req, res) => {
  const { clinic_id, role, search } = req.query;

  try {
    let supabaseWorkers = [];

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('worker_profiles')
        .select(`
          id,
          user_id,
          years_experience,
          employment_type,
          weekly_capacity_hours,
          burnout_risk_level,
          development_goals,
          users (
            full_name,
            email,
            role,
            job_title,
            clinic_id,
            clinics ( name )
          )
        `);

      if (!error && data && data.length > 0) {
        supabaseWorkers = data.map((wp) => ({
          id: wp.id,
          user_id: wp.user_id,
          full_name: wp.users?.full_name || 'Practitioner',
          email: wp.users?.email || '',
          role: wp.users?.role || 'Employee',
          job_title: wp.users?.job_title || 'Dental Specialist',
          clinic_id: wp.users?.clinic_id,
          clinic_name: wp.users?.clinics?.name || 'Downtown Dental Excellence',
          years_experience: wp.years_experience || 0,
          employment_type: wp.employment_type || 'Full-Time',
          weekly_capacity_hours: wp.weekly_capacity_hours || 40,
          burnout_risk_level: wp.burnout_risk_level || 'Low',
          burnout_score: 20,
          development_goals: wp.development_goals || 'Continuous skill progression',
          skills: [],
          certifications: []
        }));
      }
    }

    const localWorkers = mockDb.worker_profiles.map((wp) => {
      const user = mockDb.users.find((u) => u.id === wp.user_id) || {};
      const clinic = mockDb.clinics.find((c) => c.id === user.clinic_id) || {};
      const skills = mockDb.worker_skills
        .filter((ws) => ws.worker_id === wp.id)
        .map((ws) => {
          const s = mockDb.skills.find((sk) => sk.id === ws.skill_id) || {};
          return {
            id: s.id,
            name: s.name,
            category: s.category,
            proficiency_level: ws.proficiency_level,
            verified_by_manager: ws.verified_by_manager,
          };
        });

      const certs = mockDb.worker_certifications.filter((wc) => wc.worker_id === wp.id);

      return {
        id: wp.id,
        user_id: wp.user_id,
        full_name: user.full_name || 'Practitioner',
        email: user.email || '',
        role: user.role || 'Employee',
        job_title: user.job_title || 'Dental Specialist',
        clinic_id: user.clinic_id || 'c1',
        clinic_name: clinic.name || 'Downtown Dental Excellence',
        years_experience: wp.years_experience || 0,
        employment_type: wp.employment_type || 'Full-Time',
        weekly_capacity_hours: wp.weekly_capacity_hours || 40,
        burnout_risk_level: wp.burnout_risk_level || 'Low',
        burnout_score: wp.burnout_score || 20,
        development_goals: wp.development_goals || 'Continuous learning',
        skills: skills || [],
        certifications: certs || [],
      };
    });

    // Combine Supabase and local workers, removing duplicates by email
    const allWorkersMap = new Map();
    localWorkers.forEach(w => allWorkersMap.set(w.email.toLowerCase(), w));
    supabaseWorkers.forEach(w => {
      if (w.email) allWorkersMap.set(w.email.toLowerCase(), w);
    });

    let combinedWorkers = Array.from(allWorkersMap.values());

    if (clinic_id) {
      combinedWorkers = combinedWorkers.filter((w) => w.clinic_id === clinic_id);
    }
    if (role) {
      combinedWorkers = combinedWorkers.filter((w) => w.role === role);
    }
    if (search) {
      const query = search.toLowerCase();
      combinedWorkers = combinedWorkers.filter(
        (w) =>
          (w.full_name && w.full_name.toLowerCase().includes(query)) ||
          (w.job_title && w.job_title.toLowerCase().includes(query))
      );
    }

    res.json({ count: combinedWorkers.length, workers: combinedWorkers });
  } catch (err) {
    console.error('Error fetching workers:', err);
    res.status(500).json({ error: 'Failed to fetch workers' });
  }
});

// POST /api/workers — Create new worker profile in Supabase & local state (HR Admin & Team Lead)
router.post('/', authenticateToken, requireRole(['HR Admin', 'Team Lead']), async (req, res) => {
  const { full_name, email, job_title, role, clinic_id, years_experience, employment_type, weekly_capacity_hours, development_goals } = req.body;

  if (!full_name || !email) {
    return res.status(400).json({ error: 'Full name and email are required.' });
  }

  const defaultPasswordHash = '$2a$10$7R9fXvYkS11uF5fD9S9Sle2O7Q8.3e6T8iN.4D5R.9D.8D.9D';
  let createdUser = null;
  let createdProfile = null;

  if (isSupabaseConfigured) {
    try {
      const { data: userData } = await supabase.from('users').insert([{
        email,
        password_hash: defaultPasswordHash,
        full_name,
        role: role || 'Employee',
        job_title: job_title || 'Dental Specialist',
        clinic_id: clinic_id || '11111111-1111-1111-1111-111111111111',
        is_active: true
      }]).select('*').single();

      if (userData) {
        createdUser = userData;
        const { data: profData } = await supabase.from('worker_profiles').insert([{
          user_id: userData.id,
          years_experience: Number(years_experience) || 1,
          employment_type: employment_type || 'Full-Time',
          weekly_capacity_hours: Number(weekly_capacity_hours) || 40,
          burnout_risk_level: 'Low',
          development_goals: development_goals || 'Skill onboarding'
        }]).select('*').single();
        if (profData) createdProfile = profData;
      }
    } catch (e) {
      console.log('Supabase insert warning:', e.message);
    }
  }

  const newUserId = createdUser?.id || `u_${Date.now()}`;
  const newWorkerId = createdProfile?.id || `wp_${Date.now()}`;

  const newUser = {
    id: newUserId,
    email,
    password_hash: defaultPasswordHash,
    full_name,
    role: role || 'Employee',
    job_title: job_title || 'Dental Specialist',
    clinic_id: clinic_id || 'c1',
    is_active: true,
  };

  const newProfile = {
    id: newWorkerId,
    user_id: newUserId,
    years_experience: Number(years_experience) || 1,
    employment_type: employment_type || 'Full-Time',
    weekly_capacity_hours: Number(weekly_capacity_hours) || 40,
    burnout_risk_level: 'Low',
    burnout_score: 15,
    development_goals: development_goals || 'Skill onboarding',
  };

  mockDb.users.push(newUser);
  mockDb.worker_profiles.push(newProfile);

  await recordAuditLog({
    userId: req.user.id,
    actionType: 'WORKER_PROFILE_CREATE',
    entityAffected: 'WORKER_PROFILE',
    details: { newWorkerId, full_name, role },
  });

  res.status(201).json({ message: 'Worker profile created successfully', workerId: newWorkerId });
});

// PUT /api/workers/:id — Update worker profile
router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { full_name, job_title, role, weekly_capacity_hours, employment_type, development_goals, burnout_risk_level } = req.body;

  const wp = mockDb.worker_profiles.find(p => p.id === id);
  if (wp) {
    const u = mockDb.users.find(usr => usr.id === wp.user_id);
    if (u) {
      if (full_name) u.full_name = full_name;
      if (job_title) u.job_title = job_title;
      if (role) u.role = role;
    }

    if (weekly_capacity_hours) wp.weekly_capacity_hours = Number(weekly_capacity_hours);
    if (employment_type) wp.employment_type = employment_type;
    if (development_goals) wp.development_goals = development_goals;
    if (burnout_risk_level) wp.burnout_risk_level = burnout_risk_level;
  }

  if (isSupabaseConfigured) {
    try {
      await supabase.from('worker_profiles').update({
        weekly_capacity_hours: weekly_capacity_hours ? Number(weekly_capacity_hours) : undefined,
        employment_type: employment_type || undefined,
        development_goals: development_goals || undefined,
      }).eq('id', id);
    } catch (e) {
      console.log('Supabase update warning:', e.message);
    }
  }

  await recordAuditLog({
    userId: req.user.id,
    actionType: 'WORKER_PROFILE_UPDATE',
    entityAffected: 'WORKER_PROFILE',
    details: { workerId: id, updatedFields: req.body },
  });

  res.json({ message: 'Worker profile updated successfully' });
});

// DELETE /api/workers/:id — Delete worker profile (HR Admin & Team Lead)
router.delete('/:id', authenticateToken, requireRole(['HR Admin', 'Team Lead']), async (req, res) => {
  const { id } = req.params;

  // Remove from mockDb
  const wpIndex = mockDb.worker_profiles.findIndex(p => p.id === id);
  if (wpIndex !== -1) {
    const wp = mockDb.worker_profiles[wpIndex];
    mockDb.worker_profiles.splice(wpIndex, 1);
    const uIndex = mockDb.users.findIndex(u => u.id === wp.user_id);
    if (uIndex !== -1) mockDb.users.splice(uIndex, 1);
  }

  if (isSupabaseConfigured) {
    try {
      await supabase.from('worker_profiles').delete().eq('id', id);
    } catch (e) {
      console.log('Supabase delete warning:', e.message);
    }
  }

  await recordAuditLog({
    userId: req.user.id,
    actionType: 'WORKER_PROFILE_DELETE',
    entityAffected: 'WORKER_PROFILE',
    details: { workerId: id },
  });

  res.json({ message: 'Worker profile deleted successfully' });
});

// GET /api/skills/matrix — Fetch full competency grid
router.get('/skills/matrix', authenticateToken, async (req, res) => {
  const { clinic_id } = req.query;

  let workers = mockDb.worker_profiles.map((wp) => {
    const user = mockDb.users.find((u) => u.id === wp.user_id) || {};
    const clinic = mockDb.clinics.find((c) => c.id === user.clinic_id) || {};

    const skillMap = {};
    mockDb.worker_skills
      .filter((ws) => ws.worker_id === wp.id)
      .forEach((ws) => {
        skillMap[ws.skill_id] = {
          proficiency: ws.proficiency_level,
          verified: ws.verified_by_manager,
        };
      });

    return {
      worker_id: wp.id,
      name: user.full_name || 'Practitioner',
      job_title: user.job_title || 'Dental Specialist',
      role: user.role || 'Employee',
      clinic_id: user.clinic_id,
      clinic_name: clinic.name || 'Downtown Dental',
      burnout_risk_level: wp.burnout_risk_level || 'Low',
      skills: skillMap,
    };
  });

  if (clinic_id) {
    workers = workers.filter((w) => w.clinic_id === clinic_id);
  }

  const heatMapGaps = mockDb.skills.map((skill) => {
    const qualifiedWorkers = workers.filter((w) => w.skills[skill.id] && w.skills[skill.id].proficiency >= 4);
    const count = qualifiedWorkers.length;
    let status = 'Green';
    if (count === 0) status = 'Red';
    else if (count < 2) status = 'Yellow';

    return {
      skill_id: skill.id,
      skill_name: skill.name,
      category: skill.category,
      expertCount: count,
      status,
    };
  });

  res.json({
    skillsTaxonomy: mockDb.skills,
    matrix: workers,
    gapHeatMap: heatMapGaps,
  });
});

export default router;
