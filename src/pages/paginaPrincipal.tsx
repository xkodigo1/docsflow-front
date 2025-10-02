import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFileUpload } from "../hooks/useFileUpload";
import type { Document } from "../types/documents";

export default function FileUpload() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showMetadataForm, setShowMetadataForm] = useState(false);
  const [metadata, setMetadata] = useState({
    title: '',
    content: '',
    tags: '' // String que se convertirá en array
  });
  const [uploadedDocuments, setUploadedDocuments] = useState<Document[]>([]);
  
  const navigate = useNavigate();
  const {
    uploads,
    isUploading,
    uploadFile,
    uploadMultipleFiles,
    clearUploads,
    getTotalProgress,
    getSuccessfulUploads,
    getFailedUploads
  } = useFileUpload();

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      setSelectedFiles(files);
      if (files.length === 1) {
        // Para un solo archivo, usar su nombre como título por defecto
        setMetadata(prev => ({ ...prev, title: files[0].name.replace(/\.[^/.]+$/, "") }));
      }
      setShowMetadataForm(true);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setSelectedFiles(files);
      if (files.length === 1) {
        // Para el archivo, usar su nombre como título por defecto
        setMetadata(prev => ({ ...prev, title: files[0].name.replace(/\.[^/.]+$/, "") }));
      }
      setShowMetadataForm(true);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    const uploadMetadata = {
      title: metadata.title || selectedFiles[0].name.replace(/\.[^/.]+$/, ""),
      content: metadata.content || `Archivos subidos: ${selectedFiles.map(f => f.name).join(', ')}`,
      tags: metadata.tags ? metadata.tags.split(',').map(tag => tag.trim()) : []
    };

    try {
      let documents: Document[];
      
      if (selectedFiles.length === 1) {
        const doc = await uploadFile(selectedFiles[0], uploadMetadata);
        documents = doc ? [doc] : [];
      } else {
        documents = await uploadMultipleFiles(selectedFiles, uploadMetadata);
      }

      setUploadedDocuments(prev => [...prev, ...documents]);
      setShowMetadataForm(false);
      setSelectedFiles([]);
      setMetadata({ title: '', content: '', tags: '' });
      
    } catch (error) {
      console.error('Error during upload:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Subir Documentos</h1>
      
      {/* Zona Drag & Drop */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={`w-full p-12 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all ${
          isUploading 
            ? 'border-blue-300 bg-blue-50' 
            : 'border-gray-400 bg-white hover:border-blue-500 hover:bg-blue-50'
        }`}
      >
        <input
          type="file"
          className="hidden"
          id="fileInput"
          onChange={handleFileChange}
          multiple
          disabled={isUploading}
        />
        <label htmlFor="fileInput" className="cursor-pointer">
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <p className="text-gray-600 font-medium text-lg mb-2">
            {isUploading ? 'Subiendo archivos...' : 'Arrastra y suelta tus archivos aquí'}
          </p>
          <p className="text-gray-500 text-sm">
            {isUploading ? 'Por favor espera...' : 'o haz clic para seleccionar múltiples archivos'}
          </p>
        </label>
      </div>

      {/* Formulario de metadatos */}
      {showMetadataForm && selectedFiles.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            Información del documento{selectedFiles.length > 1 ? 's' : ''}
          </h2>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              Archivos seleccionados: {selectedFiles.map(f => f.name).join(', ')}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título *
              </label>
              <input
                type="text"
                value={metadata.title}
                onChange={(e) => setMetadata({...metadata, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={selectedFiles.length === 1 ? selectedFiles[0].name.replace(/\.[^/.]+$/, "") : "Título del documento"}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={metadata.content}
                onChange={(e) => setMetadata({...metadata, content: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Descripción opcional del documento..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Etiquetas (separadas por comas)
              </label>
              <input
                type="text"
                value={metadata.tags}
                onChange={(e) => setMetadata({...metadata, tags: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="trabajo, importante, reporte, etc."
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleUpload}
              disabled={isUploading || !metadata.title.trim()}
              className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isUploading ? 'Subiendo...' : `Subir ${selectedFiles.length} archivo${selectedFiles.length > 1 ? 's' : ''}`}
            </button>
            <button
              onClick={() => {
                setShowMetadataForm(false);
                setSelectedFiles([]);
                setMetadata({ title: '', content: '', tags: '' });
              }}
              disabled={isUploading}
              className="px-6 py-3 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Progreso de uploads */}
      {Object.keys(uploads).length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Progreso de subida</h3>
          
          {/* Progreso general */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progreso total</span>
              <span>{getTotalProgress()}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${getTotalProgress()}%` }}
              ></div>
            </div>
          </div>

          {/* Lista de archivos individuales */}
          <div className="space-y-3">
            {Object.entries(uploads).map(([fileId, upload]) => (
              <div key={fileId} className="border rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-700">{upload.file.name}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    upload.status === 'success' ? 'bg-green-100 text-green-800' :
                    upload.status === 'error' ? 'bg-red-100 text-red-800' :
                    upload.status === 'uploading' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {upload.status === 'success' ? '✓ Completado' :
                     upload.status === 'error' ? '✗ Error' :
                     upload.status === 'uploading' ? 'Subiendo...' :
                     'Pendiente'}
                  </span>
                </div>
                
                {upload.status === 'uploading' && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-200"
                      style={{ width: `${upload.progress}%` }}
                    ></div>
                  </div>
                )}
                
                {upload.status === 'error' && upload.error && (
                  <p className="text-red-600 text-sm mt-1">{upload.error}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documentos subidos exitosamente */}
      {getSuccessfulUploads().length > 0 && (
        <div className="mt-8 bg-green-50 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-green-800">
              ✓ Archivos subidos exitosamente ({getSuccessfulUploads().length})
            </h3>
            <button
              onClick={() => navigate('/app/docs')}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
            >
              Ver documentos
            </button>
          </div>
          
          <div className="space-y-2">
            {getSuccessfulUploads().map((doc) => (
              <div key={doc.id} className="flex justify-between items-center p-2 bg-white rounded border">
                <span className="font-medium">{doc.title}</span>
                <span className="text-sm text-gray-500">ID: {doc.id}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={clearUploads}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
            >
              Limpiar lista
            </button>
          </div>
        </div>
      )}

      {/* Errores de upload */}
      {getFailedUploads().length > 0 && (
        <div className="mt-8 bg-red-50 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-4">
            ✗ Errores en la subida ({getFailedUploads().length})
          </h3>
          
          <div className="space-y-2">
            {getFailedUploads().map((upload, index) => (
              <div key={index} className="p-3 bg-white rounded border border-red-200">
                <p className="font-medium text-red-700">{upload.file.name}</p>
                <p className="text-red-600 text-sm">{upload.error}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
