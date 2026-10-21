/**
 * main.js — Office of Ordinary Hauntings
 *
 * Small bits of period-appropriate nonsense. Everything here is progressive
 * enhancement: the pages are fully readable with JavaScript turned off.
 */

(function () {
  'use strict';

  /**
   * Bump and render the visitor counter.
   *
   * There is no server-side counter (this is a static site), so the number is
   * a believable seed plus this browser's own visit count, kept in
   * localStorage. Storage can throw (private windows, blocked cookies), so
   * every access is wrapped and the page falls back to the seed.
   *
   * @param {HTMLElement} el Element whose text becomes the formatted count.
   */
  function renderCounter(el) {
    var SEED = 128431;
    var KEY = 'ooh-visits';
    var visits = 0;

    try {
      visits = parseInt(window.localStorage.getItem(KEY), 10) || 0;
      visits += 1;
      window.localStorage.setItem(KEY, String(visits));
    } catch (err) {
      visits = 1;
    }

    // Seven digits, like a proper odometer.
    el.textContent = String(SEED + visits).padStart(7, '0');
  }

  /**
   * Put today's date on any element marked data-today, in the long, formal
   * style that makes a memo feel official.
   *
   * @param {HTMLElement} el Element to fill.
   */
  function renderToday(el) {
    el.textContent = new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  /**
   * Fill the copyright range's end year so the footer never goes stale.
   *
   * @param {HTMLElement} el Element to fill.
   */
  function renderYear(el) {
    el.textContent = String(new Date().getFullYear());
  }

  /**
   * Turn a string into a stable four-digit number, so the same report always
   * gets the same case number without needing a server to hand one out.
   *
   * @param {string} text Any string.
   * @returns {string} Four digits, zero-padded.
   */
  function caseDigits(text) {
    var hash = 7;
    for (var i = 0; i < text.length; i += 1) {
      hash = (hash * 31 + text.charCodeAt(i)) % 10000;
    }
    return String(hash).padStart(4, '0');
  }

  /**
   * Handle Form 27-B/6. This is a static site, so nothing is transmitted:
   * submitting swaps the form for an official-looking receipt that quotes
   * the visitor's own words back at them. Built with textContent only, so
   * nothing the visitor types is ever interpreted as markup.
   *
   * @param {HTMLFormElement} form The intake form.
   */
  function initReportForm(form) {
    var receipt = document.getElementById('report-receipt');

    form.addEventListener('submit', function (evt) {
      evt.preventDefault();

      var object = (form.elements.object.value || 'object').toLowerCase();
      var room = form.elements.room.value.trim();
      var behavior = form.elements.behavior.value.trim();
      var opening = behavior.split(/\s+/).slice(0, 8).join(' ');

      var lines = [
        'REPORT RECEIVED',
        'Case No. OOH-27B6-' + caseDigits(object + room + behavior),
        'Subject: ' + object + (room ? ' (' + room + ')' : '')
      ];
      if (opening) {
        lines.push('Your account begins: "' + opening + '..." The Office has encountered this phrasing before.');
      }
      lines.push(
        'A field representative will contact you within 6-8 business weeks. ' +
        'The representative may already have been in contact.',
        'Please do not discuss this report in the presence of the ' + object + '.'
      );

      lines.forEach(function (line, i) {
        var p = document.createElement('p');
        if (i === 0) { p.className = 'stamp'; }
        p.textContent = line;
        receipt.appendChild(p);
      });

      form.hidden = true;
      receipt.hidden = false;
      receipt.focus();
    });
  }

  /**
   * Run the guestbook. With no server behind it, a visitor's entry is kept
   * in localStorage and shown as "pending review" on their own browser only.
   * Storage can throw (private windows, blocked cookies), so every access is
   * guarded and the page still works without it.
   *
   * @param {HTMLFormElement} form The signing form.
   */
  function initGuestbook(form) {
    var KEY = 'ooh-guestbook';
    var list = document.getElementById('guest-pending');

    function load() {
      try { return JSON.parse(window.localStorage.getItem(KEY)) || []; } catch (err) { return []; }
    }

    function render() {
      list.textContent = '';
      load().forEach(function (entry) {
        var box = document.createElement('div');
        box.className = 'guest pending';
        var meta = document.createElement('div');
        meta.className = 'guest-meta';
        meta.textContent = entry.name + ' — pending review by the Office';
        var body = document.createElement('p');
        body.textContent = entry.message;
        box.appendChild(meta);
        box.appendChild(body);
        list.appendChild(box);
      });
    }

    form.addEventListener('submit', function (evt) {
      evt.preventDefault();
      var name = form.elements.name.value.trim().slice(0, 60) || 'Anonymous';
      var message = form.elements.message.value.trim().slice(0, 500);
      if (!message) { return; }

      var entries = load();
      entries.unshift({ name: name, message: message });
      try { window.localStorage.setItem(KEY, JSON.stringify(entries.slice(0, 20))); } catch (err) { /* keep going */ }

      form.reset();
      render();
    });

    render();
  }

  var reportForm = document.getElementById('report-form');
  if (reportForm) { initReportForm(reportForm); }
  var guestForm = document.getElementById('guest-form');
  if (guestForm) { initGuestbook(guestForm); }

  document.querySelectorAll('[data-counter]').forEach(renderCounter);
  document.querySelectorAll('[data-today-year]').forEach(renderYear);
  document.querySelectorAll('[data-today]').forEach(renderToday);
})();
