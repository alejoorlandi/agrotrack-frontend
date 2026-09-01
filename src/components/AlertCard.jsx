import React from 'react';
import { FiClock, FiShield } from 'react-icons/fi';

export const AlertCard = ({ record }) => {
  return (
    <div className="glass-card !border-red-200/50 bg-red-50/70 p-4 hover:bg-red-50 flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 mb-2 border border-red-200">
            <FiClock className="h-3 w-3" /> Sale de Carencia en {'<'} 48h
          </span>
          <h4 className="text-lg font-bold text-red-900">
            Caravana: {record.animal?.tag_id}
          </h4>
        </div>
        <div className="text-right">
          <span className="block text-xs text-red-600 font-medium">Liberación</span>
          <span className="text-sm font-bold text-red-900">{record.release_date}</span>
        </div>
      </div>
      
      <div className="bg-white/60 rounded-lg p-3 text-sm flex items-start gap-3 mt-1 shadow-sm">
        <FiShield className="text-red-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-gray-900">{record.medicine?.name}</p>
          <p className="text-gray-600 text-xs mt-0.5">Aplicado: {record.application_date} • Dosis: {record.dose}</p>
        </div>
      </div>
    </div>
  );
};
