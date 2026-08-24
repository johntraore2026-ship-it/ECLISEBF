import React, { useState, useEffect } from 'react';
import {
  Network,
  Users,
  PlusCircle,
  Home,
  Clock,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
  Search,
  CheckCircle2
} from 'lucide-react';
import { Department, Group } from '../types';
import { departmentGroupService } from '../services/departmentGroupService';
import { useAuth } from '../contexts/AuthContext';

export const DepartmentsPage: React.FC = () => {
  const { churchId, isDemoMode } = useAuth();

  const [activeTab, setActiveTab] = useState<'DEPARTMENTS' | 'CELLS'>('DEPARTMENTS');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  // New department/cell modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [meetingSchedule, setMeetingSchedule] = useState('');
  const [neighborhood, setNeighborhood] = useState('');

  const loadData = async () => {
    if (!churchId) return;
    setLoading(true);
    try {
      const [depts, grps] = await Promise.all([
        departmentGroupService.getDepartments(churchId, isDemoMode),
        departmentGroupService.getGroups(churchId, isDemoMode),
      ]);
      setDepartments(depts);
      setGroups(grps);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [churchId, isDemoMode]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!churchId || !name.trim()) return;

    if (activeTab === 'DEPARTMENTS') {
      await departmentGroupService.createDepartment({
        church_id: churchId,
        name: name.trim(),
        description: description.trim(),
        leader_name: leaderName.trim() || undefined,
        meeting_schedule: meetingSchedule.trim() || undefined,
      }, isDemoMode);
    } else {
      await departmentGroupService.createGroup({
        church_id: churchId,
        name: name.trim(),
        type: 'HOUSE_CELL',
        neighborhood: neighborhood.trim() || 'Ouagadougou',
        leader_name: leaderName.trim() || undefined,
        meeting_day: meetingSchedule.trim() || 'Mercredi 18h30',
      }, isDemoMode);
    }

    setName('');
    setDescription('');
    setLeaderName('');
    setMeetingSchedule('');
    setNeighborhood('');
    setShowAddModal(false);
    loadData();
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <Network className="w-6 h-6 text-emerald-400" />
            <h1 className="text-xl font-bold text-white">Départements & Cellules de Maison</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Structuration des ministères (Louange, Jeunesse, Femmes, Protocole) et réseaux de cellules géographiques
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow transition"
        >
          <PlusCircle className="w-4 h-4" />
          {activeTab === 'DEPARTMENTS' ? 'Créer un Département' : 'Créer une Cellule de Maison'}
        </button>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('DEPARTMENTS')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition ${
            activeTab === 'DEPARTMENTS'
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-800 text-slate-300 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          Départements & Ministères ({departments.length})
        </button>

        <button
          onClick={() => setActiveTab('CELLS')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition ${
            activeTab === 'CELLS'
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-800 text-slate-300 hover:text-white'
          }`}
        >
          <Home className="w-4 h-4" />
          Cellules de Prière & Maison ({groups.length})
        </button>
      </div>

      {/* Content Grid */}
      {activeTab === 'DEPARTMENTS' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-3 hover:border-emerald-500/50 transition shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="p-2.5 rounded-xl bg-emerald-950 border border-emerald-800/60 text-emerald-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                  {dept.code || 'MINISTÈRE'}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-base text-white">{dept.name}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                  {dept.description || 'Département actif au sein de l\'assemblée.'}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Responsable :</span>
                  <span className="font-semibold text-emerald-400">{dept.leader_name || 'Non désigné'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Répétition / Réunion :</span>
                  <span>{dept.meeting_schedule || 'Samedi 16h00'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <div
              key={group.id}
              className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-3 hover:border-blue-500/50 transition shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="p-2.5 rounded-xl bg-blue-950 border border-blue-800/60 text-blue-400">
                  <Home className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded">
                  {group.type}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-base text-white">{group.name}</h3>
                <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>{group.neighborhood} {group.address ? `• ${group.address}` : ''}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Conducteur de Cellule :</span>
                  <span className="font-semibold text-blue-400">{group.leader_name || 'Ancien / Responsable'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Jour & Heure de Prière :</span>
                  <span>{group.meeting_day}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Creation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md text-white shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-base text-white">
              {activeTab === 'DEPARTMENTS' ? 'Nouveau Département / Ministère' : 'Nouvelle Cellule de Maison'}
            </h3>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Nom / Intitulé</label>
                <input
                  type="text"
                  required
                  placeholder={activeTab === 'DEPARTMENTS' ? 'Ex: Groupe Musical & Louange' : 'Ex: Cellule Grâce & Paix - Dassasgho'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Responsable / Leader</label>
                <input
                  type="text"
                  placeholder="Ex: Frère David Ouoba"
                  value={leaderName}
                  onChange={(e) => setLeaderName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {activeTab === 'CELLS' && (
                <div>
                  <label className="block text-slate-300 mb-1">Quartier / Secteur</label>
                  <input
                    type="text"
                    placeholder="Ex: Somgandé / Secteur 20"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-300 mb-1">Jour & Horaire</label>
                <input
                  type="text"
                  placeholder="Ex: Mercredi 18h30"
                  value={meetingSchedule}
                  onChange={(e) => setMeetingSchedule(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {activeTab === 'DEPARTMENTS' && (
                <div>
                  <label className="block text-slate-300 mb-1">Description / Objectif</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
