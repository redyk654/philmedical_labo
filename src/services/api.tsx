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

export interface ConfigItem {
  id: string;
  designation: string;
}

export interface Examination {
  id: string;
  designation: string;
}

export interface ReferenceValue {
  id: string;
  designation_exam: string;
  id_exam: string;
  min_value: number;
  max_value: number | null;
  sexe: string | null;
  min_age: number | null;
  max_age: number | null;
  id_specific_condition: string | null;
  specific_condition?: {
    designation: string;
  };
}

export interface SpecificCondition {
  id: string;
  designation: string;
}

export interface NewReferenceValue {
  id_exam: string;
  min_value: number;
  max_value: number | null;
  sexe: string | null;
  min_age: number | null;
  max_age: number | null;
  id_specific_condition: string | null;
}

export const searchPatients = async (searchTerm: string): Promise<Patient[]> => {
  try {
    const response = await authenticatedFetch(`/search_patients.php?q=${encodeURIComponent(searchTerm)}`);
    if (!response.ok) {
      throw new Error('Echec de la recherche des patients');
    }
    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Serveur indisponible');
  }
};

export const getPatientByCode = async (code: string): Promise<Patient> => {
  try {
    const response = await authenticatedFetch(`/get_patient.php?code=${encodeURIComponent(code)}`);
    if (!response.ok) {
      throw new Error('Echec de la recherche du patient');
    }
    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Serveur indisponible');
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

// ConfigurationPage endpoints
const fetchConfigItems = async (endpoint: string): Promise<ConfigItem[]> => {
  const response = await authenticatedFetch(endpoint);
  if (!response.ok) {
    throw new Error('Failed to fetch items');
  }
  return response.json();
};

const createConfigItem = async (endpoint: string, designation: string): Promise<ConfigItem> => {
  const response = await authenticatedFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify({ designation })
  });
  if (!response.ok) {
    throw new Error('Failed to create item');
  }
  return response.json();
};

const updateConfigItem = async (endpoint: string, id: string, designation: string): Promise<ConfigItem> => {
  const response = await authenticatedFetch(`${endpoint}?id=${id}`, {
    method: 'PUT',
    body: JSON.stringify({ designation })
  });
  if (!response.ok) {
    throw new Error('Failed to update item');
  }
  return response.json();
};

const deleteConfigItem = async (endpoint: string, id: string): Promise<void> => {
  const response = await authenticatedFetch(`${endpoint}?id=${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    throw new Error('Failed to delete item');
  }
};

// Units
export const getUnits = () => fetchConfigItems('/units.php');
export const createUnit = (designation: string) => createConfigItem('/units.php', designation);
export const updateUnit = (id: string, designation: string) => updateConfigItem('/units.php', id, designation);
export const deleteUnit = (id: string) => deleteConfigItem('/units.php', id);

// Sample Types
export const getSampleTypes = () => fetchConfigItems('/types_echantillon.php');
export const createSampleType = (designation: string) => createConfigItem('/types_echantillon.php', designation);
export const updateSampleType = (id: string, designation: string) => updateConfigItem('/types_echantillon.php', id, designation);
export const deleteSampleType = (id: string) => deleteConfigItem('/types_echantillon.php', id);

// Hospital Services
export const getHospitalServices = () => fetchConfigItems('/hospital_services.php');
export const createHospitalService = (designation: string) => createConfigItem('/hospital_services.php', designation);
export const updateHospitalService = (id: string, designation: string) => updateConfigItem('/hospital_services.php', id, designation);
export const deleteHospitalService = (id: string) => deleteConfigItem('/hospital_services.php', id);



// Get all examinations
export const getExaminations = async (): Promise<Examination[]> => {
  const response = await authenticatedFetch('/examinations.php');
  if (!response.ok) {
    throw new Error('Echec de la récupération des examens');
  }
  return response.json();
};

// Get reference values for an examination
export const getReferenceValues = async (examId: string): Promise<ReferenceValue[]> => {
  const response = await authenticatedFetch(`/reference_values.php?exam_id=${examId}`);
  if (!response.ok) {
    throw new Error('Echec de la récupération des valeurs de référence');
  }
  return response.json();
};

// Get all specific conditions
export const getSpecificConditions = async (): Promise<SpecificCondition[]> => {
  const response = await authenticatedFetch('/specific_conditions.php');
  if (!response.ok) {
    throw new Error('Echec de la récupération des conditions spécifiques');
  }
  return response.json();
};

// Create a new specific condition
export const createSpecificCondition = async (designation: string): Promise<SpecificCondition> => {
  const response = await authenticatedFetch('/specific_conditions.php', {
    method: 'POST',
    body: JSON.stringify({ designation })
  });
  if (!response.ok) {
    throw new Error('Echec de la création de la condition spécifique');
  }
  return response.json();
};

// Create a new reference value
export const createReferenceValue = async (referenceValue: NewReferenceValue): Promise<ReferenceValue> => {
  const response = await authenticatedFetch('/reference_values.php', {
    method: 'POST',
    body: JSON.stringify(referenceValue)
  });
  if (!response.ok) {
    throw new Error('Echec de la création de la valeur de référence');
  }
  return response.json();
};

// Delete a reference value
export const deleteReferenceValue = async (id: string): Promise<void> => {
  const response = await authenticatedFetch(`/reference_values.php?id=${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    throw new Error('Echec de la suppression de la valeur de référence');
  }
};