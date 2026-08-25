import React, { useState } from 'react';
import { X, GraduationCap, BookOpen, Plus, Clock, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { z } from 'zod';
import { Course } from '../../types';
import { useToast } from '../../contexts/ToastContext';

// Zod Validation Schemas
export const courseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Le titre du cursus doit contenir au moins 3 caractères.')
    .max(150, 'Le titre ne peut pas dépasser 150 caractères.'),
  description: z
    .string()
    .trim()
    .min(5, 'Veuillez rédiger une description minimale (au moins 5 caractères).')
    .max(1000, 'La description ne peut pas dépasser 1000 caractères.'),
  instructor_name: z
    .string()
    .trim()
    .min(2, 'Le nom du formateur référent est requis (min. 2 caractères).'),
  level: z.enum(['FOUNDATION', 'INTERMEDIATE', 'ADVANCED', 'LEADERSHIP']),
  duration_weeks: z
    .number()
    .min(1, 'La durée minimale est de 1 semaine.')
    .max(52, 'La durée maximale est de 52 semaines.'),
  is_published: z.boolean(),
  church_id: z.string().min(1, "L'identifiant d'église est requis."),
});

export const lessonSchema = z.object({
  course_id: z.string().min(1, 'Veuillez sélectionner un cursus rattaché.'),
  title: z
    .string()
    .trim()
    .min(3, 'Le titre de la leçon doit comporter au moins 3 caractères.')
    .max(200, 'Le titre ne peut pas dépasser 200 caractères.'),
  content: z
    .string()
    .trim()
    .min(10, 'Le contenu théologique doit comporter au moins 10 caractères.'),
  duration_minutes: z
    .number()
    .min(1, 'Durée minimale : 1 minute.')
    .max(300, 'Durée maximale : 300 minutes.'),
  video_url: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || /^https?:\/\/.+/i.test(val), {
      message: "L'URL vidéo doit être un lien HTTPS valide (ex: https://...)",
    }),
  audio_url: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || /^https?:\/\/.+/i.test(val), {
      message: "L'URL audio doit être un lien HTTPS valide (ex: https://...)",
    }),
});

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCourse: (courseData: Omit<Course, 'id' | 'created_at'>) => Promise<void>;
  onSaveLesson: (courseId: string, lessonData: { title: string; content: string; duration_minutes?: number; video_url?: string; audio_url?: string }) => Promise<void>;
  existingCourses: Course[];
  churchId: string;
}

export const CourseModal: React.FC<CourseModalProps> = ({
  isOpen,
  onClose,
  onSaveCourse,
  onSaveLesson,
  existingCourses,
  churchId,
}) => {
  const { toast } = useToast();
  const [tab, setTab] = useState<'COURSE' | 'LESSON'>('COURSE');
  const [loading, setLoading] = useState(false);

  // Validation Errors State
  const [courseErrors, setCourseErrors] = useState<Record<string, string>>({});
  const [lessonErrors, setLessonErrors] = useState<Record<string, string>>({});

  // Course Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructorName, setInstructorName] = useState('');
  const [level, setLevel] = useState<'FOUNDATION' | 'INTERMEDIATE' | 'ADVANCED' | 'LEADERSHIP'>('FOUNDATION');
  const [durationWeeks, setDurationWeeks] = useState<number>(6);
  const [isPublished, setIsPublished] = useState(true);

  // Lesson Form State
  const [selectedCourseId, setSelectedCourseId] = useState<string>(existingCourses[0]?.id || '');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [videoUrl, setVideoUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      setTab('COURSE');
      setLoading(false);
      setCourseErrors({});
      setLessonErrors({});
    }
  }, [isOpen]);

  React.useEffect(() => {
    if (existingCourses.length > 0 && (!selectedCourseId || !existingCourses.some(c => c.id === selectedCourseId))) {
      setSelectedCourseId(existingCourses[0].id);
    }
  }, [existingCourses, selectedCourseId]);

  if (!isOpen) return null;

  const handleSubmitCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setCourseErrors({});

    const rawPayload = {
      title,
      description,
      instructor_name: instructorName.trim() || 'Équipe Pastorale / Enseignants',
      level,
      duration_weeks: Number(durationWeeks) || 4,
      is_published: isPublished,
      church_id: churchId || 'ch-1',
    };

    // Zod Validation
    const validation = courseSchema.safeParse(rawPayload);
    if (!validation.success) {
      const formattedErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          formattedErrors[issue.path[0].toString()] = issue.message;
        }
      });
      setCourseErrors(formattedErrors);
      toast.error('Veuillez corriger les erreurs de saisie dans le formulaire.', 'Saisie Invalide');
      return;
    }

    setLoading(true);
    try {
      const validData = validation.data;
      const slug = validData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      await onSaveCourse({
        church_id: validData.church_id,
        title: validData.title,
        slug,
        description: validData.description,
        instructor_name: validData.instructor_name,
        level: validData.level,
        duration_weeks: validData.duration_weeks,
        is_published: validData.is_published,
      });

      // Reset
      setTitle('');
      setDescription('');
      setInstructorName('');
      setCourseErrors({});
      onClose();
    } catch (err: any) {
      console.error('[CourseModal.handleSubmitCourse Error]:', err);
      toast.error(err.message || 'Erreur lors de la sauvegarde du cursus.', 'Échec Enregistrement');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    setLessonErrors({});

    const courseId = selectedCourseId || existingCourses[0]?.id || '';
    const rawPayload = {
      course_id: courseId,
      title: lessonTitle,
      content: lessonContent,
      duration_minutes: Number(durationMinutes) || 25,
      video_url: videoUrl.trim() || undefined,
      audio_url: audioUrl.trim() || undefined,
    };

    // Zod Validation
    const validation = lessonSchema.safeParse(rawPayload);
    if (!validation.success) {
      const formattedErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          formattedErrors[issue.path[0].toString()] = issue.message;
        }
      });
      setLessonErrors(formattedErrors);
      toast.error('Veuillez corriger les informations de la leçon.', 'Saisie Invalide');
      return;
    }

    setLoading(true);
    try {
      const validData = validation.data;
      await onSaveLesson(validData.course_id, {
        title: validData.title,
        content: validData.content,
        duration_minutes: validData.duration_minutes,
        video_url: validData.video_url,
        audio_url: validData.audio_url,
      });

      // Reset
      setLessonTitle('');
      setLessonContent('');
      setVideoUrl('');
      setAudioUrl('');
      setLessonErrors({});
      onClose();
    } catch (err: any) {
      console.error('[CourseModal.handleSubmitLesson Error]:', err);
      toast.error(err.message || 'Erreur lors de la création de la leçon.', 'Échec Enregistrement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-[#0] z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-950 text-emerald-400 rounded-xl border border-emerald-800/80">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Créer une Formation</h3>
              <p className="text-xs text-slate-400">Créer un nouveau cursus de formation ou ajouter un module de cours</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 p-1.5 gap-1">
          <button
            onClick={() => setTab('COURSE')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition ${
              tab === 'COURSE'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Plus className="w-4 h-4" /> Nouveau Cursus / Cours
          </button>
          <button
            onClick={() => setTab('LESSON')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition ${
              tab === 'LESSON'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Ajouter une Leçon
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {tab === 'COURSE' ? (
            <form onSubmit={handleSubmitCourse} className="space-y-4" noValidate>
              
              {/* Form Level Error Banner if any */}
              {Object.keys(courseErrors).length > 0 && (
                <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl flex items-center gap-2 text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>Veuillez corriger les champs en rouge avant d'enregistrer la formation.</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Titre du Cursus / Cours *
                </label>
                <input
                  type="text"
                  placeholder="ex: Cours de Préparation au Baptême & Fondements"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (courseErrors.title) setCourseErrors((prev) => ({ ...prev, title: '' }));
                  }}
                  className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition ${
                    courseErrors.title ? 'border-rose-500 focus:border-rose-400' : 'border-slate-800 focus:border-emerald-500'
                  }`}
                />
                {courseErrors.title && (
                  <p className="text-rose-400 text-[11px] mt-1 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {courseErrors.title}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Niveau *</label>
                  <select
                    value={level}
                    onChange={(e: any) => setLevel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="FOUNDATION">Fondements (Nouveaux Convertis)</option>
                    <option value="INTERMEDIATE">Intermédiaire (Affermissement)</option>
                    <option value="ADVANCED">Avancé (École Biblique)</option>
                    <option value="LEADERSHIP">Leadership & Service</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Durée (en semaines) *</label>
                  <input
                    type="number"
                    min="1"
                    max="52"
                    value={durationWeeks}
                    onChange={(e) => {
                      setDurationWeeks(Number(e.target.value));
                      if (courseErrors.duration_weeks) setCourseErrors((prev) => ({ ...prev, duration_weeks: '' }));
                    }}
                    className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition ${
                      courseErrors.duration_weeks ? 'border-rose-500 focus:border-rose-400' : 'border-slate-800 focus:border-emerald-500'
                    }`}
                  />
                  {courseErrors.duration_weeks && (
                    <p className="text-rose-400 text-[11px] mt-1 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {courseErrors.duration_weeks}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Formateur / Instructeur référent *
                </label>
                <input
                  type="text"
                  placeholder="ex: Pasteur Samuel Ouedraogo, Pr. Jean-Baptiste"
                  value={instructorName}
                  onChange={(e) => {
                    setInstructorName(e.target.value);
                    if (courseErrors.instructor_name) setCourseErrors((prev) => ({ ...prev, instructor_name: '' }));
                  }}
                  className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition ${
                    courseErrors.instructor_name ? 'border-rose-500 focus:border-rose-400' : 'border-slate-800 focus:border-emerald-500'
                  }`}
                />
                {courseErrors.instructor_name && (
                  <p className="text-rose-400 text-[11px] mt-1 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {courseErrors.instructor_name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description & Objectifs Spirituels *
                </label>
                <textarea
                  rows={3}
                  placeholder="Objectif du cours, versets clés et profil des apprenants..."
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (courseErrors.description) setCourseErrors((prev) => ({ ...prev, description: '' }));
                  }}
                  className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition ${
                    courseErrors.description ? 'border-rose-500 focus:border-rose-400' : 'border-slate-800 focus:border-emerald-500'
                  }`}
                />
                {courseErrors.description && (
                  <p className="text-rose-400 text-[11px] mt-1 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {courseErrors.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pub-course"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-emerald-600 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="pub-course" className="text-xs text-slate-300 cursor-pointer">
                  Publier immédiatement le cursus pour tous les membres
                </label>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium disabled:opacity-50 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Enregistrement...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Enregistrer le Cursus</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmitLesson} className="space-y-4" noValidate>
              
              {Object.keys(lessonErrors).length > 0 && (
                <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl flex items-center gap-2 text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>Veuillez corriger les erreurs de saisie de la leçon.</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Sélectionner le Cursus Rattaché *
                </label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => {
                    setSelectedCourseId(e.target.value);
                    if (lessonErrors.course_id) setLessonErrors((prev) => ({ ...prev, course_id: '' }));
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {existingCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.level})
                    </option>
                  ))}
                </select>
                {lessonErrors.course_id && (
                  <p className="text-rose-400 text-[11px] mt-1 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {lessonErrors.course_id}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Titre de la Leçon / Module *
                </label>
                <input
                  type="text"
                  placeholder="ex: Leçon 1 : Comprendre la grâce et la justification par la foi"
                  value={lessonTitle}
                  onChange={(e) => {
                    setLessonTitle(e.target.value);
                    if (lessonErrors.title) setLessonErrors((prev) => ({ ...prev, title: '' }));
                  }}
                  className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition ${
                    lessonErrors.title ? 'border-rose-500 focus:border-rose-400' : 'border-slate-800 focus:border-emerald-500'
                  }`}
                />
                {lessonErrors.title && (
                  <p className="text-rose-400 text-[11px] mt-1 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {lessonErrors.title}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Durée (minutes) *</label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    value={durationMinutes}
                    onChange={(e) => {
                      setDurationMinutes(Number(e.target.value));
                      if (lessonErrors.duration_minutes) setLessonErrors((prev) => ({ ...prev, duration_minutes: '' }));
                    }}
                    className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition ${
                      lessonErrors.duration_minutes ? 'border-rose-500 focus:border-rose-400' : 'border-slate-800 focus:border-emerald-500'
                    }`}
                  />
                  {lessonErrors.duration_minutes && (
                    <p className="text-rose-400 text-[11px] mt-1 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {lessonErrors.duration_minutes}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">URL Audio MP3 (Optionnel)</label>
                  <input
                    type="url"
                    placeholder="https://.../lecon1.mp3"
                    value={audioUrl}
                    onChange={(e) => {
                      setAudioUrl(e.target.value);
                      if (lessonErrors.audio_url) setLessonErrors((prev) => ({ ...prev, audio_url: '' }));
                    }}
                    className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition ${
                      lessonErrors.audio_url ? 'border-rose-500 focus:border-rose-400' : 'border-slate-800 focus:border-emerald-500'
                    }`}
                  />
                  {lessonErrors.audio_url && (
                    <p className="text-rose-400 text-[11px] mt-1 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {lessonErrors.audio_url}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Plan & Contenu Théologique de la Leçon *
                </label>
                <textarea
                  rows={5}
                  placeholder="Rédigez ou collez le plan d'enseignement, versets clés et questions de réflexion..."
                  value={lessonContent}
                  onChange={(e) => {
                    setLessonContent(e.target.value);
                    if (lessonErrors.content) setLessonErrors((prev) => ({ ...prev, content: '' }));
                  }}
                  className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none font-sans leading-relaxed transition ${
                    lessonErrors.content ? 'border-rose-500 focus:border-rose-400' : 'border-slate-800 focus:border-emerald-500'
                  }`}
                />
                {lessonErrors.content && (
                  <p className="text-rose-400 text-[11px] mt-1 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {lessonErrors.content}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium disabled:opacity-50 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Ajout en cours...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Ajouter la Leçon</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};

