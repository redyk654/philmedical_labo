import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { authenticatedFetch } from '../services/auth.tsx';
import { extraireCode } from '../services/function.tsx';
import { CategorieExamen, checkBilanExists, checkInvoice, createBilan, getExaminationCategories, getPrescribers, getSampleTypes, getSpecificConditions, Prescripteur, SpecificCondition } from '../services/api.tsx';

interface NewBilanModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  patientCode: string;
  patientSexe: string;
  patientAge: number;
}

interface Invoice {
  id: string;
  id_fac: string;
}

interface Examination {
  id: string;
  designation: string;
  type_echantillon: string;
}

interface SampleType {
  id: string;
  designation: string;
}

interface Service {
  id: string;
  designation: string;
}

const NewBilanModal: React.FC<NewBilanModalProps> = ({ isOpen, onClose, patientName, patientCode, patientAge, patientSexe }) => {
  const [numFacture, setNumFacture] = useState('');
  const [numBilan, setNumBilan] = useState('');
  const [prescripteur, setPrescripteur] = useState('');
  const [specificCondition, setSpecificCondition] = useState('');
  const [categorie, setCategorie] = useState('');
  const [typeEchantillon, setTypeEchantillon] = useState('');
  const [examRows, setExamRows] = useState<Examination[]>([]);
  const [invoiceSuggestions, setInvoiceSuggestions] = useState<Invoice[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // New state for editing and suggestions
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editingField, setEditingField] = useState<'type' | 'exam' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sampleTypeSuggestions, setSampleTypeSuggestions] = useState<SampleType[]>([]);
  const [serviceSuggestions, setServiceSuggestions] = useState<Service[]>([]);

  const [prescripteurs, setPrescripteurs] = useState<Prescripteur[]>([]);
  const [specificConditions, setSpecificConditions] = useState<SpecificCondition[]>([]);
  const [categories, setCategories] = useState<CategorieExamen[]>([]);
  const [typeEchantillons, setTypeEchantillons] = useState<SampleType[]>([]);

  useEffect(() => {
    const fetchMetaData = async () => {
      const data = await getPrescribers();
      setPrescripteurs(data);
      const data2 = await getSpecificConditions();
      setSpecificConditions(data2);
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

  useEffect(() => {
    if (editingField === 'type' && searchTerm.length >= 2) {
      searchSampleTypes(searchTerm);
    } else if (editingField === 'exam' && searchTerm.length >= 2) {
      searchServices(searchTerm);
    }
  }, [searchTerm, editingField]);

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

  const searchSampleTypes = async (search: string) => {
    try {
      const response = await authenticatedFetch(`/types_echantillon.php?q=${search}`);
      if (!response.ok) throw new Error('Erreur lors de la recherche des types d\'échantillon');
      const data = await response.json();
      setSampleTypeSuggestions(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  const searchServices = async (search: string) => {
    try {
      const response = await authenticatedFetch(`/examinations.php?q=${search}`);
      if (!response.ok) throw new Error('Erreur lors de la recherche des examens');
      const data = await response.json();
      setServiceSuggestions(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  const fetchInvoiceExaminations = async (invoiceId: string) => {
    try {
      const response = await authenticatedFetch(`/get_invoice_examinations.php?id=${invoiceId}`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des examens');
      const data = await response.json();
      setExamRows(data);
      setInvoiceSuggestions([]); // Clear suggestions after selection
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  const handleInvoiceSelect = (invoice: Invoice) => {
    setNumFacture(invoice.id);
    fetchInvoiceExaminations(invoice.id);
  };

  const addNewRow = () => {
    setExamRows([...examRows, { id: '', designation: '', type_echantillon: '' }]);
  };

  const removeRow = (index: number) => {
    const newRows = [...examRows];
    newRows.splice(index, 1);
    setExamRows(newRows);
  };

  const startEditing = (index: number, field: 'type' | 'exam') => {
    setEditingRow(index);
    setEditingField(field);
    setSearchTerm('');
    setSampleTypeSuggestions([]);
    setServiceSuggestions([]);
  };

  const handleSampleTypeSelect = (sampleType: SampleType) => {
    if (editingRow !== null) {
      const newRows = [...examRows];
      newRows[editingRow] = {
        ...newRows[editingRow],
        type_echantillon: sampleType.designation
      };
      setExamRows(newRows);
      setEditingRow(null);
      setEditingField(null);
      setSearchTerm('');
      setSampleTypeSuggestions([]);
    }
  };

  const handleServiceSelect = (service: Service) => {
    if (editingRow !== null) {
      const newRows = [...examRows];
      newRows[editingRow] = {
        ...newRows[editingRow],
        designation: service.designation
      };
      setExamRows(newRows);
      setEditingRow(null);
      setEditingField(null);
      setSearchTerm('');
      setServiceSuggestions([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // Check if invoice exists
      const invoiceExists = await checkInvoice(numFacture);
      
      if (!invoiceExists) {
        setError("Numéro de facture invalide");
        return;
      }

      // Check if bilan already exists
      const bilanExists = await checkBilanExists(numFacture);
      if (bilanExists) {
        setError("Un bilan existe déjà pour cette facture");
        return;
      }

      // Validate required fields
      if (!numFacture || !prescripteur || examRows.length === 0) {
        setError("Veuillez remplir tous les champs obligatoires");
        return;
      }

      // Create bilan
      const data = {
        num_facture: numFacture,
        code_labo: !numBilan ? null : numBilan,
        code_patient: patientCode,
        prescripteur_id: prescripteur,
        specific_condition_id: !specificCondition ? null : specificCondition,
        categorie_id: categorie,
        type_echantillon_id: typeEchantillon,
        examens: examRows
      };
      console.log(data);
      
      const bilan = await createBilan(data);
      console.log(bilan);

      // Close modal and reset form
      onClose();
      setNumFacture('');
      setNumBilan('');
      setPrescripteur('');
      setExamRows([]);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  const cancelBilan = () => {
    setNumFacture('');
    setNumBilan('');
    setPrescripteur('');
    setExamRows([]);
    setError(null);
    onClose();
  };

  const renderSuggestions = () => {
    if (editingField === 'type' && sampleTypeSuggestions.length > 0) {
      return (
        <div className="absolute top-full left-0 right-0 z-[1000] bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {sampleTypeSuggestions.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => handleSampleTypeSelect(type)}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:outline-none"
            >
              {extraireCode(type.designation)}
            </button>
          ))}
        </div>
      );
    }

    if (editingField === 'exam' && serviceSuggestions.length > 0) {
      return (
        <div className="absolute top-full left-0 right-0 z-[1000] bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {serviceSuggestions.map((service) => (
            <button
              key={service.id}
              type="button"
              onClick={() => handleServiceSelect(service)}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:outline-none"
            >
              {extraireCode(service.designation)}
            </button>
          ))}
        </div>
      );
    }

    return null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">NOUVEAU BILAN</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X className="w-7 h-7" />
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          )}

          <p className="text-lg text-gray-700">
            Patient: {patientName} - {patientAge} ans - {patientSexe === 'H' ? 'Homme' : 'Femme'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <label htmlFor="numFacture" className="block text-sm font-medium text-gray-700">
                  N° Facture <span className=' text-red-500'>*</span>
                </label>
                <input
                  type="text"
                  id="numFacture"
                  value={numFacture}
                  onChange={(e) => setNumFacture(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition"
                  required
                  autoComplete='off'
                />
                {invoiceSuggestions.length > 0 && (
                  <div className="absolute z-[1000] w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {invoiceSuggestions.map((invoice) => (
                      <button
                        key={invoice.id_fac}
                        type="button"
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
              <label htmlFor="Categorie" className="block text-sm font-medium text-gray-700">
                Selectionner Categorie<span className=' text-red-500'>*</span>
              </label>
              <select
                id="Categorie"
                value={categorie}
                onChange={(e) => setCategorie(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#464E77] focus:ring-[#464E77] sm:text-sm h-12"
                required
              >
                <option value="">Sélectionner...</option>
                {categories.map((categorie) => (
                  <option key={categorie.id} value={categorie.id}>
                    {categorie.designation}
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
                    {echantillon.designation}
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
              >
                <option value="">Sélectionner...</option>
                {prescripteurs.map((prescripteur) => (
                  <option key={prescripteur.id} value={prescripteur.id}>
                    {prescripteur.designation}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="SpecifiCondition" className="block text-sm font-medium text-gray-700">
                Selectionner Condition Spécifique
              </label>
              <select
                id="SpecifiCondition"
                value={specificCondition}
                onChange={(e) => setSpecificCondition(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#464E77] focus:ring-[#464E77] sm:text-sm h-12"
              >
                <option value="">Sélectionner...</option>
                {specificConditions.map((condition) => (
                  <option key={condition.id} value={condition.id}>
                    {condition.designation}
                  </option>
                ))}
              </select>
            </div>

            <div className="border rounded-lg overflow-hidden mb-24"> {/* Added mb-24 for extra bottom margin */}
              <div className="flex justify-between items-center p-4 bg-gray-50 border-b">
                <h3 className="font-medium text-gray-700">Liste des examens</h3>
                <button
                  type="button"
                  onClick={addNewRow}
                  className="inline-flex items-center px-3 py-1 bg-[#464E77] text-white rounded-md hover:bg-[#363c5d] text-sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Examen
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {examRows.map((row, index) => (
                      <tr key={index} className="relative"> {/* Added relative positioning */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="relative">
                            {editingRow === index && editingField === 'exam' ? (
                              <div className="relative">
                                <input
                                  type="text"
                                  value={searchTerm}
                                  onChange={(e) => setSearchTerm(e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                                  placeholder="Rechercher..."
                                  autoFocus
                                />
                                <div className="absolute left-0 right-0 mt-1"> {/* Container for suggestions */}
                                  {renderSuggestions()}
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => startEditing(index, 'exam')}
                                className="w-full text-left hover:text-[#464E77]"
                              >
                                {row.designation || 'Cliquez pour éditer'}
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => removeRow(index)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-gray-500 text-sm">
                        <span className="text-gray-400">Astuce:</span> Cliquez sur un champ pour le modifier
                      </td>
                    </tr>
                    {examRows.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                          Aucun examen ajouté
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white pt-6 mt-auto">
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={cancelBilan}
                  className="flex-1 bg-red-500 text-white px-4 py-3 rounded-md hover:bg-red-600 transition-colors h-12"
                >
                  ANNULER
                </button>
                <button
                  type="submit"
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