# 🛒 Davi-Commerce Frontend

**Frontend de e-commerce moderna desarrollada con Next.js 14 para un Ecommerce simplificado como prueba técnica para Davivienda.**

## 👨‍💻 Autor

**William Talero**
- Desarrollador Full Stack
- Email: williamtalero@example.com
- GitHub: [williamtalero](https://github.com/williamtalero)

---

## 📋 Descripción

Davi-Commerce es una aplicación frontend moderna de e-commerce desarrollada con Next.js 14, diseñada para integrarse perfectamente con el backend NestJS. La aplicación cuenta con un diseño responsivo, autenticación segura, gestión de carrito de compras y un panel de administración completo.

## 🏗️ Estructura del Proyecto

```
📦 davi-commerce-frontend/
├── 📁 app/                           # Next.js 14 App Router
│   ├── 📁 admin/                     # Panel de administración
│   │   ├── page.tsx                  # Dashboard principal
│   │   ├── products/                 # Gestión de productos
│   │   ├── users/                    # Gestión de usuarios
│   │   └── orders/                   # Gestión de órdenes
│   ├── 📁 auth/                      # Autenticación
│   │   ├── login/                    # Inicio de sesión
│   │   └── register/                 # Registro de usuario
│   ├── 📁 cart/                      # Carrito de compras
│   ├── 📁 checkout/                  # Proceso de compra
│   ├── 📁 products/                  # Catálogo de productos
│   ├── 📁 profile/                   # Perfil de usuario
│   ├── 📁 search/                    # Búsqueda de productos
│   ├── layout.tsx                    # Layout principal
│   ├── page.tsx                      # Página de inicio
│   └── globals.css                   # Estilos globales
├── 📁 components/                    # Componentes React
│   ├── 📁 ui/                        # Componentes base (Shadcn/ui)
│   ├── admin-dashboard.tsx           # Dashboard administrativo
│   ├── cart-page.tsx                 # Página del carrito
│   ├── checkout-form.tsx             # Formulario de compra
│   ├── header.tsx                    # Encabezado de navegación
│   ├── footer.tsx                    # Pie de página
│   ├── product-card.tsx              # Tarjeta de producto
│   ├── product-detail.tsx            # Detalle de producto
│   └── ...                           # Otros componentes
├── 📁 lib/                           # Utilidades y configuraciones
│   ├── api.ts                        # Cliente API para backend
│   ├── auth-context.tsx              # Contexto de autenticación
│   ├── auth-backend.ts               # Servicios de autenticación
│   ├── cart-context.tsx              # Contexto del carrito
│   ├── orders-backend.ts             # Servicios de órdenes
│   ├── products-backend.ts           # Servicios de productos
│   ├── backend-types.ts              # Tipos del backend
│   ├── types.ts                      # Tipos del frontend
│   ├── utils.ts                      # Utilidades generales
│   └── toast.tsx                     # Sistema de notificaciones
├── 📁 public/                        # Archivos estáticos
├── 📄 .env.local                     # Variables de entorno
├── 📄 next.config.js                 # Configuración de Next.js
├── 📄 tailwind.config.js             # Configuración de Tailwind
├── 📄 tsconfig.json                  # Configuración de TypeScript
├── 📄 package.json                   # Dependencias del proyecto
├── 📄 STARTUP_GUIDE.md               # Guía de inicio rápido
└── 📄 README.md                      # Este archivo
```

## 🛠️ Tecnologías y Herramientas

### **Framework Principal**
- **Next.js 14** - Framework React con App Router
- **React 18** - Biblioteca de interfaz de usuario
- **TypeScript** - Tipado estático para JavaScript

### **Estilizado y UI**
- **Tailwind CSS** - Framework de utilidades CSS
- **Shadcn/ui** - Componentes de interfaz de usuario
- **Radix UI** - Primitivos de accesibilidad
- **Lucide React** - Iconos modernos

### **Gestión de Estado**
- **React Context** - Contextos para autenticación y carrito
- **React Hooks** - Gestión de estado local
- **localStorage** - Persistencia de datos del cliente

### **Integración Backend**
- **Fetch API** - Cliente HTTP nativo
- **JWT** - Autenticación basada en tokens
- **API Client** - Cliente personalizado para NestJS backend

### **Funcionalidades Avanzadas**
- **React Hook Form** - Gestión de formularios
- **Zod** - Validación de esquemas
- **React Hot Toast** - Sistema de notificaciones
- **Date-fns** - Manipulación de fechas

### **Herramientas de Desarrollo**
- **ESLint** - Linter de código
- **Prettier** - Formateador de código
- **PostCSS** - Procesador de CSS
- **Autoprefixer** - Prefijos CSS automáticos

## 🎯 Características Principales

### **🔐 Sistema de Autenticación**
- Login y registro de usuarios
- Autenticación JWT
- Protección de rutas
- Roles de usuario (Cliente/Administrador)
- Persistencia de sesión

### **🛍️ Experiencia de Compra**
- Catálogo de productos responsivo
- Sistema de búsqueda y filtros
- Carrito de compras con persistencia
- Proceso de checkout completo
- Confirmación de órdenes
- Gestión de stock en tiempo real

### **👨‍💼 Panel de Administración**
- Dashboard con métricas
- Gestión completa de productos (CRUD)
- **Carga de imágenes híbrida**:
  - Subida directa a Vercel Blob (si está configurado)
  - Ingreso manual de URL de imagen
  - Vista previa en tiempo real
  - Validación de archivos (tipo y tamaño)
- Administración de usuarios
- Gestión de órdenes
- Control de inventario

### **🎨 Diseño y UX**
- Diseño responsivo (móvil/tablet/desktop)
- Modo oscuro/claro
- Animaciones y transiciones suaves
- Componentes accesibles
- Interfaz moderna y limpia

### **⚡ Rendimiento**
- Server-Side Rendering (SSR)
- Static Generation cuando es posible
- Optimización de imágenes automática
- Code splitting
- Lazy loading de componentes

## 🔧 Configuración del Entorno

### **Variables de Entorno (.env.local)**
```bash
# URL del API Backend
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Información de la Aplicación
NEXT_PUBLIC_APP_NAME="Davi Commerce"
NEXT_PUBLIC_APP_DESCRIPTION="Plataforma de e-commerce moderna"

# Vercel Blob Configuration (opcional)
# BLOB_READ_WRITE_TOKEN=vercel_blob_rw_your_token_here

# Configuración de Desarrollo
NODE_ENV=development
```

## 🚀 Instalación y Ejecución

### **Prerrequisitos**
- Node.js 18.0 o superior
- npm o yarn

### **Instalación**
```bash
# Clonar el repositorio
git clone https://github.com/williamtalero/davi-commerce-frontend.git

# Navegar al directorio
cd davi-commerce-frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus configuraciones
```

### **Desarrollo**
```bash
# Ejecutar servidor de desarrollo
npm run dev

# La aplicación estará disponible en:
# http://localhost:3000
```

### **Producción**
```bash
# Construir para producción
npm run build

# Ejecutar versión de producción
npm start
```

### **Análisis de Código**
```bash
# Verificar código con ESLint
npm run lint

# Verificar tipos con TypeScript
npx tsc --noEmit
```

## 📸 Sistema de Carga de Imágenes

La aplicación incluye un sistema híbrido para manejar imágenes de productos:

### **Opción 1: Carga Directa a Vercel Blob**
```bash
# Configurar token en .env.local
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_tu_token_aqui
```

- **Características**:
  - Subida automática a Vercel Blob Storage
  - URLs permanentes y optimizadas
  - CDN global incluido
  - Validación de archivos (JPEG, PNG, WebP, máx 5MB)
  - Drag & drop interface

### **Opción 2: URL Manual**
- Permite ingresar URLs directas de imágenes
- Ideal para usar con servicios gratuitos:
  - [Unsplash](https://unsplash.com) - Imágenes profesionales
  - [Pexels](https://pexels.com) - Fotos de stock
  - [Pixabay](https://pixabay.com) - Imágenes libres
- Vista previa en tiempo real
- Validación de URL

### **Funcionalidades del Sistema**
- ✅ Interface de tabs para alternar entre opciones
- ✅ Arrastrar y soltar archivos
- ✅ Vista previa inmediata
- ✅ Validación de tipos de archivo
- ✅ Límite de tamaño configurable
- ✅ Manejo de errores robusto
- ✅ Fallback automático si Vercel Blob no está configurado

## 🔄 Integración con Backend

La aplicación frontend está diseñada para trabajar en **modo dual**:

### **Modo Conectado (Producción)**
- Se conecta al backend NestJS en `http://localhost:3001/api`
- Todas las operaciones CRUD van a través del API
- Autenticación JWT real
- Persistencia en base de datos PostgreSQL

### **Modo Offline (Demostración)**
- Utiliza datos simulados (mock data)
- Credenciales de demostración predefinidas
- Funcionalidad limitada pero operativa
- Ideal para desarrollo sin backend

### **Credenciales de Demostración**
```
Cliente:
- Email: demo@example.com
- Contraseña: password

Administrador:
- Email: admin@store.com
- Contraseña: admin123
```

## 📱 Funcionalidades por Rol

### **Cliente**
- ✅ Navegar catálogo de productos
- ✅ Búsqueda y filtrado
- ✅ Gestión de carrito
- ✅ Proceso de checkout
- ✅ Perfil de usuario
- ✅ Historial de órdenes

### **Administrador**
- ✅ Todo lo del cliente +
- ✅ Dashboard administrativo
- ✅ Gestión de productos
- ✅ Administración de usuarios
- ✅ Gestión de órdenes
- ✅ Reportes y métricas

## 🎨 Sistema de Diseño

### **Paleta de Colores**
- **Primario:** Azul (#3B82F6)
- **Secundario:** Gris (#6B7280)
- **Éxito:** Verde (#10B981)
- **Error:** Rojo (#EF4444)
- **Advertencia:** Amarillo (#F59E0B)

### **Tipografía**
- **Fuente Principal:** Inter (Google Fonts)
- **Tamaños:** 12px, 14px, 16px, 18px, 20px, 24px, 32px, 48px

### **Espaciado**
- Sistema basado en múltiplos de 4px
- Margin/Padding: 4px, 8px, 12px, 16px, 20px, 24px, 32px, 48px

## 🔒 Seguridad

### **Medidas Implementadas**
- Validación de entrada en formularios
- Sanitización de datos
- Protección CSRF
- Headers de seguridad
- Autenticación JWT
- Protección de rutas sensibles

### **Buenas Prácticas**
- Validación tanto en cliente como servidor
- Manejo seguro de tokens
- No exposición de datos sensibles
- Sanitización de HTML
- Validación de tipos con TypeScript

## 📊 Monitoreo y Analytics

### **Métricas Implementadas**
- Rendimiento de la aplicación
- Errores de JavaScript
- Métricas de usuario
- Conversión de ventas
- Uso de funcionalidades

## 🌐 Navegadores Soportados

- **Chrome:** 90+
- **Firefox:** 88+
- **Safari:** 14+
- **Edge:** 90+
- **Mobile Safari:** 14+
- **Chrome Mobile:** 90+

## 📈 Rendimiento

### **Métricas Core Web Vitals**
- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1

### **Optimizaciones**
- Compresión de imágenes automática
- Minificación de CSS/JS
- Tree shaking
- Caching estratégico
- Lazy loading

---

**¡Gracias por usar Davi-Commerce! 🎉**

*Para soporte técnico o preguntas, contacta a williamtalero@example.com*