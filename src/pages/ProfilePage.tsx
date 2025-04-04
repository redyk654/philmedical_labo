import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPatientByCode, getPatientBilansByCode, Patient, Bilan, getExaminationCategories, CategorieExamen } from '../services/api.tsx';
import NewBilanModal from '../components/NewBilanModal.tsx';
import BilanDetailsModal from '../components/BilanDetailsModal.tsx';
import { afficherAge, afficherSexe, convertDateLong, convertDateShort } from '../services/function.tsx';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [bilans, setBilans] = useState<Bilan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNewBilanModalOpen, setIsNewBilanModalOpen] = useState(false);
  const [selectedBilan, setSelectedBilan] = useState<number | null>(null);
  const [categories, setCategories] = useState<CategorieExamen[]>([]);


  const fetchPatientData = async () => {
    const patientCode = localStorage.getItem('selectedPatientCode');
    
    if (!patientCode) {
      navigate('/');
      return;
    }

    try {
      const patientData = await getPatientByCode(patientCode);
      setPatient(patientData);
      
      const bilansData = await getPatientBilansByCode(patientCode);
      setBilans(bilansData);

      const data3 = await getExaminationCategories();
      setCategories(data3);
    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement des données du patient');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientData();
  }, []);

  const closeNewBilanModal = () => {
    setIsNewBilanModalOpen(false);
    fetchPatientData();
  }

  const closeDetailsModal = () => {
    setSelectedBilan(null)
    fetchPatientData();
  }

  const handleEditProfile = () => {
    navigate('/edit-profile');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-600">Chargement...</div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error || 'Patient non trouvé'}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">PROFIL PATIENT</h1>
        <div className="space-x-4">
          <button
            onClick={() => setIsNewBilanModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-[#464E77] text-white rounded-md hover:bg-[#363c5d] transition-colors"
          >
            Nouveau Bilan
          </button>
          <button
            onClick={() => setSelectedBilan(bilans[0].id)}
            className="inline-flex items-center px-4 py-2 border border-[#464E77] text-[#464E77] rounded-md hover:bg-gray-50 transition-colors"
          >
            Afficher Le Dernier Bilan
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Informations Personnelles</h2>
          <button
            onClick={handleEditProfile}
            className="text-[#464E77] hover:text-[#363c5d] transition-colors"
          >
            Editer Le Profil
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Nom</label>
              <div className="mt-1 text-gray-900">{patient.nom}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Sexe</label>
              <div className="mt-1 text-gray-900">{afficherSexe(patient.sexe)}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Age</label>
              <div className="mt-1 text-gray-900">{afficherAge(patient.age || 0, patient.age_unit || '')}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Date Naissance</label>
              <div className="mt-1 text-gray-900">{convertDateLong(patient.date_naissance) || '-'}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Adresse</label>
              <div className="mt-1 text-gray-900">{patient.quartier || '-'}</div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Code Patient</label>
              <div className="mt-1 text-gray-900">{patient.code}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Telephone</label>
              <div className="mt-1 text-gray-900">{patient.telephone}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Profession</label>
              <div className="mt-1 text-gray-900">{patient.profession || '-'}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Situation Matrimoniale</label>
              <div className="mt-1 text-gray-900">{patient.situation_matrimoniale || '-'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Historique Des Bilans</h2>
        <div className="overflow-x-auto overflow-y-auto max-h-[50vh]">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Num Bilan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date D'enregistrement
                </th>
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th> */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Détails
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bilans.map((bilan) => (
                <tr 
                  key={bilan.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedBilan(bilan.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    {bilan.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {categories.filter(categorie => categorie.id.toString() === bilan.categorie_id.toString())[0]?.designation}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {convertDateShort(bilan.save_at)}
                  </td>
                  {/* <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      bilan.statut === 'Complété'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {bilan.statut}
                    </span>
                  </td> */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      className="text-[#464E77] hover:text-[#363c5d] transition-colors"
                    >
                      Afficher Les Détails
                    </button>
                  </td>
                </tr>
              ))}
              {bilans.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    Aucun bilan trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <NewBilanModal
        isOpen={isNewBilanModalOpen}
        onClose={closeNewBilanModal}
        patientName={patient.nom}
        patientCode={patient.code}
        patientSexe={patient.sexe}
        patientAgeUnit={patient.age_unit}
        patientAge={patient.age}
      />

      {selectedBilan && (
        <BilanDetailsModal
          isOpen={true}
          onClose={closeDetailsModal}
          bilanId={selectedBilan}
          patientName={patient.nom}
          patientAge={patient.age}
          patientAgeUnit={patient.age_unit}
          patientSexe={patient.sexe}
        />
      )}
    </div>
  );
};

export default ProfilePage;