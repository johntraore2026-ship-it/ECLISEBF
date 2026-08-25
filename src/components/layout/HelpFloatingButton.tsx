import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  X,
  BookOpen,
  Keyboard,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Users,
  Wallet,
  Calendar,
  HeartHandshake,
  Sun,
  Moon,
  Search
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';

interface HelpFloatingButtonProps {
  onOpenAddMember?: () => void;
  onOpenAddFinance?: () => void;
  onOpenAddAttendance?: () => void;
  setActiveTab?: (tab: string) => void;
}

export const HelpFloatingButton: React.FC<HelpFloatingButtonProps> = ({
  onOpenAddMember,
  onOpenAddFinance,
  onOpenAddAttendance,
  setActiveTab
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTabSection, setActiveTabSection] = useState<'GUIDE' | 'SHORTCUTS' | 'ROLES'>('GUIDE');
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  // Listen for global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Alt modifier
      if (e.altKey) {
        if (e.key.toLowerCase() === 'n' && onOpenAddMember) {
          e.preventDefault();
          onOpenAddMember();
          toast.info("Raccourci Alt+N : Ouverture du formulaire Nouveau Membre");
        } else if (e.key.toLowerCase() === 'f' && onOpenAddFinance) {
          e.preventDefault();
          onOpenAddFinance();
          toast.info("Raccourci Alt+F : Ouverture de la saisie financière");
        } else if (e.key.toLowerCase() === 'c' && onOpenAddAttendance) {
          e.preventDefault();
          onOpenAddAttendance();
          toast.info("Raccourci Alt+C : Ouverture du pointage de culte");
        } else if (e.key.toLowerCase() === 'd' && setActiveTab) {
          e.preventDefault();
          setActiveTab('dashboard');
          toast.info("Raccourci Alt+D : Navigation vers le Tableau de Bord");
        } else if (e.key.toLowerCase() === 't') {
          e.preventDefault();
          toggleTheme();
          toast.info(`Thème basculé en mode ${theme === 'dark' ? 'Clair' : 'Sombre'}`);
        } else if (e.key.toLowerCase() === 'h') {
          e.preventDefault();
          setIsOpen((prev) => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenAddMember, onOpenAddFinance, onOpenAddAttendance, setActiveTab, toggleTheme, theme, toast]);

  return (
    <>
      {/* Floating Action Button on Bottom Left */}
      <button
        id="floating-help-button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-40 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white p-3 rounded-2xl shadow-2xl border border-emerald-400/40 flex items-center gap-2 group transition transform hover:scale-105"
        title="Aide & Documentation Rapide (Raccourci Alt+H)"
      >
        <HelpCircle className="w-5 h-5 animate-pulse" />
        <span className="text-xs font-bold hidden sm:inline pr-1">Aide & Guide</span>
      </button>

      {/* Help Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Centre d'Aide & Guide Administrateur</h2>
                  <p className="text-xs text-slate-400">Documentation rapide, conseils de démarrage et raccourcis clavier</p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-tab Navigation */}
            <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTabSection('GUIDE')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  activeTabSection === 'GUIDE'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Guide de Démarrage
              </button>

              <button
                onClick={() => setActiveTabSection('SHORTCUTS')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  activeTabSection === 'SHORTCUTS'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Keyboard className="w-3.5 h-3.5" />
                Raccourcis Clavier
              </button>

              <button
                onClick={() => setActiveTabSection('ROLES')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  activeTabSection === 'ROLES'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Rôles & Accès RLS
              </button>
            </div>

            {/* TAB 1: GUIDE */}
            {activeTabSection === 'GUIDE' && (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 bg-emerald-950/50 border border-emerald-800/80 rounded-2xl text-emerald-200 leading-relaxed">
                  👋 <strong>Bienvenue sur ÉGLISE-BF</strong> ! Cette plateforme vous permet de gérer l'ensemble des activités spirituelles, financières et administratives de votre communauté paroissiale en Afrique de l'Ouest.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="font-bold text-white flex items-center gap-1.5 text-xs">
                      <Users className="w-4 h-4 text-emerald-400" /> 1. Registre des Membres
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Ajoutez des membres avec leur statut spirituel (Nouveau converti, Baptisé), profession, coordonnées et rattachement aux départements ou cellules de prière.
                    </p>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="font-bold text-white flex items-center gap-1.5 text-xs">
                      <Wallet className="w-4 h-4 text-amber-400" /> 2. Gestion Financière
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Enregistrez les dîmes (avec sélection optionnelle du membre donateur), offrandes et dépenses. Les dépenses font l'objet d'un circuit de validation sécurisé.
                    </p>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="font-bold text-white flex items-center gap-1.5 text-xs">
                      <Calendar className="w-4 h-4 text-blue-400" /> 3. Pointage des Cultes
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Comptez facilement l'assistance globale (Hommes, Femmes, Enfants, Visiteurs) lors des cultes dominicaux et réunions de prière.
                    </p>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="font-bold text-white flex items-center gap-1.5 text-xs">
                      <HeartHandshake className="w-4 h-4 text-purple-400" /> 4. Secret Pastoral Scellé
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Module ultra-confidentiel réservé aux Pasteurs et chargés d'âmes pour consigner les entretiens de conseil et visites d'intercession.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SHORTCUTS */}
            {activeTabSection === 'SHORTCUTS' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-300">
                  Appuyez sur les combinaisons de touches ci-dessous depuis n'importe quel écran pour exécuter l'action rapidement :
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-300">Nouveau Membre</span>
                    <kbd className="bg-slate-800 text-emerald-400 font-mono font-bold px-2 py-1 rounded text-[11px] border border-slate-700">Alt + N</kbd>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-300">Saisie Dîme / Recette</span>
                    <kbd className="bg-slate-800 text-emerald-400 font-mono font-bold px-2 py-1 rounded text-[11px] border border-slate-700">Alt + F</kbd>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-300">Pointage Assistance Culte</span>
                    <kbd className="bg-slate-800 text-emerald-400 font-mono font-bold px-2 py-1 rounded text-[11px] border border-slate-700">Alt + C</kbd>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-300">Tableau de Bord</span>
                    <kbd className="bg-slate-800 text-emerald-400 font-mono font-bold px-2 py-1 rounded text-[11px] border border-slate-700">Alt + D</kbd>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-300">Basculer Mode Clair/Sombre</span>
                    <kbd className="bg-slate-800 text-emerald-400 font-mono font-bold px-2 py-1 rounded text-[11px] border border-slate-700">Alt + T</kbd>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-300">Ouvrir ce Guide d'Aide</span>
                    <kbd className="bg-slate-800 text-emerald-400 font-mono font-bold px-2 py-1 rounded text-[11px] border border-slate-700">Alt + H</kbd>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: ROLES */}
            {activeTabSection === 'ROLES' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-300">
                  Les accès et autorisations de la plateforme sont strictement régis par la politique <strong>Row Level Security (RLS)</strong> de PostgreSQL :
                </div>

                <div className="space-y-2">
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 shrink-0">CHURCH_ADMIN</span>
                    <p className="text-slate-300 text-[11px]">Accès complet à tous les modules, approbation financière, gestion des membres et paramétrage de l'église.</p>
                  </div>

                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800 shrink-0">PASTOR</span>
                    <p className="text-slate-300 text-[11px]">Accès exclusif au module <em>Secret Pastoral Scellé</em>, dossiers d'entretien et suivi spirituel des membres.</p>
                  </div>

                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800 shrink-0">TREASURER</span>
                    <p className="text-slate-300 text-[11px]">Gestion des transactions financières, encaissement des dîmes, validation des dépenses et génération des rapports CSV.</p>
                  </div>

                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800 shrink-0">SECRETARY</span>
                    <p className="text-slate-300 text-[11px]">Saisie des fiches membres, gestion des présences aux cultes et publication des annonces paroissiales.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={toggleTheme}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800"
              >
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-300" />}
                <span>Passer en mode {theme === 'dark' ? 'Clair' : 'Sombre'} (Alt+T)</span>
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
              >
                J'ai compris
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
