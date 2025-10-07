import React, { useState, useRef } from 'react';
import { useDocuments } from '../../contexts/DocumentContext';
import { useAuth } from '../../contexts/AuthContext';

const DocumentUpload: React.FC = () => {
  const { uploadDocument, isLoading } = useDocuments();
  const { user } = useAuth();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('');
  const [departmentId, setDepartmentId] = useState<number | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
      } else {
        alert('Solo se permiten archivos PDF');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
      } else {
        alert('Solo se permiten archivos PDF');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      await uploadDocument(selectedFile, departmentId, documentType);
      setSelectedFile(null);
      setDocumentType('');
      setDepartmentId(undefined);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      // Error ya manejado en el contexto
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Subir Documento</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* File upload area */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {selectedFile ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center">
                <span className="text-4xl">📄</span>
              </div>
              <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
              <button
                type="button"
                onClick={removeFile}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Eliminar archivo
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-center">
                <span className="text-4xl">📁</span>
              </div>
              <p className="text-sm text-gray-600">
                Arrastra tu archivo PDF aquí o{' '}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-800"
                >
                  selecciona un archivo
                </button>
              </p>
              <p className="text-xs text-gray-500">Máximo 15MB</p>
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Document type */}
        <div>
          <label htmlFor="documentType" className="block text-sm font-medium text-gray-700">
            Tipo de Documento (opcional)
          </label>
          <input
            type="text"
            id="documentType"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            placeholder="ej. factura, reporte, contrato"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        {/* Department selection (only for admins) */}
        {user?.role === 'admin' && (
          <div>
            <label htmlFor="departmentId" className="block text-sm font-medium text-gray-700">
              Departamento
            </label>
            <input
              type="number"
              id="departmentId"
              value={departmentId || ''}
              onChange={(e) => setDepartmentId(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="ID del departamento"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        )}

        {/* Submit button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!selectedFile || isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Subiendo...
              </>
            ) : (
              'Subir Documento'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DocumentUpload;

