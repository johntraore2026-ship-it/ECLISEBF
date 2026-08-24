import React, { useState, useEffect } from 'react';
import {
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  PlusCircle,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Filter,
  Check,
  X,
  Printer,
  Calendar,
  DollarSign,
  Layers,
  ShieldCheck,
  AlertCircle,
  Download
} from 'lucide-react';
import { FinanceTransaction, FinanceCategory, TransactionType } from '../types';
import { financeService, FinanceSummary } from '../services/financeService';
import { useAuth } from '../contexts/AuthContext';
import { exportFinanceReportToCSV } from '../utils/csvExport';

interface FinancePageProps {
  onOpenAddFinance: () => void;
}

export const FinancePage: React.FC<FinancePageProps> = ({ onOpenAddFinance }) => {
  const { churchId, profile, user, isDemoMode, hasRole } = useAuth();

  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [categories, setCategories] = useState<FinanceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<'ALL' | 'INCOME' | 'EXPENSE' | 'PENDING'>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');
  const [selectedTxForReceipt, setSelectedTxForReceipt] = useState<FinanceTransaction | null>(null);

  const isFinanceOfficer = hasRole('CHURCH_ADMIN') || hasRole('TREASURER') || hasRole('PASTOR') || hasRole('SUPER_ADMIN');

  const loadData = async () => {
    if (!churchId) return;
    setLoading(true);
    try {
      const [txs, sum, cats] = await Promise.all([
        financeService.getTransactions(churchId, isDemoMode),
        financeService.computeSummary(churchId, isDemoMode),
        financeService.getCategories(churchId, isDemoMode),
      ]);
      setTransactions(txs);
      setSummary(sum);
      setCategories(cats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [churchId, isDemoMode]);

  const handleApprove = async (txId: string) => {
    const approverId = profile?.id || user?.id || 'u1111111-1111-4111-8111-111111111111';
    try {
      await financeService.approveTransaction(txId, approverId, isDemoMode);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la validation');
    }
  };

  const handleReject = async (txId: string) => {
    const reason = prompt('Motif du rejet de la dépense :');
    if (reason === null) return;
    const approverId = profile?.id || user?.id || 'u1111111-1111-4111-8111-111111111111';
    try {
      await financeService.rejectTransaction(txId, reason || 'Rejeté par le conseil', isDemoMode);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Erreur lors du rejet');
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (filterTab === 'INCOME' && tx.transaction_type !== 'INCOME') return false;
    if (filterTab === 'EXPENSE' && tx.transaction_type !== 'EXPENSE') return false;
    if (filterTab === 'PENDING' && tx.status !== 'PENDING_APPROVAL') return false;
    if (paymentFilter !== 'ALL' && tx.payment_method !== paymentFilter) return false;
    return true;
  });

  const handleExportCSV = () => {
    exportFinanceReportToCSV(filteredTransactions, summary, 'Église ÉGLISEBF');
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <Wallet className="w-6 h-6 text-emerald-400" />
            <h1 className="text-xl font-bold text-white">Finances, Dîmes & Trésorerie</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Grand livre comptable, gestion des dîmes, offrandes et circuit d'approbation des dépenses
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            id="finance-export-csv-btn"
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
            title="Exporter le rapport financier et les écritures en CSV pour audit et sauvegarde"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            Exporter Rapport CSV ({filteredTransactions.length})
          </button>
          <button
            onClick={onOpenAddFinance}
            id="finance-add-entry-btn"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow transition"
          >
            <PlusCircle className="w-4 h-4" />
            Saisie Recette / Dépense
          </button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Recettes */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Total Recettes</span>
            <div className="p-2 rounded-xl bg-emerald-950 border border-emerald-800/60 text-emerald-400">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl font-extrabold text-emerald-400">
              {(summary?.totalIncome || 0).toLocaleString('fr-FR')} <span className="text-xs font-normal">FCFA</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Dîmes : {(summary?.tithesTotal || 0).toLocaleString('fr-FR')} F • Offrandes : {(summary?.offeringsTotal || 0).toLocaleString('fr-FR')} F
            </div>
          </div>
        </div>

        {/* Dépenses */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Total Dépenses</span>
            <div className="p-2 rounded-xl bg-rose-950 border border-rose-800/60 text-rose-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl font-extrabold text-rose-400">
              {(summary?.totalExpense || 0).toLocaleString('fr-FR')} <span className="text-xs font-normal">FCFA</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Dépenses approuvées et décaissées
            </div>
          </div>
        </div>

        {/* Solde Net */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Solde Net Trésorerie</span>
            <div className="p-2 rounded-xl bg-blue-950 border border-blue-800/60 text-blue-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className={`text-xl font-extrabold ${(summary?.netBalance || 0) >= 0 ? 'text-white' : 'text-red-400'}`}>
              {(summary?.netBalance || 0).toLocaleString('fr-FR')} <span className="text-xs font-normal">FCFA</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Disponibilités en caisse & comptes mobiles
            </div>
          </div>
        </div>

        {/* En attente d'approbation */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">En Attente Validation</span>
            <div className="p-2 rounded-xl bg-amber-950 border border-amber-800/60 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl font-extrabold text-amber-400">
              {(summary?.pendingApprovalsAmount || 0).toLocaleString('fr-FR')} <span className="text-xs font-normal">FCFA</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {summary?.pendingApprovalsCount || 0} demande(s) nécessitant avis
            </div>
          </div>
        </div>

      </div>

      {/* Tabs & Filters */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setFilterTab('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filterTab === 'ALL' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white bg-slate-800'
            }`}
          >
            Toutes les écritures ({transactions.length})
          </button>
          <button
            onClick={() => setFilterTab('INCOME')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filterTab === 'INCOME' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white bg-slate-800'
            }`}
          >
            Recettes / Dîmes
          </button>
          <button
            onClick={() => setFilterTab('EXPENSE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filterTab === 'EXPENSE' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white bg-slate-800'
            }`}
          >
            Dépenses
          </button>
          <button
            onClick={() => setFilterTab('PENDING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
              filterTab === 'PENDING' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white bg-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Circuit d'Approbation ({summary?.pendingApprovalsCount || 0})
          </button>
        </div>

        <div>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            aria-label="Mode de Règlement"
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-1.5 outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">Tous les modes de règlement</option>
            <option value="CASH">Espèces</option>
            <option value="ORANGE_MONEY">Orange Money</option>
            <option value="MOOV_MONEY">Moov Money</option>
            <option value="WAVE">Wave</option>
            <option value="BANK_TRANSFER">Virement Bancaire</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-850 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Libellé & Catégorie</th>
                <th className="px-3 py-3">Mode & Référence</th>
                <th className="px-3 py-3">Donateur / Bénéficiaire</th>
                <th className="px-3 py-3">Montant</th>
                <th className="px-3 py-3">Statut</th>
                <th className="px-4 py-3 text-right">Circuit & Reçu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Aucune écriture financière ne correspond à ce filtre.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isIncome = tx.transaction_type === 'INCOME';
                  const isPending = tx.status === 'PENDING_APPROVAL';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{tx.transaction_date}</td>

                      <td className="px-4 py-3">
                        <div className="font-semibold text-white">{tx.description}</div>
                        <div className="text-[11px] text-slate-400">{tx.category_name}</div>
                      </td>

                      <td className="px-3 py-3">
                        <div className="text-slate-300 font-medium">{tx.payment_method}</div>
                        {tx.reference_number && (
                          <div className="text-[10px] text-slate-400 font-mono">{tx.reference_number}</div>
                        )}
                      </td>

                      <td className="px-3 py-3 text-slate-300">
                        {tx.donor_name || 'Non spécifié'}
                      </td>

                      <td className="px-3 py-3 whitespace-nowrap font-bold">
                        <span className={isIncome ? 'text-emerald-400' : 'text-rose-400'}>
                          {isIncome ? '+' : '-'}{Number(tx.amount).toLocaleString('fr-FR')} F
                        </span>
                      </td>

                      <td className="px-3 py-3 whitespace-nowrap">
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

                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPending && isFinanceOfficer ? (
                            <>
                              <button
                                onClick={() => handleApprove(tx.id)}
                                title="Valider cette opération"
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-semibold flex items-center gap-1 shadow"
                              >
                                <Check className="w-3 h-3" /> Approuver
                              </button>
                              <button
                                onClick={() => handleReject(tx.id)}
                                title="Rejeter la dépense"
                                className="px-2 py-1 bg-red-800/80 hover:bg-red-700 text-red-200 rounded text-[11px] flex items-center gap-1"
                              >
                                <X className="w-3 h-3" /> Rejeter
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setSelectedTxForReceipt(tx)}
                              title="Afficher le reçu officiel"
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] flex items-center gap-1 border border-slate-700"
                            >
                              <FileText className="w-3 h-3 text-emerald-400" /> Reçu
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Modal Preview */}
      {selectedTxForReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg text-white shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base text-white">Reçu Comptable Officiel</h3>
              </div>
              <button onClick={() => setSelectedTxForReceipt(null)} aria-label="Fermer" className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-800/60 border border-slate-700 p-4 rounded-xl space-y-3 text-xs">
              <div className="text-center border-b border-slate-700 pb-2">
                <div className="font-bold text-sm text-white">ÉGLISE ÉVANGÉLIQUE BÉTHEL</div>
                <div className="text-slate-400 text-[11px]">Reçu de Dîmes & Offrandes</div>
                <div className="text-[10px] font-mono text-emerald-400 mt-1">RÉF : {selectedTxForReceipt.receipt_number || selectedTxForReceipt.id.substring(0, 10)}</div>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Date de versement :</span>
                <span className="font-semibold text-white">{selectedTxForReceipt.transaction_date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Donateur / Bénéficiaire :</span>
                <span className="font-semibold text-white">{selectedTxForReceipt.donor_name || 'Fidèle Anonyme'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Motif :</span>
                <span className="text-white">{selectedTxForReceipt.description}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Mode de règlement :</span>
                <span className="text-white">{selectedTxForReceipt.payment_method}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-slate-700">
                <span className="font-bold text-white">MONTANT REÇU :</span>
                <span className="font-extrabold text-emerald-400">{Number(selectedTxForReceipt.amount).toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Imprimer le Reçu
              </button>
              <button
                onClick={() => setSelectedTxForReceipt(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
