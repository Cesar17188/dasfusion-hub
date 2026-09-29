# 🚀 DASFusion Hub — Enterprise Client Portal & Engineering Showcase

![Angular](https://img.shields.io/badge/Angular-21.x-DD0031?style=flat&logo=angular)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?style=flat&logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?style=flat&logo=supabase)
![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)

Plataforma integral y portal de clientes para **DASFusion Technologies**. Combina una landing page corporativa de alto impacto visual orientada a la conversión con un portal de clientes interactivo en tiempo real para el seguimiento de proyectos de software, tableros Kanban, cotizaciones inteligentes y gestión de sprints.

---

## 🌟 Características Principales

### 🌐 1. Landing Page Pública (Mobile-First & High Conversion)
- **Navegación Fluida & Responsiva:** Navbar fija con desenfoque de fondo (*backdrop blur*), menú móvil interactivo y desplazamiento suave (*smooth scroll*) anclado a secciones clave (`#inicio`, `#cotizador`, `#oficina`, `#proyectos`, `#equipo`).
- **Hero Interactivo:** Presentación visual con estética de vanguardia en modo oscuro, métricas de rendimiento y llamados a la acción duales (Exploración y Cotización).
- **Showcase de Casos de Éxito & Portafolio:** Filtros por categoría (AI & ML, Fullstack Web, SaaS Enterprise, Cloud & DevOps, Mobile Apps) e inspección detallada de arquitecturas y métricas alcanzadas.
- **Tech Stack Marquee:** Carrusel continuo con tecnologías dominadas (Angular, Python, Node.js, Supabase, Google Cloud, Docker, Kubernetes, TailwindCSS, etc.).
- **Perfiles del Equipo de Ingeniería:** Fichas profesionales de los arquitectos e ingenieros líderes con enlaces directos y especialidades.
- **Footer Corporativo:** Enlaces de navegación, redes sociales, correo oficial (`proyectos@dasfusion.ec`) y botón de contacto directo a **WhatsApp (+593 98 714 8786)**.

### 💼 2. Portal Privado de Clientes (`/portal`)
- **Dashboard en Tiempo Real:** Métricas automáticas consolidadas (proyectos activos, entregables completados, avance porcentual ponderado y salud del proyecto) calculadas con Angular Signals.
- **Tablero Kanban Interactivo:** Gestión de ciclo de vida del proyecto por fases (*Discovery*, *Design*, *Development*, *QA Testing*, *Delivered*) con persistencia en Supabase y sincronización en tiempo real vía WebSockets.
- **Lista y Ficha de Proyectos:** Visualización de requerimientos modulares (*Must have / Nice to have*), progreso interactivo y especificaciones técnicas.
- **Cotizador & Motor de Estimación:**
  - Selección de categoría (*AI & ML*, *Web*, *SaaS*, *Mobile*, *Cloud*, *Automatización*).
  - Formulario de alcance y requerimientos técnicos.
  - Guardado simultáneo en tablas `quotes` y `projects` de Supabase.
  - Envío automático de notificaciones por correo electrónico a DASFusion (`proyectos@dasfusion.ec`) y correo de confirmación al usuario.
  - Redirección y apertura automática de chat en WhatsApp con el mensaje estructurado para el arquitecto de software.
- **Configuración de Cuenta & Perfil:** Actualización de datos personales, avatar, correo y cambio de credenciales de acceso.

### 🔐 3. Autenticación & Seguridad
- Autenticación robusta con **Supabase Auth** (Correo/Contraseña y Google OAuth).
- Rutas protegidas mediante `auth.guard.ts` de Angular.
- Políticas de seguridad a nivel de filas (**Row Level Security - RLS**) en PostgreSQL para aislar los datos privados de cada cliente.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
| :--- | :--- |
| **Framework Frontend** | [Angular 21](https://angular.dev/) (Standalone Components, Signals, Native Control Flow `@if`/`@for`) |
| **Renderizado** | Angular SSR / Prerendering híbrido |
| **Estilos & Diseño** | [TailwindCSS v4](https://tailwindcss.com/) + Tokens de Diseño CSS nativos (paleta basada en OKLCH) |
| **Backend & Base de Datos** | [Supabase](https://supabase.com/) (PostgreSQL, Auth, Realtime, Storage, Edge Functions) |
| **Tipado & Lenguaje** | TypeScript 5.x con validación estricta |
| **Formularios** | Angular Reactive Forms con validaciones asíncronas y tipadas |

---

## 📂 Estructura del Proyecto

```text
dasfusion-hub/
├── public/                     # Recursos estáticos públicos (logos, imágenes, favicon)
├── supabase/
│   ├── functions/              # Edge Functions en Deno (ej. send-quote-email)
│   └── migrations/             # Scripts SQL de esquema y RLS (ej. create_quotes_table.sql)
├── src/
│   ├── app/
│   │   ├── core/               # Núcleo: Servicios globales, guards, interceptores y modelos
│   │   │   ├── guards/         # AuthGuard para rutas del portal
│   │   │   ├── models/         # Interfaces TypeScript y tipos de base de datos
│   │   │   └── services/       # AuthService, SupabaseService, ClientProjectService, QuoteService
│   │   ├── features/           # Módulos de funcionalidad pública y autenticación
│   │   │   ├── auth/           # Login, Registro (Signup), Callback OAuth
│   │   │   └── landing/        # Componentes de la página principal (Hero, Showcase, Team, etc.)
│   │   ├── portal/             # Portal de Clientes
│   │   │   ├── components/     # Modales, tarjetas y componentes específicos del portal
│   │   │   ├── layout/         # Layout envolvente del portal
│   │   │   └── pages/          # Dashboard, Proyectos, Kanban, Estimador, Configuración
│   │   ├── shared/             # Componentes reutilizables (Navbar, Footer, Modales)
│   │   ├── app.config.ts       # Configuración global de Angular y proveedores
│   │   ├── app.routes.ts       # Definición de rutas y lazy loading
│   │   └── app.component.ts    # Componente raíz
│   ├── environments/           # Variables de entorno (Supabase URL, Anon Key)
│   ├── index.html              # HTML base con meta tags SEO y configuración mobile-first
│   ├── main.ts                 # Punto de entrada de la aplicación
│   └── styles.css              # Sistema de diseño CSS, directivas Tailwind v4 y temas
├── angular.json                # Configuración del workspace de Angular CLI
├── package.json                # Dependencias y scripts de ejecución
└── tsconfig.json               # Configuración de compilación TypeScript
```

---

## 🚀 Instalación y Puesta en Marcha

### Prerrequisitos
- **Node.js**: `v20.x` o superior
- **npm**: `v10.x` o superior
- **Angular CLI**: `v21.x` (`npm install -g @angular/cli`)

### 1. Clonar el Repositorio e Instalar Dependencias
```bash
git clone <url-del-repositorio>
cd dasfusion-hub
npm install
```

### 2. Configurar Variables de Entorno
Crea o edita el archivo `src/environments/environment.ts` con las credenciales de tu proyecto en Supabase:

```typescript
export const environment = {
  production: false,
  supabaseUrl: 'https://tu-proyecto.supabase.co',
  supabaseAnonKey: 'tu-supabase-anon-key'
};
```

### 3. Configurar la Base de Datos en Supabase
Ejecuta los scripts de migración ubicados en `supabase/migrations/` en el **SQL Editor** de tu panel de Supabase:
- `20260929_create_quotes_table.sql`: Crea la tabla `quotes`, índices y políticas RLS para lectura y creación segura de cotizaciones.

### 4. Iniciar el Servidor de Desarrollo
```bash
npm start
# o alternativamente:
ng serve
```
Abre tu navegador en `http://localhost:4200/`.

### 5. Compilar para Producción
```bash
npm run build
```
Los artefactos compilados y optimizados se generarán en la carpeta `dist/dasfusion-hub`.

---

## 📱 Contacto & Canales Oficiales

- **Sitio Web:** [dasfusion.ec](https://dasfusion.ec)
- **Correo Electrónico de Proyectos:** [proyectos@dasfusion.ec](mailto:proyectos@dasfusion.ec)
- **WhatsApp Oficial:** [+593 98 714 8786](https://wa.me/593987148786)
- **Ubicación:** Ecuador — Servicios de Ingeniería de Software Global

---
*Desarrollado con excelencia por el equipo de ingeniería de **DASFusion Technologies**.*
