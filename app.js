(function () {
  'use strict';
  var L = window.Liturgie;
  var $ = function (id) { return document.getElementById(id); };

  function aujourdhui() {
    var n = new Date();
    return L.D(n.getFullYear(), n.getMonth() + 1, n.getDate());
  }
  function dateLongue(d) {
    var j = d.getUTCDate();
    return L.cap(L.JOURS[d.getUTCDay()]) + ' ' + j + (j === 1 ? 'er' : '') + ' ' +
      L.MOIS[d.getUTCMonth()] + ' ' + d.getUTCFullYear();
  }
  function dateCourte(d) {
    var j = d.getUTCDate();
    return L.JOURS[d.getUTCDay()] + ' ' + j + (j === 1 ? 'er' : '') + ' ' + L.MOIS[d.getUTCMonth()];
  }

  var etat = { sel: aujourdhui(), mois: null };
  function moisDe(d) { return L.D(d.getUTCFullYear(), d.getUTCMonth() + 1, 1); }
  etat.mois = moisDe(etat.sel);

  /* ---------- Carte du jour ---------- */
  function afficherJour() {
    var j = L.jour(etat.sel);
    $('carte').dataset.couleur = j.couleur;
    document.body.dataset.couleur = j.couleur;
    $('date-long').textContent = dateLongue(etat.sel);
    $('date-choix').value = j.iso;
    $('badge-auj').hidden = j.iso !== L.iso(aujourdhui());
    $('titre').textContent = j.titre;
    $('rang').textContent = j.rang;
    $('temps').textContent = j.tempsLabel;
    $('couleur').textContent = j.couleurLabel;
    $('annee').textContent = 'dimanches année ' + j.annee + ' · semaine année ' + j.anneeFerie;
    $('debut').hidden = !j.debut;
    $('debut').textContent = j.debut || '';
    $('note').hidden = !j.note;
    $('note').textContent = j.note || '';

    // Brève explication et liens « En savoir plus »
    var X = window.Explications;
    var expl = X ? X.texte(j) : null;
    $('explication').hidden = !expl;
    $('explication').textContent = expl || '';
    var zone = $('liens');
    zone.textContent = '';
    if (X) X.liens(j).forEach(function (l) {
      var a = document.createElement('a');
      a.href = l.url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = l.nom + ' ↗';
      zone.appendChild(a);
    });
  }

  /* ---------- Mois en couleurs ---------- */
  function afficherMois() {
    var m = etat.mois, y = m.getUTCFullYear(), mo = m.getUTCMonth();
    $('mois-titre').textContent = L.MOIS[mo] + ' ' + y;
    var g = $('grille');
    g.textContent = '';
    var decalage = (m.getUTCDay() + 6) % 7;            // semaine commençant le lundi
    for (var i = 0; i < decalage; i++) g.appendChild(document.createElement('span'));
    var auj = L.iso(aujourdhui()), sel = L.iso(etat.sel);
    var nb = new Date(Date.UTC(y, mo + 1, 0)).getUTCDate();
    for (var n = 1; n <= nb; n++) {
      var d = L.D(y, mo + 1, n), j = L.jour(d);
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'case-jour' + (j.dimanche ? ' dim' : '') + (j.iso === sel ? ' sel' : '') + (j.iso === auj ? ' auj' : '');
      b.dataset.couleur = j.couleur;
      b.dataset.iso = j.iso;
      b.setAttribute('aria-label', dateLongue(d) + ' : ' + j.titre);
      b.textContent = n;
      if (j.rang === 'Solennité' || (j.rang === 'Fête' && j.prec <= 5)) {
        var e = document.createElement('span');
        e.className = 'etoile';
        e.textContent = '★';
        b.appendChild(e);
      }
      g.appendChild(b);
    }
  }

  /* ---------- À venir ---------- */
  function afficherAvenir() {
    var ul = $('avenir');
    ul.textContent = '';
    var d = etat.sel, compte = 0;
    for (var i = 1; i <= 120 && compte < 5; i++) {
      var x = L.add(d, i), j = L.jour(x);
      if (!j.important) continue;
      compte++;
      var li = document.createElement('li'), b = document.createElement('button');
      b.type = 'button';
      b.dataset.couleur = j.couleur;
      b.dataset.iso = j.iso;
      var t = document.createElement('span'); t.textContent = j.titre;
      var q = document.createElement('span'); q.className = 'quand';
      q.textContent = L.cap(dateCourte(x)) + ' · ' + j.couleurLabel.toLowerCase();
      b.appendChild(t); b.appendChild(q);
      li.appendChild(b); ul.appendChild(li);
    }
  }

  function tout() { afficherJour(); afficherMois(); afficherAvenir(); }
  function choisir(d) { etat.sel = d; etat.mois = moisDe(d); tout(); }

  $('jour-prec').onclick = function () { choisir(L.add(etat.sel, -1)); };
  $('jour-suiv').onclick = function () { choisir(L.add(etat.sel, 1)); };
  $('btn-aujourdhui').onclick = function () { choisir(aujourdhui()); };
  $('date-choix').onchange = function (e) { if (e.target.value) choisir(L.fromISO(e.target.value)); };
  $('mois-prec').onclick = function () {
    etat.mois = L.D(etat.mois.getUTCFullYear(), etat.mois.getUTCMonth(), 1); afficherMois();
  };
  $('mois-suiv').onclick = function () {
    etat.mois = L.D(etat.mois.getUTCFullYear(), etat.mois.getUTCMonth() + 2, 1); afficherMois();
  };
  $('grille').onclick = function (e) {
    var b = e.target.closest('[data-iso]');
    if (b) { etat.sel = L.fromISO(b.dataset.iso); tout(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  };
  $('avenir').onclick = function (e) {
    var b = e.target.closest('[data-iso]');
    if (b) { choisir(L.fromISO(b.dataset.iso)); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  };

  /* ---------- Export agenda (.ics) ---------- */
  function echapper(s) {
    return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
  }
  var enc = new TextEncoder();
  function plier(ligne) {                              // lignes de 75 octets maximum
    var out = '', cur = '', octets = 0;
    for (var i = 0; i < ligne.length; i++) {
      var ch = ligne[i], n = enc.encode(ch).length;
      if (octets + n > 73) { out += cur + '\r\n '; cur = ''; octets = 1; }
      cur += ch; octets += n;
    }
    return out + cur;
  }
  function deux(n) { return (n < 10 ? '0' : '') + n; }
  function horodatage(d) {
    return d.getUTCFullYear() + deux(d.getUTCMonth() + 1) + deux(d.getUTCDate()) + 'T' +
      deux(d.getUTCHours()) + deux(d.getUTCMinutes()) + deux(d.getUTCSeconds()) + 'Z';
  }
  function courteCouleur(j) {
    return { vert: 'vert', violet: 'violet', blanc: 'blanc', rouge: 'rouge', rose: 'rose', aucune: 'pas de messe le jour' }[j.couleur];
  }

  function construireICS(annees, heure, categories) {
    var hh = heure.split(':')[0], mm = heure.split(':')[1];
    var debutH = deux(+hh) + deux(+mm) + '00';
    var finMin = (+hh) * 60 + (+mm) + 15;
    var finH = deux(Math.floor(finMin / 60) % 24) + deux(finMin % 60) + '00';
    var stamp = horodatage(new Date());
    var lignes = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Jour liturgique//FR', 'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH', 'X-WR-CALNAME:Jour liturgique'
    ];
    function evenement(uid, date, resume, desc, url) {
      lignes.push(
        'BEGIN:VEVENT',
        'UID:' + uid + '@jour-liturgique',
        'DTSTAMP:' + stamp,
        'DTSTART:' + date + 'T' + debutH,
        'DTEND:' + date + 'T' + finH,
        'SUMMARY:' + echapper(resume),
        'DESCRIPTION:' + echapper(desc)
      );
      if (url) lignes.push('URL:' + url);
      lignes.push(
        'TRANSP:TRANSPARENT',
        'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + echapper(resume), 'TRIGGER:PT0S', 'END:VALARM',
        'END:VEVENT'
      );
    }
    var d = aujourdhui(), fin = L.add(d, Math.round(365.25 * annees)), nb = 0;
    for (; d < fin; d = L.add(d, 1)) {
      var j = L.jour(d);
      if (!j.categories.some(function (c) { return categories.indexOf(c) >= 0; })) continue;
      var date = j.iso.replace(/-/g, '');
      var resume = (j.debut && j.rang === 'Férie' ? j.debut : j.titre) + ' (' + courteCouleur(j) + ')';
      var desc = [j.tempsLabel + ' · ' + j.rang, 'Couleur : ' + j.couleurLabel,
        'Lectures : dimanches année ' + j.annee + ', semaine année ' + j.anneeFerie];
      if (j.debut) desc.push(j.debut);
      if (j.note) desc.push(j.note);
      desc.push('Calendrier romain, usages de la France. L\u2019Ordo de ton diocèse fait foi.');
      evenement('jl-' + date, date, resume, desc.join('\n'));
      nb++;
    }
    // Dernier jour : rappel pour revenir télécharger la suite
    var dernier = L.add(fin, -1), adresse = location.origin + location.pathname;
    evenement('jl-renouveler-' + L.iso(dernier).replace(/-/g, ''), L.iso(dernier).replace(/-/g, ''),
      'Renouveler mes rappels Jour liturgique',
      'Tes rappels liturgiques s’arrêtent aujourd’hui.\nOuvre l’application Jour liturgique (' + adresse +
      ') et touche « Télécharger pour mon agenda » pour recevoir les rappels des années suivantes.',
      adresse);
    lignes.push('END:VCALENDAR');
    return { texte: lignes.map(plier).join('\r\n') + '\r\n', nb: nb };
  }

  $('btn-ics').onclick = function () {
    var cats = Array.prototype.map.call(
      document.querySelectorAll('#opt-categories input:checked'), function (c) { return c.value; });
    if (!cats.length) { $('cat-erreur').hidden = false; $('ics-info').textContent = ''; return; }
    $('cat-erreur').hidden = true;
    var r = construireICS(+$('opt-annees').value, $('opt-heure').value || '06:00', cats);
    var blob = new Blob([r.texte], { type: 'text/calendar;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'jour-liturgique.ics';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 10000);
    $('ics-info').textContent = r.nb + ' rappels préparés, plus un rappel de renouvellement le dernier jour. Suis les étapes ci-dessous pour les ajouter à ton agenda.';
  };
  $('opt-categories').onchange = function () { $('cat-erreur').hidden = true; };

  /* ---------- Installation et mode hors ligne ---------- */
  var invite = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    invite = e;
    $('bloc-installer').hidden = false;
  });
  $('btn-installer').onclick = function () {
    if (!invite) return;
    invite.prompt();
    invite.userChoice.then(function () { invite = null; $('bloc-installer').hidden = true; });
  };
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    // S'il y avait déjà une version installée, un changement de version = mise à jour disponible
    var dejaInstallee = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      if (dejaInstallee && $('maj')) $('maj').hidden = false;
    });
    navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(function (reg) {
      // Vérifier s'il y a du nouveau à chaque retour sur l'application
      document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'visible') reg.update().catch(function () {});
      });
    });
  }
  if ($('btn-maj')) $('btn-maj').onclick = function () { location.reload(); };

  /* Au retour sur l'application un autre jour, revenir à aujourd'hui */
  var dernier = L.iso(aujourdhui());
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible' && L.iso(aujourdhui()) !== dernier) {
      dernier = L.iso(aujourdhui());
      choisir(aujourdhui());
    }
  });

  tout();
})();
