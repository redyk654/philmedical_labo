import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NewBilanModal from '../components/NewBilanModal';
import { 
  getPrescribers, 
  getExamensLabo, 
  getExaminationCategories, 
  getSampleTypes,
  checkInvoice,
  checkBilanExists,
  createBilan
} from '../services/api';
import { authenticatedFetch } from '../services/auth';

// Mock the API services
jest.mock('../services/api');
jest.mock('../services/auth');

const mockPrescribers = [
  { id: '1', designation: 'Dr. Smith' },
  { id: '2', designation: 'Dr. Jones' }
];

const mockExamens = [
  { id: '1', designation: 'Blood Test', contenu: 'Test content' },
  { id: '2', designation: 'X-Ray', contenu: 'X-Ray content' }
];

const mockCategories = [
  { id: '1', designation: 'Category 1' },
  { id: '2', designation: 'Category 2' }
];

const mockSampleTypes = [
  { id: '1', designation: 'Blood' },
  { id: '2', designation: 'Urine' }
];

describe('NewBilanModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    patientName: 'John Doe',
    patientCode: 'P123',
    patientSexe: 'H',
    patientAge: 30,
    patientAgeUnit: 'ans'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Setup mock returns
    (getPrescribers as jest.Mock).mockResolvedValue(mockPrescribers);
    (getExamensLabo as jest.Mock).mockResolvedValue(mockExamens);
    (getExaminationCategories as jest.Mock).mockResolvedValue(mockCategories);
    (getSampleTypes as jest.Mock).mockResolvedValue(mockSampleTypes);
    (authenticatedFetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ id: 'FAC123', id_fac: '123' }])
    });
  });

  it('renders correctly when open', () => {
    render(<NewBilanModal {...defaultProps} />);
    
    expect(screen.getByTestId('modal-title')).toHaveTextContent('NOUVEAU BILAN');
    expect(screen.getByTestId('patient-info')).toHaveTextContent('John Doe - 30 ans - Homme');
  });

  it('does not render when closed', () => {
    render(<NewBilanModal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByTestId('bilan-modal')).not.toBeInTheDocument();
  });

  it('loads and displays all dropdown options', async () => {
    render(<NewBilanModal {...defaultProps} />);

    await waitFor(() => {
      const examSelect = screen.getByTestId('exam-select');
      expect(examSelect).toBeInTheDocument();
      expect(within(examSelect).getByText('BLOOD TEST')).toBeInTheDocument();
    });
  });

  it('shows invoice suggestions when typing invoice number', async () => {
    render(<NewBilanModal {...defaultProps} />);
    
    const invoiceInput = screen.getByTestId('invoice-number-input');
    await userEvent.type(invoiceInput, 'FAC');

    await waitFor(() => {
      expect(screen.getByTestId('invoice-suggestions')).toBeInTheDocument();
      expect(screen.getByTestId('invoice-suggestion-FAC123')).toHaveTextContent('FAC123');
    });
  });

  it('validates required fields on submit', async () => {
    render(<NewBilanModal {...defaultProps} />);
    
    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Veuillez remplir tous les champs obligatoires');
    });
  });

  it('successfully creates a bilan with valid data', async () => {
    (checkInvoice as jest.Mock).mockResolvedValue(true);
    (checkBilanExists as jest.Mock).mockResolvedValue(false);
    (createBilan as jest.Mock).mockResolvedValue({ success: true });

    render(<NewBilanModal {...defaultProps} />);

    // Fill in the form using data-testid selectors
    await userEvent.type(screen.getByTestId('invoice-number-input'), 'FAC123');
    await userEvent.selectOptions(screen.getByTestId('exam-select'), 'Blood Test');
    await userEvent.selectOptions(screen.getByTestId('categorie-select'), '1');
    await userEvent.selectOptions(screen.getByTestId('prescripteur-select'), '1');

    fireEvent.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(createBilan).toHaveBeenCalled();
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  it('handles cancel button click', () => {
    render(<NewBilanModal {...defaultProps} />);
    
    fireEvent.click(screen.getByTestId('cancel-button'));
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('clears form on cancel', () => {
    render(<NewBilanModal {...defaultProps} />);
    
    // Fill some data
    userEvent.type(screen.getByTestId('invoice-number-input'), 'FAC123');
    userEvent.type(screen.getByTestId('lab-code-input'), 'LAB123');
    
    // Click cancel
    fireEvent.click(screen.getByTestId('cancel-button'));
    
    // Verify fields are cleared
    expect(screen.getByTestId('invoice-number-input')).toHaveValue('');
    expect(screen.getByTestId('lab-code-input')).toHaveValue('');
  });

  it('closes modal when clicking close button', () => {
    render(<NewBilanModal {...defaultProps} />);
    
    fireEvent.click(screen.getByTestId('close-modal-button'));
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('shows error when invoice does not exist', async () => {
    (checkInvoice as jest.Mock).mockResolvedValue(false);

    render(<NewBilanModal {...defaultProps} />);

    await userEvent.type(screen.getByTestId('invoice-number-input'), 'FAC123');
    await userEvent.selectOptions(screen.getByTestId('prescripteur-select'), '1');

    fireEvent.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Numéro de facture invalide');
    });
  });
});
