import React, { useState, useEffect } from 'react';
import {
  Users,
  Wallet,
  CalendarCheck,
  HeartHandshake,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  AlertCircle,
  PlusCircle,
  Shield,
  ChevronRight,
  TrendingUp,
  MapPin,
  FileText
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { memberService } from '../services/memberService';
import { financeService, FinanceSummary } from '../services/financeService';
import { attendanceService } from '../services/attendanceService';
import { pastoralService } from '../services/pastoralService';
import { Member, AttendanceSession, FinanceTransaction, PastoralRecord } from '../types';
import { AnalyticsSummaryCard } from '../components/dashboard/AnalyticsSummaryCard';

interface DashboardPageProps {
  onOpenAddMember: () => void;
  onOpenAddFinance: () => void;
  onOpenAddAttendance: () => void;
  onOpenAddPastoral: () => void;
  setActiveTab: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onOpenAddMember,
  onOpenAddFinance,
  onOpenAddAttendance,
  onOpenAddPastoral,
  setActiveTab,
}) => {
  const { currentChurch, churchId, isDemoMode, hasRole } = useAuth();

  const [members, setMembers] = useState<Member[]>([]);
  const [financeSummary, setFinanceSummary] = useState<FinanceSummary | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<FinanceTransaction[]>([]);
  const [allTransactions, setAllTransactions] = useState<FinanceTransaction[]>([]);
  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceSession[]>([]);
  const [pastoralRecords, setPastoralRecords] = useState<PastoralRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!churchId) return;
    setLoading(true);
    try {
      const [mems, fSummary, fTxs, atts, pRecs] = await Promise.all([
        memberService.getMembers(churchId, isDemoMode),
        financeService.computeSummary(churchId, isDemoMode),
        financeService.getTransactions(churchId, isDemoMode),
        attendanceService.getSessions(churchId, isDemoMode),
        pastoralService.getRecords(churchId, isDemoMode).catch(() => []),
      ]);

      setMembers(mems);
      setFinanceSummary(fSummary);
      setAllTransactions(fTxs);
      setRecentTransactions(fTxs.slice(0, 5));
      setAttendanceSessions(atts);
      setPastoralRecords(pRecs);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [churchId, isDemoMode]);

  const lastSession = attendanceSessions[0];
  const activeMembersCount = members.filter(m => m.is_active).length;
  const newConvertsCount = members.filter(m => m.spiritual_status === 'NEW_CONVERT' || m.spiritual_status === 'INQUIRER').length;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Welcome & Church Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-emerald-950/80 p-6 rounded-2xl border border-slate-800 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/90 px-2.5 py-0.5 rounded-full border border-emerald-700/60">
                Instance Locale Active
              </span>
              <span className="text-xs text-slate-400">ID: {churchId?.substring(0, 13)}...</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-serif text-white">
              {currentChurch?.name || 'Église Évangélique Béthel'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{currentChurch?.city || 'Ouagadougou'} {currentChurch?.neighborhood ? `• ${currentChurch.neighborhood}` : ''}</span>
              <span className="text-slate-500">•</span>
              <span>Pasteur : <strong className="text-emerald-300">{currentChurch?.pastor_name || 'Pasteur Principal'}</strong></span>
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenAddMember}
              id="dashboard-quick-member-btn"
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow transition"
            >
              <PlusCircle className="w-4 h-4" />
              Nouveau Membre
            </button>
            <button
              onClick={onOpenAddFinance}
              id="dashboard-quick-finance-btn"
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Wallet className="w-4 h-4 text-emerald-400" />
              Saisie Dîme/Dépense
            </button>
            <button
              onClick={onOpenAddAttendance}
              id="dashboard-quick-attendance-btn"
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <CalendarCheck className="w-4 h-4 text-emerald-400" />
              Pointage Culte
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Membres Totaux */}
        <div
          onClick={() => setActiveTab('members')}
          className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl hover:border-emerald-500/50 cursor-pointer transition shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Membres Actifs</span>
            <div className="p-2 rounded-xl bg-emerald-950 border border-emerald-800/60 text-emerald-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-white">{activeMembersCount}</div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-emerald-400 font-semibold">{newConvertsCount}</span> nouveaux convertis
            </div>
          </div>
        </div>

        {/* KPI 2: Dernier Culte */}
        <div
          onClick={() => setActiveTab('attendance')}
          className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl hover:border-emerald-500/50 cursor-pointer transition shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Dernier Culte</span>
            <div className="p-2 rounded-xl bg-blue-950 border border-blue-800/60 text-blue-400">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-white">
              {lastSession ? lastSession.total_count : 0} <span className="text-xs font-normal text-slate-400">fidèles</span>
            </div>
            <div className="text-xs text-slate-400 mt-1 truncate">
              {lastSession ? `${lastSession.visitors_count} visiteurs • ${lastSession.title}` : 'Aucune session'}
            </div>
          </div>
        </div>

        {/* KPI 3: Solde & Recettes Financières */}
        <div
          onClick={() => setActiveTab('finance')}
          className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl hover:border-emerald-500/50 cursor-pointer transition shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Recettes Encaissées</span>
            <div className="p-2 rounded-xl bg-amber-950 border border-amber-800/60 text-amber-400">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-white">
              {(financeSummary?.totalIncome || 0).toLocaleString('fr-FR')} <span className="text-xs font-normal text-amber-400">FCFA</span>
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
              <span>Dîmes : {(financeSummary?.tithesTotal || 0).toLocaleString('fr-FR')} F</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Approbations en Attente */}
        <div
          onClick={() => setActiveTab('finance')}
          className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl hover:border-emerald-500/50 cursor-pointer transition shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Circuit Approbation</span>
            <div className="p-2 rounded-xl bg-purple-950 border border-purple-800/60 text-purple-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-white">
              {financeSummary?.pendingApprovalsCount || 0} <span className="text-xs font-normal text-slate-400">dépenses en attente</span>
            </div>
            <div className="text-xs text-amber-400 mt-1 font-medium">
              {(financeSummary?.pendingApprovalsAmount || 0).toLocaleString('fr-FR')} FCFA à valider
            </div>
          </div>
        </div>

      </div>

      {/* Recharts Visual Overview: Weekly Attendance Trends & Monthly Financial Income */}
      <AnalyticsSummaryCard
        attendanceSessions={attendanceSessions}
        transactions={allTransactions}
      />

      {/* Two Column Grid: Transactions & Pastoral Follow-up */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Recent Financial Transactions with Approval Status */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Derniers Mouvements de Trésorerie
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('finance')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
            >
              Voir Grand Livre <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="pb-2.5">Date</th>
                  <th className="pb-2.5">Libellé & Catégorie</th>
                  <th className="pb-2.5">Montant</th>
                  <th className="pb-2.5">Statut Validation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-500">
                      Aucune transaction récente enregistrée.
                    </td>
                  </tr>
                ) : (
                  recentTransactions.map((tx) => {
                    const isIncome = tx.transaction_type === 'INCOME';
                    return (
                      <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 text-slate-300 whitespace-nowrap">{tx.transaction_date}</td>
                        <td className="py-3 pr-2">
                          <div className="font-medium text-white">{tx.description}</div>
                          <div className="text-[11px] text-slate-400">{tx.category_name} • {tx.payment_method}</div>
                        </td>
                        <td className="py-3 font-bold whitespace-nowrap">
                          <span className={isIncome ? 'text-emerald-400' : 'text-rose-400'}>
                            {isIncome ? '+' : '-'}{Number(tx.amount).toLocaleString('fr-FR')} F
                          </span>
                        </td>
                        <td className="py-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              tx.status === 'APPROVED'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : tx.status === 'PENDING_APPROVAL'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : 'bg-red-950 text-red-300 border border-red-800'
                            }`}
                          >
                            {tx.status === 'APPROVED' ? 'Validé' : tx.status === 'PENDING_APPROVAL' ? 'En attente' : 'Rejeté'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Pastoral Care & Intercession Alerts */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Suivi Pastoral Scellé
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('pastoral')}
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
            >
              Consulter <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {pastoralRecords.length === 0 ? (
              <div className="p-4 text-center text-slate-500 text-xs bg-slate-800/30 rounded-xl">
                Aucun entretien pastoral ouvert.
              </div>
            ) : (
              pastoralRecords.slice(0, 3).map((rec) => (
                <div key={rec.id} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-purple-300">{rec.member_name}</span>
                    <span className="text-[10px] bg-purple-950 text-purple-300 px-1.5 py-0.2 rounded border border-purple-800">
                      {rec.record_type}
                    </span>
                  </div>
                  <div className="text-white font-medium text-[11px] truncate">{rec.title}</div>
                  <div className="text-slate-400 text-[10px]">
                    Pasteur : {rec.pastor_name} {rec.follow_up_date ? `• Relance : ${rec.follow_up_date}` : ''}
                  </div>
                </div>
              ))
            )}

            <button
              onClick={onOpenAddPastoral}
              className="w-full py-2 bg-purple-950/60 hover:bg-purple-900/60 text-purple-200 border border-purple-800/60 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition mt-2"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Nouvel Entretien Pastoral
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
