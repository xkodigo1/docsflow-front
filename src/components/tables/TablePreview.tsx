import React, { useState, useRef, useEffect } from 'react';

interface TablePreviewProps {
  tableData: {
    headers?: string[] | null;
    rows: string[][];
    page: number;
  };
  documentInfo: {
    id: number;
    filename: string;
    tableIndex?: number;
  };
  onClose?: () => void;
  onExport?: () => void;
}

const TablePreview: React.FC<TablePreviewProps> = ({ 
  tableData, 
  documentInfo, 
  onClose,
  onExport 
}) => {
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const tableRef = useRef<HTMLDivElement>(null);

  const { headers, rows } = tableData || {};
  const hasHeaders = headers && headers.length > 0;
  const displayRows = rows && Array.isArray(rows) ? rows : [];
  const displayHeaders = hasHeaders ? headers : null;

  // Función para detectar el tipo de dato
  const getDataType = (value: string) => {
    if (!value || value.trim() === '') return 'empty';
    if (/^\d+$/.test(value.trim())) return 'number';
    if (/^\d+\.\d+$/.test(value.trim())) return 'decimal';
    if (/^\d{4}-\d{2}-\d{2}$/.test(value.trim()) || /^\d{2}\/\d{2}\/\d{4}$/.test(value.trim())) return 'date';
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'email';
    if (/^https?:\/\//.test(value.trim())) return 'url';
    return 'text';
  };

  // Función para formatear valores según su tipo
  const formatValue = (value: string, type: string) => {
    if (type === 'number' || type === 'decimal') {
      return parseFloat(value).toLocaleString();
    }
    if (type === 'date') {
      try {
        return new Date(value).toLocaleDateString('es-ES');
      } catch {
        return value;
      }
    }
    return value;
  };

  const handleCellClick = (rowIndex: number, colIndex: number) => {
    const cellKey = `${rowIndex}-${colIndex}`;
    setSelectedCells(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cellKey)) {
        newSet.delete(cellKey);
      } else {
        newSet.add(cellKey);
      }
      return newSet;
    });
  };

  const copySelectedCells = () => {
    const selectedValues = Array.from(selectedCells)
      .map(key => {
        const [rowIndex, colIndex] = key.split('-').map(Number);
        return rows[rowIndex]?.[colIndex] || '';
      })
      .join('\t');
    
    navigator.clipboard.writeText(selectedValues);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handleResetZoom = () => {
    setZoom(100);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Manejar teclas de atajo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '=':
          case '+':
            e.preventDefault();
            handleZoomIn();
            break;
          case '-':
            e.preventDefault();
            handleZoomOut();
            break;
          case '0':
            e.preventDefault();
            handleResetZoom();
            break;
          case 'f':
            e.preventDefault();
            toggleFullscreen();
            break;
        }
      }
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Si no hay datos, mostrar mensaje
  if (!tableData || !displayRows || displayRows.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📊</span>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {documentInfo.filename}
                </h3>
                <p className="text-sm text-gray-500">
                  Página {tableData?.page || 'N/A'} • Documento #{documentInfo.id}
                  {documentInfo.tableIndex !== undefined && (
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      Tabla {documentInfo.tableIndex + 1}
                    </span>
                  )}
                </p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
                title="Cerrar"
              >
                ✕
              </button>
            )}
          </div>
          <div className="p-6 text-center">
            <span className="text-4xl">📄</span>
            <p className="mt-2 text-gray-500">No hay datos de tabla disponibles</p>
            <p className="text-sm text-gray-400">Este documento no contiene tablas extraíbles</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 ${
      isFullscreen ? 'p-0' : ''
    }`}>
      <div className={`bg-white rounded-lg shadow-xl ${
        isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-6xl max-h-[90vh]'
      }`}>
        {/* Header con controles */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">📊</span>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {documentInfo.filename}
              </h3>
              <p className="text-sm text-gray-500">
                Página {tableData.page} • Documento #{documentInfo.id}
                {documentInfo.tableIndex !== undefined && (
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Tabla {documentInfo.tableIndex + 1}
                  </span>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Controles de zoom */}
            <div className="flex items-center space-x-1">
              <button
                onClick={handleZoomOut}
                className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
                title="Alejar (Ctrl + -)"
              >
                🔍-
              </button>
              <span className="text-sm text-gray-600 min-w-[3rem] text-center">
                {zoom}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
                title="Acercar (Ctrl + +)"
              >
                🔍+
              </button>
              <button
                onClick={handleResetZoom}
                className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
                title="Zoom normal (Ctrl + 0)"
              >
                🔍
              </button>
            </div>

            {/* Separador */}
            <div className="w-px h-6 bg-gray-300"></div>

            {/* Acciones */}
            {selectedCells.size > 0 && (
              <button
                onClick={copySelectedCells}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                Copiar ({selectedCells.size})
              </button>
            )}
            
            {onExport && (
              <button
                onClick={onExport}
                className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
              >
                Exportar
              </button>
            )}

            <button
              onClick={toggleFullscreen}
              className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
              title="Pantalla completa (Ctrl + F)"
            >
              {isFullscreen ? '⤓' : '⤢'}
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
                title="Cerrar (Esc)"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Contenido de la tabla con zoom */}
        <div className="overflow-auto" style={{ maxHeight: isFullscreen ? 'calc(100vh - 80px)' : '60vh' }}>
          <div 
            ref={tableRef}
            style={{ 
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top left',
              width: `${100 / (zoom / 100)}%`
            }}
          >
            <table className="min-w-full divide-y divide-gray-200">
              {displayHeaders && (
                <thead className="bg-gray-50">
                  <tr>
                    {displayHeaders.map((header, index) => (
                      <th
                        key={index}
                        className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200"
                      >
                        {header || `Columna ${index + 1}`}
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody className="bg-white divide-y divide-gray-200">
                {displayRows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-gray-50">
                    {row.map((cell, colIndex) => {
                      const cellKey = `${rowIndex}-${colIndex}`;
                      const isSelected = selectedCells.has(cellKey);
                      const dataType = getDataType(cell);
                      const formattedValue = formatValue(cell, dataType);
                      
                      return (
                        <td
                          key={colIndex}
                          onClick={() => handleCellClick(rowIndex, colIndex)}
                          className={`px-4 py-3 text-sm border-r border-gray-200 cursor-pointer transition-colors ${
                            isSelected 
                              ? 'bg-blue-100 text-blue-900' 
                              : 'text-gray-900'
                          } ${
                            dataType === 'number' || dataType === 'decimal' 
                              ? 'text-right font-mono' 
                              : 'text-left'
                          }`}
                          title={`Tipo: ${dataType} | Valor: ${cell}`}
                        >
                          <span className={`inline-flex items-center ${
                            dataType === 'email' ? 'text-blue-600 hover:underline' :
                            dataType === 'url' ? 'text-blue-600 hover:underline' :
                            dataType === 'date' ? 'text-green-600' :
                            dataType === 'number' || dataType === 'decimal' ? 'text-purple-600' :
                            'text-gray-900'
                          }`}>
                            {dataType === 'email' && '📧 '}
                            {dataType === 'url' && '🔗 '}
                            {dataType === 'date' && '📅 '}
                            {dataType === 'number' && '🔢 '}
                            {dataType === 'decimal' && '🔢 '}
                            {formattedValue || <span className="text-gray-400 italic">vacío</span>}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer con estadísticas */}
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-6">
              <span>{displayRows.length} filas</span>
              <span>{displayRows[0]?.length || 0} columnas</span>
              {displayHeaders && <span>Con encabezados</span>}
              <span>Zoom: {zoom}%</span>
            </div>
            <div className="flex items-center space-x-4">
              {selectedCells.size > 0 && (
                <span className="text-blue-600 font-medium">
                  {selectedCells.size} celdas seleccionadas
                </span>
              )}
              <div className="text-xs text-gray-400">
                Ctrl + +/- para zoom • Ctrl + F para pantalla completa • Esc para cerrar
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TablePreview;
