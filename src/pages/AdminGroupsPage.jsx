import { useState, useEffect, useCallback } from 'react';
import {
  FiPlus, FiEdit2, FiTrash2, FiX, FiShield,
  FiCheck, FiAlertCircle, FiRefreshCw, FiList
} from 'react-icons/fi';
import { getGroups, getPermissions, createGroup, updateGroup, deleteGroup } from '../services/rbacApi';
import ConfirmDialog from '../components/ConfirmDialog';

// ─────────────────────────────────────────────────────────────────────────────
// Diccionario de Mapeo de Permisos (Inglés -> Español)
// ─────────────────────────────────────────────────────────────────────────────
const PERMISSION_LABELS = {
  MANAGE_GROUPS: 'Gestión de Grupos y Permisos',
  MANAGE_USERS: 'Gestión de Usuarios',
  READ_REPORTS: 'Lectura de Reportes',
  WRITE_SANIDAD: 'Registro Sanitario',
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-componente: Modal de Crear / Editar Grupo
// ─────────────────────────────────────────────────────────────────────────────
const GroupFormModal = ({ isOpen, onClose, onSuccess, editingGroup = null, availablePermissions = [] }) => {
  const isEditing = !!editingGroup;

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    permissionIds: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Resetear form al abrir
  useEffect(() => {
    if (isOpen) {
      if (isEditing) {
        setFormData({
          nombre: editingGroup.nombre,
          descripcion: editingGroup.descripcion || '',
          permissionIds: editingGroup.permissions?.map((p) => p.id) || [],
        });
      } else {
        setFormData({ nombre: '', descripcion: '', permissionIds: [] });
      }
      setError(null);
    }
  }, [isOpen, editingGroup, isEditing]);

  if (!isOpen) return null;

  const togglePermission = (permissionId) => {
    setFormData((prev) => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(permissionId)
        ? prev.permissionIds.filter((id) => id !== permissionId)
        : [...prev.permissionIds, permissionId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isEditing) {
        await updateGroup(editingGroup.id, formData);
      } else {
        await createGroup(formData);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar el grupo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card max-w-2xl w-full border-white/80 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-xl">
              <FiShield className="h-5 w-5 text-emerald-700" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              {isEditing ? 'Editar Grupo y Permisos' : 'Nuevo Grupo'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
            <FiX className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {error && (
              <div className="flex items-start gap-3 p-3.5 bg-red-50/80 border border-red-100 rounded-xl text-sm text-red-700">
                <FiAlertCircle className="shrink-0 mt-0.5 h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Nombre del Grupo
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej. Veterinario Senior"
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white/70 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Descripción
                </label>
                <input
                  type="text"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Descripción opcional"
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white/70 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Permisos — checkboxes en grid */}
            <div>
              <div className="flex justify-between items-end mb-3">
                <label className="block text-sm font-bold text-gray-700">
                  Permisos Asignados
                </label>
                <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg">
                  {formData.permissionIds.length} seleccionados
                </span>
              </div>

              {availablePermissions.length === 0 ? (
                <p className="text-sm text-gray-400 italic bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
                  Cargando permisos disponibles...
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {availablePermissions.map((permission) => {
                    const selected = formData.permissionIds.includes(permission.id);
                    return (
                      <label
                        key={permission.id}
                        className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          selected
                            ? 'border-emerald-400 bg-emerald-50'
                            : 'border-gray-200 hover:border-emerald-200 bg-white'
                        }`}
                      >
                        <div className={`mt-0.5 flex-shrink-0 h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all ${
                          selected ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'
                        }`}>
                          {selected && <FiCheck className="h-3 w-3 text-white stroke-[3]" />}
                        </div>
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={selected}
                          onChange={() => togglePermission(permission.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <span className="block text-sm font-bold text-gray-900 leading-tight">
                            {PERMISSION_LABELS[permission.codigo] || permission.codigo}
                          </span>
                          {permission.descripcion && (
                            <span className="block text-xs text-gray-500 mt-0.5 leading-snug">
                              {permission.descripcion}
                            </span>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200/50 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-500/20 transition-all hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Grupo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Página principal: AdminGroupsPage
// ─────────────────────────────────────────────────────────────────────────────
const AdminGroupsPage = () => {
  const [groups, setGroups] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modales
  const [formModal, setFormModal] = useState({ open: false, group: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, group: null, loading: false });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [groupsRes, permsRes] = await Promise.all([getGroups(), getPermissions()]);
      setGroups(groupsRes.data.data);
      setPermissions(permsRes.data.data);
    } catch (err) {
      console.error('Error cargando grupos/permisos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async () => {
    setDeleteDialog((d) => ({ ...d, loading: true }));
    try {
      await deleteGroup(deleteDialog.group.id);
      setDeleteDialog({ open: false, group: null, loading: false });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al eliminar el grupo');
      setDeleteDialog((d) => ({ ...d, loading: false }));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="glass-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <span className="p-2 bg-emerald-100 rounded-xl">
              <FiShield className="h-7 w-7 text-emerald-700" />
            </span>
            Gestión de Grupos y Permisos
          </h1>
          <p className="text-gray-500 mt-1 font-medium ml-14">
            Roles de acceso y permisos granulares del sistema
          </p>
        </div>
        <div className="flex items-center gap-3 ml-14 sm:ml-0">
          <button
            onClick={fetchData}
            className="p-2.5 text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-all"
            title="Actualizar lista"
          >
            <FiRefreshCw className="h-5 w-5" />
          </button>
          <button
            onClick={() => setFormModal({ open: true, group: null })}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-0.5"
          >
            <FiPlus className="h-5 w-5" />
            Nuevo Grupo
          </button>
        </div>
      </div>

      {/* Grid de Grupos */}
      {loading ? (
        <div className="glass-card py-20 text-center text-gray-400 font-medium">
          <div className="flex flex-col items-center gap-3">
            <FiRefreshCw className="h-8 w-8 animate-spin text-emerald-400" />
            Cargando grupos...
          </div>
        </div>
      ) : groups.length === 0 ? (
        <div className="glass-card py-20 text-center text-gray-400">
          <FiShield className="h-12 w-12 mx-auto mb-3 text-gray-200" />
          <p className="font-medium">No se encontraron grupos configurados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div key={group.id} className="glass-card flex flex-col group transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              
              {/* Tarjeta Header */}
              <div className="p-5 border-b border-gray-100 flex justify-between items-start">
                <div className="pr-4">
                  <h3 className="font-extrabold text-lg text-gray-900 group-hover:text-emerald-700 transition-colors">
                    {group.nombre}
                  </h3>
                  {group.descripcion && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                      {group.descripcion}
                    </p>
                  )}
                </div>
                
                {/* Menú de acciones (flotante on hover) */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur rounded-lg shadow-sm border border-gray-100">
                  <button
                    onClick={() => setFormModal({ open: true, group })}
                    className="p-2 text-gray-500 hover:text-emerald-600 transition-colors"
                    title="Editar Grupo"
                  >
                    <FiEdit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteDialog({ open: true, group, loading: false })}
                    className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                    title="Eliminar Grupo"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Tarjeta Body (Permisos) */}
              <div className="p-5 flex-1 bg-gradient-to-b from-transparent to-gray-50/50 rounded-b-2xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <FiList className="h-3.5 w-3.5" />
                    Permisos Asignados
                  </span>
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                    {group.permissions?.length || 0}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {group.permissions && group.permissions.length > 0 ? (
                    group.permissions.map((perm) => (
                      <span
                        key={perm.id}
                        className="inline-flex items-center px-2 py-1 bg-white border border-gray-200 text-gray-700 text-[11px] font-semibold rounded-md shadow-sm"
                        title={perm.descripcion}
                      >
                        {PERMISSION_LABELS[perm.codigo] || perm.codigo}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400 italic">No tiene permisos asignados</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modales */}
      <GroupFormModal
        isOpen={formModal.open}
        onClose={() => setFormModal({ open: false, group: null })}
        onSuccess={fetchData}
        editingGroup={formModal.group}
        availablePermissions={permissions}
      />

      <ConfirmDialog
        isOpen={deleteDialog.open}
        title="Eliminar grupo"
        message={`¿Estás seguro que deseas eliminar el grupo "${deleteDialog.group?.nombre}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ open: false, group: null, loading: false })}
        loading={deleteDialog.loading}
        confirmLabel="Sí, eliminar"
      />
    </div>
  );
};

export default AdminGroupsPage;