import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  BookOpen,
  CheckCircle,
  Clock,
  PlayCircle,
  FileText,
  Award,
  PlusCircle,
  Users,
  Sparkles,
  Trash2,
  Plus,
  UserPlus,
  CheckCircle2
} from 'lucide-react';
import { Course, Lesson, CourseEnrollment } from '../types';
import { trainingService } from '../services/trainingService';
import { useAuth } from '../contexts/AuthContext';
import { CourseModal } from '../components/modals/CourseModal';
import { EnrollMemberModal } from '../components/modals/EnrollMemberModal';

export const TrainingPage: React.FC = () => {
  const { churchId, isDemoMode, hasRole } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);

  const canManageTraining = hasRole('SUPER_ADMIN') || hasRole('CHURCH_ADMIN') || hasRole('PASTOR') || hasRole('LEADER');

  const loadCourses = async () => {
    if (!churchId) return;
    setLoading(true);
    try {
      const data = await trainingService.getCourses(churchId, isDemoMode);
      const enrs = await trainingService.getEnrollments(undefined, isDemoMode);
      setCourses(data);
      setEnrollments(enrs);
      if (data.length > 0) {
        setSelectedCourse(data[0]);
        const firstLesson = data[0].modules?.[0]?.lessons?.[0];
        if (firstLesson) setSelectedLesson(firstLesson);
      } else {
        setSelectedCourse(null);
        setSelectedLesson(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, [churchId, isDemoMode]);

  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course);
    const firstLesson = course.modules?.[0]?.lessons?.[0];
    setSelectedLesson(firstLesson || null);
  };

  const handleSaveCourse = async (courseData: Omit<Course, 'id' | 'created_at'>) => {
    const newCourse = await trainingService.createCourse(courseData, isDemoMode);
    await loadCourses();
    setSelectedCourse(newCourse);
  };

  const handleSaveLesson = async (
    courseId: string,
    lessonData: { title: string; content: string; duration_minutes?: number; video_url?: string; audio_url?: string }
  ) => {
    const newLesson = await trainingService.addLesson(courseId, lessonData, isDemoMode);
    await loadCourses();
    const updated = courses.find(c => c.id === courseId);
    if (updated) {
      setSelectedCourse(updated);
      setSelectedLesson(newLesson);
    }
  };

  const handleDeleteCourse = async (courseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Voulez-vous supprimer ce cursus de formation ?')) return;
    await trainingService.deleteCourse(courseId, isDemoMode);
    await loadCourses();
  };

  const allLessons: Lesson[] = selectedCourse?.modules?.flatMap(m => m.lessons || []) || [];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-emerald-400" />
            <h1 className="text-xl font-bold text-white">Formations, Discipulat & École Biblique</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Cursus d'affermissement des nouveaux convertis, cours de baptême, leadership et formation des ouvriers
          </p>
        </div>

        {canManageTraining && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEnrollModalOpen(true)}
              id="enroll-member-btn"
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition shadow-sm"
            >
              <UserPlus className="w-4 h-4 text-emerald-400" />
              Inscrire des Membres ({enrollments.length})
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              id="add-course-btn"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow transition shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              Alimenter une Formation
            </button>
          </div>
        )}
      </div>

      {/* Main Layout: Courses list on Left, Lesson Viewer on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Cursus selection & modules */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Cursus Disponibles</h3>
            <span className="text-xs text-emerald-400 font-mono">{courses.length} programme(s)</span>
          </div>

          <div className="space-y-3">
            {courses.length === 0 ? (
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center text-xs text-slate-500">
                Aucun cursus de formation disponible. Cliquez sur <strong className="text-slate-300">"Alimenter une Formation"</strong> pour créer le premier cours.
              </div>
            ) : (
              courses.map((c) => {
                const isSelected = selectedCourse?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => handleSelectCourse(c)}
                    className={`p-4 rounded-2xl border transition cursor-pointer relative group ${
                      isSelected
                        ? 'bg-slate-900 border-emerald-500 shadow-md ring-1 ring-emerald-500/50'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-[10px] font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded">
                        {c.level}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {c.duration_weeks || 4} sem.
                        </span>
                        {canManageTraining && (
                          <button
                            onClick={(e) => handleDeleteCourse(c.id, e)}
                            title="Supprimer ce cursus"
                            className="p-1 text-slate-500 hover:text-red-400 rounded transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <h4 className="font-bold text-white text-sm mt-2">{c.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {c.description}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          {/* Lessons in Selected Course */}
          {selectedCourse && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase text-emerald-400">Modules du Cursus</h4>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">{allLessons.length} leçons</span>
                  {canManageTraining && (
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Ajouter
                    </button>
                  )}
                </div>
              </div>

              {allLessons.length === 0 ? (
                <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl text-center text-xs text-slate-500">
                  Aucune leçon dans ce cursus. Cliquez sur <strong className="text-emerald-400">"Alimenter une Formation"</strong> pour ajouter la 1ère leçon.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {allLessons.map((l, idx) => {
                    const isCur = selectedLesson?.id === l.id;
                    return (
                      <button
                        key={l.id}
                        onClick={() => setSelectedLesson(l)}
                        className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center gap-2 transition ${
                          isCur
                            ? 'bg-emerald-600 text-white font-semibold shadow'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${isCur ? 'bg-emerald-800 text-white' : 'bg-slate-800 text-slate-400'}`}>
                          {idx + 1}
                        </div>
                        <span className="truncate flex-1">{l.title}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Selected Lesson Content & Scriptures */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          {selectedLesson ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase text-emerald-400 tracking-wider">
                    {selectedCourse?.title}
                  </span>
                  <h2 className="text-lg font-bold text-white mt-0.5">{selectedLesson.title}</h2>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-lg border border-slate-700">
                    Durée : {selectedLesson.duration_minutes || 30} min
                  </span>
                </div>
              </div>

              {/* Lesson Body Content */}
              <div className="bg-slate-800/50 border border-slate-700/60 p-5 rounded-2xl space-y-3 text-xs text-slate-200 leading-relaxed font-sans">
                <h4 className="text-sm font-bold text-white border-b border-slate-700 pb-2">
                  Plan & Contenu Théologique du Cours
                </h4>
                <div className="whitespace-pre-line leading-relaxed">
                  {selectedLesson.content}
                </div>
              </div>

              {/* Completion Action */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span>Délivrance automatique d'attestation à l'issue du cursus</span>
                </div>

                <button
                  onClick={() => alert('Leçon validée avec succès dans le carnet spirituel !')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow"
                >
                  <CheckCircle className="w-4 h-4" /> Marquer comme Assimilée
                </button>
              </div>

            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 text-xs">
              Sélectionnez une leçon pour afficher le plan de cours et les versets associés.
            </div>
          )}
        </div>

      </div>

      {/* Course Modal */}
      <CourseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaveCourse={handleSaveCourse}
        onSaveLesson={handleSaveLesson}
        existingCourses={courses}
        churchId={churchId || ''}
      />

      {/* Enroll Member Modal */}
      <EnrollMemberModal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        courses={courses}
        selectedCourseId={selectedCourse?.id}
        churchId={churchId || ''}
        isDemoMode={isDemoMode}
        onEnrollmentChanged={loadCourses}
      />

    </div>
  );
};

