/*
 * Jour liturgique — brèves explications des fêtes et liens « En savoir plus ».
 *
 * Clé : 'MM-JJ' pour les fêtes à date fixe (date normale, même si la fête est reportée),
 *       ou un nom pour les fêtes mobiles (paques, ascension…).
 * t   : explication courte
 * cef : page du glossaire de l'Église catholique en France (eglise.catholique.fr/glossaire/<cef>/)
 * nom : fiche Nominis (nominis.cef.fr/contenus/saint/<nom>)
 * Vatican News (saint du jour) est ajouté automatiquement pour les clés 'MM-JJ'.
 * AELF (lectures de la messe) est proposé pour tous les jours.
 * Tous les liens ont été vérifiés le 15 novembre 2026.
 */
(function (root) {
  'use strict';

  var E = {
    /* ---------- Fêtes mobiles et temps ---------- */
    'avent1': { t: 'L’Avent ouvre la nouvelle année liturgique : quatre semaines pour préparer Noël, dans l’attente de la venue du Christ.', cef: 'avent' },
    'gaudete': { t: '« Gaudete » veut dire « Réjouissez-vous ». À mi-parcours de l’Avent, la joie de Noël approche : on peut porter le rose.', cef: 'avent' },
    'sainte-famille': { t: 'Jésus, Marie et Joseph, modèle pour toutes les familles chrétiennes. Fêtée le dimanche qui suit Noël (ou le 30 décembre).' },
    'epiphanie': { t: 'Les mages venus d’Orient adorent l’enfant Jésus : le Christ se manifeste à toutes les nations. En France, fêtée le dimanche entre le 2 et le 8 janvier.', cef: 'epiphanie' },
    'bapteme': { t: 'Jésus est baptisé par Jean dans le Jourdain ; l’Esprit descend sur lui et le Père le désigne comme son Fils bien-aimé. Cette fête clôt le temps de Noël.' },
    'cendres': { t: 'Entrée en Carême : le prêtre impose les cendres en disant « Convertissez-vous et croyez à l’Évangile ». Jour de jeûne et d’abstinence.', cef: 'cendres' },
    'laetare': { t: '« Laetare » veut dire « Réjouis-toi ». À mi-Carême, la joie de Pâques s’annonce : on peut porter le rose.', cef: 'laetare' },
    'rameaux': { t: 'Entrée de Jésus à Jérusalem, acclamé avec des rameaux, puis lecture de la Passion. La messe commence par la bénédiction des rameaux et la procession.', cef: 'rameaux' },
    'jeudi-saint': { t: 'Le soir, messe de la Cène du Seigneur : institution de l’Eucharistie et du sacerdoce, lavement des pieds, puis transfert du Saint-Sacrement au reposoir.', cef: 'jeudi-saint' },
    'vendredi-saint': { t: 'Mort de Jésus sur la croix. Pas de messe : lecture de la Passion selon saint Jean, grande prière universelle, vénération de la croix et communion.', cef: 'vendredi-saint' },
    'samedi-saint': { t: 'Jour de silence auprès du tombeau. Le soir, la Vigile pascale, « mère de toutes les vigiles » : feu nouveau, cierge pascal, Exultet et baptêmes.', cef: 'vigile-pascale-et-dimanche-de-paques' },
    'paques': { t: 'Résurrection du Christ, cœur de la foi chrétienne et plus grande fête de l’année. Le temps pascal dure cinquante jours, jusqu’à la Pentecôte.', cef: 'vigile-pascale-et-dimanche-de-paques' },
    'octave-paques': { t: 'Les huit jours qui suivent Pâques sont célébrés comme un seul grand jour de fête : chaque messe est celle d’une solennité.', cef: 'vigile-pascale-et-dimanche-de-paques' },
    'misericorde': { t: 'Dernier jour de l’octave de Pâques. Saint Jean-Paul II en a fait en 2000 le dimanche de la Divine Miséricorde.' },
    'ascension': { t: 'Quarante jours après Pâques, Jésus monte au ciel auprès du Père. En France, fêtée le jeudi.', cef: 'ascension' },
    'pentecote': { t: 'Cinquante jours après Pâques, l’Esprit Saint descend sur les apôtres réunis avec Marie : c’est la naissance de l’Église.', cef: 'pentecote' },
    'trinite': { t: 'Le dimanche après la Pentecôte, on célèbre le mystère d’un seul Dieu en trois personnes : le Père, le Fils et le Saint-Esprit.', cef: 'trinite' },
    'saint-sacrement': { t: 'La Fête-Dieu célèbre la présence réelle du Christ dans l’Eucharistie, souvent avec une procession du Saint-Sacrement.', cef: 'fete-dieu' },
    'sacre-coeur': { t: 'On fête l’amour du Christ pour tous les hommes, symbolisé par son cœur. Dévotion répandue depuis les apparitions à sainte Marguerite-Marie, à Paray-le-Monial.', cef: 'sacre-coeur' },
    'christ-roi': { t: 'Dernier dimanche de l’année liturgique : le Christ est Roi de l’univers, un roi de paix et de service. Fête instituée par Pie XI en 1925.', cef: 'christ-roi' },

    /* ---------- Fêtes à date fixe ---------- */
    '01-01': { t: 'Huit jours après Noël, on fête Marie, Mère de Dieu (concile d’Éphèse, en 431). C’est aussi la Journée mondiale de la paix.', nom: '349/Sainte-Marie--m%C3%A8re-de-Dieu.html' },
    '01-25': { t: 'Sur le chemin de Damas, Saul, qui persécutait les chrétiens, rencontre le Christ ressuscité et devient l’apôtre Paul.', cef: 'apotre', nom: '500/Conversion-de-Saint-Paul.html' },
    '02-02': { t: 'Quarante jours après Noël, Marie et Joseph présentent Jésus au Temple ; le vieillard Syméon le reconnaît comme « la lumière des nations ». On bénit les cierges : c’est la Chandeleur.', cef: 'chandeleur', nom: '549/Pr%C3%A9sentation-de-J%C3%A9sus-au-Temple.html' },
    '02-22': { t: 'On fête la mission confiée par Jésus à Pierre et à ses successeurs, les papes : guider et unir l’Église.', cef: 'apotre', nom: '899/Saint-Pierre.html' },
    '03-19': { t: 'Époux de Marie et père nourricier de Jésus, homme juste et silencieux. Patron de l’Église universelle.', nom: '833/Saint-Joseph.html' },
    '03-25': { t: 'L’ange Gabriel annonce à Marie qu’elle sera la mère du Sauveur, et Marie dit « oui ». Neuf mois avant Noël.', cef: 'annonciation', nom: '856/Annonciation.html' },
    '04-25': { t: 'Auteur du plus ancien des quatre évangiles, compagnon de Pierre et de Paul. Son symbole est le lion.', nom: '1033/Saint-Marc.html' },
    '05-03': { t: 'Deux des douze apôtres. Philippe, de Bethsaïde, conduit Nathanaël à Jésus ; Jacques, dit le Mineur, guida l’Église de Jérusalem.', cef: 'apotre', nom: '1086/Saint-Philippe.html' },
    '05-14': { t: 'Choisi par les apôtres après l’Ascension pour remplacer Judas parmi les Douze.', cef: 'apotre', nom: '1154/Saint-Matthias.html' },
    '05-31': { t: 'Marie, qui porte Jésus, rend visite à sa cousine Élisabeth, enceinte de Jean-Baptiste, et chante le Magnificat.', cef: 'visitation', nom: '1252/Visitation-de-la-Vierge-Marie.html' },
    '06-24': { t: 'Naissance de Jean-Baptiste, le précurseur, qui prépara la venue de Jésus et le baptisa. Avec Marie et Jésus, le seul dont on fête la naissance.', nom: '1380/Saint-Jean-Baptiste.html' },
    '06-29': { t: 'Les deux colonnes de l’Église, martyrs à Rome : Pierre, le premier des apôtres, et Paul, l’apôtre des nations.', cef: 'apotre', nom: '899/Saint-Pierre.html' },
    '07-03': { t: 'L’apôtre qui voulut toucher les plaies du Christ ressuscité avant de s’écrier : « Mon Seigneur et mon Dieu ! »', cef: 'apotre', nom: '296/Saint-Thomas.html' },
    '07-22': { t: 'Disciple de Jésus et première témoin de sa résurrection, appelée « l’apôtre des apôtres ». Sa mémoire est devenue une fête en 2016.', nom: '1549/Sainte-Marie-Madeleine.html' },
    '07-25': { t: 'Jacques le Majeur, frère de Jean, premier des apôtres à mourir martyr. Son tombeau à Compostelle attire des pèlerins du monde entier.', cef: 'apotre', nom: '1094/Saint-Jacques-le-Majeur.html' },
    '08-06': { t: 'Sur une haute montagne, Jésus apparaît dans sa gloire devant Pierre, Jacques et Jean, entre Moïse et Élie.', cef: 'transfiguration', nom: '1633/Transfiguration-du-Seigneur.html' },
    '08-10': { t: 'Diacre de l’Église de Rome chargé des pauvres, martyrisé en 258. Patron des diacres.', cef: 'martyr', nom: '1652/Saint-Laurent-de-Rome.html' },
    '08-15': { t: 'Au terme de sa vie terrestre, Marie est élevée avec son corps et son âme dans la gloire du ciel. C’est la fête patronale de la France.', cef: 'assomption', nom: '980/Assomption-de-la-Vierge-Marie.html' },
    '08-24': { t: 'Apôtre souvent identifié à Nathanaël, que Jésus appela « un véritable Israélite, sans ruse ».', cef: 'apotre', nom: '1725/Saint-Barth%C3%A9lemy.html' },
    '09-08': { t: 'Naissance de la Vierge Marie, neuf mois après la fête de l’Immaculée Conception.', nom: '1816/Nativit%C3%A9-de-la-Vierge-Marie.html' },
    '09-14': { t: 'On honore la croix du Christ, signe de sa victoire sur la mort. La fête rappelle la découverte de la Croix à Jérusalem au IVe siècle.', nom: '1850/Exaltation-de-la-sainte-Croix.html' },
    '09-21': { t: 'Collecteur d’impôts devenu apôtre, auteur du premier évangile. Son symbole est l’homme ailé.', cef: 'apotre', nom: '1066/Saint-Matthieu.html' },
    '09-29': { t: 'Trois archanges : Michel, qui combat le mal ; Gabriel, messager de l’Annonciation ; Raphaël, qui guérit et accompagne Tobie.', cef: 'anges', nom: '978/Saint-Michel.html' },
    '10-18': { t: 'Médecin et compagnon de saint Paul, auteur d’un évangile et des Actes des Apôtres. Son symbole est le taureau.', nom: '2037/Saint-Luc.html' },
    '10-28': { t: 'Deux apôtres qui, selon la tradition, annoncèrent ensemble l’Évangile et moururent martyrs.', cef: 'apotre', nom: '2094/Saint-Simon-le-Canan%C3%A9en.html' },
    '11-01': { t: 'On fête tous les saints, connus ou inconnus, qui vivent auprès de Dieu, et l’appel de chacun à la sainteté.', cef: 'toussaint', nom: '169/Tous-les-saints.html' },
    '11-02': { t: 'Au lendemain de la Toussaint, l’Église prie pour tous les défunts, afin qu’ils entrent dans la lumière de Dieu.', nom: '170/Comm%C3%A9moration-des-d%C3%A9funts.html' },
    '11-09': { t: 'Anniversaire de la consécration de la cathédrale du pape, « mère et tête de toutes les églises » : on célèbre l’unité de l’Église autour de l’évêque de Rome.', cef: 'dedicace', nom: '174/D%C3%A9dicace-de-la-Basilique-du-Latran.html' },
    '11-30': { t: 'Frère de Pierre, le premier appelé parmi les apôtres. Selon la tradition, il fut crucifié sur une croix en forme de X.', cef: 'apotre', nom: '25/Saint-Andr%C3%A9.html' },
    '12-08': { t: 'Marie a été préservée du péché originel dès sa conception, pour devenir la Mère du Sauveur (dogme proclamé en 1854). À ne pas confondre avec la conception de Jésus.', cef: 'immaculee-conception', nom: '235/Immacul%C3%A9e-Conception.html' },
    '12-25': { t: 'Naissance de Jésus à Bethléem : Dieu se fait homme. Noël se célèbre en plusieurs messes : la veille au soir, la nuit, l’aurore et le jour.', cef: 'noel', nom: '312/Nativit%C3%A9-du-Christ.html' },
    '12-26': { t: 'Diacre de Jérusalem et premier martyr chrétien, lapidé en pardonnant à ses bourreaux.', cef: 'martyr', nom: '315/Saint-%C3%89tienne.html' },
    '12-27': { t: 'Le disciple que Jésus aimait, auteur du quatrième évangile ; au pied de la croix, il reçoit Marie chez lui. Son symbole est l’aigle.', cef: 'apotre', nom: '321/Saint-Jean-l-%C3%A9vang%C3%A9liste.html' },
    '12-28': { t: 'Les enfants de Bethléem tués sur ordre du roi Hérode, qui cherchait à faire mourir Jésus.', cef: 'martyr', nom: '325/Saints-Innocents.html' }
  };

  /* Liens « En savoir plus » d'un jour : [{ nom, url }] */
  function liens(jour) {
    var e = jour.cle && E[jour.cle], l = [];
    if (e && e.cef) l.push({ nom: 'Église catholique', url: 'https://eglise.catholique.fr/glossaire/' + e.cef + '/' });
    if (e && e.nom) l.push({ nom: 'Nominis', url: 'https://nominis.cef.fr/contenus/saint/' + e.nom });
    if (jour.cle && /^\d\d-\d\d$/.test(jour.cle))
      l.push({ nom: 'Vatican News', url: 'https://www.vaticannews.va/fr/saint-du-jour/' + jour.cle.replace('-', '/') + '.html' });
    l.push({ nom: 'Lectures du jour (AELF)', url: 'https://www.aelf.org/' + jour.iso + '/romain/messe' });
    return l;
  }

  root.Explications = {
    texte: function (jour) { var e = jour.cle && E[jour.cle]; return e ? e.t : null; },
    liens: liens,
    toutes: E
  };
})(typeof window !== 'undefined' ? window : this);
