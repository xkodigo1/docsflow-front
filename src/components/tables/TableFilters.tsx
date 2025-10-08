import React from 'react';

interface TableFiltersProps {
  onFilterChange: (filters: {
    dateRange: { start: string; end: string };
    documentType: string;
    hasHeaders: boolean | null;
    minRows: number;
    maxRows: number;
  }) => void;
  filters: {
    dateRange: { start: string; end: string };
    documentType: string;
    hasHeaders: boolean | null;
    minRows: number;
    maxRows: number;
  };
}

const TableFilters: React.FC<TableFiltersProps> = ({ onFilterChange, filters }) => {
  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    const newRange = { ...filters.dateRange, [field]: value };
    onFilterChange({ ...filters, dateRange: newRange });
  };

  const setPresetRange = (days: number) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    onFilterChange({
      ...filters,
      dateRange: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      }
    });
  };

  const handleDocumentTypeChange = (type: string) => {
    onFilterChange({ ...filters, documentType: type });
  };

  const handleHeadersChange = (hasHeaders: boolean | null) => {
    onFilterChange({ ...filters, hasHeaders });
  };

  const handleRowsChange = (field: 'minRows' | 'maxRows', value: number) => {
    onFilterChange({ ...filters, [field]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      dateRange: { start: '', end: '' },
      documentType: '',
      hasHeaders: null,
      minRows: 0,
      maxRows: 1000
    });
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Filtros Avanzados</h3>
        <button
          onClick={clearFilters}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Limpiar filtros
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Filtro de fecha */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Rango de fechas
          </label>
          <div className="space-y-2">
            <input
              type="date"
              value={filters.dateRange.start}
              onChange={(e) => handleDateRangeChange('start', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Desde"
            />
            <input
              type="date"
              value={filters.dateRange.end}
              onChange={(e) => handleDateRangeChange('end', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Hasta"
            />
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => setPresetRange(7)}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              7 días
            </button>
            <button
              onClick={() => setPresetRange(30)}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              30 días
            </button>
            <button
              onClick={() => setPresetRange(90)}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              90 días
            </button>
          </div>
        </div>

        {/* Filtro de tipo de documento */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Tipo de documento
          </label>
          <select
            value={filters.documentType}
            onChange={(e) => handleDocumentTypeChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos</option>
            <option value="factura">Facturas</option>
            <option value="reporte">Reportes</option>
            <option value="contrato">Contratos</option>
            <option value="otro">Otros</option>
          </select>
        </div>

        {/* Filtro de encabezados */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Encabezados
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="headers"
                checked={filters.hasHeaders === null}
                onChange={() => handleHeadersChange(null)}
                className="mr-2"
              />
              <span className="text-sm">Todos</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="headers"
                checked={filters.hasHeaders === true}
                onChange={() => handleHeadersChange(true)}
                className="mr-2"
              />
              <span className="text-sm">Con encabezados</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="headers"
                checked={filters.hasHeaders === false}
                onChange={() => handleHeadersChange(false)}
                className="mr-2"
              />
              <span className="text-sm">Sin encabezados</span>
            </label>
          </div>
        </div>

        {/* Filtro de número de filas */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Número de filas
          </label>
          <div className="space-y-2">
            <div>
              <label className="block text-xs text-gray-500">Mínimo:</label>
              <input
                type="number"
                value={filters.minRows}
                onChange={(e) => handleRowsChange('minRows', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500">Máximo:</label>
              <input
                type="number"
                value={filters.maxRows}
                onChange={(e) => handleRowsChange('maxRows', parseInt(e.target.value) || 1000)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableFilters;
