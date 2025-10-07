import React, { useState } from 'react';
import { tableService } from '../services/tableService';
import type { TableSearchResult } from '../services/tableService';

const TablesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<TableSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await tableService.searchTables({
        q: searchQuery,
        limit: 20,
        offset: 0,
      });
      setResults(response.items);
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Error al buscar tablas');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tablas Extraídas</h1>
        <p className="text-gray-600">Busca contenido en las tablas extraídas de los documentos</p>
      </div>

      {/* Search form */}
      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar en tablas extraídas..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !searchQuery.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </form>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Results */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Resultados de búsqueda {results.length > 0 && `(${results.length})`}
          </h3>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-4xl">📊</span>
            <p className="mt-2 text-gray-500">
              {searchQuery ? 'No se encontraron resultados' : 'Realiza una búsqueda para ver resultados'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {results.map((result, index) => (
              <div key={index} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">📊</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {result.document.filename}
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          <p className="text-xs text-gray-500">
                            Documento: {result.document.id}
                          </p>
                          <p className="text-xs text-gray-500">
                            Tabla: {result.table.index}
                          </p>
                          <p className="text-xs text-gray-500">
                            Creado: {formatDate(result.table.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            // Exportar tabla individual
                            tableService.exportTablesCSV(result.document.id);
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                          title="Exportar tabla"
                        >
                          📥
                        </button>
                      </div>
                    </div>
                    
                    {/* Table content preview */}
                    <div className="mt-3 p-3 bg-gray-50 rounded-md">
                      <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-x-auto">
                        {JSON.stringify(result.table.content, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TablesPage;
