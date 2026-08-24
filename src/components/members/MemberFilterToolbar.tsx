import React from 'react';
import {
  Search,
  Filter,
  X,
  RotateCcw,
  Building2,
  Users2,
  Droplets,
  Sparkles,
  CheckCircle2,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { Department, Group } from '../../types';

export interface MemberFiltersState {
  searchQuery: string;
  departmentId: string;
  groupId: string;
  baptismStatus: string; // 'ALL' | 'WATER_BAPTIZED' | 'NOT_BAPTIZED' | 'HOLY_SPIRIT_BAPTIZED'
  spiritualStatus: string;
  gender: string;
  activityStatus: string; // 'ALL' | 'ACTIVE' | 'INACTIVE'
}

interface MemberFilterToolbarProps {
  filters: MemberFiltersState;
  onFilterChange: (newFilters: MemberFiltersState) => void;
  onResetFilters: () => void;
  departments: Department[];
  groups: Group[];
  totalCount: number;
  filteredCount: number;
}

export const MemberFilterToolbar: React.FC<MemberFilterToolbarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  departments,
  groups,
  totalCount,
  filteredCount,
}) => {
  const [showAdvanced, setShowAdvanced] = React.useState(true);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, searchQuery: e.target.value });
  };

  const handleSelectChange = (key: keyof MemberFiltersState, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearSearch = () => {
    onFilterChange({ ...filters, searchQuery: '' });
  };

  // Check how many filters are active beyond default
  const activeFilterCount = [
    filters.departmentId !== 'ALL',
    filters.groupId !== 'ALL',
    filters.baptismStatus !== 'ALL',
    filters.spiritualStatus !== 'ALL',
    filters.gender !== 'ALL',
    filters.activityStatus !== 'ALL',
    Boolean(filters.searchQuery.trim()),
  ].filter(Boolean).length;

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
      
      {/* Top Row: Search Input + Toggle Advanced + Reset */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Main Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3" />
          <input
            type="text"
            id="members-search-input"
            placeholder="Rechercher par nom, prénom, tél, email, quartier, profession..."
            value={filters.searchQuery}
            onChange={handleTextChange}
            className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-9 py-2.5 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
          />
          {filters.searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-white p-0.5 rounded transition"
              title="Effacer la recherche"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Results Counter & Controls */}
        <div className="flex items-center justify-between md:justify-end gap-2.5">
          <div className="text-xs text-slate-400 font-medium px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl">
            <span className="text-emerald-400 font-bold">{filteredCount}</span> sur{' '}
            <span className="text-slate-300 font-semibold">{totalCount}</span> membres
          </div>

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border ${
              showAdvanced || activeFilterCount > 0
                ? 'bg-emerald-950/70 border-emerald-700/60 text-emerald-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filtres</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {activeFilterCount > 0 && (
            <button
              onClick={onResetFilters}
              className="px-2.5 py-2 text-xs text-slate-400 hover:text-amber-300 hover:bg-amber-950/40 rounded-xl transition flex items-center gap-1 border border-transparent hover:border-amber-800/40"
              title="Réinitialiser tous les filtres"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Effacer</span>
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filter Dropdowns Grid */}
      {showAdvanced && (
        <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          
          {/* 1. Department Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Building2 className="w-3 h-3 text-emerald-400" />
              Département
            </label>
            <select
              id="filter-department"
              value={filters.departmentId}
              onChange={(e) => handleSelectChange('departmentId', e.target.value)}
              className="w-full bg-slate-950/90 border border-slate-700/80 text-slate-200 text-xs rounded-xl px-2.5 py-2 outline-none focus:ring-2 focus:ring-emerald-500 transition"
            >
              <option value="ALL">Tous les départements</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Group / Cellule Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Users2 className="w-3 h-3 text-blue-400" />
              Groupe / Cellule
            </label>
            <select
              id="filter-group"
              value={filters.groupId}
              onChange={(e) => handleSelectChange('groupId', e.target.value)}
              className="w-full bg-slate-950/90 border border-slate-700/80 text-slate-200 text-xs rounded-xl px-2.5 py-2 outline-none focus:ring-2 focus:ring-emerald-500 transition"
            >
              <option value="ALL">Tous les groupes / cellules</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Baptism Status Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Droplets className="w-3 h-3 text-cyan-400" />
              Statut Baptême
            </label>
            <select
              id="filter-baptism"
              value={filters.baptismStatus}
              onChange={(e) => handleSelectChange('baptismStatus', e.target.value)}
              className="w-full bg-slate-950/90 border border-slate-700/80 text-slate-200 text-xs rounded-xl px-2.5 py-2 outline-none focus:ring-2 focus:ring-emerald-500 transition"
            >
              <option value="ALL">Tous les statuts de baptême</option>
              <option value="WATER_BAPTIZED">Baptisé(e) d'eau (Immersion)</option>
              <option value="NOT_BAPTIZED">Non encore baptisé(e)</option>
              <option value="HOLY_SPIRIT_BAPTIZED">Baptisé(e) du Saint-Esprit</option>
            </select>
          </div>

          {/* 4. Spiritual Status Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-400" />
              Statut Spirituel
            </label>
            <select
              id="filter-spiritual"
              value={filters.spiritualStatus}
              onChange={(e) => handleSelectChange('spiritualStatus', e.target.value)}
              className="w-full bg-slate-950/90 border border-slate-700/80 text-slate-200 text-xs rounded-xl px-2.5 py-2 outline-none focus:ring-2 focus:ring-emerald-500 transition"
            >
              <option value="ALL">Tous les statuts spirituels</option>
              <option value="COMMUNICANT">Membre Communicant</option>
              <option value="NEW_CONVERT">Nouveau Converti</option>
              <option value="BAPTIZED">Baptisé d'eau</option>
              <option value="WORKER">Ouvrier / Serviteur</option>
              <option value="DEACON">Diacre / Diaconesse</option>
              <option value="ELDER">Ancien d'église</option>
              <option value="PASTOR">Pasteur / Prédicateur</option>
              <option value="INQUIRER">Sympathisant / Invité</option>
            </select>
          </div>

          {/* 5. Gender Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              Genre
            </label>
            <select
              id="filter-gender"
              value={filters.gender}
              onChange={(e) => handleSelectChange('gender', e.target.value)}
              className="w-full bg-slate-950/90 border border-slate-700/80 text-slate-200 text-xs rounded-xl px-2.5 py-2 outline-none focus:ring-2 focus:ring-emerald-500 transition"
            >
              <option value="ALL">Tous les genres</option>
              <option value="MALE">Hommes (Masculin)</option>
              <option value="FEMALE">Femmes (Féminin)</option>
            </select>
          </div>

          {/* 6. Activity / Inactive Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              État d'Activité
            </label>
            <select
              id="filter-activity"
              value={filters.activityStatus}
              onChange={(e) => handleSelectChange('activityStatus', e.target.value)}
              className="w-full bg-slate-950/90 border border-slate-700/80 text-slate-200 text-xs rounded-xl px-2.5 py-2 outline-none focus:ring-2 focus:ring-emerald-500 transition"
            >
              <option value="ALL">Tous (Actifs & Inactifs)</option>
              <option value="ACTIVE">Membres Actifs</option>
              <option value="INACTIVE">Membres Inactifs</option>
            </select>
          </div>

        </div>
      )}

      {/* Active Filter Badges Pills */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Filtres actifs :</span>
          
          {filters.departmentId !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 text-emerald-300 text-[11px] rounded-lg border border-emerald-800/40">
              Département : {departments.find((d) => d.id === filters.departmentId)?.name || filters.departmentId}
              <button onClick={() => handleSelectChange('departmentId', 'ALL')} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.groupId !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 text-blue-300 text-[11px] rounded-lg border border-blue-800/40">
              Groupe : {groups.find((g) => g.id === filters.groupId)?.name || filters.groupId}
              <button onClick={() => handleSelectChange('groupId', 'ALL')} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.baptismStatus !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 text-cyan-300 text-[11px] rounded-lg border border-cyan-800/40">
              Baptême :{' '}
              {filters.baptismStatus === 'WATER_BAPTIZED'
                ? "Baptisé d'eau"
                : filters.baptismStatus === 'NOT_BAPTIZED'
                ? 'Non baptisé'
                : 'Baptême St-Esprit'}
              <button onClick={() => handleSelectChange('baptismStatus', 'ALL')} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.spiritualStatus !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 text-purple-300 text-[11px] rounded-lg border border-purple-800/40">
              Statut : {filters.spiritualStatus}
              <button onClick={() => handleSelectChange('spiritualStatus', 'ALL')} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.gender !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 text-amber-300 text-[11px] rounded-lg border border-amber-800/40">
              Genre : {filters.gender === 'MALE' ? 'Hommes' : 'Femmes'}
              <button onClick={() => handleSelectChange('gender', 'ALL')} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.activityStatus !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 text-emerald-300 text-[11px] rounded-lg border border-emerald-800/40">
              Activité : {filters.activityStatus === 'ACTIVE' ? 'Actifs' : 'Inactifs'}
              <button onClick={() => handleSelectChange('activityStatus', 'ALL')} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}

    </div>
  );
};
