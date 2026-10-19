# Tracking — cosa aggiungere in GTM

Container: **`GTM-55ZJ7TMT`**, lo stesso della landing attività
(`prenota.eddyline.it`). Il tag GA4 di base e il consenso sono già configurati
lì: **non li tocchiamo**. Serve solo aggiungere trigger e tag per la landing
viaggi.

Il sito **emette già** gli eventi. Qui c'è solo il lavoro da fare nel pannello.

---

## Cosa manda la landing viaggi

| Evento | Quando | Parametri |
|---|---|---|
| `form_submit` | invio riuscito del form | `form: 'iscrizione_camp'`, `viaggio: '<slug>'` |
| `lead_thank_you` | pagina `/grazie-viaggio` raggiunta | `viaggio: '<slug>'` |
| `whatsapp_click` | click su un link WhatsApp | — |
| `call_click` | click su un link telefono | — |

`form_submit` scatta **solo a invio riuscito**, non al click sul bottone: non
conta tentativi falliti né spam bloccati. Subito dopo il sito va su
`/grazie-viaggio?v=<slug>`, che emette `lead_thank_you`.

Useremo la **pageview di `/grazie-viaggio`** come conversione, per allinearci a
come è già tracciata l'altra landing.

---

## Come è configurato il container (verificato)

Trigger già presenti:

| Trigger | Tipo | Filtro |
|---|---|---|
| `CE - activity_selected` | evento personalizzato | — |
| `CE - call_click` | evento personalizzato | nessuno |
| `CE - whatsapp_click` | evento personalizzato | nessuno |
| `PV - grazie (form)` | pageview | `Page Path` = `^/grazie$` |
| `PV - grazie prenotazione` | pageview | `Page Path` = `^/grazie-prenotazione$` |

Due conseguenze:

**1. La landing attività traccia il form via PAGEVIEW della thank-you page**,
non con `form_submit` (non esiste un trigger `CE - form_submit`). Ci allineiamo
a quella convenzione.

**2. `PV - grazie (form)` intercetta `^/grazie$`.** Per questo la thank-you page
dei viaggi sta su **`/grazie-viaggio`**: con lo stesso path le iscrizioni ai
camp verrebbero contate come conversioni della landing rafting.

**Click di contatto**: `CE - call_click` e `CE - whatsapp_click` non hanno
filtro, quindi valgono per entrambe le landing — scelta deliberata, i click
contano insieme. Nessuna modifica ai trigger esistenti: **non tocchiamo niente
di ciò che funziona**, aggiungiamo solo cose nuove.

---

## 1. Variabile

**Variabili → Definite dall'utente → Nuova → URL**

| Campo | Valore |
|---|---|
| Tipo di componente | Query |
| Nome chiave query | `v` |

Nome: `URL - viaggio`

⚠️ **Non usare una variabile livello dati** per il viaggio: il trigger è una
pageview e scatta su `gtm.js`, prima che lo script della pagina scriva nel
dataLayer — il valore risulterebbe vuoto. L'URL invece è disponibile subito.

---

## 2. Trigger

**Trigger → Nuovo → Visualizzazione di pagina** → Alcune visualizzazioni

| Campo | Valore |
|---|---|
| Variabile | `Page Path` |
| Operatore | corrisponde all'espressione regolare |
| Valore | `^/grazie-viaggio$` |

Nome: `PV - grazie viaggio`

Stessa forma di `PV - grazie (form)`, path diverso: nessuna sovrapposizione.
**Nessun trigger esistente da modificare.**

---

## 3. Tag

### GA4

**Tag → Nuovo → Google Analytics: evento GA4**

| Campo | Valore |
|---|---|
| ID misurazione | `G-KZPYD556V1` |
| Nome evento | `generate_lead` |
| Parametro | `viaggio` → `{{URL - viaggio}}` |
| Parametro | `landing` → `viaggi` |
| Attivazione | `PV - grazie viaggio` |

Nome: `GA4 - Viaggi iscrizione`

Nel campo ID misurazione non c'è un elenco da cui scegliere: va incollato a
mano. Lo trovi in GA4 → Amministrazione → Stream di dati.

### Meta Pixel

**Tag → Nuovo → HTML personalizzato**

```html
<script>fbq('track', 'Lead');</script>
```

| Campo | Valore |
|---|---|
| Sequenza tag | attiva `Meta Pixel - Base` **prima** di questo tag |
| Consenso | «Non impostata» (erede dal Consent Mode) |
| Attivazione | `PV - grazie viaggio` |

Nome: `Meta Pixel - Viaggi Lead`

---

## 4. Google Ads

Da fare quando parti con le campagne:

1. Google Ads → **Obiettivi → Conversioni → Nuova azione → Importa da GA4**
2. Importa `generate_lead`

Se è già importato per l'altra landing, la conversione conta entrambe. Per
ottimizzare le campagne del camp separatamente, aggiungi un tag **Google Ads
Conversion Tracking** dedicato sul trigger `PV - grazie viaggio`, con
Conversion ID/Label propri.

Valore: un lead non è una vendita. Se ne assegni uno, usa il margine atteso per
lead, non i €890 pieni.

---

## 5. Verifica prima di pubblicare

1. GTM → **Anteprima**, incolla `https://eddyline-viaggi.vercel.app`
2. **Accetta i cookie.** Con consenso negato GA4 non manda nulla: è Consent
   Mode che funziona, non un errore. È l'errore più comune in questa verifica.
3. Compila e invia il form. Fra i **Tag attivati** devi vedere
   `GA4 - Viaggi iscrizione` e `Meta Pixel - Viaggi Lead`.
4. Apri il tag GA4 **dall'evento nella colonna di sinistra** (non dal
   Riepilogo, altrimenti manca il selettore) e metti «Mostra le variabili
   come» su **Valori**. Deve risultare:
   `{parameter: "viaggio", parameterValue: "madeira"}`
5. **Controlla che NON scattino i tag dell'altra landing**
   (`GA4 - Evento - lead form`, `Meta Pixel - Lead`): è la prova che i due
   percorsi sono separati.
6. GA4 → **Tempo reale**: entro un minuto compare `generate_lead`.
7. Solo allora **Pubblica**.

Nota sui contatori "Attivato 2 volte" di `GA4 - Configurazione` e
`Meta Pixel - Base`: è corretto, sono due pageview (scheda + thank-you page).

Nota: in preview il form manda un lead **vero** al foglio. Usa un nome
riconoscibile (es. "TEST GTM") e poi cancella la riga dalla scheda `Viaggi`.

---

## Quando aggiungerai il secondo viaggio

Nulla da rifare: il parametro `viaggio` cambia da solo (`madeira` → nuovo
slug). In GA4 puoi confrontare le iscrizioni per viaggio senza toccare GTM.

---

## Se un giorno separi il container

`PUBLIC_GTM_CONTAINER_ID` su Vercel col nuovo ID, poi redeploy. Nel codice non
cambia nulla, e il problema dei doppioni sparisce da sé.

---

## Consent Mode — già a posto

Default `denied` su tutti i tipi di consenso, `url_passthrough` e
`ads_data_redaction` attivi: le conversioni senza consenso vengono **modellate**
da Google, non perse.

Nulla da configurare: i tag rispettano il consenso perché GTM è caricato dopo i
default. Verifica solo che i nuovi tag GA4 abbiano, in **Impostazioni avanzate
→ Consent Settings**, il comportamento predefinito («Non impostato»), così
ereditano il consenso invece di forzarlo.
