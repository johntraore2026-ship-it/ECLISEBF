import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Database,
  UserCheck,
  Clock,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Key
} from 'lucide-react';
import { AuditLog } from '../types';
import { auditService } from '../services/auditService';
import { useAuth } from '../contexts/AuthContext';
import { ActivityFeed } from '../components/audit/ActivityFeed';

export const AuditPage: React.FC = () => {
  const { churchId, isDemoMode, roles, profile } = useAuth();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'FEED' | 'TABLE'>('FEED');

  useEffect(() => {
    if (!churchId) return;
    setLoading(true);
    auditService.getLogs(churchId, isDemoMode)
      .then(setLogs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [churchId, isDemoMode]);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <h1 className="text-xl font-bold text-white">Sécurité, Journal d'Audit & Conformité RLS</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Traçabilité intégrale des écritures financières, créations d'églises, modifications de rôles et accès aux données
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-800 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            PostgreSQL RLS Actif
          </span>
        </div>
      </div>

      {/* Mode Selector & RLS Policies Matrix Overview */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            Politiques Row Level Security (RLS) & Vue Activité
          </h3>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('FEED')}
              className={`px-3 py-1.5 rounded-lg transition font-bold flex items-center gap-1.5 ${
                viewMode === 'FEED'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Fil d'Activité (Activity Feed)
            </button>
            <button
              onClick={() => setViewMode('TABLE')}
              className={`px-3 py-1.5 rounded-lg transition font-bold flex items-center gap-1.5 ${
                viewMode === 'TABLE'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              Table Brut Logs ({logs.length})
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-800/60 border border-slate-700/60 p-3.5 rounded-xl space-y-1">
            <div className="font-bold text-emerald-400">1. Isolation Multi-Tenant</div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Toutes les tables (<code>members</code>, <code>finance_transactions</code>, etc.) sont cloisonnées par <code>church_id = user_church_id()</code>.
            </p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 p-3.5 rounded-xl space-y-1">
            <div className="font-bold text-purple-400">2. Secret Pastoral Scellé</div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              La table <code>pastoral_records</code> exige le rôle <code>PASTOR</code> ou la permission explicite <code>pastoral.read</code>.
            </p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 p-3.5 rounded-xl space-y-1">
            <div className="font-bold text-amber-400">3. Approbation des Dépenses</div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              La procédure stockée <code>approve_finance_transaction()</code> vérifie les privilèges <code>CHURCH_ADMIN</code> / <code>TREASURER</code>.
            </p>
          </div>
        </div>
      </div>

      {/* Main View: Either Activity Feed or Table */}
      {viewMode === 'FEED' ? (
        <ActivityFeed logs={logs} loading={loading} />
      ) : (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Journal Brut des Événements & Audit Logs ({logs.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-850 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Horodatage (UTC)</th>
                  <th className="px-4 py-3">Auteur / Acteur</th>
                  <th className="px-4 py-3">Action Réalisée</th>
                  <th className="px-4 py-3">Ressource Cible</th>
                  <th className="px-4 py-3">Détails JSON</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      Aucun événement d'audit enregistré.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                        {log.created_at?.replace('T', ' ').substring(0, 19)}
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-semibold text-white">{log.actor_name || 'Système'}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{log.actor_id ? `${log.actor_id.substring(0, 8)}...` : 'Service'}</div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-800">
                          {log.action}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-slate-300 font-medium whitespace-nowrap">
                        {log.resource_type}
                      </td>

                      <td className="px-4 py-3 font-mono text-[10px] text-slate-400 max-w-xs truncate">
                        {log.metadata ? JSON.stringify(log.metadata) : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
