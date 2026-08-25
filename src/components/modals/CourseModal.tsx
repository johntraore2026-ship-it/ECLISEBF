import React, { useState } from 'react';
import { X, GraduationCap, BookOpen, Plus, Clock, FileText, CheckCircle2 } from 'lucide-react';
import { Course } from '../../types';

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
  const [tab, setTab] = useState<'COURSE' | 'LESSON'>('COURSE');
  const [loading, setLoading] = useState(false);

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

  if (!isOpen) return null;

  const handleSubmitCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      await onSaveCourse({
        church_id: churchId,
        title: title.trim(),
        slug,
        description: description.trim(),
        instructor_name: instructorName.trim() || 'Équipe Pastorale / Enseignants',
        level,
        duration_weeks: Number(durationWeeks) || 4,
        is_published: isPublished,
      });

      // Reset
      setTitle('');
      setDescription('');
      setInstructorName('');
      onClose();
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la création du cours.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    const courseId = selectedCourseId || existingCourses[0]?.id;
    if (!courseId || !lessonTitle.trim() || !lessonContent.trim()) return;

    setLoading(true);
    try {
      await onSaveLesson(courseId, {
        title: lessonTitle.trim(),
        content: lessonContent.trim(),
        duration_minutes: Number(durationMinutes) || 25,
        video_url: videoUrl.trim() || undefined,
        audio_url: audioUrl.trim() || undefined,
      });

      // Reset
      setLessonTitle('');
      setLessonContent('');
      setVideoUrl('');
      setAudioUrl('');
      onClose();
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la création de la leçon.');
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
              <h3 className="font-bold text-base text-white">Alimentation des Formations</h3>
              <p className="text-xs text-slate-400">Créer un cursus ou ajouter un module de cours</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
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
            <form onSubmit={handleSubmitCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Titre du Cursus / Cours *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Cours de Préparation au Baptême & Fondements"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Niveau</label>
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
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Durée (en semaines)</label>
                  <input
                    type="number"
                    min="1"
                    max="52"
                    value={durationWeeks}
                    onChange={(e) => setDurationWeeks(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Formateur / Instructeur référent
                </label>
                <input
                  type="text"
                  placeholder="ex: Pasteur Samuel Ouedraogo, Pr. Jean-Baptiste"
                  value={instructorName}
                  onChange={(e) => setInstructorName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description & Objectifs Spirituels
                </label>
                <textarea
                  rows={3}
                  placeholder="Objectif du cours, versets clés et profil des apprenants..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pub-course"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-emerald-600 focus:ring-0"
                />
                <label htmlFor="pub-course" className="text-xs text-slate-300 cursor-pointer">
                  Publier immédiatement le cursus pour tous les membres
                </label>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading || !title.trim()}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" /> Enregistrer le Cursus
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmitLesson} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Sélectionner le Cursus Rattaché *
                </label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {existingCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.level})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Titre de la Leçon / Module *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Leçon 1 : Comprendre la grâce et la justification par la foi"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Durée (minutes)</label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">URL Audio MP3 (Optionnel)</label>
                  <input
                    type="url"
                    placeholder="https://.../lecon1.mp3"
                    value={audioUrl}
                    onChange={(e) => setAudioUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Plan & Contenu Théologique de la Leçon *
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="Rédigez ou collez le plan d'enseignement, versets clés et questions de réflexion..."
                  value={lessonContent}
                  onChange={(e) => setLessonContent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-sans leading-relaxed"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading || !lessonTitle.trim() || !lessonContent.trim()}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" /> Ajouter la Leçon
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
