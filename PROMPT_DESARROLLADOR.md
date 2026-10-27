# Prompt para el desarrollador (Claude Code) — Rediseño visual del portal

> Referencia visual: `prototipo/index.html` (abrir en Chrome; sirve en escritorio y móvil).
> Todo lo que aparece ahí es **ficticio**. No copies datos del prototipo a producción: copia solo estructura, tokens y patrones.

---

## Contexto (revisado contra el código real)

Stack: Flask/Jinja (`base.html`), Bootstrap 5.3.3 + Bootstrap Icons 1.11.3, `static/css/app.css` (tokens `--ant-*`, tema oscuro con `data-bs-theme`), y JS propio ya existente: `menu_modulos.js`, `buscador.js`, `progreso.js`, Sortable, y el script de carga/esqueleto dentro de `base.html`. **No introduzcas React ni librerías nuevas**; extiende lo que existe y respeta el estilo y los comentarios en español del repo.

**Ya existe y se reutiliza (no reescribir):**
- Tokens: `--ant-dark #011e39`, `--ant-dark-2`, `--ant-accent #e85215`, `--ant-tinta` (texto marino que se invierte en oscuro), radios `--ant-r-s/m/l` (10/14/20), sombras `--ant-s1/s2/s3`, `--imp-azul #1b5b95`, `--ant-celeste-oscuro #4d9bd8`, escala `--ant-t-*`.
- Esqueleto de carga: `[data-esqueleto]` + `esqueleto-cargando`, con umbral de 250 ms y `aria-busy` (en `base.html`/`app.css`). Barra superior `#appLoader`.
- `progreso.js`: caja de progreso con `role="status"` para acciones lentas.
- `menu_modulos.js`: menú «Módulos» con buscador sin tildes, fijar (POST `/portal/fijar`, CSRF) y lista con scroll interno.
- `buscador.js`: autocompletado de clientes/proveedores y ficha 360.
- Portal: `.portal-card`, `.module-icon` (fondo de color por módulo vía `MODULE_META` + capa de brillo), `.portal-acciones` (4 botones), `.portal-hero` (degradado marino), `.portal-grid` (flex centrado, 3/4/5 columnas), Sortable para mover.
- Panel de Ventas: `.ventas-lateral #sidebar` con `<details>` en parte, `.nav-section`, ~20 pantallas.
- `prefers-reduced-motion` en varios bloques; `env(safe-area-inset-*)` en la topbar; `tabular-nums` en varias clases de ventas/importaciones.

El objetivo es una interfaz **más limpia, liviana y compacta**, sin cambiar permisos, rutas, datos ni reglas de negocio. El prototipo ya usa los mismos nombres/valores de tokens que `app.css`; copia estructura y proporciones, no el CSS tal cual.

## Alcance y orden de trabajo

Trabaja **un cambio a la vez**, corre las verificaciones del proyecto (tests, lint, humo de las pantallas afectadas) después de cada uno y haz un commit por cambio. Mantén modo claro y oscuro funcionando.

### 1. Tokens y superficies (`app.css`)
- **No crear tokens nuevos si ya existen**: usa `--ant-tinta`, `--imp-azul` (icono azul; en oscuro `--ant-celeste-oscuro`), `--ant-accent` (solo acción primaria), radios `--ant-r-s/m`, sombras `--ant-s1` (reposo) y `--ant-s2` (hover; hoy el hover usa `--ant-s3` + `translateY(-3px)`, demasiado). Solo agregar `--ant-linea` (borde de 1 px) y `--ant-fondo-pagina` si faltan.
- Revisar el «cielo» (manchas de color de `.app-body::before`) y el vidrio `backdrop-filter`: bajar saturación/opacidad en pantallas de datos (tablas, ventas) donde restan contraste.
- Bajar contraste agresivo: bordes de 1px `--ant-line` en vez de sombras pesadas; fondo de página `--ant-bg` plano (sin degradados); texto secundario con `--ant-muted`. Verifica contraste AA (4.5:1 texto, 3:1 iconos/bordes de controles).
- Mantén `.skip-link`, `:focus-visible` visible y `viewport-fit=cover` + `env(safe-area-inset-*)` en el layout base.

### 2. Cabecera
- La `.app-topbar` hoy es vidrio marino oscuro de 56 px con texto blanco. Pasarla a **clara de 52px** (marca a la izquierda; búsqueda/atajo, Portal, Clientes, notificaciones y usuario a la derecha). Etiquetas de texto solo ≥ 860px; en móvil solo iconos (objetivos táctiles ≥ 44px).
- Quitar `.portal-hero` (degradado marino): pasar a una línea compacta (saludo + pista del atajo `Ctrl/⌘ K`).

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
- **Tarjeta nueva**: `.module-icon` sin cuadro de fondo (quitar `background-color` inline de `MODULE_META` y la capa de brillo en el portal); el **icono mismo es azul (`--imp-azul`) a 2.5rem** (hoy 1.35–1.6rem dentro de 46–54 px). Altura mínima ~104px (hoy `padding: 2.85rem …` ≈ 140px), ancho `minmax(148px,1fr)`, gap 10px, nombre 13px/600. Mantener el `<a class="portal-enlace stretched-link">` y el `data-buscar` del filtro. El campo de color por módulo en `MODULE_META` puede quedar sin uso (no borrarlo si otras pantallas lo usan, como `.module-icon-sm`).
- La pastilla `.portal-nivel` («Admin») pasa a un icono `bi-shield-lock` pequeño arriba a la izquierda con `title`/`aria-label="Solo administradores"`; «Fijado» usa `bi-pin-angle-fill` naranja en la misma posición.
- El menú `⋯` (`.portal-mas`): hoy abre una capa que **tapa la tarjeta** con 4 botones (fijar, mover, ayuda, ✕). Cambiar a `dropdown-menu` de Bootstrap con **Fijar primero**, **Qué hace** y (si se aprueba) **Ocultar**; se elimina el botón ✕. El botón sigue de 44×44, visible en hover/foco y **siempre visible en táctil** (`@media (hover:none)`). «Mover» (Sortable, `.drag-handle`) se conserva pero se activa desde «Personalizar», que ya existe, para no perder el reordenamiento ni el soporte de teclado.
- «Ocultar» **no existe hoy** (requiere endpoint nuevo, p. ej. `POST /portal/ocultar` con CSRF y persistencia por usuario). Si no se aprueba, omitirlo.
- Toda la tarjeta es clicable (`::after` sobre el enlace), sin romper el menú `⋯` (`z-index`).

#### Diseño bento dentro de cada grupo
Cada grupo es una cuadrícula **bento de 4 columnas** (`grid-template-columns:repeat(4,minmax(0,1fr)); grid-auto-rows:104px; grid-auto-flow:dense; gap:10px`), sin huecos:
- **Pieza grande 2×2** (`.hero`): el módulo fijado o, si no hay, el primero del grupo. Icono 4rem, nombre, descripción corta y un dato (ej. «N pendientes»; usar un conteo que el backend ya tenga, **no inventar métricas**; si no hay, se omite).
- **Pieza ancha 2×1** (`.ancho`): el segundo módulo; icono 2.5rem a la izquierda, nombre y dato a la derecha. Con 4+ módulos, los dos siguientes son 1×1 y el bloque de 2 filas queda exacto.
- Módulos que sobran: filas de 4 piezas 1×1; **la última se estira** (`.llena`, `span` = 4 − resto + 1) para no dejar hueco.
- Grupos de 1–2 módulos: piezas anchas 2×1 en una sola fila (compactas). Grupo de 3: una grande y dos anchas apiladas.
- Con texto en el buscador de módulos: todo vuelve a 1×1 (sin bento) para que los resultados no se muevan.
- ≤860 px: 2 columnas; la grande y la ancha ocupan el ancho completo en horizontal (icono a la izquierda), sin descripción.
- Como la pieza grande es el fijado, **fijar** pasa a ser el modo de «destacar»: reutiliza `/portal/fijar` y `menu_modulos.js`. La función `formaBento(i, n)` del prototipo es la lógica de referencia (sirve igual en Jinja).
- El orden dentro del grupo sigue siendo el que cada persona definió con Sortable; el arrastre solo reordena dentro del grupo.

**Error a evitar (visto en la prueba):** `.dropdown` de Bootstrap trae `position:relative`; dentro de la tarjeta convierte al botón `⋯` (absoluto) en hijo de ese contenedor y queda **centrado sobre el icono**. Solución: `.portal-card > .dropdown { position: static }` (o poner el botón directamente como hijo de la tarjeta con `top:0; right:0`) para que quede en la esquina superior derecha, 44×44, por encima del enlace estirado (`z-index` mayor que el `::after` del enlace).

### 5. Menús largos y con scroll horizontal
- **Barra de pestañas** (ej. Panel de Ventas): máximo 3–4 visibles + desplegable **«Más»**. Sin `overflow-x:auto` en ningún menú.
- **Menú lateral** (`.ventas-lateral #sidebar`, 20+ ítems; ya usa `<details>` en algunas secciones): agrupar **todas** las pantallas en secciones colapsables (Vista, Seguimiento, Análisis, Control, Administración) y dejar abierta solo la sección de la pantalla actual más la primera; recordar abierto/cerrado por usuario. Hoy el sidebar es marino oscuro con textos `--ant-lat-*`: pasarlo a superficie clara (mismo criterio que la cabecera) o, si se mantiene oscuro, subir contraste del texto apagado `--ant-lat-apagado`/`--ant-lat-seccion` (AA).
- Los menús con scroll horizontal observados (barra de pestañas y filtros de Ventas/CRM): reemplazar por «Más» y filas que envuelven. Ítems de 36px, icono azul, activo con `aria-current="page"` y fondo tenue. En móvil el lateral pasa arriba como bloque colapsable.
- Agregar **migas de pan** (Portal › Área › Pantalla).
- Filtros de pantalla en **una sola fila** responsiva (`auto-fit minmax(150px,1fr)`), selects de 38px.

### 6. Tablas
- Encabezado sticky de 11px en mayúsculas `--ant-muted`; filas de 10px de padding, separador de 1px; columnas numéricas alineadas a la derecha con `tabular-nums`; estados como píldoras de color suave (texto + fondo al 14%), nunca solo color.
- Tablas anchas: contenedor con scroll **vertical**; prioriza ocultar columnas secundarias en pantallas pequeñas antes que scroll horizontal.

### 7. Los 20 detalles de UX (según el código real)

Estado: **Existe** = ya está en el repo; **Hacer** = implementar; **Parcial**; **Omitir**.

| # | Detalle | Estado y decisión |
|---|---|---|
| 1 | Skeleton loaders | **Existe** (`[data-esqueleto]`, umbral 250 ms, `aria-busy`). Solo verificar que cubra tablas de Clientes, Ventas y la ficha 360, y que respete `prefers-reduced-motion` (la animación `esqueleto-rellenar` debe quedar estática). No crear otro componente. |
| 2 | Optimistic updates | **Hacer, acotado.** `menu_modulos.js` hoy deshabilita el botón y espera al servidor antes de mover el módulo: pasar a actualizar al instante y revertir con aviso si `/portal/fijar` falla. Igual para checks de tareas y renombres. Nunca pagos, conciliación, aprobaciones ni nada financiero. |
| 3 | Command menu | **Hacer.** `Ctrl/⌘ K`, `<dialog>`, combobox accesible. Reutilizar la lógica de `sinTildes` y la lista de módulos permitidos de `menu_modulos.js`/`#gridModulos` (ya filtrada por permisos). Hoy no existe ningún atajo global (los `ctrlKey/metaKey` del código son solo para no interceptar clics). |
| 4 | Shortcut hints | **Hacer** junto al #3: `<kbd>` con ⌘ en Mac y Ctrl en el resto; los atajos no se disparan en `input/textarea/select/contenteditable`. |
| 5 | Undo toasts | **Hacer** para acciones reversibles (fijar/soltar, ocultar, archivar). Un único contenedor `role="status"` (ya hay un patrón en `#ordenMsg` y en `progreso.js`: unificar). Sin diálogo de confirmación, 6–8 s con «Deshacer». Borrados reales: borrado lógico o petición diferida; acciones irreversibles/financieras conservan su confirmación. |
| 6 | Stale-while-revalidate | **Solo datos no críticos** (listas de módulos, catálogos, listados en solo lectura). **Excluir** saldos, deuda, stock, pagos y todo lo del ERP en la ficha 360 (`data-erp-zona`). Requiere TTL y cabeceras; coordinar con backend. |
| 7 | Prerendering | **Hacer con cuidado.** `speculationrules` con `eagerness:"moderate"`, mismo origen, excluyendo `/logout`, `/api/*`, descargas (`excel|exportar|descargar`, ya detectadas en el script de carga) y cualquier GET con efecto. Auditar antes que ningún GET modifique estado. Hoy no hay prefetch ni reglas. |
| 8 | BlurHash | **Omitir** (el portal casi no tiene imágenes subidas). |
| 9 | View transitions | **Hacer.** `document.startViewTransition` en filtros/chips y cambios de la misma página; `@view-transition{navigation:auto}` con cuidado: hoy hay un esqueleto y una barra `#appLoader` en navegación, deben coexistir (la transición no debe ocultar el esqueleto). <300 ms y anulado con reduced-motion. |
| 10 | Bottom sheets | **Omitir** (no hay). Si se crean en móvil, `offcanvas` de Bootstrap con botón de cerrar. |
| 11 | Animaciones interrumpibles | **Parcial.** Preferir `transition` sobre `@keyframes` en elementos interactivos; el widget «Sabio» usa keyframes infinitos (ya anulados con reduced-motion). No bloquear entrada durante animaciones. Sin librería de springs. |
| 12 | Predictive back | **Omitir** (no es app nativa). |
| 13 | Tamaño táctil | **Existe en parte** (`.portal-btn` es 44×44; `.portal-buscar` 44 px). Revisar íconos sueltos de tablas y menús `nav-link` (36–38 px) → 44 px en táctil. |
| 14 | Safe-area | **Parcial** (solo `.app-topbar`). Extender a toasts, widget «Sabio» (`position:fixed` abajo a la derecha), caja de progreso y `.mod-main`; `viewport-fit=cover` ya está en `base.html`. |
| 15 | One-time-code | **Verificar** el campo del código del Portal de Pagos/login: `autocomplete="one-time-code" inputmode="numeric"` en un único input; el SMS/correo debe terminar con `@dominio #123456` (backend/mensajería). No tocar la política de que el ejecutivo no puede ver el código. |
| 16 | Tabular numbers | **Parcial.** Existe en clases de ventas e importaciones; agregar utilidad global `.num{font-variant-numeric:tabular-nums}` y aplicarla a `table td/th` numéricos, KPI del portal y contadores. |
| 17 | Texto balanceado | **Hacer.** `text-wrap:balance` en `h1–h4`, `.portal-nombre`, títulos de KPI; `text-wrap:pretty` en párrafos. No existe hoy. |
| 18 | Esquinas continuas | **Hacer** como mejora progresiva: `corner-shape:squircle` junto a `border-radius` en `.card`, `.portal-card`, botones y `.vidrio`; solo Chromium lo dibuja. |
| 19 | Idempotency keys | **Hacer en acciones que crean registros o pagos** (UUID al iniciar, mismo `Idempotency-Key` en cada reintento, botón deshabilitado mientras corre). **Requiere backend** (tabla de claves + TTL). Nota: `/portal/fijar` ya es idempotente por diseño (envía el estado deseado, no un toggle): no necesita clave. |
| 20 | Safe triangle | **Omitir** (los menús abren por clic). |

Para lo marcado «requiere backend», entrega primero el front y deja `TODO` claro más una nota en el PR con lo faltante.

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
8. Entrega un resumen final con los 20 puntos marcados como **Hecho / Ya existía / Parcial / Omitido** (con motivo) y capturas antes/después de portal y una pantalla interna.

## Fuera de alcance
Cambios de backend de negocio, nuevas dependencias, migración a otro framework, rediseño del flujo del Portal de Pagos o del CRM (aplicar solo tokens, tabla y menús).
