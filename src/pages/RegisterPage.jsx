import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, loginUser, clearError } from '../store/authSlice';
import { FiMail, FiLock, FiAlertCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');
  
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    
    if (password !== confirmPassword) {
      setLocalError('Las contraseñas no coinciden.');
      return;
    }

    if (email && password) {
      try {
        await dispatch(registerUser({ email, password })).unwrap();
        // Log in automatically after registration
        dispatch(loginUser({ email, password }));
      } catch (err) {
        // Redux handles auth errors
        console.error('Registration error:', err);
      }
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen bg-transparent flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md backdrop-blur-sm rounded-3xl p-6">
        <div className="flex justify-center text-5xl drop-shadow-sm">🐄</div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          Registro Agro<span className="text-emerald-600">Track</span>
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 font-medium">
          Sistema de trazabilidad sanitaria ganadera
        </p>
      </div>

      <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass-card py-8 px-4 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {displayError && (
              <div className="bg-red-50/80 backdrop-blur border border-red-100 p-4 rounded-xl flex items-start shadow-sm">
                <FiAlertCircle className="text-red-500 mt-0.5 mr-3 shrink-0" />
                <p className="text-sm font-medium text-red-700">{displayError}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-700">
                Correo Electrónico
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 sm:text-sm border-gray-200 rounded-xl py-2.5 bg-white/70 backdrop-blur outline-none transition-colors"
                  placeholder="usuario@ejemplo.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-700">
                Contraseña
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 sm:text-sm border-gray-200 rounded-xl py-2.5 bg-white/70 backdrop-blur outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-700">
                Confirmar Contraseña
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 sm:text-sm border-gray-200 rounded-xl py-2.5 bg-white/70 backdrop-blur outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-[0_4px_10px_-2px_rgba(16,185,129,0.3)] text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all hover:-translate-y-[1px] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Procesando...' : 'Crear mi cuenta'}
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-sm text-center text-gray-600 border-t border-gray-200/60 pt-6 font-medium">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-emerald-600 hover:text-emerald-500 font-bold transition-colors">
              Inicia sesión aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
