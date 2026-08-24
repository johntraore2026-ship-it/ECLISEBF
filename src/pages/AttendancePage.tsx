import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  PlusCircle,
  Users,
  Calendar,
  Clock,
  TrendingUp,
  UserCheck,
  Sparkles,
  BookOpen,
  Filter
} from 'lucide-react';
import { AttendanceSession } from '../types';
import { attendanceService } from '../services/attendanceService';
import { useAuth } from '../contexts/AuthContext';

interface AttendancePageProps {
  onOpenAddAttendance: () => void;
}

export const AttendancePage: React.FC<AttendancePageProps> = ({ onOpenAddAttendance }) => {
  const { churchId, isDemoMode } = useAuth();

  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!churchId) return;
    setLoading(true);
    try {
      const data = await attendanceService.getSessions(churchId, isDemoMode);
      setSessions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [churchId, isDemoMode]);

  const totalAttendeesAllSessions = sessions.reduce((sum, s) => sum + s.total_count, 0);
  const averagePerSession = sessions.length > 0 ? Math.round(totalAttendeesAllSessions / sessions.length) : 0;
  const totalVisitors = sessions.reduce((sum, s) => sum + s.visitors_count, 0);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-emerald-400" />
            <h1 className="text-xl font-bold text-white">Cultes & Statistiques de Présences</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Pointage systématique des cultes dominicaux, réunions de semaine, suivi des visiteurs et nouveaux venus
          </p>
        </div>

        <button
          onClick={onOpenAddAttendance}
          id="attendance-add-btn"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow transition"
        >
          <PlusCircle className="w-4 h-4" />
          Enregistrer un Culte
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Moyenne par Culte</span>
            <div className="p-2 rounded-xl bg-emerald-950 border border-emerald-800/60 text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-white">{averagePerSession} <span className="text-xs font-normal text-slate-400">fidèles / culte</span></div>
            <div className="text-[11px] text-slate-400 mt-1">Calculé sur {sessions.length} sessions récentes</div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Visiteurs & Nouveaux Venus</span>
            <div className="p-2 rounded-xl bg-amber-950 border border-amber-800/60 text-amber-400">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-amber-400">{totalVisitors} <span className="text-xs font-normal text-slate-400">âmes accueillies</span></div>
            <div className="text-[11px] text-slate-400 mt-1">À intégrer dans les cellules d'affermissement</div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Sessions de Culte Enregistrées</span>
            <div className="p-2 rounded-xl bg-blue-950 border border-blue-800/60 text-blue-400">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-blue-400">{sessions.length}</div>
            <div className="text-[11px] text-slate-400 mt-1">Données sécurisées multi-tenant PostgreSQL</div>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Historique des Cultes</h3>

        <div className="grid grid-cols-1 gap-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 hover:border-emerald-500/40 transition shadow-sm space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                    <CalendarCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">{session.title}</h3>
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <span>{session.session_date}</span>
                      <span>•</span>
                      <span>Début : {session.start_time}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
                    Total : <span className="text-emerald-400 text-sm font-extrabold">{session.total_count}</span> personnes
                  </span>
                </div>
              </div>

              {/* Counts Breakdown Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <div className="bg-slate-850 p-2.5 rounded-xl border border-slate-800 text-center">
                  <div className="text-[10px] uppercase text-slate-400 font-bold">Hommes</div>
                  <div className="text-base font-extrabold text-blue-400 mt-0.5">{session.men_count}</div>
                </div>

                <div className="bg-slate-850 p-2.5 rounded-xl border border-slate-800 text-center">
                  <div className="text-[10px] uppercase text-slate-400 font-bold">Femmes</div>
                  <div className="text-base font-extrabold text-pink-400 mt-0.5">{session.women_count}</div>
                </div>

                <div className="bg-slate-850 p-2.5 rounded-xl border border-slate-800 text-center">
                  <div className="text-[10px] uppercase text-slate-400 font-bold">Enfants (Écodim)</div>
                  <div className="text-base font-extrabold text-amber-400 mt-0.5">{session.children_count}</div>
                </div>

                <div className="bg-slate-850 p-2.5 rounded-xl border border-slate-800 text-center">
                  <div className="text-[10px] uppercase text-slate-400 font-bold">Visiteurs</div>
                  <div className="text-base font-extrabold text-emerald-400 mt-0.5">{session.visitors_count}</div>
                </div>
              </div>

              {/* Preacher & Theme Details */}
              {(session.preacher_name || session.theme || session.notes) && (
                <div className="pt-2 border-t border-slate-800/80 text-xs space-y-1 text-slate-300">
                  {session.preacher_name && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-medium">Orateur / Prédicateur :</span>
                      <span className="font-semibold text-emerald-400">{session.preacher_name}</span>
                    </div>
                  )}
                  {session.theme && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-medium">Thème du Message :</span>
                      <span className="font-medium text-white italic">« {session.theme} »</span>
                    </div>
                  )}
                  {session.notes && (
                    <div className="text-[11px] text-slate-400 bg-slate-800/40 p-2 rounded-lg mt-1">
                      {session.notes}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
