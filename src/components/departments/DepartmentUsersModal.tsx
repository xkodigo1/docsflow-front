import React, { useState, useEffect } from 'react';
import { XMarkIcon, UserIcon, MagnifyingGlassIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { userService } from '../../services/userService';
import { useToast } from '../../hooks/useToast';
import { useDebounce } from '../../hooks/useDebounce';

interface DepartmentUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  departmentId: number;
  departmentName: string;
}

interface DepartmentUser {
  id: number;
  email: string;
  role: 'admin' | 'operador';
  is_blocked: boolean;
  created_at: string;
  failed_attempts: number;
}

const DepartmentUsersModal: React.FC<DepartmentUsersModalProps> = ({
  isOpen,
  onClose,
  departmentId,
  departmentName
}) => {
  const { showError } = useToast();
  const [users, setUsers] = useState<DepartmentUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (isOpen) {
      loadDepartmentUsers();
    }
  }, [isOpen, departmentId, debouncedSearchQuery]);

  const loadDepartmentUsers = async () => {
    try {
      setIsLoading(true);
      const response = await userService.getUsers({
        department_id: departmentId,
        limit: 100,
        offset: 0
      });
      
      let filteredUsers = response.items;
      
      // Filtrar por búsqueda si hay query
      if (debouncedSearchQuery.trim()) {
        filteredUsers = response.items.filter(user => 
          user.email.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
        );
      }
      
      setUsers(filteredUsers);
    } catch (error: any) {
      console.error('Error loading department users:', error);
      showError('Error al cargar los usuarios del departamento');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { color: 'bg-red-100 text-red-800', text: 'Administrador' },
      operador: { color: 'bg-blue-100 text-blue-800', text: 'Operador' },
    };
    
    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.operador;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getStatusBadge = (isBlocked: boolean, failedAttempts: number) => {
    if (isBlocked) {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
          Bloqueado
        </span>
      );
    }
    
    if (failedAttempts > 0) {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
          {failedAttempts} intentos fallidos
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
        Activo
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        ></div>
        
        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <UserIcon className="h-6 w-6 text-blue-500" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Usuarios de {departmentName}
                </h3>
                <p className="text-sm text-gray-500">ID: {departmentId}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          {/* Search */}
          <div className="p-6 border-b border-gray-200">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar usuarios del departamento..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">No hay usuarios</h3>
                <p className="mt-1 text-sm text-gray-600">
                  {searchQuery ? 'No se encontraron usuarios con ese criterio' : 'Este departamento no tiene usuarios asignados'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Estadísticas */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-900">{users.length}</div>
                    <div className="text-sm text-blue-600">Total Usuarios</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-900">
                      {users.filter(u => !u.is_blocked).length}
                    </div>
                    <div className="text-sm text-green-600">Usuarios Activos</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-900">
                      {users.filter(u => u.role === 'operador').length}
                    </div>
                    <div className="text-sm text-purple-600">Operadores</div>
                  </div>
                </div>

                {/* Lista de usuarios */}
                <div className="space-y-3">
                  {users.map((user) => (
                    <div key={user.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <EnvelopeIcon className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {user.email}
                            </p>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-xs text-gray-500">
                                ID: {user.id}
                              </span>
                              <span className="text-xs text-gray-500">
                                Registrado: {formatDate(user.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          {getRoleBadge(user.role)}
                          {getStatusBadge(user.is_blocked, user.failed_attempts)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentUsersModal;
