import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { searchPatients, Patient } from '../services/api.tsx';
import debounce from 'lodash/debounce';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearch = useCallback(
    debounce(async (term: string) => {
      if (!term) {
        setPatients([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const results = await searchPatients(term);
        setPatients(results);
      } catch (err) {        
        setError('Une erreur est survenue lors de la recherche');
        setPatients([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handlePatientClick = (codePatient: string) => {
    localStorage.setItem('selectedPatientCode', codePatient);
    navigate('/profile');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">ACCUEIL</h1>
      
      <div className="relative">
        <input
          type="text"
          placeholder="rechercher un profil (nom, code, téléphone)"
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#464E77] focus:border-[#464E77] outline-none transition pl-12"
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="text-center text-gray-500">
          Recherche en cours...
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Noms
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sexe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Age
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Telephone
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {patients.map((patient) => (
                <tr
                  key={patient.id}
                  onClick={() => handlePatientClick(patient.code)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    {patient.nom}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {patient.code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {patient.sexe === 'H' ? 'Homme' : 'Femme'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {patient.age ? patient.age + 'ans' : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {patient.telephone || 'N/A'}
                  </td>
                </tr>
              ))}
              {patients.length === 0 && !isLoading && searchTerm && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    Aucun résultat trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HomePage;