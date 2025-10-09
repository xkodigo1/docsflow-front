import api from './api';

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

export interface DocumentListResponse {
  items: Document[];
  limit: number;
  offset: number;
}

export interface DocumentSearchParams {
  limit?: number;
  offset?: number;
  department_id?: number;
  document_type?: string;
  status?: string;
}

export interface DocumentSearchQuery {
  q?: string;
  department_id?: number;
  document_type?: string;
  limit?: number;
  offset?: number;
}

export interface DocumentStatus {
  id: number;
  status: string;
  processed_at?: string;
  last_attempt_at?: string;
  error_message?: string;
}

export const documentService = {
  async uploadDocument(
    file: File, 
    departmentId?: number, 
    documentType?: string
  ): Promise<{ message: string; document_id: number }> {
    const formData = new FormData();
    formData.append('file', file);
    if (departmentId) formData.append('department_id', departmentId.toString());
    if (documentType) formData.append('document_type', documentType);

    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getDocuments(params?: DocumentSearchParams): Promise<DocumentListResponse> {
    const response = await api.get('/documents/', { params });
    return response.data;
  },

  async getDocument(id: number): Promise<Document> {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },

  async deleteDocument(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  },

  async processDocument(id: number): Promise<{ message: string }> {
    const response = await api.post(`/documents/${id}/process`);
    return response.data;
  },

  async reprocessDocument(id: number): Promise<{ message: string }> {
    const response = await api.post(`/documents/${id}/reprocess`);
    return response.data;
  },

  async searchDocuments(params: DocumentSearchQuery): Promise<DocumentListResponse> {
    const response = await api.get('/documents/search', { params });
    return response.data;
  },

  async downloadDocument(id: number): Promise<Blob> {
    const response = await api.get(`/documents/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  async getDocumentStatus(id: number): Promise<DocumentStatus> {
    const response = await api.get(`/documents/${id}/status`);
    return response.data;
  },
};
