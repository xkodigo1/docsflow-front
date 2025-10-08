import React from 'react';

interface RecentActivityProps {
  title: string;
  items: Array<{
    id: number;
    name: string;
    date: string;
    status?: string;
    icon: string;
  }>;
  emptyMessage: string;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ title, items, emptyMessage }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pendiente' },
      processing: { color: 'bg-blue-100 text-blue-800', text: 'Procesando' },
      processed: { color: 'bg-green-100 text-green-800', text: 'Procesado' },
      error: { color: 'bg-red-100 text-red-800', text: 'Error' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      </div>
      <div className="p-6">
        {items.length === 0 ? (
          <div className="text-center py-8">
            <span className="text-4xl">📭</span>
            <p className="mt-2 text-gray-500">{emptyMessage}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <span className="text-2xl">{item.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(item.date)}
                  </p>
                </div>
                {item.status && (
                  <div className="flex-shrink-0">
                    {getStatusBadge(item.status)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;
