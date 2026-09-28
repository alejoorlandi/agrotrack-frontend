import { NavLink } from 'react-router-dom';
import { FiHome, FiList, FiPlusSquare, FiBriefcase, FiActivity, FiUsers, FiShield } from 'react-icons/fi';
import usePermissions from '../hooks/usePermissions';

const Sidebar = ({ isOpen, closeSidebar }) => {
  const { can } = usePermissions();

  const links = [
    { to: '/', label: 'Dashboard', icon: <FiHome className="h-5 w-5 mr-3" /> },
    { to: '/animals', label: 'Animales', icon: <FiList className="h-5 w-5 mr-3" /> },
    { to: '/medicines', label: 'Medicamentos', icon: <FiBriefcase className="h-5 w-5 mr-3" /> },
    { to: '/sanitary-records', label: 'Registros Sanitarios', icon: <FiPlusSquare className="h-5 w-5 mr-3" /> },
    { to: '/monitoreo', label: 'Monitoreo', icon: <FiActivity className="h-5 w-5 mr-3" /> },
  ];

  if (can.manageUsers) {
    links.push({ to: '/admin/users', label: 'Usuarios', icon: <FiUsers className="h-5 w-5 mr-3" /> });
  }

  if (can.manageGroups) {
    links.push({ to: '/admin/groups', label: 'Grupos y Permisos', icon: <FiShield className="h-5 w-5 mr-3" /> });
  }

  return (
    <aside className={`fixed md:relative inset-y-0 left-0 z-40 w-64 bg-emerald-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),_1px_0_0_rgba(0,0,0,0.05)] transform transition-transform duration-300 md:translate-x-0 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex-1 mt-6 px-4 space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={() => { if(window.innerWidth < 768) closeSidebar() }}
            className={({ isActive }) =>
              `flex items-center px-4 py-3.5 text-sm font-semibold transition-all group ${
                isActive
                  ? 'bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-950/50 -translate-y-[1px]'
                  : 'text-emerald-200 hover:bg-emerald-900/50 hover:text-white rounded-xl'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={isActive ? 'text-white' : 'text-emerald-400 group-hover:text-emerald-300'}>
                  {link.icon}
                </span>
                {link.label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
