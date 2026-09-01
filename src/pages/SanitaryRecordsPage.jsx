import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRecords, createRecord, deleteRecord } from '../store/sanitaryRecordSlice';
import { fetchAnimals } from '../store/animalSlice';
import { fetchMedicines } from '../store/medicineSlice';
import { FiPlus, FiX, FiShield, FiHeart } from 'react-icons/fi';
import { Trash2 } from 'lucide-react';

const RecordFormModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { animals } = useSelector(state => state.animals);
  const { medicines } = useSelector(state => state.medicines);
  const { loading, error } = useSelector(state => state.sanitaryRecords);

  const [formData, setFormData] = useState({
    animal_id: '',
    medicine_id: '',
    application_date: new Date().toISOString().split('T')[0],
    dose: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (animals.length === 0) dispatch(fetchAnimals());
      if (medicines.length === 0) dispatch(fetchMedicines());
    }
  }, [isOpen, dispatch, animals.length, medicines.length]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const resultAction = await dispatch(createRecord(formData));
    
    if (createRecord.fulfilled.match(resultAction)) {
      setFormData({
        animal_id: '',
        medicine_id: '',
        application_date: new Date().toISOString().split('T')[0],
        dose: ''
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500/20 backdrop-blur-sm flex items-center justify-center sm:p-4 z-50 transition-opacity">
      <div className="glass-card max-w-md w-full h-full sm:h-auto overflow-y-auto border-white/80 shadow-xl flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-200/50">
          <h3 className="text-lg font-bold text-gray-900">Registrar Tratamiento</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <FiX className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 flex-1 flex flex-col space-y-4">
          <div className="flex-1 space-y-4">
            {error && <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Animal</label>
            <select 
              required
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 py-2 border px-3" 
              value={formData.animal_id}
              onChange={e => setFormData({...formData, animal_id: e.target.value})}
            >
              <option value="">Seleccione Caravana...</option>
              {animals.map(a => (
                <option key={a.id} value={a.id}>
                  {a.tag_id} - {a.category} 
                  {a.status === 'quarantine' ? ' (En cuarentena)' : ''}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Medicamento</label>
            <select 
              required
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 py-2 border px-3" 
              value={formData.medicine_id}
              onChange={e => setFormData({...formData, medicine_id: e.target.value})}
            >
              <option value="">Seleccione Producto...</option>
              {medicines.map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m.withdrawal_days}d carencia)</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <input 
                required
                type="date"
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 py-2 border px-3 text-sm"
                value={formData.application_date}
                onChange={e => setFormData({...formData, application_date: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dosis (ej: 5ml)</label>
              <input 
                required
                type="text" 
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 py-2 border px-3"
                value={formData.dose}
                onChange={e => setFormData({...formData, dose: e.target.value})}
              />
            </div>
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
              {loading ? 'Guardando...' : 'Aplicar Tratamiento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SanitaryRecordsPage = () => {
  const dispatch = useDispatch();
  const { records, loading } = useSelector((state) => state.sanitaryRecords);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchRecords());
  }, [dispatch]);

  const handleDelete = async (record) => {
    if (window.confirm(`¿Estás seguro que deseas eliminar el tratamiento cargado al animal ${record.animal?.tag_id}?`)) {
      try {
        await dispatch(deleteRecord(record.id)).unwrap();
      } catch (err) {
        alert(err || 'No se pudo eliminar el registro');
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in relative z-10 p-2 sm:p-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Registros Sanitarios</h1>
          <p className="text-gray-500 mt-1">Historial de tratamientos y trazabilidad</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          <FiPlus className="mr-2 h-5 w-5" />
          Nuevo Tratamiento
        </button>
      </div>

      <RecordFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      <div className="space-y-4">
        {loading && records.length === 0 && <div className="py-10 text-center">Cargando historiales...</div>}
        {!loading && records.length === 0 && (
          <div className="glass-card p-8 text-center text-gray-500 border-dashed">
            No hay tratamientos registrados.
          </div>
        )}

        {records.map(record => (
          <div key={record.id} className="glass-card p-5 group flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h4 className="text-lg font-bold text-gray-900">Caravana: {record.animal?.tag_id}</h4>
                <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                  {record.application_date}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                <div className="flex items-start gap-2">
                  <FiHeart className="text-brand-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-gray-700">
                    <strong>Medicamento:</strong> {record.medicine?.name} <span className="text-gray-500">[{record.dose}]</span>
                  </span>
                </div>
              </div>

              {/* Progress Bar Module */}
              {(() => {
                const appDate = new Date(record.application_date);
                const relDate = new Date(record.release_date);
                const today = new Date();
                
                const totalDays = Math.ceil((relDate - appDate) / (1000 * 60 * 60 * 24));
                const daysPassed = Math.ceil((today - appDate) / (1000 * 60 * 60 * 24));
                const remainingDays = totalDays - daysPassed;
                
                let progress = 0;
                let statusText = "";
                let progressColor = "bg-brand-500";
                
                if (today >= relDate || totalDays <= 0) {
                  progress = 100;
                  statusText = "Completado / Liberado";
                  progressColor = "bg-emerald-500";
                } else if (today <= appDate) {
                  progress = 0;
                  statusText = `Faltan ${totalDays} días`;
                  progressColor = "bg-red-500";
                } else {
                  progress = (daysPassed / totalDays) * 100;
                  statusText = `Faltan ${remainingDays} días`;
                  progressColor = remainingDays <= 2 ? "bg-amber-500" : "bg-red-500";
                }

                return (
                  <div className="mt-4 bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <div className="flex justify-between items-center mb-1 text-xs">
                      <span className="font-semibold text-gray-600">Progreso de Carencia</span>
                      <span className="font-bold text-gray-900">{statusText}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className={`h-2.5 rounded-full ${progressColor} transition-all duration-1000 ease-out`} 
                        style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="flex flex-col md:items-end justify-between mt-4 md:mt-0 md:border-l md:border-gray-200 md:pl-6 shrink-0 h-full gap-4">
              <div className="text-left md:text-right">
                <span className="block text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">
                  Fecha Liberación
                </span>
                <div className="flex items-center md:justify-end gap-2 text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
                  <FiShield className="shrink-0" />
                  <span className="font-extrabold text-lg tracking-tight">{record.release_date}</span>
                </div>
              </div>
              <button 
                onClick={() => handleDelete(record)}
                className="mt-auto self-start md:self-end flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-red-600 transition-colors p-3 md:px-2 md:py-1 rounded hover:bg-gray-50 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300"
              >
                <Trash2 size={18} className="md:w-3.5 md:h-3.5" /> Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SanitaryRecordsPage;
