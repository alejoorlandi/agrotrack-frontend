import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AnimalsPage from './pages/AnimalsPage';
import MedicinesPage from './pages/MedicinesPage';
import SanitaryRecordsPage from './pages/SanitaryRecordsPage';
import MonitoreoAnimales from './pages/MonitoreoAnimales';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminGroupsPage from './pages/AdminGroupsPage';

// Protected Route Wrapper — solo verifica autenticación
const ProtectedRoute = ({ children }) => {
  const { token } = useSelector((state) => state.auth);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  if (!token) return <Navigate to="/login" replace />;
  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/20 z-30 md:hidden backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        <main className="flex-1 overflow-y-auto w-full">
          <div className="container mx-auto p-4 md:p-8 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

// Permission Route Wrapper — verifica autenticación + permiso RBAC específico
const PermissionRoute = ({ children, permission }) => {
  const { token, user } = useSelector((state) => state.auth);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!token) return <Navigate to="/login" replace />;

  // Bypass: el rol 'admin' tiene acceso a todo
  const isSuperAdmin = user?.role === 'admin';
  const permissions = user?.permissions || [];
  const hasPermission = isSuperAdmin || permissions.includes(permission);

  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/20 z-30 md:hidden backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        <main className="flex-1 overflow-y-auto w-full">
          <div className="container mx-auto p-4 md:p-8 max-w-7xl">
            {hasPermission ? children : (
              <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 animate-fade-in">
                <div className="p-5 bg-red-100 rounded-2xl">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.25-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-extrabold text-gray-800">Acceso Denegado</h2>
                <p className="text-gray-500 text-center max-w-sm">
                  No tenés permisos para acceder a esta sección.<br/>
                  Contactá al administrador del sistema.
                </p>
                <button
                  onClick={() => window.history.back()}
                  className="mt-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-0.5"
                >
                  Volver
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

// Route that redirects away from login if already authenticated
const PublicRoute = ({ children }) => {
  const { token } = useSelector((state) => state.auth);
  if (token) return <Navigate to="/" replace />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          } 
        />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/animals" 
          element={
            <ProtectedRoute>
              <AnimalsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/medicines" 
          element={
            <ProtectedRoute>
              <MedicinesPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/sanitary-records" 
          element={
            <ProtectedRoute>
              <SanitaryRecordsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/monitoreo" 
          element={
            <ProtectedRoute>
              <MonitoreoAnimales />
            </ProtectedRoute>
          } 
        />
        {/* ── Rutas de Administración RBAC ── */}
        <Route 
          path="/admin/users" 
          element={
            <PermissionRoute permission="MANAGE_USERS">
              <AdminUsersPage />
            </PermissionRoute>
          } 
        />
        <Route 
          path="/admin/groups" 
          element={
            <PermissionRoute permission="MANAGE_GROUPS">
              <AdminGroupsPage />
            </PermissionRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
