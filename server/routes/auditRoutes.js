import express from 'express';
import { mockDb } from '../config/db.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';
import { recordAuditLog } from '../services/auditService.js';

const router = express.Router();

// GET /api/audit/logs — Append-only audit logs viewer
router.get('/logs', authenticateToken, requireRole(['Team Lead', 'Workforce Planner', 'HR Admin']), async (req, res) => {
  const logs = mockDb.audit_logs.map((log) => {
    const user = mockDb.users.find((u) => u.id === log.user_id);
    return {
      ...log,
      user_name: user ? user.full_name : 'System Engine',
      user_role: user ? user.role : 'System',
    };
  });

  res.json({ count: logs.length, logs });
});

// GET /api/audit/taxonomy — Master skill taxonomy management
router.get('/taxonomy', authenticateToken, async (req, res) => {
  res.json({ taxonomy: mockDb.skills });
});

// POST /api/audit/taxonomy — Create/update skill taxonomy entry (HR Admin only)
router.post('/taxonomy', authenticateToken, requireRole(['HR Admin']), async (req, res) => {
  const { name, category, description } = req.body;

  if (!name || !category) {
    return res.status(400).json({ error: 'Name and category are required' });
  }

  const newSkill = {
    id: `s_${Date.now()}`,
    name,
    category,
    description: description || '',
  };

  mockDb.skills.push(newSkill);

  await recordAuditLog({
    userId: req.user.id,
    actionType: 'TAXONOMY_SKILL_ADDED',
    entityAffected: 'SKILL_TAXONOMY',
    details: { newSkill },
  });

  res.status(201).json({ message: 'Skill taxonomy updated', skill: newSkill });
});

export default router;
