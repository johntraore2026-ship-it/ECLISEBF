import { supabase, isSupabaseConfigured, isTableMissingError } from '../lib/supabase';
import { MediaItem, MediaCategory } from '../types';
import { DEMO_MEDIA } from '../data/demoData';

let localDemoMedia = [...DEMO_MEDIA];

let localDemoCategories: MediaCategory[] = [
  { id: 'cat-1', name: 'Prédications & Sermons', code: 'SERMON', description: 'Cultes dominicaux, réunions de réveil et messages vidéo' },
  { id: 'cat-2', name: 'Enseignements Audio', code: 'AUDIO_TEACHING', description: 'Audio et baladodiffusion biblique' },
  { id: 'cat-3', name: 'Ressources Éducatives & Guides', code: 'EDUCATIONAL_RESOURCE', description: 'Manuels d’étude, cours bibliques et guides d’affermissement' },
  { id: 'cat-4', name: 'Bulletins & Publications', code: 'BULLETIN', description: 'Communiation paroissiale et gazettes mensuelles' },
  { id: 'cat-5', name: 'Archives Photo & Événements', code: 'PHOTO', description: 'Galeries et reportages des célébrations' },
  { id: 'cat-6', name: 'Directs & Livestream', code: 'LIVESTREAM', description: 'Rediffusion en direct des culte' }
];

export const mediaService = {
  async getCategories(churchId?: string, isDemoMode = false): Promise<MediaCategory[]> {
    if (isDemoMode || !isSupabaseConfigured) {
      return localDemoCategories;
    }

    try {
      const { data, error } = await supabase.from('media_categories').select('*');
      if (error || !data) return localDemoCategories;
      return data as MediaCategory[];
    } catch {
      return localDemoCategories;
    }
  },

  async createCategory(cat: Omit<MediaCategory, 'id'>, isDemoMode = false): Promise<MediaCategory> {
    const newCat: MediaCategory = {
      ...cat,
      id: `cat-${Date.now()}`
    };
    localDemoCategories.push(newCat);

    if (!isDemoMode && isSupabaseConfigured) {
      try {
        await supabase.from('media_categories').insert([cat]);
      } catch (err) {
        console.warn('Category creation Supabase fallback:', err);
      }
    }
    return newCat;
  },

  async deleteCategory(catId: string, isDemoMode = false): Promise<void> {
    localDemoCategories = localDemoCategories.filter(c => c.id !== catId);
    if (!isDemoMode && isSupabaseConfigured) {
      try {
        await supabase.from('media_categories').delete().eq('id', catId);
      } catch (err) {
        console.warn('Category deletion Supabase fallback:', err);
      }
    }
  },

  async getMedia(churchId: string, isDemoMode = false): Promise<MediaItem[]> {
    if (isDemoMode || !isSupabaseConfigured) {
      return localDemoMedia.filter(m => m.church_id === churchId);
    }

    try {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .eq('church_id', churchId)
        .order('media_date', { ascending: false });

      if (error) {
        if (isTableMissingError(error)) {
          console.warn('Supabase media notice (using local fallback):', error.message || error);
          return localDemoMedia.filter(m => m.church_id === churchId);
        }
        return localDemoMedia.filter(m => m.church_id === churchId);
      }

      return (data || []) as MediaItem[];
    } catch {
      return localDemoMedia.filter(m => m.church_id === churchId);
    }
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

    try {
      const { data, error } = await supabase
        .from('media')
        .insert([{ ...mediaData, views_count: 0 }])
        .select()
        .single();

      if (error) {
        if (isTableMissingError(error)) {
          const newMedia: MediaItem = {
            ...mediaData,
            id: `med-demo-${Date.now()}`,
            views_count: 0,
            created_at: new Date().toISOString(),
          };
          localDemoMedia = [newMedia, ...localDemoMedia];
          return newMedia;
        }
        throw new Error(`Erreur publication média : ${error.message}`);
      }

      return data as MediaItem;
    } catch (err: any) {
      const newMedia: MediaItem = {
        ...mediaData,
        id: `med-demo-${Date.now()}`,
        views_count: 0,
        created_at: new Date().toISOString(),
      };
      localDemoMedia = [newMedia, ...localDemoMedia];
      return newMedia;
    }
  },

  async deleteMedia(mediaId: string, isDemoMode = false): Promise<void> {
    localDemoMedia = localDemoMedia.filter(m => m.id !== mediaId);
    if (!isDemoMode && isSupabaseConfigured) {
      try {
        await supabase.from('media').delete().eq('id', mediaId);
      } catch (err) {
        console.warn('Media deletion Supabase fallback:', err);
      }
    }
  }
};

