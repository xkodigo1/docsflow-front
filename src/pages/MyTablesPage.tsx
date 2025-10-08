import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { tableService } from '../services/tableService';
import { useToast } from '../hooks/useToast';
import { useDebounce } from '../hooks/useDebounce';

interface MyTable {
  id: number;
  document_id: number;
  table_index: number;
  created_at: string;
  document: {
    filename: string;
    status: string;
  };
}

const MyTablesPage: React.FC = () => {
  const { user } = useAuth();
  const { showError } = useToast();
  const [tables, setTables] = useState<MyTable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    const loadMyTables = async () => {
      if (!user?.id) return; // No cargar si no hay usuario
      
      try {
        setIsLoading(true);
        const response = await tableService.searchTables({
          q: debouncedSearchQuery,
          limit: 50, // Límite razonable
          offset: 0
        });
        
        // Filtrar solo las tablas de documentos del usuario actual
        const myTables = response.items.filter((table: any) => 
          table.document.uploaded_by === user.id
        ).map((table: any) => ({
          id: table.table.id,
          document_id: table.document.id,
          table_index: table.table.index,
          created_at: table.table.created_at,
          document: {
            filename: table.document.filename,
            status: table.document.status
          }
        }));
        
        setTables(myTables);
      } catch (error: any) {
        console.error('Error loading my tables:', error);
        showError('Error al cargar tus tablas');
      } finally {
        setIsLoading(false);
      }
    };

    loadMyTables();
  }, [debouncedSearchQuery, user?.id]); // Usar debouncedSearchQuery en lugar de searchQuery

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
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
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Mis Tablas Extraídas
        </h1>
        <p className="text-gray-600">
          Visualiza las tablas extraídas de tus documentos
        </p>
      </div>

      {/* Búsqueda */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar en mis tablas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <span className="absolute right-3 top-2.5 text-gray-400">🔍</span>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{tables.length}</div>
            <div className="text-sm text-gray-600">Total Tablas</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {tables.filter(t => t.document.status === 'processed').length}
            </div>
            <div className="text-sm text-gray-600">De Documentos Procesados</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {tables.filter(t => t.document.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600">De Documentos Pendientes</div>
          </div>
        </div>
      </div>

      {/* Lista de tablas */}
      {isLoading ? (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      ) : tables.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tabla #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado del Documento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Extraída
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tables.map((table) => (
                  <tr key={table.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {table.document.filename}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        Tabla {table.table_index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(table.document.status)}`}>
                        {getStatusText(table.document.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(table.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <a
                        href={`/tables?search=${encodeURIComponent(table.document.filename)}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Ver Tabla
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-500">
            {searchQuery ? 'No se encontraron tablas con ese criterio' : 'No tienes tablas extraídas'}
          </p>
        </div>
      )}
    </div>
  );
};

export default MyTablesPage;
