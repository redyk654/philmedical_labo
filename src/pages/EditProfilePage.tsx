import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, AlertCircle } from 'lucide-react';
import { getPatientByCode, updatePatient, Patient } from '../services/api.tsx';

const EditProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState<Partial<Patient>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatientData = async () => {
      const patientCode = localStorage.getItem('selectedPatientCode');
      
      if (!patientCode) {
        navigate('/');
        return;
      }

      try {
        const patientData = await getPatientByCode(patientCode);
        setPatient(patientData);
        setFormData(patientData);
        setError(null);
      } catch (err) {
        setError('Erreur lors du chargement des données du patient');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatientData();
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!patient || !formData) return;
    
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      await updatePatient(patient.code, formData);
      setSuccessMessage('Profil mis à jour avec succès');
      
      // Update local patient data
      setPatient({
        ...patient,
        ...formData
      });
      
      // Wait 2 seconds before redirecting
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de la mise à jour');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/profile');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-600">Chargement...</div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        Patient non trouvé
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">MODIFIER LE PROFIL</h1>
        <button
          onClick={handleCancel}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Retour
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center text-red-700">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
          {successMessage}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
                Nom
              </label>
              <input
                type="text"
                id="nom"
                name="nom"
                value={formData.nom || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#464E77] focus:border-[#464E77]"
                required
              />
            </div>
            
            <div>
              <label htmlFor="sexe" className="block text-sm font-medium text-gray-700 mb-1">
                Sexe
              </label>
              <select
                id="sexe"
                name="sexe"
                value={formData.sexe || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#464E77] focus:border-[#464E77]"
                required
              >
                <option value="">Sélectionner...</option>
                <option value="H">Homme</option>
                <option value="F">Femme</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                Âge
              </label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age || ''}
                onChange={handleInputChange}
                className="w-3/4 px-4 py-2 border border-gray-300 rounded-md focus:ring-[#464E77] focus:border-[#464E77]"
                required
              />
              <select
                value={formData.age_unit}
                onChange={handleInputChange}
                name="age_unit"
                className="w-1/4 px-4 py-2 border border-gray-300 rounded-md focus:ring-[#464E77] focus:border-[#464E77]"
                required
              >
                <option value="">Sélectionner...</option>
                <option value="ans">ans</option>
                <option value="mois">mois</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="date_naissance" className="block text-sm font-medium text-gray-700 mb-1">
                Date de naissance
              </label>
              <input
                type="date"
                id="date_naissance"
                name="date_naissance"
                value={formData.date_naissance || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#464E77] focus:border-[#464E77]"
              />
            </div>
            
            <div>
              <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone
              </label>
              <input
                type="tel"
                id="telephone"
                name="telephone"
                value={formData.telephone || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#464E77] focus:border-[#464E77]"
              />
            </div>
            
            <div>
              <label htmlFor="quartier" className="block text-sm font-medium text-gray-700 mb-1">
                Quartier
              </label>
              <input
                type="text"
                id="quartier"
                name="quartier"
                value={formData.quartier || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#464E77] focus:border-[#464E77]"
              />
            </div>
            
            <div>
              <label htmlFor="profession" className="block text-sm font-medium text-gray-700 mb-1">
                Profession
              </label>
              <input
                type="text"
                id="profession"
                name="profession"
                value={formData.profession || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#464E77] focus:border-[#464E77]"
              />
            </div>
            
            <div>
              <label htmlFor="situation_matrimoniale" className="block text-sm font-medium text-gray-700 mb-1">
                Situation matrimoniale
              </label>
              <select
                id="situation_matrimoniale"
                name="situation_matrimoniale"
                value={formData.situation_matrimoniale || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#464E77] focus:border-[#464E77]"
              >
                <option value="">Sélectionner...</option>
                <option value="Célibataire">Célibataire</option>
                <option value="Marié(e)">Marié(e)</option>
                <option value="Divorcé(e)">Divorcé(e)</option>
                <option value="Veuf(ve)">Veuf(ve)</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                Code patient
              </label>
              <input
                type="text"
                id="code"
                name="code"
                value={formData.code || ''}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
              />
              <p className="mt-1 text-sm text-gray-500">Le code patient ne peut pas être modifié</p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 bg-[#464E77] text-white rounded-md hover:bg-[#363c5d] disabled:opacity-50 flex items-center"
            >
              {isSaving ? (
                <>
                  <span className="mr-2">Enregistrement...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Enregistrer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfilePage;