import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMedicines, createMedicine, updateMedicine, deleteMedicine } from '../store/medicineSlice';
import { FiPlus, FiX, FiInfo } from 'react-icons/fi';
import { Edit2, Trash2 } from 'lucide-react';

const MedicineFormModal = ({ isOpen, onClose, initialData = null }) => {
  const isEditing = !!initialData;
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    withdrawal_days: ''
  });
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name,
          description: initialData.description || '',
          withdrawal_days: initialData.withdrawal_days
        });
      } else {
        setFormData({ name: '', description: '', withdrawal_days: '' });
      }
    }
  }, [isOpen, initialData]);

  const { loading, error } = useSelector((state) => state.medicines);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await dispatch(updateMedicine({
          id: initialData.id,
          data: { ...formData, withdrawal_days: parseInt(formData.withdrawal_days, 10) }
        })).unwrap();
        onClose();
      } else {
        await dispatch(createMedicine({
          ...formData,
          withdrawal_days: parseInt(formData.withdrawal_days, 10)
        })).unwrap();
        setFormData({ name: '', description: '', withdrawal_days: '' });
        onClose();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500/20 backdrop-blur-sm flex items-center justify-center sm:p-4 z-50 transition-opacity">
      <div className="glass-card max-w-md w-full h-full sm:h-auto overflow-y-auto border-white/80 shadow-xl flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-200/50">
          <h3 className="text-lg font-bold text-gray-900">{isEditing ? 'Editar Medicamento' : 'Nuevo Medicamento'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <FiX className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 flex-1 flex flex-col space-y-4">
          <div className="flex-1 space-y-4">
            {error && <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Comercial</label>
            <input 
              required
              type="text" 
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 py-2 border px-3" 
              placeholder="Ej: Ivexterm"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción / Compuesto</label>
            <input 
              type="text" 
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 py-2 border px-3" 
              placeholder="Ej: Ivermectina 1%"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-red-700 mb-1">Días de Carencia (Requerido)</label>
            <input 
              required
              type="number" 
              min="0"
              className="w-full border-red-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 py-2 border px-3"
              placeholder="Ej: 30"
              value={formData.withdrawal_days}
              onChange={e => setFormData({...formData, withdrawal_days: e.target.value})}
            />
            <p className="mt-1 text-xs text-gray-500 flex items-center">
              <FiInfo className="mr-1 shrink-0" /> Días requeridos para que el animal salga de cuarentena
            </p>
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
              {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Guardar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const MedicinesPage = () => {
  const dispatch = useDispatch();
  const { medicines, loading } = useSelector((state) => state.medicines);
  const { user } = useSelector((state) => state.auth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMed, setSelectedMed] = useState(null);

  useEffect(() => {
    dispatch(fetchMedicines());
  }, [dispatch]);

  const handleEdit = (med) => {
    setSelectedMed(med);
    setIsModalOpen(true);
  };

  const handleDelete = async (med) => {
    if (window.confirm(`¿Estás seguro que deseas eliminar el medicamento ${med.name}?`)) {
      try {
        await dispatch(deleteMedicine(med.id)).unwrap();
      } catch (err) {
        alert(err || 'No se pudo eliminar el medicamento');
      }
    }
  };

  const handleOpenCreate = () => {
    setSelectedMed(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in relative z-10 p-2 sm:p-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Medicamentos</h1>
          <p className="text-gray-500 mt-1">Farmacopea y períodos de carencia</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-900 hover:bg-gray-800 transition-colors"
        >
          <FiPlus className="mr-2 h-5 w-5" />
          Agregar Medicamento
        </button>
      </div>

      <MedicineFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialData={selectedMed}
      />

      <div className="overflow-hidden glass-card">
        <ul className="divide-y divide-gray-200/50">
          {loading && medicines.length === 0 && <li className="p-4 text-center">Cargando...</li>}
          {!loading && medicines.length === 0 && <li className="p-6 text-center text-gray-500">No hay medicamentos configurados.</li>}
          
          {medicines.map(med => (
            <li key={med.id} className="p-4 sm:p-6 table-row-hover flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
              <div>
                <h4 className="text-lg font-bold text-gray-900">{med.name}</h4>
                <p className="text-sm text-gray-500 mt-1">{med.description || 'Sin descripción'}</p>
              </div>
              <div className="flex items-center gap-6 shrink-0">
                <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg border border-red-100 flex items-center justify-center">
                  <div className="text-center">
                    <span className="block text-xl font-bold leading-none">{med.withdrawal_days}</span>
                    <span className="block text-[10px] uppercase tracking-wider font-semibold mt-1">Días</span>
                  </div>
                </div>

                  <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
                    <button 
                      onClick={() => handleEdit(med)}
                      className="p-3 text-gray-400 hover:text-brand-600 transition-colors"
                      title="Editar"
                    >
                      <Edit2 size={20} />
                    </button>
                    <button 
                      onClick={() => handleDelete(med)}
                      className="p-3 text-gray-400 hover:text-red-600 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MedicinesPage;
