import React, { useState, useEffect } from 'react';
import {
  Church as ChurchIcon,
  ChevronDown,
  PlusCircle,
  Bell,
  User as UserIcon,
  LogOut,
  Shield,
  Layers,
  MapPin,
  RefreshCw,
  Sliders,
  Maximize,
  Minimize,
  Key
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { churchService } from '../../services/churchService';
import { Church } from '../../types';

interface NavbarProps {
  onOpenRegisterChurch: () => void;
  onOpenSqlModal: () => void;
  onOpenCredentialsModal?: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenRegisterChurch,
  onOpenSqlModal,
  onOpenCredentialsModal,
  activeTab,
  setActiveTab
}) => {
  const {
    currentChurch,
    churchId,
    switchChurch,
    profile,
    roles,
    signOut,
    isDemoMode,
    isConfigured,
    demoRole,
    setDemoRole
  } = useAuth();

  const [churches, setChurches] = useState<Church[]>([]);
  const [churchDropdownOpen, setChurchDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(console.error);
      }
    }
  };

  useEffect(() => {
    churchService.listChurches(isDemoMode).then(setChurches).catch(console.error);
  }, [isDemoMode, churchId]);

  const userRoleName = roles.length > 0 ? roles[0].name : (isDemoMode ? demoRole : 'Utilisateur');

  return (
    <header id="main-app-header" className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center shadow-inner border border-emerald-500/40">
              <ChurchIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white font-serif">ÉGLISE<span className="text-emerald-400">BF</span></span>
                <span className="text-[10px] uppercase font-semibold bg-emerald-950 text-emerald-300 border border-emerald-700/60 px-1.5 py-0.2 rounded">
                  SaaS Multi-Églises
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Supabase PostgreSQL • Auth • Storage • RLS</p>
            </div>
          </div>

          {/* Center: Church Multi-tenant Switcher */}
          <div className="relative">
            <button
              id="church-switcher-button"
              onClick={() => setChurchDropdownOpen(!churchDropdownOpen)}
              className="flex items-center gap-2.5 bg-slate-800/90 hover:bg-slate-800 text-slate-200 hover:text-white px-3.5 py-1.5 rounded-lg border border-slate-700 transition shadow-sm text-left max-w-[280px] sm:max-w-xs"
            >
              <div className="p-1 rounded bg-emerald-950 text-emerald-400">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-white truncate">
                  {currentChurch?.name || 'Sélectionner une église'}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {currentChurch?.city || 'Burkina Faso'} • ID: {churchId ? `${churchId.substring(0, 8)}...` : 'Aucun'}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 ml-1 shrink-0" />
            </button>

            {/* Dropdown Menu */}
            {churchDropdownOpen && (
              <div
                id="church-switcher-dropdown"
                className="absolute left-0 mt-2 w-72 bg-slate-850 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 divide-y divide-slate-800"
              >
                <div className="px-3 py-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Églises Enregistrées (Multi-Tenant)
                  </span>
                </div>

                <div className="max-h-60 overflow-y-auto py-1">
                  {churches.map((church) => {
                    const isSelected = church.id === churchId;
                    return (
                      <button
                        key={church.id}
                        id={`select-church-${church.id}`}
                        onClick={() => {
                          switchChurch(church.id);
                          setChurchDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 text-xs flex items-start gap-2 transition ${
                          isSelected
                            ? 'bg-emerald-950/70 text-emerald-200 border-l-2 border-emerald-400 font-medium'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <ChurchIcon className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                        <div className="truncate flex-1">
                          <div className="font-medium text-white truncate">{church.name}</div>
                          <div className="text-[11px] text-slate-400">{church.city} {church.neighborhood ? `• ${church.neighborhood}` : ''}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="p-2">
                  <button
                    onClick={() => {
                      setChurchDropdownOpen(false);
                      onOpenRegisterChurch();
                    }}
                    id="navbar-add-church-btn"
                    className="w-full text-left px-3 py-2 text-xs bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 rounded-lg flex items-center gap-2 font-medium border border-emerald-500/30 transition"
                  >
                    <PlusCircle className="w-4 h-4 text-emerald-400" />
                    Inscrire une Nouvelle Église
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right actions: Profile, RLS indicator, user */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Fullscreen Toggle Button for Pastoral Presentations */}
            <button
              onClick={toggleFullscreen}
              id="header-fullscreen-toggle-btn"
              title={isFullscreen ? "Quitter le Mode Plein Écran" : "Basculer en Mode Plein Écran (Présentations Pastorales)"}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 rounded-lg border border-slate-700 transition flex items-center justify-center"
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4 text-emerald-400" />
              ) : (
                <Maximize className="w-4 h-4" />
              )}
            </button>

            {/* Supabase Schema / RLS quick button */}
            <button
              onClick={onOpenSqlModal}
              title="Inspecter le schéma PostgreSQL et les politiques RLS"
              id="header-schema-btn"
              className="hidden lg:flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 transition"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>RLS & Sécurité</span>
            </button>

            {/* Interactive Role Selector */}
            <div className="hidden md:flex items-center bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 text-xs gap-1.5 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0"></span>
              <span className="text-slate-400 text-[11px] font-medium">Rôle:</span>
              <select
                id="header-role-selector"
                value={roles[0]?.code || demoRole || 'CHURCH_ADMIN'}
                onChange={(e) => setDemoRole(e.target.value)}
                className="bg-transparent text-emerald-300 font-semibold border-none outline-none cursor-pointer text-xs focus:ring-0"
                title="Changer le rôle actif pour tester les autorisations"
              >
                <option value="CHURCH_ADMIN" className="bg-slate-900 text-white">🏛️ Admin Église</option>
                <option value="PASTOR" className="bg-slate-900 text-white">✝️ Pasteur / Spirituel</option>
                <option value="TREASURER" className="bg-slate-900 text-white">💰 Trésorier / Finances</option>
                <option value="SECRETARY" className="bg-slate-900 text-white">📋 Secrétaire / Présences</option>
                <option value="LEADER" className="bg-slate-900 text-white">👥 Resp. Département</option>
                <option value="MEMBER" className="bg-slate-900 text-white">👤 Membre</option>
              </select>
            </div>

            {/* User Dropdown */}
            <div className="relative">
              <button
                id="user-profile-button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 p-1.5 rounded-lg border border-slate-700 transition"
              >
                <div className="w-7 h-7 rounded-full bg-emerald-800 flex items-center justify-center text-xs font-bold text-white uppercase">
                  {profile?.first_name ? profile.first_name[0] : 'U'}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div
                  id="user-profile-dropdown"
                  className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 text-xs divide-y divide-slate-800"
                >
                  <div className="px-3.5 py-2">
                    <div className="font-semibold text-white">
                      {profile ? `${profile.first_name} ${profile.last_name}` : 'Utilisateur Connecté'}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">{profile?.email || 'pasteur@bethel-ouaga.bf'}</div>
                    <div className="mt-1 inline-block text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded">
                      {userRoleName}
                    </div>
                  </div>

                  <div className="py-1">
                    {onOpenCredentialsModal && (
                      <button
                        onClick={() => {
                          onOpenCredentialsModal();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3.5 py-2 text-emerald-300 hover:bg-slate-800 flex items-center gap-2 font-medium"
                      >
                        <Key className="w-4 h-4 text-emerald-400" />
                        Gérer les Clés Supabase
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setActiveTab('config');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-slate-300 hover:bg-slate-800 flex items-center gap-2"
                    >
                      <Sliders className="w-4 h-4 text-slate-400" />
                      Architecture & Supabase
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('audit');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-slate-300 hover:bg-slate-800 flex items-center gap-2"
                    >
                      <Shield className="w-4 h-4 text-slate-400" />
                      Journal d'Audit RLS
                    </button>
                  </div>

                  <div className="p-1.5">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        signOut();
                      }}
                      id="sign-out-button"
                      className="w-full text-left px-3 py-1.5 text-red-400 hover:bg-red-950/40 rounded flex items-center gap-2 font-medium transition"
                    >
                      <LogOut className="w-4 h-4" />
                      Déconnexion
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
