import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Course, Certificate } from '../types';
import { DEMO_COURSES } from '../data/demoData';

let localDemoCourses = [...DEMO_COURSES];

export const trainingService = {
  async getCourses(churchId: string, isDemoMode = false): Promise<Course[]> {
    if (isDemoMode || !isSupabaseConfigured) {
      return localDemoCourses.filter(c => c.church_id === churchId);
    }

    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        modules:course_modules(
          id,
          title,
          order_index,
          lessons(id, title, content, video_url, audio_url, duration_minutes, order_index)
        )
      `)
      .eq('church_id', churchId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erreur cours : ${error.message}`);
    }

    return (data || []) as Course[];
  },

  async createCourse(
    courseData: Omit<Course, 'id' | 'created_at'>,
    isDemoMode = false
  ): Promise<Course> {
    if (isDemoMode || !isSupabaseConfigured) {
      const newCourse: Course = {
        ...courseData,
        id: `crs-demo-${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      localDemoCourses.push(newCourse);
      return newCourse;
    }

    const { data, error } = await supabase
      .from('courses')
      .insert([courseData])
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur création cours : ${error.message}`);
    }

    return data as Course;
  }
};
