import React, { useState } from 'react';
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  ExternalLink,
  Server,
  Key
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { RolePermissionsManager } from '../components/config/RolePermissionsManager';
import { getActiveSupabaseConfig } from '../lib/supabase';

interface SupabaseConfigPageProps {
  onOpenSqlModal: () => void;
  onOpenCredentialsModal?: () => void;
}

export const SupabaseConfigPage: React.FC<SupabaseConfigPageProps> = ({
  onOpenSqlModal,
  onOpenCredentialsModal
}) => {
  const { isConfigured, isDemoMode, demoRole, setDemoRole } = useAuth();
  const [copiedEnv, setCopiedEnv] = useState(false);
  const activeConfig = getActiveSupabaseConfig();

  const envSample = `# Configuration Backend Obligatoire Supabase
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`;

  const copyEnv = () => {
    navigator.clipboard.writeText(envSample);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2500);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-6 h-6 text-emerald-400" />
            <h1 className="text-xl font-bold text-white">Architecture & Configuration Supabase</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Diagnostic du backend PostgreSQL, clés d'API, Row Level Security et migration de la base
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenCredentialsModal && (
            <button
              onClick={onOpenCredentialsModal}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Key className="w-4 h-4 text-emerald-400" />
              Configurer / Modifier Clés
            </button>
          )}

          <button
            onClick={onOpenSqlModal}
            id="config-open-sql-btn"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow transition"
          >
            <Database className="w-4 h-4" />
            Afficher Schéma SQL & RLS
          </button>
        </div>
      </div>

      {/* Backend Status Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Connection Status */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">État de Connexion Backend</span>
            {isConfigured && !isDemoMode ? (
              <span className="text-[10px] font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> En Ligne (Live Supabase)
              </span>
            ) : (
              <span className="text-[10px] font-bold uppercase bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Mode Démo / Sandbox
              </span>
            )}
          </div>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">URL Supabase :</span>
              <span className="font-mono text-emerald-400 truncate max-w-[200px]">
                {activeConfig.url || 'Non renseignée'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Clé Publique Anon :</span>
              <span className="font-mono text-slate-300">
                {activeConfig.key ? '••••••••••••••••' : 'Non renseignée'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Source des Clés :</span>
              <span className="text-white font-medium">
                {activeConfig.isCustomStored
                  ? 'LocalStorage (Navigateur)'
                  : activeConfig.isFromEnv
                  ? '.env (Compile Time)'
                  : 'Non Définie'}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Politiques RLS :</span>
              <span className="text-emerald-400 font-semibold">Actives (Isolation par church_id)</span>
            </div>
          </div>
        </div>

        {/* Demo Mode Switcher for Testing */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Environnement de Test</span>
          </div>

          <div className="space-y-3 text-xs">
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Vous pouvez basculer instantanément de rôle simulé pour valider les circuits de validation financière (Trésorier/Pasteur) et le secret pastoral.
            </p>

            <div>
              <label className="block text-slate-400 text-[11px] mb-1 font-semibold">Simuler le Rôle :</label>
              <select
                value={demoRole}
                onChange={(e) => setDemoRole(e.target.value)}
                aria-label="Simuler le Rôle"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="SUPER_ADMIN">SUPER_ADMIN (Admin Plateforme)</option>
                <option value="CHURCH_ADMIN">CHURCH_ADMIN (Administrateur d'Église)</option>
                <option value="PASTOR">PASTOR (Pasteur - Accès Pastoral Scellé)</option>
                <option value="TREASURER">TREASURER (Trésorier - Approbations Finances)</option>
                <option value="LEADER">LEADER (Responsable de Département)</option>
                <option value="MEMBER">MEMBER (Fidèle Ordinaire)</option>
              </select>
            </div>
          </div>
        </div>

      </div>

      {/* Dynamic Role & Permissions Management Section */}
      <RolePermissionsManager />

      {/* Guide de Déploiement en 3 Étapes */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
          <Server className="w-4 h-4 text-emerald-400" />
          Guide de Mise en Production avec Supabase (3 Étapes)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Step 1 */}
          <div className="bg-slate-800/50 border border-slate-700/60 p-4 rounded-xl space-y-2">
            <div className="w-6 h-6 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-700 flex items-center justify-center font-bold">
              1
            </div>
            <h4 className="font-bold text-white text-sm">Créer le projet Supabase</h4>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Rendez-vous sur <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-emerald-400 underline inline-flex items-center gap-0.5">supabase.com <ExternalLink className="w-2.5 h-2.5" /></a> et créez un nouveau projet gratuit.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-800/50 border border-slate-700/60 p-4 rounded-xl space-y-2">
            <div className="w-6 h-6 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-700 flex items-center justify-center font-bold">
              2
            </div>
            <h4 className="font-bold text-white text-sm">Exécuter le Schéma SQL</h4>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Cliquez sur <strong>« Afficher Schéma SQL & RLS »</strong>, copiez le code DDL complet et collez-le dans le <strong>SQL Editor</strong> de Supabase.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-800/50 border border-slate-700/60 p-4 rounded-xl space-y-2">
            <div className="w-6 h-6 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-700 flex items-center justify-center font-bold">
              3
            </div>
            <h4 className="font-bold text-white text-sm">Définir les Variables .env</h4>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Copiez votre URL de projet et votre Clé Anon publique dans vos variables d'environnement.
            </p>
          </div>
        </div>

        {/* Copy Env Block */}
        <div className="pt-2">
          <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs">
            <span className="text-emerald-400 truncate">.env.example</span>
            <button
              onClick={copyEnv}
              id="copy-env-code-btn"
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center gap-1 text-[11px] transition"
            >
              {copiedEnv ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedEnv ? 'Copié !' : 'Copier modèle .env'}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
