import React, { useState } from 'react';
import { tableService } from '../services/tableService';
import type { TableSearchResult } from '../services/tableService';
import TableRenderer from '../components/tables/TableRenderer';
import TablePreview from '../components/tables/TablePreview';
import TableFilters from '../components/tables/TableFilters';
import DebugInfo from '../components/tables/DebugInfo';

const TablesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<TableSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewTable, setPreviewTable] = useState<{
    tableData: any;
    documentInfo: any;
  } | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: { start: '', end: '' },
    documentType: '',
    hasHeaders: null as boolean | null,
    minRows: 0,
    maxRows: 1000
  });
  const [debugResponse, setDebugResponse] = useState<any>(null);

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
      
      console.log('Response from backend:', response);
      setDebugResponse(response);
      
      // Verificar que la respuesta tenga la estructura esperada
      if (response && response.items && Array.isArray(response.items)) {
        setResults(response.items);
      } else {
        console.error('Unexpected response structure:', response);
        setError('Estructura de respuesta inesperada del servidor');
        setResults([]);
      }
    } catch (error: any) {
      console.error('Error searching tables:', error);
      setError(error.response?.data?.detail || error.message || 'Error al buscar tablas');
      setResults([]);
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

  const handlePreviewTable = (result: TableSearchResult) => {
    const processedData = processTableData(result.table.content);
    
    setPreviewTable({
      tableData: processedData,
      documentInfo: {
        id: result.document.id,
        filename: result.document.filename,
        tableIndex: result.table.index
      }
    });
  };

  const handleExportTable = async (documentId: number) => {
    try {
      const blob = await tableService.exportTablesCSV(documentId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tablas_documento_${documentId}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting table:', error);
    }
  };

  const handleClosePreview = () => {
    setPreviewTable(null);
  };

  // Función helper para procesar los datos de tabla
  const processTableData = (content: any) => {
    // Si content es null o undefined
    if (!content) {
      return null;
    }
    
    // Si content es un string, intentar parsearlo como JSON
    if (typeof content === 'string') {
      try {
        content = JSON.parse(content);
      } catch (e) {
        return null;
      }
    }
    
    // Ahora cada tabla individual ya tiene estructura { headers, rows, page }
    if (content && (content.headers || content.rows)) {
      return content;
    }
    
    return content;
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    // Aplicar filtros a los resultados existentes
    applyFilters();
  };

  const applyFilters = () => {
    // Esta función aplicaría los filtros a los resultados
    // Por ahora, solo actualizamos el estado
    console.log('Aplicando filtros:', filters);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tablas Extraídas</h1>
          <p className="text-gray-600">Busca y explora las tablas extraídas de los documentos</p>
        </div>
        
        {/* Controls */}
        <div className="flex items-center space-x-4">
          {/* Filters toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              showFilters 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🔍 Filtros
          </button>

          {/* View mode toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Vista:</span>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📊 Cuadrícula
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === 'list' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📋 Lista
            </button>
          </div>
        </div>
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
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                  Buscando...
                </>
              ) : (
                'Buscar'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Debug Info */}
      {debugResponse && (
        <DebugInfo data={debugResponse} title="Respuesta del Backend" />
      )}

      {/* Filters */}
      {showFilters && (
        <TableFilters
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      )}

      {/* Results */}
      <div className="bg-white shadow rounded-lg">
        {error && (
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          </div>
        )}

        {(!results || results.length === 0) && !isLoading ? (
          <div className="px-6 py-12 text-center">
            <span className="text-4xl">📊</span>
            <p className="mt-2 text-gray-500">No hay resultados</p>
            <p className="text-sm text-gray-400">Intenta con otros términos de búsqueda</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'p-6 grid grid-cols-1 lg:grid-cols-2 gap-6' : 'divide-y divide-gray-200'}>
            {results && Array.isArray(results) ? results.map((result, index) => (
              <div key={index} className={viewMode === 'grid' ? '' : 'px-6 py-4 hover:bg-gray-50'}>
                {viewMode === 'grid' ? (
                  <TableRenderer
                    tableData={processTableData(result.table.content)}
                    documentInfo={{
                      id: result.document.id,
                      filename: result.document.filename,
                      tableIndex: result.table.index
                    }}
                    onExport={() => handleExportTable(result.document.id)}
                  />
                ) : (
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
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              Tabla {result.table.index + 1}
                            </span>
                            <p className="text-xs text-gray-500">
                              Creado: {formatDate(result.table.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handlePreviewTable(result)}
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                            title="Vista previa"
                          >
                            👁️ Vista previa
                          </button>
                          <button
                            onClick={() => handleExportTable(result.document.id)}
                            className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                            title="Exportar tabla"
                          >
                            📥 Exportar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )) : (
              <div className="px-6 py-12 text-center">
                <span className="text-4xl">⚠️</span>
                <p className="mt-2 text-gray-500">Error en los datos</p>
                <p className="text-sm text-gray-400">Los resultados no tienen el formato esperado</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Table Preview Modal */}
      {previewTable && (
        <TablePreview
          tableData={previewTable.tableData}
          documentInfo={previewTable.documentInfo}
          onClose={handleClosePreview}
          onExport={() => handleExportTable(previewTable.documentInfo.id)}
        />
      )}
    </div>
  );
};

export default TablesPage;