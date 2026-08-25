import React, { useState } from 'react';
import {
  Activity,
  Filter,
  User,
  Clock,
  ChevronRight,
  Database,
  Wallet,
  Users,
  HeartHandshake,
  Shield,
  FileText,
  Search,
  Layers,
  CheckCircle2,
  X
} from 'lucide-react';
import { AuditLog } from '../../types';

interface ActivityFeedProps {
  logs: AuditLog[];
  loading?: boolean;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ logs, loading }) => {
  const [selectedModuleFilter, setSelectedModuleFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLogForDetail, setSelectedLogForDetail] = useState<AuditLog | null>(null);

  const filteredLogs = logs.filter((log) => {
    // Module match
    if (selectedModuleFilter !== 'ALL') {
      const res = (log.resource_type || '').toLowerCase();
      const action = (log.action || '').toLowerCase();
      if (selectedModuleFilter === 'FINANCE' && !res.includes('finance') && !res.includes('transaction') && !action.includes('finance')) return false;
      if (selectedModuleFilter === 'MEMBERS' && !res.includes('member') && !res.includes('profil') && !action.includes('member')) return false;
      if (selectedModuleFilter === 'PASTORAL' && !res.includes('pastoral') && !action.includes('pastoral')) return false;
      if (selectedModuleFilter === 'SECURITY' && !res.includes('auth') && !res.includes('church') && !res.includes('role') && !action.includes('church')) return false;
    }

    // Search term
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const actor = (log.actor_name || '').toLowerCase();
      const action = (log.action || '').toLowerCase();
      const res = (log.resource_type || '').toLowerCase();
      const meta = JSON.stringify(log.metadata || {}).toLowerCase();
      return actor.includes(q) || action.includes(q) || res.includes(q) || meta.includes(q);
    }

    return true;
  });

  const getLogIcon = (resourceType: string, action: string) => {
    const res = (resourceType || '').toLowerCase();
    const act = (action || '').toLowerCase();

    if (res.includes('finance') || res.includes('transaction') || act.includes('finance')) {
      return <Wallet className="w-4 h-4 text-amber-400" />;
    }
    if (res.includes('member') || act.includes('member')) {
      return <Users className="w-4 h-4 text-emerald-400" />;
    }
    if (res.includes('pastoral') || act.includes('pastoral')) {
      return <HeartHandshake className="w-4 h-4 text-purple-400" />;
    }
    if (res.includes('church') || res.includes('auth') || res.includes('role')) {
      return <Shield className="w-4 h-4 text-blue-400" />;
    }
    return <FileText className="w-4 h-4 text-slate-400" />;
  };

  const getActionBadgeColor = (action: string) => {
    const act = (action || '').toUpperCase();
    if (act.includes('CREATE') || act.includes('ADD') || act.includes('INSERT') || act.includes('REGISTER')) {
      return 'bg-emerald-950 text-emerald-300 border-emerald-800';
    }
    if (act.includes('UPDATE') || act.includes('EDIT') || act.includes('APPROVE') || act.includes('CHANGE')) {
      return 'bg-blue-950 text-blue-300 border-blue-800';
    }
    if (act.includes('DELETE') || act.includes('REMOVE') || act.includes('REJECT') || act.includes('CANCEL')) {
      return 'bg-rose-950 text-rose-300 border-rose-800';
    }
    return 'bg-slate-800 text-slate-300 border-slate-700';
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm space-y-4 p-5">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            Fil d'Activité en Temps Réel (Activity Feed)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Historique chronologique détaillé des actions d'administration et opérations métier
          </p>
        </div>

        {/* Filter Pills & Search */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Rechercher auteur, action..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setSelectedModuleFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg transition font-medium text-[11px] ${
                selectedModuleFilter === 'ALL'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Tous ({logs.length})
            </button>
            <button
              onClick={() => setSelectedModuleFilter('FINANCE')}
              className={`px-2 py-1 rounded-lg transition font-medium text-[11px] ${
                selectedModuleFilter === 'FINANCE'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Finances
            </button>
            <button
              onClick={() => setSelectedModuleFilter('MEMBERS')}
              className={`px-2 py-1 rounded-lg transition font-medium text-[11px] ${
                selectedModuleFilter === 'MEMBERS'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Membres
            </button>
            <button
              onClick={() => setSelectedModuleFilter('PASTORAL')}
              className={`px-2 py-1 rounded-lg transition font-medium text-[11px] ${
                selectedModuleFilter === 'PASTORAL'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Pastoral
            </button>
            <button
              onClick={() => setSelectedModuleFilter('SECURITY')}
              className={`px-2 py-1 rounded-lg transition font-medium text-[11px] ${
                selectedModuleFilter === 'SECURITY'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sécurité
            </button>
          </div>
        </div>
      </div>

      {/* Activity Timeline list */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-xs">
          Chargement du fil d'activité...
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="py-12 text-center text-slate-500 text-xs bg-slate-950/40 rounded-xl border border-slate-800/80">
          Aucun événement ne correspond aux critères de filtre.
        </div>
      ) : (
        <div className="relative border-l-2 border-slate-800 ml-4 pl-6 space-y-4 py-2">
          {filteredLogs.map((log) => {
            const dateDisplay = log.created_at
              ? log.created_at.replace('T', ' ').substring(0, 19)
              : 'Date récente';

            return (
              <div key={log.id} className="relative group">
                {/* Timeline Dot Icon */}
                <div className="absolute -left-[35px] top-0.5 w-7 h-7 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center shadow-md group-hover:border-emerald-500 transition">
                  {getLogIcon(log.resource_type, log.action)}
                </div>

                {/* Event Box */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 hover:border-slate-700 transition space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-xs flex items-center gap-1">
                        <User className="w-3 h-3 text-emerald-400" />
                        {log.actor_name || 'Système / Automatique'}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getActionBadgeColor(log.action)}`}>
                        {log.action}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono bg-slate-900 px-1.5 py-0.2 rounded border border-slate-800">
                        {log.resource_type}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{dateDisplay}</span>
                      <button
                        onClick={() => setSelectedLogForDetail(log)}
                        className="ml-1 text-emerald-400 hover:text-emerald-300 font-medium underline flex items-center gap-0.5"
                      >
                        Inspecter JSON <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Metadata preview if exists */}
                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <div className="text-[11px] text-slate-300 bg-slate-900/80 p-2 rounded-lg border border-slate-800/80 font-mono overflow-x-auto">
                      {Object.entries(log.metadata).map(([k, v]) => (
                        <span key={k} className="mr-3 inline-block">
                          <strong className="text-emerald-400">{k}:</strong> {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* JSON Inspection Modal */}
      {selectedLogForDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                Détails Bruts de l'Événement (Audit Payload)
              </h3>
              <button
                onClick={() => setSelectedLogForDetail(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div>Auteur: <strong className="text-white">{selectedLogForDetail.actor_name}</strong></div>
                <div>Action: <strong className="text-emerald-400">{selectedLogForDetail.action}</strong></div>
                <div>Ressource: <strong className="text-white">{selectedLogForDetail.resource_type}</strong></div>
                <div>Horodatage: <strong className="text-slate-400">{selectedLogForDetail.created_at}</strong></div>
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] font-mono mb-1">Payload Metadata (JSON):</label>
                <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-emerald-300 font-mono overflow-x-auto max-h-60">
                  {JSON.stringify(selectedLogForDetail, null, 2)}
                </pre>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedLogForDetail(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
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
