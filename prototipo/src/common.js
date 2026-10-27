/* Utilidades compartidas por las vistas sueltas: tema, paleta, menú Módulos, ⌘/Ctrl K, avisos con Deshacer, tooltips y skeleton */
(function(){
'use strict';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const esMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const safe = fn => { try { return fn(); } catch(e) { return null; } };
const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
const fmt = new Intl.NumberFormat('es-CL');
const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = n => '$' + fmt.format(Math.round(n));
const pct = (n, d=0) => n.toFixed(d).replace('.', ',') + ' %';
const BASE = window.ANT_BASE || '../';
const RUTA = { 'Panel de Ventas':'panel-ventas.html', 'Portal de Pagos':'portal-pagos.html', 'Cardinal OS':'cardinal-cartera.html' };
const href = n => RUTA[n] ? RUTA[n] : BASE + 'index.html' + (n === 'Clientes' ? '#clientes' : '');
const GRUPOS = [
  ['Ventas', [['Panel de Ventas','bar-chart-line'],['Pedidos de repuesto','cart-plus'],['Taller: órdenes de trabajo y repuestos','wrench-adjustable'],['Descuentos y Plazos','percent'],['Control de Notas de Venta','shield-exclamation']]],
  ['Cobranza y Finanzas', [['Portal de Pagos','credit-card-2-front'],['Solicitudes de Pago','cash-coin'],['Conciliación de Ingresos','shield-check'],['Morosidad Empresarial','graph-down-arrow'],['Protestos','file-earmark-x'],['Talonario Digital','receipt-cutoff'],['Cumplimiento Forma de Pago','clipboard2-check'],['Importación de Facturas','file-earmark-arrow-up']]],
  ['Bodega y Logística', [['Bodega','boxes'],['Toma de Inventario','upc-scan'],['Mermas y Logística','clipboard2-x'],['Pedidos de mercadería','clipboard-data'],['Maestro de Productos','database']]],
  ['Abastecimiento', [['Importaciones','box-seam'],['Proveedores','truck']]],
  ['Clientes y Marketing', [['Raphael Chat','chat-dots'],['Clientes','person-vcard']]],
  ['Gestión', [['Tareas y Recordatorios','check2-square'],['Cardinal OS','signpost-split']]]
];
window.ant = { $, $$, safe, norm, fmt, esc, money, pct, reduce, BASE };

/* ---- atajos con ⌘ o Ctrl ---- */
$$('[data-atajo]').forEach(k => k.textContent = (esMac ? '⌘' : 'Ctrl') + ' ' + k.dataset.atajo);

/* ---- aviso con Deshacer (role=status en el contenedor) ---- */
ant.toast = function(msg, onUndo, ms=7000){
  const t = document.createElement('div'); t.className = 'toast-u';
  const s = document.createElement('span'); s.textContent = msg; t.appendChild(s); let hecho = false;
  if (onUndo) { const b = document.createElement('button'); b.type = 'button'; b.textContent = 'Deshacer'; b.onclick = () => { hecho = true; onUndo(); t.remove(); }; t.appendChild(b); }
  $('#toasts').appendChild(t); setTimeout(() => { if (!hecho) t.remove(); }, ms);
};

/* ---- skeleton: aparece solo si la carga pasa de 300 ms, con las mismas columnas que la tabla real ---- */
ant.skeleton = function(tb, cols, filas, pintar, demora=900){
  const caja = tb.closest('.panel'), id = (tb._id = (tb._id || 0) + 1); if (caja) caja.setAttribute('aria-busy','true');
  const t = setTimeout(() => { if (tb._id === id) tb.innerHTML = Array.from({length:filas}, (_, i) => '<tr>' + Array.from({length:cols}, (_, j) => `<td><div class="sk-b" style="width:${40+((i*7+j*13)%50)}%"></div></td>`).join('') + '</tr>').join(''); }, 300);
  setTimeout(() => { clearTimeout(t); if (tb._id !== id) return; tb.innerHTML = pintar(); if (caja) caja.setAttribute('aria-busy','false'); }, demora);
};

/* ---- tooltips de gráficos: cualquier [data-tip] ---- */
const tip = document.createElement('div'); tip.className = 'tip'; tip.setAttribute('role','tooltip'); document.body.appendChild(tip);
function mostrar(e){ const el = e.target.closest && e.target.closest('[data-tip]'); if (!el) { tip.classList.remove('on'); return; }
  tip.innerHTML = el.dataset.tip; tip.classList.add('on'); const x = Math.min(e.clientX + 14, innerWidth - tip.offsetWidth - 8), y = Math.max(8, e.clientY - tip.offsetHeight - 10); tip.style.left = x + 'px'; tip.style.top = y + 'px'; }
document.addEventListener('mousemove', mostrar); document.addEventListener('mouseleave', () => tip.classList.remove('on'));
document.addEventListener('focusin', e => { const el = e.target.closest('[data-tip]'); if (el) { const r = el.getBoundingClientRect(); tip.innerHTML = el.dataset.tip; tip.classList.add('on'); tip.style.left = Math.max(8, r.left) + 'px'; tip.style.top = Math.max(8, r.top - tip.offsetHeight - 8) + 'px'; } });
document.addEventListener('focusout', () => tip.classList.remove('on'));

/* ---- gráficos SVG simples ---- */
ant.barras = function(el, datos, o={}){            // datos: [{l, v, tip}]
  const W = 640, H = o.alto || 190, m = {t:8, r:6, b:22, l:44}, max = o.max || Math.max(...datos.map(d => d.v)) * 1.1, n = datos.length;
  const x = i => m.l + (W - m.l - m.r) * (i + .5) / n, bw = Math.max(4, (W - m.l - m.r) / n * .62), y = v => m.t + (H - m.t - m.b) * (1 - v / max);
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.aria || 'Gráfico de barras')}">`;
  for (let k = 0; k <= 3; k++) { const v = max * k / 3; s += `<g class="rej"><line x1="${m.l}" x2="${W-m.r}" y1="${y(v)}" y2="${y(v)}"/></g><g class="eje"><text x="${m.l-6}" y="${y(v)+3}" text-anchor="end">${o.fmtY ? o.fmtY(v) : fmt.format(Math.round(v))}</text></g>`; }
  datos.forEach((d, i) => { const h = y(0) - y(d.v); s += `<path class="barra" tabindex="0" data-tip="${esc(d.tip || d.l + ': <b>' + d.v + '</b>')}" d="M${x(i)-bw/2},${y(0)}V${y(d.v)+4}a4,4 0 0 1 4,-4h${bw-8}a4,4 0 0 1 4,4V${y(0)}Z"/>`;
    if (!o.cadaEtq || i % o.cadaEtq === 0) s += `<g class="eje"><text x="${x(i)}" y="${H-6}" text-anchor="middle">${esc(d.l)}</text></g>`; });
  el.innerHTML = s + '</svg>';
};
ant.linea = function(el, datos, o={}){             // datos: [{l, v, tip}]
  const W = 640, H = o.alto || 110, m = {t:10, r:6, b:20, l:44}, mx = o.max || Math.max(...datos.map(d => d.v)), mn = o.min != null ? o.min : 0, n = datos.length;
  const x = i => m.l + (W - m.l - m.r) * (i + .5) / n, y = v => m.t + (H - m.t - m.b) * (1 - (v - mn) / (mx - mn));
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.aria || 'Gráfico de línea')}">`;
  for (let k = 0; k <= 2; k++) { const v = mn + (mx - mn) * k / 2; s += `<g class="rej"><line x1="${m.l}" x2="${W-m.r}" y1="${y(v)}" y2="${y(v)}"/></g><g class="eje"><text x="${m.l-6}" y="${y(v)+3}" text-anchor="end">${o.fmtY ? o.fmtY(v) : Math.round(v)}</text></g>`; }
  s += `<path class="linea" d="${datos.map((d, i) => (i ? 'L' : 'M') + x(i) + ',' + y(d.v)).join('')}"/>`;
  datos.forEach((d, i) => { s += `<circle class="punto" r="${o.r || 3.5}" cx="${x(i)}" cy="${y(d.v)}" tabindex="0" data-tip="${esc(d.tip || d.l + ': <b>' + d.v + '</b>')}"/>`; if (!o.cadaEtq || i % o.cadaEtq === 0) s += `<g class="eje"><text x="${x(i)}" y="${H-5}" text-anchor="middle">${esc(d.l)}</text></g>`; });
  el.innerHTML = s + '</svg>';
};
ant.hbarras = function(el, datos, o={}){           // datos: [{l, v, txt, meta}]
  const max = o.max || Math.max(...datos.map(d => Math.max(d.v, d.meta || 0))) * 1.05;
  el.innerHTML = datos.map(d => `<div class="hb"><span>${esc(d.l)}</span><div class="hb-t"><i tabindex="0" style="width:${d.v/max*100}%" data-tip="${esc(d.tip || d.l + ': <b>' + (d.txt || d.v) + '</b>')}"></i>${d.meta ? `<u style="left:${d.meta/max*100}%" title="Meta"></u>` : ''}</div><b>${esc(d.txt || d.v)}</b></div>`).join('');
};

/* ---- tema y paleta ---- */
const temaTxt = () => { const t = safe(() => localStorage.getItem('ant.tema')); const el = $('#temaTxt'); if (el) el.textContent = t === 'dark' ? 'oscuro' : t === 'light' ? 'claro' : 'automático'; };
const bt = $('#btnTema'); if (bt) bt.onclick = e => { e.stopPropagation(); const t = safe(() => localStorage.getItem('ant.tema')), sig = !t ? 'light' : t === 'light' ? 'dark' : null;
  safe(() => sig ? localStorage.setItem('ant.tema', sig) : localStorage.removeItem('ant.tema'));
  document.documentElement.setAttribute('data-bs-theme', sig || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')); temaTxt(); };
temaTxt();
$$('[data-paleta-op]').forEach(b => b.onclick = e => { e.stopPropagation(); const v = b.dataset.paletaOp;
  if (v === 'a') { document.documentElement.removeAttribute('data-paleta'); safe(() => localStorage.removeItem('ant.paleta')); } else { document.documentElement.setAttribute('data-paleta', v); safe(() => localStorage.setItem('ant.paleta', v)); }
  $$('[data-paleta-op]').forEach(x => x.classList.toggle('active', x === b)); });
{ const a = document.documentElement.getAttribute('data-paleta') || 'a', b = $(`[data-paleta-op="${a}"]`); if (b) b.classList.add('active'); }

/* ---- menú «Módulos» ---- */
function pintarMenu(){
  const q = norm(($('#menuBusca') || {value:''}).value.trim()); let h = '';
  if (!q) h += `<li><a class="dropdown-item" href="${BASE}index.html"><i class="bi bi-house-door"></i>Portal</a></li>`;
  GRUPOS.forEach(([g, mods]) => { const l = mods.filter(m => !q || norm(m[0]).includes(q)); if (l.length) h += `<li class="mod-menu-titulo">${g}</li>` + l.map(m => `<li><a class="dropdown-item" href="${href(m[0])}"><i class="bi bi-${m[1]}"></i>${esc(m[0])}</a></li>`).join(''); });
  const ul = $('#menuLista'); if (ul) ul.innerHTML = h || '<li class="p-3 text-muted">Ningún módulo con ese nombre.</li>';
}
const mb = $('#menuBusca'); if (mb) { mb.addEventListener('input', pintarMenu); mb.addEventListener('keydown', e => { if (e.key === 'Enter') { const a = $('#menuLista .dropdown-item[href]:not([href$="index.html"])'); if (a) location.href = a.href; } }); }
pintarMenu();

/* ---- ⌘/Ctrl K ---- */
const cmd = $('#cmd'), cq = $('#cmdQ'), cl = $('#cmdLista'); let items = [], sel = 0;
const paginas = [['Portal',BASE+'index.html','house-door','Página'],['Panel de Ventas','panel-ventas.html','bar-chart-line','Página'],['Cardinal OS · Cartera','cardinal-cartera.html','compass','Página'],['Cardinal OS · Gerencia','cardinal-gerencia.html','building','Página'],['Portal de Pagos · «no me llegó el código»','portal-pagos.html','headset','Página'],['Clientes',BASE+'index.html#clientes','person-vcard','Página']];
function pintarCmd(){
  const q = norm(cq.value.trim()), mods = GRUPOS.flatMap(([g, ms]) => ms.map(m => [m[0], href(m[0]), m[1], g]));
  const vistos = new Set(); items = paginas.concat(mods).filter(i => { const k = i[1] + i[0]; if (vistos.has(k)) return false; vistos.add(k); return !q || norm(i[0]).includes(q) || norm(i[3]).includes(q); }).slice(0, 30); sel = 0;
  cl.innerHTML = items.length ? items.map((i, n) => `<li role="option" id="op${n}" aria-selected="${n===0}" data-n="${n}"><i class="bi bi-${i[2]}"></i>${esc(i[0])}<small>${i[3]}</small></li>`).join('') : '<li class="text-muted" role="option" aria-disabled="true">Sin resultados</li>';
  cq.setAttribute('aria-activedescendant', items.length ? 'op0' : '');
}
function marcar(n){ if (!items.length) return; sel = (n + items.length) % items.length; $$('li', cl).forEach((li, i) => li.setAttribute('aria-selected', i === sel)); cq.setAttribute('aria-activedescendant', 'op' + sel); $$('li', cl)[sel].scrollIntoView({block:'nearest'}); }
const abrirCmd = () => { cq.value = ''; pintarCmd(); cmd.showModal(); cq.focus(); };
const bc = $('#abrirCmd'); if (bc) bc.onclick = abrirCmd;
cq.addEventListener('input', pintarCmd);
cq.addEventListener('keydown', e => { if (e.key === 'ArrowDown') { e.preventDefault(); marcar(sel + 1); } else if (e.key === 'ArrowUp') { e.preventDefault(); marcar(sel - 1); } else if (e.key === 'Enter') { e.preventDefault(); if (items[sel]) location.href = items[sel][1]; } });
cl.addEventListener('click', e => { const li = e.target.closest('li[data-n]'); if (li) location.href = items[+li.dataset.n][1]; });
cmd.addEventListener('click', e => { if (e.target === cmd) cmd.close(); });
const escribiendo = el => el && (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable);
addEventListener('keydown', e => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); cmd.open ? cmd.close() : abrirCmd(); return; }
  if (escribiendo(e.target) || e.metaKey || e.ctrlKey || e.altKey) return; if (e.key === '/') { const b = $('[data-buscar-atajo]'); if (b) { e.preventDefault(); b.focus(); } } });

/* ---- asistente flotante ---- */
document.body.classList.add('tiene-sabio');
setTimeout(() => { const sa = $('#sabioSaludo'); if (sa) sa.remove(); }, 7000);   // el saludo se retira solo: hoy tapa contenido
const cs = $('#cierraSabio'); if (cs) cs.onclick = () => $('#sabioSaludo').remove();
const bs = $('#btnSabio'); if (bs) bs.onclick = () => ant.toast('Aquí abre el asistente (maqueta).', null, 3000);
})();
