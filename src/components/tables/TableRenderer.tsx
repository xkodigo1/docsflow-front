import React, { useState } from 'react';

interface TableRendererProps {
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
  onExport?: () => void;
}

const TableRenderer: React.FC<TableRendererProps> = ({ 
  tableData, 
  documentInfo, 
  onExport 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());

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

  // Si no hay datos, mostrar mensaje
  if (!tableData || !displayRows || displayRows.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">📊</span>
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                {documentInfo.filename}
              </h3>
              <p className="text-xs text-gray-500">
                Página {tableData?.page || 'N/A'} • Documento #{documentInfo.id}
                {documentInfo.tableIndex !== undefined && (
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Tabla {documentInfo.tableIndex + 1}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
        <div className="p-6 text-center">
          <span className="text-4xl">📄</span>
          <p className="mt-2 text-gray-500">No hay datos de tabla disponibles</p>
          <p className="text-sm text-gray-400">Este documento no contiene tablas extraíbles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header con información del documento */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">📊</span>
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                {documentInfo.filename}
              </h3>
              <p className="text-xs text-gray-500">
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
            {selectedCells.size > 0 && (
              <button
                onClick={copySelectedCells}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                Copiar ({selectedCells.size})
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              {isExpanded ? 'Contraer' : 'Expandir'}
            </button>
            {onExport && (
              <button
                onClick={onExport}
                className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
              >
                Exportar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabla renderizada */}
      <div className={`overflow-auto ${isExpanded ? 'max-h-96' : 'max-h-64'}`}>
        <table className="min-w-full divide-y divide-gray-200">
          {displayHeaders && (
            <thead className="bg-gray-50">
              <tr>
                {displayHeaders.map((header, index) => (
                  <th
                    key={index}
                    className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200"
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
                      className={`px-3 py-2 text-sm border-r border-gray-200 cursor-pointer transition-colors ${
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

      {/* Footer con estadísticas */}
      <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <span>{displayRows.length} filas</span>
            <span>{displayRows[0]?.length || 0} columnas</span>
            {displayHeaders && <span>Con encabezados</span>}
          </div>
          <div className="flex items-center space-x-2">
            {selectedCells.size > 0 && (
              <span className="text-blue-600">
                {selectedCells.size} celdas seleccionadas
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableRenderer;
