import React, { useState, useEffect } from 'react';
import { XMarkIcon, ArrowDownTrayIcon, TableCellsIcon } from '@heroicons/react/24/outline';
import { tableService } from '../../services/tableService';
import { useToast } from '../../hooks/useToast';

interface TableModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableId: number;
  documentFilename: string;
  tableIndex: number;
}

const TableModal: React.FC<TableModalProps> = ({
  isOpen,
  onClose,
  tableId,
  documentFilename,
  tableIndex
}) => {
  const { showError, showSuccess } = useToast();
  const [tableData, setTableData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (isOpen && tableId) {
      loadTableData();
    }
  }, [isOpen, tableId]);

  const loadTableData = async () => {
    try {
      setIsLoading(true);
      // Obtener datos de la tabla específica
      const table = await tableService.getTableById(tableId);
      setTableData(table);
    } catch (error: any) {
      console.error('Error loading table data:', error);
      showError('Error al cargar los datos de la tabla');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadTableJSON = async () => {
    try {
      setIsDownloading(true);
      
      // Crear JSON con los datos de la tabla
      const tableJson = {
        document: {
          filename: documentFilename,
          table_index: tableIndex
        },
        table: {
          id: tableId,
          index: tableIndex,
          content: tableData?.content || null,
          created_at: tableData?.created_at || new Date().toISOString()
        }
      };
      
      const jsonString = JSON.stringify(tableJson, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      // Crear URL del blob y descargar
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tabla_${tableIndex + 1}_${documentFilename.replace('.pdf', '')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showSuccess('Tabla descargada exitosamente');
    } catch (error: any) {
      console.error('Error downloading table:', error);
      showError('Error al descargar la tabla');
    } finally {
      setIsDownloading(false);
    }
  };

  const renderTableContent = (content: any) => {
    if (!content) return <p className="text-gray-500">No hay datos disponibles</p>;
    
    try {
      // Si el contenido es un string JSON, parsearlo
      const parsedContent = typeof content === 'string' ? JSON.parse(content) : content;
      
      // Si tiene estructura de tabla con headers y rows
      if (parsedContent.headers && parsedContent.rows) {
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {parsedContent.headers.map((header: string, index: number) => (
                    <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {parsedContent.rows.map((row: any[], rowIndex: number) => (
                  <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {row.map((cell: any, cellIndex: number) => (
                      <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      
      // Si tiene estructura de tabla con tables array
      if (parsedContent.tables && Array.isArray(parsedContent.tables)) {
        const firstTable = parsedContent.tables[0];
        if (firstTable.headers && firstTable.rows) {
          return (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {firstTable.headers.map((header: string, index: number) => (
                      <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {firstTable.rows.map((row: any[], rowIndex: number) => (
                    <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      {row.map((cell: any, cellIndex: number) => (
                        <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
      }
      
      // Si no tiene estructura reconocida, mostrar como JSON
      return (
        <div className="bg-gray-100 p-4 rounded-lg">
          <pre className="text-sm text-gray-800 overflow-auto max-h-96">
            {JSON.stringify(parsedContent, null, 2)}
          </pre>
        </div>
      );
    } catch (error) {
      return (
        <div className="bg-red-100 p-4 rounded-lg">
          <p className="text-red-800">Error al procesar el contenido de la tabla</p>
          <pre className="text-sm text-red-600 mt-2 overflow-auto max-h-96">
            {JSON.stringify(content, null, 2)}
          </pre>
        </div>
      );
    }
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
        <div className="relative bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <TableCellsIcon className="h-6 w-6 text-blue-500" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Tabla {tableIndex + 1} - {documentFilename}
                </h3>
                <p className="text-sm text-gray-500">ID: {tableId}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleDownloadTableJSON}
                disabled={isDownloading || !tableData}
                className="inline-flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isDownloading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Descargando...
                  </>
                ) : (
                  <>
                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                    Descargar JSON
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
            ) : tableData ? (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Información de la Tabla</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-blue-800">Documento:</span>
                      <p className="text-blue-700">{documentFilename}</p>
                    </div>
                    <div>
                      <span className="font-medium text-blue-800">Índice:</span>
                      <p className="text-blue-700">{tableIndex + 1}</p>
                    </div>
                    <div>
                      <span className="font-medium text-blue-800">ID:</span>
                      <p className="text-blue-700">{tableId}</p>
                    </div>
                    <div>
                      <span className="font-medium text-blue-800">Creada:</span>
                      <p className="text-blue-700">
                        {tableData.created_at ? new Date(tableData.created_at).toLocaleString('es-ES') : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900">Contenido de la Tabla</h4>
                  </div>
                  <div className="p-4">
                    {renderTableContent(tableData.content)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No se pudo cargar la tabla</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableModal;
