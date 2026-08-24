import React, { useState, useEffect } from 'react';
import { X, UserPlus, Save, AlertCircle, User, Phone, Mail, MapPin, Award } from 'lucide-react';
import { Member, Gender, MaritalStatus, SpiritualStatus } from '../../types';
import { memberService } from '../../services/memberService';
import { useAuth } from '../../contexts/AuthContext';

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberToEdit?: Member | null;
  onMemberSaved: () => void;
}

export const MemberModal: React.FC<MemberModalProps> = ({
  isOpen,
  onClose,
  memberToEdit,
  onMemberSaved
}) => {
  const { churchId, isDemoMode } = useAuth();

  const [formData, setFormData] = useState<Partial<Member>>({
    first_name: '',
    last_name: '',
    gender: 'MALE',
    phone: '',
    email: '',
    birth_date: '',
    profession: '',
    address: '',
    neighborhood: '',
    city: 'Ouagadougou',
    marital_status: 'SINGLE',
    spiritual_status: 'COMMUNICANT',
    baptism_date: '',
    baptism_place: '',
    join_date: new Date().toISOString().split('T')[0],
    is_active: true,
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (memberToEdit) {
      setFormData(memberToEdit);
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        gender: 'MALE',
        phone: '',
        email: '',
        birth_date: '',
        profession: '',
        address: '',
        neighborhood: '',
        city: 'Ouagadougou',
        marital_status: 'SINGLE',
        spiritual_status: 'COMMUNICANT',
        baptism_date: '',
        baptism_place: '',
        join_date: new Date().toISOString().split('T')[0],
        is_active: true,
        notes: '',
      });
    }
  }, [memberToEdit, isOpen]);

  if (!isOpen || !churchId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.first_name || !formData.last_name) {
      setError('Le prénom et le nom sont obligatoires.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (memberToEdit) {
        await memberService.updateMember(memberToEdit.id, formData, churchId, isDemoMode);
      } else {
        await memberService.createMember({
          church_id: churchId,
          first_name: formData.first_name!,
          last_name: formData.last_name!,
          gender: (formData.gender as Gender) || 'MALE',
          phone: formData.phone,
          email: formData.email,
          birth_date: formData.birth_date,
          profession: formData.profession,
          address: formData.address,
          neighborhood: formData.neighborhood,
          city: formData.city || 'Ouagadougou',
          marital_status: (formData.marital_status as MaritalStatus) || 'SINGLE',
          spiritual_status: (formData.spiritual_status as SpiritualStatus) || 'COMMUNICANT',
          baptism_date: formData.baptism_date,
          baptism_place: formData.baptism_place,
          join_date: formData.join_date || new Date().toISOString().split('T')[0],
          is_active: formData.is_active ?? true,
          notes: formData.notes,
        }, isDemoMode);
      }

      onMemberSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl text-white shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-950 border border-emerald-700/60 text-emerald-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {memberToEdit ? 'Modifier la Fiche du Membre' : 'Nouveau Membre de l\'Église'}
              </h2>
              <p className="text-xs text-slate-400">Fiche complète individuelle et statut spirituel</p>
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="bg-red-950/80 border border-red-800 text-red-200 text-xs p-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Section: Identité */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase text-emerald-400 tracking-wider flex items-center gap-2">
              <User className="w-3.5 h-3.5" />
              1. Identité Civile
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Prénom <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Aristide"
                  value={formData.first_name || ''}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nom de Famille <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Zoungrana"
                  value={formData.last_name || ''}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Genre</label>
                <select
                  value={formData.gender || 'MALE'}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                  aria-label="Genre"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="MALE">Homme (Masculin)</option>
                  <option value="FEMALE">Femme (Féminin)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Date de Naissance</label>
                <input
                  type="date"
                  value={formData.birth_date || ''}
                  onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">État Matrimonial</label>
                <select
                  value={formData.marital_status || 'SINGLE'}
                  onChange={(e) => setFormData({ ...formData, marital_status: e.target.value as MaritalStatus })}
                  aria-label="État Matrimonial"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="SINGLE">Célibataire</option>
                  <option value="MARRIED">Marié(e)</option>
                  <option value="WIDOWED">Veuf / Veuve</option>
                  <option value="DIVORCED">Divorcé(e)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Profession / Activité</label>
                <input
                  type="text"
                  placeholder="Ex: Ingénieur, Commerçant, Étudiant..."
                  value={formData.profession || ''}
                  onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section: Coordonnées */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <h4 className="text-xs font-bold uppercase text-emerald-400 tracking-wider flex items-center gap-2">
              <Phone className="w-3.5 h-3.5" />
              2. Contacts & Localisation
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Téléphone Principal</label>
                <input
                  type="tel"
                  placeholder="Ex: +226 70 12 34 56"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="membre@email.com"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Quartier / Secteur</label>
                <input
                  type="text"
                  placeholder="Ex: Dassasgho / Secteur 28"
                  value={formData.neighborhood || ''}
                  onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section: Statut Spirituel & Église */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <h4 className="text-xs font-bold uppercase text-emerald-400 tracking-wider flex items-center gap-2">
              <Award className="w-3.5 h-3.5" />
              3. Statut Spirituel & Engagement Ecclésial
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Statut Spirituel</label>
                <select
                  value={formData.spiritual_status || 'COMMUNICANT'}
                  onChange={(e) => setFormData({ ...formData, spiritual_status: e.target.value as SpiritualStatus })}
                  aria-label="Statut Spirituel"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="INQUIRER">Sympathisant / En recherche</option>
                  <option value="NEW_CONVERT">Nouveau Converti (En affermissement)</option>
                  <option value="BAPTIZED">Baptisé d'eau</option>
                  <option value="COMMUNICANT">Membre Communicant (Sainte-Cène)</option>
                  <option value="WORKER">Ouvrier / Serviteur Actif</option>
                  <option value="DEACON">Diacre / Diaconesse</option>
                  <option value="ELDER">Ancien de l'Église</option>
                  <option value="PASTOR">Pasteur / Prédicateur</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Date de Baptême d'eau</label>
                <input
                  type="date"
                  value={formData.baptism_date || ''}
                  onChange={(e) => setFormData({ ...formData, baptism_date: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Date d'Arrivée à l'Église</label>
                <input
                  type="date"
                  value={formData.join_date || ''}
                  onChange={(e) => setFormData({ ...formData, join_date: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Notes et Ministères Particuliers</label>
              <textarea
                rows={2}
                placeholder="Ex: Chantre à la Louange, Responsable sonorisation, etc."
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 outline-none"
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
              id="submit-member-btn"
              className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Enregistrement...' : (memberToEdit ? 'Mettre à jour' : 'Enregistrer le Membre')}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
