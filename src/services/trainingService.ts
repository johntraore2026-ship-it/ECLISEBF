import { supabase, isSupabaseConfigured, isTableMissingError } from '../lib/supabase';
import { Course, Lesson, CourseModule, CourseEnrollment } from '../types';
import { DEMO_COURSES } from '../data/demoData';

let localDemoCourses = [...DEMO_COURSES];

let localDemoEnrollments: CourseEnrollment[] = [
  {
    id: 'enr-1',
    course_id: 'crs-1',
    member_id: 'mem-1',
    member_name: 'Jean-Baptiste Sawadogo',
    member_phone: '+226 70 12 34 56',
    enrolled_at: '2026-02-10T09:00:00Z',
    status: 'IN_PROGRESS',
    progress_percentage: 60
  },
  {
    id: 'enr-2',
    course_id: 'crs-1',
    member_id: 'mem-2',
    member_name: 'Marie Kaboré',
    member_phone: '+226 76 98 76 54',
    enrolled_at: '2026-02-12T14:30:00Z',
    status: 'ENROLLED',
    progress_percentage: 25
  },
  {
    id: 'enr-3',
    course_id: 'crs-2',
    member_id: 'mem-3',
    member_name: 'Emmanuel Zongo',
    member_phone: '+226 78 11 22 33',
    enrolled_at: '2026-01-15T10:00:00Z',
    status: 'COMPLETED',
    progress_percentage: 100
  }
];

const isValidUuid = (str?: string) =>
  Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));

export const trainingService = {
  async getCourses(churchId: string, isDemoMode = false): Promise<Course[]> {
    const filterFn = (c: Course) =>
      !churchId || c.church_id === churchId || c.church_id === 'ch-1' || !c.church_id;

    if (isDemoMode || !isSupabaseConfigured) {
      return localDemoCourses.filter(filterFn);
    }

    try {
      let query = supabase
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
        .order('created_at', { ascending: false });

      if (churchId && isValidUuid(churchId)) {
        query = query.eq('church_id', churchId);
      }

      const { data, error } = await query;

      if (error || !data || data.length === 0) {
        return localDemoCourses.filter(filterFn);
      }

      const formattedData = data.map(d => ({
        ...d,
        modules: (d.modules && d.modules.length > 0)
          ? d.modules.map((m: any) => ({
              ...m,
              lessons: m.lessons || []
            }))
          : [
              {
                id: `mod-fallback-${d.id}`,
                course_id: d.id,
                title: 'Module 1 : Généralités & Fondements',
                order_index: 1,
                lessons: []
              }
            ]
      }));

      // Merge local newly created courses that may not be in DB yet
      const dbIds = new Set(formattedData.map(d => d.id));
      const localOnly = localDemoCourses.filter(c => filterFn(c) && !dbIds.has(c.id));
      return [...formattedData, ...localOnly] as Course[];
    } catch {
      return localDemoCourses.filter(filterFn);
    }
  },

  async createCourse(
    courseData: Omit<Course, 'id' | 'created_at'>,
    isDemoMode = false
  ): Promise<Course> {
    const targetChurchId = courseData.church_id || 'ch-1';
    const courseId = `crs-demo-${Date.now()}`;
    const defaultModule: CourseModule = {
      id: `mod-demo-${Date.now()}`,
      course_id: courseId,
      title: 'Module 1 : Généralités & Fondements',
      order_index: 1,
      lessons: []
    };

    const newCourse: Course = {
      ...courseData,
      church_id: targetChurchId,
      id: courseId,
      created_at: new Date().toISOString(),
      modules: [defaultModule]
    };

    localDemoCourses = [newCourse, ...localDemoCourses];

    if (!isDemoMode && isSupabaseConfigured) {
      try {
        const insertPayload: any = { ...courseData };
        if (targetChurchId && isValidUuid(targetChurchId)) {
          insertPayload.church_id = targetChurchId;
        } else {
          delete insertPayload.church_id;
        }

        const { data, error } = await supabase
          .from('courses')
          .insert([insertPayload])
          .select()
          .single();

        if (!error && data) {
          let dbModules: CourseModule[] = [];

          try {
            const { data: modData } = await supabase
              .from('course_modules')
              .insert([{
                course_id: data.id,
                title: 'Module 1 : Généralités & Fondements',
                order_index: 1
              }])
              .select()
              .single();

            if (modData) {
              dbModules = [{
                id: modData.id,
                course_id: data.id,
                title: modData.title,
                order_index: modData.order_index,
                lessons: []
              }];
            }
          } catch (modErr) {
            console.warn('Supabase course_modules insert notice:', modErr);
          }

          if (dbModules.length === 0) {
            dbModules = [
              {
                id: `mod-demo-${Date.now()}`,
                course_id: data.id,
                title: 'Module 1 : Généralités & Fondements',
                order_index: 1,
                lessons: []
              }
            ];
          }

          const dbCourse: Course = {
            ...data,
            modules: dbModules
          };
          localDemoCourses = localDemoCourses.map(c => c.id === newCourse.id ? dbCourse : c);
          return dbCourse;
        }
      } catch (err) {
        console.warn('Supabase createCourse fallback to local memory:', err);
      }
    }

    return newCourse;
  },

  async addLesson(
    courseId: string,
    lessonData: { title: string; content: string; duration_minutes?: number; video_url?: string; audio_url?: string },
    isDemoMode = false
  ): Promise<Lesson> {
    const newLesson: Lesson = {
      id: `les-demo-${Date.now()}`,
      module_id: `mod-demo-${courseId}`,
      title: lessonData.title,
      content: lessonData.content,
      duration_minutes: lessonData.duration_minutes || 25,
      video_url: lessonData.video_url,
      audio_url: lessonData.audio_url,
      order_index: Date.now()
    };

    // Update in local memory cache
    const targetCourse = localDemoCourses.find(c => c.id === courseId);
    if (targetCourse) {
      if (!targetCourse.modules || targetCourse.modules.length === 0) {
        targetCourse.modules = [
          {
            id: `mod-demo-${courseId}`,
            course_id: courseId,
            title: 'Module 1 : Généralités & Fondements',
            order_index: 1,
            lessons: []
          }
        ];
      }
      targetCourse.modules[0].lessons = targetCourse.modules[0].lessons || [];
      targetCourse.modules[0].lessons.push(newLesson);
    }

    if (!isDemoMode && isSupabaseConfigured && isValidUuid(courseId)) {
      try {
        const { data: moduleData } = await supabase
          .from('course_modules')
          .select('id')
          .eq('course_id', courseId)
          .order('order_index', { ascending: true })
          .limit(1);

        let moduleId = moduleData && moduleData.length > 0 ? moduleData[0].id : null;

        if (!moduleId) {
          const { data: newMod } = await supabase
            .from('course_modules')
            .insert([{ course_id: courseId, title: 'Module 1 : Généralités & Fondements', order_index: 1 }])
            .select()
            .single();
          moduleId = newMod?.id;
        }

        if (moduleId) {
          const { data: insertedLesson } = await supabase
            .from('lessons')
            .insert([{
              module_id: moduleId,
              title: lessonData.title,
              content: lessonData.content,
              duration_minutes: lessonData.duration_minutes || 25,
              video_url: lessonData.video_url || null,
              audio_url: lessonData.audio_url || null,
              order_index: Date.now()
            }])
            .select()
            .single();

          if (insertedLesson) {
            const realLesson: Lesson = {
              id: insertedLesson.id,
              module_id: moduleId,
              title: insertedLesson.title,
              content: insertedLesson.content,
              duration_minutes: insertedLesson.duration_minutes,
              video_url: insertedLesson.video_url,
              audio_url: insertedLesson.audio_url,
              order_index: insertedLesson.order_index
            };
            if (targetCourse && targetCourse.modules && targetCourse.modules[0]) {
              targetCourse.modules[0].lessons = targetCourse.modules[0].lessons.map(l =>
                l.id === newLesson.id ? realLesson : l
              );
            }
            return realLesson;
          }
        }
      } catch (err) {
        console.warn('Supabase lesson insertion fallback to local memory:', err);
      }
    }

    return newLesson;
  },

  async deleteCourse(courseId: string, isDemoMode = false): Promise<void> {
    localDemoCourses = localDemoCourses.filter(c => c.id !== courseId);
    localDemoEnrollments = localDemoEnrollments.filter(e => e.course_id !== courseId);
    if (!isDemoMode && isSupabaseConfigured) {
      try {
        await supabase.from('courses').delete().eq('id', courseId);
      } catch (err) {
        console.warn('Course deletion Supabase fallback:', err);
      }
    }
  },

  async getEnrollments(courseId?: string, isDemoMode = false): Promise<CourseEnrollment[]> {
    if (isDemoMode || !isSupabaseConfigured) {
      if (courseId) return localDemoEnrollments.filter(e => e.course_id === courseId);
      return localDemoEnrollments;
    }

    try {
      let query = supabase.from('course_enrollments').select('*');
      if (courseId) query = query.eq('course_id', courseId);
      const { data, error } = await query;
      if (error || !data) {
        if (courseId) return localDemoEnrollments.filter(e => e.course_id === courseId);
        return localDemoEnrollments;
      }
      return data as CourseEnrollment[];
    } catch {
      if (courseId) return localDemoEnrollments.filter(e => e.course_id === courseId);
      return localDemoEnrollments;
    }
  },

  async enrollMember(
    courseId: string,
    memberId: string,
    memberName: string,
    memberPhone?: string,
    memberEmail?: string,
    isDemoMode = false
  ): Promise<CourseEnrollment> {
    const existing = localDemoEnrollments.find(e => e.course_id === courseId && e.member_id === memberId);
    if (existing) {
      return existing;
    }

    const newEnrollment: CourseEnrollment = {
      id: `enr-${Date.now()}`,
      course_id: courseId,
      member_id: memberId,
      member_name: memberName,
      member_phone: memberPhone,
      member_email: memberEmail,
      enrolled_at: new Date().toISOString(),
      status: 'ENROLLED',
      progress_percentage: 0
    };

    localDemoEnrollments.unshift(newEnrollment);

    if (!isDemoMode && isSupabaseConfigured) {
      try {
        await supabase.from('course_enrollments').insert([{
          course_id: courseId,
          member_id: memberId,
          member_name: memberName,
          status: 'ENROLLED',
          progress_percentage: 0
        }]);
      } catch (err) {
        console.warn('Enrollment Supabase fallback to local memory:', err);
      }
    }

    return newEnrollment;
  },

  async updateEnrollmentStatus(
    enrollmentId: string,
    status: CourseEnrollment['status'],
    progressPercentage: number,
    isDemoMode = false
  ): Promise<void> {
    const item = localDemoEnrollments.find(e => e.id === enrollmentId);
    if (item) {
      item.status = status;
      item.progress_percentage = Math.min(100, Math.max(0, progressPercentage));
    }

    if (!isDemoMode && isSupabaseConfigured) {
      try {
        await supabase
          .from('course_enrollments')
          .update({ status, progress_percentage: progressPercentage })
          .eq('id', enrollmentId);
      } catch (err) {
        console.warn('Enrollment update fallback:', err);
      }
    }
  },

  async removeEnrollment(enrollmentId: string, isDemoMode = false): Promise<void> {
    localDemoEnrollments = localDemoEnrollments.filter(e => e.id !== enrollmentId);
    if (!isDemoMode && isSupabaseConfigured) {
      try {
        await supabase.from('course_enrollments').delete().eq('id', enrollmentId);
      } catch (err) {
        console.warn('Enrollment deletion fallback:', err);
      }
    }
  }
};

