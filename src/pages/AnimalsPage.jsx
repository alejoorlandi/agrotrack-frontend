import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAnimals, deleteAnimal, updateAnimal } from '../store/animalSlice';
import { AnimalTable } from '../components/AnimalTable';
import { AnimalCard } from '../components/AnimalCard';
import { FiPlus, FiX } from 'react-icons/fi';
import api from '../services/api';

const AnimalFormModal = ({ isOpen, onClose, onSuccess, initialData = null }) => {
  const isEditing = !!initialData;
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    tag_id: '',
    category: '',
    weight: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          tag_id: initialData.tag_id,
          category: initialData.category,
          weight: initialData.weight,
        });
      } else {
        setFormData({ tag_id: '', category: '', weight: '' });
      }
    }
  }, [isOpen, initialData]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isEditing) {
        await dispatch(updateAnimal({ 
          id: initialData.id, 
          data: { ...formData, weight: parseFloat(formData.weight) }
        })).unwrap();
        onSuccess(true);
      } else {
        await api.post('/animals', {
          ...formData,
          weight: parseFloat(formData.weight),
          status: 'healthy' // default status for new animals
        });
        onSuccess(false);
      }
      onClose();
    } catch (err) {
      setError(err?.message || err?.response?.data?.message || 'Error al guardar el animal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500/20 backdrop-blur-sm flex items-center justify-center sm:p-4 z-50 transition-opacity">
      <div className="glass-card max-w-md w-full h-full sm:h-auto overflow-y-auto border-white/80 shadow-xl flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-200/50">
          <h3 className="text-lg font-bold text-gray-900">Registrar Nuevo Animal</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <FiX className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 flex-1 flex flex-col space-y-4">
          <div className="flex-1 space-y-4">
            {error && <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Caravana (Tag ID)</label>
            <input 
              required
              type="text" 
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 py-2 border px-3" 
              placeholder="AR-001"
              value={formData.tag_id}
              onChange={e => setFormData({...formData, tag_id: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría / Especie</label>
            <select
              required
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 py-2 border px-3 bg-white"
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
            >
              <option value="" disabled>-- Seleccionar categoría --</option>
              <option value="Novillo">Novillo</option>
              <option value="Vaca">Vaca</option>
              <option value="Ternero">Ternero</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Peso Inicial (kg)</label>
            <input 
              required
              type="number" 
              step="0.01"
              min="0"
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 py-2 border px-3"
              placeholder="400.5"
              value={formData.weight}
              onChange={e => setFormData({...formData, weight: e.target.value})}
            />
          </div>
          </div>
          
          <div className="pt-4 flex justify-end gap-3 pb-8 sm:pb-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 ${loading ? 'opacity-70' : ''}`}
            >
              {loading ? 'Guardando...' : (isEditing ? 'Actualizar Animal' : 'Guardar Animal')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AnimalsPage = () => {
  const dispatch = useDispatch();
  const { animals, loading } = useSelector((state) => state.animals);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState(null); // Used for editing

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    dispatch(fetchAnimals());
  }, [dispatch]);

  const handleSuccess = (wasEdit) => {
    // If it was a create, fetch Animals will naturally place it properly
    // If it was an edit, state is already updated optimally by thunk
    if (!wasEdit) dispatch(fetchAnimals());
  };

  const handleEdit = (animal) => {
    setSelectedAnimal(animal);
    setIsModalOpen(true);
  };

  const handleDelete = async (animal) => {
    if (window.confirm(`¿Estás seguro que deseas eliminar la caravana ${animal.tag_id}?`)) {
      try {
        await dispatch(deleteAnimal(animal.id)).unwrap();
      } catch(err) {
        alert(err);
      }
    }
  };

  const handleOpenCreate = () => {
    setSelectedAnimal(null);
    setIsModalOpen(true);
  };

  // Filter animals based on search and status
  const filteredAnimals = animals.filter(animal => {
    const matchesSearch = animal.tag_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || animal.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in relative z-10 p-2 sm:p-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Hacienda</h1>
          <p className="text-gray-500 mt-1 font-medium">Gestión completa de los animales registrados</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent shadow-[0_8px_16px_-4px_rgba(6,81,237,0.3)] text-sm font-bold rounded-xl text-white bg-brand-600 hover:bg-brand-500 transition-all hover:-translate-y-0.5"
        >
          <FiPlus className="mr-2 h-5 w-5" />
          Registrar Animal
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-col md:flex-row gap-4 mb-2">
        <div className="flex-1">
          <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Buscar por Caravana</label>
          <input
            type="text"
            placeholder="Ej: AR-..."
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-brand-500 focus:border-brand-500 py-2.5 px-3 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-64">
          <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Filtrar por Estado</label>
          <select
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-brand-500 focus:border-brand-500 py-2.5 px-3 bg-white font-medium text-gray-700"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Ver Todos</option>
            <option value="healthy">Sanos / Alta</option>
            <option value="in_treatment">En Tratamiento</option>
            <option value="quarantine">En Cuarentena</option>
          </select>
        </div>
      </div>

      <AnimalFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleSuccess}
        initialData={selectedAnimal}
      />

      <div className="flex flex-col gap-4 lg:hidden">
        {loading && animals.length === 0 ? (
          <div className="py-10 text-center font-medium text-gray-500">Cargando datos...</div>
        ) : filteredAnimals.length > 0 ? (
          filteredAnimals.map(animal => <AnimalCard key={animal.id} animal={animal} onEdit={handleEdit} onDelete={handleDelete} />)
        ) : (
          <div className="bg-white/80 backdrop-blur rounded-2xl p-8 text-center text-gray-500 border border-gray-200 border-dashed">
            No se encontraron animales con estos filtros.
          </div>
        )}
      </div>

      {!loading || animals.length > 0 ? (
        filteredAnimals.length > 0 ? (
          <AnimalTable animals={filteredAnimals} onEdit={handleEdit} onDelete={handleDelete} />
        ) : (
          <div className="hidden lg:block glass-card p-10 text-center text-gray-500 border-dashed">
            No se encontraron animales con estos filtros en el sistema.
          </div>
        )
      ) : null}
      
    </div>
  );
};

export default AnimalsPage;
