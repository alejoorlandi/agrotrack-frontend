import { FiAlertTriangle, FiX } from 'react-icons/fi';

/**
 * ConfirmDialog — Modal de confirmación reutilizable.
 *
 * Props:
 *   isOpen    {boolean}   - Controla visibilidad
 *   title     {string}    - Título del modal
 *   message   {string}    - Mensaje descriptivo
 *   onConfirm {function}  - Callback al confirmar
 *   onCancel  {function}  - Callback al cancelar
 *   danger    {boolean}   - Si true, botón confirmar es rojo
 *   loading   {boolean}   - Estado de carga del botón confirmar
 */
const ConfirmDialog = ({
  isOpen,
  title = '¿Estás seguro?',
  message,
  onConfirm,
  onCancel,
  danger = true,
  loading = false,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="glass-card max-w-md w-full border-white/80 shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="flex items-start gap-4 p-6 border-b border-gray-200/50">
          <div className={`flex-shrink-0 p-2.5 rounded-xl ${danger ? 'bg-red-100' : 'bg-amber-100'}`}>
            <FiAlertTriangle className={`h-6 w-6 ${danger ? 'text-red-600' : 'text-amber-600'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            {message && <p className="mt-1 text-sm text-gray-600">{message}</p>}
          </div>
          <button
            onClick={onCancel}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-5 py-2 text-sm font-bold text-white rounded-xl transition-all hover:-translate-y-px shadow-md disabled:opacity-60 disabled:cursor-not-allowed ${
              danger
                ? 'bg-red-600 hover:bg-red-500 shadow-red-500/20'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20'
            }`}
          >
            {loading ? 'Procesando...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
