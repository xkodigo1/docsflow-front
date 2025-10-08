import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './header';
import Sidebar from './Sidebar';
import QuickNotifications from '../notifications/QuickNotifications';

const Layout: React.FC = () => {
  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Sidebar fijo */}
      <Sidebar isOpen={true} onClose={() => {}} />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <Outlet />
        </div>
      </main>
      
      {/* Notificaciones rápidas */}
      <QuickNotifications />
    </div>
  </div>
);
};

export default Layout;

