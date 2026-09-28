import { useState, useEffect, useCallback } from 'react';
import {
  FiPlus, FiEdit2, FiTrash2, FiKey, FiX, FiUser,
  FiMail, FiLock, FiAlertCircle, FiCheck, FiShield,
  FiSearch, FiRefreshCw,
} from 'react-icons/fi';
import { getUsers, getGroups, createUser, updateUser, deleteUser, resetUserPassword } from '../services/rbacApi';
import ConfirmDialog from '../components/ConfirmDialog';

// ─────────────────────────────────────────────────────────────────────────────
// Sub-componente: Badge de estado
// ─────────────────────────────────────────────────────────────────────────────
const EstadoBadge = ({ estado }) => (
  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide ${
    estado === 'ACTIVO'
      ? 'bg-emerald-100 text-emerald-800'
      : 'bg-red-100 text-red-700'
  }`}>
    <span className={`h-1.5 w-1.5 rounded-full ${estado === 'ACTIVO' ? 'bg-emerald-500' : 'bg-red-500'}`} />
    {estado}
  </span>
);

// ─────────────────────────────────────────────────────────────────────────────
// Sub-componente: Modal de Crear / Editar Usuario
// ─────────────────────────────────────────────────────────────────────────────
const UserFormModal = ({ isOpen, onClose, onSuccess, editingUser = null, availableGroups = [] }) => {
  const isEditing = !!editingUser;

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    estado: 'ACTIVO',
    groupIds: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Resetear form al abrir
  useEffect(() => {
    if (isOpen) {
      if (isEditing) {
        setFormData({
          email: editingUser.email,
          password: '',
          estado: editingUser.estado,
          groupIds: editingUser.groups?.map((g) => g.id) || [],
        });
      } else {
        setFormData({ email: '', password: '', estado: 'ACTIVO', groupIds: [] });
      }
      setError(null);
    }
  }, [isOpen, editingUser, isEditing]);

  if (!isOpen) return null;

  const toggleGroup = (groupId) => {
    setFormData((prev) => ({
      ...prev,
      groupIds: prev.groupIds.includes(groupId)
        ? prev.groupIds.filter((id) => id !== groupId)
        : [...prev.groupIds, groupId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isEditing) {
        await updateUser(editingUser.id, {
          email: formData.email,
          estado: formData.estado,
          groupIds: formData.groupIds,
        });
      } else {
        await createUser(formData);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar el usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card max-w-lg w-full border-white/80 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-xl">
              <FiUser className="h-5 w-5 text-emerald-700" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
            <FiX className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 space-y-5 overflow-y-auto flex-1">
            {error && (
              <div className="flex items-start gap-3 p-3.5 bg-red-50/80 border border-red-100 rounded-xl text-sm text-red-700">
                <FiAlertCircle className="shrink-0 mt-0.5 h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="usuario@agrotrack.com"
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white/70 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Contraseña (solo en creación) */}
            {!isEditing && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white/70 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            )}

            {/* Estado (solo en edición) */}
            {isEditing && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Estado de la cuenta
                </label>
                <div className="flex gap-3">
                  {['ACTIVO', 'INACTIVO'].map((estado) => (
                    <button
                      key={estado}
                      type="button"
                      onClick={() => setFormData({ ...formData, estado })}
                      className={`flex-1 py-2.5 text-sm font-bold rounded-xl border-2 transition-all ${
                        formData.estado === estado
                          ? estado === 'ACTIVO'
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : 'border-red-400 bg-red-50 text-red-700'
                          : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {estado}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Grupos — checkboxes */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Asignar Grupos
                <span className="ml-2 text-xs font-normal text-gray-400">
                  ({formData.groupIds.length} seleccionado{formData.groupIds.length !== 1 ? 's' : ''})
                </span>
              </label>
              {availableGroups.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No hay grupos disponibles</p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {availableGroups.map((group) => {
                    const selected = formData.groupIds.includes(group.id);
                    return (
                      <label
                        key={group.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          selected
                            ? 'border-emerald-400 bg-emerald-50'
                            : 'border-gray-200 hover:border-emerald-200 bg-white'
                        }`}
                      >
                        <div className={`flex-shrink-0 h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all ${
                          selected ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'
                        }`}>
                          {selected && <FiCheck className="h-3 w-3 text-white stroke-[3]" />}
                        </div>
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={selected}
                          onChange={() => toggleGroup(group.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <span className="block text-sm font-semibold text-gray-800">{group.nombre}</span>
                          {group.descripcion && (
                            <span className="block text-xs text-gray-500 truncate">{group.descripcion}</span>
                          )}
                        </div>
                        {selected && <FiShield className="h-4 w-4 text-emerald-500 flex-shrink-0" />}
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
              {loading ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-componente: Modal de Reset de Contraseña
// ─────────────────────────────────────────────────────────────────────────────
const ResetPasswordModal = ({ isOpen, onClose, user }) => {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNewPassword('');
      setError(null);
      setSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await resetUserPassword(user.id, newPassword);
      setSuccess(true);
      setTimeout(onClose, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al resetear la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card max-w-md w-full border-white/80 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-xl">
              <FiKey className="h-5 w-5 text-amber-700" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Resetear Contraseña</h3>
              <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[220px]">{user?.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {success ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="p-3 bg-emerald-100 rounded-full">
                <FiCheck className="h-7 w-7 text-emerald-600" />
              </div>
              <p className="font-semibold text-emerald-700">¡Contraseña reseteada correctamente!</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
                  <FiAlertCircle className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Nueva Contraseña Temporal
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Clave temporal para el usuario"
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white/70 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all font-mono"
                  />
                </div>
                <p className="mt-1.5 text-xs text-gray-400">
                  El usuario deberá cambiarla en su próximo ingreso.
                </p>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || !newPassword}
                  className="px-5 py-2 text-sm font-bold text-white bg-amber-500 hover:bg-amber-400 rounded-xl shadow-md shadow-amber-400/20 transition-all hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Procesando...' : 'Resetear Clave'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Página principal: AdminUsersPage
// ─────────────────────────────────────────────────────────────────────────────
const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modales
  const [formModal, setFormModal] = useState({ open: false, user: null });
  const [resetModal, setResetModal] = useState({ open: false, user: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null, loading: false });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, groupsRes] = await Promise.all([getUsers(), getGroups()]);
      setUsers(usersRes.data.data);
      setGroups(groupsRes.data.data);
    } catch (err) {
      console.error('Error cargando datos RBAC:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async () => {
    setDeleteDialog((d) => ({ ...d, loading: true }));
    try {
      await deleteUser(deleteDialog.user.id);
      setDeleteDialog({ open: false, user: null, loading: false });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al eliminar el usuario');
      setDeleteDialog((d) => ({ ...d, loading: false }));
    }
  };

  const filteredUsers = users.filter((u) =>
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="glass-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <span className="p-2 bg-emerald-100 rounded-xl">
              <FiUser className="h-7 w-7 text-emerald-700" />
            </span>
            Gestión de Usuarios
          </h1>
          <p className="text-gray-500 mt-1 font-medium ml-14">
            {users.length} usuario{users.length !== 1 ? 's' : ''} registrado{users.length !== 1 ? 's' : ''} en el sistema
          </p>
        </div>
        <button
          onClick={() => setFormModal({ open: true, user: null })}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-0.5 flex-shrink-0"
        >
          <FiPlus className="h-5 w-5" />
          Nuevo Usuario
        </button>
      </div>

      {/* Filtros */}
      <div className="glass-card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar por email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <FiRefreshCw className="h-4 w-4" />
          Actualizar
        </button>
      </div>

      {/* Tabla */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-gray-400 font-medium">
            <div className="flex flex-col items-center gap-3">
              <FiRefreshCw className="h-8 w-8 animate-spin text-emerald-400" />
              Cargando usuarios...
            </div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <FiUser className="h-12 w-12 mx-auto mb-3 text-gray-200" />
            <p className="font-medium">No se encontraron usuarios</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200/60">
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                    Usuario
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                    Grupos Asignados
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="table-row-hover group">
                    {/* Usuario */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {user.email[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{user.email}</p>
                          <p className="text-xs text-gray-400 uppercase tracking-wider">{user.role}</p>
                        </div>
                      </div>
                    </td>

                    {/* Estado */}
                    <td className="px-6 py-4">
                      <EstadoBadge estado={user.estado} />
                    </td>

                    {/* Grupos */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {user.groups && user.groups.length > 0 ? (
                          user.groups.map((g) => (
                            <span
                              key={g.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/10 text-emerald-900 text-xs font-semibold border border-emerald-900/10"
                            >
                              <FiShield className="h-3 w-3" />
                              {g.nombre}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400 italic">Sin grupos</span>
                        )}
                      </div>
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Editar */}
                        <button
                          onClick={() => setFormModal({ open: true, user })}
                          title="Editar usuario"
                          className="p-2 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all"
                        >
                          <FiEdit2 className="h-4 w-4" />
                        </button>
                        {/* Resetear clave */}
                        <button
                          onClick={() => setResetModal({ open: true, user })}
                          title="Resetear contraseña"
                          className="p-2 text-gray-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-all"
                        >
                          <FiKey className="h-4 w-4" />
                        </button>
                        {/* Eliminar */}
                        <button
                          onClick={() => setDeleteDialog({ open: true, user, loading: false })}
                          title="Eliminar usuario"
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modales */}
      <UserFormModal
        isOpen={formModal.open}
        onClose={() => setFormModal({ open: false, user: null })}
        onSuccess={fetchData}
        editingUser={formModal.user}
        availableGroups={groups}
      />

      <ResetPasswordModal
        isOpen={resetModal.open}
        onClose={() => setResetModal({ open: false, user: null })}
        user={resetModal.user}
      />

      <ConfirmDialog
        isOpen={deleteDialog.open}
        title="Eliminar usuario"
        message={`¿Estás seguro que deseas eliminar a "${deleteDialog.user?.email}"? Esta acción es irreversible.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ open: false, user: null, loading: false })}
        loading={deleteDialog.loading}
        confirmLabel="Sí, eliminar"
      />
    </div>
  );
};

export default AdminUsersPage;
