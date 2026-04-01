/**
 * Alliance Contact Solutions — Guided WhatsApp Chat Widget v3
 * Vanilla JS · No external dependencies · Bilingual EN/ES
 */
(function () {
  'use strict';

  var WA_NUMBER = '573206742348';

  /* ─────────────────────────────────────────
     TRANSLATIONS
  ───────────────────────────────────────── */
  var T = {
    en: {
      header_name:    'Alliance Assistant',
      header_status:  'Online · Immediate response',
      tooltip:        'Talk to us!',
      wa_btn:         'Open WhatsApp',
      wa_note:        'Redirects to WhatsApp · Free',
      greeting:       "Hello! I'm the Alliance assistant 👋 Tell me a bit about your operation so I can connect you with the ideal advisor.",
      start:          'Start',
      name_q:         'What is your full name?',
      name_ph:        'Your full name...',
      empresa_q:      'What company do you work for?',
      empresa_ph:     'Your company name...',
      servicio_q:     'What service are you looking for?',
      servicio_opts:  [
        'Inbound Customer Support',
        'Collections & Portfolio Management',
        'Technical Support',
        'Appointment Scheduling',
        'Surveys & Loyalty',
        'Full BPO / Multiple Campaigns',
        "I'm not sure yet"
      ],
      agentes_q:      'How many agents do you need approximately?',
      agentes_opts:   [
        '1 – 2 agents',
        '3 – 10 agents',
        '11 – 20 agents',
        '21 – 100 agents',
        'More than 100 agents',
        'Just exploring'
      ],
      closing:        'Perfect {name}! An Alliance advisor will attend to you immediately 🚀',
      msg_service:    'I am looking for the service of: {v}.',
      msg_service_u:  "I'm not sure yet what service I need.",
      msg_agents:     'I need approximately {v}.',
      msg_agents_u:   'I am in the exploration phase, no defined number of agents.',
      msg_full:       'Hello, I am {name} from {empresa}. {s} {a} I would like to receive more information and a proposal.'
    },
    es: {
      header_name:    'Alliance Asistente',
      header_status:  'En línea · Respuesta inmediata',
      tooltip:        '¡Habla con nosotros!',
      wa_btn:         'Abrir WhatsApp',
      wa_note:        'Te redirigirá a WhatsApp · Gratis',
      greeting:       '¡Hola! Soy el asistente de Alliance 👋 Cuéntame un poco sobre tu operación para conectarte con el asesor ideal.',
      start:          'Comenzar',
      name_q:         '¿Cuál es tu nombre completo?',
      name_ph:        'Tu nombre completo...',
      empresa_q:      '¿Con qué empresa trabajas?',
      empresa_ph:     'Nombre de tu empresa...',
      servicio_q:     '¿Qué servicio estás buscando?',
      servicio_opts:  [
        'Atención al Cliente (Inbound)',
        'Cobranzas y Gestión de Cartera',
        'Soporte Técnico',
        'Agendamiento de Citas',
        'Encuestas y Fidelización',
        'BPO Completo / Múltiples Campañas',
        'No estoy seguro aún'
      ],
      agentes_q:      '¿Cuántos agentes necesitas aproximadamente?',
      agentes_opts:   [
        '1 – 2 agentes',
        '3 – 10 agentes',
        '11 – 20 agentes',
        '21 – 100 agentes',
        'Más de 100 agentes',
        'Solo estoy explorando'
      ],
      closing:        '¡Perfecto {name}! Un asesor de Alliance te atenderá de inmediato 🚀',
      msg_service:    'Estoy buscando el servicio de: {v}.',
      msg_service_u:  'Aún no tengo claro qué servicio necesito.',
      msg_agents:     'Necesito aproximadamente {v}.',
      msg_agents_u:   'Estoy en fase de exploración, sin número de agentes definido.',
      msg_full:       'Hola, soy {name} de {empresa}. {s} {a} Me gustaría recibir más información y una propuesta.'
    }
  };

  /* "Uncertain" option is always the LAST item in each list */
  var TOTAL_STEPS = 4;

  var state = {
    open: false,
    started: false,
    lang: 'en',              // idioma bloqueado al iniciar la conversación
    step: 0,
    name: '',
    empresa: '',
    servicio: '',
    servicio_uncertain: false,
    agentes: '',
    agentes_uncertain: false,
    currentOptionsCb: null
  };

  /* ─────────────────────────────────────────
     LANG HELPER
  ───────────────────────────────────────── */
  function getLang() {
    return window.currentLang ||
      (typeof localStorage !== 'undefined' && localStorage.getItem('acs_lang')) ||
      'en';
  }


  /* ─────────────────────────────────────────
     STYLES
  ───────────────────────────────────────── */
  function injectStyles() {
    var css = [
      '#acs-widget,#acs-widget *{box-sizing:border-box;margin:0;padding:0;font-family:"Cabinet Grotesk",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;}',
      '#acs-widget{position:fixed;bottom:1.5rem;right:1.5rem;z-index:2000;display:flex;flex-direction:column;align-items:flex-end;gap:.75rem;opacity:0;transform:translateY(24px) scale(.88);transition:opacity .45s cubic-bezier(.16,1,.3,1),transform .45s cubic-bezier(.16,1,.3,1);pointer-events:none;}',
      '#acs-widget.acs-visible{opacity:1;transform:translateY(0) scale(1);pointer-events:all;}',
      '#acs-win{width:300px;max-width:calc(100vw - 3rem);background:#f5f7fc;border-radius:16px;box-shadow:0 12px 40px rgba(10,22,64,.2),0 2px 10px rgba(0,0,0,.08);display:flex;flex-direction:column;overflow:hidden;opacity:0;transform:translateY(14px) scale(.97);transition:opacity .32s cubic-bezier(.16,1,.3,1),transform .32s cubic-bezier(.16,1,.3,1);pointer-events:none;}',
      '#acs-win.acs-open{opacity:1;transform:translateY(0) scale(1);pointer-events:all;}',
      '#acs-header{background:linear-gradient(145deg,#081d6a 0%,#0f2689 50%,#1a3cb0 100%);padding:.75rem 1rem;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;position:relative;overflow:hidden;}',
      '#acs-header::after{content:"";position:absolute;top:-30px;right:-20px;width:120px;height:120px;border-radius:50%;background:rgba(246,185,34,.06);pointer-events:none;}',
      '#acs-header::before{content:"";position:absolute;bottom:-40px;left:-10px;width:100px;height:100px;border-radius:50%;background:rgba(255,255,255,.03);pointer-events:none;}',
      '.acs-hinfo{display:flex;align-items:center;gap:.75rem;position:relative;z-index:1;}',
      '.acs-avatar{width:38px;height:38px;border-radius:50%;background:linear-gradient(145deg,#f6b922 0%,#db711c 100%);display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:900;color:#fff;flex-shrink:0;letter-spacing:.03em;border:2px solid rgba(255,255,255,.25);box-shadow:0 3px 10px rgba(0,0,0,.22);}',
      '.acs-htxt{display:flex;flex-direction:column;gap:2px;}',
      '.acs-htxt strong{font-size:.9rem;font-weight:800;color:#fff;letter-spacing:.02em;line-height:1.1;}',
      '.acs-htxt span{font-size:.64rem;color:rgba(255,255,255,.6);display:flex;align-items:center;gap:.35rem;}',
      '.acs-dot{width:7px;height:7px;border-radius:50%;background:#25D366;display:inline-block;box-shadow:0 0 6px rgba(37,211,102,.8);animation:acsLive 1.8s infinite;}',
      '@keyframes acsLive{0%{box-shadow:0 0 0 0 rgba(37,211,102,.7)}70%{box-shadow:0 0 0 7px transparent}100%{box-shadow:0 0 0 0 transparent}}',
      '#acs-x{position:relative;z-index:1;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);color:rgba(255,255,255,.75);width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:.78rem;display:flex;align-items:center;justify-content:center;transition:all .2s;flex-shrink:0;line-height:1;backdrop-filter:blur(4px);}',
      '#acs-x:hover{background:rgba(255,255,255,.22);color:#fff;transform:scale(1.1);}',
      '#acs-prog-wrap{height:3px;background:rgba(255,255,255,.1);flex-shrink:0;}',
      '#acs-prog-fill{height:100%;background:linear-gradient(90deg,#f6b922,#ffd060);width:0%;transition:width .55s cubic-bezier(.16,1,.3,1);border-radius:0 3px 3px 0;}',
      '#acs-msgs{min-height:60px;max-height:260px;overflow-y:auto;padding:.9rem .85rem;display:flex;flex-direction:column;gap:.5rem;background:#eef1f9;scroll-behavior:smooth;}',
      '#acs-msgs::-webkit-scrollbar{width:5px;}',
      '#acs-msgs::-webkit-scrollbar-track{background:rgba(10,22,64,.05);border-radius:4px;}',
      '#acs-msgs::-webkit-scrollbar-thumb{background:rgba(15,38,137,.35);border-radius:4px;}',
      '#acs-msgs::-webkit-scrollbar-thumb:hover{background:rgba(15,38,137,.6);}',
      '.acs-bot-row{display:flex;align-items:flex-end;gap:.5rem;align-self:flex-start;max-width:88%;}',
      '.acs-bot-av{width:26px;height:26px;border-radius:50%;background:linear-gradient(145deg,#f6b922,#db711c);display:flex;align-items:center;justify-content:center;font-size:.55rem;font-weight:900;color:#fff;flex-shrink:0;margin-bottom:1px;}',
      '.acs-bot{padding:.65rem .95rem;border-radius:16px 16px 16px 4px;font-size:.83rem;line-height:1.58;background:#ffffff;color:#0a1640;box-shadow:0 2px 8px rgba(10,22,64,.09);animation:acsMsgIn .32s cubic-bezier(.16,1,.3,1) forwards;opacity:0;}',
      '@keyframes acsMsgIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}',
      '.acs-usr{max-width:80%;padding:.65rem .95rem;border-radius:16px 16px 4px 16px;font-size:.83rem;line-height:1.58;background:linear-gradient(135deg,#f6b922 0%,#db711c 100%);color:#3d1f00;font-weight:600;align-self:flex-end;box-shadow:0 3px 12px rgba(219,113,28,.35);animation:acsMsgIn .32s cubic-bezier(.16,1,.3,1) forwards;opacity:0;}',
      '.acs-typing-row{display:flex;align-items:flex-end;gap:.5rem;align-self:flex-start;}',
      '.acs-typing{padding:.65rem .9rem;background:#fff;border-radius:16px 16px 16px 4px;display:flex;gap:5px;align-items:center;box-shadow:0 2px 8px rgba(10,22,64,.09);animation:acsMsgIn .32s cubic-bezier(.16,1,.3,1) forwards;opacity:0;}',
      '.acs-typing span{width:7px;height:7px;border-radius:50%;background:rgba(10,22,64,.2);animation:acsBounce 1.2s infinite;}',
      '.acs-typing span:nth-child(2){animation-delay:.18s;}',
      '.acs-typing span:nth-child(3){animation-delay:.36s;}',
      '@keyframes acsBounce{0%,60%,100%{transform:translateY(0);opacity:.35}30%{transform:translateY(-5px);opacity:1}}',
      '.acs-opts{display:flex;flex-direction:column;gap:.38rem;align-self:stretch;animation:acsMsgIn .38s .06s cubic-bezier(.16,1,.3,1) forwards;opacity:0;}',
      '.acs-opt{background:#fff;border:1.5px solid rgba(15,38,137,.15);color:#0f2689;padding:.58rem 1rem;border-radius:10px;font-size:.8rem;font-weight:700;text-align:left;cursor:pointer;transition:all .22s cubic-bezier(.16,1,.3,1);display:flex;align-items:center;gap:.6rem;box-shadow:0 1px 4px rgba(10,22,64,.06);}',
      '.acs-opt-icon{width:7px;height:7px;border-radius:50%;background:#f6b922;flex-shrink:0;transition:transform .22s;}',
      '.acs-opt:hover{background:#0f2689;border-color:#0f2689;color:#fff;transform:translateX(5px);box-shadow:0 4px 16px rgba(15,38,137,.25);}',
      '.acs-opt:hover .acs-opt-icon{background:#f6b922;transform:scale(1.4);}',
      '.acs-opt-arrow{margin-left:auto;font-size:.75rem;color:rgba(15,38,137,.3);transition:all .22s;flex-shrink:0;}',
      '.acs-opt:hover .acs-opt-arrow{color:rgba(255,255,255,.6);transform:translateX(3px);}',
      '#acs-inp-area{padding:.8rem 1rem;background:#fff;border-top:1px solid rgba(10,22,64,.07);display:none;gap:.5rem;flex-shrink:0;align-items:center;}',
      '#acs-inp-area.acs-show{display:flex;}',
      '#acs-inp{flex:1;border:1.5px solid rgba(15,38,137,.14);border-radius:10px;padding:.6rem .9rem;font-size:.83rem;color:#0a1640;outline:none;transition:border-color .22s,box-shadow .22s;font-family:inherit;background:#f8f9fd;}',
      '#acs-inp:focus{border-color:#0f2689;background:#fff;box-shadow:0 0 0 3px rgba(15,38,137,.08);}',
      '#acs-send{background:linear-gradient(135deg,#0f2689,#244bb9);color:#fff;border:none;border-radius:10px;padding:.6rem 1rem;font-size:.82rem;font-weight:700;cursor:pointer;transition:all .22s;flex-shrink:0;display:flex;align-items:center;gap:.35rem;}',
      '#acs-send:hover{background:linear-gradient(135deg,#244bb9,#0f2689);transform:scale(1.05);box-shadow:0 4px 14px rgba(15,38,137,.35);}',
      '#acs-footer{padding:.7rem .9rem;background:#fff;border-top:1px solid rgba(10,22,64,.07);flex-shrink:0;display:none;}',
      '#acs-footer.acs-show{display:block;}',
      '.acs-wa-btn{display:flex;align-items:center;justify-content:center;gap:.6rem;background:linear-gradient(135deg,#25D366,#1aaa52);color:#fff;border:none;border-radius:12px;padding:.9rem 1.2rem;font-size:.92rem;font-weight:800;cursor:pointer;width:100%;transition:all .28s cubic-bezier(.16,1,.3,1);letter-spacing:.03em;text-decoration:none;box-shadow:0 4px 20px rgba(37,211,102,.4);}',
      '.acs-wa-btn:hover{background:linear-gradient(135deg,#1aaa52,#128C7E);transform:translateY(-2px);box-shadow:0 8px 28px rgba(37,211,102,.55);}',
      '.acs-wa-btn:active{transform:translateY(0);}',
      '.acs-wa-btn svg{width:21px;height:21px;fill:#fff;flex-shrink:0;}',
      '.acs-wa-note{text-align:center;font-size:.62rem;color:rgba(10,22,64,.35);margin-top:.5rem;letter-spacing:.03em;}',
      '#acs-bar{display:flex;align-items:center;gap:.65rem;}',
      '#acs-tip{background:#fff;color:#0a1640;font-size:.73rem;font-weight:700;letter-spacing:.04em;padding:.45rem .9rem;border-radius:8px;box-shadow:0 4px 20px rgba(10,22,64,.15),0 1px 4px rgba(0,0,0,.06);white-space:nowrap;opacity:0;transform:translateX(10px);transition:opacity .28s,transform .28s;pointer-events:none;border-left:3px solid #25D366;}',
      '#acs-widget:hover #acs-tip{opacity:1;transform:translateX(0);}',
      '#acs-widget.acs-chat-open #acs-tip{opacity:0!important;}',
      '#acs-btn{width:60px;height:60px;border-radius:50%;background:linear-gradient(145deg,#25D366,#1aaa52);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 28px rgba(37,211,102,.5),0 2px 8px rgba(0,0,0,.12);transition:transform .32s cubic-bezier(.16,1,.3,1),box-shadow .32s;position:relative;flex-shrink:0;}',
      '#acs-btn:hover{transform:scale(1.12);box-shadow:0 10px 36px rgba(37,211,102,.65),0 3px 12px rgba(0,0,0,.15);}',
      '#acs-btn svg{width:30px;height:30px;fill:#fff;display:block;}',
      '#acs-btn::before{content:"";position:absolute;inset:0;border-radius:50%;background:#25D366;animation:acsPulse 2.4s ease-out infinite;z-index:-1;}',
      '@keyframes acsPulse{0%{transform:scale(1);opacity:.55}70%{transform:scale(1.7);opacity:0}100%{transform:scale(1.7);opacity:0}}',
      '#acs-badge{position:absolute;top:-4px;right:-4px;width:20px;height:20px;background:linear-gradient(135deg,#d32617,#f04030);border-radius:50%;border:2.5px solid #fff;display:flex;align-items:center;justify-content:center;font-size:.58rem;font-weight:900;color:#fff;transition:transform .32s cubic-bezier(.16,1,.3,1),opacity .32s;box-shadow:0 2px 8px rgba(211,38,23,.4);}',
      '#acs-badge.acs-hide{transform:scale(0);opacity:0;}',
      '@media(max-width:600px){#acs-widget{bottom:1rem;right:1rem;}#acs-win{width:calc(100vw - 2rem);max-width:calc(100vw - 2rem);}#acs-msgs{max-height:50vh;}#acs-btn{width:54px;height:54px;}#acs-btn svg{width:27px;height:27px;}}'
    ].join('');

    var s = document.createElement('style');
    s.textContent = css;
    document.head.appendChild(s);
  }

  /* ─────────────────────────────────────────
     SVG ICONS
  ───────────────────────────────────────── */
  var SVG_WA = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';

  var SVG_SEND = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="width:16px;height:16px;fill:#fff;flex-shrink:0"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>';

  /* ─────────────────────────────────────────
     BUILD DOM
  ───────────────────────────────────────── */
  function buildDOM() {
    var w = document.createElement('div');
    w.id = 'acs-widget';
    w.innerHTML =
      '<div id="acs-win" role="dialog" aria-modal="true">' +
        '<div id="acs-header">' +
          '<div class="acs-hinfo">' +
            '<div class="acs-avatar">AC</div>' +
            '<div class="acs-htxt">' +
              '<strong id="acs-hname" data-en="Alliance Assistant" data-es="Alliance Asistente">Alliance Assistant</strong>' +
              '<span><i class="acs-dot"></i><span id="acs-hstatus" data-en="Online &middot; Immediate response" data-es="En l&iacute;nea &middot; Respuesta inmediata">Online &middot; Immediate response</span></span>' +
            '</div>' +
          '</div>' +
          '<button id="acs-x" aria-label="Close">&#x2715;</button>' +
        '</div>' +
        '<div id="acs-prog-wrap"><div id="acs-prog-fill"></div></div>' +
        '<div id="acs-msgs" aria-live="polite"></div>' +
        '<div id="acs-inp-area">' +
          '<input id="acs-inp" type="text" placeholder="Your full name..." maxlength="60" autocomplete="off"/>' +
          '<button id="acs-send">' + SVG_SEND + '</button>' +
        '</div>' +
        '<div id="acs-footer">' +
          '<a id="acs-wa-link" class="acs-wa-btn" href="#" target="_blank" rel="noopener noreferrer">' +
            SVG_WA + ' <span id="acs-wa-label" data-en="Open WhatsApp" data-es="Abrir WhatsApp">Open WhatsApp</span>' +
          '</a>' +
          '<p class="acs-wa-note" id="acs-wa-note" data-en="Redirects to WhatsApp &middot; Free" data-es="Te redirigir&aacute; a WhatsApp &middot; Gratis">Redirects to WhatsApp &middot; Free</p>' +
        '</div>' +
      '</div>' +
      '<div id="acs-bar">' +
        '<div id="acs-tip" data-en="Talk to us!" data-es="&iexcl;Habla con nosotros!">Talk to us!</div>' +
        '<button id="acs-btn" aria-label="Open WhatsApp chat">' +
          SVG_WA +
          '<span id="acs-badge">1</span>' +
        '</button>' +
      '</div>';
    document.body.appendChild(w);
  }

  /* ─────────────────────────────────────────
     PROGRESS BAR
  ───────────────────────────────────────── */
  function updateProgress(step) {
    var pct = step === 0 ? 0 : Math.round((step / TOTAL_STEPS) * 100);
    var fill = document.getElementById('acs-prog-fill');
    if (fill) fill.style.width = pct + '%';
  }

  /* ─────────────────────────────────────────
     CHAT HELPERS
  ───────────────────────────────────────── */
  function scrollBottom() {
    var m = document.getElementById('acs-msgs');
    m.scrollTop = m.scrollHeight;
  }

  function addTyping() {
    var m = document.getElementById('acs-msgs');
    var row = document.createElement('div');
    row.className = 'acs-typing-row';
    row.innerHTML =
      '<div class="acs-bot-av">AC</div>' +
      '<div class="acs-typing"><span></span><span></span><span></span></div>';
    m.appendChild(row);
    scrollBottom();
    return row;
  }

  function botMsg(text, delay) {
    return new Promise(function (resolve) {
      var row = addTyping();
      setTimeout(function () {
        row.remove();
        var msgRow = document.createElement('div');
        msgRow.className = 'acs-bot-row';
        msgRow.innerHTML = '<div class="acs-bot-av">AC</div><div class="acs-bot"></div>';
        msgRow.querySelector('.acs-bot').textContent = text;
        document.getElementById('acs-msgs').appendChild(msgRow);
        scrollBottom();
        resolve();
      }, delay || 800);
    });
  }

  function userMsg(text) {
    var el = document.createElement('div');
    el.className = 'acs-usr';
    el.textContent = text;
    document.getElementById('acs-msgs').appendChild(el);
    scrollBottom();
  }

  function showOptions(options, cb) {
    state.currentOptionsCb = cb;
    var m = document.getElementById('acs-msgs');
    var wrap = document.createElement('div');
    wrap.className = 'acs-opts';
    options.forEach(function (opt) {
      var btn = document.createElement('button');
      btn.className = 'acs-opt';
      btn.innerHTML =
        '<span class="acs-opt-icon"></span>' +
        '<span>' + opt + '</span>' +
        '<span class="acs-opt-arrow">›</span>';
      btn.addEventListener('click', function () {
        wrap.remove();
        state.currentOptionsCb = null;
        cb(opt);
      });
      wrap.appendChild(btn);
    });
    m.appendChild(wrap);
    scrollBottom();
  }

  function showInput(placeholder) {
    var inp = document.getElementById('acs-inp');
    inp.placeholder = placeholder || '';
    inp.value = '';
    document.getElementById('acs-inp-area').classList.add('acs-show');
    setTimeout(function () { inp.focus(); }, 80);
  }

  function hideInput() {
    document.getElementById('acs-inp-area').classList.remove('acs-show');
    document.getElementById('acs-inp').value = '';
  }

  function showWAButton() {
    var tr = T[state.lang] || T['en'];

    var servicePart = state.servicio_uncertain
      ? tr.msg_service_u
      : tr.msg_service.replace('{v}', state.servicio);

    var agentsPart = state.agentes_uncertain
      ? tr.msg_agents_u
      : tr.msg_agents.replace('{v}', state.agentes);

    var msg = tr.msg_full
      .replace('{name}',    state.name)
      .replace('{empresa}', state.empresa)
      .replace('{s}',       servicePart)
      .replace('{a}',       agentsPart);

    var link = document.getElementById('acs-wa-link');
    link.href = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg);
    link.addEventListener('click', function () { setTimeout(closeChat, 2000); });

    document.getElementById('acs-footer').classList.add('acs-show');
    scrollBottom();
  }

  /* ─────────────────────────────────────────
     CONVERSATION FLOW
  ───────────────────────────────────────── */
  function runStep(n) {
    state.step = n;
    updateProgress(n);

    if (n === 0) {
      // Paso 0: usar el idioma actual del sitio (aún no bloqueado)
      var lang0 = getLang();
      var tr0 = T[lang0] || T['en'];
      botMsg(tr0.greeting, 600).then(function () {
        showOptions([tr0.start], function () {
          // Bloquear el idioma en el momento que el usuario hace clic en "Start"
          state.lang = getLang();
          userMsg(T[state.lang].start);
          runStep(1);
        });
      });
      return;
    }

    var tr = T[state.lang] || T['en'];
    if (n === 1) {
      botMsg(tr.name_q, 700).then(function () { showInput(tr.name_ph); });
      return;
    }
    if (n === 2) {
      botMsg(tr.empresa_q, 700).then(function () { showInput(tr.empresa_ph); });
      return;
    }
    if (n === 3) {
      botMsg(tr.servicio_q, 700).then(function () {
        var opts = tr.servicio_opts;
        showOptions(opts, function (v) {
          state.servicio = v;
          state.servicio_uncertain = (v === opts[opts.length - 1]);
          userMsg(v);
          runStep(4);
        });
      });
      return;
    }
    if (n === 4) {
      botMsg(tr.agentes_q, 700).then(function () {
        var opts = tr.agentes_opts;
        showOptions(opts, function (v) {
          state.agentes = v;
          state.agentes_uncertain = (v === opts[opts.length - 1]);
          userMsg(v);
          runStep(5);
        });
      });
      return;
    }
    if (n === 5) {
      updateProgress(TOTAL_STEPS);
      var closing = tr.closing.replace('{name}', state.name);
      botMsg(closing, 900).then(showWAButton);
    }
  }

  function handleSend() {
    var inp = document.getElementById('acs-inp');
    var val = inp.value.trim();
    if (!val) { inp.focus(); return; }

    if (state.step === 1) {
      state.name = val;
      hideInput();
      userMsg(val);
      runStep(2);
    } else if (state.step === 2) {
      state.empresa = val;
      hideInput();
      userMsg(val);
      runStep(3);
    }
  }

  /* ─────────────────────────────────────────
     OPEN / CLOSE / RESET
  ───────────────────────────────────────── */
  function openChat() {
    state.open = true;
    document.getElementById('acs-win').classList.add('acs-open');
    document.getElementById('acs-widget').classList.add('acs-chat-open');
    document.getElementById('acs-badge').classList.add('acs-hide');
    if (!state.started) {
      state.started = true;
      setTimeout(function () { runStep(0); }, 220);
    }
  }

  function closeChat() {
    state.open = false;
    document.getElementById('acs-win').classList.remove('acs-open');
    document.getElementById('acs-widget').classList.remove('acs-chat-open');
  }

  function resetChat() {
    document.getElementById('acs-msgs').innerHTML = '';
    document.getElementById('acs-footer').classList.remove('acs-show');
    document.getElementById('acs-inp-area').classList.remove('acs-show');
    document.getElementById('acs-inp').value = '';
    document.getElementById('acs-prog-fill').style.width = '0%';
    state.started = false;
    state.step = 0;
    state.name = '';
    state.empresa = '';
    state.servicio = '';
    state.servicio_uncertain = false;
    state.agentes = '';
    state.agentes_uncertain = false;
  }

  /* ─────────────────────────────────────────
     SCROLL VISIBILITY
  ───────────────────────────────────────── */
  function initVisibility() {
    var shown = false;
    function check() {
      var y = window.scrollY || window.pageYOffset;
      if (!shown && y > 100) {
        document.getElementById('acs-widget').classList.add('acs-visible');
        shown = true;
      } else if (shown && y <= 100) {
        document.getElementById('acs-widget').classList.remove('acs-visible');
        shown = false;
      }
    }
    window.addEventListener('scroll', check, { passive: true });
    check();
  }

  /* ─────────────────────────────────────────
     INIT
  ───────────────────────────────────────── */
  function init() {
    injectStyles();
    buildDOM();

    document.getElementById('acs-btn').addEventListener('click', function () {
      if (state.open) { closeChat(); } else { openChat(); }
    });
    document.getElementById('acs-x').addEventListener('click', function () {
      closeChat();
      resetChat();
    });
    document.getElementById('acs-send').addEventListener('click', handleSend);
    document.getElementById('acs-inp').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { handleSend(); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && state.open) { closeChat(); }
    });

    /* Hook into the site's setLang so the widget updates automatically */
    if (typeof window.setLang === 'function') {
      var _orig = window.setLang;
      window.setLang = function (lang) {
        _orig(lang);
        syncStaticText();
      };
    }

    initVisibility();
  }

  /* Update static DOM text when language changes */
  function syncStaticText() {
    var lang = getLang();
    state.lang = lang; // actualizar idioma activo en cada cambio

    // Elementos estáticos con data-en / data-es
    var ids = ['acs-hname','acs-hstatus','acs-tip','acs-wa-label','acs-wa-note'];
    ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      var val = el.getAttribute('data-' + lang);
      if (val) el.innerHTML = val;
    });

    // Si estamos en el saludo (paso 0), re-renderizar todo en el nuevo idioma
    if (state.step === 0 && state.started) {
      var trG = T[lang] || T['en'];
      document.getElementById('acs-msgs').innerHTML = '';
      state.currentOptionsCb = null;
      botMsg(trG.greeting, 300).then(function () {
        showOptions([trG.start], function () {
          state.lang = getLang();
          userMsg(T[state.lang].start);
          runStep(1);
        });
      });
      return;
    }

    // Opciones activas en conversación en curso: usar idioma bloqueado
    var optsWrap = document.querySelector('#acs-msgs .acs-opts');
    if (optsWrap && state.currentOptionsCb) {
      var tr = T[state.lang] || T['en'];
      var newOpts;
      if      (state.step === 3) newOpts = tr.servicio_opts;
      else if (state.step === 4) newOpts = tr.agentes_opts;

      if (newOpts) {
        var cb = state.currentOptionsCb;
        optsWrap.innerHTML = '';
        newOpts.forEach(function (opt) {
          var btn = document.createElement('button');
          btn.className = 'acs-opt';
          btn.innerHTML =
            '<span class="acs-opt-icon"></span>' +
            '<span>' + opt + '</span>' +
            '<span class="acs-opt-arrow">›</span>';
          btn.addEventListener('click', function () {
            optsWrap.remove();
            state.currentOptionsCb = null;
            cb(opt);
          });
          optsWrap.appendChild(btn);
        });
      }
    }

    // Placeholder del input activo: usar idioma bloqueado
    var inpArea = document.getElementById('acs-inp-area');
    if (inpArea && inpArea.classList.contains('acs-show')) {
      var tr2 = T[state.lang] || T['en'];
      var inp = document.getElementById('acs-inp');
      if      (state.step === 1) inp.placeholder = tr2.name_ph;
      else if (state.step === 2) inp.placeholder = tr2.empresa_ph;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
