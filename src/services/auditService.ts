import { supabase, isSupabaseConfigured, isTableMissingError } from '../lib/supabase';
import { AuditLog } from '../types';
import { DEMO_AUDIT_LOGS } from '../data/demoData';

let localDemoLogs = [...DEMO_AUDIT_LOGS];

export const auditService = {
  async getLogs(churchId: string, isDemoMode = false): Promise<AuditLog[]> {
    if (isDemoMode || !isSupabaseConfigured) {
      return localDemoLogs.filter(l => l.church_id === churchId);
    }

    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('church_id', churchId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      if (isTableMissingError(error)) {
        console.warn('Supabase audit_logs notice (using local fallback):', error.message || error);
        return localDemoLogs.filter(l => l.church_id === churchId);
      }
      throw new Error(`Erreur journal d'audit : ${error.message}`);
    }

    return (data || []) as AuditLog[];
  },

  async logAction(
    logData: Omit<AuditLog, 'id' | 'created_at'>,
    isDemoMode = false
  ): Promise<void> {
    if (isDemoMode || !isSupabaseConfigured) {
      localDemoLogs.unshift({
        ...logData,
        id: `log-demo-${Date.now()}`,
        created_at: new Date().toISOString(),
      });
      return;
    }

    await supabase.from('audit_logs').insert([logData]);
  }
};
