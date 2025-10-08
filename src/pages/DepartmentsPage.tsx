import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { departmentService, type Department } from '../services/departmentService';
import DepartmentForm from '../components/departments/DepartmentForm';
import DepartmentCard from '../components/departments/DepartmentCard';
import DepartmentStats from '../components/departments/DepartmentStats';

const DepartmentsPage: React.FC = () => {
  const { user } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'id'>('name');

  // Verificar que el usuario sea admin
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl">🚫</span>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Acceso Denegado</h1>
          <p className="mt-2 text-gray-600">Solo los administradores pueden gestionar departamentos.</p>
        </div>
      </div>
    );
  }

  const loadDepartments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await departmentService.getDepartments();
      setDepartments(data);
    } catch (error: any) {
      console.error('Error loading departments:', error);
      setError('Error al cargar los departamentos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleCreateDepartment = async (data: { name: string }) => {
    try {
      const newDepartment = await departmentService.createDepartment(data);
      setDepartments(prev => [...prev, newDepartment]);
      setShowForm(false);
    } catch (error: any) {
      console.error('Error creating department:', error);
      setError('Error al crear el departamento');
    }
  };

  const handleUpdateDepartment = async (id: number, data: { name: string }) => {
    try {
      const updatedDepartment = await departmentService.updateDepartment(id, data);
      setDepartments(prev => 
        prev.map(dept => dept.id === id ? updatedDepartment : dept)
      );
      setEditingDepartment(null);
    } catch (error: any) {
      console.error('Error updating department:', error);
      setError('Error al actualizar el departamento');
    }
  };

  const handleDeleteDepartment = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este departamento?')) {
      return;
    }

    try {
      await departmentService.deleteDepartment(id);
      setDepartments(prev => prev.filter(dept => dept.id !== id));
    } catch (error: any) {
      console.error('Error deleting department:', error);
      setError('Error al eliminar el departamento');
    }
  };

  const handleEditDepartment = (department: Department) => {
    setEditingDepartment(department);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingDepartment(null);
  };

  const filteredAndSortedDepartments = departments
    .filter(dept =>
      dept.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else {
        return a.id - b.id;
      }
    });

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Departamentos</h1>
              <p className="mt-2 text-gray-600">
                Administra los departamentos de la organización
                {departments.length > 0 && (
                  <span className="ml-2 text-sm text-blue-600">
                    • {departments.length} departamento{departments.length !== 1 ? 's' : ''} 
                    • Ordenado por {sortBy === 'name' ? 'nombre' : 'ID'}
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <span>➕</span>
              <span>Nuevo Departamento</span>
            </button>
          </div>
        </div>

        {/* Estadísticas */}
        <DepartmentStats />

        {/* Búsqueda y Ordenamiento */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Buscar departamentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="absolute right-3 top-2.5 text-gray-400">🔍</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <label htmlFor="sortBy" className="text-sm font-medium text-gray-700">
              Ordenar por:
            </label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'id')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="name">Nombre (A-Z)</option>
              <option value="id">ID (Ascendente)</option>
            </select>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-red-400 mr-2">⚠️</span>
              <p className="text-red-700">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Cargando departamentos...</span>
          </div>
        ) : (
          <>
            {/* Lista de departamentos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedDepartments.map((department) => (
                <DepartmentCard
                  key={department.id}
                  department={department}
                  onEdit={handleEditDepartment}
                  onDelete={handleDeleteDepartment}
                />
              ))}
            </div>

            {/* Mensaje si no hay departamentos */}
            {filteredAndSortedDepartments.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <span className="text-6xl">🏢</span>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  {searchTerm ? 'No se encontraron departamentos' : 'No hay departamentos'}
                </h3>
                <p className="mt-2 text-gray-600">
                  {searchTerm 
                    ? 'Intenta con otros términos de búsqueda'
                    : 'Crea el primer departamento para comenzar'
                  }
                </p>
              </div>
            )}
          </>
        )}

        {/* Formulario modal */}
        {showForm && (
          <DepartmentForm
            department={editingDepartment}
            onSubmit={editingDepartment ? 
              (data) => handleUpdateDepartment(editingDepartment.id, data) :
              handleCreateDepartment
            }
            onClose={handleCloseForm}
          />
        )}
    </div>
  );
};

export default DepartmentsPage;
