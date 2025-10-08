import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface TrendsChartProps {
  data: Array<{
    date: string;
    documents: number;
    users: number;
    processed: number;
  }>;
}

const TrendsChart: React.FC<TrendsChartProps> = ({ data }) => {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Tendencias de Actividad</h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-sm text-gray-600">Documentos</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-600">Procesados</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-sm text-gray-600">Usuarios</span>
          </div>
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
              }}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              formatter={(value: any, name: string) => [
                value, 
                name === 'documents' ? 'Documentos' : 
                name === 'processed' ? 'Procesados' : 
                name === 'users' ? 'Usuarios' : name
              ]}
              labelFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('es-ES', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                });
              }}
              labelStyle={{ color: '#374151' }}
              contentStyle={{
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend 
              formatter={(value) => (
                <span style={{ color: '#374151', fontSize: '14px' }}>
                  {value === 'documents' ? 'Documentos' : 
                   value === 'processed' ? 'Procesados' : 
                   value === 'users' ? 'Usuarios' : value}
                </span>
              )}
            />
            <Line 
              type="monotone" 
              dataKey="documents" 
              stroke="#3B82F6" 
              strokeWidth={2}
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="processed" 
              stroke="#10B981" 
              strokeWidth={2}
              dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="users" 
              stroke="#8B5CF6" 
              strokeWidth={2}
              dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#8B5CF6', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Resumen de tendencias */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-lg font-semibold text-blue-600">
            {data.length > 0 ? data[data.length - 1].documents : 0}
          </div>
          <div className="text-xs text-gray-500">Documentos Hoy</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-green-600">
            {data.length > 0 ? data[data.length - 1].processed : 0}
          </div>
          <div className="text-xs text-gray-500">Procesados Hoy</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-purple-600">
            {data.length > 0 ? data[data.length - 1].users : 0}
          </div>
          <div className="text-xs text-gray-500">Usuarios Activos</div>
        </div>
      </div>
    </div>
  );
};

export default TrendsChart;
