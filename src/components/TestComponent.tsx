import React from 'react';

const TestComponent: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">Docsflow</h1>
        <p className="text-gray-600">Frontend funcionando correctamente</p>
        <div className="mt-4">
          <span className="text-2xl">✅</span>
        </div>
      </div>
    </div>
  );
};

export default TestComponent;
