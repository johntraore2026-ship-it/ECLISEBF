import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ChurchEvent, Announcement } from '../types';
import { DEMO_EVENTS, DEMO_ANNOUNCEMENTS } from '../data/demoData';

let localDemoEvents = [...DEMO_EVENTS];
let localDemoAnnouncements = [...DEMO_ANNOUNCEMENTS];

export const eventAnnouncementService = {
  async getEvents(churchId: string, isDemoMode = false): Promise<ChurchEvent[]> {
    if (isDemoMode || !isSupabaseConfigured) {
      return localDemoEvents.filter(e => e.church_id === churchId);
    }

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('church_id', churchId)
      .order('start_date', { ascending: true });

    if (error) {
      throw new Error(`Erreur événements : ${error.message}`);
    }

    return (data || []) as ChurchEvent[];
  },

  async createEvent(
    eventData: Omit<ChurchEvent, 'id' | 'created_at'>,
    isDemoMode = false
  ): Promise<ChurchEvent> {
    if (isDemoMode || !isSupabaseConfigured) {
      const newEv: ChurchEvent = {
        ...eventData,
        id: `ev-demo-${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      localDemoEvents = [newEv, ...localDemoEvents];
      return newEv;
    }

    const { data, error } = await supabase
      .from('events')
      .insert([eventData])
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur création événement : ${error.message}`);
    }

    return data as ChurchEvent;
  },

  async getAnnouncements(churchId: string, isDemoMode = false): Promise<Announcement[]> {
    if (isDemoMode || !isSupabaseConfigured) {
      return localDemoAnnouncements.filter(a => a.church_id === churchId);
    }

    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('church_id', churchId)
      .order('is_pinned', { ascending: false })
      .order('published_at', { ascending: false });

    if (error) {
      throw new Error(`Erreur annonces : ${error.message}`);
    }

    return (data || []) as Announcement[];
  },

  async createAnnouncement(
    annData: Omit<Announcement, 'id'>,
    isDemoMode = false
  ): Promise<Announcement> {
    if (isDemoMode || !isSupabaseConfigured) {
      const newAnn: Announcement = {
        ...annData,
        id: `ann-demo-${Date.now()}`,
      };
      localDemoAnnouncements = [newAnn, ...localDemoAnnouncements];
      return newAnn;
    }

    const { data, error } = await supabase
      .from('announcements')
      .insert([annData])
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur publication annonce : ${error.message}`);
    }

    return data as Announcement;
  }
};
