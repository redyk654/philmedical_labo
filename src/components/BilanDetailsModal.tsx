import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Printer } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useReactToPrint } from 'react-to-print';
import { getBilanDetails, updateExaminationResult, BilanDetails } from '../services/api.tsx';
import { afficherAge, afficherSexe, formatDate } from '../services/function.tsx';
import EnteteHopital from './EnteteHdj.tsx';

interface BilanDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bilanId: number;
  patientName: string;
  patientAge: number;
  patientAgeUnit: string;
  patientSexe: string;
}

const BilanDetailsModal: React.FC<BilanDetailsModalProps> = ({
  isOpen,
  onClose,
  bilanId,
  patientName,
  patientAge,
  patientAgeUnit,
  patientSexe
}) => {
  const [bilanDetails, setBilanDetails] = useState<BilanDetails | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resultFetched, setResultFetched] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && bilanId) {
      fetchBilanDetails();
    }
  }, [isOpen, bilanId]);

  const fetchBilanDetails = async () => {
    try {
      setIsLoading(true);
      const details = await getBilanDetails(bilanId);
      setBilanDetails(details);
      setResultFetched(details?.resultat)
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveResult = async () => {
    try {
      if (bilanDetails) {
        await updateExaminationResult(bilanDetails.id, bilanDetails.resultat);
        setSuccessMessage('Modifications enregistrées avec succès');
        setTimeout(() => {
          setSuccessMessage('')
        }, 2000);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Bilan-${bilanId}-${bilanDetails?.categorie_designation}`,
    onAfterPrint: () => {
      handleSaveResult();
      onClose();
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl mx-4 max-h-[100vh] h-[94vh] flex flex-col">
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
            {successMessage}
          </div>
        )}
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{bilanDetails?.examen}</h2>
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
                        {patientName} - {afficherAge(patientAge, patientAgeUnit)} - {afficherSexe(patientSexe)}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Catégorie</h3>
                      <p className="mt-1">{bilanDetails.categorie_designation}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Prescripteur</h3>
                      <p className="mt-1">{bilanDetails.prescripteur_designation}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Nature échantillon</h3>
                      <p className="mt-1">{bilanDetails.type_echantillon_designation || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Résultat</h3>
                  <textarea
                    value={bilanDetails.resultat}
                    onChange={(e) => {
                      setBilanDetails(prev => prev ? {
                        ...prev,
                        resultat: e.target.value
                      } : null);
                    }}
                    rows={23}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#464E77] focus:border-[#464E77]"
                    placeholder="Ajouter un commentaire..."
                  />
                </div>
                <div>
                  <button
                    disabled={bilanDetails.resultat === resultFetched}
                    onClick={handleSaveResult}
                    className="inline-flex items-center px-4 py-2 bg-[#464E77] 
                    text-white rounded-md hover:bg-[#363c5d] transition-colors disabled:hover:bg-[#cad1f7] disabled:bg-[#cad1f7] disabled:cursor-not-allowed "
                  >
                    <Save />
                    Enregistrer les modifications
                  </button>
                </div>
              </div>

              {/* Printable content - hidden in normal view */}
              <div className="hidden">
                <div ref={printRef} className="p-6 bg-white">
                  {/* Lab header */}
                  <div className="border-b-2 border-gray-800 pb-4 mb-2">
                    <EnteteHopital />
                  </div>

                  <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">RÉSULTATS D'ANALYSES</h2>
                  {/* Patient information */}
                  <div className="mb-3 grid grid-cols-3 gap-4">
                    <div>
                      <h3 className="font-bold text-gray-800 mb-1">INFORMATIONS PATIENT</h3>
                      <p><span className="font-semibold">Nom:</span> {patientName}</p>
                      <p><span className="font-semibold">Âge:</span> {afficherAge(patientAge, patientAgeUnit)}</p>
                      <p><span className="font-semibold">Sexe:</span> {afficherSexe(patientSexe)}</p>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 mb-1">PRESCRIPTEUR</h3>
                      <p>{bilanDetails.prescripteur_designation}</p>
                      <p><span className="font-semibold">N° Facture:</span> {bilanDetails.num_facture}</p>
                    </div>
                    <div className="">
                      <QRCodeSVG value={`${bilanDetails.num_facture}-${bilanDetails.id}`} size={70} />
                      <p className="text-xs text-gray-500 mt-1">Scan pour vérification</p>
                    </div>
                  </div>
                  <div className='mb-3'>
                    <h2 className='font-bold text-gray-800 text-center capitalize'>{bilanDetails.categorie_designation.toUpperCase()}</h2>
                    <p><span className="font-semibold">{bilanDetails.examen || 'N/A'}</span></p>
                    <p><span className="font-semibold">Nature échantillon:</span> {bilanDetails.type_echantillon_designation || 'N/A'}</p>
                  </div>
                  {/* Examination results */}
                  <div className="mb-3">
                    <textarea
                      value={bilanDetails.resultat}
                      rows={23}
                      className="w-full px-2 py-1 border border-gray-300 h-auto text-[16px]"
                      // placeholder="Ajouter un commentaire..."
                    />
                  </div>

                  {/* Footer with signature */}
                  <div className="mt-3 flex justify-between items-end">
                    <div>
                      <p className="font-semibold mb-1">Date: {formatDate(new Date())}</p>
                      <div className="mt-3 border-t border-gray-400 pt-1 w-48">
                        <p className="text-center text-sm text-gray-600">Signature du responsable</p>
                      </div>
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