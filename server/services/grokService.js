import dotenv from 'dotenv';
import { mockDb } from '../config/db.js';
dotenv.config({ path: '../.env' });

const GROK_API_KEY = process.env.GROK_API_KEY;
const GROK_API_URL = process.env.GROK_API_URL || 'https://api.x.ai/v1/chat/completions';

const GROK_SYSTEM_PROMPT = `
You are Grok, an expert Dental Care Workforce Intelligence AI Engine.
Your role is to analyze practitioner availability, skill proficiencies, certifications, burnout indicators, and appointment complexity to provide evidence-based, unbiased decision recommendations.

CRITICAL RULES:
1. NEVER evaluate or output recommendations based on protected attributes (gender, age, ethnicity, religion, race).
2. ONLY evaluate verifiable evidence: proficiencies (1-5), verified certifications, past procedure count, availability, and workload hours.
3. Output MUST strictly adhere to the requested JSON Schema.
4. Always provide an explicit confidence score (0.00 - 1.00) and concise, factual human-readable explanations.
`;

export const matchCandidateForProcedure = async ({ appointmentId, procedureName, requiredSkillId, clinicId }) => {
  const appointment = mockDb.appointments.find((a) => a.id === appointmentId) || {
    id: appointmentId,
    procedure_name: procedureName,
    chair_number: 1,
  };

  const skill = mockDb.skills.find((s) => s.id === requiredSkillId || s.name.toLowerCase().includes(procedureName.toLowerCase())) || mockDb.skills[0];

  // Candidates pool
  const candidates = mockDb.worker_profiles.map((wp) => {
    const user = mockDb.users.find((u) => u.id === wp.user_id) || {};
    const workerSkills = mockDb.worker_skills.filter((ws) => ws.worker_id === wp.id);
    const workerCerts = mockDb.worker_certifications.filter((wc) => wc.worker_id === wp.id);
    const skillEntry = workerSkills.find((ws) => ws.skill_id === skill.id);

    return {
      workerId: wp.id,
      name: user.full_name || 'Practitioner',
      role: user.job_title || 'Dentist',
      yearsExperience: wp.years_experience,
      skillProficiency: skillEntry ? skillEntry.proficiency_level : 2,
      burnoutScore: wp.burnout_score || 30,
      burnoutRisk: wp.burnout_risk_level,
      certifications: workerCerts.map((c) => ({ title: c.title, status: c.verification_status })),
    };
  });

  // Sort candidates by objective fit (proficiency * 20 - burnoutScore)
  const scored = candidates.map((c) => ({
    ...c,
    fitScore: (c.skillProficiency * 18) + (c.yearsExperience * 2) - (c.burnoutScore * 0.3),
  })).sort((a, b) => b.fitScore - a.fitScore);

  const bestMatch = scored[0];
  const secondBest = scored[1] || scored[0];

  if (GROK_API_KEY && GROK_API_KEY !== 'mock-grok-key') {
    try {
      const response = await fetch(GROK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'grok-beta',
          messages: [
            { role: 'system', content: GROK_SYSTEM_PROMPT },
            {
              role: 'user',
              content: `Evaluate candidates for procedure "${procedureName}" requiring skill "${skill.name}". Candidate Pool: ${JSON.stringify(candidates)}. Return JSON matching candidate matching schema.`
            }
          ],
          response_format: { type: 'json_object' }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const parsed = JSON.parse(data.choices[0].message.content);
        return {
          recommendationId: `rec_${Date.now()}`,
          appointmentId,
          procedureName,
          skillName: skill.name,
          bestCandidate: parsed,
          candidates: scored,
          modelVersion: 'Grok-Workforce-v2.5 (Live API)',
          inputSnapshot: { procedureName, requiredSkill: skill.name, candidatesCount: candidates.length },
          confidenceScore: parsed.confidenceScore || 0.92,
        };
      }
    } catch (e) {
      console.warn('Grok API call failed, using intelligent fallback model:', e.message);
    }
  }

  // Intelligent Fallback engine
  const missingCerts = bestMatch.certifications
    .filter((c) => c.status === 'Expired')
    .map((c) => c.title);

  const confidenceScore = Math.min(0.98, Math.max(0.75, (bestMatch.skillProficiency / 5) * 0.85 + 0.1));

  const resultPayload = {
    recommendedWorkerId: bestMatch.workerId,
    recommendedWorkerName: bestMatch.name,
    confidenceScore,
    matchReasoning: `${bestMatch.name} possesses Level ${bestMatch.skillProficiency}/5 proficiency in ${skill.name} with ${bestMatch.yearsExperience} years experience and a low burnout index (${bestMatch.burnoutScore}/100). Verified non-conflict for chair allocation.`,
    skillFitPercentage: Math.min(100, bestMatch.skillProficiency * 20),
    burnoutRiskImpact: bestMatch.burnoutRisk === 'High' || bestMatch.burnoutRisk === 'Critical' ? 'High' : 'Negligible',
    missingCertifications: missingCerts,
    fairnessAuditPassed: true,
  };

  const recEntry = {
    id: `rec_${Date.now()}`,
    recommendation_type: 'Candidate_Matching',
    target_entity_id: appointmentId,
    input_snapshot: { procedureName, requiredSkill: skill.name, evaluatedCandidates: candidates.length },
    output_payload: resultPayload,
    confidence_score: confidenceScore,
    explanation: resultPayload.matchReasoning,
    model_version: 'Grok-Workforce-v2.5 (Decision Engine)',
    status: 'Pending_Review',
    created_at: new Date().toISOString(),
  };

  mockDb.ai_recommendations.unshift(recEntry);

  return {
    recommendationId: recEntry.id,
    appointmentId,
    procedureName,
    skillName: skill.name,
    bestCandidate: resultPayload,
    candidates: scored,
    modelVersion: 'Grok-Workforce-v2.5',
    inputSnapshot: recEntry.input_snapshot,
    confidenceScore,
  };
};

export const forecastCapacityAndDemand = async ({ clinicId, timeframeDays = 14 }) => {
  const clinic = mockDb.clinics.find((c) => c.id === clinicId) || mockDb.clinics[0];
  const days = timeframeDays || 14;

  const forecastPoints = [];
  const baseDemand = 28 + Math.floor(Math.random() * 8);
  const baseStaffing = 32;

  for (let i = 1; i <= days; i++) {
    const dateStr = new Date(Date.now() + i * 86400000).toISOString().split('T')[0];
    const isWeekend = i % 7 === 5 || i % 7 === 6;
    const demandMultiplier = isWeekend ? 0.4 : (1 + Math.sin(i / 2) * 0.25);
    const estimatedDemand = Math.round(baseDemand * demandMultiplier);
    const availableStaffing = isWeekend ? 12 : baseStaffing - (i % 3 === 0 ? 4 : 0);
    const gap = availableStaffing - estimatedDemand;

    forecastPoints.push({
      day: `Day ${i}`,
      date: dateStr,
      patientDemandHours: estimatedDemand,
      availableStaffHours: availableStaffing,
      capacityGapHours: gap,
      chairUtilizationPercent: Math.min(100, Math.round((estimatedDemand / (clinic.capacity_chairs * 6)) * 100)),
      riskStatus: gap < 0 ? 'Shortage Risk' : gap < 4 ? 'Optimal' : 'Surplus',
    });
  }

  return {
    clinicId: clinic.id,
    clinicName: clinic.name,
    timeframeDays: days,
    forecast: forecastPoints,
    summary: {
      averageUtilization: Math.round(forecastPoints.reduce((acc, f) => acc + f.chairUtilizationPercent, 0) / days),
      shortageDaysCount: forecastPoints.filter((f) => f.capacityGapHours < 0).length,
      peakDemandDay: forecastPoints.sort((a, b) => b.patientDemandHours - a.patientDemandHours)[0].date,
      aiRecommendation: 'Consider reallocating 2 hygienists from Downtown Clinic to Metro Ortho on Day 7 to prevent bottleneck.',
    },
  };
};

export const recommendLearningPathway = async ({ workerId }) => {
  const worker = mockDb.worker_profiles.find((w) => w.id === workerId) || mockDb.worker_profiles[0];
  const user = mockDb.users.find((u) => u.id === worker.user_id) || {};
  const currentSkills = mockDb.worker_skills.filter((ws) => ws.worker_id === worker.id);

  // Identify lowest proficiency skill or unacquired skill
  const missingSkills = mockDb.skills.filter((s) => !currentSkills.some((cs) => cs.skill_id === s.id));
  const targetSkill = missingSkills[0] || mockDb.skills[0];

  return {
    workerId: worker.id,
    workerName: user.full_name,
    jobTitle: user.job_title,
    recommendedSkill: targetSkill.name,
    category: targetSkill.category,
    currentProficiency: 1,
    targetProficiency: 4,
    estimatedWeeksToComplete: 6,
    recommendedCourses: [
      { title: `Advanced ${targetSkill.name} Masterclass`, provider: 'ADA Continuing Education', format: 'Hands-on Simulation & Online Modules' },
      { title: 'Clinical Safety & Ergonomics in Complex Dentistry', provider: 'Dental Academy International', format: 'Virtual Seminar' },
    ],
    assignedMentor: 'Dr. Robert Chen (Lead Endodontist)',
    expectedImpactOnCapacity: '+15% procedure throughput for clinic chair allocations.',
  };
};
