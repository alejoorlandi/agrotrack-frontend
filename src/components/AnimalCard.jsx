import React from 'react';
import { FiCheckCircle, FiAlertTriangle, FiActivity } from 'react-icons/fi';
import { Edit2, Trash2 } from 'lucide-react';

const statusConfig = {
  healthy: {
    color: 'emerald',
    icon: <FiCheckCircle className="text-emerald-500" />,
    label: 'Sano'
  },
  in_treatment: {
    color: 'amber',
    icon: <FiActivity className="text-amber-500" />,
    label: 'En Tratamiento'
  },
  quarantine: {
    color: 'red',
    icon: <FiAlertTriangle className="text-red-500" />,
    label: 'Cuarentena'
  }
};

export const AnimalCard = ({ animal, onEdit, onDelete }) => {
  const config = statusConfig[animal.status];

  return (
    <div className={`glass-card p-4 flex flex-col gap-3 group lg:hidden`}>
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Caravana</span>
          <h3 className="text-xl font-bold text-gray-900">{animal.tag_id}</h3>
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-${config.color}-50 border border-${config.color}-100`}>
          {config.icon}
          <span className={`text-sm font-medium text-${config.color}-700`}>{config.label}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mt-2 pt-3 border-t border-gray-100">
        <div>
          <span className="text-xs text-gray-500 mb-1 block">Categoría</span>
          <span className="text-sm font-medium text-gray-900">{animal.category}</span>
        </div>
        <div>
          <span className="text-xs text-gray-500 mb-1 block">Peso</span>
          <span className="text-sm font-medium text-gray-900">{animal.weight} kg</span>
        </div>
      </div>

      <div className="flex gap-2 justify-end border-t border-gray-100/50 pt-3 mt-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300">
        <button 
          onClick={() => onEdit(animal)}
          className="flex items-center justify-center gap-1.5 p-3 lg:px-3 lg:py-1.5 bg-gray-50/50 text-gray-600 rounded-lg border border-gray-200/50 text-sm font-medium hover:bg-white hover:text-brand-600 transition-colors flex-1"
        >
          <Edit2 size={20} className="lg:w-4 lg:h-4" /> Editar
        </button>
        <button 
          onClick={() => onDelete(animal)}
          className="flex items-center justify-center gap-1.5 p-3 lg:px-3 lg:py-1.5 bg-red-50/50 text-red-600 rounded-lg border border-red-100/50 text-sm font-medium hover:bg-red-100 transition-colors flex-1"
        >
          <Trash2 size={20} className="lg:w-4 lg:h-4" /> Eliminar
        </button>
      </div>
    </div>
  );
};
