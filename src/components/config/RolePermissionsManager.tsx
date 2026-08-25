import React, { useState } from 'react';
import {
  ShieldCheck,
  Shield,
  Plus,
  Check,
  X,
  Copy,
  Database,
  Lock,
  UserCheck,
  KeyRound,
  Info,
  Sparkles,
  ChevronRight,
  Save,
  RotateCcw
} from 'lucide-react';
import { Role, Permission } from '../../types';
import { DEMO_ROLES, DEMO_PERMISSIONS } from '../../data/demoData';

interface PermissionCategory {
  id: string;
  label: string;
  icon: string;
  description: string;
  permissions: {
    code: string;
    name: string;
    description: string;
  }[];
}

const PERMISSION_CATEGORIES: PermissionCategory[] = [
  {
    id: 'finance',
    label: '💰 Finances, Dîmes & Comptabilité',
    icon: 'Wallet',
    description: 'Accès au grand livre, enregistrement des dîmes et validation des dépenses',
    permissions: [
      { code: 'finance.read', name: 'Consulter les Finances', description: 'Voir les recettes, dépenses et bilans généraux' },
      { code: 'finance.create', name: 'Saisir une Écriture', description: 'Enregistrer une recette, dîme ou demande de dépense' },
      { code: 'finance.approve', name: 'Valider les Décaissements', description: 'Approuver ou rejeter les demandes de dépenses' },
      { code: 'finance.export', name: 'Exporter les Rapports CSV', description: 'Télécharger les bilans comptables officiels' },
    ]
  },
  {
    id: 'pastoral',
    label: '✝️ Dossiers Pastoraux & Soins Spirituels',
    icon: 'HeartHandshake',
    description: 'Gestion des entretiens pastoraux, visites et requêtes de prière',
    permissions: [
      { code: 'pastoral.read', name: 'Consulter les Dossiers Pastoraux', description: 'Voir l\'historique spirituel des membres' },
      { code: 'pastoral.create', name: 'Créer un Compte-Rendu Pastoral', description: 'Rédiger une note de suivi d\'entretien' },
      { code: 'pastoral.confidential_seal', name: 'Sceau Secret Pastoral', description: 'Consulter les notes hautement confidentielles' },
    ]
  },
  {
    id: 'members',
    label: '👥 Registre des Membres & Familles',
    icon: 'Users',
    description: 'Annuaire nominatif, fiche d\'identité, appartenances et baptêmes',
    permissions: [
      { code: 'members.read', name: 'Consulter l\'Annuaire', description: 'Rechercher et afficher la liste des membres' },
      { code: 'members.create', name: 'Ajouter un Membre', description: 'Enregistrer une nouvelle fiche de fidèle' },
      { code: 'members.edit', name: 'Modifier une Fiche Membre', description: 'Mettre à jour les coordonnées et départements' },
      { code: 'members.delete', name: 'Archiver / Supprimer', description: 'Retirer un membre de l\'annuaire actif' },
    ]
  },
  {
    id: 'groups',
    label: '🏢 Départements & Groupes de Maison',
    icon: 'Building2',
    description: 'Coordination des ministères, cellules de prière et nominations',
    permissions: [
      { code: 'departments.manage', name: 'Gérer les Départements', description: 'Créer et organiser les départements de l\'église' },
      { code: 'groups.manage', name: 'Gérer les Cellules de Prière', description: 'Assigner les responsables de groupes de maison' },
    ]
  },
  {
    id: 'events',
    label: '📅 Événements, Cultes & Communiqués',
    icon: 'Calendar',
    description: 'Planification des services, conférences et annonces officielles',
    permissions: [
      { code: 'events.read', name: 'Consulter le Calendrier', description: 'Voir le programme des cultes et activités' },
      { code: 'events.create', name: 'Programmer un Événement', description: 'Publier une activité ou culte spécial' },
      { code: 'announcements.publish', name: 'Diffuser une Annonce', description: 'Épingler un communiqué officiel sur le bulletin' },
    ]
  },
  {
    id: 'training',
    label: '🎓 Formations, Académie & Médias',
    icon: 'BookOpen',
    description: 'Cours de baptême, école du dimanche, prédications et enregistrements',
    permissions: [
      { code: 'training.access', name: 'Accéder aux Formations', description: 'Suivre les modules de cours bibliques' },
      { code: 'training.manage', name: 'Créer / Administrer les Cours', description: 'Ajouter des leçons et vidéos de formation' },
      { code: 'media.upload', name: 'Publier Prédications & Médias', description: 'Téléverser des audios/vidéos de cultes' },
    ]
  },
  {
    id: 'settings',
    label: '⚙️ Configuration & Sécurité Supabase',
    icon: 'Shield',
    description: 'Paramètres système, rôles, politiques RLS et journaux d\'audit',
    permissions: [
      { code: 'settings.manage', name: 'Gérer la Configuration', description: 'Configurer les connexions Supabase & RLS' },
      { code: 'roles.manage', name: 'Administrer les Rôles & Permissions', description: 'Définir la matrice des autorisations' },
      { code: 'audit.view', name: 'Consulter le Journal d\'Audit', description: 'Tracer les opérations sensibles des utilisateurs' },
    ]
  }
];

// Initial default role permission mapping
const INITIAL_ROLE_PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN: [
    'finance.read', 'finance.create', 'finance.approve', 'finance.export',
    'pastoral.read', 'pastoral.create', 'pastoral.confidential_seal',
    'members.read', 'members.create', 'members.edit', 'members.delete',
    'departments.manage', 'groups.manage',
    'events.read', 'events.create', 'announcements.publish',
    'training.access', 'training.manage', 'media.upload',
    'settings.manage', 'roles.manage', 'audit.view'
  ],
  CHURCH_ADMIN: [
    'finance.read', 'finance.create', 'finance.approve', 'finance.export',
    'pastoral.read', 'pastoral.create',
    'members.read', 'members.create', 'members.edit', 'members.delete',
    'departments.manage', 'groups.manage',
    'events.read', 'events.create', 'announcements.publish',
    'training.access', 'training.manage', 'media.upload',
    'settings.manage', 'roles.manage', 'audit.view'
  ],
  PASTOR: [
    'finance.read',
    'pastoral.read', 'pastoral.create', 'pastoral.confidential_seal',
    'members.read', 'members.create', 'members.edit',
    'departments.manage', 'groups.manage',
    'events.read', 'events.create', 'announcements.publish',
    'training.access', 'training.manage', 'media.upload',
    'audit.view'
  ],
  TREASURER: [
    'finance.read', 'finance.create', 'finance.approve', 'finance.export',
    'members.read',
    'events.read',
    'training.access'
  ],
  SECRETARY: [
    'finance.read', 'finance.create',
    'members.read', 'members.create', 'members.edit',
    'departments.manage', 'groups.manage',
    'events.read', 'events.create', 'announcements.publish',
    'training.access'
  ],
  LEADER: [
    'members.read',
    'groups.manage',
    'events.read', 'events.create',
    'training.access', 'media.upload'
  ],
  MEMBER: [
    'events.read',
    'training.access'
  ]
};

export const RolePermissionsManager: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>(DEMO_ROLES);
  const [selectedRoleCode, setSelectedRoleCode] = useState<string>('CHURCH_ADMIN');
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>(INITIAL_ROLE_PERMISSIONS);
  
  // Modal for creating custom role
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleCode, setNewRoleCode] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');

  // SQL code generation feedback
  const [copiedSql, setCopiedSql] = useState(false);
  const [savedSuccessMessage, setSavedSuccessMessage] = useState<string | null>(null);

  const selectedRole = roles.find(r => r.code === selectedRoleCode) || roles[0];
  const activePermissions = rolePermissions[selectedRoleCode] || [];

  const handleTogglePermission = (permCode: string) => {
    setRolePermissions(prev => {
      const currentList = prev[selectedRoleCode] || [];
      const hasPerm = currentList.includes(permCode);
      const updated = hasPerm
        ? currentList.filter(c => c !== permCode)
        : [...currentList, permCode];

      return {
        ...prev,
        [selectedRoleCode]: updated
      };
    });
  };

  const handleToggleCategory = (category: PermissionCategory) => {
    const categoryCodes = category.permissions.map(p => p.code);
    const allEnabled = categoryCodes.every(code => activePermissions.includes(code));

    setRolePermissions(prev => {
      const currentList = prev[selectedRoleCode] || [];
      let updated: string[];

      if (allEnabled) {
        // Remove all from category
        updated = currentList.filter(code => !categoryCodes.includes(code));
      } else {
        // Add all missing from category
        const toAdd = categoryCodes.filter(code => !currentList.includes(code));
        updated = [...currentList, ...toAdd];
      }

      return {
        ...prev,
        [selectedRoleCode]: updated
      };
    });
  };

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    const code = newRoleCode.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_') || `ROLE_${Date.now()}`;
    const newRole: Role = {
      id: `role_${Date.now()}`,
      code,
      name: newRoleName.trim(),
      level: 8,
      is_system: false,
    };

    setRoles(prev => [...prev, newRole]);
    setRolePermissions(prev => ({
      ...prev,
      [code]: ['events.read', 'training.access']
    }));

    setSelectedRoleCode(code);
    setShowAddRoleModal(false);
    setNewRoleName('');
    setNewRoleCode('');
    setNewRoleDescription('');

    setSavedSuccessMessage(`Nouveau rôle "${newRole.name}" créé avec succès !`);
    setTimeout(() => setSavedSuccessMessage(null), 3500);
  };

  const handleResetToDefaults = () => {
    if (confirm("Réinitialiser les permissions aux valeurs système recommandées ?")) {
      setRolePermissions(INITIAL_ROLE_PERMISSIONS);
      setSavedSuccessMessage("Matrice des permissions réinitialisée aux normes.");
      setTimeout(() => setSavedSuccessMessage(null), 3000);
    }
  };

  // Generate Supabase SQL DDL and Policies for Roles & Permissions
  const generateSupabaseSql = (): string => {
    let sql = `-- ========================================================\n`;
    sql += `-- CONFIGURATION DES RÔLES ET PERMISSIONS EN BASE DE DONNÉES SUPABASE\n`;
    sql += `-- ÉGLISE INTEL (RLS & TABLES DE SÉCURITÉ)\n`;
    sql += `-- ========================================================\n\n`;

    sql += `-- 1. CRÉATION DE LA TABLE DES RÔLES\n`;
    sql += `CREATE TABLE IF NOT EXISTS public.roles (\n`;
    sql += `  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n`;
    sql += `  code TEXT UNIQUE NOT NULL,\n`;
    sql += `  name TEXT NOT NULL,\n`;
    sql += `  level INT DEFAULT 10,\n`;
    sql += `  is_system BOOLEAN DEFAULT false,\n`;
    sql += `  created_at TIMESTAMPTZ DEFAULT NOW()\n`;
    sql += `);\n\n`;

    sql += `-- 2. CRÉATION DE LA TABLE DES PERMISSIONS PAR RÔLE\n`;
    sql += `CREATE TABLE IF NOT EXISTS public.role_permissions (\n`;
    sql += `  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n`;
    sql += `  role_code TEXT NOT NULL REFERENCES public.roles(code) ON DELETE CASCADE,\n`;
    sql += `  permission_code TEXT NOT NULL,\n`;
    sql += `  created_at TIMESTAMPTZ DEFAULT NOW(),\n`;
    sql += `  UNIQUE(role_code, permission_code)\n`;
    sql += `);\n\n`;

    sql += `-- 3. INSERTION OU MISE À JOUR DES RÔLES\n`;
    roles.forEach(r => {
      sql += `INSERT INTO public.roles (code, name, level, is_system)\n`;
      sql += `VALUES ('${r.code}', '${r.name.replace(/'/g, "''")}', ${r.level || 10}, ${r.is_system ? 'true' : 'false'})\n`;
      sql += `ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name;\n`;
    });

    sql += `\n-- 4. AFFECATION DES PERMISSIONS ACTUELLES PAR RÔLE\n`;
    sql += `DELETE FROM public.role_permissions;\n`;

    Object.entries(rolePermissions).forEach(([code, perms]) => {
      (perms as string[]).forEach(p => {
        sql += `INSERT INTO public.role_permissions (role_code, permission_code) VALUES ('${code}', '${p}') ON CONFLICT DO NOTHING;\n`;
      });
    });

    sql += `\n-- 5. FONCTION STOCKÉE RLS SUPABASE : CONTRÔLE D'ACCÈS DE L'UTILISATEUR CONNECTÉ\n`;
    sql += `CREATE OR REPLACE FUNCTION public.has_permission(p_permission TEXT)\n`;
    sql += `RETURNS BOOLEAN AS $$\n`;
    sql += `BEGIN\n`;
    sql += `  RETURN EXISTS (\n`;
    sql += `    SELECT 1 FROM public.user_roles ur\n`;
    sql += `    JOIN public.role_permissions rp ON rp.role_code = ur.role_code\n`;
    sql += `    WHERE ur.user_id = auth.uid()\n`;
    sql += `    AND rp.permission_code = p_permission\n`;
    sql += `  );\n`;
    sql += `END;\n`;
    sql += `$$ LANGUAGE plpgsql SECURITY DEFINER;\n`;

    return sql;
  };

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(generateSupabaseSql());
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
      
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Gestion des Rôles & Habilitations Supabase</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Définissez les droits d'accès par fonction (Pasteur, Trésorier, Secrétaire, Membre) et générez les politiques RLS PostgreSQL
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetToDefaults}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            title="Réinitialiser la matrice des autorisations"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Réinitialiser
          </button>
          
          <button
            onClick={() => setShowAddRoleModal(true)}
            id="add-custom-role-btn"
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow transition"
          >
            <Plus className="w-4 h-4" />
            Nouveau Rôle
          </button>
        </div>
      </div>

      {savedSuccessMessage && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-800/80 rounded-xl text-xs text-emerald-300 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{savedSuccessMessage}</span>
          </div>
        </div>
      )}

      {/* Role Selection Tabs */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
          Sélectionner le Rôle à Configurer :
        </label>
        <div className="flex flex-wrap items-center gap-2">
          {roles.map((r) => {
            const isSelected = r.code === selectedRoleCode;
            const permCount = (rolePermissions[r.code] || []).length;

            return (
              <button
                key={r.id || r.code}
                onClick={() => setSelectedRoleCode(r.code)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition border ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-md ring-2 ring-emerald-500/30'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
              >
                <span>{r.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isSelected ? 'bg-emerald-950 text-emerald-300' : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  {permCount} perm.
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Permissions Matrix for Selected Role */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-4 rounded-xl border border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-white text-sm">
                Droits d'Accès accordés au rôle : <span className="text-emerald-400">{selectedRole?.name}</span> ({selectedRole?.code})
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Activer ou désactiver les permissions individuelles. Les changements s'appliquent immédiatement à la session.
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="text-xs text-slate-400 block">Total Habilitations</span>
            <span className="text-lg font-extrabold text-emerald-400">{activePermissions.length} / 22</span>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PERMISSION_CATEGORIES.map((cat) => {
            const catCodes = cat.permissions.map(p => p.code);
            const activeInCat = catCodes.filter(code => activePermissions.includes(code));
            const allInCatActive = activeInCat.length === catCodes.length;
            const noneInCatActive = activeInCat.length === 0;

            return (
              <div
                key={cat.id}
                className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3 hover:border-slate-700 transition"
              >
                {/* Category Header with Toggle All Button */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div>
                    <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                      {cat.label}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{cat.description}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleCategory(cat)}
                    className={`text-[10px] px-2 py-1 rounded font-semibold transition border ${
                      allInCatActive
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                    }`}
                  >
                    {allInCatActive ? 'Tout retirer' : 'Tout accorder'}
                  </button>
                </div>

                {/* Individual Permission Checkboxes */}
                <div className="space-y-2 pt-1">
                  {cat.permissions.map((perm) => {
                    const isChecked = activePermissions.includes(perm.code);

                    return (
                      <label
                        key={perm.code}
                        className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer transition border ${
                          isChecked
                            ? 'bg-emerald-950/30 border-emerald-800/40 text-slate-200'
                            : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:bg-slate-800/40'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleTogglePermission(perm.code)}
                          className="mt-0.5 rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-emerald-500 w-4 h-4 cursor-pointer shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-xs font-semibold ${isChecked ? 'text-white' : 'text-slate-400'}`}>
                              {perm.name}
                            </span>
                            <span className="text-[9px] font-mono text-slate-500 shrink-0">{perm.code}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">{perm.description}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Supabase SQL Export Block */}
      <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-4 h-4 text-emerald-400" />
              Code SQL DDL & Politiques RLS pour Supabase
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Copiez et exécutez ces instructions SQL dans le SQL Editor de Supabase pour synchroniser la sécurité serveur.
            </p>
          </div>

          <button
            onClick={copySqlToClipboard}
            id="copy-roles-sql-btn"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow"
          >
            {copiedSql ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
            {copiedSql ? 'Code SQL Copié !' : 'Copier SQL Supabase'}
          </button>
        </div>

        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto max-h-48 leading-relaxed">
          <pre>{generateSupabaseSql()}</pre>
        </div>
      </div>

      {/* Add Custom Role Modal */}
      {showAddRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md text-white shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base text-white">Créer un Nouveau Rôle Utilisateur</h3>
              </div>
              <button
                onClick={() => setShowAddRoleModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nom du Rôle *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Ancien d'Église, Diacre, Moniteur Écodim"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Code Technique (Optionnel)</label>
                <input
                  type="text"
                  placeholder="Ex: ELDER, DEACON, ECODIM_LEADER"
                  value={newRoleCode}
                  onChange={(e) => setNewRoleCode(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">Sera généré automatiquement si laissé vide.</p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddRoleModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Créer Rôle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
