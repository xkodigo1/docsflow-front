// Tipos para documentos y otros datos de la base de datos
export interface Document {
    id: number;
    title: string;
    content?: string;
    type?: string;
    status: 'draft' | 'published' | 'archived';
    userId: number;
    createdAt: string;
    updatedAt: string;
    tags?: string[];
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
}

export interface CreateDocumentData {
    title: string;
    content?: string;
    type?: string;
    tags?: string[];
}

export interface UpdateDocumentData {
    title?: string;
    content?: string;
    type?: string;
    status?: 'draft' | 'published' | 'archived';
    tags?: string[];
}

export interface DocumentsResponse {
    documents: Document[];
    total: number;
    page: number;
    limit: number;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface PaginationParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
