import React, { useState } from 'react';
import { documentService } from '../../services/documentService';
import { useToast } from '../../hooks/useToast';
import { PlayIcon, StopIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface DocumentProcessorProps {
  documents: Array<{
    id: number;
    filename: string;
    status: string;
  }>;
  onProcessingComplete?: () => void;
}

const DocumentProcessor: React.FC<DocumentProcessorProps> = ({ 
  documents, 
  onProcessingComplete 
}) => {
  const { showSuccess, showError, showInfo } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [currentDocument, setCurrentDocument] = useState<string>('');

  // Filtrar documentos que pueden ser procesados
  const processableDocuments = documents.filter(doc => 
    doc.status === 'pending' || doc.status === 'error'
  );

  const handleProcessAll = async () => {
    if (processableDocuments.length === 0) {
      showError('No hay documentos pendientes para procesar');
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);
    setCurrentDocument('');

    try {
      // Procesar documentos uno por uno para mejor control
      const documentIds = processableDocuments.map(doc => doc.id);
      
      for (let i = 0; i < documentIds.length; i++) {
        const docId = documentIds[i];
        const doc = processableDocuments.find(d => d.id === docId);
        
        setCurrentDocument(doc?.filename || '');
        setProcessingProgress((i / documentIds.length) * 100);

        try {
          await documentService.processDocument(docId);
          showInfo(`Procesando: ${doc?.filename}`);
        } catch (error: any) {
          console.error(`Error processing document ${docId}:`, error);
          showError(`Error al procesar: ${doc?.filename}`);
        }

        // Pequeña pausa entre documentos para evitar sobrecarga
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      setProcessingProgress(100);
      showSuccess(`Se inició el procesamiento de ${processableDocuments.length} documento(s)`);
      onProcessingComplete?.();

    } catch (error: any) {
      console.error('Error processing documents:', error);
      showError('Error al iniciar el procesamiento de documentos');
    } finally {
      setIsProcessing(false);
      setCurrentDocument('');
      setProcessingProgress(0);
    }
  };

  const handleProcessSingle = async (docId: number, filename: string) => {
    setIsProcessing(true);
    setCurrentDocument(filename);
    setProcessingProgress(50);

    try {
      await documentService.processDocument(docId);
      showSuccess(`Procesamiento iniciado para: ${filename}`);
      onProcessingComplete?.();
    } catch (error: any) {
      console.error('Error processing document:', error);
      showError(`Error al procesar: ${filename}`);
    } finally {
      setIsProcessing(false);
      setCurrentDocument('');
      setProcessingProgress(0);
    }
  };

  if (processableDocuments.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
          <span className="text-green-800 font-medium">
            Todos los documentos están procesados o en proceso
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Botón de procesamiento masivo */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Procesamiento de Documentos
            </h3>
            <p className="text-sm text-gray-600">
              {processableDocuments.length} documento(s) pendiente(s) de procesamiento
            </p>
          </div>
          <button
            onClick={handleProcessAll}
            disabled={isProcessing}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? (
              <>
                <StopIcon className="h-4 w-4 mr-2" />
                Procesando...
              </>
            ) : (
              <>
                <PlayIcon className="h-4 w-4 mr-2" />
                Procesar Todos
              </>
            )}
          </button>
        </div>

        {/* Progreso de procesamiento */}
        {isProcessing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {currentDocument ? `Procesando: ${currentDocument}` : 'Iniciando procesamiento...'}
              </span>
              <span className="text-gray-500">{Math.round(processingProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${processingProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Lista de documentos pendientes */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-3 border-b border-gray-200">
          <h4 className="text-sm font-medium text-gray-900">
            Documentos Pendientes de Procesamiento
          </h4>
        </div>
        <div className="divide-y divide-gray-200">
          {processableDocuments.map((doc) => (
            <div key={doc.id} className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {doc.status === 'error' ? (
                    <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                  ) : (
                    <div className="h-5 w-5 bg-yellow-400 rounded-full"></div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{doc.filename}</p>
                  <p className="text-xs text-gray-500">
                    Estado: {doc.status === 'error' ? 'Error' : 'Pendiente'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleProcessSingle(doc.id, doc.filename)}
                disabled={isProcessing}
                className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                <PlayIcon className="h-4 w-4 mr-1" />
                Procesar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DocumentProcessor;
