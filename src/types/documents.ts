// Tipos para documentos y otros datos de la base de datos
export interface Document {
    id: number;
    filename: string;
    department_id: number;
    status: 'pending' | 'processing' | 'processed' | 'error';
    filepath: string;
    uploaded_by: number;
    uploaded_at: string;
    processed_at?: string;
    last_attempt_at?: string;
    error_message?: string;
    document_type?: string;
}

export interface DocumentUploadData {
    file: File;
    department_id?: number;
    document_type?: string;
}

export interface DocumentSearchParams {
    limit?: number;
    offset?: number;
    department_id?: number;
    document_type?: string;
    status?: string;
}

export interface DocumentsResponse {
    items: Document[];
    limit: number;
    offset: number;
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
