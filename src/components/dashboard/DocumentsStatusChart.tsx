import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DocumentsStatusChartProps {
  data: {
    pending: number;
    processing: number;
    processed: number;
    error: number;
  };
}

const DocumentsStatusChart: React.FC<DocumentsStatusChartProps> = ({ data }) => {
  const chartData = [
    {
      name: 'Pendientes',
      value: data.pending,
      color: '#F59E0B'
    },
    {
      name: 'Procesando',
      value: data.processing,
      color: '#3B82F6'
    },
    {
      name: 'Procesados',
      value: data.processed,
      color: '#10B981'
    },
    {
      name: 'Con Error',
      value: data.error,
      color: '#EF4444'
    }
  ];

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Documentos por Estado</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Total: {Object.values(data).reduce((a, b) => a + b, 0)}</span>
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              formatter={(value: any) => [value, 'Documentos']}
              labelStyle={{ color: '#374151' }}
              contentStyle={{
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend />
            <Bar 
              dataKey="value" 
              fill="#3B82F6"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Estadísticas adicionales */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{data.processed}</div>
          <div className="text-sm text-gray-500">Procesados</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{data.error}</div>
          <div className="text-sm text-gray-500">Con Errores</div>
        </div>
      </div>
    </div>
  );
};

export default DocumentsStatusChart;
