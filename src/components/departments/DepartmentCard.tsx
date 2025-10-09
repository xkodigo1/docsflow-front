import React, { useState, useEffect } from 'react';
import type { Department } from '../../services/departmentService';
import { departmentService } from '../../services/departmentService';
import DepartmentTablesModal from './DepartmentTablesModal';
import DepartmentUsersModal from './DepartmentUsersModal';
import DepartmentDocumentsModal from './DepartmentDocumentsModal';

interface DepartmentCardProps {
  department: Department;
  onEdit: (department: Department) => void;
  onDelete: (id: number) => void;
}

interface DepartmentStats {
  userCount: number;
  documentCount: number;
  processedDocuments: number;
  extractedTables: number;
}

const DepartmentCard: React.FC<DepartmentCardProps> = ({
  department,
  onEdit,
  onDelete
}) => {
  const [showActions, setShowActions] = useState(false);
  const [stats, setStats] = useState<DepartmentStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [showTablesModal, setShowTablesModal] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoadingStats(true);
        const data = await departmentService.getDepartmentDetailedStats(department.id);
        setStats({
          userCount: data.userCount,
          documentCount: data.documentCount,
          processedDocuments: data.processedDocuments,
          extractedTables: data.extractedTables
        });
      } catch (error) {
        console.error('Error loading department stats:', error);
        // En caso de error, mostrar valores por defecto
        setStats({
          userCount: 0,
          documentCount: 0,
          processedDocuments: 0,
          extractedTables: 0
        });
      } finally {
        setIsLoadingStats(false);
      }
    };

    loadStats();
  }, [department.id]);

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-lg">
                {department.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{department.name}</h3>
              <p className="text-sm text-gray-500">ID: {department.id}</p>
            </div>
          </div>
          
          {/* Actions */}
          <div className={`flex items-center space-x-1 transition-opacity ${
            showActions ? 'opacity-100' : 'opacity-0'
          }`}>
            <button
              onClick={() => onEdit(department)}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
              title="Editar departamento"
            >
              ✏️
            </button>
            <button
              onClick={() => onDelete(department.id)}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
              title="Eliminar departamento"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="space-y-3">
          {/* Información básica */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Estado:</span>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              Activo
            </span>
          </div>

          {/* Estadísticas reales */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div 
              className="text-center p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => setShowUsersModal(true)}
              title="Ver usuarios del departamento"
            >
              <div className="text-lg font-semibold text-gray-900">
                {isLoadingStats ? (
                  <div className="animate-pulse bg-gray-300 h-5 w-8 mx-auto rounded"></div>
                ) : (
                  stats?.userCount || 0
                )}
              </div>
              <div className="text-xs text-gray-500">Usuarios</div>
            </div>
            <div 
              className="text-center p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => setShowDocumentsModal(true)}
              title="Ver documentos del departamento"
            >
              <div className="text-lg font-semibold text-gray-900">
                {isLoadingStats ? (
                  <div className="animate-pulse bg-gray-300 h-5 w-8 mx-auto rounded"></div>
                ) : (
                  stats?.documentCount || 0
                )}
              </div>
              <div className="text-xs text-gray-500">Documentos</div>
            </div>
          </div>

          {/* Estadísticas adicionales */}
          {stats && !isLoadingStats && (
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div 
                className="text-center p-2 bg-green-50 rounded cursor-pointer hover:bg-green-100 transition-colors"
                onClick={() => setShowTablesModal(true)}
                title="Ver tablas del departamento"
              >
                <div className="text-sm font-semibold text-green-900">
                  {stats.extractedTables}
                </div>
                <div className="text-xs text-green-600">Tablas</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Departamento</span>
          <span>ID: {department.id}</span>
        </div>
      </div>

      {/* Modal de tablas */}
      {showTablesModal && (
        <DepartmentTablesModal
          isOpen={showTablesModal}
          onClose={() => setShowTablesModal(false)}
          departmentId={department.id}
          departmentName={department.name}
        />
      )}

      {/* Modal de usuarios */}
      {showUsersModal && (
        <DepartmentUsersModal
          isOpen={showUsersModal}
          onClose={() => setShowUsersModal(false)}
          departmentId={department.id}
          departmentName={department.name}
        />
      )}

      {/* Modal de documentos */}
      {showDocumentsModal && (
        <DepartmentDocumentsModal
          isOpen={showDocumentsModal}
          onClose={() => setShowDocumentsModal(false)}
          departmentId={department.id}
          departmentName={department.name}
        />
      )}
    </div>
  );
};

export default DepartmentCard;
