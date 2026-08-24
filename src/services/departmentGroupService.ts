import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Department, Group } from '../types';
import { DEMO_DEPARTMENTS, DEMO_GROUPS } from '../data/demoData';

let localDemoDepartments = [...DEMO_DEPARTMENTS];
let localDemoGroups = [...DEMO_GROUPS];

export const departmentGroupService = {
  async getDepartments(churchId: string, isDemoMode = false): Promise<Department[]> {
    if (isDemoMode || !isSupabaseConfigured) {
      return localDemoDepartments.filter(d => d.church_id === churchId);
    }

    const { data, error } = await supabase
      .from('departments')
      .select(`
        *,
        leader:members(first_name, last_name)
      `)
      .eq('church_id', churchId)
      .order('name');

    if (error) {
      if (error.code === '42P01' || error.message.includes('does not exist') || error.message.includes('404')) {
        return localDemoDepartments.filter(d => d.church_id === churchId);
      }
      throw new Error(`Erreur départements : ${error.message}`);
    }

    return (data || []).map(d => ({
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

    const { data, error } = await supabase
      .from('groups')
      .select(`
        *,
        leader:members(first_name, last_name)
      `)
      .eq('church_id', churchId)
      .order('name');

    if (error) {
      if (error.code === '42P01' || error.message.includes('does not exist') || error.message.includes('404')) {
        return localDemoGroups.filter(g => g.church_id === churchId);
      }
      throw new Error(`Erreur groupes : ${error.message}`);
    }

    return (data || []).map(g => ({
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
