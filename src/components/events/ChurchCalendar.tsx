import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Plus,
  Users,
  Music,
  BookOpen,
  Sparkles,
  Layers,
  Filter
} from 'lucide-react';
import { ChurchEvent } from '../../types';

interface ChurchCalendarProps {
  events: ChurchEvent[];
  onOpenCreateModal: (defaultDate?: string) => void;
}

interface RecurringSlot {
  id: string;
  title: string;
  dayOfWeek: number; // 0 = Dimanche, 1 = Lundi, ...
  time: string;
  location: string;
  type: 'WORSHIP' | 'REHEARSAL' | 'PRAYER' | 'BIBLE_STUDY';
}

const DEFAULT_RECURRING_SLOTS: RecurringSlot[] = [
  { id: 'rs-1', title: 'Grand Culte Dominical de Célébration', dayOfWeek: 0, time: '08:30 - 11:30', location: 'Grand Sanctuary', type: 'WORSHIP' },
  { id: 'rs-2', title: 'Culte du Soir & Action de Grâce', dayOfWeek: 0, time: '17:30 - 19:30', location: 'Chapelle annexe', type: 'WORSHIP' },
  { id: 'rs-3', title: 'Étude Biblique & Enseignement Pastoral', dayOfWeek: 2, time: '18:30 - 20:00', location: 'Salle de conférences', type: 'BIBLE_STUDY' },
  { id: 'rs-4', title: 'Répétition Chorale Principale (Chœur de Gloire)', dayOfWeek: 4, time: '18:00 - 20:00', location: 'Bâtiment Louange', type: 'REHEARSAL' },
  { id: 'rs-5', title: 'Répétition Groupe de Louange & Orchestre', dayOfWeek: 5, time: '18:00 - 20:30', location: 'Bâtiment Louange', type: 'REHEARSAL' },
  { id: 'rs-6', title: 'Matinale de Prière & Intercession', dayOfWeek: 6, time: '06:00 - 08:00', location: 'Grand Sanctuary', type: 'PRAYER' },
];

export const ChurchCalendar: React.FC<ChurchCalendarProps> = ({ events, onOpenCreateModal }) => {
  const [viewMode, setViewMode] = useState<'MONTH' | 'WEEK'>('MONTH');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterType, setFilterType] = useState<string>('ALL');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNamesFr = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const daysOfWeekFr = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  // Navigation handlers
  const handlePrevMonth = () => {
    if (viewMode === 'MONTH') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else {
      const prevWeek = new Date(currentDate);
      prevWeek.setDate(prevWeek.getDate() - 7);
      setCurrentDate(prevWeek);
    }
  };

  const handleNextMonth = () => {
    if (viewMode === 'MONTH') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else {
      const nextWeek = new Date(currentDate);
      nextWeek.setDate(nextWeek.getDate() + 7);
      setCurrentDate(nextWeek);
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Generate calendar days grid for MONTH view
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarCells = [];
  // Previous month padding cells
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push(null);
  }
  // Days of current month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarCells.push(day);
  }

  // Get date string YYYY-MM-DD
  const getDateString = (day: number) => {
    const mStr = (month + 1).toString().padStart(2, '0');
    const dStr = day.toString().padStart(2, '0');
    return `${year}-${mStr}-${dStr}`;
  };

  // Helper to get items for a specific date
  const getItemsForDay = (day: number) => {
    const dateStr = getDateString(day);
    const dateObj = new Date(year, month, day);
    const dayOfWeek = dateObj.getDay();

    const matchedEvents = events.filter((e) => e.start_date.split('T')[0] === dateStr);
    const matchedSlots = DEFAULT_RECURRING_SLOTS.filter((s) => s.dayOfWeek === dayOfWeek);

    return { matchedEvents, matchedSlots };
  };

  // Get 7 days for WEEK view
  const getWeekDays = () => {
    const curr = new Date(currentDate);
    const dayOfWeek = curr.getDay();
    const startOfWeek = new Date(curr);
    startOfWeek.setDate(curr.getDate() - dayOfWeek);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      weekDays.push(d);
    }
    return weekDays;
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-sm">
      
      {/* Calendar Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={handlePrevMonth}
              aria-label="Mois précédent"
              className="p-1.5 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-semibold text-slate-200 hover:text-white transition"
            >
              Aujourd'hui
            </button>
            <button
              onClick={handleNextMonth}
              aria-label="Mois suivant"
              className="p-1.5 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h3 className="text-base font-bold text-white font-serif">
            {monthNamesFr[month]} {year}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          
          {/* Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            aria-label="Filtrer les créneaux"
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-1.5 outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">Tous les créneaux & cultes</option>
            <option value="EVENTS">Événements uniquement</option>
            <option value="REHEARSAL">Répétitions & Chorale</option>
            <option value="WORSHIP">Cultes dominicaux</option>
          </select>

          {/* View Switcher: Month vs Week */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('MONTH')}
              className={`px-3 py-1.5 rounded-lg transition font-bold ${
                viewMode === 'MONTH' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Mois
            </button>
            <button
              onClick={() => setViewMode('WEEK')}
              className={`px-3 py-1.5 rounded-lg transition font-bold ${
                viewMode === 'WEEK' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Semaine
            </button>
          </div>

        </div>

      </div>

      {/* MONTH VIEW */}
      {viewMode === 'MONTH' && (
        <div className="space-y-2">
          {/* Days Headers */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-slate-400 text-xs py-1 uppercase tracking-wider bg-slate-850/80 rounded-xl border border-slate-800">
            {daysOfWeekFr.map((day) => (
              <div key={day} className="py-1">{day}</div>
            ))}
          </div>

          {/* Days Cells Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarCells.map((day, idx) => {
              if (day === null) {
                return (
                  <div
                    key={`empty-${idx}`}
                    className="bg-slate-950/40 border border-slate-900 rounded-xl min-h-[100px] p-1 opacity-40"
                  />
                );
              }

              const dateStr = getDateString(day);
              const isToday = dateStr === todayStr;
              const { matchedEvents, matchedSlots } = getItemsForDay(day);

              const showEvents = filterType === 'ALL' || filterType === 'EVENTS';
              const showRehearsals = filterType === 'ALL' || filterType === 'REHEARSAL';
              const showWorship = filterType === 'ALL' || filterType === 'WORSHIP';

              return (
                <div
                  key={`day-${day}`}
                  onClick={() => onOpenCreateModal(dateStr)}
                  className={`bg-slate-850/80 bg-slate-900 border rounded-xl min-h-[100px] p-2 flex flex-col justify-between hover:border-emerald-500/50 cursor-pointer transition relative group ${
                    isToday ? 'border-emerald-500 ring-1 ring-emerald-500/40 bg-emerald-950/20' : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center ${
                      isToday ? 'bg-emerald-600 text-white font-extrabold shadow' : 'text-slate-300'
                    }`}>
                      {day}
                    </span>
                    <Plus className="w-3.5 h-3.5 text-slate-600 group-hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition" />
                  </div>

                  {/* Items List */}
                  <div className="space-y-1 overflow-y-auto max-h-[75px] text-[10px]">
                    {/* Special Church Events */}
                    {showEvents && matchedEvents.map((evt) => (
                      <div
                        key={evt.id}
                        className="bg-emerald-950 border border-emerald-800/80 text-emerald-200 px-1.5 py-0.5 rounded font-semibold truncate"
                        title={`${evt.title} (${evt.location})`}
                      >
                        🌟 {evt.title}
                      </div>
                    ))}

                    {/* Recurring Service / Rehearsal slots */}
                    {matchedSlots.map((slot) => {
                      if (slot.type === 'REHEARSAL' && !showRehearsals) return null;
                      if (slot.type === 'WORSHIP' && !showWorship) return null;

                      const isRehearsal = slot.type === 'REHEARSAL';
                      const isWorship = slot.type === 'WORSHIP';

                      return (
                        <div
                          key={slot.id}
                          className={`px-1.5 py-0.5 rounded truncate font-medium ${
                            isWorship
                              ? 'bg-purple-950 border border-purple-800/80 text-purple-200'
                              : isRehearsal
                              ? 'bg-amber-950 border border-amber-800/80 text-amber-200'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                          title={`${slot.title} - ${slot.time}`}
                        >
                          {isWorship ? '⛪' : isRehearsal ? '🎵' : '📖'} {slot.title}
                        </div>
                      );
                    })}
                  </div>

                  {matchedEvents.length === 0 && matchedSlots.length === 0 && (
                    <div className="text-[10px] text-slate-600 italic mt-auto">Aucun créneau</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* WEEK VIEW */}
      {viewMode === 'WEEK' && (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {getWeekDays().map((d, i) => {
            const dateStr = d.toISOString().split('T')[0];
            const isToday = dateStr === todayStr;
            const dayNum = d.getDate();
            const { matchedEvents, matchedSlots } = getItemsForDay(dayNum);

            return (
              <div
                key={dateStr}
                onClick={() => onOpenCreateModal(dateStr)}
                className={`bg-slate-900 border rounded-2xl p-3 space-y-2 cursor-pointer hover:border-emerald-500/50 transition ${
                  isToday ? 'border-emerald-500 bg-emerald-950/20' : 'border-slate-800'
                }`}
              >
                <div className="border-b border-slate-800 pb-1.5 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold uppercase text-slate-400">
                      {daysOfWeekFr[d.getDay()]}
                    </div>
                    <div className={`text-sm font-extrabold ${isToday ? 'text-emerald-400' : 'text-white'}`}>
                      {dayNum} {monthNamesFr[d.getMonth()]}
                    </div>
                  </div>
                  {isToday && (
                    <span className="text-[9px] font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded">
                      Aujourd'hui
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 text-xs">
                  {matchedEvents.map((evt) => (
                    <div
                      key={evt.id}
                      className="bg-emerald-950 border border-emerald-800 p-2 rounded-xl text-emerald-200 font-semibold space-y-1"
                    >
                      <div className="text-[11px] font-bold text-white flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-400" />
                        {evt.title}
                      </div>
                      <div className="text-[10px] text-emerald-300 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {evt.location}
                      </div>
                    </div>
                  ))}

                  {matchedSlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="bg-slate-800 border border-slate-700 p-2 rounded-xl text-slate-200 space-y-1"
                    >
                      <div className="font-semibold text-white text-[11px] flex items-center gap-1">
                        {slot.type === 'WORSHIP' ? <BookOpen className="w-3 h-3 text-purple-400" /> : <Music className="w-3 h-3 text-amber-400" />}
                        {slot.title}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {slot.time}
                      </div>
                    </div>
                  ))}

                  {matchedEvents.length === 0 && matchedSlots.length === 0 && (
                    <div className="text-xs text-slate-500 italic py-4 text-center">
                      Aucune activité
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Legend Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 border-t border-slate-800 pt-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-950 border border-emerald-800" />
            <span>Événement Spécial</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-purple-950 border border-purple-800" />
            <span>Culte Dominical</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-950 border border-amber-800" />
            <span>Répétition Chorale / Louange</span>
          </div>
        </div>

        <button
          onClick={() => onOpenCreateModal()}
          className="text-emerald-400 hover:underline font-semibold flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" /> Programmer un créneau
        </button>
      </div>

    </div>
  );
};
