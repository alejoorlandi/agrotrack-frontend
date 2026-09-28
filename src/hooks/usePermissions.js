import { useSelector } from 'react-redux';

/**
 * usePermissions — Hook para verificar permisos RBAC del usuario autenticado.
 *
 * Los permisos se cargan desde el JWT/localStorage al iniciar sesión.
 * El backend los carga dinámicamente en authMiddleware desde la BD.
 *
 * Uso:
 *   const { hasPermission, can } = usePermissions();
 *   if (hasPermission('MANAGE_USERS')) { ... }
 *   if (can.manageUsers) { ... }
 *
 * Bypass de superusuario:
 *   Si el usuario tiene role === 'admin', hasPermission() siempre retorna true
 *   sin importar el contenido del array de permisos.
 */
const usePermissions = () => {
  const { user } = useSelector((state) => state.auth);

  // Bypass: el rol 'admin' siempre tiene todos los permisos
  const isSuperAdmin = user?.role === 'admin';

  // El array de permisos viene del usuario almacenado en Redux/localStorage
  // Se actualiza cada vez que el usuario hace login
  const permissions = user?.permissions || [];

  const hasPermission = (permissionCode) =>
    isSuperAdmin || permissions.includes(permissionCode);

  return {
    permissions,
    isSuperAdmin,
    hasPermission,
    // Atajos semánticos para los permisos del sistema AgroTrack
    can: {
      manageUsers: isSuperAdmin || hasPermission('MANAGE_USERS'),
      manageGroups: isSuperAdmin || hasPermission('MANAGE_GROUPS'),
      readReports: isSuperAdmin || hasPermission('READ_REPORTS'),
      writeSanidad: isSuperAdmin || hasPermission('WRITE_SANIDAD'),
    },
  };
};

export default usePermissions;
