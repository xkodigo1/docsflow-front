import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { statsService } from '../services/statsService';
import type { SystemStats } from '../services/statsService';

interface StatsContextType {
  stats: SystemStats | null;
  isLoading: boolean;
  error: string | null;
  refreshStats: () => Promise<void>;
}

const StatsContext = createContext<StatsContextType | undefined>(undefined);

interface StatsProviderProps {
  children: ReactNode;
}

export const StatsProvider: React.FC<StatsProviderProps> = ({ children }) => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const statsData = await statsService.getSystemStats();
      setStats(statsData);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Error al cargar estadísticas';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshStats();
  }, []);

  const value: StatsContextType = {
    stats,
    isLoading,
    error,
    refreshStats,
  };

  return (
    <StatsContext.Provider value={value}>
      {children}
    </StatsContext.Provider>
  );
};

export const useStats = (): StatsContextType => {
  const context = useContext(StatsContext);
  if (context === undefined) {
    throw new Error('useStats must be used within a StatsProvider');
  }
  return context;
};
