import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { documentService } from '../../services/documentService';
import { useToast } from '../../hooks/useToast';
import { CloudArrowUpIcon, DocumentIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface DocumentUploadProps {
  onUploadSuccess?: () => void;
  onUploadError?: (error: string) => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ 
  onUploadSuccess, 
  onUploadError 
}) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      const isValidType = file.type === 'application/pdf';
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      
      if (!isValidType) {
        showError(`El archivo "${file.name}" no es un PDF válido`);
        return false;
      }
      
      if (!isValidSize) {
        showError(`El archivo "${file.name}" es demasiado grande (máximo 10MB)`);
        return false;
      }
      
      return true;
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      showError('Selecciona al menos un archivo para subir');
      return;
    }

    if (!user?.id) {
      showError('No se pudo identificar al usuario');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        
        // Simular progreso
        const progress = ((i + 1) / selectedFiles.length) * 100;
        setUploadProgress(progress);

        await documentService.uploadDocument(
          file,
          user.department_id, // Usar el departamento del usuario
          'invoice' // Tipo por defecto
        );
      }

      showSuccess(`Se subieron ${selectedFiles.length} documento(s) exitosamente`);
      setSelectedFiles([]);
      onUploadSuccess?.();
      
    } catch (error: any) {
      console.error('Error uploading documents:', error);
      const errorMessage = error.response?.data?.detail || 'Error al subir los documentos';
      showError(errorMessage);
      onUploadError?.(errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Área de carga */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        
        <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
        <div className="mt-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-blue-600 hover:text-blue-500 font-medium"
            disabled={isUploading}
          >
            Haz clic para seleccionar archivos
          </button>
          <p className="text-gray-500">o arrastra y suelta archivos PDF aquí</p>
        </div>
        <p className="text-sm text-gray-400 mt-2">
          Máximo 10MB por archivo, solo archivos PDF
        </p>
      </div>

      {/* Archivos seleccionados */}
      {selectedFiles.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Archivos Seleccionados ({selectedFiles.length})
          </h3>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <DocumentIcon className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  disabled={isUploading}
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progreso de carga */}
      {isUploading && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Subiendo archivos...</span>
            <span className="text-sm text-gray-500">{Math.round(uploadProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={() => setSelectedFiles([])}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          disabled={isUploading || selectedFiles.length === 0}
        >
          Limpiar
        </button>
        <button
          onClick={handleUpload}
          disabled={isUploading || selectedFiles.length === 0}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          {isUploading ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              <span>Subiendo...</span>
            </>
          ) : (
            <>
              <CloudArrowUpIcon className="h-4 w-4" />
              <span>Subir Documentos</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default DocumentUpload;