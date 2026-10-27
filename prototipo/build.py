#!/usr/bin/env python3
"""Arma las vistas sueltas de prototipo/vistas/*.html a partir de src/.
Cada archivo sale AUTOCONTENIDO (CSS y JS compartidos incluidos): se descarga y se abre solo, con doble clic.
Uso:  python3 prototipo/build.py"""
import pathlib, re

RAIZ = pathlib.Path(__file__).parent
SRC, SALIDA = RAIZ / 'src', RAIZ / 'vistas'
SALIDA.mkdir(exist_ok=True)
_ix = (RAIZ / 'index.html').read_text()
css = _ix[_ix.index('<style>') + 7:_ix.index('</style>')].strip() + '\n' + (SRC / 'extra.css').read_text()   # única fuente de CSS: el <style> de index.html
js = (SRC / 'common.js').read_text()

CABECERA = '''<header class="top"><div class="top-in">
  <div class="top-izq"><a class="marca" href="../index.html"><i class="bi bi-gear-wide-connected"></i><span>ANTUMALAL</span><small class="hide-sm">Administración Antumalal</small></a></div>
  <div class="sistema d-none d-xl-block">RAPHAEL<span>OS</span></div>
  <div class="top-der">
    <a class="btn-ghost solo-desk" href="../index.html" title="Portal maestro"><i class="bi bi-house-door"></i><span class="hide-sm">Portal</span></a>
    <a class="btn-ghost" href="../index.html#clientes" title="Maestro de clientes" aria-label="Clientes"><i class="bi bi-person-rolodex"></i><span class="hide-sm">Clientes</span></a>
    <div class="dropdown">
      <button class="btn-ghost" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false" aria-label="Módulos"><i class="bi bi-grid-3x3-gap"></i><span class="hide-sm">Módulos</span><i class="bi bi-chevron-down small hide-sm"></i></button>
      <div class="dropdown-menu dropdown-menu-end p-0 mod-menu">
        <div class="mod-menu-busca"><i class="bi bi-search" aria-hidden="true"></i><input type="search" class="form-control form-control-sm" placeholder="Buscar módulo" aria-label="Buscar módulo" autocomplete="off" id="menuBusca"></div>
        <ul class="mod-menu-lista" id="menuLista"></ul>
        <a class="mod-menu-pie" href="../index.html"><i class="bi bi-arrows-move me-1"></i>Ordenar a mi gusto en el Portal</a>
      </div>
    </div>
    <button class="btn-ghost btn-cmd" id="abrirCmd" aria-haspopup="dialog" title="Buscar páginas y acciones"><i class="bi bi-search"></i><span class="txt"><kbd data-atajo="K"></kbd></span></button>
    <a class="btn-ghost" href="#" aria-label="Notificaciones, 60 sin leer"><i class="bi bi-bell"></i><span class="badge-n">60</span></a>
    <div class="dropdown">
      <button class="btn-ghost" data-bs-toggle="dropdown" aria-label="Menú de usuario"><i class="bi bi-person-circle"></i><span class="hide-sm">Nombre</span><i class="bi bi-chevron-down small hide-sm"></i></button>
      <ul class="dropdown-menu dropdown-menu-end">
        <li class="dropdown-header">Nombre Apellido<br><small class="text-muted">Usuario</small></li><li><hr class="dropdown-divider"></li>
        <li><a class="dropdown-item" href="#"><i class="bi bi-person-gear"></i>Mi perfil</a></li>
        <li><a class="dropdown-item" href="guia-de-estilo.html"><i class="bi bi-palette2"></i>Guía de estilo</a></li>
        <li><button class="dropdown-item" id="btnTema"><i class="bi bi-circle-half"></i>Tema: <span id="temaTxt">automático</span></button></li>
        <li class="dropdown-header pb-0">Paleta</li>
        <li><button class="dropdown-item" data-paleta-op="a"><i class="bi bi-circle-fill" style="color:#e85215"></i>A · Actual (marino + naranja)</button></li>
        <li><button class="dropdown-item" data-paleta-op="b"><i class="bi bi-circle-fill" style="color:#0b3a66"></i>B · Marino sobrio</button></li>
        <li><button class="dropdown-item" data-paleta-op="c"><i class="bi bi-circle-fill" style="color:#0f6b6b"></i>C · Verde azulado y piedra</button></li>
        <li><button class="dropdown-item" data-paleta-op="d"><i class="bi bi-circle-fill" style="color:#3b556e"></i>D · Grafito</button></li>
        <li><hr class="dropdown-divider"></li><li><a class="dropdown-item" href="#"><i class="bi bi-box-arrow-right"></i>Salir</a></li>
      </ul>
    </div>
  </div></div></header>'''

def cardinal(activa):
    def t(clave, icono, texto):
        cur = ' aria-current="page"' if clave == activa else ''
        dest = {'cartera': 'cardinal-cartera.html', 'gerencia': 'cardinal-gerencia.html'}.get(clave, '#')
        return f'<a href="{dest}"{cur}><i class="bi bi-{icono}"></i>{texto}</a>'
    extras = ''.join(f'<li><a class="dropdown-item" href="#"><i class="bi bi-{i}"></i>{x}</a></li>' for i, x in
                     [('graph-up', 'Mi situación'), ('truck-front', 'Vehículos'), ('box', 'Productos'), ('clipboard-data', 'Pedidos'), ('gear', 'Configuración')])
    return f'''<section class="cardinal" aria-label="Cardinal OS"><div class="cardinal-in">
  <div class="cardinal-fila">
    <a class="cardinal-marca" href="cardinal-cartera.html"><i class="bi bi-compass"></i>Cardinal<span>OS</span></a>
    <div class="cardinal-buscar"><i class="bi bi-search"></i><input type="search" class="form-control" placeholder="Buscar cliente o RUT" aria-label="Buscar cliente o RUT" data-buscar-atajo autocomplete="off"></div>
  </div>
  <nav class="pestanas" aria-label="Cardinal OS">{t('inicio','house','Inicio')}{t('llamadas','headset','Llamadas')}{t('cartera','columns-gap','Cartera')}{t('agenda','calendar-check','Agenda')}{t('por','arrow-repeat','Por recuperar')}{t('gerencia','building','Gerencia')}
    <div class="dropdown"><button data-bs-toggle="dropdown" aria-expanded="false"><i class="bi bi-three-dots"></i>Más</button><ul class="dropdown-menu">{extras}</ul></div></nav>
</div></section>'''

PAGINAS = [  # archivo de salida, título, fragmento, barra Cardinal
    ('panel-ventas.html', 'Panel de Ventas · Propuesta', 'panel-ventas.html', None),
    ('cardinal-cartera.html', 'Cardinal OS · Cartera · Propuesta', 'cardinal-cartera.html', 'cartera'),
    ('cardinal-gerencia.html', 'Cardinal OS · Gerencia · Propuesta', 'cardinal-gerencia.html', 'gerencia'),
    ('portal-pagos.html', 'Portal de Pagos · Propuesta', 'portal-pagos.html', None),
    ('guia-de-estilo.html', 'Guía de estilo · Propuesta', 'guia.html', None),
]

PLANTILLA = '''<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#f2f5f9"><title>%%TITULO%%</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
<script>(function(){var t=null;try{t=localStorage.getItem('ant.tema')}catch(e){}if(!t&&matchMedia('(prefers-color-scheme: dark)').matches)t='dark';if(t)document.documentElement.setAttribute('data-bs-theme',t);var p=null;try{p=localStorage.getItem('ant.paleta')}catch(e){}if(p)document.documentElement.setAttribute('data-paleta',p);})();</script>
<style>
%%CSS%%
</style></head>
<body>
<a class="skip" href="#main">Saltar al contenido</a>
%%CABECERA%%
%%CARDINAL%%
%%CUERPO%%
<aside id="sabio" aria-label="Asistente"><div class="saludo-b" id="sabioSaludo"><strong>Hola 👋</strong><br>¿Necesitas ayuda con esta pantalla?<button type="button" aria-label="Cerrar saludo" id="cierraSabio"><i class="bi bi-x-lg"></i></button></div><button class="boton" aria-label="Abrir asistente" id="btnSabio"><i class="bi bi-stars"></i></button></aside>
<dialog class="cmd" id="cmd" aria-label="Buscar páginas y acciones"><input id="cmdQ" type="text" role="combobox" aria-expanded="true" aria-controls="cmdLista" aria-autocomplete="list" placeholder="Escribe una página o acción…" autocomplete="off"><ul id="cmdLista" role="listbox"></ul><div class="cmd-pie"><span><kbd>↑</kbd> <kbd>↓</kbd> navegar</span><span><kbd>↵</kbd> abrir</span><span><kbd>Esc</kbd> cerrar</span></div></dialog>
<div id="toasts" role="status" aria-live="polite"></div>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script>
%%JS%%
</script>
%%SCRIPT%%
</body></html>
'''

for salida, titulo, frag, barra in PAGINAS:
    cuerpo = (SRC / frag).read_text()
    scripts = '\n'.join(re.findall(r'<script>.*?</script>', cuerpo, flags=re.S))
    cuerpo = re.sub(r'<script>.*?</script>', '', cuerpo, flags=re.S)
    html = (PLANTILLA.replace('%%TITULO%%', titulo).replace('%%CSS%%', css).replace('%%CABECERA%%', CABECERA)
            .replace('%%CARDINAL%%', cardinal(barra) if barra else '').replace('%%CUERPO%%', cuerpo)
            .replace('%%JS%%', js).replace('%%SCRIPT%%', scripts))
    (SALIDA / salida).write_text(html)
    print('ok', salida, len(html) // 1024, 'KB')
