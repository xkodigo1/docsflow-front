import api from './api';

export interface SystemStats {
  totalUsers: number;
  totalDocuments: number;
  documentsByStatus: {
    pending: number;
    processing: number;
    processed: number;
    error: number;
  };
  usersByRole: {
    admin: number;
    operador: number;
  };
  recentDocuments: Array<{
    id: number;
    filename: string;
    uploaded_at: string;
    status: string;
    uploaded_by: number;
  }>;
  recentUsers: Array<{
    id: number;
    email: string;
    role: string;
    created_at: string;
  }>;
}

export const statsService = {
  async getSystemStats(): Promise<SystemStats> {
    // Obtener estadísticas de usuarios
    const usersResponse = await api.get('/users/', { params: { limit: 1000 } });
    const users = usersResponse.data.items || [];
    
    // Obtener estadísticas de documentos
    const documentsResponse = await api.get('/documents/', { params: { limit: 1000 } });
    const documents = documentsResponse.data.items || [];
    
    // Calcular estadísticas
    const totalUsers = users.length;
    const totalDocuments = documents.length;
    
    // Documentos por estado
    const documentsByStatus = {
      pending: documents.filter((doc: any) => doc.status === 'pending').length,
      processing: documents.filter((doc: any) => doc.status === 'processing').length,
      processed: documents.filter((doc: any) => doc.status === 'processed').length,
      error: documents.filter((doc: any) => doc.status === 'error').length,
    };
    
    // Usuarios por rol
    const usersByRole = {
      admin: users.filter((user: any) => user.role === 'admin').length,
      operador: users.filter((user: any) => user.role === 'operador').length,
    };
    
    // Documentos recientes (últimos 5)
    const recentDocuments = documents
      .sort((a: any, b: any) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime())
      .slice(0, 5)
      .map((doc: any) => ({
        id: doc.id,
        filename: doc.filename,
        uploaded_at: doc.uploaded_at,
        status: doc.status,
        uploaded_by: doc.uploaded_by,
      }));
    
    // Usuarios recientes (últimos 5)
    const recentUsers = users
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
      .map((user: any) => ({
        id: user.id,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
      }));
    
    return {
      totalUsers,
      totalDocuments,
      documentsByStatus,
      usersByRole,
      recentDocuments,
      recentUsers,
    };
  },
};
