import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { documentService } from '../services/documentService';
import { useToast } from '../hooks/useToast';
import DocumentProcessor from '../components/documents/DocumentProcessor';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, DocumentIcon, ClockIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface ProcessDocument {
  id: number;
  filename: string;
  status: string;
  uploaded_at: string;
  processed_at?: string;
}

const ProcessDocumentsPage: React.FC = () => {
  const { user } = useAuth();
  const { showError } = useToast();
  const [documents, setDocuments] = useState<ProcessDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDocuments = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        const response = await documentService.getDocuments({
          limit: 100, // Más documentos para procesamiento
          offset: 0
        });
        
        // Filtrar solo los documentos del usuario actual
        const myDocuments = response.items.filter((doc: any) => 
          doc.uploaded_by === user.id
        );
        
        setDocuments(myDocuments);
      } catch (error: any) {
        console.error('Error loading documents:', error);
        showError('Error al cargar los documentos');
      } finally {
        setIsLoading(false);
      }
    };

    loadDocuments();
  }, [user?.id]); // Removido showError de las dependencias

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'processing':
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
      case 'error':
        return <ExclamationCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'processed': return 'Procesado';
      case 'processing': return 'Procesando';
      case 'error': return 'Error';
      case 'pending': return 'Pendiente';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed': return 'text-green-600 bg-green-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
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

  const processableCount = documents.filter(doc => 
    doc.status === 'pending' || doc.status === 'error'
  ).length;

  const processedCount = documents.filter(doc => 
    doc.status === 'processed'
  ).length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse bg-white p-6 rounded-lg shadow">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-lg shadow animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Link
                to="/my-documents"
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                Procesamiento de Documentos
              </h1>
            </div>
            <p className="text-gray-600">
              Inicia el procesamiento de tus documentos para extraer tablas
            </p>
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <DocumentIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Documentos</p>
              <p className="text-2xl font-semibold text-gray-900">{documents.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-yellow-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Pendientes</p>
              <p className="text-2xl font-semibold text-gray-900">{processableCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Procesados</p>
              <p className="text-2xl font-semibold text-gray-900">{processedCount}</p>
            </div>
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
              limit: 100,
              offset: 0
            });
            
            const myDocuments = response.items.filter((doc: any) => 
              doc.uploaded_by === user.id
            );
            
            setDocuments(myDocuments);
          } catch (error: any) {
            console.error('Error loading documents:', error);
            showError('Error al cargar los documentos');
          } finally {
            setIsLoading(false);
          }
        }}
      />

      {/* Lista de todos los documentos */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Todos los Documentos
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {documents.length === 0 ? (
            <div className="p-8 text-center">
              <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No hay documentos</h3>
              <p className="mt-1 text-sm text-gray-600">
                Sube algunos documentos para comenzar el procesamiento.
              </p>
              <div className="mt-4">
                <Link
                  to="/upload-documents"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Subir Documentos
                </Link>
              </div>
            </div>
          ) : (
            documents.map((doc) => (
              <div key={doc.id} className="px-4 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(doc.status)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{doc.filename}</p>
                    <p className="text-xs text-gray-500">
                      Subido: {formatDate(doc.uploaded_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(doc.status)}`}>
                    {getStatusText(doc.status)}
                  </span>
                  {doc.processed_at && (
                    <p className="text-xs text-gray-500">
                      Procesado: {formatDate(doc.processed_at)}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProcessDocumentsPage;
