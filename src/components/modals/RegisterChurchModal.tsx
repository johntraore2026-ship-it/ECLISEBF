import React, { useState } from 'react';
import { X, Church, User, MapPin, Phone, Mail, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { RegisterChurchParams } from '../../services/churchService';

interface RegisterChurchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RegisterChurchModal: React.FC<RegisterChurchModalProps> = ({ isOpen, onClose }) => {
  const { registerNewChurch, isDemoMode, isConfigured } = useAuth();

  const [formData, setFormData] = useState<RegisterChurchParams>({
    church_name: '',
    city: 'Ouagadougou',
    neighborhood: '',
    address: '',
    phone: '',
    email: '',
    pastor_name: '',
    description: '',
    first_name: '',
    last_name: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.church_name || !formData.city || !formData.first_name || !formData.last_name) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await registerNewChurch(formData);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1800);
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'enregistrement de l'église");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl text-white shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-950 border border-emerald-700/60 text-emerald-400">
              <Church className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Inscrire une Nouvelle Église Locale</h2>
              <p className="text-xs text-slate-400">Création sécurisée d'un tenant indépendant avec rôle CHURCH_ADMIN</p>
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

        {/* Content */}
        {success ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-900/60 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-600">
              <CheckCircle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white">Église Enregistrée avec Succès !</h3>
            <p className="text-sm text-slate-300">
              L'instance multi-tenant pour <strong className="text-emerald-400">{formData.church_name}</strong> a été initialisée avec ses catégories financières et ses règles RLS.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="bg-red-950/80 border border-red-800 text-red-200 text-xs p-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Church Details */}
              <div className="space-y-3 md:col-span-2">
                <h4 className="text-xs font-semibold uppercase text-emerald-400 tracking-wider">
                  Informations de l'Église
                </h4>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nom de l'Église <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Église Évangélique Béthel"
                  value={formData.church_name}
                  onChange={(e) => setFormData({ ...formData, church_name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Pasteur Principal
                </label>
                <input
                  type="text"
                  placeholder="Ex: Pasteur Samuel Ouedraogo"
                  value={formData.pastor_name}
                  onChange={(e) => setFormData({ ...formData, pastor_name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Ville <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Ouagadougou, Bobo-Dioulasso, Koudougou..."
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Quartier / Secteur
                </label>
                <input
                  type="text"
                  placeholder="Ex: Ouaga 2000 / Patte d'Oie"
                  value={formData.neighborhood}
                  onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Téléphone Contact
                </label>
                <input
                  type="tel"
                  placeholder="Ex: +226 25 37 00 00"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Email Église
                </label>
                <input
                  type="email"
                  placeholder="contact@eglise.bf"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                />
              </div>

              {/* Admin Creator Details */}
              <div className="space-y-3 md:col-span-2 pt-2 border-t border-slate-800">
                <h4 className="text-xs font-semibold uppercase text-emerald-400 tracking-wider">
                  Administrateur Référent (Rôle Sécurisé CHURCH_ADMIN)
                </h4>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Prénom <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Samuel"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nom <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Ouedraogo"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                id="submit-register-church-btn"
                className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition flex items-center gap-2 disabled:opacity-50"
              >
                <Church className="w-4 h-4" />
                {loading ? 'Création en cours...' : 'Initialiser l\'Église'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
