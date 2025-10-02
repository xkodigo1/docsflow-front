import { Link } from "react-router-dom";

export default function Footer() {
    return (
      <footer className="bg-[#0a1a2f] text-gray-300 py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          {/* Copyright */}
          <p className="text-sm">© 2025 DocsFlow. Todos los derechos reservados.</p>
  
          {/* Links rápidos */}
          <div className="flex space-x-20 mt-2 md:mt-0">
            <Link to="soporte" className="hover:text-white text-sm">
              Soporte
            </Link>
            <Link to="privacidad" className="hover:text-white text-sm">
              Privacidad
            </Link>
          </div>
  
          {/* Versión */}
          <span className="text-xs mt-2 md:mt-0 opacity-70">v1.0.0</span>
        </div>
      </footer>
    );
  }