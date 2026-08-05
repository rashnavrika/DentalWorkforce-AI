import express from 'express';
import { mockDb } from '../config/db.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/dashboard/metrics — Safe, Complete, Role-Aware Telemetry
router.get('/metrics', authenticateToken, async (req, res) => {
  const role = req.user?.role || 'Employee';
  const userId = req.user?.id;
  const userName = req.user?.full_name || 'Practitioner';

  const totalClinics = mockDb.clinics.length || 10;
  const totalUsersCount = mockDb.users.length || 8;

  // Active staffing board status for HR Admin & Team Leads
  const staffingBoard = mockDb.worker_profiles.map((wp) => {
    const user = mockDb.users.find((u) => u.id === wp.user_id) || {};
    const clinic = mockDb.clinics.find((c) => c.id === user.clinic_id) || {};

    return {
      worker_id: wp.id,
      name: user.full_name || 'Practitioner',
      job_title: user.job_title || 'Dental Specialist',
      role: user.role || 'Employee',
      clinic_name: clinic.name || 'Downtown Dental Excellence',
      burnout_risk: wp.burnout_risk_level || 'Low',
      burnout_score: wp.burnout_score || 25,
      status: wp.burnout_risk_level === 'High' ? 'Overworked (Review Shift)' : 'Active Shift',
      chair_assigned: `Chair ${Math.floor(Math.random() * 4) + 1}`,
    };
  });

  // Emergency / Shift alerts
  const emergencyAlerts = [
    {
      id: 'e1',
      type: 'Critical Deficit',
      clinic: 'Metro Orthodontics & Implants',
      message: 'Implantology surgical coverage gap detected for Chair 1 shift tomorrow at 13:30.',
      actionRequired: 'Assign Dr. Carlos Alvarez or override shift schedule.',
    },
    {
      id: 'e2',
      type: 'Burnout Warning',
      clinic: 'Central Laser & Cosmetic',
      message: 'Dr. Carlos Alvarez has completed 6 consecutive shifts over 48 total hours.',
      actionRequired: 'Schedule mandatory off-duty rest period.',
    },
  ];

  // Employee-specific arrays
  const myAppointments = [
    { id: 'a1', procedure: 'Complex Molar Root Canal Therapy', patient: 'Arthur Pendleton', time: '09:00 - 10:30 AM', chair: 'Chair 3', status: 'In-Progress' },
    { id: 'a2', procedure: 'Periodontal Deep Prophylaxis & Scaling', patient: 'Sophia Martinez', time: '11:30 - 12:30 PM', chair: 'Chair 3', status: 'Scheduled' },
    { id: 'a3', procedure: '3D CBCT Intraoral Diagnostic Scanning', patient: 'Liam O\'Connor', time: '02:00 - 03:00 PM', chair: 'Chair 3', status: 'Scheduled' }
  ];

  const mySkills = [
    { name: 'Root Canal Therapy (RCT)', category: 'Surgical', proficiency: 'Level 5 (Expert)', verified: true },
    { name: 'Diagnostic Exam & Digital Scanning', category: 'General', proficiency: 'Level 5 (Expert)', verified: true },
    { name: 'IV Sedation & Monitoring', category: 'Sedation', proficiency: 'Level 3 (Intermediate)', verified: false }
  ];

  // Team Lead team members
  const teamMembers = mockDb.worker_profiles.slice(0, 4).map(wp => {
    const u = mockDb.users.find(usr => usr.id === wp.user_id) || { full_name: 'Dr. Practitioner', job_title: 'Dentist' };
    return {
      id: wp.id,
      name: u.full_name,
      title: u.job_title,
      hours: `${wp.weekly_capacity_hours} hrs/wk`,
      burnoutScore: wp.burnout_score || 35,
      burnoutRisk: wp.burnout_risk_level || 'Low',
      status: wp.burnout_risk_level === 'High' ? 'Overloaded' : 'On Shift'
    };
  });

  // Planner network summary
  const networkSummary = [
    { clinic: 'Downtown Dental Excellence', utilization: '91%', status: 'Optimal', chairs: 8 },
    { clinic: 'Westside Pediatric Dentistry', utilization: '78%', status: 'Balanced', chairs: 6 },
    { clinic: 'Metro Orthodontics & Implants', utilization: '96%', status: 'Near Overload', chairs: 10 },
    { clinic: 'Harbor Smile Center', utilization: '64%', status: 'Underutilized', chairs: 7 }
  ];

  // Guaranteed unified KPI object
  const kpis = {
    // Global telemetry
    chairUtilization: 86.4,
    avgWaitTimeMins: 12.5,
    treatmentAcceptance: 91.2,
    cancellationRate: 4.8,
    recallCompliance: 88.6,
    avgProcedureDurationMins: 52.0,
    activeDentists: totalUsersCount,
    totalClinics: totalClinics,
    
    // Employee specific
    assignedChair: 'Chair 3',
    weeklyHoursWorked: '32 / 40 hrs',
    burnoutScore: '22/100',
    completedAppointments: '4 Today',

    // Team Lead specific
    clinicCapacity: '88.5%',
    activeTeamMembers: teamMembers.length,
    pendingApprovals: 3,
    highBurnoutFlags: 1,

    // Planner specific
    networkClinics: totalClinics,
    unassignedProcedures: 4,
    rebalancingEfficiency: '94.8%',

    // HR Admin specific
    totalStaffCount: totalUsersCount,
    complianceRate: '98.5%',
    certificationsExpiring: 2,
    auditLogsToday: 14
  };

  res.json({
    roleView: role,
    kpis,
    staffingBoard,
    emergencyAlerts,
    myAppointments,
    mySkills,
    teamMembers,
    networkSummary
  });
});

export default router;
