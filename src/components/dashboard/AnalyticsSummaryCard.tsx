import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import {
  TrendingUp,
  CalendarCheck,
  Wallet,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Layers,
  Sparkles
} from 'lucide-react';
import { AttendanceSession, FinanceTransaction } from '../../types';

interface AnalyticsSummaryCardProps {
  attendanceSessions: AttendanceSession[];
  transactions: FinanceTransaction[];
}

export const AnalyticsSummaryCard: React.FC<AnalyticsSummaryCardProps> = ({
  attendanceSessions,
  transactions,
}) => {
  const [activeView, setActiveView] = useState<'attendance' | 'finance' | 'combined'>('combined');

  // Format attendance data chronologically for weekly trend
  const weeklyAttendanceData = useMemo(() => {
    const sorted = [...attendanceSessions].sort(
      (a, b) => new Date(a.session_date).getTime() - new Date(b.session_date).getTime()
    );

    return sorted.map((session) => {
      const dateObj = new Date(session.session_date);
      const formattedDate = dateObj.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
      });
      return {
        date: formattedDate,
        fullDate: session.session_date,
        title: session.title,
        type: session.session_type,
        total: session.total_count,
        men: session.men_count,
        women: session.women_count,
        children: session.children_count,
        visitors: session.visitors_count,
      };
    });
  }, [attendanceSessions]);

  // Aggregate monthly income data
  const monthlyFinanceData = useMemo(() => {
    const monthsMap: { [key: string]: { month: string; rawMonth: string; tithes: number; offerings: number; projects: number; other: number; total: number } } = {};

    const incomeTxs = transactions.filter((t) => t.transaction_type === 'INCOME');

    incomeTxs.forEach((tx) => {
      const date = new Date(tx.transaction_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });

      if (!monthsMap[monthKey]) {
        monthsMap[monthKey] = {
          month: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
          rawMonth: monthKey,
          tithes: 0,
          offerings: 0,
          projects: 0,
          other: 0,
          total: 0,
        };
      }

      const amount = Number(tx.amount);
      monthsMap[monthKey].total += amount;

      const catName = (tx.category_name || '').toLowerCase();
      if (catName.includes('dîme') || tx.category_id === 'fc1') {
        monthsMap[monthKey].tithes += amount;
      } else if (catName.includes('offrande') || tx.category_id === 'fc2') {
        monthsMap[monthKey].offerings += amount;
      } else if (catName.includes('projet') || catName.includes('don') || tx.category_id === 'fc3') {
        monthsMap[monthKey].projects += amount;
      } else {
        monthsMap[monthKey].other += amount;
      }
    });

    return Object.values(monthsMap).sort((a, b) => a.rawMonth.localeCompare(b.rawMonth));
  }, [transactions]);

  // Key KPI metrics for attendance
  const avgAttendance = useMemo(() => {
    if (weeklyAttendanceData.length === 0) return 0;
    const total = weeklyAttendanceData.reduce((acc, curr) => acc + curr.total, 0);
    return Math.round(total / weeklyAttendanceData.length);
  }, [weeklyAttendanceData]);

  const peakAttendance = useMemo(() => {
    if (weeklyAttendanceData.length === 0) return 0;
    return Math.max(...weeklyAttendanceData.map((d) => d.total));
  }, [weeklyAttendanceData]);

  const totalVisitors = useMemo(() => {
    return weeklyAttendanceData.reduce((acc, curr) => acc + curr.visitors, 0);
  }, [weeklyAttendanceData]);

  // Key KPI metrics for finances
  const totalIncomeAll = useMemo(() => {
    return monthlyFinanceData.reduce((acc, curr) => acc + curr.total, 0);
  }, [monthlyFinanceData]);

  const latestMonthIncome = useMemo(() => {
    if (monthlyFinanceData.length === 0) return 0;
    return monthlyFinanceData[monthlyFinanceData.length - 1].total;
  }, [monthlyFinanceData]);

  const titheRatio = useMemo(() => {
    if (totalIncomeAll === 0) return 0;
    const totalTithes = monthlyFinanceData.reduce((acc, curr) => acc + curr.tithes, 0);
    return Math.round((totalTithes / totalIncomeAll) * 100);
  }, [monthlyFinanceData, totalIncomeAll]);

  // Custom Tooltip for Attendance
  const CustomAttendanceTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-xl text-xs space-y-1.5 min-w-[200px]">
          <div className="font-bold text-white border-b border-slate-800 pb-1 flex justify-between items-center">
            <span>{data.date}</span>
            <span className="text-emerald-400 font-extrabold">{data.total} fidèles</span>
          </div>
          <p className="text-[11px] text-slate-300 truncate">{data.title}</p>
          <div className="space-y-1 pt-1 text-[11px]">
            <div className="flex justify-between text-blue-400">
              <span>Hommes :</span>
              <span className="font-semibold">{data.men}</span>
            </div>
            <div className="flex justify-between text-pink-400">
              <span>Femmes :</span>
              <span className="font-semibold">{data.women}</span>
            </div>
            <div className="flex justify-between text-amber-400">
              <span>Enfants :</span>
              <span className="font-semibold">{data.children}</span>
            </div>
            <div className="flex justify-between text-purple-400">
              <span>Visiteurs :</span>
              <span className="font-semibold">+{data.visitors}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Finance
  const CustomFinanceTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-xl text-xs space-y-1.5 min-w-[210px]">
          <div className="font-bold text-white border-b border-slate-800 pb-1 flex justify-between items-center">
            <span>{data.month}</span>
            <span className="text-emerald-400 font-extrabold">
              {Number(data.total).toLocaleString('fr-FR')} F
            </span>
          </div>
          <div className="space-y-1 pt-1 text-[11px]">
            <div className="flex justify-between text-emerald-400">
              <span>Dîmes :</span>
              <span className="font-semibold">{Number(data.tithes).toLocaleString('fr-FR')} FCFA</span>
            </div>
            <div className="flex justify-between text-cyan-400">
              <span>Offrandes :</span>
              <span className="font-semibold">{Number(data.offerings).toLocaleString('fr-FR')} FCFA</span>
            </div>
            <div className="flex justify-between text-amber-400">
              <span>Dons & Projets :</span>
              <span className="font-semibold">{Number(data.projects).toLocaleString('fr-FR')} FCFA</span>
            </div>
            {data.other > 0 && (
              <div className="flex justify-between text-indigo-400">
                <span>Autres entrées :</span>
                <span className="font-semibold">{Number(data.other).toLocaleString('fr-FR')} FCFA</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-5">
      
      {/* Header with Title & View Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Analyse Visuelle : Présences Hebdomadaires & Recettes Mensuelles
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Suivi des courbes d'affluence aux cultes et évolution des encaissements financiers
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 shrink-0">
          <button
            onClick={() => setActiveView('combined')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeView === 'combined'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Vue Globale
          </button>
          <button
            onClick={() => setActiveView('attendance')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeView === 'attendance'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            Présences
          </button>
          <button
            onClick={() => setActiveView('finance')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeView === 'finance'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            Finances
          </button>
        </div>
      </div>

      {/* Highlights Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/70">
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
            <Users className="w-3 h-3 text-emerald-400" /> Moyenne / Culte
          </span>
          <div className="text-lg font-extrabold text-white">
            {avgAttendance} <span className="text-xs font-normal text-slate-400">fidèles</span>
          </div>
        </div>

        <div className="space-y-0.5">
          <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-blue-400" /> Pic de Fréquentation
          </span>
          <div className="text-lg font-extrabold text-blue-400">
            {peakAttendance} <span className="text-xs font-normal text-slate-400">personnes</span>
          </div>
        </div>

        <div className="space-y-0.5">
          <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
            <Wallet className="w-3 h-3 text-amber-400" /> Recette Mois Courant
          </span>
          <div className="text-lg font-extrabold text-amber-400 truncate">
            {latestMonthIncome.toLocaleString('fr-FR')} <span className="text-xs font-normal">F</span>
          </div>
        </div>

        <div className="space-y-0.5">
          <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
            <BarChart3 className="w-3 h-3 text-purple-400" /> Ratio Dîmes / Entrées
          </span>
          <div className="text-lg font-extrabold text-purple-400">
            {titheRatio}% <span className="text-xs font-normal text-slate-400">des recettes</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="space-y-6">
        
        {/* VIEW 1: COMBINED / DUAL CHARTS */}
        {activeView === 'combined' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left: Attendance Area Chart */}
            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <h4 className="text-xs font-bold text-slate-200 uppercase">Tendance des Présences Hebdomadaires</h4>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">Total fidèles par culte</span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyAttendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
                    <XAxis
                      dataKey="date"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#334155' }}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<CustomAttendanceTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="total"
                      name="Présence Totale"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#attendanceGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right: Finance Monthly Income Bar Chart */}
            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <h4 className="text-xs font-bold text-slate-200 uppercase">Recettes Mensuelles Encaissées</h4>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">En FCFA par mois</span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyFinanceData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
                    <XAxis
                      dataKey="month"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#334155' }}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`}
                    />
                    <Tooltip content={<CustomFinanceTooltip />} />
                    <Legend
                      wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                      formatter={(val) => <span className="text-slate-300">{val}</span>}
                    />
                    <Bar dataKey="tithes" name="Dîmes" fill="#10b981" stackId="a" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="offerings" name="Offrandes" fill="#06b6d4" stackId="a" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="projects" name="Dons & Projets" fill="#f59e0b" stackId="a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        )}

        {/* VIEW 2: DETAILED ATTENDANCE */}
        {activeView === 'attendance' && (
          <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold text-white uppercase">
                  Courbe Détaillée des Présences (Hommes, Femmes, Enfants, Visiteurs)
                </h4>
                <p className="text-[11px] text-slate-400">
                  Répartition démographique de chaque culte dominical et réunion de semaine
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-blue-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Hommes
                </span>
                <span className="flex items-center gap-1.5 text-pink-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-500 inline-block" /> Femmes
                </span>
                <span className="flex items-center gap-1.5 text-amber-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Enfants
                </span>
                <span className="flex items-center gap-1.5 text-purple-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" /> Visiteurs
                </span>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyAttendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="womenGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="menGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="childGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
                  <XAxis
                    dataKey="date"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#334155' }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomAttendanceTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="women"
                    name="Femmes"
                    stroke="#ec4899"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#womenGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="men"
                    name="Hommes"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#menGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="children"
                    name="Enfants"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#childGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* VIEW 3: DETAILED FINANCE */}
        {activeView === 'finance' && (
          <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold text-white uppercase">
                  Ventilation Détaillée des Recettes Financières par Mois
                </h4>
                <p className="text-[11px] text-slate-400">
                  Comparaison des flux de dîmes, offrandes de culte et dons pour projets
                </p>
              </div>
              <div className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-lg border border-emerald-800/50">
                Cumul Recettes : {totalIncomeAll.toLocaleString('fr-FR')} FCFA
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyFinanceData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
                  <XAxis
                    dataKey="month"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#334155' }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `${(val / 1000).toLocaleString()}k`}
                  />
                  <Tooltip content={<CustomFinanceTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                    formatter={(val) => <span className="text-slate-300">{val}</span>}
                  />
                  <Bar dataKey="tithes" name="Dîmes" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="offerings" name="Offrandes de culte" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="projects" name="Dons projets & travaux" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
