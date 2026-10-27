# Prompt para el agente de Claude de Carlos — Rediseño visual y de UX de Raphael OS

> Pega este documento completo como primer mensaje del agente. Junto con él se entregan los archivos de referencia de `prototipo/` (ver §1).

## 0. Rol y reglas de trabajo

Eres el desarrollador de la plataforma Administración Antumalal (Raphael OS). Vas a **rediseñar la capa visual y de interacción** de las pantallas indicadas, **sin cambiar permisos, rutas, consultas, cálculos ni reglas de negocio**.

Reglas:
1. **Un cambio a la vez.** Un commit por cambio, con mensaje claro. Después de cada cambio corre las verificaciones del proyecto (tests, lint, humo de las pantallas afectadas) y mira la pantalla en el navegador (escritorio y 390 px). No sigas si algo quedó rojo.
2. **Reutiliza lo que ya existe** antes de crear algo: tokens `--ant-*` de `app.css`, `menu_modulos.js`, `buscador.js`, `progreso.js`, el esqueleto `[data-esqueleto]`, Sortable, `esc()`. **No agregues librerías** (ni React): Bootstrap 5.3.3, CSS nativo y el JS actual. Respeta el estilo y los comentarios en español del repo.
3. **No pegues datos reales en nada que no sea producción.** Los prototipos tienen datos ficticios; copia estructura, proporciones y reglas, no cifras.
4. **Toda animación respeta `prefers-reduced-motion`.**
5. Si una decisión depende del negocio (permisos, qué módulo va en qué grupo, métricas), **pregunta o deja un `TODO` visible**, no inventes.
6. Lo que requiera backend (endpoints, tablas) se entrega primero en el front con un `TODO` claro, y se reporta al final en una lista aparte.
7. Al terminar: reporte final con los 20 puntos de §8 (Hecho / Ya existía / Parcial / Omitido y por qué), capturas antes/después, y la lista de pendientes de backend.

## 1. Archivos de referencia (abrir en Chrome con doble clic; necesitan internet para Bootstrap)

| Archivo | Qué muestra |
|---|---|
| `prototipo/index.html` | Portal completo: cabecera, buscador de cliente, 6 indicadores, módulos agrupados en bento, Personalizar, menú Módulos, ⌘/Ctrl K, avisos con Deshacer, ficha 360, además Panel de Ventas, Clientes y Portal de Pagos en versión resumida |
| `prototipo/vistas/panel-ventas.html` | Panel de Ventas completo, con gráficos |
| `prototipo/vistas/cardinal-cartera.html` | Cardinal OS · Cartera |
| `prototipo/vistas/cardinal-gerencia.html` | Cardinal OS · Gerencia |
| `prototipo/vistas/portal-pagos.html` | Portal de Pagos «no me llegó el código» |
| `prototipo/src/` + `build.py` | Fuente compartida de las vistas sueltas (`python3 prototipo/build.py`) |

En todas, menú de usuario → **Paleta** cambia entre 4 propuestas de color y **Tema** entre automático/claro/oscuro. Úsalo para revisar contrastes. El prototipo es la **referencia visual**; el CSS real debe escribirse sobre los tokens y componentes existentes del repo.

## 2. Contexto técnico (verificado contra `app.css`, `base.html` y los JS actuales)

- Flask/Jinja, Bootstrap 5.3.3 + Bootstrap Icons 1.11.3, `static/css/app.css` (≈1650 líneas, tokens `--ant-*`, tema oscuro con `data-bs-theme`).
- Ya existen y se conservan: `--ant-dark #011e39`, `--ant-dark-2`, `--ant-accent #e85215`, `--ant-hover`, `--ant-tinta` (texto marino que se invierte en oscuro), radios `--ant-r-s/m/l` (10/14/20), sombras `--ant-s1/s2/s3`, `--imp-azul #1b5b95`, `--ant-celeste-oscuro #4d9bd8`, escala `--ant-t-*`, esqueleto de carga (`[data-esqueleto]`, umbral 250 ms, `aria-busy`), barra `#appLoader`, caja de progreso `role="status"`, menú «Módulos» con buscador y fijar (POST `/portal/fijar`, CSRF), Sortable para ordenar, `esc()` global, `skip-link`, `prefers-reduced-motion` en varios bloques, `env(safe-area-inset-*)` en la topbar, `tabular-nums` en varias clases.
- Estructura actual del portal: `.portal-hero` (degradado marino), `.card.module-card.portal-card`, `.module-icon` con `background-color` por módulo (`MODULE_META`) + capa de brillo, `.portal-acciones` (4 botones que tapan la tarjeta), `.portal-grid` (flex centrado 3/4/5 columnas), fondo «cielo» (`.app-body::before`, tres manchas de color) y vidrio con `backdrop-filter`.

## 3. Fase 1 — Fundamentos

1. **Tokens.** No crees tokens si ya existen. Agrega solo los que falten: `--ant-linea` (borde de 1 px, `#dfe6ee` / oscuro `#1f3550`), `--ant-fondo-pagina` (plano `#f2f5f9` / oscuro `#0a1626`), `--ant-apoyo` (texto secundario `#566a80` / oscuro `#93a6bc`), `--ant-alerta` (campana y avisos), y tonos de estado `--c-ok/--c-warn/--c-bad/--c-info/--c-neutro` con variante oscura. Todo color nuevo vive **en un solo bloque `:root` + `[data-bs-theme="dark"]`**, no repartido por plantillas.
2. **Fondo.** Hoy el «cielo» (manchas naranjas y azules) y el vidrio restan contraste y se ven pesados (en los PDF exportados aparecen como grandes manchas naranja/negras detrás de las tablas). Pasar a **fondo plano `--ant-fondo-pagina`**; vidrio solo, si se quiere, en la cabecera. Conservar la regla del repo de no usar `backdrop-filter` sin `@supports`.
3. **Superficies.** Tarjetas y paneles: fondo `--bs-body-bg` claro/oscuro, **borde de 1 px `--ant-linea`**, sombra `--ant-s1` en reposo y `--ant-s2` en hover. Quitar sombras pesadas. Hover de tarjeta: `translateY(-1px)` (hoy −3px con `--ant-s3`).
4. **Radios y esquinas.** Mantener `--ant-r-s/m`. Agregar `corner-shape: squircle` junto al `border-radius` en tarjetas y botones (mejora progresiva: solo Chromium la dibuja).
5. **Cabecera (`.app-topbar`).** Hoy: vidrio marino oscuro de 56 px con texto blanco. Pasar a **clara de 52 px** (`--bs-body-bg`, borde inferior `--ant-linea`, texto `--ant-tinta`), con la misma estructura: marca + «Administración Antumalal» (se oculta bajo 1240 px), «Raphael OS» centrado (≥1200 px), Guía, Portal, Clientes, menú Módulos, búsqueda ⌘/Ctrl K, notificaciones (insignia con `--ant-alerta`), menú de usuario. En móvil solo iconos, cada uno ≥44×44 px. Mantener `skip-link`, foco visible y safe-area.
6. **Tipografía y números.** `text-wrap: balance` en `h1–h4`, `.portal-nombre`, títulos de KPI y de tarjeta; `text-wrap: pretty` en párrafos. Utilidad global `.num{font-variant-numeric:tabular-nums}` aplicada a KPI, montos, contadores y toda columna numérica de tabla (hoy solo existe en algunas clases).
7. **Saludo.** Eliminar `.portal-hero` y dejar una línea: «Hola, {nombre} 👋» + subtítulo corto + pista `⌘/Ctrl K`.
8. **Asistente flotante (Sabio).** Hoy 96 px y su saludo tapa contenido. Pasar a 56 px, respetar `env(safe-area-inset-*)`, que el saludo se retire solo a los 7 s y esté oculto en móvil. Conservar su animación solo con `prefers-reduced-motion: no-preference`.

## 4. Fase 2 — Portal (`/portal`)

### 4.1 Indicadores (los 6 de hoy)
`.col-6.col-lg-3` + `border-start border-4 border-warning` + icono a la derecha → **tarjeta compacta**: padding 10×12 px, borde izquierdo de 3 px (`--c`), título de 12 px con icono pequeño a la derecha, valor 1.5 rem con `.num`. **El valor en cero se apaga** (`--ant-apoyo`, peso 600) para que destaque solo lo pendiente. Grilla `repeat(auto-fit, minmax(168px,1fr))` (los 6 caben en una fila en escritorio). Cada una sigue enlazando a su pantalla actual.

### 4.2 Buscar un cliente
Mantener `<form method="GET" action="/clientes/">` y el texto de ayuda. Compactar: padding 12×14, etiqueta en negrita con icono, `input-group` con botón primario (`--ant-accent`). Deshabilitar el botón mientras envía.

### 4.3 Módulos agrupados en bento (lo más importante)
**Modelo de datos.** Cada módulo recibe un campo `grupo` (en `MODULE_META` o donde viva hoy la lista; sin grupo → «Otros»). Propuesta inicial (validar con negocio, no hardcodear en la plantilla):
- **Ventas:** Panel de Ventas, Pedidos de repuesto, Taller, Descuentos y Plazos, Control de Notas de Venta
- **Cobranza y Finanzas:** Portal de Pagos, Solicitudes de Pago, Conciliación de Ingresos, Morosidad Empresarial, Protestos, Talonario Digital, Cumplimiento Forma de Pago, Importación de Facturas
- **Bodega y Logística:** Bodega, Toma de Inventario, Mermas y Logística, Pedidos de mercadería, Maestro de Productos
- **Abastecimiento:** Importaciones, Proveedores
- **Clientes y Marketing:** Raphael Chat, Clientes (y los futuros módulos de marketing)
- **Gestión:** Tareas y Recordatorios, Cardinal OS

El grupo vacío por permisos/filtros no se muestra. Orden de grupos y módulos: fijados primero y luego el orden personal del usuario **dentro del grupo**.

**Qué es el bento aquí.** Los módulos **no se agrandan**: siguen siendo tarjetas pequeñas y uniformes (108–130 px de ancho, 104 px de alto). El bento está en **cómo se acomodan los grupos**: cada grupo es un panel (`.panel.grupo`) con ancho proporcional a su cantidad de módulos, y los paneles grandes y chicos comparten filas.
- Contenedor: `display:grid; grid-template-columns:repeat(9,minmax(0,1fr)); grid-auto-flow:dense; gap:12px`. Cada pieza lleva `grid-column: span var(--s9)` y `order: var(--o9)`.
- **Grupo grande (3+ módulos):** `unidades = min(5, ceil(n/2))` → 3 módulos: 2, 5: 3, 8: 4. Dentro, `.tiles{grid-template-columns:repeat(auto-fill,minmax(108px,1fr));gap:8px}`.
- **Grupos chicos (1–2 módulos):** **una sola columna, lado a lado.** Se agrupan en un bloque `.cluster` (hasta 3 grupos por bloque, `display:grid; grid-template-columns:repeat(k,1fr); gap:12px`, ocupa `k` unidades); cada grupo muestra sus tarjetas apiladas (`.tiles{grid-template-columns:1fr}`) y su título puede ir en 2 líneas.
- **Reparto en filas (`empacar()`):** prueba las permutaciones de piezas (≤7) y elige el reparto con menos huecos, castigando además poner una pieza baja junto a una alta y alterar el orden original; lo que sobre en una fila se le suma a su pieza más ancha. Con los 23 módulos actuales: a 1360 px → [Ventas · Bodega · bloque de 3 chicos] y [Cobranza a todo el ancho]; a 1100 px → [Ventas · Bodega] [Cobranza · bloque de 3 chicos]. Más de 7 piezas: orden original. Se calcula en servidor (Jinja) o en JS al renderizar, porque los conteos cambian con permisos, filtros y «Ocultar». Se calculan `--s9`/`--o9` (9 unidades) y `--s6`/`--o6` (6 unidades, ≤1180 px, grupos grandes con máx. 3).
- **≤760 px:** una columna, orden original (`--o0`), tarjetas de 3 por fila.
- **Con filtro de texto o chip de área** el bento se mantiene pero solo con los grupos que tienen resultados.
- **Lista compacta** (opción actual de Personalizar): misma estructura, una fila por módulo, cada grupo ocupa 3 unidades.
- Encima del bento: **chips de área** (Todos + un chip por grupo, `aria-pressed`) y el buscador de módulos actual (misma normalización sin tildes).

### 4.4 Tarjeta de módulo
- **Quitar el cuadro de color detrás del icono**: el icono mismo es azul (`--imp-azul`; en oscuro `--ant-celeste-oscuro`) a **2.5 rem** (hoy ~1.35–1.6 rem dentro de 46–54 px). Se deja de usar el `background-color` inline de `MODULE_META` y la capa de brillo en el portal (el color por módulo puede quedar sin uso; no borrarlo si `.module-icon-sm` u otras pantallas lo usan).
- Alto mínimo 104 px (hoy el `padding-top: 2.85rem` la deja ≈140 px). Mantener `<a class="portal-enlace stretched-link">` y `data-buscar`. Nombre 12.5–13 px/600, `text-wrap: balance`.
- La pastilla `.portal-nivel` («Admin») pasa a un **icono `bi-shield-lock` pequeño** arriba a la izquierda con `title` y `aria-label="Solo administradores"`. Un módulo fijado muestra `bi-pin-angle-fill` en esa posición.
- **Menú `⋯` (`.portal-mas`)** arriba a la derecha, 44×44, visible en hover/foco y **siempre visible en táctil** (`@media (hover:none)`). Hoy abre una capa que **tapa la tarjeta** con 4 botones (fijar, mover, ayuda, ✕). Reemplazar por un `dropdown-menu` de Bootstrap con: **Fijar primero / Quitar fijado**, **Mover antes**, **Mover después**, **Qué hace** (popover/diálogo con la descripción actual) y **Ocultar**. Se elimina el botón ✕. El arrastre con Sortable puede mantenerse en el panel (accesible desde «Personalizar»).
- **Error que ya ocurrió en la prueba:** `.dropdown` de Bootstrap trae `position:relative`, y dentro de la tarjeta deja al `⋯` (absoluto) **centrado sobre el icono**. Solución: `.portal-card > .dropdown{position:static}` (o el botón como hijo directo con `top:0;right:0`), con `z-index` mayor que el `::after` del enlace estirado.
- «Ocultar» **no existe hoy**: requiere endpoint nuevo (p. ej. `POST /portal/ocultar` con CSRF y persistencia por usuario). Si no se aprueba, omitirlo del menú.

### 4.5 Acciones inmediatas y Deshacer
Fijar, soltar, mover y ocultar se **aplican al instante** (hoy `menu_modulos.js` deshabilita el botón y espera a `/portal/fijar`): actualiza la pantalla, envía la petición y, si falla, **revierte con un aviso**. Muestra un aviso con **«Deshacer» de 6–8 s** (contenedor único `role="status"`; unificar con `#ordenMsg` y la caja de `progreso.js`). Sin diálogo de confirmación. `/portal/fijar` ya es idempotente (envía el estado deseado, no un toggle): no necesita `Idempotency-Key`. El menú «Módulos» de la barra usa el mismo código y lista **Fijados** y luego los **grupos**.

### 4.6 Personalizar
Se mantiene tal cual (vista Tarjetas / Lista compacta, «Al iniciar sesión llévame a», Guardar, **Restablecer mi vista**); el cambio de vista se aplica al momento. «Restablecer» deja Deshacer de 8 s (guardar una instantánea antes). Botón de 44 px de alto.

## 5. Fase 3 — Menús y navegación (sin scroll lateral en ningún menú)

- **Pestañas largas → pestañas + «Más».** Máximo 5–6 visibles y el resto en un `dropdown` «Más» (`flex-wrap`, nunca `overflow-x:auto`). Aplica a: CRM/Raphael Chat (12 pestañas → Conversaciones, Contactos, Casos, Negocios, **Clientes**, + «Más»: Citas, Llamadas, Formularios, Bots, Seguimiento, Configuración; «Volver al inicio» a la derecha) y a la barra de Cardinal OS (Inicio, Llamadas, Cartera, Agenda, Por recuperar, Gerencia + «Más»: Mi situación, Vehículos, Productos, Pedidos, Configuración).
- **Gerencia (Cardinal):** las **21 secciones** pasan a 6 visibles (Vendedor por vendedor, Tendencia y cobertura, Nota diaria, Retos y concursos, Pautas de visita, Acompañamientos) + «Más secciones» con grupos **Terreno** (Kilómetros y costo, Jornadas, Territorios, Visitas (técnico), Bodegas por persona) y **Comercial** (Demanda no atendida, % Descuentos que cierran, Promociones de enganche, Por recuperar, Potencial por captar, Comparativo, Clientes por gestionar, Cambios pedidos).
- **Lateral del Panel de Ventas (`.ventas-lateral #sidebar`, ~20 pantallas):** secciones colapsables `<details>` — Vista (Global / Distribución / Servicio), Seguimiento, Análisis, Control, Administrador, Marcas (15, colapsada con «Ver las 15»), Plataforma. Abierta por defecto la sección de la pantalla actual y la primera; **recordar el estado abierto/cerrado por usuario**. Hoy el lateral es marino oscuro con textos `--ant-lat-*`: pasarlo a superficie clara (o, si se queda oscuro, subir el contraste del texto apagado a AA). Ítems de 38 px, icono azul, activo con `aria-current="page"` y fondo tenue. En ≤860 px pasa arriba como bloque.
- **Selector de vista** (Toda la empresa / Distribución / Servicio) como control segmentado en el encabezado de la pantalla, además del lateral.
- **Migas:** Portal › Área › Pantalla en las pantallas internas.
- **Filtros** de pantalla en una sola fila responsiva (`repeat(auto-fit,minmax(150px,1fr))`), controles de 38–40 px, etiquetas de 12 px sobre el control. El selector de vendedores sigue abriendo su modal «¿Qué vendedores quieres ver?».

## 6. Fase 4 — Pantallas (aplicar el mismo lenguaje; no cambiar datos ni lógica)

**Reglas comunes de tabla:** encabezado de 11 px en mayúsculas `--ant-apoyo`, filas de 10 px de padding, separador de 1 px, hover tenue, columnas numéricas a la derecha con `.num`, estados como **píldora de color suave (texto + fondo al 14 %) con icono o flecha**, nunca solo color. Contenedor con **scroll vertical** y `position:relative` (ver §10). En <1180 px se ocultan las columnas secundarias (clase `.sec-1100`) en vez de hacer scroll horizontal, y lo oculto se ve en la ficha. Siempre con `<caption class="visually-hidden">` y `aria-busy` mientras carga. Carga con el esqueleto existente, con las mismas columnas que la tabla real.

- **Panel de Ventas** (`panel-ventas.html`): encabezado con «Actualizar ahora» y hora de los datos; filtros (Año, Mes, Sucursal, Unidad de negocio, Vendedor, Web/Tradicional); nota «Las tarjetas cuentan facturas y boletas, netas de notas de crédito…»; **7 KPI** (Venta, Meta, Cumplimiento con flecha, Margen, Documentos, Clientes con compra, Litros de lubricante); venta por día y margen por día; marcas; tabla de **vendedores** (13 columnas; primarias: Vendedor, Venta, Meta, % Cumpl., Margen, Deuda; el resto `.sec-1100`); familias; sucursales; clientes por categoría; Distribución/Servicio. La paginación y «Excel / Elegir» se mantienen.
- **Clientes / CRM** (`index.html#clientes`): píldoras de subsección (Clientes, Cobertura de teléfono, Teléfonos de taller, Cambio de aceite, Giros), 7 KPI de estado (Clientes con compras, Nuevo, Recuperado, Activo, En riesgo, Dormido, Perdido), 8 filtros en cuadrícula, tabla de 12 columnas con botón **Ficha** (modal 360 con pestañas; lo del ERP llega aparte con esqueleto; saldos con `claseTramo`, sin cambios).
- **Cardinal · Cartera:** aviso «Estás viendo Cardinal OS como el vendedor…» con «Volver a mi vista»; resumen y texto de prioridad; buscador + «Ordenar»; **chips con conteo** (Con compras, Le toca comprar, Pasar a cobrar, Se está enfriando, Con deuda vencida, Sin compras, Todos); **tarjetas de cliente en 2 columnas** (≥1100 px) con número de orden, etiqueta («Le toca» / «Enfriando» con icono), datos clave (probabilidad, monto/mes, días, deuda en rojo con `bi-receipt`), **barra de probabilidad**, 3 pistas en lista, franja verde «Gestionado…» y **acciones en una fila**: **Qué venderle** (primaria), **Llamar**, **WhatsApp** (antes: 3 botones apilados de ancho completo).
- **Cardinal · Gerencia:** línea de ritmo del mes («Van X de Y días hábiles…»), insignia «N atrasados», resumen del equipo, orden (segmentado), tabla con **«Cierra el mes en»** (cifra grande + insignia Atrasado / En ritmo / Adelantado con flecha y texto), **barra de avance con marca vertical del ritmo esperado** (`role="img"` y `aria-label` con los valores), vendido hoy, visitas con venta, cotizaciones a nota y terreno (punto de actividad + texto, «lejos del cliente» en rojo con icono). Escala de color sin cambios: rojo <85 %, ámbar 85–100 %, verde ≥100 %. Bloque «Anotan solo en el SGE» con su aviso informativo y tabla.
- **Portal de Pagos «no me llegó el código»:** **conservar íntegras las reglas de seguridad** (el código nunca se muestra; solo canales verificados; el WhatsApp va solo al móvil del ERP; se exige describir cómo se verificó la identidad). Cambio visual: avisos de color suave en lugar de tarjetas amarillas/rojas saturadas, pasos numerados en tarjetas parejas, y el listado de pagos recientes con «Deshacer» que **conserva su confirmación** (acción financiera).

## 7. Fase 5 — Gráficos (reglas para todo gráfico nuevo o modificado)

1. **Nada de doble eje.** «Evolución en dinero y margen» (barras + línea con dos escalas) se separa en **dos gráficos con el mismo eje de días**: venta por día (barras) y margen por día (línea).
2. **Un donut con 8+ porciones no sirve para comparar.** «Por marca» pasa a **tabla con barra incrustada** en la columna Venta (ver orden y valor exacto).
3. **Una serie = un color** (azul de iconos). El estado va en **texto + flecha + color**, nunca solo color. Los colores de estado (ok/ámbar/rojo) están reservados para estado, no para identificar series.
4. Marcas finas, barras con extremo redondeado de 4 px anclado a la base, líneas de 2 px, cuadrícula y ejes recesivos, etiquetas directas selectivas (no un número sobre cada punto).
5. **Tooltip al pasar el mouse y al enfocar con teclado** (barras y puntos con `tabindex="0"`). Cada gráfico tiene su tabla al lado como vista alternativa para lector de pantalla; `role="img"` y `aria-label` en cada SVG.
6. Si el gráfico lleva ≥2 series: leyenda siempre visible y etiquetas directas en ≤4 series. Validar la paleta categórica con el script de contraste/daltonismo antes de publicar.
7. Los datos cargan con esqueleto de las mismas dimensiones (sin saltos).

## 8. Fase 6 — Los 20 detalles de UX (según el código real)

Estado: **Existe** = ya está; **Hacer**; **Parcial**; **Omitir**.

| # | Detalle | Decisión |
|---|---|---|
| 1 | Skeleton loaders | **Existe** (`[data-esqueleto]`, 250 ms, `aria-busy`). Verificar que cubra tablas de Clientes, Ventas, Cardinal y la ficha 360, y que `esqueleto-rellenar` quede estático con reduced-motion. No crear otro componente. |
| 2 | Optimistic updates | **Hacer, acotado:** fijar/soltar/mover/ocultar módulos, checks de tareas, renombres. Actualiza al instante y revierte con aviso si falla. **Nunca** pagos, conciliación, aprobaciones ni nada financiero. |
| 3 | Command menu | **Hacer.** `⌘/Ctrl K`, `<dialog>`, combobox accesible (↑↓ Enter Esc), indexa **solo los módulos/pantallas permitidos al usuario** (reusar la lista de `menu_modulos.js`/`#gridModulos` y `sinTildes`). Hoy no existe ningún atajo global. |
| 4 | Shortcut hints | **Hacer** junto al 3: `<kbd>` con ⌘ en Mac y Ctrl en el resto; los atajos no se disparan en `input/textarea/select/contenteditable` ni con modificadores. `/` enfoca el buscador de la pantalla. |
| 5 | Undo toasts | **Hacer** para acciones reversibles (fijar, ocultar, mover, restablecer vista, archivar). Aviso de 6–8 s con «Deshacer», contenedor único `role="status"`. Sin diálogo de confirmación. Borrados reales: borrado lógico o petición diferida. **Las acciones irreversibles o financieras conservan su confirmación.** |
| 6 | Stale-while-revalidate | **Solo datos no críticos** (listas de módulos, catálogos, listados de solo lectura). **Excluir** saldos, deuda, stock, pagos y todo lo del ERP en la ficha 360 (`data-erp-zona`). Requiere TTL y revalidar en `focus`/`online`; coordinar con backend. |
| 7 | Prerendering | **Hacer con cuidado.** `<script type="speculationrules">` con `eagerness:"moderate"`, mismo origen, excluyendo `/logout`, `/api/*`, descargas (`excel|exportar|descargar`, que el script de carga ya detecta) y cualquier GET con efecto. **Antes, auditar que ningún GET modifique estado.** |
| 8 | BlurHash | **Omitir** (casi no hay imágenes subidas). |
| 9 | View transitions | **Hacer:** `document.startViewTransition` en filtros/chips y cambios en la misma página; `@view-transition{navigation:auto}` entre páginas con cuidado: debe **coexistir con el esqueleto y `#appLoader`** (no ocultarlos). <300 ms, anulado con reduced-motion. |
| 10 | Bottom sheets | **Omitir** (no hay). Si se crean en móvil: `offcanvas` de Bootstrap con botón de cerrar. |
| 11 | Animaciones interrumpibles | **Parcial:** preferir `transition` a `@keyframes` en lo interactivo; no bloquear entrada durante animaciones. El widget Sabio usa keyframes infinitos (ya anulados con reduced-motion). |
| 12 | Predictive back | **Omitir** (no es app nativa). |
| 13 | Tamaño táctil | **Parcial** (`.portal-btn` ya 44×44). Llevar a 44 px: iconos de tablas, `nav-link` del lateral (hoy 36–38 px) y filas de menús en táctil. |
| 14 | Safe-area | **Parcial** (solo `.app-topbar`). Extender a avisos, Sabio, caja de progreso y `.mod-main`; `viewport-fit=cover` ya está. |
| 15 | One-time-code | **Verificar** el campo del código del login / Portal de Pagos: `autocomplete="one-time-code" inputmode="numeric"` en un único input; el SMS/correo debe terminar con `@dominio #123456` (backend). No tocar la política de que el ejecutivo no puede ver el código. |
| 16 | Tabular numbers | **Parcial:** agregar `.num` global y aplicarla a KPI, montos, contadores y columnas numéricas. |
| 17 | Texto balanceado | **Hacer** (`text-wrap: balance` / `pretty`, ver §3.6). |
| 18 | Esquinas continuas | **Hacer** como mejora progresiva (`corner-shape: squircle`). |
| 19 | Idempotency keys | **Hacer en acciones que crean registros o pagos** (UUID al iniciar, mismo `Idempotency-Key` en cada reintento, botón deshabilitado mientras corre). **Requiere backend** (tabla de claves + TTL). Una búsqueda o `/portal/fijar` no lo necesitan. |
| 20 | Safe triangle | **Omitir** (los menús abren por clic). |

## 9. Paleta de color — decisión pendiente

El destacado actual (naranja `--ant-accent`) aparece en muchos lugares (campana, módulos fijados, pestaña activa, foco, botones, bordes de KPI) y se percibe pesado. **Implementa los colores con tokens centralizados (§3.1) para poder cambiar la paleta en una línea.** Propuestas en el prototipo (menú de usuario → Paleta):
- **A · Actual** (marino + naranja).
- **B · Marino sobrio:** acento marino `#0b3a66`, rojo `#c0392b` solo para alertas, indicadores neutros.
- **C · Verde azulado y piedra:** fondo cálido `#f6f5f2`, acento `#0f6b6b`, indicadores neutros.
- **D · Grafito:** grises azulados, iconos `#3b556e`, naranja solo en el botón principal.

**Hasta que Sebastián confirme una paleta, aplica la A** pero con los tokens ya separados (`--ant-accent`, `--ant-alerta`, `--ant-icono`, `--kpi-borde`, `--kpi-ico`). Si se elige otra, es un cambio de valores, no de plantillas.

## 10. Errores que ya ocurrieron en las pruebas (no repetir)

1. `.dropdown` de Bootstrap (`position:relative`) deja el botón `⋯` centrado sobre el icono → `.portal-card > .dropdown{position:static}`.
2. En el bloque de grupos chicos, `--s9/--s6/--o9` se **heredan** al hijo: `.cluster > .grupo{grid-column:auto;order:0}`, o cada panel pide el ancho del bloque entero y se apilan.
3. Los `.visually-hidden` (texto solo para lector de pantalla) en cabeceras de tabla **ensanchan toda la página en móvil** si el contenedor con `overflow:auto` no es `position:relative` → `.tabla-wrap{overflow:auto;position:relative}`.
4. `grid-template-columns:1fr` no limita contenido ancho → usar `minmax(0,1fr)`.
5. En menos de 1240 px el texto «Administración Antumalal» de la cabecera se superponía a los botones → ocultarlo.
6. Un `<input type="number">` rechaza la coma decimal y queda vacío sin avisar (ver `importaciones_dolar.js`): en formularios nuevos, no cambiar el tipo de input.

## 11. Criterios de aceptación

1. Ningún cambio altera permisos, rutas, consultas ni cálculos; pasan los tests existentes; los datos reales no se tocan.
2. `/portal` muestra los módulos agrupados en bento, con **icono azul sin fondo**, tarjetas de ~104 px de alto, 6 indicadores compactos en una fila y cabecera clara. A **390 px de ancho no hay scroll horizontal** en ninguna pantalla modificada.
3. **Ningún menú tiene scroll horizontal**; los largos usan «Más» o secciones colapsables.
4. `⌘/Ctrl K` abre el menú de comandos y se navega solo con teclado; solo aparecen pantallas permitidas.
5. Fijar/ocultar/mover un módulo es inmediato, con «Deshacer» de 6–8 s y reversión si el servidor falla.
6. Tablas con números tabulares, columnas secundarias ocultas bajo 1180 px y esqueleto con las mismas columnas.
7. Los gráficos cumplen §7 (sin doble eje, sin donut con muchas porciones, con tabla y tooltip).
8. Modo oscuro, `prefers-reduced-motion` y contraste AA verificados en las pantallas tocadas.
9. Todo control táctil ≥44×44 px; foco visible; `aria-*` en botones de icono; `skip-link` intacto.
10. Reporte final con los 20 puntos, capturas antes/después de: Portal, Panel de Ventas, Clientes, Cardinal Cartera, Cardinal Gerencia y Portal de Pagos, y lista de pendientes de backend.

## 12. Pendientes de backend (reportar, no improvisar)

- Campo `grupo` por módulo (y su orden).
- Endpoint «Ocultar módulo» (`POST /portal/ocultar`) y persistencia por usuario.
- `Idempotency-Key` en acciones que crean registros/pagos (tabla de claves + TTL).
- SWR / cabeceras de caché de datos no críticos.
- Mensajería con línea `@dominio #código` para one-time-code.
- Conteos reales («N pendientes») por módulo si se quiere mostrar un dato en la tarjeta (no inventar métricas).

## 13. Fuera de alcance

Cambios de reglas de negocio, nuevas dependencias, migración de framework, rediseño del flujo de seguridad del Portal de Pagos, y las pantallas que no se entregaron como referencia (Importaciones, Tareas, Mermas, Morosidad, Taller, Inventario y similares): aplicarles solo tokens, tablas, menús y filtros de este documento, sin rediseñarlas.

## 14. Sugerencias opcionales (después de lo anterior, una por una y con aprobación)

1. **Pruebas visuales automáticas:** capturas con Playwright de las 6 pantallas a 390 / 1100 / 1360 px, en claro y oscuro, comparadas contra las de referencia, para que un cambio de CSS no rompa otra pantalla sin que nadie lo note.
2. **Componentes únicos:** unificar en una sola clase cada patrón repetido (KPI, panel, píldora de estado, tabla de datos, aviso, barra de avance) y eliminar los `style=""` inline y los colores sueltos que detecta el «detector de diseño» del repo.
3. **Estados vacíos y de error** con el mismo estilo (icono, una frase, una acción) en lugar de textos sueltos o tablas vacías.
4. **Orden de grupos por uso:** si hay telemetría de clics, ordenar los grupos del portal por uso personal sin perder los fijados.
5. **Auditoría de accesibilidad** con herramienta automática (axe/Lighthouse) en las pantallas tocadas, con corrección de contraste, nombres accesibles y orden de foco.
6. **Guía de estilo viva:** una página interna con tokens, componentes y reglas de este documento, para que las pantallas nuevas nazcan con el mismo lenguaje.
