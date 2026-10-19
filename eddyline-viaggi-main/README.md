# Eddyline Viaggi

Landing di conversione per i camp di avventura Eddyline: **Madeira** (canyoning
e mental coaching, ottobre 2026) e **Maiorca** (canyoning e trekking, dal 24
al 29 marzo 2027). Stesso design system della landing attività (`eddy-line.vercel.app`),
progetto e deploy separati.

Online: https://eddyline-viaggi.vercel.app

## Stack

Astro 5 · Tailwind 4 · adapter Vercel · output `static` + una serverless
function per il form.

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # astro check + build
```

## Deploy

Il progetto Vercel sta sull'account di Filippo, piano **Hobby**: vengono
costruiti **solo** i commit firmati da `filippobosco`. Un push da un altro
account finisce `Blocked`, e non lo aggirano né il Redeploy né un Deploy Hook:
entrambi ricostruiscono lo stesso commit, e il commit è il problema.

Per pubblicare una modifica scritta da qualcun altro, il commit va originato
dall'account autorizzato: si apre il file su github.com con l'account
`filippobosco`, si modifica dall'editor web e si sceglie **Commit directly to
the main branch**. Il commit nasce già firmato e Vercel lo costruisce — anche
se il lavoro vero è arrivato con push precedenti, perché la build parte sempre
dalla punta di `main`.

L'alternativa è il passaggio a **Pro**, che toglie il vincolo e permette di
aggiungere membri al progetto.

## Struttura

```
src/
  data/content.ts             ← TUTTI i contenuti: array `viaggi` + parti condivise
  config.ts                   ← URL, webhook, asset (override via .env)
  layouts/BaseLayout          ← Consent Mode v2, GTM, attribuzione, motion
  components/
    HeroVetrina.astro         ← hero della home (brand, non un viaggio)
    SceltaViaggi.astro        ← le card della home
    PaginaViaggio.astro       ← ordine delle sezioni di una scheda
    AltriViaggi.astro         ← le altre proposte, in fondo alla scheda
    …                         ← una sezione per file, tutte con prop `viaggio`
  pages/index.astro           ← homepage-vetrina: hero + le due card
  pages/viaggi/[slug].astro   ← scheda completa di ogni viaggio
  pages/grazie-viaggio.astro  ← conferma post-iscrizione (?v=<slug>)
  pages/api/lead.ts           ← endpoint form (anti-spam + inoltro webhook)
public/images/                ← foto ottimizzate (WebP + JPEG, 1600/960px)
```

## Architettura: vetrina + schede

La **homepage è una vetrina minima**: hero di brand, un invito esplicito a
scegliere, le card. Nessun form, nessuna sticky CTA, nessun contenuto di
viaggio. L'unica azione possibile è aprire una scheda — la scelta è di fatto
obbligata senza essere bloccante (nessun modal): la pagina semplicemente non
offre altro.

Ogni viaggio ha la sua **scheda completa** su `/viaggi/<slug>`: esperienza,
programma, guide, gallery, sicurezza, quota, form, FAQ, più le altre proposte
in fondo.

I viaggi stanno nell'array `viaggi` in `content.ts`. Due campi li governano:

| Campo | Effetto |
|---|---|
| `ordine: 1 \| 2` | Posizione della card in homepage. Scambia i valori per invertirle. |
| `pubblicato: true` | Genera `/viaggi/<slug>` e rende la card cliccabile. |
| `partenze: [...]` | Le date. Una o più per destinazione. |

### Destinazioni e partenze

Un viaggio = una **destinazione**, con una o più **partenze** (date). La
divisione è per destinazione, non per data: chi arriva scegli il posto prima
della data, e due card gemelle differenti per una sola riga si
cannibalizzerebbero.

Con più partenze il form mostra un selettore obbligatorio, e il foglio riceve
la colonna `Partenza`: sai subito chi vuole quale data.

⚠️ Aggiungendo la colonna `Partenza` va **aggiornato lo Apps Script** sul
foglio (vedi `docs/apps-script-lead.gs`) e ridistribuita la Web App.

Un viaggio con `pubblicato: false` resta **alla pari nella vetrina** — stessa
dimensione, stessa posizione — ma con foto desaturata, badge PROSSIMAMENTE e un
link WhatsApp invece del link alla scheda. Raccoglie interesse prima
dell'apertura senza mandare su una pagina vuota.

Le sezioni con contenuti vuoti **si nascondono da sole**: un viaggio senza
programma o gallery non mostra intestazioni vuote.

### Completare Maiorca

Date e quota sono **confermate** dal cliente (21/09/2026): partenza unica
24 → 29 marzo 2027, 6 giorni / 5 notti, quota 910 € con acconto 300 e saldo
610, come Madeira. Il programma è quello fornito dal cliente.

Confermati anche incluso, non incluso e FAQ (21/09/2026): le FAQ sono adattate
da quelle di Madeira su indicazione del cliente. Con `incluso` pieno tornano
visibili anche le sezioni **Quota** e **Sicurezza**, che `haQuota` in
`PaginaViaggio.astro` teneva nascoste: acconto e saldo ora si vedono davvero.

Restano in attesa di risposta dal cliente, ma nessuno di questi nasconde
sezioni o blocca la pagina:

- **Nota assicurazione** — per Madeira dice che Imaway copre il canyoning; per
  Maiorca non è confermato, quindi `notaAssicurazione` è vuota.
- **Grotte marine del giorno 5** — comprese nella quota o extra? Finché non si
  sa, nessuna FAQ le nomina.
- **Numero massimo di partecipanti** — per Madeira sono 8, per Maiorca ignoto:
  la FAQ sui posti limitati resta generica.
- **Mental coaching** — la trust strip promette "ogni giornata", ma nel
  programma respirazione e meditazione compaiono solo in alcune giornate. La
  FAQ è stata scritta senza quella promessa; la trust strip no, è condivisa.
- **Guide** — si assume Federico e Christian come su Madeira.
- **Madeira, "1 trekking panoramico guidato"** in `incluso`: il programma del
  cliente ne prevede due, giorno 3 e giorno 5. Da correggere quando risponde.

Resta un disallineamento editoriale, indipendente dal cliente: **hero ed
Esperienza raccontano un viaggio diverso dal programma**. L'hero dice "Sotto la
roccia, dentro il mare" e i quattro blocchi dell'Esperienza sono costruiti su
grotte marine e laghi sotterranei, ma nel programma le grotte compaiono solo al
giorno 5, in alternativa a un trekking e solo se il mare lo consente: il cuore
sono due giornate di canyoning. È una riscrittura da fare, non una domanda.

Il design system (`styles/tokens.css`, `styles/global.css`) è copiato
**invariato** dalla landing attività: palette, tipografia, "linea di corrente"
e primitive dei bottoni restano allineate. Se cambia lì, va riportato qui.

## Da completare prima del go-live

1. **`LEAD_WEBHOOK_URL`** — l'endpoint del form. Consigliato un foglio/endpoint
   **separato** da quello della landing attività, così le iscrizioni al camp non
   si mescolano ai lead di rafting/canyoning. Senza webhook il form funziona e
   logga il lead, ma non lo inoltra. Ogni lead porta `viaggio` (slug) e
   `viaggioNome`, più `partenza` quando il viaggio ha più date: un solo foglio,
   righe etichettate.
2. ~~**Programmi giorno-per-giorno**~~ — fatti: entrambi arrivati dal cliente
   il 17/09/2026. Quello di Madeira è allineato a christianbalsamo.it/madeira,
   e nella vecchia bozza i giorni della settimana erano sfalsati di uno.
3. **Contenuti Maiorca** — vedi "Completare Maiorca". Date, quota, programma,
   incluso e FAQ sono confermati. Restano sospesi alcuni dettagli in attesa di
   risposta dal cliente, nessuno dei quali nasconde sezioni.
4. **Dominio** — `astro.config.mjs` punta a `viaggi.eddyline.it`; aggiornare
   anche `PUBLIC_SITE_URL` su Vercel.
5. **GTM** — il sito emette già gli eventi; va configurato il lato GTM
   (trigger + tag + conversione GA4). Lista operativa in
   [docs/gtm-setup.md](docs/gtm-setup.md).
6. **Logo** — ora arriva da eddyline.it a 176×67px: sfocato su retina e
   dipendente dal WordPress. Serve un SVG o un PNG ≥400px da mettere in
   `public/`.
7. **Link TripAdvisor** — `reputazione.tripadvisorUrl` in `content.ts` punta
   alla home di TripAdvisor: va sostituito con la pagina Eddyline.

## Scelte editoriali

Rispetto ai documenti di partenza:

- **Destinazione dichiarata**: i documenti dicevano solo "l'isola"; le foto
  (levadas, costa nord, botti di vino Madeira) la identificano come Madeira.
- **Durata 5 notti**: `Cosa_è_incluso.docx` diceva "4 notti", ma 13-18 ottobre
  sono 5. Confermato 5 notti / 6 giorni.
- **Bio Christian Balsamo**: nel .docx si interrompeva a metà frase, completata.
- **FAQ ripulite**: il .docx conteneva frammenti duplicati e troncati.
- **Foto delle guide**: non erano file nella cartella, erano incorporate dentro
  `Le_due_Guide.docx` — estratte da lì.
- **Gallery a 8 foto** (ridotta da 12) per contenere il peso su mobile. Le foto
  scartate restano nella cartella materiali originale, non nel repo.

- **Maiorca per destinazione, non per data**: i viaggi del cliente erano nello
  stesso posto in date diverse, quindi una destinazione con più partenze e non
  più card gemelle, che si sarebbero cannibalizzate. Dal 21/09/2026 la partenza
  è una sola, ma la struttura a `partenze[]` resta: serve di nuovo appena si
  aggiunge una data.

Ogni scelta è annotata nei commenti `[1]`…`[7]` in `src/data/content.ts`.

## Tracking

- `form_submit` (con `viaggio`: quale viaggio) · `whatsapp_click` · `call_click`
- Attribuzione last-touch (UTM + gclid/fbclid/msclkid) in `sessionStorage`,
  allegata al lead
- Consent Mode v2 con default `denied`, cookie banner con preferenze
- `noindex, nofollow`: è una landing paid

## Anti-spam del form

Honeypot (campo `website` nascosto) + time-trap (invio sotto i 2 secondi):
entrambi rispondono `ok` e scartano silenziosamente. Validazione doppia,
client e server.
