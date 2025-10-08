import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from './layout/layout';
import ProtectedRoute from './layout/ProtectedRoute';
import LoginPage from '../pages/LoginPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import DashboardPage from '../pages/DashboardPage';
import UserDashboardPage from '../pages/UserDashboardPage';
import MyDocumentsPage from '../pages/MyDocumentsPage';
import MyTablesPage from '../pages/MyTablesPage';
import UploadDocumentsPage from '../pages/UploadDocumentsPage';
import DocumentsPage from '../pages/DocumentsPage';
import TablesPage from '../pages/TablesPage';
import UsersPage from '../pages/UsersPage';
import DepartmentsPage from '../pages/DepartmentsPage';

const AppWrapper: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} 
      />
      <Route 
        path="/forgot-password" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <ForgotPasswordPage />} 
      />
      <Route 
        path="/reset-password" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <ResetPasswordPage />} 
      />
      
      {/* Protected routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<DocumentsPage />} />
        <Route path="admin-dashboard" element={<DashboardPage />} />
        <Route path="my-dashboard" element={<UserDashboardPage />} />
        <Route path="my-documents" element={<MyDocumentsPage />} />
        <Route path="my-tables" element={<MyTablesPage />} />
        <Route path="upload-documents" element={<UploadDocumentsPage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="tables" element={<TablesPage />} />
        <Route 
          path="users" 
          element={
            <ProtectedRoute requiredRole="admin">
              <UsersPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="departments" 
          element={
            <ProtectedRoute requiredRole="admin">
              <DepartmentsPage />
            </ProtectedRoute>
          } 
        />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppWrapper;
