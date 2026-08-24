import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Member } from '../types';
import { DEMO_MEMBERS } from '../data/demoData';

let localDemoMembers = [...DEMO_MEMBERS];

export interface MemberQueryFilters {
  departmentId?: string;
  groupId?: string;
  baptismStatus?: string;
  spiritualStatus?: string;
  gender?: string;
  activityStatus?: string;
  searchQuery?: string;
}

export const memberService = {
  async getMembers(
    churchId: string,
    isDemoMode = false,
    filters?: MemberQueryFilters
  ): Promise<Member[]> {
    if (isDemoMode || !isSupabaseConfigured) {
      let filtered = localDemoMembers.filter(m => m.church_id === churchId);
      
      if (filters?.departmentId && filters.departmentId !== 'ALL') {
        filtered = filtered.filter(m => m.department_id === filters.departmentId || m.department_name === filters.departmentId);
      }
      if (filters?.groupId && filters.groupId !== 'ALL') {
        filtered = filtered.filter(m => m.group_id === filters.groupId || m.group_name === filters.groupId);
      }
      if (filters?.baptismStatus && filters.baptismStatus !== 'ALL') {
        if (filters.baptismStatus === 'WATER_BAPTIZED') {
          filtered = filtered.filter(m => Boolean(m.baptism_date) || ['BAPTIZED', 'COMMUNICANT', 'WORKER', 'DEACON', 'ELDER', 'PASTOR'].includes(m.spiritual_status));
        } else if (filters.baptismStatus === 'NOT_BAPTIZED') {
          filtered = filtered.filter(m => !m.baptism_date && ['NEW_CONVERT', 'INQUIRER'].includes(m.spiritual_status));
        } else if (filters.baptismStatus === 'HOLY_SPIRIT_BAPTIZED') {
          filtered = filtered.filter(m => Boolean(m.holy_spirit_baptized));
        }
      }
      if (filters?.spiritualStatus && filters.spiritualStatus !== 'ALL') {
        filtered = filtered.filter(m => m.spiritual_status === filters.spiritualStatus);
      }
      if (filters?.gender && filters.gender !== 'ALL') {
        filtered = filtered.filter(m => m.gender === filters.gender);
      }
      if (filters?.activityStatus && filters.activityStatus !== 'ALL') {
        if (filters.activityStatus === 'ACTIVE') filtered = filtered.filter(m => m.is_active);
        if (filters.activityStatus === 'INACTIVE') filtered = filtered.filter(m => !m.is_active);
      }
      if (filters?.searchQuery && filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        filtered = filtered.filter(m =>
          `${m.first_name || ''} ${m.last_name || ''}`.toLowerCase().includes(q) ||
          (m.phone || '').toLowerCase().includes(q) ||
          (m.email || '').toLowerCase().includes(q) ||
          (m.neighborhood || '').toLowerCase().includes(q) ||
          (m.profession || '').toLowerCase().includes(q)
        );
      }

      return filtered;
    }

    let query = supabase
      .from('members')
      .select('*')
      .eq('church_id', churchId);

    // Apply Supabase server-side query filters
    if (filters?.departmentId && filters.departmentId !== 'ALL') {
      query = query.eq('department_id', filters.departmentId);
    }

    if (filters?.groupId && filters.groupId !== 'ALL') {
      query = query.eq('group_id', filters.groupId);
    }

    if (filters?.baptismStatus && filters.baptismStatus !== 'ALL') {
      if (filters.baptismStatus === 'WATER_BAPTIZED') {
        query = query.not('baptism_date', 'is', null);
      } else if (filters.baptismStatus === 'NOT_BAPTIZED') {
        query = query.is('baptism_date', null);
      } else if (filters.baptismStatus === 'HOLY_SPIRIT_BAPTIZED') {
        query = query.eq('holy_spirit_baptized', true);
      }
    }

    if (filters?.spiritualStatus && filters.spiritualStatus !== 'ALL') {
      query = query.eq('spiritual_status', filters.spiritualStatus);
    }

    if (filters?.gender && filters.gender !== 'ALL') {
      query = query.eq('gender', filters.gender);
    }

    if (filters?.activityStatus && filters.activityStatus !== 'ALL') {
      if (filters.activityStatus === 'ACTIVE') {
        query = query.eq('is_active', true);
      } else if (filters.activityStatus === 'INACTIVE') {
        query = query.eq('is_active', false);
      }
    }

    if (filters?.searchQuery && filters.searchQuery.trim()) {
      const term = `%${filters.searchQuery.trim()}%`;
      query = query.or(`first_name.ilike.${term},last_name.ilike.${term},phone.ilike.${term},email.ilike.${term},neighborhood.ilike.${term}`);
    }

    query = query.order('last_name', { ascending: true });

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erreur lors du chargement des membres : ${error.message}`);
    }

    return (data || []) as Member[];
  },

  async getMemberById(id: string, churchId: string, isDemoMode = false): Promise<Member | null> {
    if (isDemoMode || !isSupabaseConfigured) {
      return localDemoMembers.find(m => m.id === id && m.church_id === churchId) || null;
    }

    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('id', id)
      .eq('church_id', churchId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Erreur membre : ${error.message}`);
    }

    return data as Member;
  },

  async createMember(memberData: Omit<Member, 'id' | 'created_at' | 'updated_at'>, isDemoMode = false): Promise<Member> {
    if (isDemoMode || !isSupabaseConfigured) {
      const newMember: Member = {
        ...memberData,
        id: `m-demo-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      localDemoMembers = [newMember, ...localDemoMembers];
      return newMember;
    }

    const { data, error } = await supabase
      .from('members')
      .insert([memberData])
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur lors de l'ajout du membre : ${error.message}`);
    }

    return data as Member;
  },

  async updateMember(id: string, updates: Partial<Member>, churchId: string, isDemoMode = false): Promise<Member> {
    if (isDemoMode || !isSupabaseConfigured) {
      const idx = localDemoMembers.findIndex(m => m.id === id && m.church_id === churchId);
      if (idx === -1) throw new Error('Membre introuvable');
      const updated = {
        ...localDemoMembers[idx],
        ...updates,
        updated_at: new Date().toISOString()
      };
      localDemoMembers[idx] = updated;
      return updated;
    }

    const { data, error } = await supabase
      .from('members')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('church_id', churchId)
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur lors de la modification du membre : ${error.message}`);
    }

    return data as Member;
  },

  async deleteMember(id: string, churchId: string, isDemoMode = false): Promise<void> {
    if (isDemoMode || !isSupabaseConfigured) {
      localDemoMembers = localDemoMembers.filter(m => !(m.id === id && m.church_id === churchId));
      return;
    }

    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', id)
      .eq('church_id', churchId);

    if (error) {
      throw new Error(`Erreur lors de la suppression du membre : ${error.message}`);
    }
  }
};
