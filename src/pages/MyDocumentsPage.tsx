import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { documentService } from '../services/documentService';
import { useToast } from '../hooks/useToast';
import { Link } from 'react-router-dom';
import { CloudArrowUpIcon, CogIcon } from '@heroicons/react/24/outline';
import DocumentProcessor from '../components/documents/DocumentProcessor';

interface MyDocument {
  id: number;
  filename: string;
  status: string;
  uploaded_at: string;
  processed_at?: string;
  department_id: number;
}

const MyDocumentsPage: React.FC = () => {
  const { user } = useAuth();
  const { showError } = useToast();
  const [documents, setDocuments] = useState<MyDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'processed' | 'failed'>('all');

  useEffect(() => {
    const loadMyDocuments = async () => {
      if (!user?.id) return; // No cargar si no hay usuario
      
      try {
        setIsLoading(true);
        const response = await documentService.getDocuments({
          limit: 50, // Límite razonable
          offset: 0
        });
        
        // Filtrar solo los documentos del usuario actual y aplicar filtro de estado
        let myDocuments = response.items.filter((doc: any) => 
          doc.uploaded_by === user.id
        );
        
        // Aplicar filtro de estado localmente
        if (filter !== 'all') {
          myDocuments = myDocuments.filter((doc: any) => doc.status === filter);
        }
        
        setDocuments(myDocuments);
      } catch (error: any) {
        console.error('Error loading my documents:', error);
        showError('Error al cargar tus documentos');
      } finally {
        setIsLoading(false);
      }
    };

    loadMyDocuments();
  }, [filter, user?.id]); // Removido showError de las dependencias

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredDocuments = documents.filter(doc => {
    if (filter === 'all') return true;
    return doc.status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Mis Documentos
            </h1>
            <p className="text-gray-600">
              Gestiona únicamente los documentos que has subido al sistema
            </p>
          </div>
          <div className="flex space-x-3">
            <Link
              to="/process-documents"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <CogIcon className="h-5 w-5 mr-2" />
              Procesar Documentos
            </Link>
            <Link
              to="/upload-documents"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <CloudArrowUpIcon className="h-5 w-5 mr-2" />
              Subir Documentos
            </Link>
          </div>
        </div>
      </div>

      {/* Procesador de documentos */}
      <DocumentProcessor 
        documents={documents}
        onProcessingComplete={async () => {
          // Recargar documentos después del procesamiento
          if (!user?.id) return;
          try {
            setIsLoading(true);
            const response = await documentService.getDocuments({
              limit: 50,
              offset: 0
            });
            
            let myDocuments = response.items.filter((doc: any) => 
              doc.uploaded_by === user.id
            );
            
            if (filter !== 'all') {
              myDocuments = myDocuments.filter((doc: any) => doc.status === filter);
            }
            
            setDocuments(myDocuments);
          } catch (error: any) {
            console.error('Error loading my documents:', error);
            showError('Error al cargar tus documentos');
          } finally {
            setIsLoading(false);
          }
        }}
      />

      {/* Filtros rápidos */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todos ({documents.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'pending' 
                ? 'bg-yellow-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pendientes ({documents.filter(d => d.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('processed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'processed' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Procesados ({documents.filter(d => d.status === 'processed').length})
          </button>
          <button
            onClick={() => setFilter('failed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'failed' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Fallidos ({documents.filter(d => d.status === 'failed').length})
          </button>
        </div>
      </div>

      {/* Lista de documentos */}
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
      ) : filteredDocuments.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Archivo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subido
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Procesado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {doc.filename}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(doc.status)}`}>
                        {getStatusText(doc.status)}
                      </span>
                    </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                       {formatDate(doc.uploaded_at)}
                     </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {doc.processed_at ? formatDate(doc.processed_at) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-500">No tienes documentos {filter !== 'all' ? `en estado ${filter}` : ''}</p>
        </div>
      )}
    </div>
  );
};

export default MyDocumentsPage;
