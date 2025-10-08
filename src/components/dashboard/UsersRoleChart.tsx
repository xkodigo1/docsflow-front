import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface UsersRoleChartProps {
  data: {
    admin: number;
    operador: number;
  };
}

const UsersRoleChart: React.FC<UsersRoleChartProps> = ({ data }) => {
  const chartData = [
    {
      name: 'Administradores',
      value: data.admin,
      color: '#EF4444'
    },
    {
      name: 'Operadores',
      value: data.operador,
      color: '#3B82F6'
    }
  ];

  const COLORS = ['#EF4444', '#3B82F6'];

  const totalUsers = data.admin + data.operador;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Distribución de Usuarios</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Total: {totalUsers}</span>
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: any) => [value, 'Usuarios']}
              labelStyle={{ color: '#374151' }}
              contentStyle={{
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value) => (
                <span style={{ color: '#374151', fontSize: '14px' }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* Estadísticas detalladas */}
      <div className="mt-4 space-y-2">
        {chartData.map((item, index) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: COLORS[index] }}
              ></div>
              <span className="text-sm text-gray-600">{item.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900">{item.value}</span>
              <span className="text-xs text-gray-500">
                ({totalUsers > 0 ? ((item.value / totalUsers) * 100).toFixed(1) : 0}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsersRoleChart;
