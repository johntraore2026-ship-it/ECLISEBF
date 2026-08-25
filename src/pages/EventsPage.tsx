import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Bell,
  MapPin,
  Clock,
  Users,
  PlusCircle,
  Sparkles,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { ChurchEvent, Announcement } from '../types';
import { eventAnnouncementService } from '../services/eventAnnouncementService';
import { useAuth } from '../contexts/AuthContext';
import { ChurchCalendar } from '../components/events/ChurchCalendar';
import { CardGridSkeleton, Skeleton } from '../components/common/Skeleton';

export const EventsPage: React.FC = () => {
  const { churchId, isDemoMode } = useAuth();

  const [activeTab, setActiveTab] = useState<'EVENTS' | 'CALENDAR' | 'ANNOUNCEMENTS'>('CALENDAR');
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  // New item modal
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('Temple Principal');
  const [category, setCategory] = useState('CONFERENCE');

  const loadData = async () => {
    if (!churchId) return;
    setLoading(true);
    try {
      const [evts, anns] = await Promise.all([
        eventAnnouncementService.getEvents(churchId, isDemoMode),
        eventAnnouncementService.getAnnouncements(churchId, isDemoMode),
      ]);
      setEvents(evts);
      setAnnouncements(anns);
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
    if (!churchId || !title.trim()) return;

    if (activeTab === 'EVENTS') {
      await eventAnnouncementService.createEvent({
        church_id: churchId,
        title: title.trim(),
        description: description.trim(),
        start_date: startDate,
        end_date: startDate,
        location: location.trim(),
        requires_registration: false,
        is_published: true,
      }, isDemoMode);
    } else {
      await eventAnnouncementService.createAnnouncement({
        church_id: churchId,
        title: title.trim(),
        content: description.trim(),
        target_audience: 'ALL',
        priority: category === 'URGENT' ? 'URGENT' : 'NORMAL',
        published_at: startDate,
        is_pinned: false,
      }, isDemoMode);
    }

    setTitle('');
    setDescription('');
    setShowModal(false);
    loadData();
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-emerald-400" />
            <h1 className="text-xl font-bold text-white">Événements, Conventions & Annonces Officielles</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Calendrier ecclésiastique, séminaires, veillées de prière et avis aux fidèles
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow transition"
        >
          <PlusCircle className="w-4 h-4" />
          {activeTab === 'EVENTS' ? 'Créer un Événement' : 'Publier une Annonce'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('CALENDAR')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition ${
            activeTab === 'CALENDAR'
              ? 'bg-emerald-600 text-white font-bold shadow'
              : 'bg-slate-800 text-slate-300 hover:text-white'
          }`}
        >
          <CalendarIcon className="w-4 h-4 text-emerald-400" />
          Calendrier Ecclésiastique (Mois/Semaine)
        </button>

        <button
          onClick={() => setActiveTab('EVENTS')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition ${
            activeTab === 'EVENTS'
              ? 'bg-emerald-600 text-white font-bold shadow'
              : 'bg-slate-800 text-slate-300 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Liste des Événements ({events.length})
        </button>

        <button
          onClick={() => setActiveTab('ANNOUNCEMENTS')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition ${
            activeTab === 'ANNOUNCEMENTS'
              ? 'bg-emerald-600 text-white font-bold shadow'
              : 'bg-slate-800 text-slate-300 hover:text-white'
          }`}
        >
          <Bell className="w-4 h-4" />
          Annonces & Bulletins ({announcements.length})
        </button>
      </div>

      {/* Content Rendering */}
      {loading ? (
        <CardGridSkeleton cols={3} count={6} />
      ) : activeTab === 'CALENDAR' ? (
        <ChurchCalendar
          events={events}
          onOpenCreateModal={(defDate) => {
            if (defDate) setStartDate(defDate);
            setShowModal(true);
          }}
        />
      ) : activeTab === 'EVENTS' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-3 hover:border-emerald-500/50 transition shadow-sm"
            >
              <div className="flex items-start justify-between">
                <span className="text-[10px] font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded">
                  Programme Église
                </span>
                <span className="text-xs font-semibold text-white bg-slate-800 px-2.5 py-0.5 rounded border border-slate-700">
                  {evt.start_date.split('T')[0]}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-base text-white">{evt.title}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {evt.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-1 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{evt.location}</span>
                </div>
                {evt.registered_count !== undefined && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <Users className="w-3.5 h-3.5" />
                    <span>{evt.registered_count} personnes inscrites</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-3 hover:border-emerald-500/50 transition shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-950 text-emerald-400 rounded-xl border border-emerald-800">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{ann.title}</h3>
                    <span className="text-[10px] text-slate-400">Publié le {ann.published_at.split('T')[0]}</span>
                  </div>
                </div>

                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                  ann.priority === 'URGENT'
                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                    : 'bg-slate-800 text-slate-300'
                }`}>
                  {ann.priority}
                </span>
              </div>

              <p className="text-xs text-slate-300 bg-slate-800/40 p-3 rounded-xl border border-slate-700/50 leading-relaxed">
                {ann.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md text-white shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-base text-white">
              {activeTab === 'EVENTS' ? 'Nouvel Événement d\'Église' : 'Nouvelle Annonce Officielle'}
            </h3>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Titre</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Convention Annuelle de Réveil..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {activeTab === 'EVENTS' && (
                <div>
                  <label className="block text-slate-300 mb-1">Lieu</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-300 mb-1">Description / Contenu</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
