import React, { useState } from 'react';
import {
  Church,
  Lock,
  Mail,
  User,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldCheck,
  HelpCircle,
  Database,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Info,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthPageProps {
  onSuccess?: () => void;
  onOpenSqlModal?: () => void;
}

function translateAuthError(errMsg: string): { title: string; detail: string; suggestion?: string; isEmailConfirmation?: boolean } {
  const lower = errMsg.toLowerCase();

  if (lower.includes('invalid login credentials') || lower.includes('invalid_grant')) {
    return {
      title: 'Identifiants Incorrects ou Email Non Confirmé',
      detail: "L'adresse email ou le mot de passe est incorrect, OU votre compte nécessite d'abord une validation par email.",
      suggestion: "1) Vérifiez votre boîte mail pour cliquer sur le lien d'activation Supabase, OU 2) Dans votre console Supabase (Authentication > Providers > Email), désactivez 'Confirm email', OU 3) Utilisez l'Accès Démo ci-dessous.",
      isEmailConfirmation: true
    };
  }

  if (lower.includes('email not confirmed') || lower.includes('email_not_confirmed')) {
    return {
      title: 'Email Non Confirmé par Supabase',
      detail: "Supabase attend la validation de votre adresse e-mail avant d'autoriser la connexion.",
      suggestion: "Consultez votre boîte de réception ou désactivez l'option 'Confirm email' dans Supabase (Authentication > Providers > Email).",
      isEmailConfirmation: true
    };
  }

  if (lower.includes('user already registered') || lower.includes('already exists')) {
    return {
      title: 'Compte Déjà Enregistré',
      detail: 'Un compte existe déjà avec cette adresse email sur votre projet Supabase.',
      suggestion: 'Basculez sur "Se Connecter" ci-dessous pour vous identifier avec votre mot de passe.'
    };
  }

  if (lower.includes('password') && (lower.includes('least') || lower.includes('short') || lower.includes('length'))) {
    return {
      title: 'Mot de Passe Trop Court',
      detail: 'Le mot de passe doit comporter au moins 6 caractères pour des raisons de sécurité.',
      suggestion: 'Veuillez saisir un mot de passe d’au moins 6 caractères.'
    };
  }

  if (lower.includes('rate limit') || lower.includes('too many requests') || lower.includes('over_email_send_rate_limit')) {
    return {
      title: 'Limite de Requêtes Atteinte',
      detail: 'Trop de tentatives ont été effectuées en peu de temps.',
      suggestion: 'Veuillez patienter quelques instants ou passer en mode Démonstration.'
    };
  }

  if (lower.includes('network') || lower.includes('failed to fetch')) {
    return {
      title: 'Connexion Réseau Impossible',
      detail: 'Impossible de joindre le serveur Supabase.',
      suggestion: 'Vérifiez votre connexion Internet et vos clés d’API Supabase.'
    };
  }

  return {
    title: "Erreur d'Authentification",
    detail: errMsg,
    suggestion: "Si le problème persiste, vérifiez la configuration de votre projet Supabase ou utilisez l'accès Démonstration."
  };
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess, onOpenSqlModal }) => {
  const { signIn, signUp, setDemoMode, setDemoRole } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorInfo, setErrorInfo] = useState<{ title: string; detail: string; suggestion?: string; isEmailConfirmation?: boolean } | null>(null);
  const [signupSuccessMessage, setSignupSuccessMessage] = useState<string | null>(null);
  const [showTroubleshoot, setShowTroubleshoot] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorInfo(null);
    setSignupSuccessMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorInfo({
        title: 'Email requis',
        detail: 'Veuillez renseigner une adresse email valide.'
      });
      return;
    }

    if (!password || password.length < 6) {
      setErrorInfo({
        title: 'Mot de passe trop court',
        detail: 'Le mot de passe doit comporter au moins 6 caractères.'
      });
      return;
    }

    setLoading(true);

    try {
      if (isRegister) {
        await signUp(cleanEmail, password, {
          first_name: firstName.trim() || 'Responsable',
          last_name: lastName.trim() || '',
          phone: phone.trim() || undefined
        });
        setSignupSuccessMessage(
          'Compte créé avec succès ! Si vous recevez une erreur de connexion, vérifiez vos emails pour valider le compte ou désactivez "Confirm email" dans votre console Supabase.'
        );
      } else {
        await signIn(cleanEmail, password);
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      const parsed = translateAuthError(err?.message || 'Une erreur inconnue est survenue.');
      setErrorInfo(parsed);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role: string = 'CHURCH_ADMIN') => {
    setDemoRole(role);
    setDemoMode(true);
    if (onSuccess) onSuccess();
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-emerald-500 selection:text-white">
      
      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-emerald-950/40 via-slate-950 to-slate-950 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center mx-auto shadow-xl border border-emerald-500/40">
            <Church className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white font-serif tracking-tight">
            ÉGLISE<span className="text-emerald-400">BF</span>
          </h1>
          <p className="text-xs text-slate-400">
            Gestion Intégrée d'Églises Locales & Assemblées
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white">
              {isRegister ? 'Créer un Compte Responsable' : 'Connexion Sécurisée'}
            </h2>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded">
                Supabase Live
              </span>
            </div>
          </div>

          {/* Formatted Error Banner */}
          {errorInfo && (
            <div className="bg-red-950/90 border border-red-800 text-red-200 text-xs p-3.5 rounded-2xl space-y-2 shadow-md">
              <div className="flex items-center gap-2 font-bold text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorInfo.title}</span>
              </div>
              <p className="text-red-200/90 leading-relaxed pl-6">{errorInfo.detail}</p>
              {errorInfo.suggestion && (
                <div className="pl-6 pt-1.5 border-t border-red-900/60 text-[11px] text-amber-300/95 leading-relaxed">
                  <span className="font-bold">💡 Solution recommandée :</span> {errorInfo.suggestion}
                </div>
              )}
            </div>
          )}

          {/* Success Banner */}
          {signupSuccessMessage && (
            <div className="bg-emerald-950/90 border border-emerald-700 text-emerald-200 text-xs p-3.5 rounded-2xl flex items-start gap-2.5 shadow-md">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <div>
                <p className="font-bold text-white mb-0.5">Compte Créé !</p>
                <p className="text-emerald-300/90 leading-relaxed">{signupSuccessMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isRegister && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Prénom</label>
                    <input
                      type="text"
                      required
                      placeholder="Samuel"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Nom</label>
                    <input
                      type="text"
                      required
                      placeholder="Ouedraogo"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Numéro de Téléphone (Optionnel)</label>
                  <input
                    type="tel"
                    placeholder="+226 70 00 00 00"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Adresse Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="pasteur@eglise.bf"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-300">Mot de Passe</label>
                <span className="text-[10px] text-slate-500">Min. 6 caractères</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-9 py-2 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200"
                  title={showPassword ? 'Masquer' : 'Afficher'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              id="auth-submit-btn"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition shadow-md disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Vérification auprès de Supabase...</span>
                </>
              ) : isRegister ? (
                <>
                  <span>Créer mon Compte Responsable</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <span>Se Connecter à l'Église</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Toggle register / signin */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setErrorInfo(null);
              }}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition"
            >
              {isRegister ? 'Déjà un compte ? Se connecter' : 'Nouvelle église ? Créer un compte administrateur'}
            </button>
          </div>

          {/* Quick Demo Access */}
          <div className="pt-4 border-t border-slate-800 text-center space-y-2">
            <div className="text-[11px] text-slate-400">Tester instantanément avec des données d'exemple :</div>
            <button
              type="button"
              onClick={() => handleDemoLogin('PASTOR')}
              id="quick-demo-access-btn"
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition shadow-sm hover:border-emerald-600/60 group"
            >
              <Sparkles className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <span>Accéder en Mode Démonstration (Pasteur Samuel)</span>
            </button>
          </div>

          {/* Collapsible Supabase Troubleshooting Helper */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowTroubleshoot(!showTroubleshoot)}
              className="w-full flex items-center justify-between text-[11px] text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 px-3 py-2 rounded-xl transition border border-slate-800"
            >
              <div className="flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-medium">Guide & Dépannage Supabase</span>
              </div>
              {showTroubleshoot ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showTroubleshoot && (
              <div className="mt-2 p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-[11px] text-slate-300 space-y-2.5">
                <div>
                  <span className="font-semibold text-emerald-400">1. Confirmation Email Supabase :</span>
                  <p className="text-slate-400 mt-0.5 leading-relaxed">
                    Par défaut, Supabase envoie un email de confirmation. Pour vous connecter immédiatement sans validation d'email, ouvrez votre console Supabase &gt; <strong className="text-slate-200">Authentication</strong> &gt; <strong className="text-slate-200">Providers</strong> &gt; <strong className="text-slate-200">Email</strong> &gt; désactivez <em className="text-slate-200">"Confirm email"</em>.
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-emerald-400">2. Schéma SQL & Tables PostgreSQL :</span>
                  <p className="text-slate-400 mt-0.5 leading-relaxed">
                    Assurez-vous d'avoir exécuté le script SQL de création des tables (<code className="text-emerald-300">members</code>, <code className="text-emerald-300">churches</code>, <code className="text-emerald-300">profiles</code>, etc.) dans l'éditeur SQL de votre console Supabase.
                  </p>
                  {onOpenSqlModal && (
                    <button
                      type="button"
                      onClick={onOpenSqlModal}
                      className="mt-1.5 px-2.5 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition"
                    >
                      <Database className="w-3 h-3" />
                      Ouvrir & Copier le Schéma SQL
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Security Footer Note */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Authentification sécurisée Supabase Auth (JWT & PostgreSQL RLS)</span>
        </div>

      </div>
    </div>
  );
};
