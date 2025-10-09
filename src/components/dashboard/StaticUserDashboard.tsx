import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const StaticUserDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          ¡Bienvenido, {user?.email || 'Usuario'}!
        </h1>
        <p className="text-gray-600">
          Tu dashboard personalizado está disponible
        </p>
      </div>

      {/* Información del sistema */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sistema Docsflow</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900">📄 Documentos</h4>
            <p className="text-sm text-blue-700 mt-1">
              Sube y procesa documentos PDF para extraer tablas automáticamente
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900">📊 Tablas</h4>
            <p className="text-sm text-green-700 mt-1">
              Visualiza y exporta las tablas extraídas de tus documentos
            </p>
          </div>
        </div>
      </div>

      {/* Enlaces rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Acceso Rápido</h3>
          <div className="space-y-3">
            <a 
              href="/my-documents" 
              className="block w-full text-left px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
            >
              📄 Mis Documentos
            </a>
            <a 
              href="/my-tables" 
              className="block w-full text-left px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
            >
              📊 Mis Tablas
            </a>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Usuario</h3>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Email:</span> {user?.email || 'No disponible'}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Rol:</span> {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'No disponible'}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Estado:</span> 
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Activo
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaticUserDashboard;
