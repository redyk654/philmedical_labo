import { authenticatedFetch } from './auth.tsx';

export interface Patient {
  id: number;
  code: string;
  nom: string;
  sexe: string;
  age: number;
  date_naissance: string;
  telephone: string;
  quartier?: string;
  profession?: string;
  situation_matrimoniale?: string;
}

export interface Bilan {
  id: number;
  prescripteur_id: number;
  num_facture: string;
  code_labo: string;
  service_id: number;
  save_at: string;
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

export const getPatientByCode = async (code: string): Promise<Patient> => {
  try {
    const response = await authenticatedFetch(`/get_patient.php?code=${encodeURIComponent(code)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch patient details');
    }
    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
};

export const getPatientBilansByCode = async (code: string): Promise<Bilan[]> => {
  try {
    const response = await authenticatedFetch(`/get_patient_bilans_by_code.php?code=${encodeURIComponent(code)}`);
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