import React, { useState } from 'react';
import { X } from 'lucide-react';

interface NewBilanModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
}

interface ExamRow {
  type: string;
  examen: string;
}

const NewBilanModal: React.FC<NewBilanModalProps> = ({ isOpen, onClose, patientName }) => {
  const [numFacture, setNumFacture] = useState('');
  const [numBilan, setNumBilan] = useState('');
  const [prescripteur, setPrescripteur] = useState('');
  const [examRows, setExamRows] = useState<ExamRow[]>([
    { type: 'Serum', examen: 'CRP' },
    { type: 'Sang total', examen: 'GLUCOSE' }
  ]);

  if (!isOpen) return null;

  const handleTypeChange = (index: number, value: string) => {
    const newRows = [...examRows];
    newRows[index].type = value;
    setExamRows(newRows);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement bilan creation logic
    console.log('Creating new bilan:', { numFacture, numBilan, prescripteur, examRows });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4">
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">NOUVEAU BILAN</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X className="w-7 h-7" />
            </button>
          </div>

          <p className="text-lg text-gray-700">{patientName}</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="numFacture" className="block text-sm font-medium text-gray-700">
                  N° Facture
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
              </div>

              <div>
                <label htmlFor="numBilan" className="block text-sm font-medium text-gray-700">
                  N° Bilan
                </label>
                <input
                  type="text"
                  id="numBilan"
                  value={numBilan}
                  onChange={(e) => setNumBilan(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition"
                  required
                  autoComplete='off'
                />
              </div>
            </div>

            <div>
              <label htmlFor="prescripteur" className="block text-sm font-medium text-gray-700">
                Selectionner Prescripteur
              </label>
              <select
                id="prescripteur"
                value={prescripteur}
                onChange={(e) => setPrescripteur(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#464E77] focus:ring-[#464E77] sm:text-sm h-12"
                required
              >
                <option value="">Sélectionner...</option>
                <option value="1">Dr. John Doe</option>
                <option value="2">Dr. Jane Smith</option>
              </select>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Examen
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {examRows.map((row, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          value={row.type}
                          onChange={(e) => handleTypeChange(index, e.target.value)}
                          className="w-full border-gray-300 rounded-md shadow-sm focus:border-[#464E77] focus:ring-[#464E77] sm:text-sm h-12"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {row.examen}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="flex-1 bg-[#464E77] text-white px-4 py-3 rounded-md hover:bg-[#363c5d] transition-colors h-12"
              >
                ENREGISTRER LE BILAN
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-red-500 text-white px-4 py-3 rounded-md hover:bg-red-600 transition-colors h-12"
              >
                ANNULER
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewBilanModal;