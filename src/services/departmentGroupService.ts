import { supabase, isSupabaseConfigured, isTableMissingError } from '../lib/supabase';
import { Department, Group } from '../types';
import { DEMO_DEPARTMENTS, DEMO_GROUPS } from '../data/demoData';

let localDemoDepartments = [...DEMO_DEPARTMENTS];
let localDemoGroups = [...DEMO_GROUPS];

export const departmentGroupService = {
  async getDepartments(churchId: string, isDemoMode = false): Promise<Department[]> {
    if (isDemoMode || !isSupabaseConfigured) {
      return localDemoDepartments.filter(d => d.church_id === churchId);
    }

    let data: any = null;
    let error: any = null;

    try {
      const res = await supabase
        .from('departments')
        .select(`
          *,
          leader:members(first_name, last_name)
        `)
        .eq('church_id', churchId)
        .order('name');

      if (res.error) {
        // Fallback to simple query if relationship join fails
        const simpleRes = await supabase
          .from('departments')
          .select('*')
          .eq('church_id', churchId)
          .order('name');

        data = simpleRes.data;
        error = simpleRes.error;
      } else {
        data = res.data;
        error = res.error;
      }
    } catch (err: any) {
      error = err;
    }

    if (error) {
      if (isTableMissingError(error)) {
        console.warn('Supabase departments notice (using local fallback):', error.message || error);
        return localDemoDepartments.filter(d => d.church_id === churchId);
      }
      throw new Error(`Erreur départements : ${error.message || error}`);
    }

    return (data || []).map((d: any) => ({
      ...d,
      leader_name: d.leader ? `${d.leader.first_name} ${d.leader.last_name}` : d.leader_name,
    })) as Department[];
  },

  async createDepartment(
    deptData: Omit<Department, 'id' | 'created_at' | 'updated_at'>,
    isDemoMode = false
  ): Promise<Department> {
    if (isDemoMode || !isSupabaseConfigured) {
      const newDept: Department = {
        ...deptData,
        id: `d-demo-${Date.now()}`,
        member_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      localDemoDepartments.push(newDept);
      return newDept;
    }

    const { data, error } = await supabase
      .from('departments')
      .insert([deptData])
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur création département : ${error.message}`);
    }

    return data as Department;
  },

  async getGroups(churchId: string, isDemoMode = false): Promise<Group[]> {
    if (isDemoMode || !isSupabaseConfigured) {
      return localDemoGroups.filter(g => g.church_id === churchId);
    }

    let data: any = null;
    let error: any = null;

    try {
      const res = await supabase
        .from('groups')
        .select(`
          *,
          leader:members(first_name, last_name)
        `)
        .eq('church_id', churchId)
        .order('name');

      if (res.error) {
        // Fallback to simple query if relationship join fails
        const simpleRes = await supabase
          .from('groups')
          .select('*')
          .eq('church_id', churchId)
          .order('name');

        data = simpleRes.data;
        error = simpleRes.error;
      } else {
        data = res.data;
        error = res.error;
      }
    } catch (err: any) {
      error = err;
    }

    if (error) {
      if (isTableMissingError(error)) {
        console.warn('Supabase groups notice (using local fallback):', error.message || error);
        return localDemoGroups.filter(g => g.church_id === churchId);
      }
      throw new Error(`Erreur groupes : ${error.message || error}`);
    }

    return (data || []).map((g: any) => ({
      ...g,
      leader_name: g.leader ? `${g.leader.first_name} ${g.leader.last_name}` : g.leader_name,
    })) as Group[];
  },

  async createGroup(
    groupData: Omit<Group, 'id' | 'created_at' | 'updated_at'>,
    isDemoMode = false
  ): Promise<Group> {
    if (isDemoMode || !isSupabaseConfigured) {
      const newGroup: Group = {
        ...groupData,
        id: `g-demo-${Date.now()}`,
        member_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      localDemoGroups.push(newGroup);
      return newGroup;
    }

    const { data, error } = await supabase
      .from('groups')
      .insert([groupData])
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur création cellule : ${error.message}`);
    }

    return data as Group;
  }
};
