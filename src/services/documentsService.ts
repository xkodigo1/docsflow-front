// Servicio para manejar documentos desde la base de datos
import axios from 'axios';
import type { 
    Document, 
    CreateDocumentData, 
    UpdateDocumentData, 
    DocumentsResponse, 
    ApiResponse,
    PaginationParams 
} from '../types/documents';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const api = axios.create({
    baseURL: API_URL,
    // No establecer Content-Type por defecto. Deja que el navegador lo gestione (especialmente para FormData)
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor para manejar errores de autenticación y mejorar mensajes de error
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Log del error completo para debug
        console.error('API Error:', error);
        
        if (error.response) {
            // Error con respuesta del servidor
            console.error('Response Error:', error.response.status, error.response.data);
            
            if (error.response.status === 401) {
                localStorage.removeItem('authToken');
                window.location.href = '/login';
            }
        } else if (error.request) {
            // Error de red (no hay respuesta del servidor)
            console.error('Network Error - No response received:', error.request);
            console.error('Request config:', error.config);
        } else {
            // Error en la configuración de la petición
            console.error('Request Setup Error:', error.message);
        }
        
        return Promise.reject(error);
    }
);

export const documentsService = {
    // Obtener documentos de prueba (sin autenticación)
    async getTestDocuments(): Promise<DocumentsResponse> {
        const response = await api.get('/documents/test-list');
        const data = response.data;
        
        // Transformar la respuesta al formato esperado por el frontend
        const documents = data.items.map((item: any) => ({
            id: item.id,
            title: item.filename,
            content: `Documento subido el ${new Date(item.uploaded_at).toLocaleDateString()}`,
            type: item.filename.split('.').pop()?.toLowerCase() || 'unknown',
            status: item.status,
            userId: item.uploaded_by,
            createdAt: item.uploaded_at,
            updatedAt: item.processed_at || item.uploaded_at,
            tags: [],
            fileUrl: item.filepath || '',
            fileName: item.filename,
            fileSize: 0,
            departmentId: item.department_id
        }));
        
        return {
            documents,
            total: data.total,
            page: 1,
            limit: data.total
        };
    },

    // Obtener todos los documentos con paginación (usar directamente test-list)
    async getDocuments(_params: PaginationParams = {}): Promise<DocumentsResponse> {
        return await this.getTestDocuments();
    },

    // Obtener un documento específico por ID
    async getDocumentById(id: number): Promise<Document> {
        const response = await api.get<ApiResponse<Document>>(`/documents/${id}`);
        return response.data.data;
    },

    // Crear un nuevo documento
    async createDocument(documentData: CreateDocumentData): Promise<Document> {
        const response = await api.post<ApiResponse<Document>>('/documents/', documentData);
        return response.data.data;
    },

    // Actualizar un documento existente
    async updateDocument(id: number, documentData: UpdateDocumentData): Promise<Document> {
        const response = await api.put<ApiResponse<Document>>(`/documents/${id}`, documentData);
        return response.data.data;
    },

    // Eliminar un documento
    async deleteDocument(id: number): Promise<void> {
        await api.delete(`/documents/${id}`);
    },

    // Obtener documentos del usuario actual
    async getUserDocuments(params: PaginationParams = {}): Promise<DocumentsResponse> {
        const queryParams = new URLSearchParams();
        
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.search) queryParams.append('search', params.search);
        if (params.status) queryParams.append('status', params.status);
        
        const response = await api.get<DocumentsResponse>(`/documents/?${queryParams}`);
        return response.data;
    },

    // Subir archivo de documento
    async uploadDocumentFile(id: number, file: File): Promise<Document> {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await api.post<ApiResponse<Document>>(`/documents/${id}/upload`, formData, {
            // No establecer Content-Type manualmente para FormData
        });
        return response.data.data;
    },

    // Buscar documentos (usar directamente test-list)
    async searchDocuments(query: string, _params: PaginationParams = {}): Promise<DocumentsResponse> {
        // Ir directamente a la petición que funciona (200 OK)
        console.log('Usando búsqueda en documentos de prueba directamente');
        const response = await api.get(`/documents/test-list?q=${encodeURIComponent(query)}`);
        const data = response.data;
        
        // Transformar la respuesta al formato esperado por el frontend
        const documents = data.items.map((item: any) => ({
            id: item.id,
            title: item.filename,
            content: `Documento subido el ${new Date(item.uploaded_at).toLocaleDateString()}`,
            type: item.filename.split('.').pop()?.toLowerCase() || 'unknown',
            status: item.status,
            userId: item.uploaded_by,
            createdAt: item.uploaded_at,
            updatedAt: item.processed_at || item.uploaded_at,
            tags: [],
            fileUrl: item.filepath || '',
            fileName: item.filename,
            fileSize: 0,
            departmentId: item.department_id
        }));
        
        return {
            documents,
            total: data.total,
            page: 1,
            limit: data.total
        };
    },

    // Subir archivo y crear documento en una sola operación
    async uploadFileAndCreateDocument(
        file: File, 
        metadata: { title?: string; content?: string; type?: string; tags?: string[] } = {},
        onProgress?: (progress: number) => void
    ): Promise<Document> {
        const formData = new FormData();
        formData.append('file', file);
        
        // Añadir metadatos
        if (metadata.title) formData.append('title', metadata.title);
        if (metadata.content) formData.append('content', metadata.content);
        if (metadata.type) formData.append('type', metadata.type);
        if (metadata.tags) formData.append('tags', JSON.stringify(metadata.tags));

        const response = await api.post<ApiResponse<Document>>('/documents/upload-test', formData, {
            // No establecer Content-Type manualmente para FormData
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(progress);
                }
            },
        });
        return response.data.data;
    },

    // Subir solo archivo (sin crear documento)
    async uploadFileOnly(
        file: File,
        onProgress?: (progress: number) => void
    ): Promise<{ fileUrl: string; fileName: string; fileSize: number }> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post<ApiResponse<{ fileUrl: string; fileName: string; fileSize: number }>>('/upload/file', formData, {
            // No establecer Content-Type manualmente para FormData
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(progress);
                }
            },
        });
        return response.data.data;
    }
};

// Exportar la instancia de axios configurada por si necesitas hacer peticiones personalizadas
export { api };
