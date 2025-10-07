import React, { useState } from 'react';
import DocumentUpload from './DocumentUpload';
import DocumentList from './DocumentList';

const DocumentsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'list' | 'upload'>('list');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documentos</h1>
          <p className="text-gray-600">Gestiona y procesa tus documentos PDF</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('list')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'list'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📄 Lista de Documentos
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'upload'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            ⬆️ Subir Documento
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'list' && <DocumentList />}
      {activeTab === 'upload' && <DocumentUpload />}
    </div>
  );
};

export default DocumentsPage;

