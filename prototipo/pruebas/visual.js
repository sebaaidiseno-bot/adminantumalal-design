#!/usr/bin/env node
/* Pruebas visuales y de accesibilidad de las pantallas de referencia (sin dependencias nuevas: usa `playwright`; `axe-core` es opcional).
 *
 *   node prototipo/pruebas/visual.js --baseline   guarda las capturas actuales como referencia (prototipo/pruebas/base/)
 *   node prototipo/pruebas/visual.js              captura de nuevo, compara con la referencia y revisa:
 *                                                  · sin desborde horizontal de la página,
 *                                                  · sin errores de consola,
 *                                                  · sin violaciones de axe (si axe-core está instalado),
 *                                                  · diferencia de píxeles bajo el umbral (por defecto 0,5 %).
 * Cada pantalla se prueba a 390 / 1100 / 1360 px, en claro y en oscuro. Sale con código 1 si algo falla (sirve en CI).
 * Para las pantallas reales de la plataforma: cambia BASE y PANTALLAS por tus URLs (con sesión, usa `storageState`). */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');

const AQUI = __dirname, BASE_DIR = path.join(AQUI, 'base'), SALIDA = path.join(AQUI, 'salida');
const BASE = 'file://' + path.resolve(AQUI, '..') + '/';
const PANTALLAS = [['portal', 'index.html#portal'], ['clientes', 'index.html#clientes'], ['panel-ventas', 'vistas/panel-ventas.html'], ['cardinal-cartera', 'vistas/cardinal-cartera.html'],
  ['cardinal-gerencia', 'vistas/cardinal-gerencia.html'], ['portal-pagos', 'vistas/portal-pagos.html'], ['guia-de-estilo', 'vistas/guia-de-estilo.html']];
const ANCHOS = [390, 1100, 1360], ESQUEMAS = ['light', 'dark'];
const UMBRAL = parseFloat(process.env.UMBRAL || '0.5');   // % de píxeles distintos tolerado
const baseline = process.argv.includes('--baseline');
let axeSrc = null; try { axeSrc = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8'); } catch (e) { console.log('(axe-core no instalado: se omite la revisión de accesibilidad; npm i -D axe-core)'); }

/* diferencia de píxeles entre dos PNG, calculada dentro del navegador (sin librerías) */
async function diferencia(pagina, a, b) {
  return pagina.evaluate(async ([ua, ub]) => {
    const cargar = u => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = u; });
    const [x, y] = await Promise.all([cargar(ua), cargar(ub)]);
    if (x.width !== y.width || x.height !== y.height) return { tamano: true, pct: 100 };
    const c = document.createElement('canvas'); c.width = x.width; c.height = x.height; const g = c.getContext('2d');
    g.drawImage(x, 0, 0); const d1 = g.getImageData(0, 0, c.width, c.height).data; g.clearRect(0, 0, c.width, c.height); g.drawImage(y, 0, 0); const d2 = g.getImageData(0, 0, c.width, c.height).data;
    let n = 0; for (let i = 0; i < d1.length; i += 4) if (Math.abs(d1[i] - d2[i]) + Math.abs(d1[i + 1] - d2[i + 1]) + Math.abs(d1[i + 2] - d2[i + 2]) > 24) n++;
    return { tamano: false, pct: n / (d1.length / 4) * 100 };
  }, [a, b]);
}
const dataUrl = f => 'data:image/png;base64,' + fs.readFileSync(f).toString('base64');

(async () => {
  fs.mkdirSync(baseline ? BASE_DIR : SALIDA, { recursive: true });
  const nav = await chromium.launch(); const fallos = []; let total = 0;
  const aux = await (await nav.newContext()).newPage();
  for (const esquema of ESQUEMAS) for (const ancho of ANCHOS) for (const [nombre, url] of PANTALLAS) {
    const id = `${nombre}__${ancho}__${esquema}`; total++;
    const ctx = await nav.newContext({ viewport: { width: ancho, height: 900 }, colorScheme: esquema, reducedMotion: 'reduce' });
    const p = await ctx.newPage(); const errores = []; p.on('pageerror', e => errores.push(String(e))); p.on('console', m => m.type() === 'error' && errores.push(m.text()));
    await p.goto(BASE + url); await p.waitForTimeout(1500);
    await p.addStyleTag({ content: '#sabio,.tip{display:none!important}*{caret-color:transparent!important}' });   // lo flotante cambia entre corridas
    const desborde = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (desborde > 0) fallos.push(`${id}: desborde horizontal de ${desborde}px`);
    if (errores.length) fallos.push(`${id}: errores de consola: ${errores[0]}`);
    if (axeSrc) { await p.evaluate(s => { eval(s); }, axeSrc); const r = await p.evaluate(() => axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa'] }));
      r.violations.forEach(v => fallos.push(`${id}: axe ${v.id} (${v.nodes.length}) ${v.nodes[0].target.join(' ').slice(0, 60)}`)); }
    const archivo = path.join(baseline ? BASE_DIR : SALIDA, id + '.png'); await p.screenshot({ path: archivo, fullPage: true });
    if (!baseline) { const ref = path.join(BASE_DIR, id + '.png');
      if (!fs.existsSync(ref)) fallos.push(`${id}: sin referencia (corre con --baseline)`);
      else { const d = await diferencia(aux, dataUrl(ref), dataUrl(archivo)); if (d.pct > UMBRAL) fallos.push(`${id}: cambió ${d.tamano ? '(distinto tamaño)' : d.pct.toFixed(2) + ' % de los píxeles'} → ${path.relative(process.cwd(), archivo)}`); } }
    await ctx.close();
  }
  await nav.close();
  console.log(baseline ? `Referencias guardadas: ${total} capturas en ${path.relative(process.cwd(), BASE_DIR)}` : `${total} pantallas revisadas · ${fallos.length} problema(s)`);
  fallos.forEach(f => console.log(' ✗', f)); process.exit(fallos.length && !baseline ? 1 : 0);
})();
