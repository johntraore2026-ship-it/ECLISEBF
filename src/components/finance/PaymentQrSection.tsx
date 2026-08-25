import React, { useState } from 'react';
import {
  QrCode,
  Smartphone,
  Copy,
  Check,
  Printer,
  Download,
  CreditCard,
  Building,
  HeartHandshake,
  Share2,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export const PaymentQrSection: React.FC = () => {
  const { currentChurch } = useAuth();
  const { toast } = useToast();

  const [paymentType, setPaymentType] = useState<'TITHE' | 'OFFERING' | 'BUILDING_PROJECT' | 'DONATION'>('TITHE');
  const [provider, setProvider] = useState<'ORANGE_MONEY' | 'MOOV_MONEY' | 'WAVE' | 'CARD'>('ORANGE_MONEY');
  const [amount, setAmount] = useState<number | ''>(5000);
  const [memberReference, setMemberReference] = useState('');
  const [copied, setCopied] = useState(false);
  const [merchantCode, setMerchantCode] = useState('781923');

  const churchName = currentChurch?.name || 'Église Évangélique Béthel';

  const typeLabels = {
    TITHE: 'Dîme Personnelle (10%)',
    OFFERING: 'Offrande Dominicale',
    BUILDING_PROJECT: 'Projet de Construction du Temple',
    DONATION: 'Don Libre & Action de Grâce',
  };

  const providerDetails = {
    ORANGE_MONEY: { name: 'Orange Money (Burkina)', color: 'bg-amber-600', codePrefix: '*144*4*6*' },
    MOOV_MONEY: { name: 'Moov Money (Moov Africa)', color: 'bg-blue-600', codePrefix: '*555*2*1*' },
    WAVE: { name: 'Wave Mobile', color: 'bg-teal-500', codePrefix: 'wave.com/pay/' },
    CARD: { name: 'Carte Bancaire / Visa', color: 'bg-purple-600', codePrefix: 'pay.eglisebf.org/' },
  };

  const paymentPayload = `EGLISEBF:${currentChurch?.id || 'demo'}:${paymentType}:${amount || 0}:${provider}:${merchantCode}:${encodeURIComponent(memberReference || 'Anonyme')}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(paymentPayload)}&size=250x250&color=059669&bgcolor=ffffff`;
  const shareableUrl = `https://pay.eglisebf.org/${currentChurch?.id || 'demo'}?type=${paymentType}&amount=${amount || 0}&code=${merchantCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopied(true);
    toast.success('Lien de paiement copié dans le presse-papier !', 'Lien Généré');
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrintFlyer = () => {
    window.print();
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl space-y-6 shadow-sm">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Paiement Sécurisé Mobile & QR Codes
              <span className="text-[10px] uppercase font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded">
                Orange Money • Moov • Wave
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Générez des liens personnalisés et QR codes imprimables pour la collecte des dîmes et offrandes lors des cultes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Lien Copié !' : 'Copier le Lien Direct'}
          </button>
          <button
            onClick={handlePrintFlyer}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow transition"
          >
            <Printer className="w-3.5 h-3.5" />
            Imprimer l'Affiche QR
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-7 space-y-4 text-xs">
          
          {/* Payment Type Selection */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">
              Motif du Versement / Caisse Ecclésiastique
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentType('TITHE')}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition ${
                  paymentType === 'TITHE'
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-semibold'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Dîme (10%)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentType('OFFERING')}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition ${
                  paymentType === 'OFFERING'
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-semibold'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <HeartHandshake className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Offrande Dominicale</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentType('BUILDING_PROJECT')}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition ${
                  paymentType === 'BUILDING_PROJECT'
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-semibold'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Building className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Projet Construction</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentType('DONATION')}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition ${
                  paymentType === 'DONATION'
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-semibold'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Sparkles className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Don Libre / Action Grâce</span>
              </button>
            </div>
          </div>

          {/* Provider Selection */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">
              Opérateur / Mode de Règlement Mobile
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setProvider('ORANGE_MONEY')}
                className={`p-2.5 rounded-xl border text-center transition font-semibold text-[11px] ${
                  provider === 'ORANGE_MONEY'
                    ? 'bg-amber-950 text-amber-300 border-amber-500'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white'
                }`}
              >
                Orange Money
              </button>
              <button
                type="button"
                onClick={() => setProvider('MOOV_MONEY')}
                className={`p-2.5 rounded-xl border text-center transition font-semibold text-[11px] ${
                  provider === 'MOOV_MONEY'
                    ? 'bg-blue-950 text-blue-300 border-blue-500'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white'
                }`}
              >
                Moov Money
              </button>
              <button
                type="button"
                onClick={() => setProvider('WAVE')}
                className={`p-2.5 rounded-xl border text-center transition font-semibold text-[11px] ${
                  provider === 'WAVE'
                    ? 'bg-teal-950 text-teal-300 border-teal-500'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white'
                }`}
              >
                Wave
              </button>
              <button
                type="button"
                onClick={() => setProvider('CARD')}
                className={`p-2.5 rounded-xl border text-center transition font-semibold text-[11px] ${
                  provider === 'CARD'
                    ? 'bg-purple-950 text-purple-300 border-purple-500'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white'
                }`}
              >
                Carte Visa / Bancaire
              </button>
            </div>
          </div>

          {/* Preset or Custom Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 mb-1">Montant Suggéré (FCFA)</label>
              <input
                type="number"
                min={100}
                placeholder="Montant libre si vide"
                value={amount}
                onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
              />
              <div className="flex gap-1 mt-1.5">
                {[1000, 2000, 5000, 10000, 25000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset)}
                    className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] rounded border border-slate-700"
                  >
                    {preset.toLocaleString()} F
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Code Marchand / USSD Église</label>
              <input
                type="text"
                value={merchantCode}
                onChange={(e) => setMerchantCode(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Code USSD court de la paroisse
              </span>
            </div>
          </div>

          {/* Optional Member Reference */}
          <div>
            <label className="block text-slate-300 mb-1">Identifiant / Prénom du Membre (Optionnel)</label>
            <input
              type="text"
              placeholder="Ex: Jean Zongo (Laissez vide pour don anonyme)"
              value={memberReference}
              onChange={(e) => setMemberReference(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Quick USSD Helper Code */}
          <div className="bg-slate-850 bg-slate-800/80 border border-slate-700 p-3.5 rounded-xl space-y-1 font-mono text-[11px]">
            <span className="text-slate-400 font-sans block text-[10px] uppercase font-bold">
              Syntaxe d'envoi rapide USSD Mobile Money :
            </span>
            <div className="text-emerald-300 font-bold">
              {providerDetails[provider].codePrefix}{merchantCode}*{amount || 'MONTANT'}#
            </div>
          </div>

        </div>

        {/* Right Column: Printable QR Card Preview */}
        <div className="lg:col-span-5 bg-white text-slate-900 rounded-2xl p-6 flex flex-col items-center justify-between text-center shadow-xl space-y-4 border-4 border-emerald-600 print:m-0 print:border-none">
          
          <div className="space-y-1">
            <div className="text-[10px] uppercase tracking-widest font-bold text-emerald-800">
              Scannez pour Donner • Culte ÉgliseBF
            </div>
            <h4 className="font-extrabold text-lg text-slate-900 uppercase font-serif">
              {churchName}
            </h4>
            <div className="inline-block px-3 py-0.5 bg-emerald-100 text-emerald-800 font-extrabold text-xs rounded-full">
              {typeLabels[paymentType]}
            </div>
          </div>

          {/* QR Code Image */}
          <div className="bg-slate-50 p-3 rounded-2xl border-2 border-slate-200 shadow-inner">
            <img
              src={qrImageUrl}
              alt="QR Code de Paiement Sécurisé"
              className="w-48 h-48 object-contain"
            />
          </div>

          {/* Details */}
          <div className="space-y-1 text-xs">
            {amount ? (
              <div className="text-xl font-extrabold text-emerald-700 font-mono">
                {amount.toLocaleString('fr-FR')} FCFA
              </div>
            ) : (
              <div className="text-sm font-bold text-slate-600">
                Montant Libre au choix du donateur
              </div>
            )}
            <div className="text-[11px] text-slate-500 font-medium">
              Opérateur : {providerDetails[provider].name}
            </div>
            {memberReference && (
              <div className="text-[11px] text-slate-700 font-semibold">
                Donateur : {memberReference}
              </div>
            )}
          </div>

          <div className="text-[9px] text-slate-400 border-t border-slate-200 pt-2 w-full">
            Généré automatiquement par ÉGLISEBF • Plateforme Ecclésiastique Sécurisée
          </div>

        </div>

      </div>

    </div>
  );
};
