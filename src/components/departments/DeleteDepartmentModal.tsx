import React from 'react';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface DeleteDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  departmentName: string;
  departmentId: number;
  userCount: number;
  documentCount: number;
  tableCount: number;
}

const DeleteDepartmentModal: React.FC<DeleteDepartmentModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  departmentName,
  departmentId,
  userCount,
  documentCount,
  tableCount
}) => {
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
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Eliminar Departamento
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
          
          {/* Content */}
          <div className="p-6">
            <div className="mb-4">
              <p className="text-gray-900 font-medium mb-2">
                ¿Estás seguro de que quieres eliminar el departamento <span className="font-semibold text-red-600">"{departmentName}"</span>?
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Esta acción eliminará <strong>permanentemente</strong> toda la información relacionada con este departamento.
              </p>
            </div>

            {/* Información de lo que se eliminará */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-medium text-red-800 mb-3">
                ⚠️ Se eliminará toda la información relacionada:
              </h4>
              <div className="space-y-2 text-sm text-red-700">
                <div className="flex justify-between">
                  <span>👥 Usuarios del departamento:</span>
                  <span className="font-semibold">{userCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>📄 Documentos subidos:</span>
                  <span className="font-semibold">{documentCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>📊 Tablas extraídas:</span>
                  <span className="font-semibold">{tableCount}</span>
                </div>
              </div>
            </div>

            {/* Advertencia adicional */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ Advertencia:</strong> Esta acción no se puede deshacer. Todos los usuarios, documentos y tablas asociados a este departamento serán eliminados permanentemente.
              </p>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              >
                Sí, eliminar todo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteDepartmentModal;
