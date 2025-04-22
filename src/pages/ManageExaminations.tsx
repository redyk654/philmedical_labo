import React, { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, Search, AlertCircle } from 'lucide-react';
import { getExaminationCategories, createExamination, updateExamination, deleteExamination, getExamensLabo } from '../services/api.tsx';
import ConfirmDialog from '../components/ConfirmDialog.tsx';

interface Examination {
  id: string;
  designation: string;
  contenu?: string;
  categorie_id: string;
}

interface Category {
  id: string;
  designation: string;
}

const ManageExaminations: React.FC = () => {
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredExaminations, setFilteredExaminations] = useState<Examination[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<Examination | null>(null);

  const [formData, setFormData] = useState<Partial<Examination>>({
    designation: '',
    contenu: '',
    categorie_id: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = examinations.filter(exam =>
      exam.designation.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredExaminations(filtered);
  }, [searchTerm, examinations]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [examsData, categoriesData] = await Promise.all([
        getExamensLabo(),
        getExaminationCategories()
      ]);
      setExaminations(examsData);
      setFilteredExaminations(examsData);
      setCategories(categoriesData);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditing && formData.id) {
        await updateExamination(formData.id, formData);
      } else {
        await createExamination(formData);
      }
      
      await fetchData();
      resetForm();
      setError(null);
    } catch (err) {
      setError('Erreur lors de l\'enregistrement');
    }
  };

  const handleEdit = (examination: Examination) => {
    setFormData(examination);
    setIsEditing(true);
  };

  const handleDeleteClick = (examination: Examination) => {
    setDeleteConfirmation(examination);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmation) return;

    try {
      await deleteExamination(deleteConfirmation.id);
      await fetchData();
      setError(null);
    } catch (err) {
      setError('Erreur lors de la suppression');
    } finally {
      setDeleteConfirmation(null);
    }
  };

  const resetForm = () => {
    setFormData({
      designation: '',
      contenu: '',
      categorie_id: ''
    });
    setIsEditing(false);
  };

  const handleChangeContenu = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;

    // On teste le nouveau texte (après ajout)
    if (textarea) {
      (textarea as HTMLTextAreaElement).value = e.target.value;
    }

    // if (textarea && textarea.scrollHeight > textarea.clientHeight) {
    //     // un son ou un avertissement
    //     alert("Le contenu est trop long");
    //     return;
    // }
    setFormData({ ...formData, contenu: e.target.value });
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-600">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">GESTION DES EXAMENS</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center text-red-700">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-[1400px] mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {isEditing ? 'Modifier l\'examen' : 'Nouvel examen'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="designation" className="block text-sm font-medium text-gray-700 mb-1">
                Désignation
              </label>
              <input
                type="text"
                id="designation"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#464E77] focus:border-[#464E77]"
                required
                autoComplete='off'
                autoCapitalize='on'
              />
            </div>

            <div>
              <label htmlFor="categorie" className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie
              </label>
              <select
                id="categorie"
                value={formData.categorie_id}
                onChange={(e) => setFormData({ ...formData, categorie_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#464E77] focus:border-[#464E77]"
                required
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.designation}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="contenu" className="block text-sm font-medium text-gray-700 mb-1">
                Contenu
              </label>
              <textarea
                ref={textareaRef}
                id="contenu"
                value={formData.contenu}
                onChange={handleChangeContenu}
                rows={23}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#464E77] focus:border-[#464E77]"
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#464E77] text-white rounded-md hover:bg-[#363c5d]"
              >
                {isEditing ? 'Modifier' : 'Ajouter'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher un bilan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:ring-[#464E77] focus:border-[#464E77]"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Désignation
                  </th>
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Catégorie
                  </th> */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredExaminations.map((examination) => (
                  <tr key={examination.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {examination.designation}
                    </td>
                    {/* <td className="px-6 py-4 whitespace-nowrap">
                      {categories.find(c => c.id === examination.categorie_id)?.designation}
                    </td> */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(examination)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(examination)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredExaminations.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                      Aucun examen trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteConfirmation !== null}
        message="Êtes-vous sûr de vouloir supprimer cet examen ?"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirmation(null)}
      />
    </div>
  );
};

export default ManageExaminations;