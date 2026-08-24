import React from 'react';
import {
  LayoutDashboard,
  Users,
  Network,
  CalendarCheck,
  Wallet,
  HeartHandshake,
  GraduationCap,
  Music,
  Calendar,
  ShieldCheck,
  Database,
  Lock,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { hasRole, hasPermission } = useAuth();

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      icon: LayoutDashboard,
      badge: null,
      allowed: true,
    },
    {
      id: 'members',
      label: 'Membres & Familles',
      icon: Users,
      badge: null,
      allowed: true,
    },
    {
      id: 'departments',
      label: 'Départements & Cellules',
      icon: Network,
      badge: null,
      allowed: true,
    },
    {
      id: 'attendance',
      label: 'Cultes & Présences',
      icon: CalendarCheck,
      badge: null,
      allowed: true,
    },
    {
      id: 'finance',
      label: 'Finances & Dîmes',
      icon: Wallet,
      badge: 'Circuit Valid.',
      allowed: true,
    },
    {
      id: 'pastoral',
      label: 'Suivi Pastoral & Prières',
      icon: HeartHandshake,
      badge: 'Confidentiel',
      allowed: true,
    },
    {
      id: 'training',
      label: 'Formations & Discipulat',
      icon: GraduationCap,
      badge: null,
      allowed: true,
    },
    {
      id: 'media',
      label: 'Médiathèque & Sermons',
      icon: Music,
      badge: null,
      allowed: true,
    },
    {
      id: 'events',
      label: 'Événements & Annonces',
      icon: Calendar,
      badge: null,
      allowed: true,
    },
    {
      id: 'audit',
      label: 'Audit & Sécurité RLS',
      icon: ShieldCheck,
      badge: 'Admin',
      allowed: true,
    },
    {
      id: 'config',
      label: 'Configuration Supabase',
      icon: Database,
      badge: 'SQL',
      allowed: true,
    },
  ];

  return (
    <aside id="main-navigation-sidebar" className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      
      {/* Category header */}
      <div className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
        Gestion Église Locale
      </div>

      {/* Menu items */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto pb-6">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition ${
                isActive
                  ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>

              <div className="flex items-center gap-1">
                {item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      isActive
                        ? 'bg-emerald-800 text-emerald-100'
                        : item.badge === 'Confidentiel'
                        ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                        : item.badge === 'Circuit Valid.'
                        ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-emerald-200" />}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Bottom tenant & security info */}
      <div className="p-3 bg-slate-950/60 border-t border-slate-800/80 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5 font-semibold text-slate-300 mb-1">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>Isolation PostgreSQL RLS</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-relaxed">
          Toutes les requêtes sont filtrées au niveau base de données par <code className="text-emerald-300">church_id</code>.
        </p>
      </div>

    </aside>
  );
};
