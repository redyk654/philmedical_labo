import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Save, X } from 'lucide-react';

interface ConfigItem {
  id: string;
  nom: string;
}

interface EditingItem {
  id: string;
  nom: string;
  section: 'units' | 'sampleTypes' | 'hospitalServices';
}

const ConfigurationsPage: React.FC = () => {
  const [units, setUnits] = useState<ConfigItem[]>([]);
  const [sampleTypes, setSampleTypes] = useState<ConfigItem[]>([]);
  const [hospitalServices, setHospitalServices] = useState<ConfigItem[]>([]);
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
  const [newItemSection, setNewItemSection] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // TODO: Implement API calls to fetch data
      // For now using mock data
      setUnits([
        { id: '1', nom: 'mg/dL' },
        { id: '2', nom: 'mmol/L' }
      ]);
      setSampleTypes([
        { id: '1', nom: 'Sang' },
        { id: '2', nom: 'Urine' }
      ]);
      setHospitalServices([
        { id: '1', nom: 'Cardiologie' },
        { id: '2', nom: 'Pédiatrie' }
      ]);
    } catch (err) {
      setError('Erreur lors du chargement des données');
    }
  };

  const handleEdit = (item: ConfigItem, section: EditingItem['section']) => {
    setEditingItem({ ...item, section });
  };

  const handleSave = async () => {
    if (!editingItem) return;
    
    try {
      // TODO: Implement API call to update item
      console.log('Saving:', editingItem);
      
      // Update local state
      const updateState = (items: ConfigItem[]) => 
        items.map(item => item.id === editingItem.id ? { ...item, nom: editingItem.nom } : item);

      switch (editingItem.section) {
        case 'units':
          setUnits(updateState(units));
          break;
        case 'sampleTypes':
          setSampleTypes(updateState(sampleTypes));
          break;
        case 'hospitalServices':
          setHospitalServices(updateState(hospitalServices));
          break;
      }

      setEditingItem(null);
    } catch (err) {
      setError('Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (item: ConfigItem, section: string) => {
    try {
      // TODO: Implement API call to delete item
      console.log('Deleting:', item);
      
      // Update local state
      const filterState = (items: ConfigItem[]) => 
        items.filter(i => i.id !== item.id);

      switch (section) {
        case 'units':
          setUnits(filterState(units));
          break;
        case 'sampleTypes':
          setSampleTypes(filterState(sampleTypes));
          break;
        case 'hospitalServices':
          setHospitalServices(filterState(hospitalServices));
          break;
      }
    } catch (err) {
      setError('Erreur lors de la suppression');
    }
  };

  const handleAdd = async () => {
    if (!newItemSection || !newItemName.trim()) return;

    try {
      // TODO: Implement API call to create item
      const newItem = { id: Date.now().toString(), nom: newItemName };

      // Update local state
      switch (newItemSection) {
        case 'units':
          setUnits([...units, newItem]);
          break;
        case 'sampleTypes':
          setSampleTypes([...sampleTypes, newItem]);
          break;
        case 'hospitalServices':
          setHospitalServices([...hospitalServices, newItem]);
          break;
      }

      setNewItemName('');
      setNewItemSection(null);
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
                value={editingItem.nom}
                onChange={(e) => setEditingItem({ ...editingItem, nom: e.target.value })}
                className="flex-1 mr-2 h-10 px-3 border border-gray-300 rounded-md focus:ring-[#464E77] focus:border-[#464E77]"
              />
            ) : (
              <span className="text-gray-700">{item.nom}</span>
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
                    onClick={() => handleDelete(item, section)}
                    className="p-2 text-white bg-red-500 rounded-md hover:bg-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

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
    </div>
  );
};

export default ConfigurationsPage;