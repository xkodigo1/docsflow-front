import React from 'react';
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm';
import { useNavigate } from 'react-router-dom';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    // Después de enviar el email, redirigir al login
    navigate('/login');
  };

  const handleBack = () => {
    navigate('/login');
  };

  return (
    <ForgotPasswordForm 
      onSuccess={handleSuccess}
      onBack={handleBack}
    />
  );
};

export default ForgotPasswordPage;
