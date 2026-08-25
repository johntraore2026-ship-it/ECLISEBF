import React, { useState, useEffect } from 'react';
import {
  Plus,
  X,
  CalendarCheck,
  HeartHandshake,
  UserPlus,
  Wallet,
  Zap,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface QuickActionFloatingButtonProps {
  onOpenAddAttendance: () => void;
  onOpenAddPastoral: () => void;
  onOpenAddMember: () => void;
  onOpenAddFinance: () => void;
}

export const QuickActionFloatingButton: React.FC<QuickActionFloatingButtonProps> = ({
  onOpenAddAttendance,
  onOpenAddPastoral,
  onOpenAddMember,
  onOpenAddFinance,
}) => {
  const { hasPermission, canAccessTab } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleAction = (action: () => void) => {
    setIsOpen(false);
    action();
  };

  const canAddAttendance = hasPermission('attendance.create');
  const canAddPastoral = canAccessTab('pastoral') && hasPermission('pastoral.create');
  const canAddMember = hasPermission('members.create');
  const canAddFinance = canAccessTab('finance') && hasPermission('finance.create');

  const hasAnyAction = canAddAttendance || canAddPastoral || canAddMember || canAddFinance;

  if (!hasAnyAction) return null;

  return (
    <>
      {/* Dimmed backdrop when menu is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 transition-opacity animate-in fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Floating Action Menu Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-auto select-none">
        
        {/* Expanded Action Menu Items */}
        {isOpen && (
          <div className="flex flex-col items-end gap-2.5 mb-1 animate-in slide-in-from-bottom-5 duration-200">
            
            {/* 1. Record Attendance */}
            {canAddAttendance && (
              <button
                onClick={() => handleAction(onOpenAddAttendance)}
                id="fab-action-attendance"
                className="flex items-center gap-3 bg-slate-900 hover:bg-slate-800 text-white pl-4 pr-3 py-2.5 rounded-2xl border border-slate-700/90 shadow-2xl transition hover:scale-105 group"
              >
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-100 group-hover:text-emerald-400 transition">
                    Enregistrer une Présence
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Culte dominical ou prière de semaine
                  </div>
                </div>
                <div className="w-9 h-9 rounded-xl bg-emerald-600/90 text-white flex items-center justify-center shadow-md group-hover:bg-emerald-500 transition">
                  <CalendarCheck className="w-5 h-5" />
                </div>
              </button>
            )}

            {/* 2. Create Pastoral Note */}
            {canAddPastoral && (
              <button
                onClick={() => handleAction(onOpenAddPastoral)}
                id="fab-action-pastoral"
                className="flex items-center gap-3 bg-slate-900 hover:bg-slate-800 text-white pl-4 pr-3 py-2.5 rounded-2xl border border-slate-700/90 shadow-2xl transition hover:scale-105 group"
              >
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-100 group-hover:text-purple-400 transition">
                    Nouvelle Note Pastorale
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Visite, entretien ou intercession
                  </div>
                </div>
                <div className="w-9 h-9 rounded-xl bg-purple-600/90 text-white flex items-center justify-center shadow-md group-hover:bg-purple-500 transition">
                  <HeartHandshake className="w-5 h-5" />
                </div>
              </button>
            )}

            {/* 3. Add Member */}
            {canAddMember && (
              <button
                onClick={() => handleAction(onOpenAddMember)}
                id="fab-action-member"
                className="flex items-center gap-3 bg-slate-900 hover:bg-slate-800 text-white pl-4 pr-3 py-2.5 rounded-2xl border border-slate-700/90 shadow-2xl transition hover:scale-105 group"
              >
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-100 group-hover:text-blue-400 transition">
                    Ajouter un Membre
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Fiche nominative et contact
                  </div>
                </div>
                <div className="w-9 h-9 rounded-xl bg-blue-600/90 text-white flex items-center justify-center shadow-md group-hover:bg-blue-500 transition">
                  <UserPlus className="w-5 h-5" />
                </div>
              </button>
            )}

            {/* 4. Saisie Trésorerie */}
            {canAddFinance && (
              <button
                onClick={() => handleAction(onOpenAddFinance)}
                id="fab-action-finance"
                className="flex items-center gap-3 bg-slate-900 hover:bg-slate-800 text-white pl-4 pr-3 py-2.5 rounded-2xl border border-slate-700/90 shadow-2xl transition hover:scale-105 group"
              >
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-100 group-hover:text-amber-400 transition">
                    Saisie Recette / Dépense
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Dîmes, offrandes et factures
                  </div>
                </div>
                <div className="w-9 h-9 rounded-xl bg-amber-600/90 text-white flex items-center justify-center shadow-md group-hover:bg-amber-500 transition">
                  <Wallet className="w-5 h-5" />
                </div>
              </button>
            )}

          </div>
        )}

        {/* Main Floating Trigger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          id="global-quick-action-fab"
          aria-label="Actions rapides"
          className={`flex items-center gap-2 px-4 py-3 rounded-full font-bold text-xs text-white shadow-2xl transition-all duration-300 ${
            isOpen
              ? 'bg-rose-600 hover:bg-rose-500 rotate-90 scale-95 shadow-rose-900/40 ring-4 ring-rose-500/30'
              : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-950/80 hover:shadow-emerald-700/50 hover:scale-105 ring-2 ring-emerald-400/40'
          }`}
          title="Action Rapide : Enregistrer présence, note pastorale, membre..."
        >
          {isOpen ? (
            <X className="w-5 h-5 transition-transform" />
          ) : (
            <>
              <Zap className="w-4 h-4 fill-emerald-300 text-emerald-200 animate-pulse" />
              <span className="font-bold tracking-wide">Action Rapide</span>
            </>
          )}
        </button>

      </div>
    </>
  );
};
