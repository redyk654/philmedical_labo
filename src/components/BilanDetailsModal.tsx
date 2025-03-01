import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Printer } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useReactToPrint } from 'react-to-print';
import { getBilanDetails, updateExaminationResult, BilanDetails, BilanDetail } from '../services/api.tsx';
import { afficherSexe, convertDateShort, extraireCode, formatDate } from '../services/function.tsx';
import EnteteHopital from './EnteteHdj.tsx';

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
  
  const printRef = useRef<HTMLDivElement>(null);

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

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Bilan-${numFacture}`,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl mx-4 max-h-[90vh] flex flex-col">
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">DÉTAILS DU BILAN</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePrint()}
                className="text-[#464E77] hover:text-[#363c5d] transition-colors flex items-center"
              >
                <Printer className="w-6 h-6 mr-1" />
                Imprimer
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
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
            <>
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
                              {extraireCode(exam.designation_examen)}
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

              {/* Printable content - hidden in normal view */}
              <div className="hidden">
                <div ref={printRef} className="p-8 bg-white">
                  {/* Lab header */}
                  <div className="border-b-2 border-gray-800 pb-4 mb-2">
                    {/* <div className="flex justify-between items-center">
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900">LABORATOIRE PHILMEDICAL</h1>
                        <p className="text-gray-600">Rue des Cliniques, Quartier Médical</p>
                        <p className="text-gray-600">Téléphone: +243 999 888 777</p>
                        <p className="text-gray-600">Email: contact@philmedical.com</p>
                      </div>
                      <div className="text-right">
                        <h2 className="text-xl font-bold text-gray-900">RÉSULTATS D'ANALYSES</h2>
                        <p className="text-gray-600">Date: {formatDate(new Date())}</p>
                        <p className="text-gray-600">N° Facture: {bilanDetails.num_facture}</p>
                        <p className="text-gray-600">Code Labo: {bilanDetails.code_labo || 'N/A'}</p>
                      </div>
                    </div> */}
                    <EnteteHopital />
                  </div>

                  <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">RÉSULTATS D'ANALYSES</h2>
                  {/* Patient information */}
                  <div className="mb-6 grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-bold text-gray-800 mb-2">INFORMATIONS PATIENT</h3>
                      <p><span className="font-semibold">Nom:</span> {patientName}</p>
                      <p><span className="font-semibold">Âge:</span> {patientAge} ans</p>
                      <p><span className="font-semibold">Sexe:</span> {afficherSexe(patientSexe)}</p>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 mb-2">PRESCRIPTEUR</h3>
                      <p>{bilanDetails.prescripteur.designation}</p>
                      <p><span className="font-semibold">N° Facture:</span> {bilanDetails.num_facture}</p>
                      {/* <p><span className="font-semibold">Catégorie:</span> {bilanDetails.categorie.designation}</p>
                      <p><span className="font-semibold">Nature échantillon:</span> {bilanDetails.type_echantillon.designation || 'N/A'}</p> */}
                    </div>
                  </div>
                  <div className='mb-3'>
                    <h2 className='font-bold text-gray-800 text-center capitalize'>{bilanDetails.categorie.designation.toUpperCase()}</h2>
                    <p><span className="font-semibold">Nature échantillon:</span> {bilanDetails.type_echantillon.designation || 'N/A'}</p>
                  </div>
                  {/* Examination results */}
                  <div className="mb-6">
                    <h3 className="font-bold text-gray-800 mb-2">RÉSULTATS</h3>
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 px-4 py-2 text-left">Examen</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Résultat</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Valeurs de référence</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bilanDetails.examens.map((exam) => (
                          <tr key={exam.id}>
                            <td className="border border-gray-300 px-4 py-2">{extraireCode(exam.designation_examen)}</td>
                            <td className="border border-gray-300 px-4 py-2">{editedResults[exam.id] || ''}</td>
                            <td className="border border-gray-300 px-4 py-2">{exam.valeur_reference || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Comments */}
                  {comment && (
                    <div className="mb-6">
                      <h3 className="font-bold text-gray-800 mb-2">COMMENTAIRES</h3>
                      <div className="border border-gray-300 rounded p-3 bg-gray-50">
                        {comment}
                      </div>
                    </div>
                  )}

                  {/* Footer with signature and QR code */}
                  <div className="mt-8 flex justify-between items-end">
                    <div>
                      <p className="font-semibold mb-1">Date: {formatDate(new Date())}</p>
                      <div className="mt-8 border-t border-gray-400 pt-1 w-48">
                        <p className="text-center text-sm text-gray-600">Signature du responsable</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <QRCodeSVG value={bilanDetails.num_facture} size={80} />
                      <p className="text-xs text-gray-500 mt-1">Scan pour vérification</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
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