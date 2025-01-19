import { authenticatedFetch } from './auth.tsx';

export interface Patient {
  id: number;
  code: string;
  nom: string;
  sexe: string;
  age: number;
  date_naissance: string;
  telephone: string;
}

export interface Bilan {
  id: number;
  numero: string;
  date_enregistrement: string;
  status: 'Complété' | 'Incomplet';
}

export const searchPatients = async (searchTerm: string): Promise<Patient[]> => {
  try {
    const response = await authenticatedFetch(`search_patients.php?q=${encodeURIComponent(searchTerm)}`);
    if (!response.ok) {
      throw new Error('Echec de la recherche des patients');
    }
    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Une erreur inattendue est survenue');
  }
};

export const getPatientBilans = async (patientId: number): Promise<Bilan[]> => {
  try {
    const response = await authenticatedFetch(`get_patient_bilans.php?patient_id=${patientId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch patient bilans');
    }
    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
};