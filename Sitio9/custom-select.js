/**
 * Alliance Contact Solutions — Custom Select Dropdown
 * Reemplaza <select> nativos por un componente custom flotante.
 * Vanilla JS · Bilingüe EN/ES · Sin dependencias externas.
 */
(function () {
  'use strict';

  var SVG_ARROW = '<svg class="acs-dd-arrow" viewBox="0 0 12 12" fill="none" ' +
    'xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<path d="M2 4.5l4 4 4-4" stroke="currentColor" stroke-width="1.8" ' +
    'stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* ────────────────────────────────────────────────────
     ESTILOS
  ──────────────────────────────────────────────────── */
  function injectStyles() {

    /* — Estilos base (aplican a todos los formularios) — */
    var base =
      /* Wrapper posicional */
      '.acs-dd{position:relative;}' +

      /* Ocultar el <select> original pero mantenerlo en el DOM para el envío del form */
      '.acs-dd>select{display:none!important;}' +

      /* Trigger: layout universal — el resto lo hereda del contexto */
      '.acs-dd-trigger{' +
        'display:flex!important;align-items:center!important;' +
        'justify-content:space-between!important;gap:.5rem;' +
        'width:100%;text-align:left;cursor:pointer;' +
        'font-family:inherit;line-height:1.4;' +
        '-webkit-appearance:none;appearance:none;' +
      '}' +
      '.acs-dd-text{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}' +

      /* Placeholder: texto semitransparente */
      '.acs-dd-trigger.acs-ph .acs-dd-text{opacity:.4;}' +

      /* Flecha */
      '.acs-dd-arrow{flex-shrink:0;width:12px;height:12px;transition:transform .2s;display:block;}' +
      '.acs-dd-trigger.acs-open .acs-dd-arrow{transform:rotate(180deg);}' +

      /* Panel flotante — siempre claro para legibilidad */
      '.acs-dd-panel{' +
        'position:absolute;top:calc(100% + 3px);left:0;right:0;z-index:9999;' +
        'background:#ffffff;' +
        'border:1.5px solid #1B2A5E;border-radius:.5rem;' +
        'max-height:280px;overflow-y:auto;' +
        'box-shadow:0 8px 28px rgba(27,42,94,.18);' +
        'display:none;' +
      '}' +
      '.acs-dd-panel.acs-open{display:block;animation:acsDDIn .16s ease;}' +
      '@keyframes acsDDIn{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}' +

      /* Scrollbar del panel */
      '.acs-dd-panel::-webkit-scrollbar{width:4px;}' +
      '.acs-dd-panel::-webkit-scrollbar-thumb{background:rgba(27,42,94,.22);border-radius:4px;}' +

      /* Ítems del panel */
      '.acs-dd-item{' +
        'padding:.6rem .95rem;cursor:pointer;' +
        'font-size:.86rem;color:#1B2A5E;line-height:1.4;' +
        'border-bottom:1px solid rgba(27,42,94,.06);' +
        'transition:background .12s;' +
      '}' +
      '.acs-dd-item:last-child{border-bottom:none;}' +
      '.acs-dd-item:hover{background:rgba(27,42,94,.07);}' +
      '.acs-dd-item.acs-sel{background:rgba(27,42,94,.1);font-weight:700;}' +

      /* Estilos de validación espejados al trigger */
      '.acs-dd-trigger.invalid{border-color:rgba(211,38,23,.6)!important;}' +
      '.acs-dd-trigger.error{border-color:var(--red,#d32617)!important;box-shadow:0 0 0 3px rgba(211,38,23,.1)!important;}' +
      '.acs-dd-trigger.valid{border-color:rgba(80,200,120,.5)!important;}' +

      /* form-input (trabaje-con-nosotros.html): solo ajustar layout, el resto lo hereda */
      '.form-input.acs-dd-trigger{display:flex!important;align-items:center!important;justify-content:space-between!important;}';

    appendStyle(base);

    /* — Estilos específicos por página — */
    var pageCSS = '';

    /* index.html: formulario sobre fondo oscuro (navy) */
    if (document.getElementById('f-servicio')) {
      pageCSS +=
        '.f-grp .acs-dd-trigger{' +
          'background:rgba(255,255,255,.06);' +
          'border:1px solid rgba(255,255,255,.1);' +
          'border-radius:.6rem;' +
          'padding:.8rem 1rem;' +
          'font-size:.9rem;' +
          'color:#ffffff;' +
        '}' +
        '.f-grp .acs-dd-trigger:focus,' +
        '.f-grp .acs-dd-trigger.acs-open{' +
          'border-color:#f6b922;' +
          'background:rgba(255,255,255,.09);' +
          'box-shadow:0 4px 20px rgba(201,168,76,.1);' +
          'outline:none;' +
        '}';
    }

    /* precios.html: formulario sobre fondo claro con variables CSS */
    if (document.getElementById('cf-servicio')) {
      pageCSS +=
        '.f-grp .acs-dd-trigger{' +
          'background:var(--bg,#f8f9fc);' +
          'border:1.5px solid var(--border,rgba(27,42,94,.15));' +
          'border-radius:.5rem;' +
          'padding:.7rem .9rem;' +
          'font-size:.87rem;' +
          'color:var(--ink,#0a1640);' +
        '}' +
        '.f-grp .acs-dd-trigger:focus,' +
        '.f-grp .acs-dd-trigger.acs-open{' +
          'border-color:var(--gold,#f6b922);' +
          'background:var(--white,#fff);' +
          'box-shadow:0 0 0 3px rgba(246,185,34,.12);' +
          'outline:none;' +
        '}';
    }

    if (pageCSS) appendStyle(pageCSS);
  }

  function appendStyle(css) {
    var el = document.createElement('style');
    el.textContent = css;
    document.head.appendChild(el);
  }

  /* ────────────────────────────────────────────────────
     HELPERS
  ──────────────────────────────────────────────────── */
  function getLang() {
    return window.currentLang ||
      (typeof localStorage !== 'undefined' && localStorage.getItem('acs_lang')) ||
      'en';
  }

  function optText(option) {
    var lang = getLang();
    var v = option.getAttribute('data-' + lang);
    return (v !== null && v !== '') ? v : option.textContent.trim();
  }

  /* ────────────────────────────────────────────────────
     INICIALIZAR UN SELECT
  ──────────────────────────────────────────────────── */
  function initSelect(sel) {
    if (sel._acsDD) return;
    sel._acsDD = true;

    /* Wrapper */
    var wrap = document.createElement('div');
    wrap.className = 'acs-dd';
    sel.parentNode.insertBefore(wrap, sel);
    wrap.appendChild(sel);

    /* Trigger: copia las clases del <select> para heredar estilos de la página */
    var trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    var origClass = (sel.getAttribute('class') || '').trim();
    trigger.className = (origClass ? origClass + ' ' : '') + 'acs-dd-trigger acs-ph';

    var trigText = document.createElement('span');
    trigText.className = 'acs-dd-text';
    trigger.appendChild(trigText);
    trigger.insertAdjacentHTML('beforeend', SVG_ARROW);
    wrap.insertBefore(trigger, sel);

    /* Panel */
    var panel = document.createElement('div');
    panel.className = 'acs-dd-panel';
    panel.setAttribute('role', 'listbox');
    wrap.appendChild(panel);

    /* ── helpers internos ── */

    function getPlaceholder() {
      var first = sel.options[0];
      if (first && first.value === '') return optText(first);
      return getLang() === 'es' ? 'Selecciona una opción' : 'Select an option';
    }

    function refreshTrigger() {
      var idx = sel.selectedIndex;
      if (idx <= 0 || sel.value === '') {
        trigText.textContent = getPlaceholder();
        trigger.classList.add('acs-ph');
      } else {
        trigText.textContent = optText(sel.options[idx]);
        trigger.classList.remove('acs-ph');
      }
    }

    function buildPanel() {
      panel.innerHTML = '';
      for (var i = 0; i < sel.options.length; i++) {
        var opt = sel.options[i];
        if (opt.value === '' && i === 0) continue; // omitir placeholder
        (function (idx) {
          var item = document.createElement('div');
          item.className = 'acs-dd-item' + (sel.selectedIndex === idx ? ' acs-sel' : '');
          item.setAttribute('role', 'option');
          item.setAttribute('aria-selected', sel.selectedIndex === idx ? 'true' : 'false');
          item.textContent = optText(sel.options[idx]);
          item.addEventListener('click', function () {
            sel.selectedIndex = idx;
            refreshTrigger();
            mirrorValidClasses();
            close();
            sel.dispatchEvent(new Event('change', { bubbles: true }));
          });
          panel.appendChild(item);
        })(i);
      }
    }

    function open() {
      buildPanel();
      panel.classList.add('acs-open');
      trigger.classList.add('acs-open');
      trigger.setAttribute('aria-expanded', 'true');
    }

    function close() {
      panel.classList.remove('acs-open');
      trigger.classList.remove('acs-open');
      trigger.setAttribute('aria-expanded', 'false');
    }

    /* Espeja clases de validación del <select> oculto al trigger visible */
    function mirrorValidClasses() {
      ['invalid', 'valid', 'error'].forEach(function (cls) {
        trigger.classList.toggle(cls, sel.classList.contains(cls));
      });
    }

    /* MutationObserver: reacciona cuando el JS de validación cambia las clases del select */
    if (window.MutationObserver) {
      new MutationObserver(function (mutations) {
        mutations.forEach(function (m) {
          if (m.attributeName === 'class') mirrorValidClasses();
        });
      }).observe(sel, { attributes: true, attributeFilter: ['class'] });
    }

    /* Eventos */
    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      panel.classList.contains('acs-open') ? close() : (closeAll(), open());
    });

    /* Evitar que el clic dentro del panel cierre el dropdown antes de procesar */
    panel.addEventListener('click', function (e) { e.stopPropagation(); });

    /* Navegación por teclado */
    trigger.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        panel.classList.contains('acs-open') ? close() : (closeAll(), open());
      }
    });

    refreshTrigger();

    /* API pública para actualización de idioma */
    sel._acsUpdate = function () {
      refreshTrigger();
      if (panel.classList.contains('acs-open')) buildPanel();
    };
  }

  /* ────────────────────────────────────────────────────
     CERRAR TODOS LOS PANELES
  ──────────────────────────────────────────────────── */
  function closeAll() {
    document.querySelectorAll('.acs-dd-panel.acs-open').forEach(function (p) {
      p.classList.remove('acs-open');
      var t = p.parentElement && p.parentElement.querySelector('.acs-dd-trigger');
      if (t) { t.classList.remove('acs-open'); t.setAttribute('aria-expanded', 'false'); }
    });
  }

  document.addEventListener('click', closeAll);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAll();
  });

  /* ────────────────────────────────────────────────────
     SINCRONIZAR IDIOMA
  ──────────────────────────────────────────────────── */
  function syncLang() {
    document.querySelectorAll('.acs-dd > select').forEach(function (s) {
      if (s._acsUpdate) s._acsUpdate();
    });
  }

  /* Hook en setLang del sitio (encadena sin romper otros hooks como widget-whatsapp.js) */
  if (typeof window.setLang === 'function') {
    var _origSetLang = window.setLang;
    window.setLang = function (lang) {
      _origSetLang(lang);
      syncLang();
    };
  }

  /* ────────────────────────────────────────────────────
     INICIALIZAR
  ──────────────────────────────────────────────────── */
  function init() {
    injectStyles();
    document.querySelectorAll('select').forEach(initSelect);
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();

})();
