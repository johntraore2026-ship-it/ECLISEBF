import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Church, Profile } from '../types';
import { DEMO_CHURCH, DEMO_CHURCHES_LIST } from '../data/demoData';

export interface RegisterChurchParams {
  church_name: string;
  city: string;
  neighborhood?: string;
  address?: string;
  phone: string;
  email: string;
  pastor_name: string;
  description?: string;
  first_name: string;
  last_name: string;
  password?: string;
}

export const churchService = {
  async getChurch(churchId: string, isDemoMode = false): Promise<Church> {
    if (isDemoMode || !isSupabaseConfigured) {
      const found = DEMO_CHURCHES_LIST.find(c => c.id === churchId) || DEMO_CHURCH;
      return found;
    }

    try {
      const { data, error } = await supabase
        .from('churches')
        .select('*')
        .eq('id', churchId)
        .single();

      if (error || !data) {
        console.warn('Notice getChurch fallback to default church:', error?.message);
        return DEMO_CHURCHES_LIST.find(c => c.id === churchId) || DEMO_CHURCH;
      }

      return data as Church;
    } catch {
      return DEMO_CHURCHES_LIST.find(c => c.id === churchId) || DEMO_CHURCH;
    }
  },

  async listChurches(isDemoMode = false): Promise<Church[]> {
    if (isDemoMode || !isSupabaseConfigured) {
      return DEMO_CHURCHES_LIST;
    }

    try {
      const { data, error } = await supabase
        .from('churches')
        .select('*')
        .order('name');

      if (error || !data || data.length === 0) {
        return DEMO_CHURCHES_LIST;
      }

      return data as Church[];
    } catch {
      return DEMO_CHURCHES_LIST;
    }
  },

  async registerChurch(params: RegisterChurchParams, isDemoMode = false): Promise<{ success: boolean; church_id: string; church?: Church }> {
    if (isDemoMode || !isSupabaseConfigured) {
      const newChurch: Church = {
        id: `c-demo-${Date.now()}`,
        name: params.church_name,
        slug: params.church_name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000),
        city: params.city,
        neighborhood: params.neighborhood,
        address: params.address,
        phone: params.phone,
        email: params.email,
        pastor_name: params.pastor_name,
        description: params.description,
        status: 'ACTIVE',
        currency: 'XOF',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      DEMO_CHURCHES_LIST.push(newChurch);
      return { success: true, church_id: newChurch.id, church: newChurch };
    }

    // Call PostgreSQL stored procedure `register_church`
    const { data, error } = await supabase.rpc('register_church', {
      p_church_name: params.church_name,
      p_city: params.city,
      p_pastor_name: params.pastor_name,
      p_phone: params.phone,
      p_email: params.email,
      p_first_name: params.first_name,
      p_last_name: params.last_name,
    });

    if (error) {
      throw new Error(`Erreur lors de l'enregistrement de l'église : ${error.message}`);
    }

    return {
      success: true,
      church_id: data.church_id,
    };
  },

  async updateChurch(churchId: string, updates: Partial<Church>, isDemoMode = false): Promise<Church> {
    if (isDemoMode || !isSupabaseConfigured) {
      const church = DEMO_CHURCHES_LIST.find(c => c.id === churchId) || DEMO_CHURCH;
      Object.assign(church, updates, { updated_at: new Date().toISOString() });
      return church;
    }

    const { data, error } = await supabase
      .from('churches')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', churchId)
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur lors de la mise à jour de l'église : ${error.message}`);
    }

    return data as Church;
  }
};
