/**
 * Eddyline — ricezione lead dalle DUE landing
 * --------------------------------------------
 * Un solo progetto Apps Script (in un file Google Sheet ce n'è uno soltanto)
 * che serve entrambe le landing, smistando in due schede diverse:
 *
 *   "Informazioni"  ← landing attività  (prenota.eddyline.it — rafting/canyoning)
 *   "Viaggi"        ← landing viaggi    (camp: Madeira e il secondo)
 *
 * La scheda "Prenotazioni" è alimentata da Make (Calendly): questo script
 * NON la tocca in alcun modo.
 *
 * Lo smistamento usa il campo `source` che le landing inviano già:
 * 'landing-prenota' o 'landing-viaggi'. Se manca, ripiega sui campi presenti
 * nel payload (`viaggio` → viaggi, `attivita` → attività), così un vecchio
 * client che non manda `source` continua a funzionare.
 *
 * ⚠️ ATTENZIONE alle righe già presenti: se una scheda esiste con MENO
 * colonne di quelle attese (è il caso di "Viaggi" quando si aggiunge
 * "Partenza"), lo script ESTENDE la riga 1 al primo lead. Le righe già
 * scritte NON vengono spostate: i vecchi valori restano nelle loro colonne,
 * quindi rileggi le righe storiche sapendo che seguono il vecchio schema.
 * Se la scheda contiene solo righe di test, la via più pulita è svuotarla.
 *
 * ⚠️ QUESTO FILE SOSTITUISCE lo script attuale, ma NON cambia il
 * comportamento della landing attività: la parte "Informazioni" è identica
 * a prima (stesse colonne, stesso ordine, stessa mail). Aggiunge solo il ramo
 * dei viaggi. Il deployment esistente resta valido: NON serve creare una
 * nuova Web App per la landing attività, e il suo URL non cambia.
 *
 * COME AGGIORNARE
 * 1. Estensioni → Apps Script sul file "Eddyline - Contatti"
 * 2. Sostituisci tutto il contenuto con questo file
 * 3. Salva
 * 4. Deploy → Gestisci deployment → (il deployment esistente) → matita →
 *    Versione: "Nuova versione" → Distribuisci
 *    ⚠️ Questo passaggio è obbligatorio: senza, resta attiva la versione
 *    vecchia e il ramo viaggi non esiste.
 * 5. L'URL /exec NON cambia: la landing viaggi usa lo STESSO URL della
 *    landing attività. Mettilo in LEAD_WEBHOOK_URL su Vercel.
 *
 * VERIFICA: apri l'URL /exec nel browser → {"ok":true,...,"schede":[...]}
 */

// --- Schede di destinazione ------------------------------------------------
const SHEET_ATTIVITA = 'Informazioni'; // landing rafting/canyoning (esistente)
const SHEET_VIAGGI = 'Viaggi'; // landing camp/viaggi
// NOTA: la scheda "Prenotazioni" è alimentata da Make (Calendly), non da qui.
// Questo script non la legge e non la scrive: resta intatta.

// --- Destinatari delle notifiche ------------------------------------------
const NOTIFY_EMAIL = 'info@eddyline.it';
// Se le iscrizioni ai camp devono arrivare a un indirizzo diverso, cambia qui.
// Altrimenti lascia uguale a NOTIFY_EMAIL.
const NOTIFY_EMAIL_VIAGGI = 'info@eddyline.it';

// --- Intestazioni ---------------------------------------------------------
// Landing attività: IDENTICHE a prima. Non toccare: il foglio è già popolato.
const HEADERS_ATTIVITA = [
  'Data/ora',
  'Nome',
  'Email',
  'Telefono',
  'Attività',
  'Percorso/livello',
  'Data preferita',
  'N. persone',
  'Messaggio',
  'Fonte',
  'Mezzo',
  'Campagna',
  'Gruppo/Adset',
  'Annuncio/Keyword',
  'Landing',
];

// Landing viaggi: le crea lo script alla prima iscrizione.
const HEADERS_VIAGGI = [
  'Data/ora',
  'Nome',
  'Email',
  'Telefono',
  'Viaggio',
  'Partenza',
  'Esperienza outdoor',
  'Messaggio',
  'Fonte',
  'Mezzo',
  'Campagna',
  'Gruppo/Adset',
  'Annuncio/Keyword',
  'Landing',
  // Click-id: ricondurre l'iscrizione alla campagna in Google/Meta Ads.
  'gclid',
  'fbclid',
];

// Etichette leggibili per il campo "esperienza" del form viaggi.
const ESPERIENZA_LABEL = {
  'prima-volta': 'È la prima volta',
  'qualche-esperienza': 'Qualche esperienza',
  esperto: 'Pratica regolarmente',
};

/* =========================================================================
   Ingresso: smista in base alla provenienza
   ========================================================================= */
function doPost(e) {
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    const when = data.receivedAt ? new Date(data.receivedAt) : new Date();
    const stamp = Utilities.formatDate(when, 'Europe/Rome', 'dd/MM/yyyy HH:mm');

    if (isViaggi_(data)) {
      salvaViaggio_(data, stamp);
    } else {
      salvaAttivita_(data, stamp);
    }

    return json_({ ok: true });
  } catch (err) {
    console.error('doPost failed: ' + err);
    return json_({ ok: false, error: String(err) });
  }
}

/**
 * Il lead viene dalla landing viaggi?
 * `source` è l'indicatore primario; i campi del payload sono il ripiego.
 */
function isViaggi_(data) {
  if (data.source === 'landing-viaggi') return true;
  if (data.source === 'landing-prenota') return false;
  // Nessun source riconosciuto: decide la forma del payload.
  if (data.viaggio || data.viaggioNome) return true;
  if (data.attivita || data.percorso) return false;
  // Ultimo ripiego: la landing storica, per non perdere il lead.
  return false;
}

/* =========================================================================
   Ramo 1 — landing attività (comportamento IDENTICO a prima)
   ========================================================================= */
function salvaAttivita_(data, stamp) {
  const sheet = getOrCreateSheet_(SHEET_ATTIVITA, HEADERS_ATTIVITA);

  sheet.appendRow([
    stamp,
    data.nome || '',
    data.email || '',
    data.telefono || '',
    data.attivita || '',
    data.percorso || '',
    data.data || '',
    data.persone || '',
    data.messaggio || '',
    data.utm_source || '',
    data.utm_medium || '',
    data.utm_campaign || '',
    data.utm_content || '',
    data.utm_term || '',
    data.landing_page || '',
  ]);

  notificaAttivita_(data, stamp);
}

function notificaAttivita_(data, stamp) {
  try {
    const attivita = (data.attivita || '—').toString();
    const nome = data.nome || '—';
    const subject = 'Nuovo contatto dalla landing — ' + nome + ' (' + attivita + ')';
    const righe = [
      'È arrivata una nuova richiesta dal modulo della landing.',
      '',
      'Data/ora: ' + stamp,
      'Nome: ' + (data.nome || '—'),
      'Email: ' + (data.email || '—'),
      'Telefono: ' + (data.telefono || '—'),
      'Attività: ' + attivita,
      'Percorso/livello: ' + (data.percorso || '—'),
      'Data preferita: ' + (data.data || '—'),
      'N. persone: ' + (data.persone || '—'),
      'Messaggio: ' + (data.messaggio || '—'),
      '',
      'Il contatto è stato salvato nel foglio "' + SHEET_ATTIVITA + '".',
    ];
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: subject,
      body: righe.join('\n'),
      replyTo: data.email || undefined,
      name: 'Eddyline Landing',
    });
  } catch (err) {
    console.error('notificaAttivita_ failed: ' + err);
  }
}

/* =========================================================================
   Ramo 2 — landing viaggi
   ========================================================================= */
function salvaViaggio_(data, stamp) {
  const sheet = getOrCreateSheet_(SHEET_VIAGGI, HEADERS_VIAGGI);

  // Nome leggibile del viaggio; se manca, lo slug.
  const viaggio = data.viaggioNome || data.viaggio || '';
  const esperienza = etichettaEsperienza_(data.esperienza);

  sheet.appendRow([
    stamp,
    data.nome || '',
    data.email || '',
    data.telefono || '',
    viaggio,
    etichettaPartenza_(data.partenza),
    esperienza,
    data.messaggio || '',
    data.utm_source || '',
    data.utm_medium || '',
    data.utm_campaign || '',
    data.utm_content || '',
    data.utm_term || '',
    data.landing_page || '',
    data.gclid || '',
    data.fbclid || '',
  ]);

  notificaViaggio_(data, stamp, viaggio, esperienza);
}

/**
 * Etichetta leggibile della partenza scelta.
 * Gli id arrivano dalla landing (es. 'gen-2027'): li rendiamo leggibili senza
 * dover mantenere qui un elenco delle date, che cambierebbe a ogni viaggio.
 */
function etichettaPartenza_(valore) {
  if (!valore) return '';
  if (valore === 'indifferente') return 'Indifferente / flessibile';
  var MESI = {
    gen: 'gennaio', feb: 'febbraio', mar: 'marzo', apr: 'aprile',
    mag: 'maggio', giu: 'giugno', lug: 'luglio', ago: 'agosto',
    set: 'settembre', ott: 'ottobre', nov: 'novembre', dic: 'dicembre'
  };
  // 'mar-2027' → "marzo 2027"; 'mar-24-2027' → "24 marzo 2027" (serve quando
  // un viaggio ha più partenze nello stesso mese, come Maiorca 24 e 25 marzo).
  var m = String(valore).match(/^([a-z]{3})-(?:(\d{1,2})-)?(\d{4})$/);
  if (m && MESI[m[1]]) {
    return (m[2] ? m[2] + ' ' : '') + MESI[m[1]] + ' ' + m[3];
  }
  return valore;
}

function etichettaEsperienza_(valore) {
  if (!valore) return 'Non specificato';
  return ESPERIENZA_LABEL[valore] || valore;
}

function notificaViaggio_(data, stamp, viaggio, esperienza) {
  try {
    const nome = data.nome || '—';
    const subject = 'Nuova iscrizione — ' + nome + (viaggio ? ' · ' + viaggio : '');
    const righe = [
      'È arrivata una nuova richiesta di iscrizione dalla landing viaggi.',
      '',
      'Data/ora:   ' + stamp,
      'Nome:       ' + (data.nome || '—'),
      'Email:      ' + (data.email || '—'),
      'Telefono:   ' + (data.telefono || '—'),
      'Viaggio:    ' + (viaggio || '—'),
      'Partenza:   ' + (etichettaPartenza_(data.partenza) || '—'),
      'Esperienza: ' + (esperienza || '—'),
      'Messaggio:  ' + (data.messaggio || '—'),
      '',
      '--- da dove arriva ---',
      'Fonte:      ' + (data.utm_source || '—'),
      'Mezzo:      ' + (data.utm_medium || '—'),
      'Campagna:   ' + (data.utm_campaign || '—'),
      '',
      'Il contatto è stato salvato nel foglio "' + SHEET_VIAGGI + '".',
    ];
    MailApp.sendEmail({
      to: NOTIFY_EMAIL_VIAGGI,
      subject: subject,
      body: righe.join('\n'),
      replyTo: data.email || undefined,
      name: 'Eddyline Viaggi',
    });
  } catch (err) {
    console.error('notificaViaggio_ failed: ' + err);
  }
}

/* =========================================================================
   Utility
   ========================================================================= */

/** Test dal browser: apri l'URL /exec. */
function doGet() {
  return json_({
    ok: true,
    service: 'eddyline-lead',
    schede: [SHEET_ATTIVITA, SHEET_VIAGGI],
    ts: new Date().toISOString(),
  });
}

function getOrCreateSheet_(nome, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(nome);
  if (!sheet) {
    sheet = ss.insertSheet(nome);
  }

  // Foglio vuoto: scrivi le intestazioni.
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
    return sheet;
  }

  /* Foglio già esistente: se le colonne sono AUMENTATE (es. l'aggiunta di
     "Partenza"), la riga 1 va estesa — altrimenti i valori scritti slittano
     rispetto alle intestazioni. Aggiorniamo solo se il numero è cambiato:
     non toccare un foglio già allineato. */
  const attuali = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const nonVuote = attuali.filter(function (v) {
    return String(v).trim() !== '';
  }).length;

  if (nonVuote !== headers.length) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
    console.log(
      'Intestazioni di "' + nome + '" aggiornate: da ' + nonVuote + ' a ' + headers.length + ' colonne.'
    );
  }

  return sheet;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

/* =========================================================================
   Test da eseguire dall'editor (menu a tendina → Esegui).
   Scrivono una riga di prova SENZA passare dal sito: servono a verificare
   permessi, schede e smistamento. Poi cancella le righe "TEST".
   ========================================================================= */

/** Verifica il ramo VIAGGI, partenza singola → scheda "Viaggi". */
function testaViaggio() {
  doPost({
    postData: {
      contents: JSON.stringify({
        source: 'landing-viaggi',
        receivedAt: new Date().toISOString(),
        nome: 'TEST viaggi — cancellami',
        email: 'test@example.com',
        telefono: '3330000000',
        viaggio: 'madeira',
        viaggioNome: 'Adventure Camp Madeira',
        partenza: 'ott-2026',
        esperienza: 'prima-volta',
        messaggio: 'Riga di prova: partenza singola.',
        utm_source: 'test',
        utm_medium: 'manuale',
        landing_page: '/viaggi/madeira',
      }),
    },
  });
}

/**
 * Verifica il ramo VIAGGI con un id che contiene anche il GIORNO: la colonna
 * "Partenza" deve riportare "24 marzo 2027", non l'id grezzo 'mar-24-2027'.
 * Se leggi l'id grezzo, stai girando sulla versione vecchia dello script:
 * non è stata ridistribuita.
 */
function testaViaggioPartenze() {
  doPost({
    postData: {
      contents: JSON.stringify({
        source: 'landing-viaggi',
        receivedAt: new Date().toISOString(),
        nome: 'TEST partenza — cancellami',
        email: 'test@example.com',
        telefono: '3330000001',
        viaggio: 'maiorca',
        viaggioNome: 'Adventure Camp Maiorca',
        partenza: 'mar-24-2027',
        esperienza: 'esperto',
        messaggio: 'Riga di prova: partenza con giorno nell’id.',
        utm_source: 'test',
        utm_medium: 'manuale',
        gclid: 'TEST_GCLID',
        landing_page: '/viaggi/maiorca',
      }),
    },
  });
}

/** Verifica che il ramo ATTIVITÀ continui a funzionare come prima. */
function testaAttivita() {
  doPost({
    postData: {
      contents: JSON.stringify({
        source: 'landing-prenota',
        receivedAt: new Date().toISOString(),
        nome: 'TEST attività — cancellami',
        email: 'test@example.com',
        telefono: '3330000000',
        attivita: 'rafting',
        percorso: 'Classico',
        data: '15/07/2026',
        persone: '4',
        messaggio: 'Riga di prova: ramo attività.',
        utm_source: 'test',
        utm_medium: 'manuale',
        landing_page: '/rafting',
      }),
    },
  });
}
