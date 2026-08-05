import express from 'express';
import { mockDb } from '../config/db.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateMiddleware.js';
import { managerOverrideSchema } from '../utils/zodSchemas.js';
import { recordAuditLog } from '../services/auditService.js';

const router = express.Router();

// GET /api/approvals/pending — Fetch AI recommendations pending manager sign-off
router.get('/pending', authenticateToken, async (req, res) => {
  const pending = mockDb.ai_recommendations.map((rec) => {
    const approval = mockDb.manager_approvals.find((a) => a.ai_recommendation_id === rec.id);
    return {
      ...rec,
      approvalHistory: approval || null,
    };
  });

  res.json({ count: pending.length, recommendations: pending });
});

// POST /api/approvals/override — Record manager approval / rejection / override
router.post(
  '/override',
  authenticateToken,
  requireRole(['Team Lead', 'Workforce Planner', 'HR Admin']),
  validateRequest(managerOverrideSchema),
  async (req, res) => {
    const { ai_recommendation_id, action, override_reason, assigned_worker_id } = req.body;

    const rec = mockDb.ai_recommendations.find((r) => r.id === ai_recommendation_id);
    if (rec) {
      rec.status = action;
    }

    const approvalEntry = {
      id: `appr_${Date.now()}`,
      ai_recommendation_id,
      reviewed_by_user_id: req.user.id,
      reviewed_by_name: req.user.full_name,
      action,
      override_reason,
      assigned_worker_id: assigned_worker_id || rec?.output_payload?.recommendedWorkerId,
      created_at: new Date().toISOString(),
    };

    mockDb.manager_approvals.unshift(approvalEntry);

    // If an appointment assignment is approved/overridden, update appointment record
    if (rec && rec.target_entity_id) {
      const appt = mockDb.appointments.find((a) => a.id === rec.target_entity_id);
      if (appt) {
        appt.assigned_worker_id = approvalEntry.assigned_worker_id;
      }
    }

    await recordAuditLog({
      userId: req.user.id,
      actionType: `HUMAN_AI_DECISION_${action.toUpperCase()}`,
      entityAffected: 'AI_RECOMMENDATION',
      details: {
        ai_recommendation_id,
        action,
        override_reason,
        assigned_worker_id: approvalEntry.assigned_worker_id,
      },
    });

    res.json({
      message: `AI recommendation successfully recorded as ${action}`,
      approval: approvalEntry,
    });
  }
);

export default router;
