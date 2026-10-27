# Prompt para el desarrollador (Claude Code) — Rediseño visual del portal

> Referencia visual: `prototipo/index.html` (abrir en Chrome; sirve en escritorio y móvil).
> Todo lo que aparece ahí es **ficticio**. No copies datos del prototipo a producción: copia solo estructura, tokens y patrones.

---

## Contexto

El portal (`/portal`) y las pantallas internas (ej. `/ventas/`) usan Bootstrap 5.3.3 + Bootstrap Icons 1.11.3 + `static/css/app.css` (variables `--ant-*`, tema oscuro con `data-bs-theme`). Las pantallas se renderizan en servidor; algunas navegan por parciales (`data-parcial`). **No introduzcas React ni librerías nuevas**: usa Bootstrap, CSS nativo y el JS que ya existe. Respeta el estilo de código del repo y los comentarios en español.

El objetivo es una interfaz **más limpia, liviana y compacta**, sin cambiar permisos, rutas, datos ni reglas de negocio.

## Alcance y orden de trabajo

Trabaja **un cambio a la vez**, corre las verificaciones del proyecto (tests, lint, humo de las pantallas afectadas) después de cada uno y haz un commit por cambio. Mantén modo claro y oscuro funcionando.

### 1. Tokens y superficies (`app.css`)
- Define/ajusta tokens: `--ant-navy`, `--ant-blue` (iconos y enlaces), `--ant-accent` (naranja, **solo** acción primaria), `--ant-bg`, `--ant-surface`, `--ant-line`, `--ant-muted`, radios `8/12px`, sombra suave `0 1px 2px` y sombra hover. Valores de referencia en `:root` del prototipo (y su variante oscura).
- Bajar contraste agresivo: bordes de 1px `--ant-line` en vez de sombras pesadas; fondo de página `--ant-bg` plano (sin degradados); texto secundario con `--ant-muted`. Verifica contraste AA (4.5:1 texto, 3:1 iconos/bordes de controles).
- Mantén `.skip-link`, `:focus-visible` visible y `viewport-fit=cover` + `env(safe-area-inset-*)` en el layout base.

### 2. Cabecera
- Reemplazar la barra azul oscuro por cabecera **clara de 52px** (marca a la izquierda; búsqueda/atajo, Portal, Clientes, notificaciones y usuario a la derecha). Etiquetas de texto solo ≥ 860px; en móvil solo iconos (objetivos táctiles ≥ 44px).
- Quitar el bloque oscuro grande «Hola, …»: pasar a una línea compacta (saludo + pista del atajo `Ctrl/⌘ K`).

### 3. Tarjetas de indicadores (KPI) del portal
- 6 tarjetas compactas en una fila (`grid auto-fit minmax(150px,1fr)`), padding 10×12px, punto de color de 8px junto al título **en lugar de la barra gruesa lateral y del icono**. Valor 1.5rem, `font-variant-numeric: tabular-nums`. Si el valor es 0, color `--ant-muted`. Cada una enlaza a su pantalla.

### 4. Módulos: agrupar por temática, icono azul sin fondo
- Reemplazar la grilla única por **secciones con encabezado** (`<section aria-labelledby>`, `<h2>` en mayúsculas pequeñas + contador) y una fila de **chips** para filtrar por grupo, además del filtro por texto existente (conservar normalización sin tildes).
- Agrupación propuesta (ajustar con negocio; el grupo debe venir de un campo `grupo` en el registro del módulo, no hardcodeado en la plantilla):
  - **Ventas**: Panel de Ventas, Pedidos de repuesto, Taller, Descuentos y Plazos, Control de Notas de Venta
  - **Cobranza y Finanzas**: Portal de Pagos, Solicitudes de Pago, Conciliación de Ingresos, Morosidad Empresarial, Protestos, Talonario Digital, Cumplimiento Forma de Pago, Importación de Facturas
  - **Bodega y Logística**: Bodega, Toma de Inventario, Mermas y Logística, Pedidos de mercadería, Maestro de Productos
  - **Abastecimiento**: Importaciones, Proveedores
  - **Clientes y Marketing**: Raphael Chat, Clientes (y futuros módulos de marketing)
  - **Gestión**: Tareas y Recordatorios, Cardinal OS
  - Un módulo sin grupo cae en «Otros». Se oculta el grupo que quede vacío por permisos/filtros.
- **Tarjeta nueva**: sin fondo azul detrás del icono; el **icono mismo es azul (`--ant-blue`) a 2.5rem** (antes ~1.6rem dentro de un cuadrado). Altura mínima ~104px, ancho `minmax(148px,1fr)`, gap 10px, padding 12×10px, nombre 13px/600, centrado. Eliminar el cuadro de color por módulo (`style="background-color:..."`).
- El badge «Admin» pasa a un icono `bi-shield-lock` pequeño arriba a la izquierda con `title`/`aria-label="Solo administradores"`; «Fijado» usa `bi-pin-angle-fill` naranja en la misma posición.
- El menú `⋯`: botón de 44×44 arriba a la derecha, visible en hover/foco y **siempre visible en pantallas táctiles** (`@media (hover:none)`). Contiene **Fijar primero**, **Qué hace**, **Ocultar** como `dropdown-menu` de Bootstrap (se elimina el botón «✕ cerrar» extra y la fila de 4 botones). «Mover» se mantiene con arrastre/flechas pero se accede desde «Personalizar», no desde cada tarjeta.
- Toda la tarjeta es clicable (`::after` sobre el enlace), sin romper el menú `⋯` (`z-index`).

### 5. Menús largos y con scroll horizontal
- **Barra de pestañas** (ej. Panel de Ventas): máximo 3–4 visibles + desplegable **«Más»**. Sin `overflow-x:auto` en ningún menú.
- **Menú lateral** (hoy 20+ ítems en una lista): agrupar en secciones colapsables con `<details>/<summary>` (Vista, Seguimiento, Análisis, Control, Administración); abiertas por defecto solo las 2 primeras; recordar estado abierto/cerrado por usuario. Ítems de 36px, icono azul, activo con `aria-current="page"` y fondo tenue. En móvil el lateral pasa arriba como bloque colapsable.
- Agregar **migas de pan** (Portal › Área › Pantalla).
- Filtros de pantalla en **una sola fila** responsiva (`auto-fit minmax(150px,1fr)`), selects de 38px.

### 6. Tablas
- Encabezado sticky de 11px en mayúsculas `--ant-muted`; filas de 10px de padding, separador de 1px; columnas numéricas alineadas a la derecha con `tabular-nums`; estados como píldoras de color suave (texto + fondo al 14%), nunca solo color.
- Tablas anchas: contenedor con scroll **vertical**; prioriza ocultar columnas secundarias en pantallas pequeñas antes que scroll horizontal.

### 7. Los 20 detalles de UX (aplicar solo lo que corresponde al stack)

El stack es server-rendered + Bootstrap, **sin React/Next/Android/iOS nativo**. Resultado de la revisión:

| # | Detalle | Decisión |
|---|---|---|
| 1 | Skeleton loaders | **Hacer.** Componente `.sk-b` con la misma estructura de columnas; visible solo si la carga pasa de 300 ms. Reemplaza/complementa `#appLoader` en tablas y KPI. |
| 2 | Optimistic updates | **Hacer, acotado**: fijar/ocultar módulo, checkboxes de tareas, renombres. Aplica al instante y revierte con aviso si falla el `fetch`. **Nunca** pagos, conciliación, aprobaciones ni nada financiero. (`useOptimistic` no aplica: no es React.) |
| 3 | Command menu | **Hacer.** `Ctrl/⌘ K`, `<dialog>`, combobox accesible (flechas/Enter/Esc), indexa módulos y pantallas según permisos del usuario. |
| 4 | Shortcut hints | **Hacer.** `<kbd>` con ⌘ en Mac y Ctrl en el resto; atajos no se disparan al escribir en `input/textarea/select/contenteditable`. |
| 5 | Undo toasts | **Hacer** para acciones reversibles (ocultar/fijar, archivar). Sin diálogo de confirmación, toast 6–8 s con «Deshacer», contenedor `role="status"`. Para borrados reales: borrado lógico en servidor o petición diferida. **No** para acciones irreversibles/financieras: esas conservan confirmación. |
| 6 | Stale-while-revalidate | **Solo en datos no críticos** (catálogos, listados de módulos, listas de clientes en solo lectura). **Excluir** saldos, deuda, stock, pagos, tasas. Requiere definir TTL y revalidar en `focus`/`online`; coordinar con backend. |
| 7 | Prerendering | **Hacer con cuidado.** `<script type="speculationrules">` con `eagerness:"moderate"` para enlaces del mismo origen, excluyendo `/logout`, `/api/*` y cualquier enlace que cambie datos (GET con efectos). Revisar primero si ya hay prefetch. Auditar que ningún GET modifique estado. |
| 8 | BlurHash | **Omitir por ahora**: el portal casi no tiene imágenes subidas. Reevaluar si aparecen fotos de producto (requiere backend). |
| 9 | View transitions | **Hacer.** `document.startViewTransition` para filtros/chips y cambios en la misma página; `@view-transition{navigation:auto}` entre páginas; `view-transition-name` solo donde un elemento viaja entre pantallas; <300 ms; respetar `prefers-reduced-motion`. |
| 10 | Swipe-to-dismiss sheets | **Omitir** (no hay bottom sheets). Si se crean en móvil, usar Offcanvas de Bootstrap con botón de cerrar. |
| 11 | Animaciones interrumpibles | **Parcial**: usar `transition` (no `@keyframes`) en elementos interactivos y nunca bloquear la entrada durante animaciones. Springs reales no aplican sin librería; no se agrega ninguna. Revisar la animación del widget «Sabio» (hoy keyframes infinitos) y respetar reduced-motion (ya lo hace). |
| 12 | Predictive back (Android) | **Omitir**: no es app nativa. |
| 13 | Hit slop / tamaño táctil | **Hacer** en web: todo control ≥ 44×44 px (menú `⋯`, botones de icono, filas de menú) sin solaparse. |
| 14 | Safe-area insets | **Verificar**: ya existe `viewport-fit=cover`; añadir `env(safe-area-inset-*)` a cabecera, toasts y barras fijas (incluido el widget «Sabio», que flota abajo a la derecha). |
| 15 | One-time-code | **Aplicar solo si hay código por SMS/correo en el login o el Portal de Pagos**: `autocomplete="one-time-code" inputmode="numeric"` en un único input; el SMS termina con `@dominio #123456`. Cambio de mensajería: coordinar con backend. |
| 16 | Tabular numbers | **Hacer.** `font-variant-numeric: tabular-nums` en KPI, montos, contadores y columnas numéricas (clase utilitaria `.num`). |
| 17 | Texto balanceado | **Hacer.** `text-wrap: balance` en `h1–h3`, títulos de tarjeta y de KPI; `text-wrap: pretty` en párrafos. |
| 18 | Esquinas continuas | **Hacer (mejora progresiva).** `corner-shape: squircle` junto al `border-radius` en tarjetas y botones; solo Chromium lo dibuja, el resto ignora. |
| 19 | Idempotency keys | **Hacer en flujos que crean registros o pagos**: UUID al iniciar la acción, enviado como `Idempotency-Key` en cada reintento; el servidor guarda la clave y devuelve el resultado original si se repite. Botón deshabilitado mientras corre. **Requiere backend** (tabla de claves + TTL). |
| 20 | Safe triangle | **Omitir**: no hay menús hover con submenús (los desplegables son por clic). Si se agregan, usar `safePolygon` de Floating UI. |

Para los puntos marcados «requiere backend», entrega primero el cambio de front y deja un `TODO` claro más una nota en el PR con lo que falta.

### 8. Accesibilidad y movimiento
- Toda animación o transición debe quedar anulada con `@media (prefers-reduced-motion: reduce)` (hay un bloque global en el prototipo).
- Foco visible, nombres accesibles en botones de icono, `aria-current`, `aria-busy` en tablas cargando, `role="status"` en toasts, contraste AA en claro y oscuro.
- Cada control táctil ≥ 44px.

## Criterios de aceptación
1. Ningún cambio altera permisos, rutas, consultas ni cálculos; se mantienen los tests existentes y los datos reales no se tocan.
2. `/portal` muestra módulos agrupados con icono azul sin fondo, tarjetas ~148×104px, KPI compactos y cabecera clara; a 390px de ancho no hay scroll horizontal de página.
3. Ningún menú tiene scroll horizontal; los menús largos usan «Más» o secciones colapsables.
4. `Ctrl/⌘ K` abre el command menu y navega solo con teclado.
5. Ocultar/fijar un módulo es inmediato, con «Deshacer» de 6–8 s.
6. Tablas con números tabulares y skeleton (solo si la carga >300 ms).
7. Modo oscuro y `prefers-reduced-motion` verificados.
8. Entrega un resumen final con los 20 puntos marcados como **Hecho / Ya existía / Omitido** (con motivo) y capturas antes/después de portal y una pantalla interna.

## Fuera de alcance
Cambios de backend de negocio, nuevas dependencias, migración a otro framework, rediseño del flujo del Portal de Pagos o del CRM (aplicar solo tokens, tabla y menús).
