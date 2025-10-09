import api from './api';

export interface Department {
  id: number;
  name: string;
}

export interface CreateDepartmentData {
  name: string;
}

export interface UpdateDepartmentData {
  name: string;
}

export const departmentService = {
  // Obtener todos los departamentos
  async getDepartments(): Promise<Department[]> {
    const response = await api.get('/departments/');
    return response.data;
  },

  // Obtener un departamento por ID
  async getDepartment(id: number): Promise<Department> {
    const response = await api.get(`/departments/${id}`);
    return response.data;
  },

  // Crear un nuevo departamento
  async createDepartment(data: CreateDepartmentData): Promise<Department> {
    const response = await api.post('/departments/', data);
    return response.data;
  },

  // Actualizar un departamento
  async updateDepartment(id: number, data: UpdateDepartmentData): Promise<Department> {
    const response = await api.put(`/departments/${id}`, data);
    return response.data;
  },

  // Eliminar un departamento
  async deleteDepartment(id: number): Promise<{
    message: string;
    department_name: string;
    deleted_users: number;
    deleted_documents: number;
    deleted_tables: number;
  }> {
    const response = await api.delete(`/departments/${id}`);
    return response.data;
  },

  // Obtener estadísticas de departamentos
  async getDepartmentStats(): Promise<{
    totalDepartments: number;
    departmentsWithUsers: number;
    departmentsWithDocuments: number;
  }> {
    const response = await api.get('/departments/stats/summary');
    return response.data;
  },

  // Obtener estadísticas detalladas de un departamento
  async getDepartmentDetailedStats(departmentId: number): Promise<{
    departmentId: number;
    departmentName: string;
    userCount: number;
    documentCount: number;
    processedDocuments: number;
    extractedTables: number;
  }> {
    const response = await api.get(`/departments/${departmentId}/stats`);
    return response.data;
  }
};
