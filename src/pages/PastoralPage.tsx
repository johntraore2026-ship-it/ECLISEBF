import React, { useState, useEffect } from 'react';
import {
  HeartHandshake,
  Lock,
  PlusCircle,
  ShieldAlert,
  Calendar,
  User,
  CheckCircle2,
  Clock,
  Sparkles,
  Flame,
  MessageSquare
} from 'lucide-react';
import { PastoralRecord, PrayerRequest } from '../types';
import { pastoralService } from '../services/pastoralService';
import { useAuth } from '../contexts/AuthContext';

interface PastoralPageProps {
  onOpenAddPastoral: () => void;
}

export const PastoralPage: React.FC<PastoralPageProps> = ({ onOpenAddPastoral }) => {
  const { churchId, isDemoMode } = useAuth();

  const [activeTab, setActiveTab] = useState<'RECORDS' | 'PRAYERS'>('RECORDS');
  const [records, setRecords] = useState<PastoralRecord[]>([]);
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Prayer request submission state
  const [showAddPrayer, setShowAddPrayer] = useState(false);
  const [requesterName, setRequesterName] = useState('');
  const [requesterPhone, setRequesterPhone] = useState('');
  const [requestText, setRequestText] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  const loadData = async () => {
    if (!churchId) return;
    setLoading(true);
    try {
      const [recs, prs] = await Promise.all([
        pastoralService.getRecords(churchId, isDemoMode),
        pastoralService.getPrayerRequests(churchId, isDemoMode),
      ]);
      setRecords(recs);
      setPrayers(prs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [churchId, isDemoMode]);

  const handleCreatePrayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!churchId || !requesterName.trim() || !requestText.trim()) return;

    await pastoralService.createPrayerRequest({
      church_id: churchId,
      requester_name: requesterName.trim(),
      requester_phone: requesterPhone.trim() || undefined,
      request_text: requestText.trim(),
      is_urgent: isUrgent,
      is_confidential: false,
      status: 'NEW',
    }, isDemoMode);

    setRequesterName('');
    setRequesterPhone('');
    setRequestText('');
    setIsUrgent(false);
    setShowAddPrayer(false);
    loadData();
  };

  const handleMarkAnswered = async (prayerId: string) => {
    await pastoralService.updatePrayerStatus(prayerId, 'ANSWERED', isDemoMode);
    loadData();
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-6 h-6 text-purple-400" />
            <h1 className="text-xl font-bold text-white">Suivi Pastoral, Cure d'Âme & Prières</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Dossiers spirituels scellés confidentiels, accompagnement personnalisé et mur d'intercession
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddPrayer(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Flame className="w-4 h-4 text-amber-400" />
            Nouveau Sujet de Prière
          </button>
          <button
            onClick={onOpenAddPastoral}
            id="pastoral-add-record-btn"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow transition"
          >
            <Lock className="w-4 h-4" />
            Nouvel Entretien Scellé
          </button>
        </div>
      </div>

      {/* RLS Security Notice */}
      <div className="bg-purple-950/40 border border-purple-800/60 p-4 rounded-2xl flex items-start gap-3 text-xs text-purple-200">
        <ShieldAlert className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-purple-300">Protection Pastorale & Isolation RLS Avancée</span>
          <p className="text-purple-300/80 leading-relaxed">
            Les entretiens pastoraux sont protégés au niveau SQL PostgreSQL par la politique Row Level Security <code>pastoral_records_isolation</code>. Seuls les pasteurs référents de l'église détentrice peuvent consulter ces données intimes.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('RECORDS')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition ${
            activeTab === 'RECORDS'
              ? 'bg-purple-600 text-white'
              : 'bg-slate-800 text-slate-300 hover:text-white'
          }`}
        >
          <Lock className="w-4 h-4" />
          Entretiens & Notes Pastorales ({records.length})
        </button>

        <button
          onClick={() => setActiveTab('PRAYERS')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition ${
            activeTab === 'PRAYERS'
              ? 'bg-purple-600 text-white'
              : 'bg-slate-800 text-slate-300 hover:text-white'
          }`}
        >
          <Flame className="w-4 h-4" />
          Sujets de Prière & Intercession ({prayers.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'RECORDS' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {records.length === 0 ? (
            <div className="col-span-2 p-8 text-center text-slate-500 text-xs bg-slate-900/60 rounded-2xl">
              Aucun entretien pastoral enregistré.
            </div>
          ) : (
            records.map((rec) => (
              <div
                key={rec.id}
                className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-3 hover:border-purple-500/50 transition shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-purple-950 text-purple-400 border border-purple-800/80 flex items-center justify-center font-bold text-xs">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">{rec.member_name}</h3>
                      <span className="text-[10px] text-slate-400">Date : {rec.created_at?.split('T')[0]}</span>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold uppercase bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded">
                    {rec.record_type}
                  </span>
                </div>

                <div className="font-semibold text-white text-xs">{rec.title}</div>

                <p className="text-xs text-slate-300 bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 leading-relaxed">
                  {rec.content}
                </p>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Pasteur : <strong className="text-purple-300">{rec.pastor_name}</strong></span>
                  {rec.follow_up_date && (
                    <span className="text-amber-400 font-medium">Relance : {rec.follow_up_date}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {prayers.map((prayer) => {
            const isAnswered = prayer.status === 'ANSWERED';

            return (
              <div
                key={prayer.id}
                className={`bg-slate-900/90 border p-5 rounded-2xl space-y-3 transition shadow-sm ${
                  prayer.is_urgent ? 'border-amber-600/70' : 'border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="font-bold text-white text-sm">{prayer.requester_name}</span>
                  <div className="flex items-center gap-1">
                    {prayer.is_urgent && (
                      <span className="text-[10px] font-bold uppercase bg-amber-950 text-amber-300 border border-amber-800 px-1.5 py-0.5 rounded">
                        Urgent
                      </span>
                    )}
                    {isAnswered && (
                      <span className="text-[10px] font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded">
                        Exaucé
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
                  {prayer.request_text}
                </p>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">{prayer.created_at?.split('T')[0]}</span>
                  {!isAnswered ? (
                    <button
                      onClick={() => handleMarkAnswered(prayer.id)}
                      className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Marquer Exaucé
                    </button>
                  ) : (
                    <span className="text-emerald-400 font-semibold text-[11px] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Gloire à Dieu
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Prayer Modal */}
      {showAddPrayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md text-white shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-base text-white">Nouveau Sujet de Prière & Intercession</h3>

            <form onSubmit={handleCreatePrayer} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Nom du Demandeur</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Soeur Marie Diallo"
                  value={requesterName}
                  onChange={(e) => setRequesterName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Téléphone (Optionnel)</label>
                <input
                  type="tel"
                  placeholder="+226 70 00 00 00"
                  value={requesterPhone}
                  onChange={(e) => setRequesterPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Sujet / Requête de Prière</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ex: Guérison divine pour ma mère hospitalisée..."
                  value={requestText}
                  onChange={(e) => setRequestText(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="urgent-check"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-amber-500"
                />
                <label htmlFor="urgent-check" className="text-slate-300">Marquer comme requête urgente</label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddPrayer(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold"
                >
                  Publier la Requête
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
