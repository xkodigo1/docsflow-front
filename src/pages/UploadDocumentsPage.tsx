import React from 'react';
import { useNavigate } from 'react-router-dom';
import DocumentUpload from '../components/documents/DocumentUpload';
import { CloudArrowUpIcon, DocumentIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const UploadDocumentsPage: React.FC = () => {
  const navigate = useNavigate();

  const handleUploadSuccess = () => {
    // Redirigir a "Mis Documentos" después de una carga exitosa
    setTimeout(() => {
      navigate('/my-documents');
    }, 2000);
  };

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Subir Documentos
        </h1>
        <p className="text-gray-600">
          Sube archivos PDF para extraer tablas automáticamente
        </p>
      </div>

      {/* Instrucciones */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">
          📋 Instrucciones de Carga
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <DocumentIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-900">Formato</h4>
              <p className="text-sm text-blue-700">Solo archivos PDF</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <CloudArrowUpIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-900">Tamaño</h4>
              <p className="text-sm text-blue-700">Máximo 10MB por archivo</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-900">Procesamiento</h4>
              <p className="text-sm text-blue-700">Extracción automática de tablas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Componente de carga */}
      <div className="bg-white rounded-lg shadow p-6">
        <DocumentUpload 
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
        />
      </div>

      {/* Información adicional */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          💡 Consejos para Mejores Resultados
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start space-x-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>Asegúrate de que el PDF contenga tablas claras y legibles</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>Evita documentos escaneados de baja calidad</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>Los documentos se procesarán automáticamente después de la carga</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>Puedes ver el progreso en "Mis Documentos"</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default UploadDocumentsPage;
