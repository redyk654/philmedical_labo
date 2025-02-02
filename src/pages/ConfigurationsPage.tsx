import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Save, X } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog.tsx';
import {
  ConfigItem,
  getUnits,
  createUnit,
  updateUnit,
  deleteUnit,
  getSampleTypes,
  createSampleType,
  updateSampleType,
  deleteSampleType,
  getHospitalServices,
  createHospitalService,
  updateHospitalService,
  deleteHospitalService
} from '../services/api.tsx';

interface EditingItem {
  id: string;
  designation: string;
}

interface DeleteConfirmation {
  item: ConfigItem;
  section: string;
}

const ConfigurationsPage: React.FC = () => {
  const [units, setUnits] = useState<ConfigItem[]>([]);
  const [sampleTypes, setSampleTypes] = useState<ConfigItem[]>([]);
  const [hospitalServices, setHospitalServices] = useState<ConfigItem[]>([]);
  
  // Separate editing states for each section
  const [editingUnit, setEditingUnit] = useState<EditingItem | null>(null);
  const [editingSampleType, setEditingSampleType] = useState<EditingItem | null>(null);
  const [editingHospitalService, setEditingHospitalService] = useState<EditingItem | null>(null);
  
  const [newItemSection, setNewItemSection] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmation | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [unitsData, sampleTypesData, hospitalServicesData] = await Promise.all([
        getUnits(),
        getSampleTypes(),
        getHospitalServices()
      ]);
      
      setUnits(unitsData);
      setSampleTypes(sampleTypesData);
      setHospitalServices(hospitalServicesData);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item: ConfigItem, section: string) => {
    const editingItem = { id: item.id, designation: item.designation };
    switch (section) {
      case 'units':
        setEditingUnit(editingItem);
        setEditingSampleType(null);
        setEditingHospitalService(null);
        break;
      case 'sampleTypes':
        setEditingSampleType(editingItem);
        setEditingUnit(null);
        setEditingHospitalService(null);
        break;
      case 'hospitalServices':
        setEditingHospitalService(editingItem);
        setEditingUnit(null);
        setEditingSampleType(null);
        break;
    }
  };

  const handleSave = async (section: string) => {
    try {
      let updatedItem;
      
      switch (section) {
        case 'units':
          if (!editingUnit) return;
          updatedItem = await updateUnit(editingUnit.id, editingUnit.designation);
          setUnits(units.map(item => item.id === updatedItem.id ? updatedItem : item));
          setEditingUnit(null);
          break;
        case 'sampleTypes':
          if (!editingSampleType) return;
          updatedItem = await updateSampleType(editingSampleType.id, editingSampleType.designation);
          setSampleTypes(sampleTypes.map(item => item.id === updatedItem.id ? updatedItem : item));
          setEditingSampleType(null);
          break;
        case 'hospitalServices':
          if (!editingHospitalService) return;
          updatedItem = await updateHospitalService(editingHospitalService.id, editingHospitalService.designation);
          setHospitalServices(hospitalServices.map(item => item.id === updatedItem.id ? updatedItem : item));
          setEditingHospitalService(null);
          break;
      }

      setError(null);
    } catch (err) {
      setError('Erreur lors de la sauvegarde');
    }
  };

  const handleDeleteClick = (item: ConfigItem, section: string) => {
    setDeleteConfirmation({ item, section });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmation) return;
    const { item, section } = deleteConfirmation;

    try {
      switch (section) {
        case 'units':
          await deleteUnit(item.id);
          setUnits(units.filter(i => i.id !== item.id));
          break;
        case 'sampleTypes':
          await deleteSampleType(item.id);
          setSampleTypes(sampleTypes.filter(i => i.id !== item.id));
          break;
        case 'hospitalServices':
          await deleteHospitalService(item.id);
          setHospitalServices(hospitalServices.filter(i => i.id !== item.id));
          break;
      }
      setError(null);
    } catch (err) {
      setError('Erreur lors de la suppression');
    } finally {
      setDeleteConfirmation(null);
    }
  };

  const handleAdd = async () => {
    if (!newItemSection || !newItemName.trim()) return;

    try {
      let newItem;
      
      switch (newItemSection) {
        case 'units':
          newItem = await createUnit(newItemName);
          setUnits([...units, newItem]);
          break;
        case 'sampleTypes':
          newItem = await createSampleType(newItemName);
          setSampleTypes([...sampleTypes, newItem]);
          break;
        case 'hospitalServices':
          newItem = await createHospitalService(newItemName);
          setHospitalServices([...hospitalServices, newItem]);
          break;
      }

      setNewItemName('');
      setNewItemSection(null);
      setError(null);
    } catch (err) {
      setError('Erreur lors de la création');
    }
  };

  const getEditingState = (section: string, item: ConfigItem) => {
    switch (section) {
      case 'units':
        return editingUnit?.id === item.id ? editingUnit : null;
      case 'sampleTypes':
        return editingSampleType?.id === item.id ? editingSampleType : null;
      case 'hospitalServices':
        return editingHospitalService?.id === item.id ? editingHospitalService : null;
      default:
        return null;
    }
  };

  const handleEditingChange = (value: string, section: string) => {
    switch (section) {
      case 'units':
        editingUnit && setEditingUnit({ ...editingUnit, designation: value });
        break;
      case 'sampleTypes':
        editingSampleType && setEditingSampleType({ ...editingSampleType, designation: value });
        break;
      case 'hospitalServices':
        editingHospitalService && setEditingHospitalService({ ...editingHospitalService, designation: value });
        break;
    }
  };

  const cancelEditing = (section: string) => {
    switch (section) {
      case 'units':
        setEditingUnit(null);
        break;
      case 'sampleTypes':
        setEditingSampleType(null);
        break;
      case 'hospitalServices':
        setEditingHospitalService(null);
        break;
    }
  };

  const renderSection = (title: string, items: ConfigItem[], section: string) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        <button
          onClick={() => setNewItemSection(section)}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-[#464E77] hover:bg-[#363c5d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#464E77]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter
        </button>
      </div>

      {newItemSection === section && (
        <div className="flex items-center space-x-2 mb-4">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Nouveau nom"
            className="flex-1 h-10 px-3 border border-gray-300 rounded-md focus:ring-[#464E77] focus:border-[#464E77]"
          />
          <button
            onClick={handleAdd}
            className="h-10 px-4 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            <Save className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setNewItemSection(null);
              setNewItemName('');
            }}
            className="h-10 px-4 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="space-y-2">
        {items.map(item => {
          const editingState = getEditingState(section, item);
          
          return (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
            >
              {editingState ? (
                <input
                  type="text"
                  value={editingState.designation}
                  onChange={(e) => handleEditingChange(e.target.value, section)}
                  className="flex-1 mr-2 h-10 px-3 border border-gray-300 rounded-md focus:ring-[#464E77] focus:border-[#464E77]"
                />
              ) : (
                <span className="text-gray-700">{item.designation}</span>
              )}
              
              <div className="flex items-center space-x-2">
                {editingState ? (
                  <>
                    <button
                      onClick={() => handleSave(section)}
                      className="p-2 text-white bg-green-500 rounded-md hover:bg-green-600"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => cancelEditing(section)}
                      className="p-2 text-white bg-gray-500 rounded-md hover:bg-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleEdit(item, section)}
                      className="p-2 text-white bg-[#464E77] rounded-md hover:bg-[#363c5d]"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(item, section)}
                      className="p-2 text-white bg-red-500 rounded-md hover:bg-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
        {items.length === 0 && (
          <div className="text-center text-gray-500 py-4">
            Aucun élément trouvé
          </div>
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-600">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">CONFIGURATIONS</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {renderSection('Unités', units, 'units')}
        {renderSection('Types d\'échantillon', sampleTypes, 'sampleTypes')}
        {renderSection('Services hospitaliers', hospitalServices, 'hospitalServices')}
      </div>

      <ConfirmDialog
        isOpen={deleteConfirmation !== null}
        message="Êtes-vous sûr de vouloir supprimer cet élément ?"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirmation(null)}
      />
    </div>
  );
};

export default ConfigurationsPage;