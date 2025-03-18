import React, { useRef, useState } from 'react';
import { AlertCircle, Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { getListingBilans, ListingItem } from '../services/api.tsx';
import { convertDateShort, formatDate } from '../services/function.tsx';
import EnteteHopital from '../components/EnteteHdj.tsx';

interface PrintableContentProps {
    startDate: string;
    endDate: string;
    listings: ListingItem[];
    getTotalExams: () => number;
  }
  
  const PrintableContent: React.FC<PrintableContentProps> = ({
    startDate,
    endDate,
    listings,
    getTotalExams
  }) => (
    <div className="p-8">
      <EnteteHopital />
      
      <div className="mt-8 mb-6 text-center">
        <h1 className="text-2xl font-bold mb-2">LISTING DES EXAMENS</h1>
        <p className="text-gray-600">
          Période du {formatDate(new Date(startDate))} au {formatDate(new Date(endDate))}
        </p>
      </div>
  
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2 text-left">Examen</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Nombre Total</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Premier Examen</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Dernier Examen</th>
          </tr>
        </thead>
        <tbody>
          {listings.map((item, index) => (
            <tr key={index}>
              <td className="border border-gray-300 px-4 py-2">{item.exam}</td>
              <td className="border border-gray-300 px-4 py-2">{item.total_exams}</td>
              <td className="border border-gray-300 px-4 py-2">{convertDateShort(item.first_exam_date)}</td>
              <td className="border border-gray-300 px-4 py-2">{convertDateShort(item.last_exam_date)}</td>
            </tr>
          ))}
          <tr className="bg-gray-100 font-bold">
            <td className="border border-gray-300 px-4 py-2">TOTAL</td>
            <td className="border border-gray-300 px-4 py-2">{getTotalExams()}</td>
            <td className="border border-gray-300 px-4 py-2" colSpan={2}></td>
          </tr>
        </tbody>
      </table>
  
      <div className="mt-8 text-right text-sm text-gray-600">
        Imprimé le {formatDate(new Date())}
      </div>
    </div>
  );
  

const ListingPage: React.FC = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Listing_${startDate}_${endDate}`,
  });


  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startDate || !endDate) {
      setError('Veuillez sélectionner les dates de début et de fin');
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setError('La date de fin doit être supérieure à la date de début');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getListingBilans(startDate, endDate);
      setListings(data);
    } catch (err) {
      setError('Erreur lors de la récupération des données');
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalExams = () => {
    return listings.reduce((total, item) => total + item.total_exams, 0);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">LISTING DES EXAMENS</h1>

      {listings.length > 0 && (
        <button
          onClick={() => handlePrint()}
          className="inline-flex items-center px-4 py-2 bg-[#464E77] text-white rounded-md hover:bg-[#363c5d]"
        >
          <Printer className="w-5 h-5 mr-2" />
          Imprimer
        </button>
      )}
      {/* Search form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Date de début
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#464E77] focus:border-[#464E77]"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                Date de fin
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#464E77] focus:border-[#464E77]"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-[#464E77] text-white rounded-md hover:bg-[#363c5d] disabled:opacity-50"
            >
              {isLoading ? 'Chargement...' : 'Rechercher'}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center text-red-700">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {listings.length > 0 && (
          <div className="mt-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Examen
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Premier Examen
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dernier Examen
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {listings.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.exam}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.total_exams}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {convertDateShort(item.first_exam_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {convertDateShort(item.last_exam_date)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 font-semibold">
                    <td className="px-6 py-4 whitespace-nowrap">
                      TOTAL
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getTotalExams()}
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
        </div>


        {/* Hidden printable content */}
        <div className="hidden">
            <div ref={printRef}>
            <PrintableContent
                startDate={startDate}
                endDate={endDate}
                listings={listings}
                getTotalExams={getTotalExams}
            />
            </div>
        </div>
    </div>
  );
};

export default ListingPage;