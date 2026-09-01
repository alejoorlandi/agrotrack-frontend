import React from 'react';
import { FiCheckCircle, FiAlertTriangle, FiActivity } from 'react-icons/fi';
import { Edit2, Trash2 } from 'lucide-react';

const statusConfig = {
  healthy: {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: <FiCheckCircle className="text-emerald-500 mr-1.5 h-4 w-4" />,
    label: 'Sano'
  },
  in_treatment: {
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: <FiActivity className="text-amber-500 mr-1.5 h-4 w-4" />,
    label: 'En Tratamiento'
  },
  quarantine: {
    badge: 'bg-red-50 text-red-700 border-red-200',
    icon: <FiAlertTriangle className="text-red-500 mr-1.5 h-4 w-4" />,
    label: 'Cuarentena'
  }
};

export const AnimalTable = ({ animals, onEdit, onDelete }) => {
  return (
    <div className="hidden lg:block overflow-hidden glass-card">
      <table className="min-w-full divide-y divide-gray-200/50 bg-transparent">
        <thead className="bg-gray-50/50 backdrop-blur-md">
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
              Caravana / Tag ID
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Categoría
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Peso (kg)
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Estado Sanitario
            </th>
            <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 pr-6">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200/50 bg-transparent">
          {animals.map((animal) => {
            const config = statusConfig[animal.status];
            
            return (
              <tr key={animal.id} className="table-row-hover group">
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                  {animal.tag_id}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {animal.category}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 font-medium">
                  {animal.weight}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm">
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${config.badge}`}>
                    {config.icon}
                    {config.label}
                  </span>
                </td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button 
                      onClick={() => onEdit(animal)}
                      className="text-gray-400 hover:text-brand-600 transition-transform hover:scale-110"
                      title="Editar"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => onDelete(animal)}
                      className="text-gray-400 hover:text-red-600 transition-transform hover:scale-110"
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
          {animals.length === 0 && (
            <tr>
              <td colSpan="5" className="py-10 text-center text-sm text-gray-500">
                No hay animales registrados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
