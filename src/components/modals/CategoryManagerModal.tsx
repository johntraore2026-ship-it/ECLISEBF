import React, { useState, useEffect } from 'react';
import { X, FolderPlus, Trash2, Tag, CheckCircle2, ListFilter } from 'lucide-react';
import { MediaCategory } from '../../types';
import { mediaService } from '../../services/mediaService';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDemoMode: boolean;
  onCategoriesUpdated: () => void;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  isDemoMode,
  onCategoriesUpdated,
}) => {
  const [categories, setCategories] = useState<MediaCategory[]>([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadCategories = async () => {
    const cats = await mediaService.getCategories(undefined, isDemoMode);
    setCategories(cats);
  };

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen, isDemoMode]);

  if (!isOpen) return null;

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      const generatedCode = code.trim() ? code.trim().toUpperCase().replace(/\s+/g, '_') : name.trim().toUpperCase().replace(/\s+/g, '_');
      await mediaService.createCategory(
        {
          name: name.trim(),
          code: generatedCode,
          description: description.trim() || undefined,
        },
        isDemoMode
      );

      setName('');
      setCode('');
      setDescription('');
      await loadCategories();
      onCategoriesUpdated();
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la création de la catégorie.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (catId: string) => {
    if (!confirm('Voulez-vous supprimer cette catégorie de médias ?')) return;
    await mediaService.deleteCategory(catId, isDemoMode);
    await loadCategories();
    onCategoriesUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-950 text-emerald-400 rounded-xl border border-emerald-800">
              <ListFilter className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Gestion des Catégories de Médias</h3>
              <p className="text-xs text-slate-400">Définir les rubriques d'archivage des médias et ressources</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form & List Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Add Category Form */}
          <form onSubmit={handleAddCategory} className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-3">
            <h4 className="text-xs font-bold uppercase text-emerald-400 flex items-center gap-1.5">
              <FolderPlus className="w-4 h-4" /> Créer une Nouvelle Catégorie
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Nom de la Catégorie *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Guides d'Affermissement"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Code / Identifiant (Optionnel)</label>
                <input
                  type="text"
                  placeholder="ex: GUIDE_STUDY"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500 uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Description courte</label>
              <input
                type="text"
                placeholder="Description du contenu de cette catégorie..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={submitting || !name.trim()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" /> Ajouter la Catégorie
              </button>
            </div>
          </form>

          {/* Categories List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase text-slate-300">
              Catégories Existantes ({categories.length})
            </h4>

            <div className="divide-y divide-slate-800 bg-slate-950/40 border border-slate-800 rounded-xl overflow-hidden">
              {categories.map((cat) => (
                <div key={cat.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-900/60 transition">
                  <div>
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-semibold text-white text-xs">{cat.name}</span>
                      <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                        {cat.code}
                      </span>
                    </div>
                    {cat.description && (
                      <p className="text-[11px] text-slate-400 mt-0.5">{cat.description}</p>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition"
                    title="Supprimer la catégorie"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
