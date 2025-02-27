import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { getBilanDetails, updateExaminationResult, BilanDetails, BilanDetail } from '../services/api.tsx';
import { afficherSexe, convertDate } from '../services/function.tsx';

interface BilanDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  numFacture: string;
  patientName: string;
  patientAge: number;
  patientSexe: string;
}

const BilanDetailsModal: React.FC<BilanDetailsModalProps> = ({
  isOpen,
  onClose,
  numFacture,
  patientName,
  patientAge,
  patientSexe
}) => {
  const [bilanDetails, setBilanDetails] = useState<BilanDetails | null>(null);
  const [editedResults, setEditedResults] = useState<Record<string, string>>({});
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingExamId, setSavingExamId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && numFacture) {
      fetchBilanDetails();
    }
  }, [isOpen, numFacture]);

  const fetchBilanDetails = async () => {
    try {
      setIsLoading(true);
      const details = await getBilanDetails(numFacture);
      setBilanDetails(details);
      setComment(details.commentaire || '');
      
      // Initialize edited results
      const initialResults: Record<string, string> = {};
      details.examens.forEach(exam => {
        initialResults[exam.id] = exam.resultat || '';
      });
      setEditedResults(initialResults);
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResultChange = (examId: string, value: string) => {
    setEditedResults(prev => ({
      ...prev,
      [examId]: value
    }));
  };

  const handleSaveResult = async (exam: BilanDetail) => {
    try {
      setSavingExamId(exam.id);
      await updateExaminationResult(exam.id, editedResults[exam.id], comment);
      await fetchBilanDetails(); // Refresh data
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setSavingExamId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">DÉTAILS DU BILAN</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-gray-600">Chargement...</div>
            </div>
          ) : bilanDetails ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Patient</h3>
                    <p className="mt-1">
                      {patientName} - {patientAge} ans - {afficherSexe(patientSexe)}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">N° Facture</h3>
                    <p className="mt-1">{bilanDetails.num_facture}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Catégorie</h3>
                    <p className="mt-1">{bilanDetails.categorie.designation}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Prescripteur</h3>
                    <p className="mt-1">{bilanDetails.prescripteur.designation}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Code Labo</h3>
                    <p className="mt-1">{bilanDetails.code_labo || 'N/A'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Nature échantillon</h3>
                    <p className="mt-1">{bilanDetails.type_echantillon.designation || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Examens</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Examen
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Résultat
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Valeurs de référence
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bilanDetails.examens.map((exam) => (
                        <tr key={exam.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {exam.designation_examen}
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="number"
                              step="0.01"
                              value={editedResults[exam.id] || ''}
                              onChange={(e) => handleResultChange(exam.id, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#464E77] focus:border-[#464E77]"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {exam.valeur_reference || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleSaveResult(exam)}
                              disabled={savingExamId === exam.id}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-[#464E77] hover:bg-[#363c5d] disabled:opacity-50"
                            >
                              <Save className="w-4 h-4 mr-2" />
                              {savingExamId === exam.id ? 'Enregistrement...' : 'Enregistrer'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Commentaires</h3>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#464E77] focus:border-[#464E77]"
                  placeholder="Ajouter un commentaire..."
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-600">Aucune donnée trouvée</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BilanDetailsModal;