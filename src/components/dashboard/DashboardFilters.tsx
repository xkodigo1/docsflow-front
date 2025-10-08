import React from 'react';

interface DashboardFiltersProps {
  onDateRangeChange: (startDate: string, endDate: string) => void;
  onDepartmentChange: (departmentId: string) => void;
  departments: Array<{ id: number; name: string }>;
  selectedDepartment: string;
  dateRange: { start: string; end: string };
}

const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  onDateRangeChange,
  onDepartmentChange,
  departments,
  selectedDepartment,
  dateRange
}) => {
  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    const newRange = { ...dateRange, [field]: value };
    onDateRangeChange(newRange.start, newRange.end);
  };

  const setPresetRange = (days: number) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    onDateRangeChange(
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-medium text-gray-900">Filtros del Dashboard</h3>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          {/* Filtros de fecha */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Desde:</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => handleDateRangeChange('start', e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Hasta:</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => handleDateRangeChange('end', e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          {/* Presets de fecha */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Rango:</span>
            <div className="flex space-x-1">
              <button
                onClick={() => setPresetRange(7)}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                7 días
              </button>
              <button
                onClick={() => setPresetRange(30)}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                30 días
              </button>
              <button
                onClick={() => setPresetRange(90)}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                90 días
              </button>
            </div>
          </div>
          
          {/* Filtro de departamento */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Departamento:</label>
            <select
              value={selectedDepartment}
              onChange={(e) => onDepartmentChange(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id.toString()}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardFilters;
