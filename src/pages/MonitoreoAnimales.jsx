import React, { useEffect, useState, useRef } from 'react';
import { FiRefreshCw, FiX, FiActivity, FiLayers, FiShield, FiAlertTriangle, FiPlusCircle, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { HeartPulse, Scale, Tag, Calendar, ShieldAlert } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';
import api from '../services/api';

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

export default function MonitoreoAnimales() {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Traceability states (replaces old timeline states)
  const [traceabilityData, setTraceabilityData] = useState(null);
  const [loadingTraceability, setLoadingTraceability] = useState(false);
  const [errorTraceability, setErrorTraceability] = useState(null);
  const [changingStatus, setChangingStatus] = useState(false);

  const pollingRef = useRef(null);

  // Function to load animals
  const loadAnimals = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    
    try {
      const response = await api.get('/animals');
      const data = response.data.data || [];
      setAnimals(data);
      setLastUpdated(new Date().toLocaleTimeString());
      setError(null);

      // If there is an active selected animal, update its reference in real-time
      if (selectedAnimal) {
        const updated = data.find(a => a.id === selectedAnimal.id);
        if (updated) {
          setSelectedAnimal(updated);
        }
      }
    } catch (err) {
      console.error('Error fetching animals for animales:', err);
      setError(err?.response?.data?.message || 'No se pudo cargar la hacienda en tiempo real.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Poll effect for animal dashboard
  useEffect(() => {
    loadAnimals();

    if (autoRefresh) {
      pollingRef.current = setInterval(() => {
        loadAnimals(true);
      }, 5000);
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [autoRefresh]);

  // Load traceability data whenever the selected animal changes
  useEffect(() => {
    if (selectedAnimal?.id) {
      const fetchTraceability = async () => {
        setLoadingTraceability(true);
        setErrorTraceability(null);
        try {
          const response = await api.get(`/animals/${selectedAnimal.id}/traceability`);
          setTraceabilityData(response.data.data || null);
        } catch (err) {
          console.error('Error fetching traceability:', err);
          setErrorTraceability('No se pudieron cargar los datos de trazabilidad.');
        } finally {
          setLoadingTraceability(false);
        }
      };

      fetchTraceability();
    } else {
      setTraceabilityData(null);
    }
  }, [selectedAnimal?.id]);

  // Handle click on animal card
  const handleSelectAnimal = (animal) => {
    setSelectedAnimal(animal);
  };

  // Close sidebar details panel
  const handleCloseSidebar = () => {
    setSelectedAnimal(null);
  };

  // Handle manual corral change
  const handleChangeStatus = async (newStatus) => {
    if (!selectedAnimal || changingStatus) return;
    setChangingStatus(true);
    try {
      await api.put(`/animals/${selectedAnimal.id}`, { status: newStatus });
      
      // Update selected animal status locally in sidebar to show immediate changes
      setSelectedAnimal(prev => ({ ...prev, status: newStatus }));
      
      // Reload overall list so it moves columns in the background
      await loadAnimals(true);
    } catch (err) {
      console.error('Error updating animal status:', err);
      alert(err?.response?.data?.message || 'Error al mudar el animal de corral.');
    } finally {
      setChangingStatus(false);
    }
  };

  // Grouping / Classifying animals based on state
  const getAnimalGroup = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'quarantine' || s === 'cuarentena') return 'quarantine';
    if (s === 'in_treatment' || s === 'tratamiento' || s === 'en_tratamiento' || s === 'en tratamiento') return 'in_treatment';
    return 'healthy';
  };

  const healthyAnimals = animals.filter(a => getAnimalGroup(a.status) === 'healthy');
  const treatmentAnimals = animals.filter(a => getAnimalGroup(a.status) === 'in_treatment');
  const quarantineAnimals = animals.filter(a => getAnimalGroup(a.status) === 'quarantine');

  // Translation helpers
  const getStatusBadgeStyle = (status) => {
    const s = getAnimalGroup(status);
    if (s === 'quarantine') return 'bg-rose-50 text-rose-700 border-rose-200/50';
    if (s === 'in_treatment') return 'bg-amber-50 text-amber-700 border-amber-200/50';
    return 'bg-emerald-50 text-emerald-700 border-emerald-200/50';
  };

  const getStatusText = (status) => {
    const s = getAnimalGroup(status);
    if (s === 'quarantine') return 'Cuarentena';
    if (s === 'in_treatment') return 'En Tratamiento';
    return 'Sano (Corral General)';
  };

  // --- Helpers for traceability panel ---

  // Prepare chart data from weightHistory
  const getChartData = () => {
    if (!traceabilityData?.weightHistory?.length) return [];
    return traceabilityData.weightHistory.map(w => ({
      date: new Date(w.recorded_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' }),
      fullDate: new Date(w.recorded_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }),
      weight: w.weight,
    }));
  };

  // Detect weight loss anomaly (last record < previous)
  const getWeightAnomaly = () => {
    if (!traceabilityData?.weightHistory?.length || traceabilityData.weightHistory.length < 2) return null;
    const history = traceabilityData.weightHistory;
    const last = history[history.length - 1];
    const prev = history[history.length - 2];
    if (last.weight < prev.weight) {
      return {
        lost: (prev.weight - last.weight).toFixed(1),
        from: prev.weight,
        to: last.weight,
      };
    }
    return null;
  };

  // Build unified timeline combining weight records + sanitary records
  const getUnifiedTimeline = () => {
    if (!traceabilityData) return [];

    const items = [];

    // Add weight records
    (traceabilityData.weightHistory || []).forEach((w, idx, arr) => {
      const prevWeight = idx > 0 ? arr[idx - 1].weight : null;
      const diff = prevWeight !== null ? w.weight - prevWeight : null;
      items.push({
        type: 'weight',
        date: new Date(w.recorded_at),
        weight: w.weight,
        diff,
        isFirst: idx === 0,
      });
    });

    // Add sanitary records
    (traceabilityData.sanitaryRecords || []).forEach(r => {
      items.push({
        type: 'sanitary',
        date: new Date(r.application_date + 'T00:00:00'),
        medicine: r.medicine?.name || 'Fármaco Registrado',
        medicineDesc: r.medicine?.description || '',
        dose: r.dose,
        releaseDate: r.release_date,
        withdrawalDays: r.medicine?.withdrawal_days || 0,
      });
    });

    // Sort chronologically (oldest first)
    items.sort((a, b) => a.date - b.date);
    return items;
  };

  // Custom tooltip for the chart
  const ChartTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl px-3.5 py-2.5 shadow-lg">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{payload[0].payload.fullDate}</p>
          <p className="text-sm font-black text-gray-800 mt-0.5">
            {payload[0].value} <span className="text-xs font-bold text-gray-400">kg</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 relative min-h-[calc(100vh-120px)]">
      {/* Header Widget */}
      <div className="glass-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/95">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <FiActivity className="h-6 w-6 animate-pulse" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Monitoreo de Animales</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Distribución dinámica de hacienda según su estado de salud en tiempo real.
          </p>
        </div>

        {/* Polling control panel */}
        <div className="flex flex-wrap items-center gap-3 self-stretch md:self-auto">
          {/* Live Status indicator */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gray-50 border border-gray-100 text-xs font-semibold text-gray-600 shadow-inner">
            <span className={`relative flex h-2 w-2`}>
              {autoRefresh && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${autoRefresh ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
            </span>
            <span>{autoRefresh ? 'VIVO' : 'PAUSADO'}</span>
            {lastUpdated && <span className="text-gray-400 border-l border-gray-200 pl-2">Sincronizado: {lastUpdated}</span>}
          </div>

          {/* Toggle AutoRefresh */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm border ${
              autoRefresh 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
            }`}
          >
            {autoRefresh ? 'Pausar Refresco' : 'Activar Refresco'}
          </button>

          {/* Manual Refresh button */}
          <button
            disabled={refreshing}
            onClick={() => loadAnimals(true)}
            className="p-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 active:scale-95 transition-all shadow-sm flex items-center justify-center disabled:opacity-50"
            title="Sincronizar ahora"
          >
            <FiRefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-center gap-3">
          <FiAlertTriangle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {loading ? (
        // Grid Loading Skeleton
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="glass-card p-5 animate-pulse bg-white/70 min-h-[400px] flex flex-col">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
              <div className="space-y-3 flex-1">
                <div className="h-12 bg-gray-200 rounded-xl"></div>
                <div className="h-12 bg-gray-200 rounded-xl"></div>
                <div className="h-12 bg-gray-200 rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Animales Columns Grid
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* CORRAL GENERAL (SANOS) */}
          <div className="glass-card border-t-4 border-t-emerald-500 overflow-hidden bg-white/95 flex flex-col min-h-[450px]">
            <div className="p-5 border-b border-gray-100 bg-emerald-50/20">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
                    <FiShield className="h-4 w-4" />
                  </span>
                  <h3 className="font-bold text-gray-800">Corral General</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
                  {healthyAnimals.length} {healthyAnimals.length === 1 ? 'animal' : 'animales'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2 font-medium">
                Sanos y en condiciones óptimas de pastoreo.
              </p>
            </div>
            
            <div className="p-5 flex-1 overflow-y-auto max-h-[500px] space-y-2">
              {healthyAnimals.length === 0 ? (
                <div className="text-center py-12 px-4 flex flex-col items-center justify-center h-full">
                  <CowIcon className="h-12 w-12 text-gray-300" />
                  <p className="text-sm font-semibold text-gray-400 mt-3">Sin animales sanos</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {healthyAnimals.map((animal) => (
                    <button
                      key={animal.id}
                      onClick={() => handleSelectAnimal(animal)}
                      className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all duration-200 active:scale-95 group hover:-translate-y-0.5 hover:shadow-sm ${
                        selectedAnimal?.id === animal.id
                          ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                          : 'bg-white border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/20'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <CowIcon className={`h-6 w-6 transition-colors ${
                          selectedAnimal?.id === animal.id ? 'text-emerald-600' : 'text-emerald-500 group-hover:text-emerald-600'
                        }`} />
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                          Sano
                        </span>
                      </div>
                      <span className="text-xs font-black text-gray-800 mt-2 tracking-wide uppercase">
                        {animal.tag_id}
                      </span>
                      <span className="text-[10px] font-semibold text-gray-400 mt-0.5">
                        {animal.weight} kg • {animal.category}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* EN TRATAMIENTO */}
          <div className="glass-card border-t-4 border-t-amber-500 overflow-hidden bg-white/95 flex flex-col min-h-[450px]">
            <div className="p-5 border-b border-gray-100 bg-amber-50/20">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-amber-100 text-amber-700 rounded-lg">
                    <HeartPulse className="h-4 w-4" />
                  </span>
                  <h3 className="font-bold text-gray-800">En Tratamiento</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-800">
                  {treatmentAnimals.length} {treatmentAnimals.length === 1 ? 'animal' : 'animales'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2 font-medium">
                Bajo seguimiento médico o administración de fármacos.
              </p>
            </div>
            
            <div className="p-5 flex-1 overflow-y-auto max-h-[500px] space-y-2">
              {treatmentAnimals.length === 0 ? (
                <div className="text-center py-12 px-4 flex flex-col items-center justify-center h-full">
                  <CowIcon className="h-12 w-12 text-gray-300" />
                  <p className="text-sm font-semibold text-gray-400 mt-3">Sin animales en tratamiento</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {treatmentAnimals.map((animal) => (
                    <button
                      key={animal.id}
                      onClick={() => handleSelectAnimal(animal)}
                      className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all duration-200 active:scale-95 group hover:-translate-y-0.5 hover:shadow-sm ${
                        selectedAnimal?.id === animal.id
                          ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20'
                          : 'bg-white border-gray-100 hover:border-amber-200 hover:bg-amber-50/20'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <CowIcon className={`h-6 w-6 transition-colors ${
                          selectedAnimal?.id === animal.id ? 'text-amber-600' : 'text-amber-500 group-hover:text-amber-600'
                        }`} />
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded animate-pulse">
                          Trat.
                        </span>
                      </div>
                      <span className="text-xs font-black text-gray-800 mt-2 tracking-wide uppercase">
                        {animal.tag_id}
                      </span>
                      <span className="text-[10px] font-semibold text-gray-400 mt-0.5">
                        {animal.weight} kg • {animal.category}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* CORRAL DE CUARENTENA */}
          <div className="glass-card border-t-4 border-t-rose-500 overflow-hidden bg-white/95 flex flex-col min-h-[450px]">
            <div className="p-5 border-b border-gray-100 bg-rose-50/20">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-rose-100 text-rose-700 rounded-lg">
                    <FiAlertTriangle className="h-4 w-4" />
                  </span>
                  <h3 className="font-bold text-gray-800">Cuarentena</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-100 text-rose-800">
                  {quarantineAnimals.length} {quarantineAnimals.length === 1 ? 'animal' : 'animales'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2 font-medium">
                Aislamiento por periodo de carencia o sospechas de infección.
              </p>
            </div>
            
            <div className="p-5 flex-1 overflow-y-auto max-h-[500px] space-y-2">
              {quarantineAnimals.length === 0 ? (
                <div className="text-center py-12 px-4 flex flex-col items-center justify-center h-full">
                  <CowIcon className="h-12 w-12 text-gray-300" />
                  <p className="text-sm font-semibold text-gray-400 mt-3 font-medium">Sin animales en cuarentena</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {quarantineAnimals.map((animal) => (
                    <button
                      key={animal.id}
                      onClick={() => handleSelectAnimal(animal)}
                      className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all duration-200 active:scale-95 group hover:-translate-y-0.5 hover:shadow-sm ${
                        selectedAnimal?.id === animal.id
                          ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-500/20'
                          : 'bg-white border-gray-100 hover:border-rose-200 hover:bg-rose-50/20'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <CowIcon className={`h-6 w-6 transition-colors ${
                          selectedAnimal?.id === animal.id ? 'text-rose-600' : 'text-rose-500 group-hover:text-rose-600'
                        }`} />
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded animate-pulse">
                          Aislar
                        </span>
                      </div>
                      <span className="text-xs font-black text-gray-800 mt-2 tracking-wide uppercase">
                        {animal.tag_id}
                      </span>
                      <span className="text-[10px] font-semibold text-gray-400 mt-0.5">
                        {animal.weight} kg • {animal.category}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* DETALLES LATERAL PANEL (SIDEBAR DRAWER) */}
      <div 
        className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ${
          selectedAnimal ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop overlay */}
        <div 
          onClick={handleCloseSidebar}
          className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm transition-opacity"
        />

        {/* Sliding Panel */}
        <div 
          className={`relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-gray-100 z-10 transition-transform duration-300 transform ${
            selectedAnimal ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {selectedAnimal && (
            <>
              {/* Drawer Header */}
              <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${
                    getAnimalGroup(selectedAnimal.status) === 'healthy' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                    getAnimalGroup(selectedAnimal.status) === 'in_treatment' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                    'bg-rose-50 border-rose-100 text-rose-600'
                  }`}>
                    <CowIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-wide">
                      {selectedAnimal.tag_id}
                    </h3>
                    <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
                      Detalle del Bovino
                    </p>
                  </div>
                </div>
                <button 
                  onClick={handleCloseSidebar}
                  className="p-2 rounded-lg hover:bg-gray-200/60 active:scale-95 text-gray-400 hover:text-gray-700 transition-all"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Stats quick view Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Category Card */}
                  <div className="p-4 rounded-2xl bg-gray-50/50 border border-gray-100 flex items-center gap-3 shadow-inner">
                    <div className="p-2 rounded-lg bg-white shadow-sm text-gray-600">
                      <Tag className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Categoría</p>
                      <p className="text-sm font-black text-gray-800 mt-0.5">{selectedAnimal.category}</p>
                    </div>
                  </div>

                  {/* Weight Card */}
                  <div className="p-4 rounded-2xl bg-gray-50/50 border border-gray-100 flex items-center gap-3 shadow-inner">
                    <div className="p-2 rounded-lg bg-white shadow-sm text-emerald-600">
                      <Scale className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Peso actual</p>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-sm font-black text-gray-800">{selectedAnimal.weight}</span>
                        <span className="text-[10px] font-bold text-gray-400">kg</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Health Status Block */}
                <div className={`p-4 rounded-2xl border flex items-center gap-4 ${getStatusBadgeStyle(selectedAnimal.status)}`}>
                  <div className="p-2 bg-white rounded-xl shadow-sm">
                    {getAnimalGroup(selectedAnimal.status) === 'healthy' ? (
                      <FiShield className="h-6 w-6" />
                    ) : getAnimalGroup(selectedAnimal.status) === 'in_treatment' ? (
                      <HeartPulse className="h-6 w-6 animate-pulse" />
                    ) : (
                      <FiAlertTriangle className="h-6 w-6 animate-bounce" />
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold opacity-60 uppercase">Estado Sanitario</p>
                    <p className="text-sm font-black mt-0.5">{getStatusText(selectedAnimal.status)}</p>
                  </div>
                </div>

                {/* MUDAR DE ESTADO (STATUS CHANGERS QUICK ACTIONS) */}
                <div className="space-y-3 bg-gray-50/40 p-4 rounded-2xl border border-gray-100 shadow-xs">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200/50">
                    <FiLayers className="h-4 w-4 text-emerald-600" />
                    <h4 className="text-xs font-black text-gray-700 tracking-wide uppercase">
                      Cambiar Estado / Grupo
                    </h4>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {/* Sano Button */}
                    <button
                      disabled={changingStatus}
                      onClick={() => handleChangeStatus('healthy')}
                      className={`py-2 px-1 rounded-xl text-[10px] font-bold border transition-all text-center flex flex-col items-center justify-center gap-1 active:scale-95 cursor-pointer disabled:opacity-50 ${
                        getAnimalGroup(selectedAnimal.status) === 'healthy'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-200'
                          : 'bg-white border-gray-200 text-emerald-700 hover:bg-emerald-50/50 hover:border-emerald-200'
                      }`}
                    >
                      <span className="font-extrabold">General</span>
                      <span className="text-[8px] opacity-75 font-normal">(Sano)</span>
                    </button>

                    {/* En Tratamiento Button */}
                    <button
                      disabled={changingStatus}
                      onClick={() => handleChangeStatus('in_treatment')}
                      className={`py-2 px-1 rounded-xl text-[10px] font-bold border transition-all text-center flex flex-col items-center justify-center gap-1 active:scale-95 cursor-pointer disabled:opacity-50 ${
                        getAnimalGroup(selectedAnimal.status) === 'in_treatment'
                          ? 'bg-amber-500 text-white border-amber-500 shadow-sm shadow-amber-200'
                          : 'bg-white border-gray-200 text-amber-700 hover:bg-amber-50/50 hover:border-amber-200'
                      }`}
                    >
                      <span className="font-extrabold">Tratamiento</span>
                      <span className="text-[8px] opacity-75 font-normal">(Fármacos)</span>
                    </button>

                    {/* Cuarentena Button */}
                    <button
                      disabled={changingStatus}
                      onClick={() => handleChangeStatus('quarantine')}
                      className={`py-2 px-1 rounded-xl text-[10px] font-bold border transition-all text-center flex flex-col items-center justify-center gap-1 active:scale-95 cursor-pointer disabled:opacity-50 ${
                        getAnimalGroup(selectedAnimal.status) === 'quarantine'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-sm shadow-rose-200'
                          : 'bg-white border-gray-200 text-rose-700 hover:bg-rose-50/50 hover:border-rose-200'
                      }`}
                    >
                      <span className="font-extrabold">Cuarentena</span>
                      <span className="text-[8px] opacity-75 font-normal">(Aislado)</span>
                    </button>
                  </div>
                </div>

                {/* WEIGHT EVOLUTION CHART */}
                {loadingTraceability ? (
                  <div className="space-y-3 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-[180px] bg-gray-100 rounded-2xl"></div>
                  </div>
                ) : traceabilityData && getChartData().length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                      <FiTrendingUp className="h-4 w-4 text-emerald-600" />
                      <h4 className="text-xs font-black text-gray-700 tracking-wide uppercase">
                        Evolución de Peso
                      </h4>
                    </div>

                    {/* Anomaly Alert */}
                    {getWeightAnomaly() && (
                      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-200/60">
                        <div className="p-1.5 bg-rose-100 rounded-lg flex-shrink-0 mt-0.5">
                          <FiAlertTriangle className="h-4 w-4 text-rose-600" />
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-rose-700 uppercase tracking-wide">
                            Anomalía detectada
                          </p>
                          <p className="text-[11px] text-rose-600/80 mt-0.5 font-medium leading-relaxed">
                            Pérdida de peso registrada ({getWeightAnomaly().lost} kg). Posible problema sanitario.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4">
                      <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={getChartData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis 
                            dataKey="date" 
                            tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 600 }} 
                            axisLine={{ stroke: '#e5e7eb' }}
                            tickLine={false}
                          />
                          <YAxis 
                            tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 600 }} 
                            axisLine={{ stroke: '#e5e7eb' }}
                            tickLine={false}
                            unit=" kg"
                          />
                          <Tooltip content={<ChartTooltip />} />
                          <Line 
                            type="monotone" 
                            dataKey="weight" 
                            stroke="#10b981" 
                            strokeWidth={2.5}
                            dot={{ r: 4, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                            activeDot={{ r: 6, fill: '#059669', stroke: '#fff', strokeWidth: 2 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* UNIFIED TRACEABILITY TIMELINE */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                    <Calendar className="h-4 w-4 text-emerald-600" />
                    <h4 className="text-xs font-black text-gray-700 tracking-wide uppercase">
                      Historial de Trazabilidad
                    </h4>
                  </div>

                  {loadingTraceability ? (
                    // Timeline Loader
                    <div className="space-y-4 py-4">
                      {[1, 2].map((n) => (
                        <div key={n} className="flex gap-4 animate-pulse">
                          <div className="rounded-full bg-gray-200 h-3.5 w-3.5 mt-1.5 flex-shrink-0"></div>
                          <div className="space-y-2 flex-1">
                            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : errorTraceability ? (
                    <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs font-semibold">
                      {errorTraceability}
                    </div>
                  ) : getUnifiedTimeline().length === 0 ? (
                    <div className="text-center py-10 px-4 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200/80 flex flex-col items-center">
                      <ShieldAlert className="h-8 w-8 text-gray-300" />
                      <p className="text-xs font-bold text-gray-400 mt-2">
                        Sin registros de trazabilidad
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5 font-medium max-w-[220px] leading-relaxed">
                        Este animal no tiene pesajes ni intervenciones farmacológicas registradas.
                      </p>
                    </div>
                  ) : (
                    // Unified Vertical Timeline
                    <div className="relative border-l-2 border-emerald-100 ml-3 pl-5 space-y-5 py-2">
                      {getUnifiedTimeline().map((item, idx) => {
                        const formattedDate = item.date.toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        });

                        if (item.type === 'weight') {
                          return (
                            <div key={`w-${idx}`} className="relative group">
                              {/* Circle Node - Blue for weight */}
                              <span className="absolute -left-[27px] top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-blue-500 border-2 border-white shadow-sm transition-transform group-hover:scale-125 duration-200"></span>
                              
                              <div className="bg-blue-50/30 hover:bg-blue-50/60 border border-blue-100/60 hover:border-blue-200/60 p-3.5 rounded-xl shadow-xs transition-all duration-300">
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="text-[9px] font-black text-blue-700 bg-blue-50 border border-blue-100/50 px-2 py-0.5 rounded-md">
                                    {formattedDate}
                                  </span>
                                  {item.isFirst ? (
                                    <span className="text-[9px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                                      Peso inicial
                                    </span>
                                  ) : item.diff !== null && (
                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-0.5 ${
                                      item.diff >= 0 
                                        ? 'text-emerald-700 bg-emerald-50 border border-emerald-100/50' 
                                        : 'text-rose-700 bg-rose-50 border border-rose-100/50'
                                    }`}>
                                      {item.diff >= 0 ? (
                                        <FiTrendingUp className="h-3 w-3" />
                                      ) : (
                                        <FiTrendingDown className="h-3 w-3" />
                                      )}
                                      {item.diff >= 0 ? '+' : ''}{item.diff.toFixed(1)} kg
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Scale className="h-4 w-4 text-blue-500" />
                                  <h5 className="text-xs font-black text-gray-800 leading-tight">
                                    Pesaje: <span className="text-blue-700">{item.weight} kg</span>
                                  </h5>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        // Sanitary record
                        const formattedRelease = item.releaseDate
                          ? new Date(item.releaseDate + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
                          : null;

                        return (
                          <div key={`s-${idx}`} className="relative group">
                            {/* Circle Node - Emerald for sanitary */}
                            <span className="absolute -left-[27px] top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 border-2 border-white shadow-sm transition-transform group-hover:scale-125 duration-200"></span>
                            
                            <div className="bg-gray-50/60 hover:bg-emerald-50/10 border border-gray-100 hover:border-emerald-100/60 p-3.5 rounded-xl shadow-xs transition-all duration-300">
                              <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100/50 px-2 py-0.5 rounded-md inline-block mb-2">
                                {formattedDate}
                              </span>
                              <div className="flex items-center gap-2">
                                <HeartPulse className="h-4 w-4 text-emerald-500" />
                                <h5 className="text-xs font-black text-gray-800 leading-tight">
                                  Vacunación: {item.medicine}
                                </h5>
                              </div>
                              {item.medicineDesc && (
                                <p className="text-[11px] text-gray-500 mt-1 font-medium leading-relaxed">
                                  {item.medicineDesc}
                                </p>
                              )}
                              <div className="mt-2.5 pt-2 border-t border-gray-200/40 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                <span className="flex items-center gap-1 font-extrabold text-gray-500">
                                  Dosis: <strong className="text-gray-700 font-black">{item.dose}</strong>
                                </span>
                                {item.withdrawalDays > 0 && (
                                  <span className="flex items-center gap-1 text-amber-600">
                                    Carencia: <strong className="text-amber-700 font-black">{item.withdrawalDays} días</strong>
                                  </span>
                                )}
                                {formattedRelease && (
                                  <span className="flex items-center gap-1 text-rose-600">
                                    Fin: <strong className="text-rose-700 font-black">{formattedRelease}</strong>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>

              {/* Drawer Footer Actions */}
              <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
                <button
                  onClick={handleCloseSidebar}
                  className="flex-1 py-3 px-4 rounded-xl border border-gray-200 bg-white text-gray-700 font-bold hover:bg-gray-50 active:scale-95 text-xs tracking-wider uppercase transition-all shadow-sm"
                >
                  Cerrar Detalles
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
