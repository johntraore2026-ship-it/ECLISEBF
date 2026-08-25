import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Download,
  Phone,
  Mail,
  MapPin,
  Calendar,
  HeartHandshake,
  Edit2,
  CheckCircle2,
  XCircle,
  Building2,
  Users2,
  Droplets,
  Sparkles,
  Shield,
  Briefcase
} from 'lucide-react';
import { Member, Department, Group } from '../types';
import { memberService } from '../services/memberService';
import { departmentGroupService } from '../services/departmentGroupService';
import { useAuth } from '../contexts/AuthContext';
import { MemberFilterToolbar, MemberFiltersState } from '../components/members/MemberFilterToolbar';
import { exportMembersToCSV } from '../utils/csvExport';

interface MembersPageProps {
  onOpenAddMember: () => void;
  onEditMember: (member: Member) => void;
  onOpenPastoralForMember: (member: Member) => void;
}

const INITIAL_FILTERS: MemberFiltersState = {
  searchQuery: '',
  departmentId: 'ALL',
  groupId: 'ALL',
  baptismStatus: 'ALL',
  spiritualStatus: 'ALL',
  gender: 'ALL',
  activityStatus: 'ALL',
};

export const MembersPage: React.FC<MembersPageProps> = ({
  onOpenAddMember,
  onEditMember,
  onOpenPastoralForMember,
}) => {
  const { currentChurch, churchId, isDemoMode } = useAuth();

  const [members, setMembers] = useState<Member[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<MemberFiltersState>(INITIAL_FILTERS);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const loadData = async () => {
    if (!churchId) return;
    setLoading(true);
    try {
      const [memsRes, deptsRes, grpsRes] = await Promise.allSettled([
        memberService.getMembers(churchId, isDemoMode),
        departmentGroupService.getDepartments(churchId, isDemoMode),
        departmentGroupService.getGroups(churchId, isDemoMode),
      ]);

      const mems = memsRes.status === 'fulfilled' ? memsRes.value : [];
      const depts = deptsRes.status === 'fulfilled' ? deptsRes.value : [];
      const grps = grpsRes.status === 'fulfilled' ? grpsRes.value : [];

      setMembers(mems);
      setDepartments(depts);
      setGroups(grps);
      if (mems.length > 0) {
        setSelectedMember(mems[0]);
      }
    } catch (err) {
      console.error('Error loading members page data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [churchId, isDemoMode]);

  // Advanced Filtering Logic
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      // 1. Text Search (Name, Phone, Email, Neighborhood, Profession, Notes)
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const fullName = `${m.first_name || ''} ${m.last_name || ''}`.toLowerCase();
        const reverseName = `${m.last_name || ''} ${m.first_name || ''}`.toLowerCase();
        const phone = (m.phone || '').toLowerCase();
        const email = (m.email || '').toLowerCase();
        const neighborhood = (m.neighborhood || '').toLowerCase();
        const city = (m.city || '').toLowerCase();
        const profession = (m.profession || '').toLowerCase();
        const dept = (m.department_name || '').toLowerCase();
        const grp = (m.group_name || '').toLowerCase();

        const match =
          fullName.includes(q) ||
          reverseName.includes(q) ||
          phone.includes(q) ||
          email.includes(q) ||
          neighborhood.includes(q) ||
          city.includes(q) ||
          profession.includes(q) ||
          dept.includes(q) ||
          grp.includes(q);

        if (!match) return false;
      }

      // 2. Department Filter
      if (filters.departmentId !== 'ALL') {
        const matchesDept =
          m.department_id === filters.departmentId ||
          departments.find((d) => d.id === filters.departmentId)?.name === m.department_name;
        if (!matchesDept) return false;
      }

      // 3. Group / Cellule Filter
      if (filters.groupId !== 'ALL') {
        const matchesGroup =
          m.group_id === filters.groupId ||
          groups.find((g) => g.id === filters.groupId)?.name === m.group_name;
        if (!matchesGroup) return false;
      }

      // 4. Baptism Status Filter
      if (filters.baptismStatus !== 'ALL') {
        if (filters.baptismStatus === 'WATER_BAPTIZED') {
          const isBaptized =
            Boolean(m.baptism_date) ||
            ['BAPTIZED', 'COMMUNICANT', 'WORKER', 'DEACON', 'ELDER', 'PASTOR'].includes(
              m.spiritual_status
            );
          if (!isBaptized) return false;
        } else if (filters.baptismStatus === 'NOT_BAPTIZED') {
          const isNotBaptized =
            !m.baptism_date &&
            ['NEW_CONVERT', 'INQUIRER'].includes(m.spiritual_status);
          if (!isNotBaptized) return false;
        } else if (filters.baptismStatus === 'HOLY_SPIRIT_BAPTIZED') {
          if (!m.holy_spirit_baptized) return false;
        }
      }

      // 5. Spiritual Status Filter
      if (filters.spiritualStatus !== 'ALL') {
        if (m.spiritual_status !== filters.spiritualStatus) return false;
      }

      // 6. Gender Filter
      if (filters.gender !== 'ALL') {
        if (m.gender !== filters.gender) return false;
      }

      // 7. Activity Status Filter
      if (filters.activityStatus !== 'ALL') {
        if (filters.activityStatus === 'ACTIVE' && !m.is_active) return false;
        if (filters.activityStatus === 'INACTIVE' && m.is_active) return false;
      }

      return true;
    });
  }, [members, filters, departments, groups]);

  // Trigger CSV export
  const handleExportCSV = () => {
    exportMembersToCSV(filteredMembers, currentChurch?.name || 'Église');
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  const menCount = members.filter((m) => m.gender === 'MALE').length;
  const womenCount = members.filter((m) => m.gender === 'FEMALE').length;
  const baptizedCount = members.filter(
    (m) =>
      Boolean(m.baptism_date) ||
      ['BAPTIZED', 'COMMUNICANT', 'WORKER', 'DEACON', 'ELDER', 'PASTOR'].includes(
        m.spiritual_status
      )
  ).length;
  const youthOrNewCount = members.filter(
    (m) => m.spiritual_status === 'NEW_CONVERT' || m.spiritual_status === 'INQUIRER'
  ).length;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header with Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-400" />
            <h1 className="text-xl font-bold text-white">Annuaire des Membres & Familles</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Base nominative, fiches de suivi, départements, cellules et historique spirituel
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            id="members-export-csv-btn"
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
            title="Exporter les membres sélectionnés en CSV pour sauvegarde administrative"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            Exporter CSV ({filteredMembers.length})
          </button>
          <button
            onClick={onOpenAddMember}
            id="members-add-button"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow transition"
          >
            <UserPlus className="w-4 h-4" />
            Nouveau Membre
          </button>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[11px] text-slate-400 font-semibold uppercase">Total Effectif</span>
          <div className="text-xl font-extrabold text-white mt-1">{members.length}</div>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[11px] text-slate-400 font-semibold uppercase">Hommes (Masculin)</span>
          <div className="text-xl font-extrabold text-blue-400 mt-1">{menCount}</div>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[11px] text-slate-400 font-semibold uppercase">Femmes (Féminin)</span>
          <div className="text-xl font-extrabold text-pink-400 mt-1">{womenCount}</div>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[11px] text-slate-400 font-semibold uppercase">Baptisés d'eau</span>
          <div className="text-xl font-extrabold text-emerald-400 mt-1">{baptizedCount}</div>
        </div>
      </div>

      {/* Advanced Search & Filtering Component */}
      <MemberFilterToolbar
        filters={filters}
        onFilterChange={setFilters}
        onResetFilters={handleResetFilters}
        departments={departments}
        groups={groups}
        totalCount={members.length}
        filteredCount={filteredMembers.length}
      />

      {/* Main List and Detailed Viewer split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Members List Table */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-850 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Membre</th>
                  <th className="px-3 py-3">Département & Cellule</th>
                  <th className="px-3 py-3">Statut Spirituel</th>
                  <th className="px-3 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-500">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      Aucun membre ne correspond aux critères de recherche et filtres sélectionnés.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => {
                    const isSelected = selectedMember?.id === member.id;
                    return (
                      <tr
                        key={member.id}
                        onClick={() => setSelectedMember(member)}
                        className={`cursor-pointer transition ${
                          isSelected
                            ? 'bg-emerald-950/40 border-l-4 border-l-emerald-500'
                            : 'hover:bg-slate-800/60'
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">
                              {member.first_name[0]}
                              {member.last_name[0]}
                            </div>
                            <div>
                              <div className="font-semibold text-white">
                                {member.last_name} {member.first_name}
                              </div>
                              <div className="text-[11px] text-slate-400 flex items-center gap-2">
                                <span>{member.phone || 'Pas de tél'}</span>
                                {member.neighborhood && (
                                  <>
                                    <span>•</span>
                                    <span>{member.neighborhood}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-3 py-3">
                          <div className="space-y-1">
                            {member.department_name ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-950/70 text-emerald-300 border border-emerald-800/50 px-2 py-0.5 rounded-md">
                                <Building2 className="w-2.5 h-2.5" />
                                {member.department_name}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-500 block">Aucun dpt</span>
                            )}
                            {member.group_name && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-blue-950/70 text-blue-300 border border-blue-800/50 px-2 py-0.5 rounded-md">
                                <Users2 className="w-2.5 h-2.5" />
                                {member.group_name}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-3 py-3">
                          <div className="space-y-1">
                            <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                              {member.spiritual_status}
                            </span>
                            {member.baptism_date && (
                              <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                                <Droplets className="w-2.5 h-2.5" /> Baptisé d'eau
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="px-3 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => onEditMember(member)}
                              title="Modifier la fiche du membre"
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onOpenPastoralForMember(member)}
                              title="Ouvrir entretien pastoral"
                              className="p-1.5 rounded-lg bg-purple-950 hover:bg-purple-900 text-purple-300 transition"
                            >
                              <HeartHandshake className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Member Profile Card Details (Side Panel) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          {selectedMember ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Fiche Individuelle</h3>
                <button
                  onClick={() => onEditMember(selectedMember)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" /> Modifier
                </button>
              </div>

              {/* Avatar & Header */}
              <div className="text-center p-4 bg-slate-800/50 rounded-xl border border-slate-700/60">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center text-lg font-bold mx-auto border-2 border-emerald-400 shadow-md">
                  {selectedMember.first_name[0]}
                  {selectedMember.last_name[0]}
                </div>
                <h2 className="text-base font-bold text-white mt-2">
                  {selectedMember.last_name} {selectedMember.first_name}
                </h2>
                <div className="mt-1 inline-block text-[11px] font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-0.5 rounded-full">
                  {selectedMember.spiritual_status}
                </div>
              </div>

              {/* Details List */}
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> Téléphone :
                  </span>
                  <span className="font-semibold text-white">{selectedMember.phone || 'Non renseigné'}</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> Email :
                  </span>
                  <span className="text-white truncate max-w-[180px]">
                    {selectedMember.email || 'Non renseigné'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> Localisation :
                  </span>
                  <span className="text-white">
                    {selectedMember.neighborhood || selectedMember.city || 'Non renseigné'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" /> Profession :
                  </span>
                  <span className="text-white">{selectedMember.profession || 'Non renseignée'}</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" /> Département :
                  </span>
                  <span className="text-emerald-400 font-semibold">
                    {selectedMember.department_name || 'Aucun département'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Users2 className="w-3.5 h-3.5" /> Cellule / Groupe :
                  </span>
                  <span className="text-blue-400 font-semibold">
                    {selectedMember.group_name || 'Aucun groupe'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Baptême d'eau :
                  </span>
                  <span className="text-emerald-400 font-semibold">
                    {selectedMember.baptism_date || 'Non baptisé'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Baptême St-Esprit :
                  </span>
                  <span className={selectedMember.holy_spirit_baptized ? 'text-purple-400 font-bold' : 'text-slate-500'}>
                    {selectedMember.holy_spirit_baptized ? 'OUI' : 'NON'}
                  </span>
                </div>

                {selectedMember.notes && (
                  <div className="p-3 bg-slate-800/60 rounded-lg text-slate-300 text-[11px] border border-slate-700/60">
                    <span className="font-semibold text-slate-400 block mb-1">Notes ministérielles :</span>
                    {selectedMember.notes}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2">
                <button
                  onClick={() => onOpenPastoralForMember(selectedMember)}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow"
                >
                  <HeartHandshake className="w-4 h-4" />
                  Ouvrir Suivi Pastoral Confidentiel
                </button>
              </div>

            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs">
              Sélectionnez un membre dans la liste pour afficher sa fiche individuelle complète.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
