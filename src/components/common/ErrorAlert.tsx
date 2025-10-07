import React from 'react';

interface ErrorAlertProps {
  message: string;
  onClose?: () => void;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, onClose }) => {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center justify-between">
      <div className="flex items-center">
        <span className="text-red-500 mr-2">⚠️</span>
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-red-500 hover:text-red-700 ml-4"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default ErrorAlert;

