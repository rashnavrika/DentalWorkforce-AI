import express from 'express';
import { mockDb } from '../config/db.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { recordAuditLog } from '../services/auditService.js';

const router = express.Router();

// GET /api/reports/download — Export aggregated operational analytics (CSV/JSON format)
router.get('/download', authenticateToken, async (req, res) => {
  const { format = 'csv' } = req.query;

  const reportData = mockDb.worker_profiles.map((wp) => {
    const user = mockDb.users.find((u) => u.id === wp.user_id) || {};
    const clinic = mockDb.clinics.find((c) => c.id === user.clinic_id) || {};
    const certsCount = mockDb.worker_certifications.filter((c) => c.worker_id === wp.id).length;
    const skillsCount = mockDb.worker_skills.filter((s) => s.worker_id === wp.id).length;

    return {
      WorkerID: wp.id,
      Name: user.full_name,
      Role: user.role,
      JobTitle: user.job_title,
      Clinic: clinic.name || 'N/A',
      YearsExperience: wp.years_experience,
      WeeklyHours: wp.weekly_capacity_hours,
      BurnoutRisk: wp.burnout_risk_level,
      BurnoutScore: wp.burnout_score || 20,
      SkillsCount: skillsCount,
      CertificationsCount: certsCount,
    };
  });

  await recordAuditLog({
    userId: req.user.id,
    actionType: 'DATA_EXPORT_GENERATED',
    entityAffected: 'REPORTS',
    details: { format, recordCount: reportData.length },
  });

  if (format === 'json') {
    return res.json(reportData);
  }

  // Generate CSV string
  const headers = Object.keys(reportData[0]).join(',');
  const rows = reportData.map((row) =>
    Object.values(row)
      .map((val) => `"${String(val).replace(/"/g, '""')}"`)
      .join(',')
  );
  const csvContent = [headers, ...rows].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="dental_workforce_intelligence_report.csv"');
  res.send(csvContent);
});

export default router;
