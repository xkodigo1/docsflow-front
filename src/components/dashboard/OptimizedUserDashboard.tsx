import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { userStatsService, type UserDashboardStats } from '../../services/userStatsService';
import { useToast } from '../../hooks/useToast';

const OptimizedUserDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showError } = useToast();
  const [stats, setStats] = useState<UserDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true);
        setHasError(false);
        
        // Verificar si hay caché válido
        if (userStatsService.hasValidCache()) {
          const cachedStats = await userStatsService.getUserDashboardStats();
          setStats(cachedStats);
          setIsLoading(false);
          return;
        }
        
        // Cargar con timeout de 3 segundos (más rápido)
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 3000)
        );
        
        const statsPromise = userStatsService.getUserDashboardStats();
        const data = await Promise.race([statsPromise, timeoutPromise]) as UserDashboardStats;
        
        setStats(data);
      } catch (error: any) {
        console.error('Error loading user stats:', error);
        setHasError(true);
        // Solo mostrar error una vez, no múltiples veces
        if (!hasError) {
          if (error.message === 'Timeout') {
            showError('Carga lenta. Usando vista simplificada.');
          } else {
            showError('Error al cargar estadísticas. Usando vista simplificada.');
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []); // Removido showError de las dependencias para evitar múltiples llamadas

  const handleRefresh = async () => {
    userStatsService.clearCache();
    setStats(null);
    setHasError(false);
    setIsLoading(true);
    
    try {
      const data = await userStatsService.getUserDashboardStats(true);
      setStats(data);
    } catch (error) {
      setHasError(true);
      showError('Error al actualizar estadísticas');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'processed': return 'Procesado';
      case 'pending': return 'Pendiente';
      case 'failed': return 'Fallido';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con botón de refresh */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Bienvenido, {user?.email}!
            </h1>
            <p className="text-gray-600">
              Tu dashboard personalizado con estadísticas optimizadas
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? '🔄' : '↻'} Actualizar
          </button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando estadísticas...</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {hasError && !stats && (
        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
          <div className="text-center">
            <p className="text-yellow-800 mb-4">No se pudieron cargar las estadísticas completas</p>
            <div className="space-y-3">
              <a 
                href="/documents" 
                className="block w-full text-left px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                📄 Ver Documentos
              </a>
              <a 
                href="/tables" 
                className="block w-full text-left px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
              >
                📊 Ver Tablas
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Stats content */}
      {stats && !isLoading && (
        <>
          {/* Estadísticas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Documentos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.summary.total_documents}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Procesados</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.summary.processed_documents}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0V4a1 1 0 011-1h4a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tablas Extraídas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.summary.total_tables}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tasa de Procesamiento</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.summary.processing_rate}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actividad reciente */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
            <div className="space-y-3">
              {stats.recent_activity.length > 0 ? (
                stats.recent_activity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.filename}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(activity.created_at)}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(activity.status)}`}>
                      {getStatusText(activity.status)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No hay actividad reciente</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OptimizedUserDashboard;
