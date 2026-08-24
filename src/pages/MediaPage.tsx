import React, { useState, useEffect } from 'react';
import {
  Music,
  Play,
  Download,
  FileText,
  Video,
  Mic,
  Calendar,
  User,
  PlusCircle,
  ExternalLink,
  Volume2
} from 'lucide-react';
import { MediaItem } from '../types';
import { mediaService } from '../services/mediaService';
import { useAuth } from '../contexts/AuthContext';

export const MediaPage: React.FC = () => {
  const { churchId, isDemoMode } = useAuth();

  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [activeType, setActiveType] = useState<string>('ALL');
  const [playingMedia, setPlayingMedia] = useState<MediaItem | null>(null);

  useEffect(() => {
    if (!churchId) return;
    mediaService.getMedia(churchId, isDemoMode).then(setMediaItems).catch(console.error);
  }, [churchId, isDemoMode]);

  const filteredMedia = mediaItems.filter(m => activeType === 'ALL' || m.type === activeType);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <Music className="w-6 h-6 text-emerald-400" />
            <h1 className="text-xl font-bold text-white">Médiathèque, Prédications & Bulletins</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Archives audio MP3 des messages dominicaux, vidéos de conventions, bulletins d'annonces PDF
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveType('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
            activeType === 'ALL' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
          }`}
        >
          Tous les Médias ({mediaItems.length})
        </button>
        <button
          onClick={() => setActiveType('SERMON_AUDIO')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
            activeType === 'SERMON_AUDIO' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
          }`}
        >
          <Mic className="w-3.5 h-3.5" /> Prédications Audio MP3
        </button>
        <button
          onClick={() => setActiveType('BULLETIN')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
            activeType === 'BULLETIN' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> Bulletins PDF
        </button>
      </div>

      {/* Media Player Bar if active */}
      {playingMedia && (
        <div className="bg-emerald-950/80 border border-emerald-700/60 p-4 rounded-2xl flex items-center justify-between gap-4 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600 rounded-xl animate-pulse">
              <Volume2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[10px] uppercase text-emerald-300 font-bold">En cours de lecture</span>
              <h3 className="font-bold text-sm text-white">{playingMedia.title}</h3>
              <p className="text-xs text-slate-300">{playingMedia.speaker_name} • {playingMedia.date}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <audio controls autoPlay className="h-8 max-w-xs">
              <source src={playingMedia.file_url} type="audio/mp3" />
            </audio>
            <button
              onClick={() => setPlayingMedia(null)}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded-lg"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Media Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMedia.map((media) => {
          const isAudio = media.type === 'SERMON_AUDIO';
          const isBulletin = media.type === 'BULLETIN';

          return (
            <div
              key={media.id}
              className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-3 hover:border-emerald-500/50 transition shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="p-2.5 rounded-xl bg-emerald-950 border border-emerald-800/60 text-emerald-400">
                  {isAudio ? <Mic className="w-5 h-5" /> : isBulletin ? <FileText className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </div>
                <span className="text-[10px] font-bold uppercase bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                  {media.type}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-white">{media.title}</h3>
                <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                  <span>{media.speaker_name || 'Orateur Évangélique'}</span>
                  <span>•</span>
                  <span>{media.date}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                {isAudio ? (
                  <button
                    onClick={() => setPlayingMedia(media)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow"
                  >
                    <Play className="w-3.5 h-3.5" /> Écouter le Message
                  </button>
                ) : (
                  <a
                    href={media.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" /> Télécharger PDF
                  </a>
                )}

                <span className="text-[11px] text-slate-500 font-mono">
                  {media.duration_minutes ? `${media.duration_minutes} min` : 'Doc officiel'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
