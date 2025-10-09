import React, { useState, useEffect } from 'react';
import { XMarkIcon, TableCellsIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { tableService } from '../../services/tableService';
import { useToast } from '../../hooks/useToast';
import { useDebounce } from '../../hooks/useDebounce';
import TableModal from '../tables/TableModal';

interface DepartmentTablesModalProps {
  isOpen: boolean;
  onClose: () => void;
  departmentId: number;
  departmentName: string;
}

interface DepartmentTable {
  id: number;
  document_id: number;
  table_index: number;
  created_at: string;
  document: {
    filename: string;
    status: string;
    uploaded_by: number;
  };
}

const DepartmentTablesModal: React.FC<DepartmentTablesModalProps> = ({
  isOpen,
  onClose,
  departmentId,
  departmentName
}) => {
  const { showError } = useToast();
  const [tables, setTables] = useState<DepartmentTable[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTable, setSelectedTable] = useState<{
    id: number;
    documentFilename: string;
    tableIndex: number;
  } | null>(null);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (isOpen) {
      loadDepartmentTables();
    }
  }, [isOpen, departmentId, debouncedSearchQuery]);

  const loadDepartmentTables = async () => {
    try {
      setIsLoading(true);
      const response = await tableService.searchTables({
        q: debouncedSearchQuery,
        department_id: departmentId,
        limit: 100,
        offset: 0
      });
      
      const departmentTables = response.items.map((table: any) => ({
        id: table.table.id,
        document_id: table.document.id,
        table_index: table.table.index,
        created_at: table.table.created_at,
        document: {
          filename: table.document.filename,
          status: table.document.status,
          uploaded_by: table.document.uploaded_by
        }
      }));
      
      setTables(departmentTables);
    } catch (error: any) {
      console.error('Error loading department tables:', error);
      showError('Error al cargar las tablas del departamento');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTableClick = (table: DepartmentTable) => {
    setSelectedTable({
      id: table.id,
      documentFilename: table.document.filename,
      tableIndex: table.table_index
    });
    setIsTableModalOpen(true);
  };

  const handleCloseTableModal = () => {
    setIsTableModalOpen(false);
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pendiente' },
      processing: { color: 'bg-blue-100 text-blue-800', text: 'Procesando' },
      processed: { color: 'bg-green-100 text-green-800', text: 'Procesado' },
      error: { color: 'bg-red-100 text-red-800', text: 'Error' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.text}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        ></div>
        
        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <TableCellsIcon className="h-6 w-6 text-blue-500" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Tablas de {departmentName}
                </h3>
                <p className="text-sm text-gray-500">ID: {departmentId}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          {/* Search */}
          <div className="p-6 border-b border-gray-200">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar en las tablas del departamento..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
            ) : tables.length === 0 ? (
              <div className="text-center py-12">
                <TableCellsIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">No hay tablas</h3>
                <p className="mt-1 text-sm text-gray-600">
                  {searchQuery ? 'No se encontraron tablas con ese criterio' : 'Este departamento no tiene tablas extraídas'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Estadísticas */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-900">{tables.length}</div>
                    <div className="text-sm text-blue-600">Total Tablas</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-900">
                      {tables.filter(t => t.document.status === 'processed').length}
                    </div>
                    <div className="text-sm text-green-600">Documentos Procesados</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-900">
                      {new Set(tables.map(t => t.document_id)).size}
                    </div>
                    <div className="text-sm text-purple-600">Documentos Únicos</div>
                  </div>
                </div>

                {/* Lista de tablas */}
                <div className="space-y-3">
                  {tables.map((table) => (
                    <div 
                      key={table.id} 
                      className="border border-gray-200 rounded-lg p-4 hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all duration-200"
                      onClick={() => handleTableClick(table)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3">
                            <TableCellsIcon className="h-5 w-5 text-gray-400" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {table.document.filename}
                              </p>
                              <div className="flex items-center space-x-4 mt-1">
                                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                  Tabla {table.table_index + 1}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatDate(table.created_at)}
                                </span>
                                <span className="text-xs text-gray-500">
                                  ID: {table.id}
                                </span>
                              </div>
                              <div className="text-xs text-blue-600 mt-1">
                                Haz clic para ver contenido y descargar
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          {getStatusBadge(table.document.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de tabla individual */}
      {selectedTable && (
        <TableModal
          isOpen={isTableModalOpen}
          onClose={handleCloseTableModal}
          tableId={selectedTable.id}
          documentFilename={selectedTable.documentFilename}
          tableIndex={selectedTable.tableIndex}
        />
      )}
    </div>
  );
};

export default DepartmentTablesModal;
