import React, { useState, useEffect } from 'react';
import { useDocuments } from '../../contexts/DocumentContext';

const DocumentList: React.FC = () => {
  const { 
    documents, 
    isLoading, 
    error, 
    loadDocuments, 
    searchDocuments, 
    deleteDocument, 
    processDocument, 
    reprocessDocument, 
    downloadDocument 
  } = useDocuments();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    loadDocuments({
      limit: 20,
      offset: currentPage * 20,
      document_type: filterType || undefined,
    });
  }, [currentPage, filterType]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      await searchDocuments(searchQuery, {
        limit: 20,
        offset: 0,
        document_type: filterType || undefined,
      });
      setCurrentPage(0);
    } else {
      await loadDocuments({
        limit: 20,
        offset: 0,
        document_type: filterType || undefined,
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este documento?')) {
      try {
        await deleteDocument(id);
      } catch (error) {
        // Error ya manejado en el contexto
      }
    }
  };

  const handleProcess = async (id: number) => {
    try {
      await processDocument(id);
    } catch (error) {
      // Error ya manejado en el contexto
    }
  };

  const handleReprocess = async (id: number) => {
    try {
      await reprocessDocument(id);
    } catch (error) {
      // Error ya manejado en el contexto
    }
  };

  const handleDownload = async (id: number) => {
    try {
      await downloadDocument(id);
    } catch (error) {
      // Error ya manejado en el contexto
    }
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
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
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

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar documentos..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Buscar
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos los tipos</option>
              <option value="factura">Factura</option>
              <option value="reporte">Reporte</option>
              <option value="contrato">Contrato</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="processing">Procesando</option>
              <option value="processed">Procesado</option>
              <option value="error">Error</option>
            </select>
          </div>
        </form>
      </div>

      {/* Documents list */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Documentos</h3>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-4xl">📄</span>
            <p className="mt-2 text-gray-500">No hay documentos</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {documents.map((document) => (
              <div key={document.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">📄</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {document.filename}
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          <p className="text-xs text-gray-500">
                            Subido: {formatDate(document.uploaded_at)}
                          </p>
                          {document.document_type && (
                            <span className="text-xs text-gray-500">
                              Tipo: {document.document_type}
                            </span>
                          )}
                          <span className="text-xs text-gray-500">
                            Depto: {document.department_id}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(document.status)}
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDownload(document.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                        title="Descargar"
                      >
                        ⬇️
                      </button>
                      
                      {document.status === 'pending' && (
                        <button
                          onClick={() => handleProcess(document.id)}
                          className="text-green-600 hover:text-green-800 text-sm"
                          title="Procesar"
                        >
                          ▶️
                        </button>
                      )}
                      
                      {document.status === 'error' && (
                        <button
                          onClick={() => handleReprocess(document.id)}
                          className="text-yellow-600 hover:text-yellow-800 text-sm"
                          title="Reprocesar"
                        >
                          🔄
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDelete(document.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
                
                {document.status === 'error' && document.error_message && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                    Error: {document.error_message}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentList;

