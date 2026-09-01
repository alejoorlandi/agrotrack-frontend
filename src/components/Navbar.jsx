import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import { FiLogOut, FiUser, FiMenu } from 'react-icons/fi';
import { Leaf } from 'lucide-react';

const Navbar = ({ toggleSidebar }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <nav className="bg-white/70 backdrop-blur-md shadow-[0_1px_0_rgba(0,0,0,0.05)] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleSidebar} 
              className="md:hidden p-2 -ml-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500"
            >
              <FiMenu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-3">
              <div className="bg-white h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-full shadow-sm ring-1 ring-emerald-500/10 text-xl sm:text-2xl">
                🐄
              </div>
              <span className="font-extrabold text-xl sm:text-2xl tracking-tighter text-gray-900 flex items-center">
                Agro<span className="text-emerald-600">Track</span>
                <Leaf className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-500 ml-1 drop-shadow-sm" />
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden lg:flex items-center text-sm text-gray-500 bg-gray-50/80 px-3 py-1.5 rounded-full ring-1 ring-gray-200">
              <FiUser className="mr-2" />
              <span>{user?.email}</span>
              <span className="ml-2 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                {user?.role}
              </span>
            </div>
            
            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center px-4 py-2 rounded-full font-bold text-sm bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-all hover:shadow-md hover:-translate-y-px focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-500 ring-1 ring-red-200"
              title="Cerrar Sessión"
            >
              <span className="mr-2 hidden sm:inline">Salir del Sistema</span>
              <FiLogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
