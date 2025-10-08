import React, { useState, useEffect } from 'react';
import { departmentService } from '../../services/departmentService';

interface DepartmentStatsData {
  totalDepartments: number;
  departmentsWithUsers: number;
  departmentsWithDocuments: number;
}

const DepartmentStats: React.FC = () => {
  const [stats, setStats] = useState<DepartmentStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true);
        const data = await departmentService.getDepartmentStats();
        setStats(data);
      } catch (error) {
        console.error('Error loading department stats:', error);
        // Si hay error, mostrar stats básicas
        setStats({
          totalDepartments: 0,
          departmentsWithUsers: 0,
          departmentsWithDocuments: 0
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Total Departamentos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-lg">🏢</span>
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Total Departamentos</p>
            <p className="text-2xl font-semibold text-gray-900">
              {stats?.totalDepartments || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Departamentos con Usuarios */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 text-lg">👥</span>
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Con Usuarios</p>
            <p className="text-2xl font-semibold text-gray-900">
              {stats?.departmentsWithUsers || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Departamentos con Documentos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 text-lg">📄</span>
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Con Documentos</p>
            <p className="text-2xl font-semibold text-gray-900">
              {stats?.departmentsWithDocuments || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentStats;
