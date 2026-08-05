import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateMiddleware.js';
import {
  aiMatchCandidateSchema,
  aiForecastCapacitySchema,
  aiRecommendLearningSchema,
} from '../utils/zodSchemas.js';
import {
  matchCandidateForProcedure,
  forecastCapacityAndDemand,
  recommendLearningPathway,
} from '../services/grokService.js';
import { recordAuditLog } from '../services/auditService.js';

const router = express.Router();

// POST /api/ai/match-candidate — Trigger Grok AI candidate evaluation
router.post('/match-candidate', authenticateToken, validateRequest(aiMatchCandidateSchema), async (req, res) => {
  const { appointment_id, procedure_name, required_skill_id, clinic_id } = req.body;

  try {
    const result = await matchCandidateForProcedure({
      appointmentId: appointment_id,
      procedureName: procedure_name,
      requiredSkillId: required_skill_id,
      clinicId: clinic_id,
    });

    await recordAuditLog({
      userId: req.user.id,
      actionType: 'AI_CANDIDATE_MATCH_INVOKED',
      entityAffected: 'AI_RECOMMENDATION',
      details: {
        appointmentId: appointment_id,
        procedureName: procedure_name,
        confidenceScore: result.confidenceScore,
        recommendedWorkerId: result.bestCandidate.recommendedWorkerId,
      },
    });

    res.json(result);
  } catch (err) {
    console.error('AI match candidate error:', err);
    res.status(500).json({ error: 'AI candidate matching evaluation failed.' });
  }
});

// POST /api/ai/forecast-capacity — Trigger 7/14/30-day capacity & demand forecast
router.post('/forecast-capacity', authenticateToken, validateRequest(aiForecastCapacitySchema), async (req, res) => {
  const { clinic_id, timeframe_days } = req.body;

  try {
    const forecastResult = await forecastCapacityAndDemand({
      clinicId: clinic_id,
      timeframeDays: timeframe_days,
    });

    await recordAuditLog({
      userId: req.user.id,
      actionType: 'AI_CAPACITY_FORECAST_INVOKED',
      entityAffected: 'CAPACITY_FORECAST',
      details: { clinicId: clinic_id, timeframeDays: timeframe_days },
    });

    res.json(forecastResult);
  } catch (err) {
    console.error('AI forecast capacity error:', err);
    res.status(500).json({ error: 'Capacity forecasting service unavailable.' });
  }
});

// POST /api/ai/recommend-learning — Generate tailored upskilling path
router.post('/recommend-learning', authenticateToken, validateRequest(aiRecommendLearningSchema), async (req, res) => {
  const { worker_id } = req.body;

  try {
    const learningPath = await recommendLearningPathway({ workerId: worker_id });

    await recordAuditLog({
      userId: req.user.id,
      actionType: 'AI_LEARNING_PATH_GENERATED',
      entityAffected: 'WORKER_LEARNING_PATH',
      details: { workerId: worker_id, targetSkill: learningPath.recommendedSkill },
    });

    res.json(learningPath);
  } catch (err) {
    console.error('AI recommend learning error:', err);
    res.status(500).json({ error: 'Learning recommendation service failed.' });
  }
});

export default router;
