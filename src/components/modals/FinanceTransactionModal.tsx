import React, { useState, useEffect } from 'react';
import { X, Wallet, ArrowDownRight, ArrowUpRight, Save, AlertCircle, Receipt, User, DollarSign } from 'lucide-react';
import { FinanceCategory, Member, TransactionType } from '../../types';
import { financeService } from '../../services/financeService';
import { memberService } from '../../services/memberService';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

interface FinanceTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransactionSaved: () => void;
}

export const FinanceTransactionModal: React.FC<FinanceTransactionModalProps> = ({
  isOpen,
  onClose,
  onTransactionSaved,
}) => {
  const { churchId, profile, user, isDemoMode, hasRole } = useAuth();
  const { toast } = useToast();

  const [type, setType] = useState<TransactionType>('INCOME');
  const [categories, setCategories] = useState<FinanceCategory[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'ORANGE_MONEY' | 'MOOV_MONEY' | 'WAVE' | 'BANK_TRANSFER' | 'CHECK'>('CASH');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [donorMemberId, setDonorMemberId] = useState('');
  const [donorName, setDonorName] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftRestored, setDraftRestored] = useState(false);

  // Restore draft when modal opens
  useEffect(() => {
    if (isOpen) {
      const savedDraft = localStorage.getItem('eglisebf_draft_finance');
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          if (parsed && (parsed.amount || parsed.description)) {
            if (parsed.type) setType(parsed.type);
            if (parsed.amount) setAmount(parsed.amount);
            if (parsed.description) setDescription(parsed.description);
            if (parsed.paymentMethod) setPaymentMethod(parsed.paymentMethod);
            if (parsed.referenceNumber) setReferenceNumber(parsed.referenceNumber);
            if (parsed.donorName) setDonorName(parsed.donorName);
            if (parsed.categoryId) setCategoryId(parsed.categoryId);
            setDraftRestored(true);
          }
        } catch (e) {
          console.error('Error parsing finance draft', e);
        }
      }
    }
  }, [isOpen]);

  // Save draft on state change
  useEffect(() => {
    if (isOpen && (amount || description || referenceNumber || donorName)) {
      localStorage.setItem(
        'eglisebf_draft_finance',
        JSON.stringify({
          type,
          amount,
          description,
          paymentMethod,
          referenceNumber,
          donorName,
          categoryId,
        })
      );
    }
  }, [isOpen, type, amount, description, paymentMethod, referenceNumber, donorName, categoryId]);

  const clearFinanceDraft = () => {
    localStorage.removeItem('eglisebf_draft_finance');
    setDraftRestored(false);
    setAmount('');
    setDescription('');
    setReferenceNumber('');
    setDonorName('');
  };

  useEffect(() => {
    if (!churchId || !isOpen) return;

    financeService.getCategories(churchId, isDemoMode).then((cats) => {
      setCategories(cats);
      const firstMatching = cats.find(c => c.type === type);
      if (firstMatching) setCategoryId(firstMatching.id);
    }).catch(console.error);

    memberService.getMembers(churchId, isDemoMode).then(setMembers).catch(console.error);
  }, [churchId, isOpen, type, isDemoMode]);

  if (!isOpen || !churchId) return null;

  const filteredCategories = categories.filter(c => c.type === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setError('Veuillez saisir un montant supérieur à 0.');
      return;
    }
    if (!categoryId) {
      setError('Veuillez sélectionner une catégorie financière.');
      return;
    }
    if (!description.trim()) {
      setError('Veuillez renseigner le libellé / motif de l\'opération.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const creatorId = profile?.id || user?.id || 'u1111111-1111-4111-8111-111111111111';

      // If user has administrative or treasurer privilege, they can auto-approve simple income entries
      const autoApprove = (type === 'INCOME' && (hasRole('CHURCH_ADMIN') || hasRole('TREASURER')));

      await financeService.createTransaction({
        church_id: churchId,
        transaction_type: type,
        category_id: categoryId,
        amount: Number(amount),
        description: description.trim(),
        transaction_date: transactionDate,
        payment_method: paymentMethod,
        reference_number: referenceNumber.trim() || undefined,
        donor_member_id: donorMemberId || undefined,
        donor_name: donorName.trim() || undefined,
        status: autoApprove ? 'APPROVED' : 'PENDING_APPROVAL',
        created_by: creatorId,
      }, isDemoMode);

      toast.success(
        `${profile?.first_name || 'Comptable'}, l'écriture de ${Number(amount).toLocaleString('fr-FR')} FCFA (${type === 'INCOME' ? 'Recette' : 'Dépense'}) a été enregistrée avec succès !`,
        'Transaction Comptable Enregistrée'
      );

      localStorage.removeItem('eglisebf_draft_finance');
      onTransactionSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la saisie financière');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl text-white shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-850">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl border ${type === 'INCOME' ? 'bg-emerald-950 border-emerald-700/60 text-emerald-400' : 'bg-rose-950 border-rose-700/60 text-rose-400'}`}>
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Saisie d'une Opération Financière</h2>
              <p className="text-xs text-slate-400">Enregistrement comptable dans le grand livre de l'église</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {draftRestored && (
            <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs p-3 rounded-xl flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Save className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Brouillon financier non soumis restauré.</span>
              </div>
              <button
                type="button"
                onClick={clearFinanceDraft}
                className="text-[11px] underline font-semibold text-emerald-400 hover:text-white"
              >
                Effacer
              </button>
            </div>
          )}

          {error && (
            <div className="bg-red-950/80 border border-red-800 text-red-200 text-xs p-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Type Toggle: Recette / Dépense */}
          <div className="grid grid-cols-2 gap-3 p-1 bg-slate-800/80 rounded-xl border border-slate-700">
            <button
              type="button"
              onClick={() => setType('INCOME')}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition ${
                type === 'INCOME'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              Recette (Dîme / Offrande / Don)
            </button>

            <button
              type="button"
              onClick={() => setType('EXPENSE')}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition ${
                type === 'EXPENSE'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              Dépense (Facture / Mission / Achat)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Catégorie Budgétaire <span className="text-rose-400">*</span>
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                aria-label="Catégorie Budgétaire"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="">-- Choisir une catégorie --</option>
                {filteredCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Montant en FCFA (XOF) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                placeholder="Ex: 50000"
                value={amount}
                onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-semibold placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Libellé / Motif de l'Opération <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Dîmes culte du 24 Août, Règlement électricité SONABEL..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Mode de Règlement</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                aria-label="Mode de Règlement"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="CASH">Espèces (Numéraire)</option>
                <option value="ORANGE_MONEY">Orange Money Burkina</option>
                <option value="MOOV_MONEY">Moov Money</option>
                <option value="WAVE">Wave Burkina</option>
                <option value="BANK_TRANSFER">Virement Bancaire</option>
                <option value="CHECK">Chèque</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Date de l'Opération</label>
              <input
                type="date"
                required
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* Reference and Donor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {type === 'INCOME' ? 'Membre Donateur (Optionnel)' : 'Bénéficiaire / Prestataire'}
              </label>
              {type === 'INCOME' ? (
                <select
                  value={donorMemberId}
                  onChange={(e) => setDonorMemberId(e.target.value)}
                  aria-label="Membre Donateur"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="">-- Donateur Anonyme / Collecte Globale --</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.last_name} {m.first_name} ({m.phone || 'Sans tel'})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="Ex: SONABEL, Fournisseur son, etc."
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                N° de Référence / Transaction Mobile
              </label>
              <input
                type="text"
                placeholder="Ex: OM-BF-998821, FACT-1029..."
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-lg text-[11px] text-slate-400 border border-slate-700/50">
            <span className="font-semibold text-emerald-400">Circuit de validation à 2 niveaux :</span> Les dépenses sont soumises en statut <em>PENDING_APPROVAL</em> et nécessitent la validation pastorale ou du conseil avant clôture définitive.
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              id="submit-finance-tx-btn"
              className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Enregistrement...' : 'Valider l\'Écriture'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
