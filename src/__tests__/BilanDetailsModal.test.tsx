import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BilanDetailsModal from '../components/BilanDetailsModal';
import { getBilanDetails, updateExaminationResult } from '../services/api.tsx';
import { useReactToPrint } from 'react-to-print';

// Mock des modules
jest.mock('../services/api.tsx', () => ({
  getBilanDetails: jest.fn(),
  updateExaminationResult: jest.fn()
}));

jest.mock('react-to-print', () => ({
  useReactToPrint: jest.fn().mockImplementation(() => jest.fn())
}));

jest.mock('qrcode.react', () => ({
  QRCodeSVG: () => <div data-testid="qr-code">QR Code</div>
}));

jest.mock('../components/EnteteHdj.tsx', () => () => <div data-testid="entete-hopital">Entête Hôpital</div>);

jest.mock('lucide-react', () => ({
  X: () => <div data-testid="icon-close">X</div>,
  Save: () => <div data-testid="icon-save">Save</div>,
  Printer: () => <div data-testid="icon-printer">Printer</div>
}));

jest.mock('../services/function.tsx', () => ({
    afficherSexe: jest.fn((sexe) => sexe === 'H' ? 'Homme' : 'Femme'),
    afficherAge: jest.fn((age, ageUnit) => {
      if (age === 0) return 'N/A';
      return ageUnit === 'ans' ? `${age} ans` : `${age} mois`;
    }),
    formatDate: jest.fn(() => '14 mars 2024')
}));

describe('BilanDetailsModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    bilanId: 123,
    patientName: 'Jean Dupont',
    patientAge: 45,
    patientAgeUnit: 'ans',
    patientSexe: 'H'
  };

  const mockBilanDetails = {
    id: '123',
    examen: 'Numération Formule Sanguine',
    categorie_designation: 'Hématologie',
    prescripteur_designation: 'Dr. Martin',
    type_echantillon_designation: 'Sang',
    resultat: 'Taux de globules rouges: 4.5 x 10^12/L\nHémoglobine: 14.5 g/dL',
    num_facture: 'FAC20240314',
    code_labo: 'LAB123',
    save_at: '2024-03-12T10:30:00Z',
    update_at: '2024-03-13T08:45:00Z'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getBilanDetails as jest.Mock).mockResolvedValue(mockBilanDetails);
    (updateExaminationResult as jest.Mock).mockResolvedValue({ success: true });
    (jest.requireMock('../services/function.tsx').afficherSexe as jest.Mock).mockReturnValue('Homme');
    (jest.requireMock('../services/function.tsx').afficherAge as jest.Mock).mockReturnValue('45 ans');
  });

  test('ne devrait pas rendre la modale quand isOpen est false', () => {
    render(<BilanDetailsModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Numération Formule Sanguine')).not.toBeInTheDocument();
  });

  test('devrait afficher un état de chargement puis les détails du bilan', async () => {
    render(<BilanDetailsModal {...defaultProps} />);
    
    // État de chargement initial
    expect(screen.getByText('Chargement...')).toBeInTheDocument();
    
    // Attend que les données soient chargées
    await waitFor(() => {
      expect(getBilanDetails).toHaveBeenCalledWith(123);
    });
    
    // Vérifie le titre
    await waitFor(() => {
      expect(screen.getByTestId('bilan-title')).toHaveTextContent('Numération Formule Sanguine');
    });
    // Vérifie les informations du patient avec les valeurs mockées
    // Comme defaultProps.patientSexe = 'H', la fonction mockée va retourner 'Homme'
    // et comme patientAgeUnit = 'years', la fonction va retourner '45 ans'
    expect(screen.getByTestId('patient-info')).toHaveTextContent('Jean Dupont - 45 ans - Homme');
    
    expect(screen.getByText('Hématologie')).toBeInTheDocument();
    expect(screen.getByTestId('prescripteur-info')).toHaveTextContent('Dr. Martin');
    expect(screen.getByTestId('echantillon-info')).toHaveTextContent('Sang');
    
    // Vérifie que le textarea contient le résultat
    const textarea = screen.getByTestId('resultat-textarea');
    expect(textarea).toHaveValue('Taux de globules rouges: 4.5 x 10^12/L\nHémoglobine: 14.5 g/dL');
    
  });

  test('devrait afficher une erreur si la récupération des données échoue', async () => {
    (getBilanDetails as jest.Mock).mockRejectedValue(new Error('Erreur lors de la récupération des données'));
    
    render(<BilanDetailsModal {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Erreur lors de la récupération des données');
    });
  });

  test('devrait mettre à jour le résultat lorsque le textarea est modifié', async () => {
    render(<BilanDetailsModal {...defaultProps} />);
    
    await waitFor(() => {
        expect(screen.getByTestId('bilan-title')).toHaveTextContent('Numération Formule Sanguine');
    });
    
    const textarea = screen.getByTestId('resultat-textarea');
    fireEvent.change(textarea, { target: { value: 'Nouveau résultat modifié' } });
    
    expect(textarea).toHaveValue('Nouveau résultat modifié');
  });

  test('devrait désactiver le bouton de sauvegarde quand aucune modification n\'est faite', async () => {
    render(<BilanDetailsModal {...defaultProps} />);
    
    await waitFor(() => {
        expect(screen.getByTestId('bilan-title')).toHaveTextContent('Numération Formule Sanguine');
    });
    
    const saveButton = screen.getByTestId('save-button');
    expect(saveButton).toBeDisabled();
  });

  test('devrait activer le bouton de sauvegarde après modification du résultat', async () => {
    render(<BilanDetailsModal {...defaultProps} />);
    
    await waitFor(() => {
        expect(screen.getByTestId('bilan-title')).toHaveTextContent('Numération Formule Sanguine');
    });
    
    const textarea = screen.getByTestId('resultat-textarea');
    fireEvent.change(textarea, { target: { value: 'Nouveau résultat modifié' } });
    
    const saveButton = screen.getByTestId('save-button');
    expect(saveButton).not.toBeDisabled();
  });

  test('devrait enregistrer les modifications et afficher un message de succès', async () => {
    render(<BilanDetailsModal {...defaultProps} />);
    
    await waitFor(() => {
        expect(screen.getByTestId('bilan-title')).toHaveTextContent('Numération Formule Sanguine');
    });
    
    const textarea = screen.getByTestId('resultat-textarea');
    fireEvent.change(textarea, { target: { value: 'Nouveau résultat modifié' } });
    
    const saveButton = screen.getByTestId('save-button');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(updateExaminationResult).toHaveBeenCalledWith('123', 'Nouveau résultat modifié');
      expect(screen.getByTestId('success-message')).toHaveTextContent('Modifications enregistrées avec succès');
    });
  });

  test('devrait appeler la fonction onClose lorsque le bouton de fermeture est cliqué', async () => {
    render(<BilanDetailsModal {...defaultProps} />);
    
    await waitFor(() => {
        expect(screen.getByTestId('bilan-title')).toHaveTextContent('Numération Formule Sanguine');
    });
    
    const closeButton = screen.getByTestId('icon-close');
    fireEvent.click(closeButton);
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  test('devrait déclencher l\'impression lorsque le bouton d\'impression est cliqué', async () => {
    const mockHandlePrint = jest.fn();
    (useReactToPrint as jest.Mock).mockReturnValue(mockHandlePrint);
    
    render(<BilanDetailsModal {...defaultProps} />);
    
    await waitFor(() => {
        expect(screen.getByTestId('bilan-title')).toHaveTextContent('Numération Formule Sanguine');
    });
    
    const printButton = screen.getByText('Imprimer');
    fireEvent.click(printButton);
    
    expect(mockHandlePrint).toHaveBeenCalledTimes(1);
  });
});