import React, { useState } from 'react';
import { AlertTriangle, Database, CheckCircle2, Copy, Check, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const ConfigBanner: React.FC<{ onOpenSqlModal?: () => void }> = ({ onOpenSqlModal }) => {
  const { isConfigured, isDemoMode, setDemoMode, demoRole, setDemoRole } = useAuth();
  const [copied, setCopied] = useState(false);

  const copyEnvSnippet = () => {
    navigator.clipboard.writeText(`VITE_SUPABASE_URL=https://votre-projet.supabase.co\nVITE_SUPABASE_ANON_KEY=eyJhbGci...`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (isConfigured && !isDemoMode) {
    return (
      <div id="live-supabase-banner" className="bg-emerald-900/90 text-emerald-100 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 border-b border-emerald-700">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
          <span className="font-semibold tracking-wide">CONNECTÉ EN DIRECT À SUPABASE POSTGRESQL & AUTH</span>
          <span className="text-emerald-300">|</span>
          <span className="text-emerald-200">Isolation multi-tenant & Row Level Security (RLS) actives</span>
        </div>
        <div className="flex items-center gap-2">
          {onOpenSqlModal && (
            <button
              onClick={onOpenSqlModal}
              id="view-sql-schema-btn"
              className="text-xs bg-emerald-800 hover:bg-emerald-700 text-white px-2.5 py-1 rounded transition flex items-center gap-1.5"
            >
              <Database className="w-3.5 h-3.5" />
              Schéma SQL & RLS
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div id="supabase-config-alert-banner" className="bg-amber-950/95 text-amber-100 px-4 py-2.5 text-xs border-b border-amber-800/80">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1 rounded bg-amber-800/80 text-amber-200">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-amber-200 uppercase tracking-wider text-[11px] bg-amber-900/80 px-2 py-0.5 rounded border border-amber-700/50">
                Mode Démonstration Actif
              </span>
              <span className="font-medium">Backend Supabase non encore connecté</span>
            </div>
            <p className="text-amber-300/80 text-[11px] mt-0.5">
              Renseignez <code className="bg-amber-900/60 px-1 py-0.5 rounded font-mono text-amber-200">VITE_SUPABASE_URL</code> et <code className="bg-amber-900/60 px-1 py-0.5 rounded font-mono text-amber-200">VITE_SUPABASE_ANON_KEY</code> pour passer en production réelle.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Demo Role Switcher */}
          <div className="flex items-center bg-amber-900/60 border border-amber-700/60 rounded px-2 py-1 gap-1.5">
            <span className="text-[10px] uppercase text-amber-400 font-semibold">Rôle Test :</span>
            <select
              id="demo-role-select"
              value={demoRole}
              onChange={(e) => setDemoRole(e.target.value)}
              aria-label="Sélectionner le rôle de test"
              className="bg-amber-950 text-amber-100 text-xs rounded px-1.5 py-0.5 border border-amber-700/50 outline-none focus:ring-1 focus:ring-amber-400"
            >
              <option value="SUPER_ADMIN">Super Admin Plateforme</option>
              <option value="CHURCH_ADMIN">Admin d'Église (Pasteur/Conseil)</option>
              <option value="PASTOR">Pasteur / Responsable Spirituel</option>
              <option value="TREASURER">Trésorier Général</option>
              <option value="LEADER">Responsable Département</option>
              <option value="MEMBER">Membre Ordinaire</option>
            </select>
          </div>

          {onOpenSqlModal && (
            <button
              onClick={onOpenSqlModal}
              id="view-sql-schema-btn"
              className="bg-amber-700 hover:bg-amber-600 text-white font-medium px-2.5 py-1 rounded transition flex items-center gap-1"
            >
              <Database className="w-3.5 h-3.5" />
              Schéma SQL Supabase
            </button>
          )}

          <button
            onClick={copyEnvSnippet}
            id="copy-env-sample-btn"
            className="bg-amber-900/80 hover:bg-amber-800 text-amber-200 px-2.5 py-1 rounded border border-amber-700/60 transition flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copié !' : 'Variables .env'}
          </button>
        </div>
      </div>
    </div>
  );
};
