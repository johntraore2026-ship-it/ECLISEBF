import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { MediaItem } from '../types';
import { DEMO_MEDIA } from '../data/demoData';

let localDemoMedia = [...DEMO_MEDIA];

export const mediaService = {
  async getMedia(churchId: string, isDemoMode = false): Promise<MediaItem[]> {
    if (isDemoMode || !isSupabaseConfigured) {
      return localDemoMedia.filter(m => m.church_id === churchId);
    }

    const { data, error } = await supabase
      .from('media')
      .select('*')
      .eq('church_id', churchId)
      .order('media_date', { ascending: false });

    if (error) {
      throw new Error(`Erreur médias : ${error.message}`);
    }

    return (data || []) as MediaItem[];
  },

  async createMedia(
    mediaData: Omit<MediaItem, 'id' | 'created_at' | 'views_count'>,
    isDemoMode = false
  ): Promise<MediaItem> {
    if (isDemoMode || !isSupabaseConfigured) {
      const newMedia: MediaItem = {
        ...mediaData,
        id: `med-demo-${Date.now()}`,
        views_count: 0,
        created_at: new Date().toISOString(),
      };
      localDemoMedia = [newMedia, ...localDemoMedia];
      return newMedia;
    }

    const { data, error } = await supabase
      .from('media')
      .insert([{ ...mediaData, views_count: 0 }])
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur publication média : ${error.message}`);
    }

    return data as MediaItem;
  }
};
