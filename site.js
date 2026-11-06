/* ==========================================================================
   Salam Immobilier Bouaké · page interactions
   - Bar solid state + mobile dock visibility
   - Architect's datum rule (elevation marker + live meter readout)
   - Paper ground inversion class for datum contrast
   - Verification stamps triggered on entry
   - Service card "Choisir ce service" -> selects radio in WhatsApp builder
   - WhatsApp message composer + direct wa.me opener
   ========================================================================== */

(function () {
  'use strict';

  var WA_PHONE = '2250142200909';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- year ---------------------------------------------------------------
  var yEl = document.querySelector('[data-year]');
  if (yEl) yEl.textContent = String(new Date().getFullYear());

  // ---- pointer parallax for layered hero (fine pointer only) --------------
  if (!reduce && window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var tx = 0, ty = 0, cx = 0, cy = 0, rafId = 0;
    var root = document.documentElement;
    function stepPointer() {
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      root.style.setProperty('--mx', cx.toFixed(4));
      root.style.setProperty('--my', cy.toFixed(4));
      if (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) {
        rafId = requestAnimationFrame(stepPointer);
      } else {
        rafId = 0;
      }
    }
    window.addEventListener('pointermove', function (e) {
      if (window.scrollY > window.innerHeight * 2.2) return;
      tx = (e.clientX / Math.max(window.innerWidth, 1) - 0.5) * 2;
      ty = (e.clientY / Math.max(window.innerHeight, 1) - 0.5) * 2;
      if (!rafId) rafId = requestAnimationFrame(stepPointer);
    }, { passive: true });
  }

  // ---- service cards stagger index ---------------------------------------
  var cards = document.querySelectorAll('.svc .card');
  Array.prototype.forEach.call(cards, function (c, i) {
    c.style.setProperty('--i', String(i * 0.14));
  });

  // ---- datum rule, bar state, mobile dock, and light-ground inversion -----
  var bar = document.querySelector('.bar');
  var dock = document.querySelector('.dock');
  var datum = document.querySelector('.datum');
  var marker = document.querySelector('.datum__marker');
  var readEl = document.querySelector('.datum__read');
  var datumLinks = datum ? Array.prototype.slice.call(datum.querySelectorAll('a[data-lvl]')) : [];
  var papersSec = document.getElementById('papiers');
  var contactSec = document.getElementById('contact');
  var heroSec = document.getElementById('accueil');
  var heroStage = heroSec ? heroSec.querySelector('.hero__stage') : null;
  var svcSec = document.getElementById('services');
  var svcStage = svcSec ? svcSec.querySelector('.svc__stage') : null;

  var stops = datumLinks.map(function (a) {
    var id = (a.getAttribute('href') || '').replace('#', '');
    return {
      a: a,
      el: document.getElementById(id),
      lvl: parseFloat(a.getAttribute('data-lvl')) || 0
    };
  });

  function formatMeters(v) {
    var n = Math.max(0, v);
    var s = n.toFixed(2).replace('.', ',');
    return (n < 0.02 ? '±' : '+') + s;
  }

  function onScroll() {
    var y = window.scrollY || window.pageYOffset || 0;
    var vh = window.innerHeight || 1;
    var maxScroll = Math.max((document.documentElement.scrollHeight || 1) - vh, 1);
    var t = Math.min(1, Math.max(0, y / maxScroll));

    if (bar) {
      bar.classList.toggle('is-solid', y > vh * 0.18);
    }

    if (heroSec && heroStage) {
      var hp = parseFloat(heroSec.style.getPropertyValue('--sc-p')) || 0;
      heroStage.setAttribute('data-sc-verify-state', reduce ? 'hero:static' : 'hero:' + (Math.round(hp * 20) / 20).toFixed(2));
      if (reduce) heroStage.setAttribute('data-sc-verify-hold', 'true');
      else heroStage.removeAttribute('data-sc-verify-hold');
    }
    if (svcSec && svcStage) {
      var sp = parseFloat(svcSec.style.getPropertyValue('--sc-p')) || 0;
      svcStage.setAttribute('data-sc-verify-state', reduce ? 'svc:static' : 'svc:' + (Math.round(sp * 20) / 20).toFixed(2));
      if (reduce) svcStage.setAttribute('data-sc-verify-hold', 'true');
      else svcStage.removeAttribute('data-sc-verify-hold');
    }

    if (dock && heroSec && contactSec) {
      var heroBottom = heroSec.getBoundingClientRect().bottom;
      var contactTop = contactSec.getBoundingClientRect().top;
      var showDock = heroBottom < vh * 0.35 && contactTop > vh * 0.55;
      dock.classList.toggle('is-on', showDock);
      dock.setAttribute('aria-hidden', showDock ? 'false' : 'true');
      dock.tabIndex = showDock ? 0 : -1;
    }

    if (papersSec) {
      var pr = papersSec.getBoundingClientRect();
      var onLight = pr.top < vh * 0.55 && pr.bottom > vh * 0.45;
      document.body.classList.toggle('on-light', onLight);
    }

    if (datum && marker && readEl && stops.length) {
      var h = datum.clientHeight || 1;
      // Marker rises from bottom (t=0) to top (t=1)
      var my = (1 - t) * (h - 14);
      marker.style.transform = 'translate3d(0,' + my.toFixed(1) + 'px,0)';

      // Interpolate architect elevation reading from section stops
      var curIdx = 0;
      var midY = y + vh * 0.42;
      for (var i = 0; i < stops.length; i++) {
        var st = stops[i];
        if (!st.el) continue;
        var top = st.el.getBoundingClientRect().top + y;
        if (midY >= top) curIdx = i;
      }
      var sA = stops[curIdx];
      var sB = stops[Math.min(curIdx + 1, stops.length - 1)];
      var lvl = sA.lvl;
      if (sB && sB !== sA && sA.el && sB.el) {
        var topA = sA.el.getBoundingClientRect().top + y;
        var topB = sB.el.getBoundingClientRect().top + y;
        var frac = Math.min(1, Math.max(0, (midY - topA) / Math.max(topB - topA, 1)));
        lvl = sA.lvl + (sB.lvl - sA.lvl) * frac;
      }
      readEl.textContent = formatMeters(lvl);

      for (var j = 0; j < stops.length; j++) {
        stops[j].a.classList.toggle('is-on', j === curIdx);
      }
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();

  // ---- verification stamps on the paper checklist -------------------------
  var checks = document.querySelectorAll('.check');
  if ('IntersectionObserver' in window) {
    var stampIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-stamped');
          stampIO.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -18% 0px', threshold: 0.4 });
    Array.prototype.forEach.call(checks, function (ch) { stampIO.observe(ch); });
  } else {
    Array.prototype.forEach.call(checks, function (ch) { ch.classList.add('is-stamped'); });
  }

  // ---- WhatsApp message builder ------------------------------------------
  var form = document.getElementById('wa-form');
  var msgOut = document.querySelector('.wa__msg');
  var waLinks = document.querySelectorAll('[data-wa]');

  var intentPhrases = {
    terrain: 'acheter un terrain en lotissement à Bouaké',
    maison: 'acheter une maison à Bouaké',
    location: 'louer une maison ou un appartement à Bouaké',
    gerance: 'vous confier la gestion locative d’un bien à Bouaké',
    papiers: 'être accompagné pour des papiers fonciers (ACD / vérification)'
  };

  function buildMessage() {
    var intent = 'terrain';
    var name = '';
    var zone = '';
    var budget = '';

    if (form) {
      var checked = form.querySelector('input[name="intent"]:checked');
      if (checked) intent = checked.value;
      var nameIn = form.querySelector('input[name="name"]');
      var zoneIn = form.querySelector('input[name="zone"]');
      var budgetIn = form.querySelector('input[name="budget"]');
      name = nameIn ? nameIn.value.trim() : '';
      zone = zoneIn ? zoneIn.value.trim() : '';
      budget = budgetIn ? budgetIn.value.trim() : '';
    }

    var parts = [];
    parts.push('Bonjour Salam Immobilier' + (name ? ', je m’appelle ' + name + '.' : '.'));
    parts.push('Je vous écris pour ' + (intentPhrases[intent] || intentPhrases.terrain) + '.');
    if (zone) parts.push('Secteur recherché : ' + zone + '.');
    if (budget) parts.push('Budget indicatif : ' + budget + '.');
    parts.push('Pouvez-vous m’indiquer les disponibilités et les démarches ?');
    return parts.join(' ');
  }

  function buildWaUrl() {
    return 'https://wa.me/' + WA_PHONE + '?text=' + encodeURIComponent(buildMessage());
  }

  function syncWa() {
    var text = buildMessage();
    if (msgOut) msgOut.textContent = text;
    var url = 'https://wa.me/' + WA_PHONE + '?text=' + encodeURIComponent(text);
    Array.prototype.forEach.call(waLinks, function (a) {
      a.setAttribute('href', url);
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener');
    });
  }

  if (form) {
    form.addEventListener('input', syncWa);
    form.addEventListener('change', syncWa);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var url = buildWaUrl();
      window.open(url, '_blank', 'noopener');
    });
  }
  syncWa();

  // ---- service rail links pre-select intent in the contact form -----------
  var askLinks = document.querySelectorAll('[data-intent]');
  Array.prototype.forEach.call(askLinks, function (link) {
    link.addEventListener('click', function () {
      var val = link.getAttribute('data-intent');
      if (!form || !val) return;
      var radio = form.querySelector('input[name="intent"][value="' + val + '"]');
      if (radio) {
        radio.checked = true;
        syncWa();
      }
    });
  });

  // ---- keyboard focus inside horizontal rail brings card into view --------
  var railStage = document.querySelector('.svc__stage');
  if (railStage) {
    railStage.addEventListener('focusin', function (e) {
      var card = e.target && e.target.closest ? e.target.closest('.card, .svc__note') : null;
      if (!card) return;
      var r = card.getBoundingClientRect();
      if (r.right > window.innerWidth || r.left < 0) {
        card.scrollIntoView({ block: 'nearest', inline: 'center' });
      }
    });
  }
})();
