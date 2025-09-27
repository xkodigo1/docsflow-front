// Hook personalizado para manejar documentos y conexión con la base de datos
import { useState, useEffect, useCallback, useRef } from 'react';
import { documentsService } from '../services/documentsService';
import type { 
    Document, 
    CreateDocumentData, 
    UpdateDocumentData, 
    DocumentsResponse,
    PaginationParams 
} from '../types/documents';

interface UseDocumentsOptions {
    autoFetch?: boolean;
    initialParams?: PaginationParams;
}

interface UseDocumentsReturn {
    // Estado
    documents: Document[];
    currentDocument: Document | null;
    loading: boolean;
    error: string | null;
    pagination: {
        total: number;
        page: number;
        limit: number;
    };

    // Métodos para interactuar con la base de datos
    fetchDocuments: (params?: PaginationParams) => Promise<void>;
    fetchDocumentById: (id: number) => Promise<void>;
    createDocument: (data: CreateDocumentData) => Promise<Document | null>;
    updateDocument: (id: number, data: UpdateDocumentData) => Promise<Document | null>;
    deleteDocument: (id: number) => Promise<boolean>;
    searchDocuments: (query: string, params?: PaginationParams) => Promise<void>;
    uploadFile: (id: number, file: File) => Promise<Document | null>;
    
    // Utilidades
    clearError: () => void;
    setCurrentDocument: (document: Document | null) => void;
    refetch: () => Promise<void>;
}

export const useDocuments = (options: UseDocumentsOptions = {}): UseDocumentsReturn => {
    const { autoFetch = true, initialParams = {} } = options;

    // Estado
    const [documents, setDocuments] = useState<Document[]>([]);
    const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 10,
    });
    
    // Usar useRef para evitar bucles infinitos
    const lastParamsRef = useRef<PaginationParams>(initialParams);
    const hasInitialized = useRef(false);

    // Limpiar errores
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Obtener documentos de la base de datos
    const fetchDocuments = useCallback(async (params: PaginationParams = {}) => {
        setLoading(true);
        setError(null);
        
        try {
            const mergedParams = { ...lastParamsRef.current, ...params };
            lastParamsRef.current = mergedParams;
            
            const response: DocumentsResponse = await documentsService.getDocuments(mergedParams);
            
            setDocuments(response.documents);
            setPagination({
                total: response.total,
                page: response.page,
                limit: response.limit,
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al cargar documentos';
            setError(errorMessage);
            console.error('Error fetching documents:', err);
        } finally {
            setLoading(false);
        }
    }, []); // Sin dependencias para evitar bucles

    // Obtener documento específico
    const fetchDocumentById = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);
        
        try {
            const document = await documentsService.getDocumentById(id);
            setCurrentDocument(document);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al cargar documento';
            setError(errorMessage);
            console.error('Error fetching document:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Crear nuevo documento
    const createDocument = useCallback(async (data: CreateDocumentData): Promise<Document | null> => {
        setLoading(true);
        setError(null);
        
        try {
            const newDocument = await documentsService.createDocument(data);
            
            // Actualizar la lista local
            setDocuments(prev => [newDocument, ...prev]);
            setPagination(prev => ({ ...prev, total: prev.total + 1 }));
            
            return newDocument;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al crear documento';
            setError(errorMessage);
            console.error('Error creating document:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Actualizar documento
    const updateDocument = useCallback(async (id: number, data: UpdateDocumentData): Promise<Document | null> => {
        setLoading(true);
        setError(null);
        
        try {
            const updatedDocument = await documentsService.updateDocument(id, data);
            
            // Actualizar en la lista local
            setDocuments(prev => prev.map(doc => doc.id === id ? updatedDocument : doc));
            
            // Si es el documento actual, actualizarlo también
            if (currentDocument?.id === id) {
                setCurrentDocument(updatedDocument);
            }
            
            return updatedDocument;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al actualizar documento';
            setError(errorMessage);
            console.error('Error updating document:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, [currentDocument]);

    // Eliminar documento
    const deleteDocument = useCallback(async (id: number): Promise<boolean> => {
        setLoading(true);
        setError(null);
        
        try {
            await documentsService.deleteDocument(id);
            
            // Remover de la lista local
            setDocuments(prev => prev.filter(doc => doc.id !== id));
            setPagination(prev => ({ ...prev, total: prev.total - 1 }));
            
            // Si es el documento actual, limpiarlo
            if (currentDocument?.id === id) {
                setCurrentDocument(null);
            }
            
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al eliminar documento';
            setError(errorMessage);
            console.error('Error deleting document:', err);
            return false;
        } finally {
            setLoading(false);
        }
    }, [currentDocument]);

    // Buscar documentos
    const searchDocuments = useCallback(async (query: string, params: PaginationParams = {}) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await documentsService.searchDocuments(query, params);
            setDocuments(response.documents);
            setPagination({
                total: response.total,
                page: response.page,
                limit: response.limit,
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error en la búsqueda';
            setError(errorMessage);
            console.error('Error searching documents:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Subir archivo
    const uploadFile = useCallback(async (id: number, file: File): Promise<Document | null> => {
        setLoading(true);
        setError(null);
        
        try {
            const updatedDocument = await documentsService.uploadDocumentFile(id, file);
            
            // Actualizar en la lista local
            setDocuments(prev => prev.map(doc => doc.id === id ? updatedDocument : doc));
            
            if (currentDocument?.id === id) {
                setCurrentDocument(updatedDocument);
            }
            
            return updatedDocument;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al subir archivo';
            setError(errorMessage);
            console.error('Error uploading file:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, [currentDocument]);

    // Refrescar datos
    const refetch = useCallback(async () => {
        await fetchDocuments(lastParamsRef.current);
    }, [fetchDocuments]);

    // Auto-fetch al montar el componente (solo una vez)
    useEffect(() => {
        if (autoFetch && !hasInitialized.current) {
            hasInitialized.current = true;
            fetchDocuments(initialParams);
        }
    }, [autoFetch, fetchDocuments, initialParams]);

    return {
        // Estado
        documents,
        currentDocument,
        loading,
        error,
        pagination,

        // Métodos
        fetchDocuments,
        fetchDocumentById,
        createDocument,
        updateDocument,
        deleteDocument,
        searchDocuments,
        uploadFile,

        // Utilidades
        clearError,
        setCurrentDocument,
        refetch,
    };
};
