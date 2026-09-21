/* VocalFlow — Accès partenaire (port du script de la maquette Claude Design).
   Halo qui suit la souris, démo en 3 étapes (agent → formulaire → numéro), lien Calendly centralisé.
   Aucun style inline n'est écrit via setAttribute (CSP style-src 'self'). */
(function () {
  'use strict';

  /* ---- Réglages ---- */
  var CALENDLY_URL = 'https://calendly.com/contact-vocal-flow/appel-d-acces-vocalflow';
  /* Webhook (n8n, Make, Zapier…) qui reçoit chaque lead de la démo en JSON : { prenom, email, date, source }.
     Vide = les leads sont seulement gardés dans le localStorage du visiteur (clé vocalflow_leads).
     Si vous renseignez une URL, ajoutez son origine à connect-src dans vercel.json, sinon l'envoi sera bloqué par la CSP. */
  var LEAD_WEBHOOK = '';

  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* ---- Calendly (source unique de vérité) : l'iframe a déjà l'URL en dur dans le HTML (fonctionne sans JS). ---- */
  var calendlySrc = CALENDLY_URL + (CALENDLY_URL.indexOf('?') !== -1 ? '&' : '?') + 'hide_gdpr_banner=1&background_color=0d0d22&text_color=f5f4fb&primary_color=8b5cf6';
  qsa('iframe[data-calendly]').forEach(function (frame) {
    if (frame.getAttribute('src') !== calendlySrc) frame.setAttribute('src', calendlySrc);
  });

  /* ---- Entrées animées : une fois jouées, on retire l'animation (classe .is-in) ---- */
  qsa('.rise').forEach(function (el) {
    el.addEventListener('animationend', function onEnd(event) {
      if (event.target !== el) return;
      el.classList.add('is-in');
      el.removeEventListener('animationend', onEnd);
    });
  });

  /* ---- Halo qui suit la souris (pointeurs fins uniquement, interpolation 0,12 comme la maquette) ---- */
  var spot = qs('.spot');
  if (spot && window.matchMedia && window.matchMedia('(pointer: fine)').matches) {
    var tx = -1000, ty = -1000, x = tx, y = ty, raf = 0;
    var tick = function () {
      x += (tx - x) * 0.12; y += (ty - y) * 0.12;
      spot.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
      if (Math.abs(tx - x) > 0.3 || Math.abs(ty - y) > 0.3) raf = requestAnimationFrame(tick);
      else raf = 0;
    };
    window.addEventListener('mousemove', function (event) {
      if (x < -500) { x = event.clientX; y = event.clientY; }
      tx = event.clientX; ty = event.clientY;
      if (!raf) raf = requestAnimationFrame(tick);
    }, { passive: true });
  }

  /* ---- Démo en direct : étape 0 (agent disponible) → 1 (prénom + email) → 2 (numéro affiché) ---- */
  var idle = qs('.demo__idle');
  var form = qs('.demo__form');
  var revealed = qs('.demo__revealed');
  var revealBtn = qs('.demo__reveal');
  var greeting = qs('.demo__greeting');

  function showStep(step) {
    if (idle) idle.hidden = step !== 0;
    if (form) form.hidden = step !== 1;
    if (revealed) revealed.hidden = step !== 2;
  }

  if (revealBtn && form) {
    revealBtn.addEventListener('click', function () {
      showStep(1);
      var first = qs('input', form);
      if (first) { try { first.focus({ preventScroll: true }); } catch (e) { first.focus(); } }
    });
  }

  if (form && revealed) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (typeof form.reportValidity === 'function' && !form.reportValidity()) return;
      var prenom = (qs('input[name="prenom"]', form) || {}).value || '';
      var email = (qs('input[name="email"]', form) || {}).value || '';
      var lead = { prenom: prenom.trim(), email: email.trim(), date: new Date().toISOString(), source: 'partenaires-demo' };

      try {
        var key = 'vocalflow_leads';
        var arr = JSON.parse(localStorage.getItem(key) || '[]');
        arr.push(lead);
        localStorage.setItem(key, JSON.stringify(arr));
      } catch (e) { /* stockage indisponible : on continue */ }

      if (LEAD_WEBHOOK) {
        try {
          fetch(LEAD_WEBHOOK, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(lead), keepalive: true });
        } catch (e) { /* réseau ou CSP : on affiche quand même le numéro */ }
      }

      if (greeting) greeting.textContent = (lead.prenom ? lead.prenom + ', c' : 'C') + "'est à vous : appelez-le maintenant.";
      showStep(2);
      try { revealed.focus({ preventScroll: true }); } catch (e) { revealed.focus(); }
    });
  }
})();
