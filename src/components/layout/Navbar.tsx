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
  Sliders
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { churchService } from '../../services/churchService';
import { Church } from '../../types';

interface NavbarProps {
  onOpenRegisterChurch: () => void;
  onOpenSqlModal: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenRegisterChurch,
  onOpenSqlModal,
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
    demoRole
  } = useAuth();

  const [churches, setChurches] = useState<Church[]>([]);
  const [churchDropdownOpen, setChurchDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

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

            {/* Role Badge */}
            <div className="hidden md:flex items-center bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700 text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mr-2"></span>
              <span className="text-slate-300 font-medium">{userRoleName}</span>
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
                    <button
                      onClick={() => {
                        setActiveTab('config');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-slate-300 hover:bg-slate-800 flex items-center gap-2"
                    >
                      <Sliders className="w-4 h-4 text-slate-400" />
                      Configuration Supabase
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
