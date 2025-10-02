import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useDocuments } from "../hooks/useDocuments";

// Función para formatear tamaño de archivo
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + " B";
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + " MB";
  else return (bytes / 1073741824).toFixed(1) + " GB";
};

// Función para obtener color según el tipo de documento
const getFileTypeColor = (type: string | undefined): string => {
  switch(type) {
    case "pdf": return "bg-red-100 text-red-800";
    case "doc": 
    case "docx": return "bg-blue-100 text-blue-800";
    case "xls": 
    case "xlsx": return "bg-green-100 text-green-800";
    case "ppt": 
    case "pptx": return "bg-orange-100 text-orange-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

export default function DocsListPage() {
  const [searchParams] = useSearchParams();
  const currentQuery = searchParams.get("q") || "";
  
  // Usar nuestro hook personalizado para conectar con la base de datos
  const {
    documents,
    loading,
    error,
    pagination,
    fetchDocuments,
    searchDocuments
  } = useDocuments({
    autoFetch: true,
    initialParams: { limit: 10, page: 1 }
  });

  // Buscar cuando cambia la URL (solo desde el header)
  useEffect(() => {
    const query = searchParams.get("q") || "";
    
    console.log('Búsqueda activada:', { query }); // Debug
    
    // Solo ejecutar si hay un cambio real en la query
    if (query.trim()) {
      searchDocuments(query);
    } else {
      fetchDocuments();
    }
  }, [searchParams.get("q")]); // Solo la query para evitar loops

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Título */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Documentos</h1>
      </div>
      {/* Estado de carga */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Cargando documentos...</span>
        </div>
      )}

      {/* Manejo de errores */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="text-red-800">
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      {/* Lista de documentos */}
      <ul className="space-y-3">
        {!loading && documents.length === 0 ? (
          <li className="text-center text-gray-500 py-8">No se encontraron documentos</li>
        ) : (
          documents.map((doc) => (
            <li key={doc.id} className="bg-white rounded-lg shadow p-4 flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className={`px-2 py-1 text-xs font-semibold rounded ${getFileTypeColor(doc.type)}`}>
                  {doc.type || 'Sin tipo'}
                </div>
                <div>
                  <h2 className="text-lg font-medium text-gray-900">{doc.title}</h2>
                  <p className="text-sm text-gray-600">Usuario ID: {doc.userId}</p>
                  {doc.content && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{doc.content}</p>
                  )}
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(doc.createdAt).toLocaleDateString()} • 
                    {doc.fileSize ? formatFileSize(doc.fileSize) : 'Sin tamaño'}
                  </div>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-2">
                {doc.tags?.slice(0, 3).map((tag) => (
                  <span key={tag} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">#{tag}</span>
                ))}
                <span className={`px-2 py-1 text-xs rounded ${
                  doc.status === 'published' ? 'bg-green-100 text-green-800' :
                  doc.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {doc.status}
                </span>
              </div>
            </li>
          ))
        )}
      </ul>

      {/* Paginación */}
      {pagination.total > 0 && (
        <div className="flex justify-between items-center mt-8">
          <div className="text-sm text-gray-600">
            Mostrando {documents.length} de {pagination.total} documentos
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => fetchDocuments({ page: pagination.page - 1 })}
              disabled={pagination.page <= 1}
              className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Anterior
            </button>
            <span className="px-3 py-2 text-sm text-gray-600">
              Página {pagination.page}
            </span>
            <button
              onClick={() => fetchDocuments({ page: pagination.page + 1 })}
              disabled={pagination.page * pagination.limit >= pagination.total}
              className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

