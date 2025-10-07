import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">👋</span>
            </div>
          </div>
          <div className="ml-4">
            <h1 className="text-2xl font-bold text-gray-900">
              ¡Bienvenido a Docsflow!
            </h1>
            <p className="text-gray-600">
              Hola {user?.email}, aquí puedes gestionar tus documentos y tablas extraídas.
            </p>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-3xl">📄</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Documentos</p>
              <p className="text-2xl font-semibold text-gray-900">-</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-3xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tablas Extraídas</p>
              <p className="text-2xl font-semibold text-gray-900">-</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-3xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Procesados</p>
              <p className="text-2xl font-semibold text-gray-900">-</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="/documents"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl mr-3">📄</span>
            <div>
              <p className="font-medium text-gray-900">Ver Documentos</p>
              <p className="text-sm text-gray-500">Gestionar documentos</p>
            </div>
          </a>

          <a
            href="/documents"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl mr-3">⬆️</span>
            <div>
              <p className="font-medium text-gray-900">Subir Documento</p>
              <p className="text-sm text-gray-500">Nuevo PDF</p>
            </div>
          </a>

          <a
            href="/tables"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl mr-3">📊</span>
            <div>
              <p className="font-medium text-gray-900">Buscar Tablas</p>
              <p className="text-sm text-gray-500">Contenido extraído</p>
            </div>
          </a>

          {user?.role === 'admin' && (
            <a
              href="/users"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-2xl mr-3">👥</span>
              <div>
                <p className="font-medium text-gray-900">Usuarios</p>
                <p className="text-sm text-gray-500">Gestionar usuarios</p>
              </div>
            </a>
          )}
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Actividad Reciente</h3>
        <div className="text-center py-8">
          <span className="text-4xl">📈</span>
          <p className="mt-2 text-gray-500">No hay actividad reciente</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

