// Hook para manejar subida de archivos a la base de datos
import { useState, useCallback } from 'react';
import { documentsService } from '../services/documentsService';
import type { Document } from '../types/documents';

interface UploadProgress {
    file: File;
    progress: number;
    status: 'uploading' | 'success' | 'error' | 'idle';
    error?: string;
    document?: Document;
}

interface UseFileUploadReturn {
    // Estado
    uploads: { [key: string]: UploadProgress };
    isUploading: boolean;
    
    // Métodos
    uploadFile: (file: File, metadata?: {
        title?: string;
        content?: string;
        type?: string;
        tags?: string[];
    }) => Promise<Document | null>;
    
    uploadMultipleFiles: (files: File[], metadata?: {
        title?: string;
        content?: string;
        type?: string;
        tags?: string[];
    }) => Promise<Document[]>;
    
    clearUploads: () => void;
    removeUpload: (fileId: string) => void;
    
    // Utilidades
    getTotalProgress: () => number;
    getSuccessfulUploads: () => Document[];
    getFailedUploads: () => UploadProgress[];
}

export const useFileUpload = (): UseFileUploadReturn => {
    const [uploads, setUploads] = useState<{ [key: string]: UploadProgress }>({});

    // Generar ID único para cada archivo
    const generateFileId = useCallback((file: File): string => {
        return `${file.name}-${file.size}-${Date.now()}`;
    }, []);

    // Verificar si hay uploads en progreso
    const isUploading = Object.values(uploads).some(upload => upload.status === 'uploading');

    // Subir un archivo
    const uploadFile = useCallback(async (
        file: File, 
        metadata: {
            title?: string;
            content?: string;
            type?: string;
            tags?: string[];
        } = {}
    ): Promise<Document | null> => {
        const fileId = generateFileId(file);
        
        // Inicializar el estado del upload
        setUploads(prev => ({
            ...prev,
            [fileId]: {
                file,
                progress: 0,
                status: 'uploading'
            }
        }));

        try {
            // Determinar metadatos automáticamente si no se proporcionan
            const fileMetadata = {
                title: metadata.title || file.name.replace(/\.[^/.]+$/, ""), // Remover extensión
                content: metadata.content || `Archivo subido: ${file.name}`,
                type: metadata.type || file.type || 'application/octet-stream',
                tags: metadata.tags || []
            };

            const document = await documentsService.uploadFileAndCreateDocument(
                file,
                fileMetadata,
                (progress) => {
                    setUploads(prev => ({
                        ...prev,
                        [fileId]: {
                            ...prev[fileId],
                            progress
                        }
                    }));
                }
            );

            // Marcar como exitoso
            setUploads(prev => ({
                ...prev,
                [fileId]: {
                    ...prev[fileId],
                    status: 'success',
                    progress: 100,
                    document
                }
            }));

            return document;
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido al subir archivo';
            
            // Marcar como error
            setUploads(prev => ({
                ...prev,
                [fileId]: {
                    ...prev[fileId],
                    status: 'error',
                    error: errorMessage
                }
            }));

            console.error('Error uploading file:', error);
            return null;
        }
    }, [generateFileId]);

    // Subir múltiples archivos
    const uploadMultipleFiles = useCallback(async (
        files: File[], 
        metadata: {
            title?: string;
            content?: string;
            type?: string;
            tags?: string[];
        } = {}
    ): Promise<Document[]> => {
        const uploadPromises = files.map(file => uploadFile(file, metadata));
        const results = await Promise.all(uploadPromises);
        return results.filter((doc): doc is Document => doc !== null);
    }, [uploadFile]);

    // Limpiar todos los uploads
    const clearUploads = useCallback(() => {
        setUploads({});
    }, []);

    // Remover un upload específico
    const removeUpload = useCallback((fileId: string) => {
        setUploads(prev => {
            const newUploads = { ...prev };
            delete newUploads[fileId];
            return newUploads;
        });
    }, []);

    // Obtener progreso total
    const getTotalProgress = useCallback((): number => {
        const uploadsArray = Object.values(uploads);
        if (uploadsArray.length === 0) return 0;
        
        const totalProgress = uploadsArray.reduce((sum, upload) => sum + upload.progress, 0);
        return Math.round(totalProgress / uploadsArray.length);
    }, [uploads]);

    // Obtener uploads exitosos
    const getSuccessfulUploads = useCallback((): Document[] => {
        return Object.values(uploads)
            .filter(upload => upload.status === 'success' && upload.document)
            .map(upload => upload.document!)
            .filter(Boolean);
    }, [uploads]);

    // Obtener uploads fallidos
    const getFailedUploads = useCallback((): UploadProgress[] => {
        return Object.values(uploads)
            .filter(upload => upload.status === 'error');
    }, [uploads]);

    return {
        // Estado
        uploads,
        isUploading,

        // Métodos
        uploadFile,
        uploadMultipleFiles,
        clearUploads,
        removeUpload,

        // Utilidades
        getTotalProgress,
        getSuccessfulUploads,
        getFailedUploads
    };
};
