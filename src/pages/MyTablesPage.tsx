import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { tableService } from '../services/tableService';
import { useToast } from '../hooks/useToast';
import { useDebounce } from '../hooks/useDebounce';
import { DocumentIcon, TableCellsIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import TableModal from '../components/tables/TableModal';

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
  const [selectedTable, setSelectedTable] = useState<{
    id: number;
    documentFilename: string;
    tableIndex: number;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    const loadMyTables = async () => {
      if (!user?.id) return; // No cargar si no hay usuario
      
      try {
        setIsLoading(true);
        const response = await tableService.getMyTables({
          q: debouncedSearchQuery,
          limit: 100, // Más tablas para mostrar
          offset: 0
        });
        
        // Mapear directamente sin filtrar (ya viene filtrado del backend)
        const myTables = response.items.map((table: any) => ({
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

  const handleTableClick = (table: MyTable) => {
    setSelectedTable({
      id: table.id,
      documentFilename: table.document.filename,
      tableIndex: table.table_index
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTable(null);
  };

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

  // Agrupar tablas por documento
  const groupedTables = tables.reduce((acc, table) => {
    const docId = table.document_id;
    if (!acc[docId]) {
      acc[docId] = {
        document: table.document,
        tables: []
      };
    }
    acc[docId].tables.push(table);
    return acc;
  }, {} as Record<number, { document: { filename: string; status: string }; tables: MyTable[] }>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Mis Tablas Extraídas
          </h1>
          <p className="text-gray-600">
            Haz clic en cualquier tabla para ver su contenido y descargarla
          </p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <TableCellsIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Tablas</p>
              <p className="text-2xl font-semibold text-gray-900">{tables.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <DocumentIcon className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Documentos</p>
              <p className="text-2xl font-semibold text-gray-900">{Object.keys(groupedTables).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <span className="text-2xl">📊</span>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Promedio por Doc</p>
              <p className="text-2xl font-semibold text-gray-900">
                {Object.keys(groupedTables).length > 0 
                  ? Math.round(tables.length / Object.keys(groupedTables).length * 10) / 10 
                  : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar en mis tablas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Lista de tablas agrupadas por documento */}
      {isLoading ? (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : Object.keys(groupedTables).length > 0 ? (
        <div className="space-y-4">
          {Object.entries(groupedTables).map(([docId, group]) => (
            <div key={docId} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <DocumentIcon className="h-6 w-6 text-blue-500" />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {group.document.filename}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {group.tables.length} tabla(s) extraída(s)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(group.document.status)}`}>
                      {getStatusText(group.document.status)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {group.tables.map((table) => (
                    <div 
                      key={table.id} 
                      onClick={() => handleTableClick(table)}
                      className="border border-gray-200 rounded-lg p-3 hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all duration-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          <TableCellsIcon className="h-3 w-3 mr-1" />
                          Tabla {table.table_index + 1}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(table.created_at)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        ID: {table.id}
                      </div>
                      <div className="text-xs text-blue-600 mt-1">
                        Haz clic para ver contenido
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <TableCellsIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No hay tablas extraídas</h3>
          <p className="mt-1 text-sm text-gray-600">
            {searchQuery ? 'No se encontraron tablas con ese criterio' : 'Sube y procesa algunos documentos para ver las tablas extraídas'}
          </p>
        </div>
      )}

      {/* Modal de tabla */}
      {selectedTable && (
        <TableModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          tableId={selectedTable.id}
          documentFilename={selectedTable.documentFilename}
          tableIndex={selectedTable.tableIndex}
        />
      )}
    </div>
  );
};

export default MyTablesPage;
