export default function PrivacidadPage() {
  return (
    <div className="container mx-auto flex flex-col justify-center items-center max-w-4xl mt-12">
    <h1 className="text-3xl font-bold mb-6 text-gray-800 ">Política de Privacidad</h1>
    
    <div className="max-w-4xl mt-4">
      <div className="bg-white rounded-lg shadow-md p-8">
      <p className="text-gray-600 text-sm">En DocsFlow, nos comprometemos a proteger tu privacidad y garantizar la seguridad de tu información personal.</p>
        
        <div className="space-y-4 mb-4 mt-4">
          <div>
            <h2 className="font-medium text-gray-800">Información que recopilamos</h2>
            <p className="text-gray-600 text-sm">Recopilamos información que nos proporcionas directamente, como cuando creas una cuenta o subes documentos.</p>
          </div>
          
          <div>
            <h2 className="font-medium text-gray-800">Cómo usamos tu información</h2>
            <p className="text-gray-600 text-sm">Utilizamos tu información para proporcionar y mejorar nuestros servicios, así como para comunicarnos contigo.</p>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-800">Protección de datos</h3>
            <p className="text-gray-600 text-sm">Implementamos medidas de seguridad técnicas y organizativas para proteger tu información personal.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
