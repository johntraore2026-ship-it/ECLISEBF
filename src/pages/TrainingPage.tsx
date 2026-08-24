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
  Sparkles
} from 'lucide-react';
import { Course, Lesson } from '../types';
import { trainingService } from '../services/trainingService';
import { useAuth } from '../contexts/AuthContext';

export const TrainingPage: React.FC = () => {
  const { churchId, isDemoMode } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

  const loadCourses = async () => {
    if (!churchId) return;
    setLoading(true);
    try {
      const data = await trainingService.getCourses(churchId, isDemoMode);
      setCourses(data);
      if (data.length > 0) {
        setSelectedCourse(data[0]);
        const firstLesson = data[0].modules?.[0]?.lessons?.[0];
        if (firstLesson) setSelectedLesson(firstLesson);
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

  const allLessons: Lesson[] = selectedCourse?.modules?.flatMap(m => m.lessons || []) || [];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-emerald-400" />
            <h1 className="text-xl font-bold text-white">Formations, Discipulat & École Biblique</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Cursus d'affermissement des nouveaux convertis, cours de baptême, leadership et formation des ouvriers
          </p>
        </div>
      </div>

      {/* Main Layout: Courses list on Left, Lesson Viewer on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Cursus selection & modules */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Cursus Disponibles</h3>

          <div className="space-y-3">
            {courses.map((c) => {
              const isSelected = selectedCourse?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => handleSelectCourse(c)}
                  className={`p-4 rounded-2xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-slate-850 bg-slate-900 border-emerald-500 shadow-md ring-1 ring-emerald-500/50'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded">
                      {c.level}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {c.duration_weeks || 4} sem.
                    </span>
                  </div>

                  <h4 className="font-bold text-white text-sm mt-2">{c.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Lessons in Selected Course */}
          {selectedCourse && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase text-emerald-400">Modules du Cursus</h4>
                <span className="text-[11px] text-slate-400">{allLessons.length} leçons</span>
              </div>

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

    </div>
  );
};
