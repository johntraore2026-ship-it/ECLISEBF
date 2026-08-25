import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X, User } from 'lucide-react';
import { useAuth } from './AuthContext';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  title?: string;
  message: string;
  type: ToastType;
  actorName?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
  toast: {
    success: (message: string, title?: string) => void;
    error: (message: string, title?: string) => void;
    info: (message: string, title?: string) => void;
    warning: (message: string, title?: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const { profile, roles, demoRole } = useAuth();

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (toastInput: Omit<ToastItem, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const activeName = profile?.first_name
        ? `${profile.first_name}`
        : roles[0]?.name || demoRole || 'Responsable';

      const newToast: ToastItem = {
        ...toastInput,
        id,
        actorName: toastInput.actorName || activeName,
      };

      setToasts((prev) => [newToast, ...prev].slice(0, 5)); // Keep max 5

      const duration = toastInput.duration || 4500;
      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [profile, roles, demoRole, removeToast]
  );

  const toast = {
    success: (message: string, title?: string) =>
      addToast({ message, title: title || 'Succès', type: 'success' }),
    error: (message: string, title?: string) =>
      addToast({ message, title: title || 'Erreur', type: 'error' }),
    info: (message: string, title?: string) =>
      addToast({ message, title: title || 'Information', type: 'info' }),
    warning: (message: string, title?: string) =>
      addToast({ message, title: title || 'Attention', type: 'warning' }),
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, toast }}>
      {children}

      {/* Toast Notification Container in Top-Right Corner */}
      <div
        id="toast-notification-container"
        aria-live="polite"
        aria-atomic="true"
        className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm w-full px-2 sm:px-0 pointer-events-none"
      >
        {toasts.map((t) => {
          let bgClasses = 'bg-slate-900 border-slate-700 text-white shadow-2xl';
          let icon = <Info className="w-5 h-5 text-blue-400 shrink-0" />;
          let badgeClass = 'bg-slate-800 text-slate-300 border-slate-700';

          if (t.type === 'success') {
            bgClasses = 'bg-slate-900/95 border-emerald-500/80 text-white shadow-emerald-950/40 shadow-xl';
            icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />;
            badgeClass = 'bg-emerald-950 text-emerald-300 border-emerald-800';
          } else if (t.type === 'error') {
            bgClasses = 'bg-slate-900/95 border-rose-500/80 text-white shadow-rose-950/40 shadow-xl';
            icon = <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />;
            badgeClass = 'bg-rose-950 text-rose-300 border-rose-800';
          } else if (t.type === 'warning') {
            bgClasses = 'bg-slate-900/95 border-amber-500/80 text-white shadow-amber-950/40 shadow-xl';
            icon = <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />;
            badgeClass = 'bg-amber-950 text-amber-300 border-amber-800';
          }

          return (
            <div
              key={t.id}
              className={`pointer-events-auto border rounded-2xl p-3.5 flex items-start justify-between gap-3 transform transition-all duration-300 animate-in slide-in-from-top-3 fade-in ${bgClasses}`}
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {icon}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    {t.title && <h4 className="text-xs font-bold text-white">{t.title}</h4>}
                    {t.actorName && (
                      <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border flex items-center gap-1 ${badgeClass}`}>
                        <User className="w-2.5 h-2.5" />
                        {t.actorName}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-200 leading-snug break-words">
                    {t.message}
                  </p>
                </div>
              </div>

              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-white transition p-0.5 rounded-lg hover:bg-slate-800 shrink-0"
                title="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
