import api from './api';

export interface TableSearchParams {
  q: string;
  department_id?: number;
  limit?: number;
  offset?: number;
}

export interface TableSearchResult {
  document: {
    id: number;
    filename: string;
    department_id: number;
    uploaded_at: string;
    status: string;
    uploaded_by: number;
  };
  table: {
    id: number;
    index: number;
    created_at: string;
    content: any;
  };
}

export interface TableSearchResponse {
  items: TableSearchResult[];
  limit: number;
  offset: number;
}

export interface Table {
  id: number;
  document_id: number;
  table_index: number;
  content: any;
  created_at: string;
}

export interface TablesByDocumentResponse {
  items: Table[];
}

export const tableService = {
  async searchTables(params: TableSearchParams): Promise<TableSearchResponse> {
    const response = await api.get('/tables/search', { params });
    return response.data;
  },

  async getMyTables(params: { q?: string; limit?: number; offset?: number } = {}): Promise<TableSearchResponse> {
    const response = await api.get('/tables/my-tables', { params });
    return response.data;
  },

  async downloadMyTables(): Promise<Blob> {
    const response = await api.get('/tables/my-tables/download', {
      responseType: 'blob',
    });
    return response.data;
  },

  async getTablesByDocument(documentId: number): Promise<TablesByDocumentResponse> {
    const response = await api.get(`/tables/${documentId}`);
    return response.data;
  },

  async getTableById(tableId: number): Promise<any> {
    const response = await api.get(`/tables/table/${tableId}`);
    return response.data;
  },

  async exportTablesCSV(documentId: number): Promise<Blob> {
    const response = await api.get(`/tables/${documentId}/export`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
