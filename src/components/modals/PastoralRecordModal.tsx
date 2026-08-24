import React, { useState, useEffect } from 'react';
import { X, HeartHandshake, Lock, Save, AlertCircle, ShieldAlert } from 'lucide-react';
import { Member, PastoralRecordType } from '../../types';
import { pastoralService } from '../../services/pastoralService';
import { memberService } from '../../services/memberService';
import { useAuth } from '../../contexts/AuthContext';

interface PastoralRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecordSaved: () => void;
}

export const PastoralRecordModal: React.FC<PastoralRecordModalProps> = ({
  isOpen,
  onClose,
  onRecordSaved
}) => {
  const { churchId, user, profile, isDemoMode } = useAuth();

  const [members, setMembers] = useState<Member[]>([]);
  const [memberId, setMemberId] = useState('');
  const [recordType, setRecordType] = useState<PastoralRecordType>('SPIRITUAL_CARE');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isConfidential, setIsConfidential] = useState(true);
  const [followUpDate, setFollowUpDate] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!churchId || !isOpen) return;
    memberService.getMembers(churchId, isDemoMode).then(setMembers).catch(console.error);
  }, [churchId, isOpen, isDemoMode]);

  if (!isOpen || !churchId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId || !title.trim() || !content.trim()) {
      setError('Veuillez sélectionner le membre et remplir le titre ainsi que le compte-rendu.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const pastorId = profile?.id || user?.id || 'u1111111-1111-4111-8111-111111111111';
      const pastorName = profile ? `${profile.first_name} ${profile.last_name}` : 'Pasteur Samuel Ouedraogo';

      await pastoralService.createRecord({
        church_id: churchId,
        member_id: memberId,
        pastor_id: pastorId,
        pastor_name: pastorName,
        record_type: recordType,
        title: title.trim(),
        content: content.trim(),
        is_confidential: isConfidential,
        follow_up_date: followUpDate || undefined,
        status: 'OPEN',
      }, isDemoMode);

      onRecordSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'enregistrement pastoral');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl text-white shadow-2xl overflow-hidden my-8">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-950 border border-purple-700/60 text-purple-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Entretien Pastoral & Suivi Confidentiel</h2>
              <p className="text-xs text-slate-400">Dossier spirituel scellé protégé par les politiques RLS strictes</p>
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

          <div className="bg-purple-950/40 border border-purple-800/60 p-3 rounded-xl flex items-start gap-2.5 text-xs text-purple-200">
            <ShieldAlert className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-purple-300">Secret pastoral et protection des données :</span> Ce compte-rendu ne sera accessible qu'aux pasteurs autorisés disposant de la permission spécifique <code className="bg-purple-900/60 px-1 rounded">pastoral.read</code>.
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Membre concerné <span className="text-rose-400">*</span>
            </label>
            <select
              required
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              aria-label="Membre concerné"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-purple-500 outline-none"
            >
              <option value="">-- Sélectionner un membre --</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.last_name} {m.first_name} ({m.spiritual_status} - {m.neighborhood || m.city})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Nature de l'Entretien</label>
              <select
                value={recordType}
                onChange={(e) => setRecordType(e.target.value as PastoralRecordType)}
                aria-label="Nature de l'Entretien"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-purple-500 outline-none"
              >
                <option value="SPIRITUAL_CARE">Accompagnement Spirituel & Foi</option>
                <option value="COUNSELING">Conseil & Écoute Personnelle</option>
                <option value="MARITAL_GUIDANCE">Conseil Conjugal / Fiançailles</option>
                <option value="DELIVERANCE">Prière de Délivrance & Restauration</option>
                <option value="CONFIDENTIAL_NOTE">Note Pastorale Scellée</option>
                <option value="DISCIPLINE">Suivi / Recadrage Fraternel</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Date de Relance / Prochain RDV</label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Objet / Sujet de l'Entretien <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Entretien d'engagement ministériel, orientation professionnelle..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Notes Pastorales & Sujets de Prière <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={4}
              required
              placeholder="Détails confidentiels de l'entretien, conseils prodigués, passages bibliques partagés..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="confidential-check"
              checked={isConfidential}
              onChange={(e) => setIsConfidential(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="confidential-check" className="text-xs text-slate-300">
              Verrouiller comme dossier hautement confidentiel (scellé)
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition">
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              id="submit-pastoral-record-btn"
              className="px-5 py-2 text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Enregistrement...' : 'Enregistrer la Fiche Scellée'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
