import React, { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import type { User } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';
import UserRegistrationForm from '../components/auth/UserRegistrationForm';

const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState('operador');
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [filterRole]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await userService.getUsers({
        role: filterRole,
        limit: 50,
        offset: 0,
      });
      setUsers(response.items);
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Error al cargar usuarios');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistrationSuccess = () => {
    setShowRegistrationForm(false);
    loadUsers(); // Recargar la lista de usuarios
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { color: 'bg-red-100 text-red-800', text: 'Administrador' },
      operador: { color: 'bg-blue-100 text-blue-800', text: 'Operador' },
    };
    
    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.operador;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getStatusBadge = (user: User) => {
    if (user.is_blocked) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Bloqueado
        </span>
      );
    }
    
    if (user.failed_attempts > 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Intentos fallidos: {user.failed_attempts}
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Activo
      </span>
    );
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <span className="text-4xl">🚫</span>
        <h2 className="mt-2 text-lg font-medium text-gray-900">Acceso Denegado</h2>
        <p className="text-gray-500">No tienes permisos para acceder a esta página.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-gray-600">Gestiona los usuarios del sistema</p>
        </div>
        <button
          onClick={() => setShowRegistrationForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          + Nuevo Usuario
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center space-x-4">
          <label htmlFor="roleFilter" className="block text-sm font-medium text-gray-700">
            Filtrar por rol:
          </label>
          <select
            id="roleFilter"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="operador">Operadores</option>
            <option value="admin">Administradores</option>
          </select>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Users list */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Lista de Usuarios ({users.length})
          </h3>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-4xl">👥</span>
            <p className="mt-2 text-gray-500">No hay usuarios</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {users.map((user) => (
              <div key={user.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        {getRoleBadge(user.role)}
                        {getStatusBadge(user)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      Creado: {formatDate(user.created_at)}
                    </p>
                    {user.department_id && (
                      <p className="text-xs text-gray-500">
                        Depto: {user.department_id}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Registration Form Modal */}
      {showRegistrationForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <UserRegistrationForm
              onSuccess={handleRegistrationSuccess}
              onCancel={() => setShowRegistrationForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
