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
  section: 'units' | 'sampleTypes' | 'hospitalServices';
}

interface DeleteConfirmation {
  item: ConfigItem;
  section: string;
}

const ConfigurationsPage: React.FC = () => {
  const [units, setUnits] = useState<ConfigItem[]>([]);
  const [sampleTypes, setSampleTypes] = useState<ConfigItem[]>([]);
  const [hospitalServices, setHospitalServices] = useState<ConfigItem[]>([]);
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
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

  const handleEdit = (item: ConfigItem, section: EditingItem['section']) => {
    setEditingItem({ ...item, section });
  };

  const handleSave = async () => {
    if (!editingItem) return;
    
    try {
      let updatedItem;
      
      switch (editingItem.section) {
        case 'units':
          updatedItem = await updateUnit(editingItem.id, editingItem.designation);
          setUnits(units.map(item => item.id === updatedItem.id ? updatedItem : item));
          break;
        case 'sampleTypes':
          updatedItem = await updateSampleType(editingItem.id, editingItem.designation);
          setSampleTypes(sampleTypes.map(item => item.id === updatedItem.id ? updatedItem : item));
          break;
        case 'hospitalServices':
          updatedItem = await updateHospitalService(editingItem.id, editingItem.designation);
          setHospitalServices(hospitalServices.map(item => item.id === updatedItem.id ? updatedItem : item));
          break;
      }

      setEditingItem(null);
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

  const renderSection = (title: string, items: ConfigItem[], section: EditingItem['section']) => (
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
        {items.map(item => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
          >
            {editingItem?.id === item.id ? (
              <input
                type="text"
                value={editingItem.designation}
                onChange={(e) => setEditingItem({ ...editingItem, designation: e.target.value })}
                className="flex-1 mr-2 h-10 px-3 border border-gray-300 rounded-md focus:ring-[#464E77] focus:border-[#464E77]"
              />
            ) : (
              <span className="text-gray-700">{item.designation}</span>
            )}
            
            <div className="flex items-center space-x-2">
              {editingItem?.id === item.id ? (
                <>
                  <button
                    onClick={handleSave}
                    className="p-2 text-white bg-green-500 rounded-md hover:bg-green-600"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingItem(null)}
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
        ))}
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