/*
 * Jour liturgique — moteur de calcul du calendrier liturgique
 * Rite romain, forme ordinaire, usages de la France
 * (Épiphanie le dimanche entre le 2 et le 8 janvier, Ascension le jeudi,
 *  Saint-Sacrement le dimanche).
 *
 * Contenu : temps liturgiques, dimanches, féries, solennités et fêtes
 * du calendrier romain général. Les mémoires des saints et les fêtes
 * propres aux diocèses ou paroisses ne sont pas incluses.
 *
 * Toutes les dates sont des objets Date en UTC à minuit (pas de souci d'heure d'été).
 */
(function (root) {
  'use strict';

  var DAY = 86400000;
  var JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  var MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet',
    'août', 'septembre', 'octobre', 'novembre', 'décembre'];

  var TEMPS = {
    avent: 'Temps de l’Avent',
    noel: 'Temps de Noël',
    ordinaire: 'Temps ordinaire',
    careme: 'Carême',
    'semaine-sainte': 'Semaine sainte',
    triduum: 'Triduum pascal',
    paques: 'Temps pascal'
  };

  var COULEURS = {
    vert: 'Vert',
    violet: 'Violet',
    blanc: 'Blanc',
    rouge: 'Rouge',
    rose: 'Rose (ou violet)',
    aucune: 'Pas de couleur (pas de messe dans la journée)'
  };

  function D(y, m, d) { return new Date(Date.UTC(y, m - 1, d)); }
  function add(d, n) { return new Date(d.getTime() + n * DAY); }
  function diff(a, b) { return Math.round((a.getTime() - b.getTime()) / DAY); }
  function dow(d) { return d.getUTCDay(); }
  function same(a, b) { return a.getTime() === b.getTime(); }
  function iso(d) { return d.toISOString().slice(0, 10); }
  function fromISO(s) { var p = s.split('-'); return D(+p[0], +p[1], +p[2]); }
  function sundayOnOrBefore(d) { return add(d, -dow(d)); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function ordM(n) { return n === 1 ? '1er' : n + 'e'; }
  function ordF(n) { return n === 1 ? '1re' : n + 'e'; }

  /* Date de Pâques (calendrier grégorien, algorithme de Meeus/Jones/Butcher) */
  function paques(y) {
    var a = y % 19, b = Math.floor(y / 100), c = y % 100,
      d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25),
      g = Math.floor((b - f + 1) / 3),
      h = (19 * a + b - d - g + 15) % 30,
      i = Math.floor(c / 4), k = c % 4,
      l = (32 + 2 * e + 2 * i - h - k) % 7,
      m = Math.floor((a + 11 * h + 22 * l) / 451),
      mois = Math.floor((h + l - 7 * m + 114) / 31),
      jour = ((h + l - 7 * m + 114) % 31) + 1;
    return D(y, mois, jour);
  }

  /* Dates clés d'une année civile */
  var cacheAn = {};
  function an(y) {
    if (cacheAn[y]) return cacheAn[y];
    var E = paques(y);
    var epi = D(y, 1, 2);
    epi = add(epi, (7 - dow(epi)) % 7);                 // dimanche entre le 2 et le 8 janvier
    var bap = epi.getUTCDate() >= 7 ? add(epi, 1) : add(epi, 7);
    var noel = D(y, 12, 25);
    var avent1 = add(sundayOnOrBefore(D(y, 12, 24)), -21);
    var sf = dow(noel) === 0 ? D(y, 12, 30) : add(noel, 7 - dow(noel));
    return (cacheAn[y] = {
      E: E, epi: epi, bap: bap,
      cendres: add(E, -46), careme1: add(E, -42), rameaux: add(E, -7),
      ascension: add(E, 39), pentecote: add(E, 49), trinite: add(E, 56),
      saintSacrement: add(E, 63), sacreCoeur: add(E, 68),
      noel: noel, avent1: avent1, christRoi: add(avent1, -7), sainteFamille: sf
    });
  }

  /*
   * Propre du temps.
   * prec = rang dans la table de préséance (plus petit = plus important) :
   * 1 Triduum / Pâques ; 2 Noël, Épiphanie, Ascension, Pentecôte, dimanches de
   * l'Avent, du Carême et de Pâques, Cendres, Semaine sainte, octave de Pâques ;
   * 3 solennités ; 5 fêtes du Seigneur ; 6 dimanches du temps de Noël et du
   * Temps ordinaire ; 7 fêtes des saints ; 9 féries privilégiées ; 13 féries.
   */
  function R(titre, temps, couleur, rang, prec, extra) {
    var r = { titre: titre, temps: temps, couleur: couleur, rang: rang, prec: prec };
    if (extra) for (var k in extra) r[k] = extra[k];
    return r;
  }

  function temporal(d) {
    var y = d.getUTCFullYear(), A = an(y), j = dow(d), JN = cap(JOURS[j]), n, k, w;

    // Avent
    if (d >= A.avent1 && d < A.noel) {
      n = 1 + Math.floor(diff(d, A.avent1) / 7);
      if (j === 0) {
        var ex = null;
        if (n === 1) ex = { debut: 'Début de l’Avent et de la nouvelle année liturgique' };
        if (n === 3) ex = { note: 'Dimanche de Gaudete' };
        return R(ordM(n) + ' dimanche de l’Avent', 'avent', n === 3 ? 'rose' : 'violet', 'Dimanche', 2, ex);
      }
      if (d.getUTCMonth() === 11 && d.getUTCDate() >= 17)
        return R(JN + ' ' + d.getUTCDate() + ' décembre', 'avent', 'violet', 'Férie privilégiée de l’Avent', 9);
      return R(JN + ' de la ' + ordF(n) + ' semaine de l’Avent', 'avent', 'violet', 'Férie', 13);
    }

    // Noël (25 au 31 décembre)
    if (d >= A.noel) {
      if (same(d, A.noel)) return R('Nativité du Seigneur (Noël)', 'noel', 'blanc', 'Solennité', 2, { debut: 'Début du temps de Noël' });
      if (same(d, A.sainteFamille)) return R('La Sainte Famille de Jésus, Marie et Joseph', 'noel', 'blanc', 'Fête', 5);
      k = d.getUTCDate() - 24;
      return R(JN + ', ' + ordM(k) + ' jour dans l’octave de Noël', 'noel', 'blanc', 'Octave de Noël', 9);
    }

    // Temps de Noël en janvier, jusqu'au Baptême du Seigneur
    if (d <= A.bap) {
      if (d.getUTCMonth() === 0 && d.getUTCDate() === 1)
        return R('Sainte Marie, Mère de Dieu', 'noel', 'blanc', 'Solennité', 3, { note: 'Octave de Noël' });
      if (same(d, A.epi)) return R('Épiphanie du Seigneur', 'noel', 'blanc', 'Solennité', 2);
      if (same(d, A.bap)) return R('Baptême du Seigneur', 'noel', 'blanc', 'Fête', 5, { note: 'Fin du temps de Noël' });
      if (d < A.epi) return R(JN + ' ' + d.getUTCDate() + ' janvier, temps de Noël', 'noel', 'blanc', 'Férie', 13);
      return R(JN + ' après l’Épiphanie', 'noel', 'blanc', 'Férie', 13);
    }

    // Temps ordinaire, avant le Carême
    if (d < A.cendres) {
      w = 1 + diff(sundayOnOrBefore(d), sundayOnOrBefore(A.bap)) / 7;
      var deb1 = same(d, add(A.bap, 1)) ? { debut: 'Début du Temps ordinaire' } : null;
      if (j === 0) return R(ordM(w) + ' dimanche du Temps ordinaire', 'ordinaire', 'vert', 'Dimanche', 6, deb1);
      return R(JN + ' de la ' + ordF(w) + ' semaine du Temps ordinaire', 'ordinaire', 'vert', 'Férie', 13, deb1);
    }

    // Carême
    if (d < A.rameaux) {
      if (same(d, A.cendres)) return R('Mercredi des Cendres', 'careme', 'violet', 'Entrée en Carême', 2, { debut: 'Début du Carême' });
      if (d < A.careme1) return R(JN + ' après les Cendres', 'careme', 'violet', 'Férie de Carême', 9);
      n = 1 + Math.floor(diff(d, A.careme1) / 7);
      if (j === 0) return R(ordM(n) + ' dimanche de Carême', 'careme', n === 4 ? 'rose' : 'violet', 'Dimanche', 2,
        n === 4 ? { note: 'Dimanche de Laetare' } : null);
      return R(JN + ' de la ' + ordF(n) + ' semaine de Carême', 'careme', 'violet', 'Férie de Carême', 9);
    }

    // Semaine sainte et Triduum
    if (d < A.E) {
      k = diff(d, A.rameaux);
      if (k === 0) return R('Dimanche des Rameaux et de la Passion du Seigneur', 'semaine-sainte', 'rouge', 'Dimanche', 2,
        { debut: 'Début de la Semaine sainte' });
      if (k <= 3) return R(JN + ' saint', 'semaine-sainte', 'violet', 'Semaine sainte', 2);
      if (k === 4) return R('Jeudi saint – la Cène du Seigneur', 'triduum', 'blanc', 'Triduum pascal', 1,
        { debut: 'Le soir : début du Triduum pascal', note: 'Le soir : messe en mémoire de la Cène du Seigneur, en blanc. La messe chrismale est souvent célébrée ce matin-là ou un autre jour de la Semaine sainte, selon le diocèse.' });
      if (k === 5) return R('Vendredi saint – la Passion du Seigneur', 'triduum', 'rouge', 'Triduum pascal', 1,
        { note: 'Pas de messe ce jour : célébration de la Passion du Seigneur, en rouge.' });
      return R('Samedi saint', 'triduum', 'aucune', 'Triduum pascal', 1,
        { note: 'Pas de messe dans la journée. Le soir : Vigile pascale, en blanc.' });
    }

    // Temps pascal
    if (d <= A.pentecote) {
      k = diff(d, A.E);
      if (k === 0) return R('Dimanche de Pâques – la Résurrection du Seigneur', 'paques', 'blanc', 'Solennité', 1, { debut: 'Début du temps pascal' });
      if (k < 7) return R(JN + ' dans l’octave de Pâques', 'paques', 'blanc', 'Octave de Pâques', 2);
      if (same(d, A.ascension)) return R('Ascension du Seigneur', 'paques', 'blanc', 'Solennité', 2);
      if (same(d, A.pentecote)) return R('Pentecôte', 'paques', 'rouge', 'Solennité', 2, { note: 'Fin du temps pascal' });
      n = 1 + Math.floor(k / 7);
      if (j === 0) return R(ordM(n) + ' dimanche de Pâques' + (n === 2 ? ' (de la Divine Miséricorde)' : ''), 'paques', 'blanc', 'Dimanche', 2);
      return R(JN + ' de la ' + ordF(n) + ' semaine de Pâques', 'paques', 'blanc', 'Férie', 13);
    }

    // Temps ordinaire, après la Pentecôte
    w = 34 - diff(A.christRoi, sundayOnOrBefore(d)) / 7;
    if (same(d, A.trinite)) return R('La Sainte Trinité', 'ordinaire', 'blanc', 'Solennité', 3);
    if (same(d, A.saintSacrement)) return R('Le Saint-Sacrement du Corps et du Sang du Christ', 'ordinaire', 'blanc', 'Solennité', 3);
    if (same(d, A.sacreCoeur)) return R('Le Sacré-Cœur de Jésus', 'ordinaire', 'blanc', 'Solennité', 3);
    if (same(d, A.christRoi)) return R('Le Christ, Roi de l’univers', 'ordinaire', 'blanc', 'Solennité', 3,
      { note: 'Dernier dimanche de l’année liturgique' });
    var deb2 = same(d, add(A.pentecote, 1)) ? { debut: 'Reprise du Temps ordinaire' } : null;
    if (j === 0) return R(ordM(w) + ' dimanche du Temps ordinaire', 'ordinaire', 'vert', 'Dimanche', 6);
    return R(JN + ' de la ' + ordF(w) + ' semaine du Temps ordinaire', 'ordinaire', 'vert', 'Férie', 13, deb2);
  }

  /* Propre des saints : solennités et fêtes du calendrier romain général */
  var SANCT = [
    [1, 25, 'Conversion de saint Paul, apôtre', 'blanc', 'Fête', 7],
    [2, 2, 'Présentation du Seigneur au Temple', 'blanc', 'Fête', 5],
    [2, 22, 'Chaire de saint Pierre, apôtre', 'blanc', 'Fête', 7],
    [3, 19, 'Saint Joseph, époux de la Vierge Marie', 'blanc', 'Solennité', 3],
    [3, 25, 'Annonciation du Seigneur', 'blanc', 'Solennité', 3],
    [4, 25, 'Saint Marc, évangéliste', 'rouge', 'Fête', 7],
    [5, 3, 'Saint Philippe et saint Jacques, apôtres', 'rouge', 'Fête', 7],
    [5, 14, 'Saint Matthias, apôtre', 'rouge', 'Fête', 7],
    [5, 31, 'Visitation de la Vierge Marie', 'blanc', 'Fête', 7],
    [6, 24, 'Nativité de saint Jean-Baptiste', 'blanc', 'Solennité', 3],
    [6, 29, 'Saint Pierre et saint Paul, apôtres', 'rouge', 'Solennité', 3],
    [7, 3, 'Saint Thomas, apôtre', 'rouge', 'Fête', 7],
    [7, 22, 'Sainte Marie-Madeleine', 'blanc', 'Fête', 7],
    [7, 25, 'Saint Jacques, apôtre', 'rouge', 'Fête', 7],
    [8, 6, 'Transfiguration du Seigneur', 'blanc', 'Fête', 5],
    [8, 10, 'Saint Laurent, diacre et martyr', 'rouge', 'Fête', 7],
    [8, 15, 'Assomption de la Vierge Marie', 'blanc', 'Solennité', 3],
    [8, 24, 'Saint Barthélemy, apôtre', 'rouge', 'Fête', 7],
    [9, 8, 'Nativité de la Vierge Marie', 'blanc', 'Fête', 7],
    [9, 14, 'La Croix glorieuse', 'rouge', 'Fête', 5],
    [9, 21, 'Saint Matthieu, apôtre et évangéliste', 'rouge', 'Fête', 7],
    [9, 29, 'Saints Michel, Gabriel et Raphaël, archanges', 'blanc', 'Fête', 7],
    [10, 18, 'Saint Luc, évangéliste', 'rouge', 'Fête', 7],
    [10, 28, 'Saint Simon et saint Jude, apôtres', 'rouge', 'Fête', 7],
    [11, 1, 'Tous les saints (Toussaint)', 'blanc', 'Solennité', 3],
    [11, 2, 'Commémoration de tous les fidèles défunts', 'violet', 'Commémoration', 3],
    [11, 9, 'Dédicace de la basilique du Latran', 'blanc', 'Fête', 5],
    [11, 30, 'Saint André, apôtre', 'rouge', 'Fête', 7],
    [12, 8, 'Immaculée Conception de la Vierge Marie', 'blanc', 'Solennité', 3],
    [12, 26, 'Saint Étienne, premier martyr', 'rouge', 'Fête', 7],
    [12, 27, 'Saint Jean, apôtre et évangéliste', 'blanc', 'Fête', 7],
    [12, 28, 'Les saints Innocents, martyrs', 'rouge', 'Fête', 7]
  ];

  var cacheSanct = {};
  function sanctoral(y) {
    if (cacheSanct[y]) return cacheSanct[y];
    var A = an(y), m = {};
    SANCT.forEach(function (s) {
      var d = D(y, s[0], s[1]);
      var e = { titre: s[2], couleur: s[3], rang: s[4], prec: s[5] };
      var cible = d;
      if (s[4] === 'Solennité') {
        var empeche = temporal(d).prec <= 3;
        var dansSemaineSainteOuOctave = d >= A.rameaux && d <= add(A.E, 7);
        if (s[0] === 3 && s[1] === 19 && dansSemaineSainteOuOctave) {
          cible = add(A.rameaux, -1);                   // samedi avant les Rameaux
        } else if (s[0] === 3 && s[1] === 25 && dansSemaineSainteOuOctave) {
          cible = add(A.E, 8);                          // lundi après le 2e dimanche de Pâques
        } else if (s[0] === 6 && s[1] === 24 && same(d, A.sacreCoeur)) {
          cible = add(d, -1);                           // la veille
        } else if (empeche) {
          cible = add(d, 1);                            // le lendemain
        }
        if (!same(cible, d)) e.reportee = 'Reportée cette année (normalement le ' + s[1] + (s[1] === 1 ? 'er' : '') + ' ' + MOIS[s[0] - 1] + ').';
      }
      m[iso(cible)] = e;
    });
    return (cacheSanct[y] = m);
  }

  /* Le jour liturgique complet */
  function jour(d) {
    if (typeof d === 'string') d = fromISO(d);
    var y = d.getUTCFullYear();
    var t = temporal(d);
    var s = sanctoral(y)[iso(d)];
    var c = {
      titre: t.titre, couleur: t.couleur, rang: t.rang, prec: t.prec,
      temps: t.temps, note: t.note || null, debut: t.debut || null
    };
    if (s && s.prec < t.prec) {
      c.titre = s.titre; c.couleur = s.couleur; c.rang = s.rang; c.prec = s.prec;
      var notes = [];
      if (s.reportee) notes.push(s.reportee);
      if (dow(d) === 0) notes.push('Remplace le ' + t.titre.charAt(0).toLowerCase() + t.titre.slice(1) + '.');
      c.note = notes.length ? notes.join(' ') : null;
    } else if (s) {
      c.note = (c.note ? c.note + ' ' : '') + 'La fête « ' + s.titre + ' » n’est pas célébrée cette année.';
    }
    var L = d >= an(y).avent1 ? y + 1 : y;            // année de fin de l'année liturgique
    c.date = d;
    c.iso = iso(d);
    c.dimanche = dow(d) === 0;
    c.tempsLabel = TEMPS[c.temps];
    c.couleurLabel = c.prec === 3 && c.rang === 'Commémoration' ? 'Violet (ou noir)' : COULEURS[c.couleur];
    c.annee = ['C', 'A', 'B'][L % 3];                  // cycle des dimanches
    c.anneeFerie = L % 2 ? 'I' : 'II';                 // cycle des féries
    c.important = c.dimanche || !!c.debut ||
      ['Solennité', 'Commémoration', 'Triduum pascal', 'Entrée en Carême'].indexOf(c.rang) >= 0 ||
      (c.rang === 'Fête' && c.prec <= 5);
    c.feteSaint = c.rang === 'Fête' && c.prec === 7;
    return c;
  }

  root.Liturgie = {
    jour: jour, paques: paques, an: an, D: D, add: add, diff: diff, iso: iso, fromISO: fromISO,
    JOURS: JOURS, MOIS: MOIS, COULEURS: COULEURS, cap: cap
  };
})(typeof window !== 'undefined' ? window : this);
