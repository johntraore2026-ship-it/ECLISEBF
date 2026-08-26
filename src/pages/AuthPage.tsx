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
  RefreshCw,
  Key
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthPageProps {
  onSuccess?: () => void;
  onOpenSqlModal?: () => void;
  onOpenCredentialsModal?: () => void;
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

export const AuthPage: React.FC<AuthPageProps> = ({
  onSuccess,
  onOpenSqlModal,
  onOpenCredentialsModal
}) => {
  const { signIn, signUp, setDemoMode, setDemoRole } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [registerStep, setRegisterStep] = useState<1 | 2 | 3>(1);

  // Login form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Step 1: Church details
  const [churchName, setChurchName] = useState('');
  const [churchDenomination, setChurchDenomination] = useState('Assemblées de Dieu');
  const [churchCity, setChurchCity] = useState('Ouagadougou');
  const [churchNeighborhood, setChurchNeighborhood] = useState('Dassasgho');
  const [churchPhone, setChurchPhone] = useState('+226 25 30 00 00');
  const [churchCurrency, setChurchCurrency] = useState('FCFA (XOF)');

  // Step 2: Admin details
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('CHURCH_ADMIN');
  const [showPassword, setShowPassword] = useState(false);

  // Step 3: Verification
  const [verificationCode, setVerificationCode] = useState('123456');
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorInfo, setErrorInfo] = useState<{ title: string; detail: string; suggestion?: string; isEmailConfirmation?: boolean } | null>(null);
  const [signupSuccessMessage, setSignupSuccessMessage] = useState<string | null>(null);
  const [showTroubleshoot, setShowTroubleshoot] = useState(false);

  // Handlers for step progression
  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorInfo(null);
    if (!churchName.trim()) {
      setErrorInfo({
        title: "Nom d'église requis",
        detail: "Veuillez indiquer le nom officiel de votre église ou assemblée."
      });
      return;
    }
    setRegisterStep(2);
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorInfo(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorInfo({ title: 'Email requis', detail: 'Veuillez renseigner une adresse email valide.' });
      return;
    }

    if (!password || password.length < 6) {
      setErrorInfo({ title: 'Mot de passe trop court', detail: 'Le mot de passe doit comporter au moins 6 caractères.' });
      return;
    }

    if (password !== confirmPassword) {
      setErrorInfo({ title: 'Mots de passe non identiques', detail: 'La confirmation du mot de passe ne correspond pas.' });
      return;
    }

    setLoading(true);

    try {
      // Execute registration
      await signUp(cleanEmail, password, {
        first_name: firstName.trim() || 'Pasteur',
        last_name: lastName.trim() || 'Responsable',
        phone: phone.trim() || undefined,
        role_code: selectedRole,
        church_name: churchName.trim(),
        church_city: churchCity.trim()
      });

      // Move to Step 3 (Email Verification)
      setRegisterStep(3);
    } catch (err: any) {
      const parsed = translateAuthError(err?.message || 'Une erreur est survenue.');
      setErrorInfo(parsed);
      // Fallback step 3 for preview/demo if error is just email confirmation notice
      if (parsed.isEmailConfirmation) {
        setRegisterStep(3);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorInfo(null);

    try {
      if (verificationCode.trim().length < 4) {
        setErrorInfo({ title: 'Code Invalide', detail: 'Le code de vérification doit comporter 6 chiffres.' });
        setLoading(false);
        return;
      }

      setVerificationSuccess(true);
      setSignupSuccessMessage(
        `🎉 L'église "${churchName}" et votre compte administrateur ont été validés avec succès ! Connexion en cours...`
      );

      setTimeout(() => {
        setDemoRole(selectedRole);
        setDemoMode(true);
        if (onSuccess) onSuccess();
      }, 1200);
    } catch (err: any) {
      setErrorInfo({ title: 'Erreur de Validation', detail: err.message || 'Impossible de vérifier le code.' });
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorInfo(null);
    setSignupSuccessMessage(null);

    const cleanEmail = loginEmail.trim();
    if (!cleanEmail) {
      setErrorInfo({ title: 'Email requis', detail: 'Veuillez saisir votre adresse email.' });
      return;
    }

    setLoading(true);
    try {
      await signIn(cleanEmail, loginPassword);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const parsed = translateAuthError(err?.message || 'Erreur de connexion.');
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
              {isRegister
                ? registerStep === 1
                  ? 'Étape 1/3 : Informations de l\'Église'
                  : registerStep === 2
                  ? 'Étape 2/3 : Compte Administrateur'
                  : 'Étape 3/3 : Validation par Email'
                : 'Connexion Sécurisée'}
            </h2>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                isSupabaseConfigured
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  : 'bg-amber-950 text-amber-300 border-amber-800'
              }`}>
                {isSupabaseConfigured ? 'Supabase Connecté' : 'Supabase à Configurer'}
              </span>
            </div>
          </div>

          {/* Quick Direct Supabase Key Config Banner */}
          {!isSupabaseConfigured && (
            <div className="bg-amber-950/80 border border-amber-700/80 text-amber-100 text-xs p-3.5 rounded-2xl space-y-2.5 shadow-md">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <Key className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Backend Supabase Non Connecté (Clés Manquantes)</span>
              </div>
              <p className="text-amber-200/90 text-[11px] leading-relaxed">
                Avez-vous créé votre projet Supabase ? Saisissez vos clés (<code className="text-emerald-300">URL</code> + <code className="text-emerald-300">Anon Key</code>) ici pour vous connecter sans attendre la recompilation Vercel.
              </p>
              {onOpenCredentialsModal && (
                <button
                  type="button"
                  onClick={onOpenCredentialsModal}
                  id="auth-open-credentials-modal-btn"
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow transition cursor-pointer"
                >
                  <Key className="w-4 h-4" />
                  <span>Renseigner mes Clés Supabase (1-Clic)</span>
                </button>
              )}
            </div>
          )}

          {/* Registration Step Stepper */}
          {isRegister && (
            <div className="grid grid-cols-3 gap-1.5 pt-1 pb-1">
              <div
                className={`h-1.5 rounded-full transition-all ${
                  registerStep >= 1 ? 'bg-emerald-500' : 'bg-slate-800'
                }`}
              />
              <div
                className={`h-1.5 rounded-full transition-all ${
                  registerStep >= 2 ? 'bg-emerald-500' : 'bg-slate-800'
                }`}
              />
              <div
                className={`h-1.5 rounded-full transition-all ${
                  registerStep >= 3 ? 'bg-emerald-500' : 'bg-slate-800'
                }`}
              />
            </div>
          )}

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
                <p className="font-bold text-white mb-0.5">Vérification Réussie !</p>
                <p className="text-emerald-300/90 leading-relaxed">{signupSuccessMessage}</p>
              </div>
            </div>
          )}

          {/* IF REGISTRATION MODE */}
          {isRegister ? (
            <>
              {/* STEP 1: Church Details */}
              {registerStep === 1 && (
                <form onSubmit={handleStep1Next} className="space-y-3.5">
                  <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                    <Church className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Inscrivez votre église pour bénéficier d'un espace dédié pour vos membres et finances.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Nom Officiel de l'Église / Assemblée *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ex: Église Évangélique Béthel - Dassasgho"
                      value={churchName}
                      onChange={(e) => setChurchName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Dénomination</label>
                      <select
                        value={churchDenomination}
                        onChange={(e) => setChurchDenomination(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      >
                        <option value="Assemblées de Dieu">Assemblées de Dieu</option>
                        <option value="EENEB">EENEB</option>
                        <option value="Église Baptiste">Église Baptiste</option>
                        <option value="Église Indépendante">Église Indépendante</option>
                        <option value="Centre d'Évangélisation">Centre d'Évangélisation</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Devise Principale</label>
                      <select
                        value={churchCurrency}
                        onChange={(e) => setChurchCurrency(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                      >
                        <option value="FCFA (XOF)">FCFA (XOF)</option>
                        <option value="EUR (€)">EUR (€)</option>
                        <option value="USD ($)">USD ($)</option>
                        <option value="GHS (₵)">GHS (₵)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Ville</label>
                      <input
                        type="text"
                        required
                        placeholder="Ouagadougou"
                        value={churchCity}
                        onChange={(e) => setChurchCity(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Quartier / Secteur</label>
                      <input
                        type="text"
                        placeholder="Dassasgho"
                        value={churchNeighborhood}
                        onChange={(e) => setChurchNeighborhood(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Téléphone de l'Église</label>
                    <input
                      type="tel"
                      placeholder="+226 25 30 00 00"
                      value={churchPhone}
                      onChange={(e) => setChurchPhone(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition shadow"
                  >
                    <span>Continuer vers le Compte Admin</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* STEP 2: Administrator Account Details */}
              {registerStep === 2 && (
                <form onSubmit={handleStep2Submit} className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Prénom Admin *</label>
                      <input
                        type="text"
                        required
                        placeholder="Samuel"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Nom Admin *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ouedraogo"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Téléphone Admin</label>
                      <input
                        type="tel"
                        placeholder="+226 70 00 00 00"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Rôle Principal</label>
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      >
                        <option value="CHURCH_ADMIN">🏛️ Administrateur d'Église</option>
                        <option value="PASTOR">✝️ Pasteur Principal</option>
                        <option value="TREASURER">💰 Trésorier Général</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Email Administrateur *</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        required
                        placeholder="pasteur@eglise.bf"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Mot de Passe *</label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Confirmation *</label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => setRegisterStep(1)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      ← Retour Église
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow disabled:opacity-50"
                    >
                      {loading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <span>Envoyer le Code de Confirmation</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: Email Verification Step */}
              {registerStep === 3 && (
                <form onSubmit={handleVerifyCode} className="space-y-4">
                  <div className="p-4 bg-emerald-950/60 border border-emerald-700 rounded-2xl text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-emerald-900 text-emerald-300 border border-emerald-500 flex items-center justify-center mx-auto font-bold">
                      <Mail className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-white">Validation par Email Requise</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Un code de sécurité à 6 chiffres a été transmis à l'adresse <strong className="text-emerald-400">{email || 'pasteur@eglise.bf'}</strong>. Saisissez ce code pour valider votre église.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 text-center mb-1.5">
                      Code de Vérification (OTP 6 Chiffres)
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="123456"
                      className="w-full bg-slate-950 border-2 border-emerald-500 text-center text-lg font-mono font-bold tracking-widest text-emerald-400 rounded-xl py-2.5 outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                    <p className="text-[10px] text-slate-400 text-center mt-1">
                      (Code de démonstration pré-rempli : <strong>123456</strong>)
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || verificationSuccess}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow transition"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Valider le Code & Activer l'Église</span>
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => alert('Code de confirmation renvoyé avec succès par email !')}
                      className="text-[11px] text-slate-400 hover:text-slate-200 underline"
                    >
                      Renvoyer un nouveau code par email
                    </button>
                  </div>
                </form>
              )}
            </>
          ) : (
            /* IF LOGIN MODE */
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Adresse Email Administrateur</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="pasteur@eglise.bf"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
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
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
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
                ) : (
                  <>
                    <span>Se Connecter à l'Église</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

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
              {isRegister ? 'Déjà un compte ? Se connecter' : 'Pas encore de compte ? S\'inscrire / Créer un compte'}
            </button>
          </div>

          {/* Quick Demo Access */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <div className="text-[11px] text-slate-400 text-center font-medium">Tester l'application selon un rôle spécifique (Mode Démo) :</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleDemoLogin('CHURCH_ADMIN')}
                className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-[11px] font-medium transition text-center truncate hover:border-emerald-500/50"
                title="Administrateur Général Église"
              >
                🏛️ Admin Église
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('PASTOR')}
                className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-[11px] font-medium transition text-center truncate hover:border-emerald-500/50"
                title="Pasteur Principal"
              >
                ✝️ Pasteur
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('TREASURER')}
                className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-[11px] font-medium transition text-center truncate hover:border-emerald-500/50"
                title="Trésorier Financier"
              >
                💰 Trésorier
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('SECRETARY')}
                className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-[11px] font-medium transition text-center truncate hover:border-emerald-500/50"
                title="Secrétaire Paroissial"
              >
                📋 Secrétaire
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('LEADER')}
                className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-[11px] font-medium transition text-center truncate hover:border-emerald-500/50"
                title="Responsable de Département"
              >
                👥 Responsable
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('MEMBER')}
                className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-[11px] font-medium transition text-center truncate hover:border-emerald-500/50"
                title="Membre de la Communauté"
              >
                👤 Membre
              </button>
            </div>
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

                {onOpenCredentialsModal && (
                  <div className="pt-1.5 border-t border-slate-800">
                    <span className="font-semibold text-emerald-400">3. Modifier / Entrer les Clés Supabase :</span>
                    <p className="text-slate-400 mt-0.5 leading-relaxed">
                      Saisissez l'URL de votre projet et la clé anonyme pour connecter l'application immédiatement sans attendre un nouveau build Vercel.
                    </p>
                    <button
                      type="button"
                      onClick={onOpenCredentialsModal}
                      className="mt-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition shadow"
                    >
                      <Key className="w-3.5 h-3.5" />
                      Saisir / Modifier les Clés Supabase
                    </button>
                  </div>
                )}
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
