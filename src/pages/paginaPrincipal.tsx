import React, { useState } from "react";

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      simulateUpload();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      simulateUpload();
    }
  };

  // Simulación de subida con progreso
  const simulateUpload = () => {
    setProgress(0);
    let progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-200 p-6">
      {/* Zona Drag & Drop */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="w-full  max-w-md p-20 border-2 border-dashed border-gray-400 rounded-xl bg-white text-center cursor-pointer hover:border-blue-500"
      >
        <input
          type="file"
          className="hidden"
          id="fileInput"
          onChange={handleFileChange}
        />
        <label htmlFor="fileInput" className="cursor-pointer">
          <img src="/logo-descarga.png" alt="Subir archivo" className="mx-auto mb-4 w-16 h-16" />
          <p className="text-gray-600 font-medium">Arrastra y suelta tu archivo aquí</p>
          <p className="text-gray-500 text-sm mt-2">o haz clic para seleccionar</p>
        </label>
      </div>

      {/* Archivo seleccionado */}
      {file && (
        <div className="mt-4 w-full max-w-md">
          <p className="text-gray-700 font-medium">
            Archivo: {file.name}
          </p>

          {/* Barra de progreso */}
          <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
            <div
              className="bg-blue-500 h-4 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <p className="text-sm text-gray-500 mt-1">
            {progress < 100 ? `Subiendo... ${progress}%` : "✅ Subida completa"}
          </p>
        </div>
      )}
    </div>
  );
}