import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { authenticatedFetch } from '../services/auth.tsx';
import { CategorieExamen, checkBilanExists, checkInvoice, createBilan, ExamensLabo, getExamensLabo, getExaminationCategories, getPrescribers, getSampleTypes, Prescripteur } from '../services/api.tsx';

interface NewBilanModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  patientCode: string;
  patientSexe: string;
  patientAge: number;
  patientAgeUnit: string;
}

interface Invoice {
  id: string;
  id_fac: string;
}

interface SampleType {
  id: string;
  designation: string;
}

const NewBilanModal: React.FC<NewBilanModalProps> = ({ isOpen, onClose, patientName, patientCode, patientAge, patientAgeUnit, patientSexe }) => {
  const [numFacture, setNumFacture] = useState('');
  const [numBilan, setNumBilan] = useState('');
  const [prescripteur, setPrescripteur] = useState('');
  const [categorie, setCategorie] = useState('');
  const [typeEchantillon, setTypeEchantillon] = useState('');
  const [examens, setExamens] = useState<ExamensLabo[]>([]);
  const [examen, setExamen] = useState('')
  const [invoiceSuggestions, setInvoiceSuggestions] = useState<Invoice[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [prescripteurs, setPrescripteurs] = useState<Prescripteur[]>([]);
  const [categories, setCategories] = useState<CategorieExamen[]>([]);
  const [typeEchantillons, setTypeEchantillons] = useState<SampleType[]>([]);

  useEffect(() => {
    const fetchMetaData = async () => {
      const data = await getPrescribers();
      setPrescripteurs(data);
      const data2 = await getExamensLabo();
      setExamens(data2);
      const data3 = await getExaminationCategories();
      setCategories(data3);
      const data4 = await getSampleTypes();
      setTypeEchantillons(data4);
    };
    fetchMetaData();
  }, []);

  useEffect(() => {
    if (numFacture.length >= 2) {
      searchInvoices(numFacture);
    } else {
      setInvoiceSuggestions([]);
    }
  }, [numFacture]);

  const searchInvoices = async (search: string) => {
    try {
      const response = await authenticatedFetch(`/search_invoices.php?q=${search}`);
      if (!response.ok) throw new Error('Erreur lors de la recherche des factures');
      const data = await response.json();
      setInvoiceSuggestions(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  const handleInvoiceSelect = (invoice: Invoice) => {
    setNumFacture(invoice.id);
    setInvoiceSuggestions([]); // Clear suggestions after selection
    // fetchInvoiceExaminations(invoice.id);
  };

  const handleSelectExamen = (e) => {
    const examenSelected = e.target.value
    setExamen(examenSelected)
    setCategorie(examens.filter(exam => exam.designation === examenSelected)[0].categorie_id)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {

      // Validate required fields
      if (!numFacture || !prescripteur) {
        setError("Veuillez remplir tous les champs obligatoires");
        return;
      }

      // Check if invoice exists
      const invoiceExists = await checkInvoice(numFacture);
      
      if (!invoiceExists) {
        setError("Numéro de facture invalide");
        return;
      }

      // Check if bilan already exists
      const bilanExists = await checkBilanExists(numFacture, categorie);
      if (bilanExists) {
        setError("Un bilan existe déjà pour cette facture");
        return;
      }

      // Create bilan
      const data = {
        num_facture: numFacture,
        code_labo: !numBilan ? null : numBilan,
        code_patient: patientCode,
        prescripteur_id: prescripteur,
        categorie_id: categorie,
        type_echantillon_id: typeEchantillon,
        examen: examen,
        resultat: examens.filter(exam => exam.designation === examen)[0].contenu
      };
      // console.log(JSON.stringify(data));
      
      const bilan = await createBilan(data);
      console.log(bilan);

      // Close modal and reset form
      onClose();
      setNumFacture('');
      setNumBilan('');
      setPrescripteur('');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  const cancelBilan = () => {
    setNumFacture('');
    setNumBilan('');
    setPrescripteur('');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-testid="bilan-modal">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900" data-testid="modal-title">NOUVEAU BILAN</h2>
            <button
              data-testid="close-modal-button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X className="w-7 h-7" />
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700" data-testid="error-message">
              {error}
            </div>
          )}

          <p className="text-lg text-gray-700" data-testid="patient-info">
            Patient: {patientName} - {patientAge} {patientAgeUnit} - {patientSexe === 'H' ? 'Homme' : 'Femme'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6" data-testid="bilan-form">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <label htmlFor="numFacture" className="block text-sm font-medium text-gray-700">
                  N° Facture <span className='text-red-500'>*</span>
                </label>
                <input
                  data-testid="invoice-number-input"
                  type="text"
                  id="numFacture"
                  value={numFacture}
                  onChange={(e) => setNumFacture(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition"
                  required
                  autoComplete='off'
                />
                {invoiceSuggestions.length > 0 && (
                  <div data-testid="invoice-suggestions" className="absolute z-[1000] w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {invoiceSuggestions.map((invoice) => (
                      <button
                        key={invoice.id_fac}
                        type="button"
                        data-testid={`invoice-suggestion-${invoice.id}`}
                        onClick={() => handleInvoiceSelect(invoice)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:outline-none"
                      >
                        {invoice.id}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="numBilan" className="block text-sm font-medium text-gray-700">
                  Code Labo
                </label>
                <input
                  data-testid="lab-code-input"
                  type="text"
                  id="numBilan"
                  value={numBilan}
                  onChange={(e) => setNumBilan(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition"
                  autoComplete='off'
                />
              </div>
            </div>
            <div>
              <label htmlFor="examen" className="block text-sm font-medium text-gray-700">
                Selectionner Examens<span className='text-red-500'>*</span>
              </label>
              <select
                data-testid="exam-select"
                id="examen"
                value={examen}
                onChange={handleSelectExamen}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#464E77] focus:ring-[#464E77] sm:text-sm h-12"
                required
              >
                <option value="">Sélectionner...</option>
                {examens.map((exam) => (
                  <option key={exam.id} value={exam.designation}>
                    {exam.designation.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="Categorie" className="block text-sm font-medium text-gray-700">
                Selectionner Categorie<span className=' text-red-500'>*</span>
              </label>
              <select
                id="Categorie"
                value={categorie}
                onChange={(e) => setCategorie(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#464E77] focus:ring-[#464E77] sm:text-sm h-12"
                required
                data-testid="categorie-select"
              >
                <option value="">Sélectionner...</option>
                {categories.map((categorie) => (
                  <option key={categorie.id} value={categorie.id}>
                    {categorie.designation.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="echantillon" className="block text-sm font-medium text-gray-700">
                Selectionner Nature échantillon
              </label>
              <select
                id="echantillon"
                value={typeEchantillon}
                onChange={(e) => setTypeEchantillon(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#464E77] focus:ring-[#464E77] sm:text-sm h-12"
              >
                <option value="">Sélectionner...</option>
                {typeEchantillons.map((echantillon) => (
                  <option key={echantillon.id} value={echantillon.id}>
                    {echantillon.designation.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="prescripteur" className="block text-sm font-medium text-gray-700">
                Selectionner Prescripteur <span className=' text-red-500'>*</span>
              </label>
              <select
                id="prescripteur"
                value={prescripteur}
                onChange={(e) => setPrescripteur(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#464E77] focus:ring-[#464E77] sm:text-sm h-12"
                required
                data-testid="prescripteur-select"
              >
                <option value="">Sélectionner...</option>
                {prescripteurs.map((prescripteur) => (
                  <option key={prescripteur.id} value={prescripteur.id}>
                    {prescripteur.designation.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="sticky bottom-0 bg-white pt-6 mt-auto">
              <div className="flex space-x-4">
                <button
                  type="button"
                  data-testid="cancel-button"
                  onClick={cancelBilan}
                  className="flex-1 bg-red-500 text-white px-4 py-3 rounded-md hover:bg-red-600 transition-colors h-12"
                >
                  ANNULER
                </button>
                <button
                  type="submit"
                  data-testid="submit-button"
                  className="flex-1 bg-[#464E77] text-white px-4 py-3 rounded-md hover:bg-[#363c5d] transition-colors h-12"
                >
                  ENREGISTRER LE BILAN
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewBilanModal;