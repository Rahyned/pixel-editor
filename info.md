Web project checklist;

# Checklist Pre-Lanzamiento Proyecto Web

> Documento base para validar que un proyecto web esté listo para producción. Adapta según el tipo de proyecto.

---

## ✅ Configuración Base

- [ ] **Dominio y DNS**: Dominio registrado, DNS configurado, propagación verificada
- [ ] **Hosting/Servidor**: Ambiente de producción listo y accesible
- [ ] **Variables de entorno**: Archivo `.env` configurado, secretos no commiteados en repo
- [ ] **Base de datos**: Migraciones aplicadas, backups configurados (si aplica)
- [ ] **Repositorio Git**: `.gitignore` actualizado, rama `main`/`master` protegida

---

## 🔍 Indexación y SEO Técnico

- [ ] **`robots.txt`**: Actualizado, `Disallow: /` removido en producción
- [ ] **`sitemap.xml`**: Generado dinámicamente o estático, registrado en Google Search Console
- [ ] **Metadatos básicos**: Cada página con `<title>` único y `<meta description>` (50-160 caracteres)
- [ ] **URL canónicas**: Etiqueta `rel="canonical"` configurada para evitar contenido duplicado
- [ ] **Open Graph (OG)**: `og:title`, `og:description`, `og:image`, `og:url` en páginas principales
- [ ] **Twitter Cards**: `twitter:card`, `twitter:image` para compartir en redes
- [ ] **Structured Data**: Schema.org marcado (JSON-LD) si aplica (empresa, producto, evento, etc.)
- [ ] **Headings jerárquicos**: H1 único por página, estructura H2 > H3 coherente
- [ ] **Palabras clave**: Investigadas y presentes naturalmente en contenido y metadatos

---

## ⚡ Rendimiento y Optimización

- [ ] **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1 (verificar en Lighthouse o PageSpeed)
- [ ] **Imágenes**: Formato moderno (WebP/AVIF con fallback), atributos `width` y `height` explícitos
- [ ] **Lazy Loading**: Imágenes e `iframes` bajo la línea de flotación con atributo `loading="lazy"`
- [ ] **Minificación**: HTML, CSS y JavaScript minificado en producción
- [ ] **Bundling**: Archivos separados correctamente (no un mega-archivo), tree-shaking habilitado
- [ ] **Compresión Gzip/Brotli**: Encabezados configurados en servidor
- [ ] **Cache Control**: Headers `Cache-Control` para assets estáticos (imágenes, CSS, JS)
- [ ] **Eliminación de código muerto**: CSS no utilizado removido o purgado (Tailwind, etc.)
- [ ] **Scripts de terceros**: Async o defer, no bloquean renderizado
- [ ] **Tipografías**: Locales o web fonts optimizadas, `font-display: swap`

---

## 🔒 Seguridad y Legalidad

- [ ] **SSL/HTTPS**: Certificado válido, redirect automático `http://` → `https://`
- [ ] **Security Headers**: 
  - [ ] `Content-Security-Policy`
  - [ ] `X-Content-Type-Options: nosniff`
  - [ ] `X-Frame-Options: SAMEORIGIN`
  - [ ] `Referrer-Policy`
- [ ] **CORS**: Configurado correctamente si hay APIs externas
- [ ] **Validación de inputs**: Sanitización en frontend y backend
- [ ] **Inyección SQL/XSS**: Prevención activa si hay formularios o contenido dinámico
- [ ] **Dependencias seguras**: Sin vulnerabilidades críticas (`npm audit`, `pip check`)
- [ ] **Página 404**: Personalizada, útil, con enlace a inicio o búsqueda
- [ ] **Página 500**: Página de error genérica para fallos del servidor
- [ ] **Banner de cookies**: Gestor de consentimiento visible (si aplica GDPR/CCPA)
- [ ] **Política de Privacidad**: Visible, accesible desde footer
- [ ] **Términos y Condiciones**: Visibles si hay transacciones, suscripciones o UGC

---

## ♿ Accesibilidad (A11y)

- [ ] **Color y contraste**: WCAG AA mínimo (4.5:1 texto normal, 3:1 texto grande)
- [ ] **Etiquetas semánticas**: `<nav>`, `<main>`, `<article>`, `<button>` en lugar de divs genéricos
- [ ] **Atributos `alt`**: Todas las imágenes con descripción útil (no "imagen" o vacío)
- [ ] **ARIA labels**: Elementos interactivos sin texto visible (`aria-label`, `aria-description`)
- [ ] **Navegación por teclado**: Todos los elementos interactivos accesibles con Tab/Enter
- [ ] **Focus visible**: Estilos de `:focus` claros y visibles
- [ ] **Orden lógico**: Flujo de Tab respeta el orden visual
- [ ] **Formularios**: Labels asociados (`<label for="id">`), campos requeridos marcados
- [ ] **Tablas**: Header semántico (`<thead>`, `<th>`), caption si es necesario
- [ ] **Prueba con lector de pantalla**: NVDA, JAWS o built-in (VO en Mac/iOS)

---

## 📱 Experiencia de Usuario (UX) y Responsividad

- [ ] **Diseño responsivo**: Probado en móvil (375px), tablet (768px), desktop (1920px+)
- [ ] **Mobile-first**: CSS estructurado mobile-first, no solo media queries de reducción
- [ ] **Viewport**: Meta tag `<meta name="viewport" content="width=device-width, initial-scale=1">`
- [ ] **Favicon**: Archivo `.ico` (16x16, 32x32) + `apple-touch-icon.png` (180x180)
- [ ] **PWA icons**: Iconos para pantalla de inicio (si aplica Progressive Web App)
- [ ] **Orientación**: Funciona correctamente en landscape y portrait (móviles)
- [ ] **Touch targets**: Botones y enlaces ≥ 44x44px (mínimo táctil)
- [ ] **Enlaces rotos**: Verificación de enlaces internos y externos (herramienta: broken-link-checker)
- [ ] **Formularios**: Autofill accesible, validación clara, mensajes de error útiles
- [ ] **Checkout/Transacciones**: Flujo probado end-to-end con datos de prueba
- [ ] **Integraciones email**: Correos transaccionales probados (confirmación, recuperación, etc.)
- [ ] **Redirecciones**: 301 configuradas para URLs antiguas si hubo migración

---

## 📊 Medición y Analítica

- [ ] **Google Analytics**: Tag instalada, ID de propiedad correcto, probada en dev y prod
- [ ] **Eventos clave**: Conversiones, CTAs, descarga de recursos rastreadas
- [ ] **Facebook Pixel**: Instalado si hay campaña de ads (conversiones)
- [ ] **Search Console**: Sitio registrado, sitemap enviado, errores rastreados
- [ ] **Google My Business**: Verificado si es negocio local
- [ ] **Testing de pixels**: Verificar con Tag Assistant o similar en navegador

---

## 🧪 Testing y Validación

- [ ] **Validación HTML**: Sin errores en W3C Validator
- [ ] **Validación CSS**: Sin errores críticos
- [ ] **Lighthouse**: Score ≥ 90 en Performance, Accessibility, Best Practices, SEO
- [ ] **Pruebas en navegadores**: Chrome, Firefox, Safari, Edge (últimas 2 versiones)
- [ ] **Dispositivos reales**: Probado en iPhone, Android (no solo DevTools)
- [ ] **Console limpia**: Sin errores ni warnings no intencionales
- [ ] **Network tab**: Recursos se cargan sin errores 404/500
- [ ] **Cross-browser forms**: Formularios funcionales en todos los navegadores
- [ ] **Velocidad de carga**: Test en conexión lenta (3G) con DevTools throttling
- [ ] **Unit/Integration tests**: Si aplica (especialmente en apps/dashboards)

---

## 📚 Documentación y Mantenimiento

- [ ] **README**: Instrucciones de instalación, variables de entorno, cómo correr localmente
- [ ] **Documentación de API**: Endpoints documentados (Postman, Swagger/OpenAPI si aplica)
- [ ] **Comentarios en código**: Lógica compleja explicada, sin exceso
- [ ] **CHANGELOG**: Histórico de cambios si hay versiones
- [ ] **Contributing guide**: Si es proyecto open source
- [ ] **Process de deploy**: Documentado quién, cuándo, cómo se sube a producción
- [ ] **Rollback plan**: Proceso en caso de despliegue fallido
- [ ] **Monitoreo**: Uptime monitor configurado, alertas activas

---

## 🚀 Deployment y CI/CD

- [ ] **CI/CD pipeline**: Tests y build automáticos en cada push (GitHub Actions, GitLab, etc.)
- [ ] **Staging**: Ambiente de prueba antes de producción
- [ ] **Secrets management**: Variables sensibles en el gestor (no en `.env` commiteado)
- [ ] **Build reproducible**: Mismo código = mismo build (dependencias fijadas)
- [ ] **Versioning**: Tags de versión en Git para cada release
- [ ] **Zero-downtime deploy**: Si es crítico, strategy de blue-green o canary

---

## ✨ Extras Según Proyecto

### Si es E-commerce
- [ ] Métodos de pago probados (Stripe, PayPal, etc.)
- [ ] Carrito persistente (localStorage o sesión)
- [ ] Gestión de inventario
- [ ] Correos de confirmación y seguimiento

### Si es SaaS/App
- [ ] Login/signup funcional
- [ ] Recuperación de contraseña
- [ ] Email verification
- [ ] Roles y permisos testeados

### Si es Blog/Content
- [ ] RSS feed (si aplica)
- [ ] Paginación o lazy-load de posts
- [ ] Categorías/tags funcionando
- [ ] Search funcional

### Si es sitio estático
- [ ] Build local funciona sin errores
- [ ] Assets optimizados
- [ ] No quedan rutas de desarrollo

---

## 🎯 Antes de Lanzar (24h)

- [ ] Backup de base de datos configurado
- [ ] Monitoreo de errores activo (Sentry, LogRocket, etc.)
- [ ] Phone number de soporte accesible
- [ ] Status page o comunicación de mantenimiento lista
- [ ] Plan de escalado (si esperas tráfico)
- [ ] Última verificación en dispositivo real

---

**Última actualización**: Agosto 2026  
**Versión**: 1.0  
**Autor**: Lautaro (Desarrollo Web)