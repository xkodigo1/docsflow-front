import api from './api';

export interface UserDashboardStats {
  user_id: number;
  user_email: string;
  user_role: string;
  summary: {
    total_documents: number;
    processed_documents: number;
    pending_documents: number;
    failed_documents: number;
    total_tables: number;
    processing_rate: number;
  };
  recent_activity: Array<{
    filename: string;
    status: string;
    created_at: string | null;
  }>;
}

// Caché simple en memoria
let cachedStats: UserDashboardStats | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const userStatsService = {
  async getUserDashboardStats(forceRefresh: boolean = false): Promise<UserDashboardStats> {
    const now = Date.now();
    
    // Verificar caché
    if (!forceRefresh && cachedStats && (now - cacheTimestamp) < CACHE_DURATION) {
      return cachedStats;
    }
    
    try {
      const response = await api.get('/user-stats/dashboard');
      const data = response.data;
      
      // Validar que la respuesta tenga la estructura esperada
      if (!data || !data.summary) {
        throw new Error('Invalid response structure');
      }
      
      // Actualizar caché
      cachedStats = data;
      cacheTimestamp = now;
      
      return data;
    } catch (error) {
      // Si hay error y tenemos caché, devolver caché
      if (cachedStats) {
        console.warn('Error fetching stats, using cached data:', error);
        return cachedStats;
      }
      throw error;
    }
  },
  
  // Limpiar caché
  clearCache(): void {
    cachedStats = null;
    cacheTimestamp = 0;
  },
  
  // Verificar si hay caché válido
  hasValidCache(): boolean {
    const now = Date.now();
    return cachedStats !== null && (now - cacheTimestamp) < CACHE_DURATION;
  }
};
