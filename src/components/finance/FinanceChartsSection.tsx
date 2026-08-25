import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { FinanceTransaction } from '../../types';
import { BarChart3, PieChart as PieChartIcon, TrendingUp, DollarSign, Wallet, ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface FinanceChartsSectionProps {
  transactions: FinanceTransaction[];
}

const MONTH_NAMES_FR = [
  'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
  'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'
];

const COLOR_PALETTE_INCOME = [
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#f59e0b', // Amber
];

const COLOR_PALETTE_EXPENSE = [
  '#f43f5e', // Rose
  '#fb923c', // Orange
  '#a855f7', // Purple
  '#ef4444', // Red
  '#6366f1', // Indigo
  '#14b8a6', // Teal
];

export const FinanceChartsSection: React.FC<FinanceChartsSectionProps> = ({ transactions }) => {
  const [activeChartTab, setActiveChartTab] = useState<'MONTHLY_EVOLUTION' | 'INCOME_CATEGORIES' | 'EXPENSE_CATEGORIES'>('MONTHLY_EVOLUTION');

  // 1. Process Monthly Evolution Data
  const monthlyData = useMemo(() => {
    const monthlyMap: Record<string, { monthKey: string; monthName: string; income: number; expense: number; net: number }> = {};

    // Initialize last 6 to 12 months or default 2026 months
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 12; i++) {
      const monthNum = (i + 1).toString().padStart(2, '0');
      const key = `${currentYear}-${monthNum}`;
      monthlyMap[key] = {
        monthKey: key,
        monthName: `${MONTH_NAMES_FR[i]} ${currentYear}`,
        income: 0,
        expense: 0,
        net: 0,
      };
    }

    transactions.forEach((tx) => {
      if (!tx.transaction_date) return;
      const datePart = tx.transaction_date.substring(0, 7); // YYYY-MM
      const amount = Number(tx.amount) || 0;

      if (!monthlyMap[datePart]) {
        // Parse date for label if outside default loop
        const [y, m] = datePart.split('-');
        const mIdx = parseInt(m, 10) - 1;
        const name = mIdx >= 0 && mIdx < 12 ? `${MONTH_NAMES_FR[mIdx]} ${y}` : datePart;
        monthlyMap[datePart] = { monthKey: datePart, monthName: name, income: 0, expense: 0, net: 0 };
      }

      if (tx.transaction_type === 'INCOME') {
        monthlyMap[datePart].income += amount;
      } else if (tx.transaction_type === 'EXPENSE' && tx.status === 'APPROVED') {
        monthlyMap[datePart].expense += amount;
      }
      monthlyMap[datePart].net = monthlyMap[datePart].income - monthlyMap[datePart].expense;
    });

    return Object.values(monthlyMap)
      .sort((a, b) => a.monthKey.localeCompare(b.monthKey))
      .filter((m) => m.income > 0 || m.expense > 0 || m.monthKey.startsWith(currentYear.toString()));
  }, [transactions]);

  // 2. Process Income Categories Distribution
  const incomeCategoryData = useMemo(() => {
    const catMap: Record<string, number> = {};
    let total = 0;

    transactions.forEach((tx) => {
      if (tx.transaction_type === 'INCOME') {
        const cat = tx.category_name || 'Autre Recette';
        const amt = Number(tx.amount) || 0;
        catMap[cat] = (catMap[cat] || 0) + amt;
        total += amt;
      }
    });

    return Object.entries(catMap)
      .map(([name, value], idx) => ({
        name,
        value,
        percentage: total > 0 ? Math.round((value / total) * 100) : 0,
        color: COLOR_PALETTE_INCOME[idx % COLOR_PALETTE_INCOME.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  // 3. Process Expense Categories Distribution
  const expenseCategoryData = useMemo(() => {
    const catMap: Record<string, number> = {};
    let total = 0;

    transactions.forEach((tx) => {
      if (tx.transaction_type === 'EXPENSE' && tx.status === 'APPROVED') {
        const cat = tx.category_name || 'Autre Dépense';
        const amt = Number(tx.amount) || 0;
        catMap[cat] = (catMap[cat] || 0) + amt;
        total += amt;
      }
    });

    return Object.entries(catMap)
      .map(([name, value], idx) => ({
        name,
        value,
        percentage: total > 0 ? Math.round((value / total) * 100) : 0,
        color: COLOR_PALETTE_EXPENSE[idx % COLOR_PALETTE_EXPENSE.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  // Custom Dark Mode Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-xs space-y-1.5 z-50">
          <p className="font-bold text-white border-b border-slate-800 pb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
                {entry.name} :
              </span>
              <span className="font-extrabold text-white">
                {Number(entry.value).toLocaleString('fr-FR')} FCFA
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
      
      {/* Charts Header & View Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            Analyse Graphique des Flux Financiers
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Évolution mensuelle des recettes/dépenses et ventilation analytique par catégorie
          </p>
        </div>

        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveChartTab('MONTHLY_EVOLUTION')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
              activeChartTab === 'MONTHLY_EVOLUTION'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Évolution Mensuelle
          </button>
          <button
            onClick={() => setActiveChartTab('INCOME_CATEGORIES')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
              activeChartTab === 'INCOME_CATEGORIES'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowDownRight className="w-3.5 h-3.5 text-emerald-300" />
            Recettes / Catégorie
          </button>
          <button
            onClick={() => setActiveChartTab('EXPENSE_CATEGORIES')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
              activeChartTab === 'EXPENSE_CATEGORIES'
                ? 'bg-rose-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-rose-300" />
            Dépenses / Catégorie
          </button>
        </div>
      </div>

      {/* Chart Render Container */}
      <div className="pt-2">
        
        {/* VIEW 1: Monthly Evolution BarChart */}
        {activeChartTab === 'MONTHLY_EVOLUTION' && (
          <div className="space-y-4">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis
                    dataKey="monthName"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#475569' }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#475569' }}
                    tickFormatter={(val) => `${val / 1000}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="top"
                    wrapperStyle={{ paddingBottom: '10px', fontSize: '12px' }}
                  />
                  <Bar
                    dataKey="income"
                    name="Recettes (Dîmes & Offrandes)"
                    fill="#10b981"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={40}
                  />
                  <Bar
                    dataKey="expense"
                    name="Dépenses Approuvées"
                    fill="#f43f5e"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs border-t border-slate-800">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Moyenne Recettes Mensuelles :</span>
                <span className="font-extrabold text-emerald-400">
                  {Math.round(
                    monthlyData.reduce((acc, m) => acc + m.income, 0) / (monthlyData.length || 1)
                  ).toLocaleString('fr-FR')}{' '}
                  F
                </span>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Moyenne Dépenses Mensuelles :</span>
                <span className="font-extrabold text-rose-400">
                  {Math.round(
                    monthlyData.reduce((acc, m) => acc + m.expense, 0) / (monthlyData.length || 1)
                  ).toLocaleString('fr-FR')}{' '}
                  F
                </span>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Taux de Couverture Trésorerie :</span>
                <span className="font-extrabold text-blue-400">
                  {Math.round(
                    ((monthlyData.reduce((acc, m) => acc + m.income, 0) || 1) /
                      (monthlyData.reduce((acc, m) => acc + m.expense, 0) || 1)) *
                      100
                  )}
                  %
                </span>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: Income Distribution by Category */}
        {activeChartTab === 'INCOME_CATEGORIES' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            <div className="h-72 w-full flex items-center justify-center">
              {incomeCategoryData.length === 0 ? (
                <div className="text-slate-500 text-xs">Aucune recette enregistrée</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={incomeCategoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {incomeCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Income Legend List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Répartition des Entrées par Poste
              </h4>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {incomeCategoryData.map((item) => (
                  <div
                    key={item.name}
                    className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="font-semibold text-white">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-emerald-400 block">
                        {item.value.toLocaleString('fr-FR')} FCFA
                      </span>
                      <span className="text-[10px] text-slate-400">{item.percentage}% du total</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: Expense Distribution by Category */}
        {activeChartTab === 'EXPENSE_CATEGORIES' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            <div className="h-72 w-full flex items-center justify-center">
              {expenseCategoryData.length === 0 ? (
                <div className="text-slate-500 text-xs">Aucune dépense enregistrée</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseCategoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {expenseCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Expense Legend List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Répartition des Sorties par Poste de Dépense
              </h4>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {expenseCategoryData.map((item) => (
                  <div
                    key={item.name}
                    className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="font-semibold text-white">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-rose-400 block">
                        {item.value.toLocaleString('fr-FR')} FCFA
                      </span>
                      <span className="text-[10px] text-slate-400">{item.percentage}% des sorties</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
