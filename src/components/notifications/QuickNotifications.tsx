import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { documentService } from '../../services/documentService';

interface QuickNotification {
  id: number;
  type: 'success' | 'warning' | 'info';
  message: string;
  timestamp: string;
}

const QuickNotifications: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<QuickNotification[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkRecentActivity = async () => {
      if (!user) return;

      try {
        // Obtener documentos recientes del usuario
        const response = await documentService.getDocuments({
          limit: 5,
          offset: 0
        });

        const myDocuments = response.items.filter((doc: any) => 
          doc.uploaded_by === user.id
        );

        // Crear notificaciones basadas en cambios de estado
        const newNotifications: QuickNotification[] = [];

        myDocuments.forEach((doc: any) => {
          const now = new Date();
          const docDate = new Date(doc.created_at);
          const timeDiff = now.getTime() - docDate.getTime();
          const hoursDiff = timeDiff / (1000 * 60 * 60);

          // Notificación para documentos procesados recientemente (últimas 24 horas)
          if (doc.status === 'processed' && hoursDiff < 24) {
            newNotifications.push({
              id: doc.id,
              type: 'success',
              message: `✅ ${doc.filename} ha sido procesado exitosamente`,
              timestamp: doc.processed_at || doc.created_at
            });
          }

          // Notificación para documentos fallidos recientemente
          if (doc.status === 'failed' && hoursDiff < 24) {
            newNotifications.push({
              id: doc.id + 1000, // ID único para fallidos
              type: 'warning',
              message: `⚠️ ${doc.filename} falló en el procesamiento`,
              timestamp: doc.created_at
            });
          }
        });


        setNotifications(newNotifications.slice(0, 3)); // Máximo 3 notificaciones
        setIsVisible(newNotifications.length > 0);
      } catch (error) {
        console.error('Error checking notifications:', error);
      }
    };

    checkRecentActivity();
  }, [user]);

  const dismissNotification = (id: number) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
    if (notifications.length === 1) {
      setIsVisible(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-green-200 bg-green-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'info': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  if (!isVisible || notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg border shadow-lg ${getNotificationColor(notification.type)} animate-slide-in`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <span className="text-lg">{getNotificationIcon(notification.type)}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {notification.message}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(notification.timestamp).toLocaleString('es-ES')}
                </p>
              </div>
            </div>
            <button
              onClick={() => dismissNotification(notification.id)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuickNotifications;
