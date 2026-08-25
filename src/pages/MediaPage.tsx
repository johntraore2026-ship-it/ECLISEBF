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
  Volume2,
  Trash2,
  FolderCog,
  BookOpen,
  Bookmark
} from 'lucide-react';
import { MediaItem } from '../types';
import { mediaService } from '../services/mediaService';
import { useAuth } from '../contexts/AuthContext';
import { MediaModal } from '../components/modals/MediaModal';
import { CategoryManagerModal } from '../components/modals/CategoryManagerModal';

export const MediaPage: React.FC = () => {
  const { churchId, isDemoMode, hasRole } = useAuth();

  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [activeType, setActiveType] = useState<string>('ALL');
  const [playingMedia, setPlayingMedia] = useState<MediaItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const canPublishMedia = hasRole('SUPER_ADMIN') || hasRole('CHURCH_ADMIN') || hasRole('PASTOR') || hasRole('SECRETARY') || hasRole('LEADER');

  const loadMedia = async () => {
    if (!churchId) return;
    try {
      const data = await mediaService.getMedia(churchId, isDemoMode);
      setMediaItems(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadMedia();
  }, [churchId, isDemoMode]);

  const handleSaveMedia = async (mediaData: Omit<MediaItem, 'id' | 'created_at' | 'views_count'>) => {
    await mediaService.createMedia(mediaData, isDemoMode);
    await loadMedia();
  };

  const handleDeleteMedia = async (mediaId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Voulez-vous supprimer ce fichier de la médiathèque ?')) return;
    await mediaService.deleteMedia(mediaId, isDemoMode);
    if (playingMedia?.id === mediaId) setPlayingMedia(null);
    await loadMedia();
  };

  const filteredMedia = mediaItems.filter(m => {
    if (activeType === 'ALL') return true;
    const cat = m.category || (m as any).type;
    if (activeType === 'SERMON_AUDIO') return cat === 'SERMON' || cat === 'AUDIO_TEACHING' || cat === 'SERMON_AUDIO';
    if (activeType === 'BULLETIN') return cat === 'BULLETIN' || cat === 'DOCUMENT';
    return cat === activeType;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Music className="w-6 h-6 text-emerald-400" />
            <h1 className="text-xl font-bold text-white">Médiathèque, Prédications & Bulletins</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Archives audio MP3 des messages dominicaux, vidéos de conventions, bulletins d'annonces PDF
          </p>
        </div>

        {canPublishMedia && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              id="manage-categories-btn"
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition shadow-sm"
            >
              <FolderCog className="w-4 h-4 text-emerald-400" />
              Catégories de Médias
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              id="add-media-btn"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow transition shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              Publier un Média / Message
            </button>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveType('ALL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
            activeType === 'ALL' ? 'bg-emerald-600 text-white shadow' : 'bg-slate-800 text-slate-300 hover:text-white'
          }`}
        >
          Tous les Médias ({mediaItems.length})
        </button>
        <button
          onClick={() => setActiveType('SERMON_AUDIO')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
            activeType === 'SERMON_AUDIO' ? 'bg-emerald-600 text-white shadow' : 'bg-slate-800 text-slate-300 hover:text-white'
          }`}
        >
          <Mic className="w-3.5 h-3.5" /> Prédications Audio MP3
        </button>
        <button
          onClick={() => setActiveType('BULLETIN')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
            activeType === 'BULLETIN' ? 'bg-emerald-600 text-white shadow' : 'bg-slate-800 text-slate-300 hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> Bulletins PDF & Docs
        </button>
      </div>

      {/* Media Player Bar if active */}
      {playingMedia && (
        <div className="bg-emerald-950/90 border border-emerald-700/80 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 text-white shadow-xl animate-in slide-in-from-top-4 duration-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600 rounded-xl animate-pulse shrink-0">
              <Volume2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[10px] uppercase text-emerald-300 font-bold tracking-wider">En cours de lecture</span>
              <h3 className="font-bold text-sm text-white">{playingMedia.title}</h3>
              <p className="text-xs text-slate-300">{playingMedia.preacher_name || (playingMedia as any).speaker_name} • {playingMedia.media_date || (playingMedia as any).date}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <audio controls autoPlay className="h-9 max-w-full md:max-w-xs rounded-lg">
              <source src={playingMedia.file_url} type="audio/mp3" />
            </audio>
            <button
              onClick={() => setPlayingMedia(null)}
              className="text-xs text-slate-400 hover:text-white px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg shrink-0"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Media Grid */}
      {filteredMedia.length === 0 ? (
        <div className="p-12 bg-slate-900 border border-slate-800 rounded-2xl text-center text-xs text-slate-500">
          Aucun média publié dans cette catégorie. Cliquez sur <strong className="text-slate-300">"Publier un Média / Message"</strong> pour ajouter le premier enregistrement.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMedia.map((media) => {
            const cat = media.category || (media as any).type;
            const isAudio = cat === 'SERMON' || cat === 'AUDIO_TEACHING' || cat === 'SERMON_AUDIO';
            const isBulletin = cat === 'BULLETIN' || cat === 'DOCUMENT';

            return (
              <div
                key={media.id}
                className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-3 hover:border-emerald-500/50 transition shadow-sm relative group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="p-2.5 rounded-xl bg-emerald-950 border border-emerald-800/60 text-emerald-400 shrink-0">
                      {isAudio ? <Mic className="w-5 h-5" /> : isBulletin ? <FileText className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                        {cat}
                      </span>
                      {canPublishMedia && (
                        <button
                          onClick={(e) => handleDeleteMedia(media.id, e)}
                          title="Supprimer ce média"
                          className="p-1 text-slate-500 hover:text-red-400 rounded transition opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-3">
                    <h3 className="font-bold text-sm text-white">{media.title}</h3>
                    <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                      <span>{media.preacher_name || (media as any).speaker_name || 'Orateur'}</span>
                      <span>•</span>
                      <span>{media.media_date || (media as any).date}</span>
                    </div>
                    {media.description && (
                      <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                        {media.description}
                      </p>
                    )}

                    {/* Educational Resource Links & Verses */}
                    {(media.educational_link_url || media.bible_references || media.reference_books) && (
                      <div className="mt-3 p-2.5 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1.5 text-[11px]">
                        {media.bible_references && (
                          <div className="text-emerald-400 font-semibold flex items-center gap-1">
                            <Bookmark className="w-3 h-3 shrink-0 text-emerald-400" /> Versets : {media.bible_references}
                          </div>
                        )}
                        {media.reference_books && (
                          <div className="text-slate-300 flex items-center gap-1">
                            <BookOpen className="w-3 h-3 shrink-0 text-blue-400" /> Ref: {media.reference_books}
                          </div>
                        )}
                        {media.educational_link_url && (
                          <a
                            href={media.educational_link_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-emerald-400 hover:underline font-semibold text-[10px] bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800"
                          >
                            <ExternalLink className="w-2.5 h-2.5" /> Manuel / Lien d'Étude
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
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
                      <Download className="w-3.5 h-3.5 text-emerald-400" /> Télécharger Doc
                    </a>
                  )}

                  <span className="text-[11px] text-slate-500 font-mono">
                    {media.views_count ? `${media.views_count} vues` : 'Doc officiel'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Media Modal */}
      <MediaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaveMedia={handleSaveMedia}
        churchId={churchId || ''}
      />

      {/* Category Manager Modal */}
      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        isDemoMode={isDemoMode}
        onCategoriesUpdated={loadMedia}
      />

    </div>
  );
};

