import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar el menú desplegable cuando se hace clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsModalOpen(false);
      }
    }

    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModalOpen]);

  return (
    <header className="bg-[#0a1a2f] text-white px-6 py-3 flex items-center justify-between shadow-md">
      {/* Izquierda: Logo + Navegación */}
      <div className="flex items-center space-x-8">
        <div className="flex items-center space-x-4">
          
          <img
            src="/logo.png"
            alt="DocsFlow Logo"
            className="w-18 h-16"
          />
          
          <Link to="/" className="font-bold text-lg">
            DocsFlow
          </Link>
         
        </div>
        <nav className="hidden md:flex space-x-8">
          <Link to="#" className="hover:underline">
            dashboard
          </Link>
          <Link to="/upload" className="hover:underline">
            upload
          </Link>
          <Link to="#" className="hover:underline">
            documentos
          </Link>
        </nav>
      </div>

      {/* Centro: Barra de búsqueda */}
      <div className="flex-grow max-w-md px-6">
        <input
          type="text"
          placeholder="Buscar documentos..."
          className="w-full px-3 py-2 rounded-md bg-gray-800 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      </div>

      {/* Derecha: Perfil con menú */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsModalOpen(!isModalOpen)}
          className="flex items-center space-x-2 focus:outline-none"
        >
          <img
            src="https://ui-avatars.com/api/?name=User+Test&background=0D8ABC&color=fff"
            alt="Perfil"
            className="w-9 h-9 rounded-full"
          />
          <span className="hidden md:block">Usuario</span>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Dropdown */}
        {isModalOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-md shadow-lg py-2 z-50">
            <button
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              onClick={() => {
                setIsModalOpen(false);
                setIsOpen(true);
              }}
            >
              Cerrar sesión
            </button>
          </div>
        )}
        
        {/* Modal de confirmación de cerrar sesión */}
        {
          isOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                  <div className="bg-white rounded-lg shadow-lg p-6 w-80">
                    {/* Título */}
                    <h2 className="text-xl font-bold mb-4 text-gray-800">Cerrar sesión</h2>

                    {/* Mensaje */}
                    <p className="mb-6 text-gray-600">
                      ¿Estás seguro que deseas cerrar tu sesión?
                      Tendrás que iniciar sesión de nuevo para continuar.
                    </p>

                    {/* Botones */}
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setIsOpen(false)}
                        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          // Aquí puedes agregar la lógica de cerrar sesión
                          console.log('Cerrando sesión...');
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                </div>
              )
            }
      </div>
    </header>
  );
}