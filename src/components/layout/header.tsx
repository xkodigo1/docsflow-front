import { Link, useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";


export default function Header() {
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // 🔹 Conectar con los searchParams
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [debouncedQuery, setDebouncedQuery] = useState(searchParams.get("q") || "");

  // Cerrar el menú desplegable cuando se hace clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsModalOpen(false);
      }
    }

    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isModalOpen]);

  // 🔹 Debounce para la búsqueda en vivo (más rápido para mejor UX)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300); // Reducido a 300ms para búsqueda más rápida

    return () => clearTimeout(timer);
  }, [query]);

  // 🔹 Sincronizar input cuando cambie la URL (solo desde navegación externa)
  useEffect(() => {
    const urlQuery = searchParams.get("q") || "";
    setQuery(urlQuery);
    setDebouncedQuery(urlQuery);
  }, [searchParams]);

  // 🔹 Actualizar URL cuando cambie el query con debounce (solo si estamos en /app/docs)
  useEffect(() => {
    if (location.pathname === '/app/docs') {
      const currentQuery = searchParams.get("q") || "";
      if (debouncedQuery !== currentQuery) {
        if (debouncedQuery.trim()) {
          setSearchParams({ q: debouncedQuery });
        } else {
          setSearchParams({});
        }
      }
    }
  }, [debouncedQuery, location.pathname, setSearchParams, searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Si ya estamos en la página de documentos, solo actualizar los parámetros
    if (location.pathname === '/app/docs') {
      if (query) {
        setSearchParams({ q: query });
      } else {
        setSearchParams({});
      }
    } else {
      // Si estamos en otra página, navegar a documentos con la búsqueda
      if (query) {
        navigate(`/app/docs?q=${encodeURIComponent(query)}`);
      } else {
        navigate('/app/docs');
      }
    }
  };

  return (
    <header className="bg-[#0a1a2f] text-white px-6 py-3 flex items-center justify-between shadow-md">
      {/* Izquierda: Logo + Navegación */}
      <div className="flex items-center space-x-8">
        <div className="flex items-center space-x-4">
          <img src="/logo.png" alt="DocsFlow Logo" className="w-18 h-16" />
          <Link to="/" className="font-bold text-lg">DocsFlow</Link>
        </div>
        <nav className="hidden md:flex space-x-8">
          <Link to="/app/docs" className="hover:underline">Documentos</Link>
          <Link to="/app/upload" className="hover:underline">Subir</Link>
        </nav>
      </div>

      {/* Centro: Barra de búsqueda */}
      <form onSubmit={handleSearch} className="flex-grow max-w-md px-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar documentos..."
          className="w-full px-3 py-2 rounded-md bg-gray-800 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      </form>


      {/* Derecha: Perfil con menú */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsModalOpen(!isModalOpen)}
          className="flex items-center space-x-2 focus:outline-none"
        >
        
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
                          logout();
                          navigate('/login');
                          
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