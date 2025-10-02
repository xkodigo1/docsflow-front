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
    // No establecer Content-Type por defecto. Deja que el navegador lo gestione
    maxRedirects: 0, // Evitar redirecciones automáticas para debug
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

// Utilidad: transformar filas del backend al tipo Document del frontend
const mapBackendRowToDocument = (item: any): Document => ({
    id: item.id,
    title: item.filename || item.title || `Documento ${item.id}`,
    content: item.content || (item.uploaded_at ? `Documento subido el ${new Date(item.uploaded_at).toLocaleDateString()}` : undefined),
    type: item.document_type || (item.filename ? item.filename.split('.').pop()?.toLowerCase() : undefined),
    status: item.status || 'draft',
    userId: item.uploaded_by,
    createdAt: item.uploaded_at,
    updatedAt: item.processed_at || item.uploaded_at,
    tags: item.tags || [],
    fileUrl: item.filepath || '',
    fileName: item.filename,
    fileSize: item.fileSize || 0,
});

export const documentsService = {
    // Obtener documentos con autenticación real
    async getDocuments(params: PaginationParams = {}): Promise<DocumentsResponse> {
        const limit = params.limit ?? 10;
        const page = params.page ?? 1;
        const offset = (page - 1) * limit;
        const url = `/documents/?limit=${limit}&offset=${offset}`;
        const response = await api.get(url);
        const data = response.data;

        const documents = (data.items || []).map(mapBackendRowToDocument);

        return {
            documents,
            total: data.total ?? documents.length,
            page,
            limit,
        };
    },

    // Obtener un documento específico por ID
    async getDocumentById(id: number): Promise<Document> {
        const response = await api.get(`/documents/${id}`);
        const data = response.data;
        // Cuando el backend devuelve el documento como objeto plano
        return mapBackendRowToDocument(data);
    },

    // Crear un nuevo documento (metadata sin archivo)
    async createDocument(documentData: CreateDocumentData): Promise<Document> {
        const response = await api.post('/documents/', documentData);
        const data = response.data;
        return mapBackendRowToDocument(data);
    },

    // Actualizar un documento existente
    async updateDocument(id: number, documentData: UpdateDocumentData): Promise<Document> {
        const response = await api.put(`/documents/${id}`, documentData);
        const data = response.data;
        return mapBackendRowToDocument(data);
    },

    // Eliminar un documento
    async deleteDocument(id: number): Promise<void> {
        await api.delete(`/documents/${id}`);
    },

    // Obtener documentos del usuario actual (alias a getDocuments por ahora)
    async getUserDocuments(params: PaginationParams = {}): Promise<DocumentsResponse> {
        return this.getDocuments(params);
    },

    // Subir archivo de documento (subir archivo adicional a un documento existente)
    async uploadDocumentFile(id: number, file: File): Promise<Document> {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post(`/documents/${id}/upload`, formData);
        const data = response.data;
        return mapBackendRowToDocument(data.data ?? data);
    },

    // Buscar documentos (usar endpoint principal y filtrar del lado del cliente)
    async searchDocuments(query: string, params: PaginationParams = {}): Promise<DocumentsResponse> {
        const limit = params.limit ?? 50; // Aumentamos el límite para tener más datos para filtrar
        const page = params.page ?? 1;
        const offset = (page - 1) * limit;
        const url = `/documents/?limit=${limit}&offset=${offset}`;
        
        console.log('Búsqueda en API:', { query, url }); // Debug
        
        const response = await api.get(url);
        const data = response.data;
        
        console.log('Respuesta de API:', data); // Debug
        
        // Mapear todos los documentos
        const allDocuments = (data.items || []).map(mapBackendRowToDocument);
        
        // Filtrar del lado del cliente por el query
        const filteredDocuments = query.trim() 
            ? allDocuments.filter(doc => {
                const searchText = query.toLowerCase();
                return (
                    doc.title.toLowerCase().includes(searchText) ||
                    doc.fileName?.toLowerCase().includes(searchText) ||
                    doc.content?.toLowerCase().includes(searchText) ||
                    doc.type?.toLowerCase().includes(searchText)
                );
            })
            : allDocuments;
        
        console.log('Documentos filtrados:', { query, total: filteredDocuments.length }); // Debug
        
        return {
            documents: filteredDocuments,
            total: filteredDocuments.length,
            page,
            limit,
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
        
        // El backend requiere department_id para usuarios admin
        // Por ahora usamos department_id = 1 por defecto
        formData.append('department_id', '1');
        
        // Metadatos opcionales
        if (metadata.type) formData.append('document_type', metadata.type);

        const response = await api.post('/documents/upload', formData, {
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(progress);
                }
            },
        });
        const data = response.data;
        // El endpoint /documents/upload devuelve { message, document_id }
        // Recuperamos el documento creado para devolverlo completo
        const createdId = data.document_id;
        if (createdId) {
            // Intentar fetch del documento nuevo
            try {
                const doc = await this.getDocumentById(createdId);
                return doc;
            } catch {
                // Si falla, devolvemos un objeto mínimo
                return {
                    id: createdId,
                    title: metadata.title || file.name,
                    content: metadata.content,
                    type: metadata.type,
                    status: 'draft',
                    userId: 0,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    tags: metadata.tags || [],
                    fileUrl: '',
                    fileName: file.name,
                    fileSize: file.size,
                };
            }
        }
        // Si la API devolviera el documento completo en data.data, mapearlo
        return mapBackendRowToDocument(data.data ?? data);
    },

    // Subir solo archivo (sin crear documento)
    async uploadFileOnly(
        file: File,
        onProgress?: (progress: number) => void
    ): Promise<{ fileUrl: string; fileName: string; fileSize: number }> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/upload/file', formData, {
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(progress);
                }
            },
        });
        return response.data.data ?? response.data;
    }
};

// Exportar la instancia de axios configurada por si necesitas hacer peticiones personalizadas
export { api };
