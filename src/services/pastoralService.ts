import { supabase, isSupabaseConfigured, isTableMissingError } from '../lib/supabase';
import { PastoralRecord, PastoralVisit, PrayerRequest } from '../types';
import { DEMO_PASTORAL_RECORDS, DEMO_PASTORAL_VISITS, DEMO_PRAYER_REQUESTS } from '../data/demoData';

let localDemoRecords = [...DEMO_PASTORAL_RECORDS];
let localDemoVisits = [...DEMO_PASTORAL_VISITS];
let localDemoRequests = [...DEMO_PRAYER_REQUESTS];

export const pastoralService = {
  async getRecords(churchId: string, isDemoMode = false): Promise<PastoralRecord[]> {
    if (isDemoMode || !isSupabaseConfigured) {
      return localDemoRecords.filter(r => r.church_id === churchId);
    }

    let data: any = null;
    let error: any = null;

    try {
      const res = await supabase
        .from('pastoral_records')
        .select(`
          *,
          member:members(first_name, last_name)
        `)
        .eq('church_id', churchId)
        .order('created_at', { ascending: false });

      if (res.error) {
        const simpleRes = await supabase
          .from('pastoral_records')
          .select('*')
          .eq('church_id', churchId)
          .order('created_at', { ascending: false });
        data = simpleRes.data;
        error = simpleRes.error;
      } else {
        data = res.data;
        error = res.error;
      }
    } catch (e: any) {
      error = e;
    }

    if (error) {
      console.warn('Supabase pastoral_records notice (using local fallback):', error.message || error);
      return localDemoRecords.filter(r => r.church_id === churchId);
    }

    return (data || []).map((item: any) => ({
      ...item,
      member_name: item.member ? `${item.member.first_name} ${item.member.last_name}` : item.member_name,
      pastor_name: item.pastor_name || undefined,
    })) as PastoralRecord[];
  },

  async createRecord(
    recordData: Omit<PastoralRecord, 'id' | 'created_at' | 'updated_at'>,
    isDemoMode = false
  ): Promise<PastoralRecord> {
    if (isDemoMode || !isSupabaseConfigured) {
      const newRec: PastoralRecord = {
        ...recordData,
        id: `pr-demo-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      localDemoRecords = [newRec, ...localDemoRecords];
      return newRec;
    }

    const { data, error } = await supabase
      .from('pastoral_records')
      .insert([recordData])
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur lors de l'enregistrement pastoral : ${error.message}`);
    }

    return data as PastoralRecord;
  },

  async getVisits(churchId: string, isDemoMode = false): Promise<PastoralVisit[]> {
    if (isDemoMode || !isSupabaseConfigured) {
      return localDemoVisits.filter(v => v.church_id === churchId);
    }

    const { data, error } = await supabase
      .from('pastoral_visits')
      .select(`
        *,
        member:members(first_name, last_name)
      `)
      .eq('church_id', churchId)
      .order('visit_date', { ascending: false });

    if (error) {
      if (isTableMissingError(error)) {
        console.warn('Supabase pastoral_visits notice (using local fallback):', error.message || error);
        return localDemoVisits.filter(v => v.church_id === churchId);
      }
      throw new Error(`Erreur lors du chargement des visites : ${error.message}`);
    }

    return (data || []).map(v => ({
      ...v,
      member_name: v.member ? `${v.member.first_name} ${v.member.last_name}` : v.member_name,
    })) as PastoralVisit[];
  },

  async createVisit(
    visitData: Omit<PastoralVisit, 'id' | 'created_at'>,
    isDemoMode = false
  ): Promise<PastoralVisit> {
    if (isDemoMode || !isSupabaseConfigured) {
      const newVisit: PastoralVisit = {
        ...visitData,
        id: `pv-demo-${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      localDemoVisits = [newVisit, ...localDemoVisits];
      return newVisit;
    }

    const { data, error } = await supabase
      .from('pastoral_visits')
      .insert([visitData])
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur lors de l'enregistrement de la visite : ${error.message}`);
    }

    return data as PastoralVisit;
  },

  async getPrayerRequests(churchId: string, isDemoMode = false): Promise<PrayerRequest[]> {
    if (isDemoMode || !isSupabaseConfigured) {
      return localDemoRequests.filter(r => r.church_id === churchId);
    }

    const { data, error } = await supabase
      .from('prayer_requests')
      .select('*')
      .eq('church_id', churchId)
      .order('created_at', { ascending: false });

    if (error) {
      if (isTableMissingError(error)) {
        console.warn('Supabase prayer_requests notice (using local fallback):', error.message || error);
        return localDemoRequests.filter(r => r.church_id === churchId);
      }
      throw new Error(`Erreur requêtes de prière : ${error.message}`);
    }

    return (data || []) as PrayerRequest[];
  },

  async createPrayerRequest(
    reqData: Omit<PrayerRequest, 'id' | 'created_at' | 'updated_at'>,
    isDemoMode = false
  ): Promise<PrayerRequest> {
    if (isDemoMode || !isSupabaseConfigured) {
      const newReq: PrayerRequest = {
        ...reqData,
        id: `prq-demo-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      localDemoRequests = [newReq, ...localDemoRequests];
      return newReq;
    }

    const { data, error } = await supabase
      .from('prayer_requests')
      .insert([reqData])
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur lors de la soumission de la prière : ${error.message}`);
    }

    return data as PrayerRequest;
  },

  async updatePrayerStatus(id: string, status: PrayerRequest['status'], isDemoMode = false): Promise<void> {
    if (isDemoMode || !isSupabaseConfigured) {
      const item = localDemoRequests.find(r => r.id === id);
      if (item) item.status = status;
      return;
    }

    const { error } = await supabase
      .from('prayer_requests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw new Error(`Erreur mise à jour prière : ${error.message}`);
    }
  }
};
