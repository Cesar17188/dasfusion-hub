# 🤖 AGENTS.md — Directrices de Desarrollo para Agentes de IA en DASFusion Hub

Este documento define las reglas de arquitectura, estándares de código, patrones de diseño y restricciones que todos los agentes de inteligencia artificial y desarrolladores deben seguir rigurosamente al mantener, extender o refactorizar el código base de **DASFusion Hub**.

---

## 🏛️ 1. Arquitectura General y Filosofía de Diseño

- **Mobile-First por Defecto:** Todas las vistas, formularios, barras de navegación y componentes modales deben diseñarse y probarse comenzando por resoluciones móviles (`< 640px`) y escalando progresivamente hacia escritorio (`sm`, `md`, `lg`, `xl`).
- **Alineación con Sistema de Tokens:** Usar los tokens de diseño definidos en `src/styles.css` (`--color-surface`, `--color-surface-container`, `--color-primary`, `--color-on-surface`, `--color-outline-variant`, etc.). Evitar colores hexadecimales quemados directamente en el HTML sin coherencia.
- **Rendimiento y SSR:** La aplicación utiliza Angular con Server-Side Rendering (SSR). Asegurar que el acceso a APIs del navegador (`window`, `localStorage`, `navigator`) siempre esté protegido mediante verificaciones como `typeof window !== 'undefined'` o `isPlatformBrowser`.

---

## 🅰️ 2. Estándares de Angular (v21+)

### 🧩 Componentes y Módulos
- **Standalone Components:** Todos los componentes, directivas y pipes deben ser componentes independientes (*standalone*).
- **Inyección de Dependencias:** Usar la función moderna `inject()` en lugar de la inyección por constructor.
- **Detección de Cambios:** Preferir `ChangeDetectionStrategy.OnPush` en componentes que manejan estado puramente reactivo mediante Signals.
- **Flujo de Control Nativo:** Usar exclusivamente la sintaxis moderna de control de flujo de Angular (`@if`, `@else if`, `@else`, `@for (item of list; track item.id)`, `@switch`). **Prohibido** utilizar directivas obsoletas como `*ngIf`, `*ngFor` o `*ngSwitch`.
- **Formularios Reactivos:** Utilizar `ReactiveFormsModule` con validaciones tipadas (`Validators.required`, `Validators.minLength`, etc.).

### ⚡ Gestión de Estado con Signals
- **Reactividad Fina:** Utilizar `signal()`, `computed()` y `effect()` para el manejo de estado local y global.
- **Inmutabilidad:** No mutar directamente las señales; utilizar `.set(nuevoValor)` o `.update(val => ...)` para transformaciones de estado predecibles.
- **Suscripciones Seguras:** Limpiar o desacoplar canales en tiempo real (`RealtimeChannel`) y evitar suscripciones manuales no gestionadas a Observables.

---

## 🎨 3. Estilos, TailwindCSS v4 y Experiencia de Usuario (UX)

- **TailwindCSS v4:** Este proyecto utiliza la versión 4 de Tailwind. Usar clases compuestas modernas (ej. `bg-linear-to-r`, `shrink-0`, `backdrop-blur-md`).
- **Inputs & Formularios Móviles:** Para evitar el zoom automático no deseado en dispositivos iOS / Safari móvil, los inputs de texto deben tener un tamaño de fuente mínimo de `16px` (`text-base`) o estar estilizados con la clase global `.das-input`.
- **Accesibilidad (a11y):**
  - Todos los botones interactivos e hipervínculos deben tener etiquetas legibles o atributos `aria-label`.
  - Contrastes de color acordes a los lineamientos WCAG AA.
  - Indicadores visuales de foco (`focus:ring-2`, `focus:outline-hidden`).
- **Scroll Suave y Márgenes de Anclaje:** Mantener configurado `scroll-margin-top: 5rem` en las secciones de la página con identificador para evitar que la barra de navegación fija cubra los encabezados al hacer clic en enlaces de navegación.

---

## 🗄️ 4. Base de Datos & Supabase

### 📋 Modelado y Tipado
- Cualquier nueva tabla o modificación de columnas en Supabase debe reflejarse inmediatamente en:
  1. `src/app/core/models/database.types.ts`
  2. Scripts de migración en `supabase/migrations/` (con sintaxis SQL estándar de PostgreSQL).
  3. Métodos tipados en `src/app/core/services/supabase.service.ts`.

### 🛡️ Seguridad y Row Level Security (RLS)
- **RLS Obligatorio:** Ninguna tabla debe exponerse sin Row Level Security habilitado.
- Las políticas de lectura (`SELECT`) deben restringirse al propietario del registro (`auth.uid() = user_id`) o al correo autenticado, excepto para catálogos públicos.
- Las políticas de inserción (`INSERT`) para cotizaciones y leads deben permitir usuarios autenticados y anónimos verificando la integridad de datos.

### 🔔 Notificaciones y Mensajería
- Las cotizaciones y solicitudes críticas deben integrarse con:
  - Base de datos (`projects` y `quotes`).
  - WhatsApp oficial de DASFusion (`+593 98 714 8786`).
  - Correo electrónico de soporte de ingeniería (`proyectos@dasfusion.ec`).

---

## 🛠️ 5. Flujo de Trabajo y Buenas Prácticas de Código

1. **Compilación Limpia:** Antes de dar por finalizada una tarea, verificar que `npm run build` o `ng build` se ejecute con código de salida 0 y sin errores de TypeScript.
2. **Preservación de Lógica Previa:** No eliminar funcionalidades existentes ni comentarios explicativos a menos que el usuario lo solicite de manera explícita.
3. **Manejo de Errores Descriptivo:** Presentar mensajes claros y amigables al usuario final cuando ocurran fallas de red o autenticación, evitando exponer stacktraces en bruto en la interfaz.

---
*Directrices vigentes para el desarrollo y mantenimiento continuo de DASFusion Hub.*
