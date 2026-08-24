import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AttendanceSession, AttendanceRecord } from '../types';
import { DEMO_ATTENDANCE } from '../data/demoData';

let localDemoAttendance = [...DEMO_ATTENDANCE];

export const attendanceService = {
  async getSessions(churchId: string, isDemoMode = false): Promise<AttendanceSession[]> {
    if (isDemoMode || !isSupabaseConfigured) {
      return localDemoAttendance
        .filter(s => s.church_id === churchId)
        .sort((a, b) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime());
    }

    const { data, error } = await supabase
      .from('attendance_sessions')
      .select('*')
      .eq('church_id', churchId)
      .order('session_date', { ascending: false });

    if (error) {
      if (error.code === '42P01' || error.message.includes('does not exist') || error.message.includes('404')) {
        return localDemoAttendance
          .filter(s => s.church_id === churchId)
          .sort((a, b) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime());
      }
      throw new Error(`Erreur lors du chargement des cultes : ${error.message}`);
    }

    return (data || []) as AttendanceSession[];
  },

  async createSession(
    sessionData: Omit<AttendanceSession, 'id' | 'created_at' | 'total_count'>,
    isDemoMode = false
  ): Promise<AttendanceSession> {
    const total_count =
      Number(sessionData.men_count || 0) +
      Number(sessionData.women_count || 0) +
      Number(sessionData.children_count || 0) +
      Number(sessionData.visitors_count || 0);

    if (isDemoMode || !isSupabaseConfigured) {
      const newSession: AttendanceSession = {
        ...sessionData,
        id: `att-demo-${Date.now()}`,
        total_count,
        created_at: new Date().toISOString(),
      };
      localDemoAttendance = [newSession, ...localDemoAttendance];
      return newSession;
    }

    const { data, error } = await supabase
      .from('attendance_sessions')
      .insert([{ ...sessionData, total_count }])
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur lors de l'enregistrement du culte : ${error.message}`);
    }

    return data as AttendanceSession;
  }
};
