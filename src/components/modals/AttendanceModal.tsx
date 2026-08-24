import React, { useState } from 'react';
import { X, CalendarCheck, Users, Save, AlertCircle } from 'lucide-react';
import { attendanceService } from '../../services/attendanceService';
import { useAuth } from '../../contexts/AuthContext';

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionSaved: () => void;
}

export const AttendanceModal: React.FC<AttendanceModalProps> = ({
  isOpen,
  onClose,
  onSessionSaved
}) => {
  const { churchId, user, profile, isDemoMode } = useAuth();

  const [sessionType, setSessionType] = useState<'SUNDAY_SERVICE_1' | 'SUNDAY_SERVICE_2' | 'MIDWEEK_PRAYER' | 'YOUTH_SERVICE' | 'SPECIAL_EVENT'>('SUNDAY_SERVICE_1');
  const [title, setTitle] = useState('Culte Dominical d\'Adoration');
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('08:30');
  const [preacherName, setPreacherName] = useState('');
  const [theme, setTheme] = useState('');
  const [menCount, setMenCount] = useState<number | ''>(0);
  const [womenCount, setWomenCount] = useState<number | ''>(0);
  const [childrenCount, setChildrenCount] = useState<number | ''>(0);
  const [visitorsCount, setVisitorsCount] = useState<number | ''>(0);
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !churchId) return null;

  const total = Number(menCount || 0) + Number(womenCount || 0) + Number(childrenCount || 0) + Number(visitorsCount || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !sessionDate) {
      setError('Veuillez renseigner le titre et la date du culte.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const creatorId = profile?.id || user?.id || 'u1111111-1111-4111-8111-111111111111';

      await attendanceService.createSession({
        church_id: churchId,
        session_type: sessionType,
        title: title.trim(),
        session_date: sessionDate,
        start_time: startTime + ':00',
        preacher_name: preacherName.trim() || undefined,
        theme: theme.trim() || undefined,
        men_count: Number(menCount || 0),
        women_count: Number(womenCount || 0),
        children_count: Number(childrenCount || 0),
        visitors_count: Number(visitorsCount || 0),
        notes: notes.trim() || undefined,
        created_by: creatorId,
      }, isDemoMode);

      onSessionSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'enregistrement du culte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl text-white shadow-2xl overflow-hidden my-8">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-950 border border-emerald-700/60 text-emerald-400">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Enregistrer une Session de Culte / Réunion</h2>
              <p className="text-xs text-slate-400">Pointage des effectifs et statistiques de fréquentation</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Fermer" className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-950/80 border border-red-800 text-red-200 text-xs p-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Type de Réunion</label>
              <select
                value={sessionType}
                onChange={(e) => {
                  const val = e.target.value as any;
                  setSessionType(val);
                  if (val === 'SUNDAY_SERVICE_1') setTitle('1er Culte Dominical');
                  else if (val === 'SUNDAY_SERVICE_2') setTitle('2ème Culte Dominical');
                  else if (val === 'MIDWEEK_PRAYER') setTitle('Soirée d\'Intercession & Étude');
                  else if (val === 'YOUTH_SERVICE') setTitle('Culte de la Jeunesse (JEA)');
                  else setTitle('Réunion Spéciale / Convention');
                }}
                aria-label="Type de Réunion"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="SUNDAY_SERVICE_1">Culte Dominical (Matin)</option>
                <option value="SUNDAY_SERVICE_2">2ème Culte Dominical</option>
                <option value="MIDWEEK_PRAYER">Prière & Enseignement Semaine</option>
                <option value="YOUTH_SERVICE">Culte des Jeunes</option>
                <option value="SPECIAL_EVENT">Événement Spécial / Veillée</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Titre de la Session</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Date</label>
              <input
                type="date"
                required
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Heure de Début</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Prédicateur / Orateur</label>
              <input
                type="text"
                placeholder="Ex: Pasteur Samuel Ouedraogo"
                value={preacherName}
                onChange={(e) => setPreacherName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Thème du Message</label>
              <input
                type="text"
                placeholder="Ex: La puissance de la persévérance..."
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* Counts */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-emerald-400">Effectifs Présents</span>
              <span className="text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                Total Présence : <span className="text-emerald-400 text-sm">{total}</span> personnes
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700">
                <label className="block text-[11px] text-slate-400 mb-1">Hommes</label>
                <input
                  type="number"
                  min="0"
                  value={menCount}
                  onChange={(e) => setMenCount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white font-bold"
                />
              </div>

              <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700">
                <label className="block text-[11px] text-slate-400 mb-1">Femmes</label>
                <input
                  type="number"
                  min="0"
                  value={womenCount}
                  onChange={(e) => setWomenCount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white font-bold"
                />
              </div>

              <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700">
                <label className="block text-[11px] text-slate-400 mb-1">Enfants</label>
                <input
                  type="number"
                  min="0"
                  value={childrenCount}
                  onChange={(e) => setChildrenCount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white font-bold"
                />
              </div>

              <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700">
                <label className="block text-[11px] text-slate-400 mb-1">Visiteurs</label>
                <input
                  type="number"
                  min="0"
                  value={visitorsCount}
                  onChange={(e) => setVisitorsCount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white font-bold text-amber-400"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Notes & Décisions spirituelles</label>
            <textarea
              rows={2}
              placeholder="Ex: 5 nouvelles âmes ont fait l'appel au salut, témoignages..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition">
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              id="submit-attendance-btn"
              className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Enregistrement...' : 'Enregistrer le Culte'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
