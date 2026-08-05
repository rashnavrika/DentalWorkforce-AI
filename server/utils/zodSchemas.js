import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address format'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
  }),
});

export const createWorkerSchema = z.object({
  body: z.object({
    full_name: z.string().min(2, 'Full name is required'),
    email: z.string().email('Valid email is required'),
    job_title: z.string().min(2, 'Job title is required'),
    role: z.enum(['Employee', 'Team Lead', 'Workforce Planner', 'HR Admin']),
    clinic_id: z.string().optional(),
    years_experience: z.number().min(0).default(0),
    employment_type: z.enum(['Full-Time', 'Part-Time', 'Contractor']).default('Full-Time'),
    weekly_capacity_hours: z.number().min(5).max(80).default(40),
    development_goals: z.string().optional(),
  }),
});

export const aiMatchCandidateSchema = z.object({
  body: z.object({
    appointment_id: z.string().min(1, 'Appointment ID is required'),
    procedure_name: z.string().min(1, 'Procedure name is required'),
    required_skill_id: z.string().optional(),
    chair_number: z.number().optional(),
    clinic_id: z.string().optional(),
  }),
});

export const aiForecastCapacitySchema = z.object({
  body: z.object({
    clinic_id: z.string().optional(),
    timeframe_days: z.number().refine((val) => [7, 14, 30].includes(val), {
      message: 'Timeframe days must be 7, 14, or 30',
    }),
  }),
});

export const aiRecommendLearningSchema = z.object({
  body: z.object({
    worker_id: z.string().min(1, 'Worker ID is required'),
    target_skill_id: z.string().optional(),
  }),
});

export const managerOverrideSchema = z.object({
  body: z.object({
    ai_recommendation_id: z.string().min(1, 'AI Recommendation ID is required'),
    action: z.enum(['Approved', 'Rejected', 'Overridden']),
    override_reason: z.string().min(5, 'A clear justification of at least 5 characters is mandatory for human review'),
    assigned_worker_id: z.string().optional(),
  }),
});
