import React, { useState, useEffect } from 'react';
import { XMarkIcon, DocumentIcon, MagnifyingGlassIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { documentService } from '../../services/documentService';
import { useToast } from '../../hooks/useToast';
import { useDebounce } from '../../hooks/useDebounce';

interface DepartmentDocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  departmentId: number;
  departmentName: string;
}

interface DepartmentDocument {
  id: number;
  filename: string;
  status: 'pending' | 'processing' | 'processed' | 'error';
  uploaded_at: string;
  processed_at?: string;
  document_type?: string;
  uploaded_by: number;
  error_message?: string;
}

const DepartmentDocumentsModal: React.FC<DepartmentDocumentsModalProps> = ({
  isOpen,
  onClose,
  departmentId,
  departmentName
}) => {
  const { showError } = useToast();
  const [documents, setDocuments] = useState<DepartmentDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (isOpen) {
      loadDepartmentDocuments();
    }
  }, [isOpen, departmentId, debouncedSearchQuery]);

  const loadDepartmentDocuments = async () => {
    try {
      setIsLoading(true);
      const response = await documentService.getDocuments({
        department_id: departmentId,
        limit: 100,
        offset: 0
      });
      
      let filteredDocuments = response.items;
      
      // Filtrar por búsqueda si hay query
      if (debouncedSearchQuery.trim()) {
        filteredDocuments = response.items.filter(doc => 
          doc.filename.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
        );
      }
      
      setDocuments(filteredDocuments);
    } catch (error: any) {
      console.error('Error loading department documents:', error);
      showError('Error al cargar los documentos del departamento');
    } finally {
      setIsLoading(false);
    }
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
              <DocumentIcon className="h-6 w-6 text-blue-500" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Documentos de {departmentName}
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
                placeholder="Buscar documentos del departamento..."
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
            ) : documents.length === 0 ? (
              <div className="text-center py-12">
                <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">No hay documentos</h3>
                <p className="mt-1 text-sm text-gray-600">
                  {searchQuery ? 'No se encontraron documentos con ese criterio' : 'Este departamento no tiene documentos subidos'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Estadísticas */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-900">{documents.length}</div>
                    <div className="text-sm text-blue-600">Total Documentos</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-900">
                      {documents.filter(d => d.status === 'processed').length}
                    </div>
                    <div className="text-sm text-green-600">Procesados</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-900">
                      {documents.filter(d => d.status === 'pending').length}
                    </div>
                    <div className="text-sm text-yellow-600">Pendientes</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-red-900">
                      {documents.filter(d => d.status === 'error').length}
                    </div>
                    <div className="text-sm text-red-600">Con Error</div>
                  </div>
                </div>

                {/* Lista de documentos */}
                <div className="space-y-3">
                  {documents.map((document) => (
                    <div key={document.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <DocumentIcon className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {document.filename}
                            </p>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-xs text-gray-500">
                                ID: {document.id}
                              </span>
                              <span className="text-xs text-gray-500">
                                Subido: {formatDate(document.uploaded_at)}
                              </span>
                              {document.document_type && (
                                <span className="text-xs text-gray-500">
                                  Tipo: {document.document_type}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          {getStatusBadge(document.status)}
                        </div>
                      </div>
                      
                      {document.status === 'error' && document.error_message && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                          Error: {document.error_message}
                        </div>
                      )}
                      
                      {document.processed_at && (
                        <div className="mt-2 flex items-center text-xs text-gray-500">
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          Procesado: {formatDate(document.processed_at)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentDocumentsModal;
