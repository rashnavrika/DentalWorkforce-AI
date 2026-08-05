import { isSupabaseConfigured, supabase, mockDb } from '../config/db.js';

export const recordAuditLog = async ({ userId, actionType, entityAffected, details, ipAddress = '127.0.0.1' }) => {
  const logEntry = {
    id: `aud_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    user_id: userId || null,
    action_type: actionType,
    entity_affected: entityAffected,
    details: typeof details === 'object' ? details : { info: details },
    ip_address: ipAddress,
    created_at: new Date().toISOString(),
  };

  try {
    if (isSupabaseConfigured) {
      await supabase.from('audit_logs').insert([logEntry]);
    } else {
      mockDb.audit_logs.unshift(logEntry);
    }
  } catch (err) {
    console.error('Failed to persist audit log:', err.message);
  }

  return logEntry;
};
