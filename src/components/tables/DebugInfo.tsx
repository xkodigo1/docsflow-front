import React from 'react';

interface DebugInfoProps {
  data: any;
  title?: string;
}

const DebugInfo: React.FC<DebugInfoProps> = ({ data, title = "Debug Info" }) => {
  // Solo mostrar en desarrollo
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <h4 className="text-sm font-medium text-yellow-800 mb-2">{title}</h4>
      <pre className="text-xs text-yellow-700 overflow-auto max-h-40">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};

export default DebugInfo;
