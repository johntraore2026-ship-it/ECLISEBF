import React, { useState, useEffect } from 'react';
import { AlertTriangle, Database, CheckCircle2, Copy, Check, Key, X, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { checkSupabaseTablesExist } from '../../lib/supabase';

export const ConfigBanner: React.FC<{
  onOpenSqlModal?: () => void;
  onOpenCredentialsModal?: () => void;
}> = ({ onOpenSqlModal, onOpenCredentialsModal }) => {
  const { isConfigured, isDemoMode, demoRole, setDemoRole } = useAuth();
  const [copied, setCopied] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [tablesStatus, setTablesStatus] = useState<{ loading: boolean; exist: boolean; message?: string }>({
    loading: true,
    exist: false
  });

  useEffect(() => {
    if (isConfigured && !isDemoMode) {
      checkSupabaseTablesExist().then((res) => {
        setTablesStatus({
          loading: false,
          exist: res.tablesExist,
          message: res.message
        });
      });
    }
  }, [isConfigured, isDemoMode]);

  const copyEnvSnippet = () => {
    navigator.clipboard.writeText(`VITE_SUPABASE_URL=https://votre-projet.supabase.co\nVITE_SUPABASE_ANON_KEY=eyJhbGci...`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (dismissed) return null;

  if (isConfigured && !isDemoMode) {
    return (
      <div id="live-supabase-banner" className="bg-slate-900 text-slate-200 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 border-b border-emerald-800/60 shadow-md">
        <div className="flex items-center gap-2.5">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
          </span>
          <span className="font-semibold tracking-wide text-emerald-300">SUPABASE LIVE CONNECTÉ</span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          
          {tablesStatus.loading ? (
            <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
              <RefreshCw className="w-3 h-3 animate-spin text-emerald-400" />
              Vérification des tables PostgreSQL...
            </span>
          ) : tablesStatus.exist ? (
            <span className="text-emerald-300 font-medium flex items-center gap-1 text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Tables PostgreSQL Détectées & Prêtes !
            </span>
          ) : (
            <span className="text-amber-300 font-medium text-[11px] flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              Tables introuvables : Exécutez le script SQL ci-contre dans l'éditeur Supabase.
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onOpenCredentialsModal && (
            <button
              onClick={onOpenCredentialsModal}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium px-3 py-1 rounded-lg border border-slate-700 transition flex items-center gap-1.5 shadow-sm"
            >
              <Key className="w-3.5 h-3.5 text-emerald-400" />
              <span>Gérer Clés Supabase</span>
            </button>
          )}
          {onOpenSqlModal && (
            <button
              onClick={onOpenSqlModal}
              id="view-sql-schema-btn"
              className="text-xs bg-emerald-700 hover:bg-emerald-600 text-white font-medium px-3 py-1 rounded-lg transition flex items-center gap-1.5 shadow-sm"
            >
              <Database className="w-3.5 h-3.5 text-emerald-200" />
              <span>Script SQL</span>
            </button>
          )}
          <button
            onClick={() => setDismissed(true)}
            aria-label="Masquer le bandeau"
            title="Masquer le bandeau"
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition ml-1"
          >
            <X className="w-4 h-4" />
          </button>
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
              Saisissez vos clés via le bouton <strong>"Renseigner les Clés"</strong> ou redéployez Vercel si vous venez d'ajouter les variables d'environnement.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenCredentialsModal && (
            <button
              onClick={onOpenCredentialsModal}
              className="bg-emerald-700 hover:bg-emerald-600 text-white font-semibold px-3 py-1 rounded transition flex items-center gap-1.5 shadow-sm"
            >
              <Key className="w-3.5 h-3.5" />
              Renseigner les Clés Supabase
            </button>
          )}

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
              className="bg-amber-900/80 hover:bg-amber-800 text-amber-200 font-medium px-2.5 py-1 rounded border border-amber-700/60 transition flex items-center gap-1"
            >
              <Database className="w-3.5 h-3.5" />
              Schéma SQL
            </button>
          )}

          <button
            onClick={copyEnvSnippet}
            id="copy-env-sample-btn"
            className="bg-amber-900/80 hover:bg-amber-800 text-amber-200 px-2.5 py-1 rounded border border-amber-700/60 transition flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copié !' : 'Modèle .env'}
          </button>
        </div>
      </div>
    </div>
  );
};

