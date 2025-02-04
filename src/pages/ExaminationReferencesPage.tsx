import React, { useState, useEffect } from 'react';
import { Plus, Trash2, AlertCircle, Search } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog.tsx';
import { getExaminations, getReferenceValues, getSpecificConditions, createSpecificCondition, createReferenceValue, deleteReferenceValue } from '../services/api.tsx';
import { extraireCode } from '../services/function.tsx';

interface Examination {
  id: string;
  designation: string;
}

interface ReferenceValue {
  id: string;
  designation_exam: string;
  id_exam: string;
  min_value: number;
  max_value: number | null;
  sexe: string | null;
  min_age: number | null;
  max_age: number | null;
  id_specific_condition: string | null;
  specific_condition?: {
    designation: string;
  };
}

interface SpecificCondition {
  id: string;
  designation: string;
}

interface NewReferenceValue {
  min_value: string;
  max_value: string;
  sexe: string;
  min_age: string;
  max_age: string;
  specific_condition: string;
}

const ExaminationReferencesPage: React.FC = () => {
  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [filteredExaminations, setFilteredExaminations] = useState<Examination[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [referenceValues, setReferenceValues] = useState<ReferenceValue[]>([]);
  const [specificConditions, setSpecificConditions] = useState<SpecificCondition[]>([]);
  const [isAddingReference, setIsAddingReference] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<ReferenceValue | null>(null);

  const [newReference, setNewReference] = useState<NewReferenceValue>({
    min_value: '',
    max_value: '',
    sexe: '',
    min_age: '',
    max_age: '',
    specific_condition: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedExam) {
      fetchReferenceValues(selectedExam);
    }
  }, [selectedExam]);

  useEffect(() => {
    const filtered = examinations.filter(exam =>
      exam.designation.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredExaminations(filtered);
  }, [searchTerm, examinations]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [examsData, conditionsData] = await Promise.all([
        getExaminations(),
        getSpecificConditions()
      ]);
      setExaminations(examsData);
      setFilteredExaminations(examsData);
      setSpecificConditions(conditionsData);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReferenceValues = async (examId: string) => {
    try {
      const values = await getReferenceValues(examId);
      setReferenceValues(values);
    } catch (err) {
      setError('Erreur lors du chargement des valeurs de référence');
    }
  };

  const handleAddReference = async () => {
    try {
      if (!selectedExam || !newReference.min_value) {
        setError('Veuillez remplir les champs obligatoires');
        return;
      }

      let specificConditionId: string | null = null;
      if (newReference.specific_condition) {
        const condition = await createSpecificCondition(newReference.specific_condition);
        specificConditionId = condition.id;
      }

      const referenceValue = {
        id_exam: selectedExam,
        designation: examinations.find(exam => parseInt(exam.id) === parseInt(selectedExam))?.designation || '',
        min_value: parseFloat(newReference.min_value),
        max_value: newReference.max_value ? parseFloat(newReference.max_value) : null,
        sexe: newReference.sexe || null,
        min_age: newReference.min_age ? parseInt(newReference.min_age) : null,
        max_age: newReference.max_age ? parseInt(newReference.max_age) : null,
        id_specific_condition: specificConditionId
      };

      await createReferenceValue(referenceValue);
      await fetchReferenceValues(selectedExam);
      setIsAddingReference(false);
      setNewReference({
        min_value: '',
        max_value: '',
        sexe: '',
        min_age: '',
        max_age: '',
        specific_condition: ''
      });
      setError(null);
    } catch (err) {
        console.log(err);
        
      setError('Erreur lors de l\'ajout de la valeur de référence');
    }
  };

  const handleDeleteClick = (value: ReferenceValue) => {
    setDeleteConfirmation(value);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmation) return;

    try {
      await deleteReferenceValue(deleteConfirmation.id);
      await fetchReferenceValues(selectedExam);
      setError(null);
    } catch (err) {
      setError('Erreur lors de la suppression');
    } finally {
      setDeleteConfirmation(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-600">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">VALEURS DE RÉFÉRENCE DES EXAMENS</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center text-red-700">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6 space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher un examen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 rounded-md border border-gray-300 focus:ring-2 focus:ring-[#464E77] focus:border-[#464E77] outline-none"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>

            <div>
              <label htmlFor="examination" className="block text-sm font-medium text-gray-700 mb-2">
                Sélectionner un examen
              </label>
              <select
                id="examination"
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#464E77] focus:border-transparent"
              >
                <option value="">Sélectionner...</option>
                {filteredExaminations.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {extraireCode(exam.designation)}
                  </option>
                ))}
              </select>
              {filteredExaminations.length === 0 && searchTerm && (
                <p className="mt-2 text-sm text-gray-500">
                  Aucun examen trouvé pour "{searchTerm}"
                </p>
              )}
            </div>
          </div>

          {selectedExam && (
            <>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Valeurs de référence</h3>
                <button
                  onClick={() => setIsAddingReference(true)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-[#464E77] hover:bg-[#363c5d]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter
                </button>
              </div>

              {isAddingReference && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Nouvelle valeur de référence</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Valeur minimale <span className=' text-red-500'>*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={newReference.min_value}
                        onChange={(e) => setNewReference({ ...newReference, min_value: e.target.value })}
                        className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Valeur maximale
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={newReference.max_value}
                        onChange={(e) => setNewReference({ ...newReference, max_value: e.target.value })}
                        className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Genre
                      </label>
                      <select
                        value={newReference.sexe}
                        onChange={(e) => setNewReference({ ...newReference, sexe: e.target.value })}
                        className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2"
                      >
                        <option value="">Tous</option>
                        <option value="M">Homme</option>
                        <option value="F">Femme</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Âge minimum
                      </label>
                      <input
                        type="number"
                        value={newReference.min_age}
                        onChange={(e) => setNewReference({ ...newReference, min_age: e.target.value })}
                        className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Âge maximum
                      </label>
                      <input
                        type="number"
                        value={newReference.max_age}
                        onChange={(e) => setNewReference({ ...newReference, max_age: e.target.value })}
                        className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Condition spécifique
                      </label>
                      <input
                        type="text"
                        value={newReference.specific_condition}
                        onChange={(e) => setNewReference({ ...newReference, specific_condition: e.target.value })}
                        className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2"
                        placeholder="Nouvelle condition..."
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end space-x-3">
                    <button
                      onClick={() => setIsAddingReference(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleAddReference}
                      className="px-4 py-2 bg-[#464E77] text-white rounded-md hover:bg-[#363c5d]"
                    >
                      Enregistrer
                    </button>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Min</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Max</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Genre</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Âge Min</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Âge Max</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Condition</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {referenceValues.map((value) => (
                      <tr key={value.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{value.min_value}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{value.max_value || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {value.sexe === 'M' ? 'Homme' : value.sexe === 'F' ? 'Femme' : 'Tous'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{value.min_age || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{value.max_age || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {value.specific_condition?.designation || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleDeleteClick(value)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {referenceValues.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                          Aucune valeur de référence trouvée
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteConfirmation !== null}
        message="Êtes-vous sûr de vouloir supprimer cette valeur de référence ?"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirmation(null)}
      />
    </div>
  );
};

export default ExaminationReferencesPage;