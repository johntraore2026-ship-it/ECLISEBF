import React, { useState, useEffect } from 'react';
import { X, UserPlus, GraduationCap, CheckCircle2, Search, Trash2, Award, CheckCircle } from 'lucide-react';
import { Course, Member, CourseEnrollment } from '../../types';
import { memberService } from '../../services/memberService';
import { trainingService } from '../../services/trainingService';

interface EnrollMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  selectedCourseId?: string;
  churchId: string;
  isDemoMode: boolean;
  onEnrollmentChanged: () => void;
}

export const EnrollMemberModal: React.FC<EnrollMemberModalProps> = ({
  isOpen,
  onClose,
  courses,
  selectedCourseId,
  churchId,
  isDemoMode,
  onEnrollmentChanged,
}) => {
  const [courseId, setCourseId] = useState<string>(selectedCourseId || courses[0]?.id || '');
  const [members, setMembers] = useState<Member[]>([]);
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [searchMember, setSearchMember] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (selectedCourseId) {
      setCourseId(selectedCourseId);
    } else if (courses.length > 0 && !courseId) {
      setCourseId(courses[0].id);
    }
  }, [selectedCourseId, courses]);

  const loadEnrollments = async () => {
    if (!courseId) return;
    const res = await trainingService.getEnrollments(courseId, isDemoMode);
    setEnrollments(res);
  };

  useEffect(() => {
    if (isOpen && churchId) {
      setLoadingMembers(true);
      memberService.getMembers(churchId, isDemoMode)
        .then(m => setMembers(m))
        .catch(console.error)
        .finally(() => setLoadingMembers(false));
    }
  }, [isOpen, churchId, isDemoMode]);

  useEffect(() => {
    if (isOpen && courseId) {
      loadEnrollments();
    }
  }, [isOpen, courseId]);

  if (!isOpen) return null;

  const currentCourse = courses.find(c => c.id === courseId);

  const filteredMembers = members.filter(m => {
    const q = searchMember.toLowerCase().trim();
    if (!q) return true;
    const name = `${m.first_name} ${m.last_name}`.toLowerCase();
    const phone = (m.phone || '').toLowerCase();
    return name.includes(q) || phone.includes(q);
  });

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId || !selectedMemberId) return;

    const targetMember = members.find(m => m.id === selectedMemberId);
    if (!targetMember) return;

    setSubmitting(true);
    try {
      await trainingService.enrollMember(
        courseId,
        targetMember.id,
        `${targetMember.first_name} ${targetMember.last_name}`,
        targetMember.phone,
        targetMember.email,
        isDemoMode
      );
      setSelectedMemberId('');
      await loadEnrollments();
      onEnrollmentChanged();
    } catch (err) {
      console.error(err);
      alert('Erreur lors de l’inscription du membre.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (enrollmentId: string, status: CourseEnrollment['status'], progress: number) => {
    await trainingService.updateEnrollmentStatus(enrollmentId, status, progress, isDemoMode);
    await loadEnrollments();
    onEnrollmentChanged();
  };

  const handleUnenroll = async (enrollmentId: string) => {
    if (!confirm('Désinscrire ce membre de ce cours ?')) return;
    await trainingService.removeEnrollment(enrollmentId, isDemoMode);
    await loadEnrollments();
    onEnrollmentChanged();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-950 text-emerald-400 rounded-xl border border-emerald-800">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Gestion des Inscriptions au Cours</h3>
              <p className="text-xs text-slate-400">Inscrire des membres et suivre leur progression dans le cursus</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Course Selector bar */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-300 shrink-0 flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-emerald-400" /> Programme :
          </label>
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            {courses.map(c => (
              <option key={c.id} value={c.id}>
                {c.title} ({c.level})
              </option>
            ))}
          </select>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Form to Enroll Member */}
          <form onSubmit={handleEnroll} className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-3">
            <h4 className="text-xs font-bold uppercase text-emerald-400 flex items-center gap-1.5">
              <UserPlus className="w-4 h-4" /> Inscrire un Nouveau Membre au Cursus
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Rechercher dans l'annuaire</label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Filtrer par nom ou tél..."
                    value={searchMember}
                    onChange={(e) => setSearchMember(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Sélectionner le Membre *</label>
                <select
                  required
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">-- Choisir un membre ({filteredMembers.length}) --</option>
                  {filteredMembers.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.last_name} {m.first_name} ({m.spiritual_status})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={submitting || !selectedMemberId}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" /> Valider l'Inscription
              </button>
            </div>
          </form>

          {/* List of Enrolled Members */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase text-slate-300">
                Membres Inscrits au Cursus ({enrollments.length})
              </h4>
              <span className="text-[11px] text-emerald-400 font-mono">
                {currentCourse?.title}
              </span>
            </div>

            {enrollments.length === 0 ? (
              <div className="p-8 bg-slate-950/40 border border-slate-800 rounded-xl text-center text-xs text-slate-500">
                Aucun membre n'est encore inscrit à ce cours. Utilisez le formulaire ci-dessus pour ajouter des inscrits.
              </div>
            ) : (
              <div className="divide-y divide-slate-800 bg-slate-950/40 border border-slate-800 rounded-xl overflow-hidden">
                {enrollments.map(enr => (
                  <div key={enr.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-900/60 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                        {enr.member_name[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-white text-xs">{enr.member_name}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2">
                          <span>{enr.member_phone || 'Pas de tél'}</span>
                          <span>•</span>
                          <span>Inscrit le {new Date(enr.enrolled_at).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      {/* Progression */}
                      <div className="w-28 space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                          <span>Progrès</span>
                          <span>{enr.progress_percentage}%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              enr.status === 'COMPLETED' ? 'bg-emerald-400' : 'bg-teal-500'
                            }`}
                            style={{ width: `${enr.progress_percentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Status Selector */}
                      <select
                        value={enr.status}
                        onChange={(e) => {
                          const st = e.target.value as CourseEnrollment['status'];
                          const prog = st === 'COMPLETED' ? 100 : st === 'ENROLLED' ? 10 : 50;
                          handleStatusChange(enr.id, st, prog);
                        }}
                        className={`text-[10px] font-bold uppercase rounded-lg px-2 py-1 outline-none border ${
                          enr.status === 'COMPLETED'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                            : enr.status === 'IN_PROGRESS'
                            ? 'bg-blue-950 text-blue-300 border-blue-700'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        <option value="ENROLLED">Inscrit</option>
                        <option value="IN_PROGRESS">En Cours</option>
                        <option value="COMPLETED">🎉 Terminé (Certifié)</option>
                        <option value="DROPPED">Abandonné</option>
                      </select>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleUnenroll(enr.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition"
                        title="Retirer l'inscription"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
