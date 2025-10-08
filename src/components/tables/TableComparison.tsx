import React, { useState } from 'react';

interface TableComparisonProps {
  tables: Array<{
    id: string;
    name: string;
    data: {
      headers?: string[] | null;
      rows: string[][];
      page: number;
    };
    documentInfo: {
      id: number;
      filename: string;
    };
  }>;
  onClose: () => void;
}

const TableComparison: React.FC<TableComparisonProps> = ({ tables, onClose }) => {
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [comparisonMode, setComparisonMode] = useState<'side-by-side' | 'overlay'>('side-by-side');

  const handleTableSelect = (tableId: string) => {
    setSelectedTables(prev => {
      if (prev.includes(tableId)) {
        return prev.filter(id => id !== tableId);
      } else {
        return [...prev, tableId];
      }
    });
  };

  const getDataType = (value: string) => {
    if (!value || value.trim() === '') return 'empty';
    if (/^\d+$/.test(value.trim())) return 'number';
    if (/^\d+\.\d+$/.test(value.trim())) return 'decimal';
    if (/^\d{4}-\d{2}-\d{2}$/.test(value.trim()) || /^\d{2}\/\d{2}\/\d{4}$/.test(value.trim())) return 'date';
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'email';
    if (/^https?:\/\//.test(value.trim())) return 'url';
    return 'text';
  };

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

  const renderTable = (table: typeof tables[0]) => {
    const { headers, rows } = table.data;
    const hasHeaders = headers && headers.length > 0;
    const displayRows = hasHeaders ? rows : rows;
    const displayHeaders = hasHeaders ? headers : null;

    return (
      <div className="flex-1 min-w-0">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">📊</span>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    {table.documentInfo.filename}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Página {table.data.page} • Documento #{table.documentInfo.id}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">
                  {displayRows.length} filas × {displayRows[0]?.length || 0} columnas
                </span>
              </div>
            </div>
          </div>

          {/* Table content */}
          <div className="overflow-auto max-h-96">
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
                      const dataType = getDataType(cell);
                      const formattedValue = formatValue(cell, dataType);
                      
                      return (
                        <td
                          key={colIndex}
                          className={`px-3 py-2 text-sm border-r border-gray-200 ${
                            dataType === 'number' || dataType === 'decimal' 
                              ? 'text-right font-mono' 
                              : 'text-left'
                          }`}
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
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🔍</span>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Comparar Tablas
              </h3>
              <p className="text-sm text-gray-500">
                Selecciona hasta 3 tablas para comparar
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Comparison mode */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Modo:</span>
              <button
                onClick={() => setComparisonMode('side-by-side')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  comparisonMode === 'side-by-side' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Lado a lado
              </button>
              <button
                onClick={() => setComparisonMode('overlay')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  comparisonMode === 'overlay' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Superposición
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
              title="Cerrar"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Table selection */}
        <div className="p-4 border-b border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Seleccionar tablas para comparar:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {tables.map((table) => (
              <div
                key={table.id}
                onClick={() => handleTableSelect(table.id)}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedTables.includes(table.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedTables.includes(table.id)}
                    onChange={() => handleTableSelect(table.id)}
                    className="rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {table.documentInfo.filename}
                    </p>
                    <p className="text-xs text-gray-500">
                      Página {table.data.page} • {table.data.rows.length} filas
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison view */}
        <div className="p-4">
          {selectedTables.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-4xl">🔍</span>
              <p className="mt-2 text-gray-500">Selecciona tablas para comparar</p>
            </div>
          ) : (
            <div className={`${
              comparisonMode === 'side-by-side' 
                ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6' 
                : 'space-y-6'
            }`}>
              {selectedTables.map((tableId) => {
                const table = tables.find(t => t.id === tableId);
                if (!table) return null;
                return renderTable(table);
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div>
              {selectedTables.length} tabla{selectedTables.length !== 1 ? 's' : ''} seleccionada{selectedTables.length !== 1 ? 's' : ''}
            </div>
            <div className="text-xs text-gray-400">
              Máximo 3 tablas para comparar
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableComparison;
