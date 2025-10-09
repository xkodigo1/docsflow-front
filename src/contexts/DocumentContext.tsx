import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Document, DocumentSearchParams } from '../types/documents';
import { documentService } from '../services/documentService';
import { useToast } from '../hooks/useToast';

interface DocumentContextType {
  documents: Document[];
  isLoading: boolean;
  error: string | null;
  total: number;
  currentPage: number;
  limit: number;
  searchParams: DocumentSearchParams;
  setSearchParams: (params: DocumentSearchParams) => void;
  loadDocuments: (params?: DocumentSearchParams) => Promise<void>;
  searchDocuments: (query: string, params?: DocumentSearchParams) => Promise<void>;
  uploadDocument: (file: File, departmentId?: number, documentType?: string) => Promise<void>;
  deleteDocument: (id: number) => Promise<void>;
  processDocument: (id: number) => Promise<void>;
  reprocessDocument: (id: number) => Promise<void>;
  downloadDocument: (id: number) => Promise<void>;
  clearError: () => void;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

interface DocumentProviderProps {
  children: ReactNode;
}

export const DocumentProvider: React.FC<DocumentProviderProps> = ({ children }) => {
  const { showSuccess, showError, showInfo } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [limit] = useState(20);
  const [searchParams, setSearchParamsState] = useState<DocumentSearchParams>({
    limit: 20,
    offset: 0,
  });

  const setSearchParams = (params: DocumentSearchParams) => {
    setSearchParamsState(params);
  };

  const loadDocuments = async (params?: DocumentSearchParams) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const currentParams = params || searchParams;
      const response = await documentService.getDocuments(currentParams);
      
      setDocuments(response.items);
      setTotal(response.items.length);
      setCurrentPage(Math.floor((currentParams.offset || 0) / (currentParams.limit || 20)));
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Error al cargar documentos';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const searchDocuments = async (query: string, params?: DocumentSearchParams) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const searchParams = {
        ...params,
        q: query,
        limit: params?.limit || 20,
        offset: params?.offset || 0,
      };
      
      const response = await documentService.searchDocuments(searchParams);
      
      setDocuments(response.items);
      setTotal(response.items.length);
      setCurrentPage(Math.floor((searchParams.offset || 0) / (searchParams.limit || 20)));
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Error al buscar documentos';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadDocument = async (file: File, departmentId?: number, documentType?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await documentService.uploadDocument(file, departmentId, documentType);
      
      // Recargar la lista de documentos
      await loadDocuments();
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Error al subir documento';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDocument = async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await documentService.deleteDocument(id);
      
      // Remover el documento de la lista
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      setTotal(prev => prev - 1);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Error al eliminar documento';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const processDocument = async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await documentService.processDocument(id);
      
      // Actualizar el estado del documento
      setDocuments(prev => prev.map(doc => 
        doc.id === id 
          ? { ...doc, status: 'processing' as const }
          : doc
      ));

      // Mostrar notificación de éxito
      showSuccess(result.message || 'Documento procesado exitosamente');
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Error al procesar documento';
      setError(errorMessage);
      
      // Mostrar notificación de error
      showError(`Error al procesar documento: ${errorMessage}`);
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const reprocessDocument = async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await documentService.reprocessDocument(id);
      
      // Actualizar el estado del documento
      setDocuments(prev => prev.map(doc => 
        doc.id === id 
          ? { ...doc, status: 'pending' as const, processed_at: undefined }
          : doc
      ));

      // Mostrar notificación de éxito
      showInfo('Documento marcado para reprocesar');
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Error al reprocesar documento';
      setError(errorMessage);
      
      // Mostrar notificación de error
      showError(`Error al reprocesar documento: ${errorMessage}`);
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const downloadDocument = async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const blob = await documentService.downloadDocument(id);
      
      // Crear URL para descarga
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `documento_${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Error al descargar documento';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: DocumentContextType = {
    documents,
    isLoading,
    error,
    total,
    currentPage,
    limit,
    searchParams,
    setSearchParams,
    loadDocuments,
    searchDocuments,
    uploadDocument,
    deleteDocument,
    processDocument,
    reprocessDocument,
    downloadDocument,
    clearError,
  };

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocuments = (): DocumentContextType => {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
};
