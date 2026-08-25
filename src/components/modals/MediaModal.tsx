import React, { useState, useEffect } from 'react';
import { X, Music, Mic, FileText, Video, Upload, Link, CheckCircle2, BookOpen, ExternalLink } from 'lucide-react';
import { MediaItem, MediaCategory } from '../../types';
import { mediaService } from '../../services/mediaService';

interface MediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveMedia: (mediaData: Omit<MediaItem, 'id' | 'created_at' | 'views_count'>) => Promise<void>;
  churchId: string;
}

export const MediaModal: React.FC<MediaModalProps> = ({
  isOpen,
  onClose,
  onSaveMedia,
  churchId,
}) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<MediaCategory[]>([]);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>('SERMON');
  const [preacherName, setPreacherName] = useState('');
  const [description, setDescription] = useState('');
  const [mediaDate, setMediaDate] = useState(new Date().toISOString().split('T')[0]);
  const [fileUrl, setFileUrl] = useState('');
  const [educationalLinkUrl, setEducationalLinkUrl] = useState('');
  const [bibleReferences, setBibleReferences] = useState('');
  const [referenceBooks, setReferenceBooks] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  useEffect(() => {
    if (isOpen) {
      mediaService.getCategories().then(cats => setCategories(cats)).catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const finalUrl = fileUrl.trim() || (category === 'SERMON' 
        ? 'https://audio.eglisebf.org/sermons/predication-culte.mp3'
        : 'https://docs.eglisebf.org/bulletin-semaine.pdf');

      await onSaveMedia({
        church_id: churchId,
        title: title.trim(),
        category,
        description: description.trim(),
        preacher_name: preacherName.trim() || (category === 'BULLETIN' ? 'Secrétariat Église' : 'Pasteur Samuel Ouedraogo'),
        media_date: mediaDate,
        file_url: finalUrl,
        educational_link_url: educationalLinkUrl.trim() || undefined,
        bible_references: bibleReferences.trim() || undefined,
        reference_books: referenceBooks.trim() || undefined,
        is_public: isPublic,
      });

      // Reset
      setTitle('');
      setDescription('');
      setPreacherName('');
      setFileUrl('');
      setEducationalLinkUrl('');
      setBibleReferences('');
      setReferenceBooks('');
      onClose();
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la publication du média.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-[#0] z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-950 text-emerald-400 rounded-xl border border-emerald-800/80">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Publier un Média / Message</h3>
              <p className="text-xs text-slate-400">Ajouter une prédication MP3, bulletin PDF ou vidéo de convention</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Catégorie du Média *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {categories.length > 0 ? (
                  categories.map(c => (
                    <option key={c.id} value={c.code}>
                      {c.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="SERMON">Prédication Audio MP3</option>
                    <option value="EDUCATIONAL_RESOURCE">Ressource Éducative / Manuel</option>
                    <option value="BULLETIN">Bulletin PDF & Annonces</option>
                    <option value="AUDIO_TEACHING">Enseignement Biblique Audio</option>
                    <option value="DOCUMENT">Document / Guide PDF</option>
                    <option value="LIVESTREAM">Culte en Direct / Lien Vidéo</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Date du Média *</label>
              <input
                type="date"
                required
                value={mediaDate}
                onChange={(e) => setMediaDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Titre du Média ou Thème du Message *
            </label>
            <input
              type="text"
              required
              placeholder="ex: Manuel d'Étude Biblique : La Foi Active et Vivante"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Orateur / Auteur / Département Émetteur
            </label>
            <input
              type="text"
              placeholder="ex: Pasteur Samuel Ouedraogo / Département Enseignement"
              value={preacherName}
              onChange={(e) => setPreacherName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Lien du Fichier Média Principal (MP3 / PDF / YouTube)
            </label>
            <input
              type="url"
              placeholder="https://.../message-dimanche.mp3"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Section Ressources Éducatives & Références */}
          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl space-y-3">
            <h4 className="text-xs font-bold uppercase text-emerald-400 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" /> Ressources Éducatives & Références Complémentaires
            </h4>

            <div>
              <label className="block text-xs text-slate-300 mb-1 flex items-center gap-1">
                <ExternalLink className="w-3 h-3 text-emerald-400" /> Lien externe de Ressource Éducative / Manuel d'étude
              </label>
              <input
                type="url"
                placeholder="https://editions.eglisebf.org/guide-etude-2026.pdf"
                value={educationalLinkUrl}
                onChange={(e) => setEducationalLinkUrl(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Passages & Versets Bibliques Clés</label>
                <input
                  type="text"
                  placeholder="ex: Hébreux 11:1-6, Jacques 2:14-26"
                  value={bibleReferences}
                  onChange={(e) => setBibleReferences(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Ouvrages ou Livres de Référence</label>
                <input
                  type="text"
                  placeholder="ex: Dictionnaire Biblique Westphal, Tome 2"
                  value={referenceBooks}
                  onChange={(e) => setReferenceBooks(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Résumé & Passage Biblique Clé
            </label>
            <textarea
              rows={3}
              placeholder="Sujets abordés, versets clés (ex: Matthieu 7:24-27)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="pub-media"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="rounded bg-slate-950 border-slate-800 text-emerald-600 focus:ring-0"
            />
            <label htmlFor="pub-media" className="text-xs text-slate-300 cursor-pointer">
              Rendre ce média accessible publiquement aux fidèles
            </label>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" /> Publier dans la Médiathèque
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
