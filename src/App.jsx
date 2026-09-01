import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
// Placeholder imports for next tasks
import AnimalsPage from './pages/AnimalsPage';
import MedicinesPage from './pages/MedicinesPage';
import SanitaryRecordsPage from './pages/SanitaryRecordsPage';
import MonitoreoAnimales from './pages/MonitoreoAnimales';

// Protected Route Wrapper
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
