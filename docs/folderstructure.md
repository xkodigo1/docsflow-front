# 📂 Estructura de Carpetas - Frontend DocsFlow

Este documento explica el uso de cada carpeta y archivo en el **frontend** del proyecto **DocsFlow**, desarrollado con **React + TypeScript + Tailwind**.

---

## 📁 `public/`
Contiene archivos estáticos accesibles públicamente:
- `index.html`: punto de entrada principal de la app.
- `favicon.ico`, logos u otros recursos que no pasan por Webpack/Vite.

---

## 📁 `src/`
Carpeta principal del código fuente.

### 📁 `assets/`
Imágenes, íconos, fuentes y recursos estáticos usados dentro de los componentes.

---

### 📁 `components/`
Componentes reutilizables y modulares. Se recomienda dividir en subcarpetas:
- **`common/`**: botones, inputs, modales, loaders.
- **`layout/`**: componentes de estructura como `Header`, `Sidebar`, `Navbar`, `Footer`.
- **`auth/`**: formularios de autenticación (`LoginForm`, `RegisterForm`).
- **`documents/`**: componentes específicos de documentos (`Upload`, `DocumentList`, `DocumentDetail`).

---

### 📁 `contexts/`
Manejo de **Context API** para estados globales.
- `AuthContext.tsx`: contexto para autenticación de usuarios.
- `ThemeContext.tsx`: contexto opcional para tema dark/light.

---

### 📁 `hooks/`
Hooks personalizados de React.
- `useAuth.ts`: encapsula la lógica de autenticación (login, logout).
- `useDocuments.ts`: manejo de carga, búsqueda y listado de documentos.

---

### 📁 `pages/`
Vistas principales que representan pantallas completas:
- `LoginPage.tsx`
- `DashboardPage.tsx`
- `UsersPage.tsx`
- `DocumentsPage.tsx`

---

### 📁 `routes/`
Definición de rutas de la aplicación.
- `AppRouter.tsx`: contiene la configuración de React Router (rutas públicas y protegidas).

---

### 📁 `services/`
Capa de comunicación con el **backend (API)** usando **Axios**.
- `api.ts`: configuración base de Axios + interceptores JWT.
- `auth.service.ts`: funciones para login, registro y refresh tokens.
- `documents.service.ts`: funciones para CRUD de documentos.

---

### 📁 `store/`
Estado global de la aplicación si se usa **Zustand** o **Redux**.
- `useUserStore.ts`
- `useDocumentStore.ts`

---

### 📁 `styles/`
Estilos globales.
- `index.css`: archivo principal que importa TailwindCSS y estilos personalizados.

---

### 📁 `types/`
Interfaces y tipos de **TypeScript** para garantizar tipado estático.
- `User.ts`: definición de un usuario.
- `Document.ts`: definición de documentos.
- `ApiResponse.ts`: tipos genéricos para respuestas de API.

---

### 📁 `utils/`
Funciones de utilidad y helpers.
- `formatDate.ts`: formateo de fechas.
- `parsePDF.ts`: función auxiliar para previsualización de PDFs.
- `validators.ts`: validaciones reutilizables (emails, passwords, etc.).

---

### 📄 Archivos raíz de `src/`
- **`App.tsx`**: componente raíz de la aplicación.
- **`main.tsx`**: punto de entrada que monta ReactDOM y configura el `AppRouter`.

---

## ⚙️ Archivos de configuración raíz
- `package.json`: dependencias y scripts npm.
- `tsconfig.json`: configuración de TypeScript.
- `tailwind.config.js`: configuración de TailwindCSS.
- `postcss.config.js`: configuración de PostCSS.
- `vite.config.ts`: configuración de Vite.

---

## ✅ Buenas prácticas
1. Mantener componentes pequeños y reutilizables.
2. Dividir `components/` en subcarpetas por dominio (auth, documents, etc.).
3. Centralizar llamadas a la API en `services/`.
4. Usar tipado estricto de TypeScript en `types/`.
5. Mantener `pages/` como vistas y delegar la lógica a hooks o servicios.
