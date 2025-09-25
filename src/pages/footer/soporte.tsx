export default function SoportePage() {
  return (
    <div className="container mx-auto flex flex-col justify-center items-center max-w-4xl mt-12">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 ">Centro de Soporte</h1>
      
      <div className="max-w-4xl mt-10">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Preguntas Frecuentes</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-800">¿Cómo subo un documento?</h3>
              <p className="text-gray-600 text-sm">Arrastra y suelta tu archivo en la zona designada o haz clic para seleccionar.</p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-800">¿Qué formatos son compatibles?</h3>
              <p className="text-gray-600 text-sm">Admitimos documentos PDF.</p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-800">¿Es seguro subir mis documentos?</h3>
              <p className="text-gray-600 text-sm">Sí, todos los documentos se cifran y se almacenan de forma segura.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}