import React, { useState } from 'react';
import { X, Key, Link2, CheckCircle2, AlertTriangle, RefreshCw, Trash2, ShieldCheck, Info } from 'lucide-react';
import { getActiveSupabaseConfig, saveRuntimeSupabaseConfig, clearRuntimeSupabaseConfig, isSupabaseConfigured } from '../../lib/supabase';

interface SupabaseCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseCredentialsModal: React.FC<SupabaseCredentialsModalProps> = ({ isOpen, onClose }) => {
  const activeConfig = getActiveSupabaseConfig();
  const [url, setUrl] = useState(activeConfig.url || '');
  const [key, setKey] = useState(activeConfig.key || '');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUrl = url.trim();
    const cleanKey = key.trim();

    if (!cleanUrl || !cleanKey) {
      setError('Veuillez renseigner à la fois l\'URL et la clé anonyme Supabase.');
      return;
    }

    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      setError('L\'URL Supabase doit commencer par https:// (ex: https://votre-projet.supabase.co)');
      return;
    }

    saveRuntimeSupabaseConfig(cleanUrl, cleanKey);
    onClose();
  };

  const handleReset = () => {
    if (window.confirm('Voulez-vous supprimer les clés locales configurées manuellement ?')) {
      clearRuntimeSupabaseConfig();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl text-white shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-950 border border-emerald-700/60 text-emerald-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Connexion Directe Supabase</h2>
              <p className="text-xs text-slate-400">Saisissez ou modifiez vos clés de connexion pour le backend PostgreSQL</p>
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

        {/* Content Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          
          {/* Status Indicator */}
          <div className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${
            isSupabaseConfigured
              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200'
              : 'bg-amber-950/60 border-amber-800 text-amber-200'
          }`}>
            <div className="flex items-center gap-2">
              {isSupabaseConfigured ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              <span className="font-semibold">
                {isSupabaseConfigured
                  ? 'Connecté à Supabase'
                  : 'Backend Supabase non connecté (Mode Démo)'}
              </span>
            </div>
            {activeConfig.isCustomStored && (
              <span className="text-[10px] bg-emerald-900/90 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-700">
                Clés en LocalStorage
              </span>
            )}
          </div>

          {/* Vercel Explanatory Note */}
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs text-slate-300">
            <div className="flex items-center gap-2 font-semibold text-amber-300">
              <Info className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Pourquoi ce message apparaît sur Vercel ?</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Vite intègre les variables d'environnement <code className="text-emerald-300 font-mono">VITE_SUPABASE_URL</code> et <code className="text-emerald-300 font-mono">VITE_SUPABASE_ANON_KEY</code> <strong>lors de la compilation (Build)</strong>.
            </p>
            <ul className="list-disc list-inside text-[11px] text-slate-400 space-y-1 pl-1">
              <li>Si vous avez ajouté vos variables sur Vercel <em>après</em> le premier déploiement, vous devez faire un <strong>Redeploy</strong> sur Vercel.</li>
              <li>Alternativement, saisissez vos identifiants ci-dessous pour les activer <strong>immédiatement</strong> sur votre navigateur sans attendre un rebuild Vercel.</li>
            </ul>
          </div>

          {error && (
            <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-emerald-400" />
                URL du Projet Supabase (<code className="text-emerald-400">VITE_SUPABASE_URL</code>) *
              </label>
              <input
                type="url"
                required
                placeholder="https://votre-projet.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-emerald-400" />
                Clé Anonyme Publique (<code className="text-emerald-400">VITE_SUPABASE_ANON_KEY</code>) *
              </label>
              <textarea
                rows={3}
                required
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
            {activeConfig.isCustomStored ? (
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-2 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/80 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Réinitialiser
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                Enregistrer & Connecter
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
