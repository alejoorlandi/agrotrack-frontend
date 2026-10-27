import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAnimals, deleteAnimal, updateAnimal } from '../store/animalSlice';
import { fetchDashboardAlerts } from '../store/alertSlice';
import { AnimalCard } from '../components/AnimalCard';
import { AnimalTable } from '../components/AnimalTable';
import { AlertCard } from '../components/AlertCard';
import { FiCheckCircle, FiRefreshCw, FiDownload, FiX } from 'react-icons/fi';
import { ShieldCheck, Stethoscope, AlertCircle, PieChart as PieChartIcon } from 'lucide-react';
import { useCountUp } from '../hooks/useCountUp';
import api from '../services/api';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

// â”€â”€â”€ Paleta verde/emerald armÃ³nica para el grÃ¡fico â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const PIE_COLORS = [
  '#10B981', // emerald-500
  '#059669', // emerald-600
  '#047857', // emerald-700
  '#34D399', // emerald-400
  '#6EE7B7', // emerald-300
  '#A7F3D0', // emerald-200
  '#065F46', // emerald-800
  '#D1FAE5', // emerald-100
];

const CowIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 10c0-3.3 2.7-6 6-6h6c3.3 0 6 2.7 6 6v0a2 2 0 0 1-2 2h-1c0 3.3-2.7 6-6 6H9c-3.3 0-6-2.7-6-6H2a2 2 0 0 1-2-2z"/>
    <path d="M7 18v3"/>
    <path d="M17 18v3"/>
    <circle cx="8" cy="9" r="1"/>
    <circle cx="16" cy="9" r="1"/>
    <path d="M10 14h4"/>
  </svg>
);

const StatSkeleton = () => (
  <div className="glass-card animate-pulse">
    <div className="p-5 flex items-center gap-4">
      <div className="p-4 rounded-2xl bg-gray-200 h-16 w-16"></div>
      <div className="space-y-2 flex-1">
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-8 bg-gray-200 rounded w-1/3 mt-1"></div>
      </div>
    </div>
  </div>
);

const StatWidget = ({ title, value, icon, color, bgColor }) => {
  const animatedValue = useCountUp(value, 1500);
  return (
    <div className="glass-card">
      <div className="p-5 flex items-center gap-4">
        <div className={`p-4 rounded-2xl ${bgColor} text-${color}-600 shadow-inner ring-1 ring-${color}-500/20`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
          <p className="mt-1 text-4xl font-black text-gray-800 tracking-tight">{animatedValue}</p>
        </div>
      </div>
    </div>
  );
};

// â”€â”€â”€ Tooltip personalizado del Pie Chart â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const CustomPieTooltip = ({ active, payload, total }) => {
  if (active && payload && payload.length) {
    const { nombre, cantidad } = payload[0].payload;
    const pct = total > 0 ? ((cantidad / total) * 100).toFixed(1) : 0;
    return (
      <div className="bg-white/90 backdrop-blur-sm border border-emerald-100 shadow-xl rounded-xl px-4 py-3 text-sm">
        <p className="font-bold text-emerald-800">{nombre}</p>
        <p className="text-gray-600 mt-0.5">
          <span className="font-semibold text-gray-800">{cantidad}</span> animales
        </p>
        <p className="text-emerald-600 font-semibold">{pct}% del total</p>
      </div>
    );
  }
  return null;
};

// â”€â”€â”€ Leyenda personalizada â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const CustomLegend = ({ payload, total }) => (
  <ul className="flex flex-col gap-1.5 mt-2 pl-2">
    {payload.map((entry, i) => {
      const pct = total > 0 ? ((entry.payload.cantidad / total) * 100).toFixed(1) : 0;
      return (
        <li key={i} className="flex items-center gap-2 text-xs">
          <span
            className="inline-block w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-700 font-medium truncate max-w-[110px]" title={entry.value}>
            {entry.value}
          </span>
          <span className="ml-auto text-gray-500 font-semibold">{pct}%</span>
        </li>
      );
    })}
  </ul>
);

// â”€â”€â”€ Tarjeta Pie Chart â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const CategoryPieChart = ({ categorias, loading }) => {
  const total = categorias.reduce((sum, c) => sum + c.cantidad, 0);

  return (
    <div className="glass-card p-5 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="p-2 bg-emerald-100/80 rounded-lg text-emerald-600 shadow-inner">
          <PieChartIcon size={20} />
        </span>
        <div>
          <h2 className="text-base font-bold text-gray-900 leading-tight">Distribución por Categorías</h2>
          <p className="text-xs text-gray-500 font-medium">
            {total > 0 ? `${total} animales en total` : 'Sin datos'}
          </p>
        </div>
      </div>

      {/* Body */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center min-h-[220px]">
          <FiRefreshCw className="animate-spin h-8 w-8 text-emerald-400" />
        </div>
      ) : categorias.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[220px] gap-3">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center shadow-inner">
            <PieChartIcon className="h-8 w-8 text-emerald-300" />
          </div>
          <p className="text-gray-500 font-semibold text-sm text-center">
            No hay animales registrados
          </p>
          <p className="text-gray-400 text-xs text-center max-w-[180px]">
            Registrá animales para ver la distribución por categoría aquí.
          </p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col mt-4 pt-4">
          <ResponsiveContainer width="100%" height={220} style={{ border: 'none', outline: 'none' }}>
            <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }} style={{ border: 'none', outline: 'none' }}>
              <Pie
                data={categorias}
                dataKey="cantidad"
                nameKey="nombre"
                cx="50%"
                cy="52%"
                innerRadius={50}
                outerRadius={85}
                paddingAngle={3}
                stroke="none"
              >
                {categorias.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                    className="transition-opacity hover:opacity-80 cursor-pointer"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip total={total} />} />
              <Legend
                content={<CustomLegend total={total} />}
                verticalAlign="bottom"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

const DashboardEditModal = ({ isOpen, onClose, onSuccess, initialData }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({ tag_id: '', category: '', weight: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        tag_id: initialData.tag_id,
        category: initialData.category,
        weight: initialData.weight,
      });
    }
  }, [isOpen, initialData]);

  if (!isOpen || !initialData) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await dispatch(updateAnimal({
        id: initialData.id,
        data: { ...formData, weight: parseFloat(formData.weight) }
      })).unwrap();
      onSuccess();
      onClose();
    } catch (err) {
      setError(err?.message || 'Error al actualizar el animal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500/20 backdrop-blur-sm flex items-center justify-center sm:p-4 z-50 transition-opacity">
      <div className="glass-card max-w-md w-full h-full sm:h-auto overflow-y-auto border-white/80 shadow-xl flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-200/50">
          <h3 className="text-lg font-bold text-gray-900">Editar Animal</h3>
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
                required type="text"
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 py-2 border px-3"
                value={formData.tag_id}
                onChange={e => setFormData({...formData, tag_id: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CategorÃ­a / Especie</label>
              <select
                required
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 py-2 border px-3 bg-white"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                <option value="" disabled>-- Seleccionar categorÃ­a --</option>
                <option value="Novillo">Novillo</option>
                <option value="Vaca">Vaca</option>
                <option value="Ternero">Ternero</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label>
              <input
                required type="number" step="0.01" min="0"
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 py-2 border px-3"
                value={formData.weight}
                onChange={e => setFormData({...formData, weight: e.target.value})}
              />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3 pb-8 sm:pb-0">
            <button type="button" onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 ${loading ? 'opacity-70' : ''}`}>
              {loading ? 'Guardando...' : 'Actualizar Animal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { animals, stats, loading: animalsLoading } = useSelector((state) => state.animals);
  const { alertsData, loading: alertsLoading } = useSelector((state) => state.alerts);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState(null);

  // â”€â”€ Pie Chart state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [categorias, setCategorias] = useState([]);
  const [statsLoading, setStatsLoading] = useState(false);

  const fetchCategoryStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await api.get('/dashboard/stats');
      setCategorias(res.data?.data?.categorias ?? []);
    } catch (err) {
      console.error('[Dashboard] Error fetching category stats:', err);
      setCategorias([]);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    dispatch(fetchAnimals());
    dispatch(fetchDashboardAlerts());
    fetchCategoryStats();
  }, [dispatch, fetchCategoryStats]);

  const isLoading = animalsLoading || alertsLoading;

  const handleEdit = (animal) => {
    setSelectedAnimal(animal);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (animal) => {
    if (window.confirm(`Â¿EstÃ¡s seguro que deseas eliminar la caravana ${animal.tag_id}?`)) {
      try {
        await dispatch(deleteAnimal(animal.id)).unwrap();
        fetchCategoryStats(); // Refresh pie chart after delete
      } catch (err) {
        alert(err);
      }
    }
  };

  const handleEditSuccess = () => {
    dispatch(fetchAnimals());
    fetchCategoryStats(); // Refresh pie chart after edit
  };

  const handleExportSales = () => {
    const saleableAnimals = animals.filter(a => a.status === 'healthy');
    if (saleableAnimals.length === 0) {
      alert("No hay animales sanos para vender.");
      return;
    }
    
    // Create CSV content
    const headers = "Caravana,Categoria,Peso(kg)\n";
    const csvContent = saleableAnimals.map(a => `${a.tag_id},${a.category},${a.weight}`).join("\n");
    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Download logic
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `lista_venta_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-fade-in relative z-10 p-2 sm:p-0">
      {/* Header section */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 glass-card p-6">
        <div>
          <h1 className="text-4xl font-black text-emerald-900 tracking-tight">AgroTrack Overview</h1>
          <p className="text-emerald-700/80 mt-1 font-medium text-lg">Resumen de capacidad y sanidad animal</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => {
              dispatch(fetchAnimals());
              dispatch(fetchDashboardAlerts());
              fetchCategoryStats();
            }}
            disabled={isLoading}
            className="inline-flex items-center justify-center px-4 py-2.5 border border-brand-200 shadow-sm text-sm font-bold rounded-xl text-brand-700 bg-brand-50 hover:bg-brand-100 focus:outline-none transition-colors"
          >
            <FiRefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin text-brand-600' : 'text-brand-600'}`} />
            {isLoading ? 'Actualizando...' : 'Actualizar Datos'}
          </button>
          <button 
            onClick={handleExportSales}
            className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent shadow-[0_8px_16px_-4px_rgba(16,185,129,0.4)] text-sm font-bold rounded-xl text-white bg-emerald-500 hover:bg-emerald-400 transition-all focus:outline-none hover:-translate-y-0.5"
          >
            <FiDownload className="mr-2 h-5 w-5" />
            Exportar Lista de Venta
          </button>
        </div>
      </div>

      {/* Analytics Widgets */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </>
        ) : (
          <>
            <StatWidget 
              title="Total Animales" 
              value={stats.total} 
              icon={<CowIcon className="h-7 w-7" />} 
              color="emerald" bgColor="bg-emerald-100" 
            />
            <StatWidget 
              title="Sanos" 
              value={stats.healthy} 
              icon={<ShieldCheck className="h-7 w-7" />} 
              color="brand" bgColor="bg-brand-100" 
            />
            <StatWidget 
              title="En Tratamiento" 
              value={stats.in_treatment} 
              icon={<Stethoscope className="h-7 w-7" />} 
              color="amber" bgColor="bg-amber-100" 
            />
            <StatWidget 
              title="En Cuarentena" 
              value={stats.quarantine} 
              icon={<AlertCircle className="h-7 w-7" />} 
              color="red" bgColor="bg-red-100" 
            />
          </>
        )}
      </div>

      {/* Main content grid: Table + Sidebar (Alerts + Pie Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Area - Animals List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pointer-events-none mb-2">
            <h2 className="text-xl font-bold text-gray-800 glass-card px-5 py-2 inline-block">Top de Hacienda</h2>
          </div>
          
          {/* Mobile view (Cards) */}
          <div className="flex flex-col gap-4 lg:hidden">
            {isLoading ? (
              <div className="glass-card p-6 min-h-[300px] flex items-center justify-center">
                <FiRefreshCw className="animate-spin h-8 w-8 text-emerald-500" />
              </div>
            ) : animals.length > 0 ? (
              animals.slice(0, 5).map(animal => <AnimalCard key={animal.id} animal={animal} onEdit={handleEdit} onDelete={handleDelete} />)
            ) : (
              <div className="glass-card p-8 text-center text-gray-500 border-dashed">
                No hay animales registrados en el sistema.
              </div>
            )}
          </div>

          {/* Desktop view (Table) */}
          <div className="hidden lg:block">
            {isLoading ? (
              <div className="glass-card p-20 flex flex-col items-center justify-center">
                <FiRefreshCw className="animate-spin h-10 w-10 text-emerald-500 mb-4" />
                <span className="text-gray-500 font-medium">Buscando datos de la hacienda...</span>
              </div>
            ) : (
              <AnimalTable animals={animals.slice(0, 8)} onEdit={handleEdit} onDelete={handleDelete} />
            )}
          </div>
        </div>

        {/* Sidebar - Alerts + Pie Chart */}
        <div className="space-y-4 lg:pl-4">
          {/* Alerts */}
          <div className="flex items-center justify-between glass-card p-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="p-2 bg-red-100/80 rounded-lg text-red-600 shadow-inner"><AlertCircle size={20} /></span>
              Alertas 48h
            </h2>
            {alertsData.total > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                {alertsData.total}
              </span>
            )}
          </div>
          
          <div className="flex flex-col gap-4">
            {isLoading ? (
               <div className="glass-card p-8 flex items-center justify-center min-h-[200px]">
                 <FiRefreshCw className="animate-spin h-6 w-6 text-emerald-500 text-opacity-50" />
               </div>
            ) : alertsData.alerts?.length > 0 ? (
              alertsData.alerts.map(record => <AlertCard key={record.id} record={record} />)
            ) : (
              <div className="glass-card p-8 text-center bg-emerald-50/40">
                <div className="mx-auto w-16 h-16 bg-emerald-100/80 rounded-full flex items-center justify-center mb-4 shadow-inner">
                  <ShieldCheck className="h-8 w-8 text-emerald-600" />
                </div>
                <p className="text-emerald-800 font-bold text-lg">Todo en orden</p>
                <p className="text-emerald-700/70 font-medium text-sm mt-1">No hay animales saliendo de carencia hoy.</p>
              </div>
            )}
          </div>

          {/* â”€â”€ Pie Chart Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <CategoryPieChart categorias={categorias} loading={statsLoading} />
        </div>

      </div>

      <DashboardEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
        initialData={selectedAnimal}
      />
    </div>
  );
};

export default DashboardPage;
