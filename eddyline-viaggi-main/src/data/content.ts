/**
 * Contenuti della landing "Eddyline Viaggi".
 *
 * STRUTTURA: un viaggio = una DESTINAZIONE, con una o più PARTENZE (date).
 * La divisione è per destinazione, non per data: chi arriva scegli il posto
 * prima della data, e due card gemelle differenti per una sola riga si
 * cannibalizzerebbero. Le partenze vivono dentro la scheda; il form fa
 * scegliere quale interessa, così il lead arriva già distinto.
 *
 * La homepage è una VETRINA minima (hero + le card): non racconta nessun
 * viaggio, obbliga a scegliere. Ogni destinazione ha la sua pagina completa
 * su /viaggi/[slug].
 *
 * `ordine` decide quale card viene per prima. Le parti condivise (guide,
 * protocollo sicurezza, contatti) stanno FUORI dall'array: si scrivono una
 * volta e i viaggi le referenziano per id.
 *
 * PER AGGIUNGERE I DATI DEL SECONDO VIAGGIO: cerca `PLACEHOLDER` più sotto.
 * Tutti i campi da riempire sono marcati.
 *
 * FONTE del camp Madeira: i 4 documenti in "MATERIALI LANDING EDDYLINE"
 *   - Informazioni_grenerali.docx  → periodo, costo, caparra, saldo
 *   - Le_due_Guide.docx            → bio Federico Maggiani + Christian Balsamo
 *   - Cosa_è_incluso.docx          → incluso / non incluso
 *   - Faq.docx                     → 20 FAQ
 *
 * NOTE EDITORIALI (da validare prima del go-live):
 *   [1] La destinazione non era nominata nei documenti: confermata "Madeira"
 *       (le foto mostrano levadas, costa nord e botti di vino Madeira).
 *   [2] Cosa_è_incluso diceva "4 notti" ma 13-18 ottobre sono 5 notti:
 *       confermato 5 notti / 6 giorni.
 *   [3] Il programma giorno-per-giorno è arrivato dal cliente il 17/09/2026 e
 *       ha sostituito la bozza dedotta dalle attività incluse. Nella bozza i
 *       giorni della settimana erano anche sfalsati di uno.
 *   [4] La bio di Christian Balsamo nel .docx si interrompeva a metà frase:
 *       completata.
 *   [5] Il .docx FAQ conteneva frammenti duplicati/troncati: qui ripuliti.
 */

/* ============================================================
   TIPI
   ============================================================ */

export interface Guida {
  id: string;
  nome: string;
  ruolo: string;
  img: string;
  qualifiche: string[];
  bio: string;
}

export interface GiornoProgramma {
  giorno: string;
  data: string;
  titolo: string;
  voci: string[];
}

export interface BloccoEsperienza {
  titolo: string;
  testo: string;
  img: string;
}

export interface Faq {
  q: string;
  a: string;
}

export interface FotoGallery {
  img: string;
  alt: string;
}

export interface Partenza {
  /** Identificativo breve, usato nel form e nel foglio (es. 'gen-2027'). */
  id: string;
  /** Periodo completo, leggibile: "30 gennaio — 5 febbraio 2027". */
  periodo: string;
  /** Forma compatta per badge e menu: "30 GEN — 5 FEB 2027". */
  periodoBreve: string;
  /** Durata di questa partenza. */
  durata: string;
  /** true quando le date sono ancora da confermare. */
  daConfermare?: boolean;
}

export interface Viaggio {
  /** Usato nell'URL: /viaggi/<slug> */
  slug: string;
  /** Posizione della card in homepage: 1 = prima. */
  ordine: number;
  /** false = card visibile ma marcata "in preparazione", pagina non generata. */
  pubblicato: boolean;

  // --- Identità e dati commerciali ---
  nome: string;
  /** Sottotitolo breve per le card del catalogo. */
  claim: string;
  destinazione: string;
  /** Le date disponibili. Almeno una; più di una = viaggio con più partenze. */
  partenze: Partenza[];
  prezzo: number;
  prezzoLabel: string;
  caparra: number;
  caparraLabel: string;
  saldo: number;
  saldoLabel: string;
  pagamento: string;
  etaMinima: number;
  /** Immagine di copertina (senza estensione, in /public/images). */
  cover: string;

  // --- Contenuti di pagina ---
  hero: {
    eyebrow: string;
    h1: string;
    sub: string;
    tagMono: string;
  };
  esperienza: {
    eyebrow: string;
    title: string;
    intro: string;
    blocchi: BloccoEsperienza[];
  };
  programma: {
    eyebrow: string;
    title: string;
    nota: string;
    giorni: GiornoProgramma[];
  };
  /** id delle guide (da `guide`) che accompagnano questo viaggio. */
  guideIds: string[];
  incluso: string[];
  nonIncluso: string[];
  notaAssicurazione: string;
  gallery: FotoGallery[];
  faqs: Faq[];
  /** SEO */
  meta: { title: string; description: string };
}

/* ============================================================
   CONDIVISO — le guide (referenziate per id dai viaggi)
   ============================================================ */
export const guide: Guida[] = [
  {
    id: 'federico',
    nome: 'Federico Maggiani',
    ruolo: 'Guida Canyon e Maestro di Torrentismo',
    img: 'guida-federico',
    qualifiche: [
      'Guida Canyon e Maestro di Torrentismo AIGC',
      'Maestro Guida di Rafting e Hydrospeed FIRaft',
      'Istruttore di Canoa FICK',
    ],
    bio: 'Da oltre 30 anni lavora professionalmente nel mondo delle attività outdoor, maturando un’esperienza solida e completa negli sport fluviali e verticali. Nel corso della sua carriera ha accompagnato centinaia di persone in ambienti naturali complessi, unendo competenza tecnica, sicurezza e profonda conoscenza del territorio. La sua guida è sinonimo di affidabilità, professionalità e passione autentica per l’avventura.',
  },
  {
    id: 'christian',
    nome: 'Christian Balsamo',
    ruolo: 'Guida escursionistica e Mental Coach',
    img: 'guida-christian',
    qualifiche: [
      'Guida escursionistica',
      'Mental Coach per performance e stati mentali',
      'Tecniche di respirazione e preparazione',
    ],
    /** [4] ultima frase completata: nel .docx si interrompeva a metà */
    bio: 'Da anni accompagna persone, atleti e professionisti in percorsi che uniscono natura, disciplina e lavoro interiore. La montagna diventa il contesto, ma il vero viaggio è dentro se stessi. Ogni esperienza che guida non è solo un’escursione, ma un vero e proprio allenamento mentale: respiro, presenza, gestione della fatica e superamento dei propri limiti. Attraverso un approccio strutturato e orientato alla performance, integra preparazione fisica e tecniche di respirazione in contesti di avventura consapevole, creando esperienze che portano fuori dalla zona di comfort per ritrovarsi più lucidi, più solidi e più presenti.',
  },
];

export const getGuide = (ids: string[]): Guida[] =>
  ids.map((id) => guide.find((g) => g.id === id)).filter((g): g is Guida => Boolean(g));

/* ============================================================
   CONDIVISO — sicurezza (identica per entrambi i viaggi)
   ============================================================ */
export const sicurezza = {
  eyebrow: 'SICUREZZA',
  title: 'L’avventura funziona solo se è gestita',
  intro:
    'Il canyoning è un’attività sicura quando è praticata con professionisti del settore. Ogni uscita prevede lo stesso protocollo, senza eccezioni.',
  punti: [
    {
      titolo: 'Guide certificate sempre presenti',
      testo: 'Nessuna attività si svolge senza l’accompagnamento di guide qualificate.',
    },
    {
      titolo: 'Attrezzatura tecnica omologata',
      testo: 'Fornita e verificata dalle guide: imbrago, casco, muta, corde, scarpe e calzari.',
    },
    {
      titolo: 'Briefing tecnico iniziale',
      testo: 'Prima di ogni discesa: sicurezza, segnali e tecnica di progressione.',
    },
    {
      titolo: 'Debriefing finale',
      testo: 'A fine attività si analizza l’uscita insieme: cosa è andato, cosa migliorare.',
    },
  ],
};

/* ============================================================
   CONDIVISO — trust strip
   ============================================================ */
export const trust = [
  { icon: 'shield', label: 'Guide certificate', detail: 'AIGC · FIRaft · FICK' },
  { icon: 'users', label: 'Gruppo ristretto', detail: 'Numero chiuso' },
  { icon: 'gear', label: 'Attrezzatura inclusa', detail: 'Tutta la tecnica' },
  { icon: 'brain', label: 'Mental coaching', detail: 'Ogni giornata' },
];

/* ============================================================
   CONDIVISO — reputazione di Eddyline come organizzatore.
   NOTA: sono i numeri delle recensioni TripAdvisor delle ATTIVITÀ in
   Valsesia, non del camp. Servono a dire "l'organizzatore è affidabile",
   non "il camp è bello": per questo il testo parla di Eddyline e degli anni
   di attività, senza spacciare testimonianze del viaggio.
   Quando arrivano i feedback dei partecipanti al camp, si aggiunge una
   sezione recensioni vera e propria.
   ============================================================ */
export const reputazione = {
  rating: '4,6/5',
  count: '110 recensioni',
  rank: 'n.1 ad Alagna Valsesia',
  tripadvisorUrl:
    'https://www.tripadvisor.it/Attraction_Review-g1050061-d3388403-Reviews-Eddyline_The_River_Experience-Alagna_Valsesia_Province_of_Vercelli_Piedmont.html',
  dal: 2001,
  claim:
    'Organizziamo attività outdoor dal 2001. Le nostre guide hanno accompagnato migliaia di persone tra fiumi e forre — questo camp nasce da lì.',
};

export const notaEsclusioni =
  'Tutto ciò che non è esplicitamente indicato in “cosa è incluso” non fa parte dell’offerta.';

/* ============================================================
   VIAGGIO 1 — Adventure Camp Madeira (dati reali, completo)
   ============================================================ */
const madeira: Viaggio = {
  slug: 'madeira',
  ordine: 1,
  pubblicato: true,

  nome: 'Adventure Camp Madeira',
  claim: 'Canyoning e lavoro mentale nell’isola dell’Atlantico',
  destinazione: 'Madeira, Portogallo',
  /** [2] 13-18 ottobre = 5 notti / 6 giorni */
  partenze: [
    {
      id: 'ott-2026',
      periodo: '13 — 18 ottobre 2026',
      periodoBreve: '13-18 OTT 2026',
      durata: '6 giorni · 5 notti',
    },
  ],
  prezzo: 890,
  prezzoLabel: '€ 890',
  caparra: 300,
  caparraLabel: '€ 300',
  saldo: 590,
  saldoLabel: '€ 590',
  pagamento: 'contanti o bonifico bancario',
  etaMinima: 18,
  cover: 'hero-camp',

  hero: {
    eyebrow: 'EDDYLINE VIAGGI · MADEIRA',
    h1: 'Sei giorni fuori dalla tua zona di comfort',
    sub: 'Un camp di canyoning e lavoro mentale nell’isola dell’Atlantico. Cascate, forre e oceano — con due guide certificate, in un gruppo ristretto. Non un pacchetto turistico: un percorso di crescita.',
    tagMono: '13-18 OTT 2026 · € 890 · POSTI LIMITATI',
  },

  esperienza: {
    eyebrow: 'L’ESPERIENZA',
    title: 'Lo sport è il mezzo. Il viaggio è dentro di te',
    intro:
      'Madeira è un’isola verticale: cascate che cadono nella roccia, forre scavate dall’acqua, un oceano che non sta mai fermo. È il contesto perfetto per un lavoro che è tanto fisico quanto mentale.',
    blocchi: [
      {
        titolo: 'Canyoning nelle forre dell’isola',
        testo:
          'Due sessioni con guide esperte tra calate, scivoli e salti. Tutta l’attrezzatura tecnica è inclusa, scarpe e calzari compresi. Nessuna esperienza richiesta: i percorsi si adattano al livello del gruppo.',
        img: 'canyoning-2',
      },
      {
        titolo: 'Un trekking che apre la vista',
        testo:
          'Un’escursione panoramica guidata lungo i sentieri dell’isola, tra creste e vegetazione atlantica. Il momento in cui la fatica diventa silenzio e il paesaggio fa il resto.',
        img: 'madeira-costa',
      },
      {
        titolo: 'Respiro, presenza, limite',
        testo:
          'Risveglio muscolare ogni mattina e sessioni di respirazione per gestire fatica e stress. Lavoro su obiettivi, focus e mindset — con il confronto del gruppo come cassa di risonanza.',
        img: 'canyoning-5',
      },
      {
        titolo: 'Vita condivisa in casa privata',
        testo:
          'Alloggio riservato al solo gruppo, in posizione strategica per le attività. Camere confortevoli e spazi comuni: le connessioni nascono da sole, già dal primo giorno.',
        img: 'madeira-arcobaleno',
      },
    ],
  },

  /**
   * [3] Programma fornito dal cliente (17/09/2026), allineato alla pagina
   * christianbalsamo.it/madeira. Sostituisce la bozza dedotta dalle attività
   * incluse che stava qui prima.
   * I giorni della settimana erano sfalsati di uno: 13 ottobre 2026 è un
   * martedì e il 18 una domenica, non lunedì e sabato.
   */
  programma: {
    eyebrow: 'IL PROGRAMMA',
    title: 'Sei giorni, un ritmo preciso',
    nota: 'Il programma può variare in base alle condizioni meteo e del gruppo: la sicurezza e la qualità dell’esperienza vengono prima di tutto.',
    giorni: [
      {
        giorno: 'Giorno 1',
        data: 'Martedì 13 ottobre',
        titolo: 'Welcome to the Experience — primo cerchio',
        voci: [
          'Arrivo a Madeira, trasferimento dall’aeroporto e sistemazione nella casa comune',
          'Briefing iniziale sul camp: obiettivi, introduzione alle attività e logistica',
        ],
      },
      {
        giorno: 'Giorno 2',
        data: 'Mercoledì 14 ottobre',
        titolo: 'Canyoning',
        voci: [
          'Giornata dedicata al canyoning: discese in corda, cascate e scivoli naturali, in ambiente tropicale, in uno dei contesti più spettacolari di Madeira',
          'Debriefing sull’attività',
          'Nel pomeriggio e in serata, momento di recupero e breve sessione di respiro per favorire il rilassamento',
        ],
      },
      {
        giorno: 'Giorno 3',
        data: 'Giovedì 15 ottobre',
        titolo: 'Trekking panoramico',
        voci: [
          'Risveglio muscolare mattutino',
          'Trekking panoramico tra montagne, foreste e viste sull’oceano',
          'Nel tardo pomeriggio, trekking al tramonto: uno dei momenti più suggestivi dell’esperienza',
          'Chiusura della giornata con meditazione guidata',
        ],
      },
      {
        giorno: 'Giorno 4',
        data: 'Venerdì 16 ottobre',
        titolo: 'Canyoning',
        voci: [
          'Risveglio muscolare mattutino e lavoro sul respiro, per preparare corpo e mente',
          'Seconda giornata di canyoning',
          'Dopo l’esperienza del giorno 2 si spinge un po’ di più: maggiore sicurezza, più fluidità nei movimenti, gestione dell’emozione',
        ],
      },
      {
        giorno: 'Giorno 5',
        data: 'Sabato 17 ottobre',
        titolo: 'Trekking al tramonto',
        voci: [
          'Esplorazione dei sentieri più belli: dalle levadas ai picchi più alti, dalle foreste tropicali alle spiagge selvagge',
          'Tramonti garantiti',
        ],
      },
      {
        giorno: 'Giorno 6',
        data: 'Domenica 18 ottobre',
        titolo: 'Relax e saluti',
        voci: [
          'Ultima giornata dedicata al relax e al recupero',
          'Saluti finali',
          'Transfer all’aeroporto e rientro',
        ],
      },
    ],
  },

  guideIds: ['federico', 'christian'],

  incluso: [
    'Alloggio in casa privata riservata al gruppo',
    '2 sessioni di canyoning con guide esperte',
    '1 trekking panoramico guidato',
    'Transfer da e per l’aeroporto',
    'Trasporto interno sull’isola',
    'Attività mattutine di risveglio muscolare',
    'Sessioni di respirazione per gestire fatica e stress',
    'Guide certificate per ogni attività',
    'Attrezzatura tecnica completa per il canyoning, incluse scarpe e calzari',
  ],
  nonIncluso: [
    'Volo A/R (ognuno parte dall’aeroporto che preferisce)',
    'Assicurazione di viaggio — fortemente consigliata',
    'Cassa comune',
  ],
  notaAssicurazione: 'Imaway copre anche l’attività di canyoning.',

  gallery: [
    { img: 'canyoning-1', alt: 'Calata in corda lungo una cascata nella forra' },
    { img: 'madeira-costa', alt: 'La costa oceanica di Madeira vista dall’alto' },
    { img: 'canyoning-6', alt: 'Discesa tra le rocce coperte di muschio' },
    { img: 'canyoning-3', alt: 'Calata su una parete di roccia verde' },
    { img: 'madeira-scogliera', alt: 'Scogliera a picco sull’oceano Atlantico' },
    { img: 'canyoning-7', alt: 'Guida in azione nella forra' },
    { img: 'madeira-cascata', alt: 'Cascata alta tra le pareti verdi dell’isola' },
    { img: 'canyoning-8', alt: 'Salto in una pozza d’acqua nella forra' },
  ],

  /** [5] FAQ ripulite dai frammenti duplicati/troncati del .docx */
  faqs: [
    {
      q: 'Serve esperienza pregressa per partecipare?',
      a: 'No. Il camp è pensato sia per principianti sia per chi ha già provato attività outdoor. Le esperienze vengono adattate al livello del gruppo e seguite da guide certificate.',
    },
    {
      q: 'Devo essere super allenato?',
      a: 'No. È richiesta una buona forma fisica di base e voglia di muoversi. Non serve essere atleti, serve solo spirito d’avventura.',
    },
    {
      q: 'Che tipo di alloggio è previsto?',
      a: 'Alloggeremo in una struttura riservata al gruppo, in posizione strategica per le attività. Camere confortevoli e spazi comuni per vivere l’esperienza insieme.',
    },
    {
      q: 'Che attrezzatura devo portare?',
      a: 'Per il canyoning ti verrà fornita tutta l’attrezzatura tecnica. Per il trekking serve abbigliamento comodo e scarpe da trekking; per la permanenza il normale equipaggiamento da viaggio.',
    },
    {
      q: 'Ci saranno momenti di coaching e lavoro mentale?',
      a: 'Sì. Ogni giornata prevede momenti dedicati al lavoro su obiettivi, alla gestione dello stress, a focus e mindset, e al confronto e alla condivisione nel gruppo.',
    },
    {
      q: 'Cosa rende questo camp diverso da altri camp sportivi?',
      a: 'La differenza sta nella combinazione tra sport, lavoro mentale, vita condivisa in casa privata, gruppo ristretto e attenzione reale alla persona. Non è un pacchetto turistico, ma un’esperienza strutturata di crescita.',
    },
    {
      q: 'Il volo è incluso?',
      a: 'No, il volo non è incluso. Ognuno può partire dall’aeroporto che preferisce.',
    },
    {
      q: 'Il trasferimento dall’aeroporto è incluso?',
      a: 'Sì, il transfer da e per l’aeroporto è incluso.',
    },
    {
      q: 'È più una vacanza o un percorso di crescita?',
      a: 'È entrambe le cose, ma prima di tutto è un percorso di crescita attraverso lo sport, la natura e il lavoro su se stessi.',
    },
    {
      q: 'È pericoloso fare canyoning?',
      a: 'È un’attività svolta in sicurezza se praticata con l’accompagnamento di professionisti del settore. Tutte le uscite prevedono guide certificate, attrezzatura tecnica omologata, briefing tecnico iniziale su sicurezza e progressione e debriefing finale.',
    },
    {
      q: 'Posso partecipare anche se vengo da solo?',
      a: 'Assolutamente sì. La maggior parte delle persone arriva da sola. Il gruppo è parte centrale dell’esperienza e le connessioni nascono in modo naturale già dal primo giorno.',
    },
    {
      q: 'È aperto a uomini e donne? Ci sono limiti di età?',
      a: 'Sì, il camp è aperto sia a uomini che a donne. L’età minima è 18 anni.',
    },
    {
      q: 'Come mi iscrivo?',
      a: 'Compila il modulo qui sopra: ti ricontattiamo per confermare la disponibilità e completare l’iscrizione.',
    },
    {
      q: 'I posti sono limitati?',
      a: 'Sì. Il camp è a numero chiuso per garantire qualità e attenzione a ogni partecipante.',
    },
    {
      q: 'È richiesto un acconto?',
      a: 'Sì. L’acconto di € 300 è necessario per bloccare il posto; il saldo di € 590 si versa prima della partenza. Entrambi tramite contanti o bonifico bancario.',
    },
    {
      q: 'Posso pagare a rate?',
      a: 'Sì, è possibile pagare in più soluzioni. Scrivici e troviamo la formula più comoda per te.',
    },
    {
      q: 'È adatto anche a chi sta vivendo un periodo difficile?',
      a: 'Sì. Spesso è proprio nei momenti di confusione che questo tipo di esperienza aiuta a fare chiarezza e ripartire.',
    },
  ],

  meta: {
    title: 'Adventure Camp Madeira — Canyoning e mental coaching | Eddyline Viaggi',
    description:
      'Sei giorni a Madeira tra canyoning, trekking e lavoro mentale. 13-18 ottobre 2026, € 890, gruppo ristretto e guide certificate. Non un pacchetto turistico: un percorso di crescita.',
  },
};

/* ============================================================
   VIAGGIO 2 — Maiorca (grotte + canyoning)

   Restano aperti incluso/non incluso e le FAQ: cerca `DA CONFERMARE`.

   [6] DATE E QUOTA — confermate dal cliente il 21/09/2026. Si è chiuso un
       percorso lungo: prima la partenza di gennaio/febbraio 2027 è stata
       annullata, poi sono rimaste in ballo il 24 e il 25 marzo con il form
       che ne raccoglieva la preferenza. Ora la data è una sola, 24 → 29
       marzo 2027, e la quota è 910 €. Niente più `daConfermare`, e il
       selettore di partenza nel form sparisce da sé (una sola partenza).
   [7] Acconto e saldo ricalcano Madeira: 300 € alla conferma, il resto in
       loco. Su 910 il saldo è quindi 610 €.
   ============================================================ */
const maiorca: Viaggio = {
  slug: 'maiorca',
  ordine: 2,
  pubblicato: true,

  nome: 'Adventure Camp Maiorca',
  claim: 'Grotte marine, forre e mare aperto nelle Baleari',
  destinazione: 'Maiorca, Spagna',

  /** [6] Partenza unica, confermata. */
  partenze: [
    {
      id: 'mar-24-2027',
      periodo: '24 — 29 marzo 2027',
      periodoBreve: '24-29 MAR 2027',
      durata: '6 giorni / 5 notti',
    },
  ],

  prezzo: 910,
  prezzoLabel: '€ 910',
  caparra: 300,
  caparraLabel: '€ 300',
  saldo: 610,
  saldoLabel: '€ 610',
  pagamento: 'contanti o bonifico bancario',
  etaMinima: 18,
  cover: 'maiorca-hero',

  hero: {
    eyebrow: 'EDDYLINE VIAGGI · MAIORCA',
    h1: 'Sotto la roccia, dentro il mare',
    sub: 'Maiorca non è solo costa: sotto l’isola corre un mondo di grotte allagate e forre scavate nella pietra calcarea. Un camp per esplorarlo, con guide certificate e un gruppo ristretto.',
    tagMono: '24 — 29 MARZO 2027 · POSTI LIMITATI',
  },

  esperienza: {
    eyebrow: 'L’ESPERIENZA',
    title: 'Un’isola da attraversare da dentro',
    intro:
      'Le Baleari sono calcare: acqua e tempo hanno scavato cavità, sifoni e canyon che pochi vedono. È il terreno per chi vuole un’avventura diversa da quella di superficie.',
    blocchi: [
      {
        titolo: 'Grotte marine e laghi sotterranei',
        testo:
          'Progressione in corda e traversate su acque smeraldo dentro cavità che si aprono verso il mare. Attrezzatura tecnica fornita, nessuna esperienza pregressa richiesta.',
        img: 'maiorca-grotta-1',
      },
      {
        titolo: 'Forre nella pietra calcarea',
        testo:
          'Discese tra pareti strette e pozze d’acqua limpida, con le stesse guide e lo stesso protocollo di sicurezza dei camp Eddyline.',
        img: 'maiorca-forra',
      },
      {
        titolo: 'La costa e le calette',
        testo:
          'Il contrappunto: acqua turchese, scogliere e tempo all’aperto. Il recupero fa parte del percorso quanto lo sforzo.',
        img: 'maiorca-caletta',
      },
      {
        titolo: 'Palma e l’isola sopra',
        testo:
          'Un affaccio sulla città e sulla sua cattedrale: il camp non è solo tecnica, è anche il posto in cui si svolge.',
        img: 'maiorca-palma',
      },
    ],
  },

  /**
   * [7] Programma fornito dal cliente (17/09/2026). Sostituisce la bozza
   * ricalcata su Madeira che stava qui prima.
   * `data` resta vuota: le due partenze cadono in giorni diversi.
   */
  programma: {
    eyebrow: 'IL PROGRAMMA',
    title: 'Sei giorni, un ritmo preciso',
    nota: 'Il programma può variare in base alle condizioni meteorologiche, del mare e dei livelli d’acqua nei torrenti: la sicurezza e la qualità dell’esperienza vengono prima di tutto.',
    giorni: [
      {
        giorno: 'Giorno 1',
        data: '',
        titolo: 'Welcome to the Experience — primo cerchio',
        voci: [
          'Arrivo a Maiorca, trasferimento dall’aeroporto e sistemazione nella casa comune',
          'Briefing iniziale sul camp: obiettivi personali, introduzione alle attività e logistica',
        ],
      },
      {
        giorno: 'Giorno 2',
        data: '',
        titolo: 'Canyoning',
        voci: [
          'Giornata dedicata al canyoning: discese in corda, cascate e scivoli naturali, in uno dei contesti più spettacolari di Maiorca. Un canyon che porta direttamente a entrare nel mare',
          'Debriefing sull’attività',
          'Nel pomeriggio e in serata, momento di recupero e breve sessione di respiro per favorire il rilassamento',
        ],
      },
      {
        giorno: 'Giorno 3',
        data: '',
        titolo: 'Trekking panoramico',
        voci: [
          'Risveglio muscolare mattutino',
          'Trekking panoramico tra montagne e mare',
          'Nel tardo pomeriggio, trekking al tramonto: uno dei momenti più suggestivi dell’esperienza',
          'Chiusura della giornata con meditazione guidata',
        ],
      },
      {
        giorno: 'Giorno 4',
        data: '',
        titolo: 'Canyoning',
        voci: [
          'Risveglio muscolare e lavoro sul respiro, per preparare corpo e mente',
          'Seconda giornata di canyoning',
          'Dopo l’esperienza del giorno 2 si spinge un po’ di più: maggiore sicurezza, più fluidità nei movimenti, gestione dell’emozione',
        ],
      },
      {
        giorno: 'Giorno 5',
        data: '',
        titolo: 'Trekking',
        voci: [
          'Esplorazione di un altro sentiero tra mare e montagne, oppure delle grotte marine — queste ultime solo se le condizioni del mare lo permetteranno',
        ],
      },
      {
        giorno: 'Giorno 6',
        data: '',
        titolo: 'Relax e saluti',
        voci: [
          'Ultima giornata dedicata al relax e al recupero',
          'Saluti finali',
          'Transfer all’aeroporto e rientro',
        ],
      },
    ],
  },

  guideIds: ['federico', 'christian'], // DA CONFERMARE se cambiano

  /**
   * Confermati dal cliente il 21/09/2026, ricalcati su Madeira e adattati al
   * programma di Maiorca: due canyoning e due trekking, non uno.
   * `notaAssicurazione` resta vuota: per Madeira dice che Imaway copre il
   * canyoning, ma per Maiorca non è ancora confermato. DA CONFERMARE.
   */
  incluso: [
    'Alloggio in casa privata riservata al gruppo, 5 notti',
    '2 sessioni di canyoning con guide esperte',
    '2 trekking guidati',
    'Transfer da e per l’aeroporto',
    'Trasporto interno sull’isola',
    'Attività mattutine di risveglio muscolare',
    'Sessioni di respirazione e meditazione guidata',
    'Guide certificate per ogni attività',
    'Attrezzatura tecnica completa per il canyoning, incluse scarpe e calzari',
  ],
  nonIncluso: [
    'Volo A/R (ognuno parte dall’aeroporto che preferisce)',
    'Assicurazione di viaggio — fortemente consigliata',
    'Cassa comune',
  ],
  notaAssicurazione: '',

  gallery: [
    { img: 'maiorca-grotta-2', alt: 'Esplorazione di una cavità con lago sotterraneo' },
    { img: 'maiorca-caletta', alt: 'Caletta dall’acqua turchese sulla costa di Maiorca' },
    { img: 'maiorca-grotta-3', alt: 'Traversata su acqua dentro una grotta' },
    { img: 'maiorca-grotta-5', alt: 'Acqua trasparente in una cavità calcarea' },
    { img: 'maiorca-costa', alt: 'La costa rocciosa dell’isola' },
    { img: 'maiorca-grotta-6', alt: 'Attrezzatura e corde per la progressione in grotta' },
    { img: 'maiorca-grotta-7', alt: 'Cavità con acqua smeraldo' },
    { img: 'maiorca-palma', alt: 'La cattedrale di Palma di Maiorca' },
  ],

  /**
   * Adattate da quelle di Madeira su indicazione del cliente (21/09/2026).
   * Fuori restano le domande che dipendono da punti ancora aperti: numero
   * massimo di partecipanti e se le grotte marine del giorno 5 siano comprese.
   */
  faqs: [
    {
      q: 'Serve esperienza pregressa per partecipare?',
      a: 'No. Il camp è pensato sia per principianti sia per chi ha già provato attività outdoor. Le esperienze vengono adattate al livello del gruppo e seguite da guide certificate.',
    },
    {
      q: 'Devo essere super allenato?',
      a: 'No. È richiesta una buona forma fisica di base e voglia di muoversi. Non serve essere atleti, serve solo spirito d’avventura.',
    },
    {
      q: 'Che tipo di alloggio è previsto?',
      a: 'Alloggeremo in una casa riservata al gruppo, in posizione strategica per le attività. Camere confortevoli e spazi comuni per vivere l’esperienza insieme.',
    },
    {
      q: 'Che attrezzatura devo portare?',
      a: 'Per il canyoning ti verrà fornita tutta l’attrezzatura tecnica. Per il trekking serve abbigliamento comodo e scarpe da trekking; per la permanenza il normale equipaggiamento da viaggio.',
    },
    {
      q: 'Ci saranno momenti di coaching e lavoro mentale?',
      a: 'Sì. Il programma prevede lavoro sul respiro, meditazione guidata e momenti di confronto e condivisione nel gruppo, oltre al debriefing dopo le attività.',
    },
    {
      q: 'Cosa rende questo camp diverso da altri camp sportivi?',
      a: 'La differenza sta nella combinazione tra sport, lavoro mentale, vita condivisa in casa privata, gruppo ristretto e attenzione reale alla persona. Non è un pacchetto turistico, ma un’esperienza strutturata di crescita.',
    },
    {
      q: 'Il volo è incluso?',
      a: 'No, il volo non è incluso. Ognuno può partire dall’aeroporto che preferisce.',
    },
    {
      q: 'Il trasferimento dall’aeroporto è incluso?',
      a: 'Sì, il transfer da e per l’aeroporto è incluso.',
    },
    {
      q: 'È più una vacanza o un percorso di crescita?',
      a: 'È entrambe le cose, ma prima di tutto è un percorso di crescita attraverso lo sport, la natura e il lavoro su se stessi.',
    },
    {
      q: 'È pericoloso fare canyoning?',
      a: 'È un’attività svolta in sicurezza se praticata con l’accompagnamento di professionisti del settore. Tutte le uscite prevedono guide certificate, attrezzatura tecnica omologata, briefing tecnico iniziale su sicurezza e progressione e debriefing finale.',
    },
    {
      q: 'Il programma può cambiare?',
      a: 'Sì. Le giornate possono variare in base alle condizioni meteorologiche, del mare e dei livelli d’acqua nei torrenti: la sicurezza e la qualità dell’esperienza vengono prima di tutto.',
    },
    {
      q: 'Posso partecipare anche se vengo da solo?',
      a: 'Assolutamente sì. La maggior parte delle persone arriva da sola. Il gruppo è parte centrale dell’esperienza e le connessioni nascono in modo naturale già dal primo giorno.',
    },
    {
      q: 'È aperto a uomini e donne? Ci sono limiti di età?',
      a: 'Sì, il camp è aperto sia a uomini che a donne. L’età minima è 18 anni.',
    },
    {
      q: 'Come mi iscrivo?',
      a: 'Compila il modulo qui sopra: ti ricontattiamo per confermare la disponibilità e completare l’iscrizione.',
    },
    {
      q: 'I posti sono limitati?',
      a: 'Sì. Il camp è a numero chiuso per garantire qualità e attenzione a ogni partecipante.',
    },
    {
      q: 'È richiesto un acconto?',
      a: 'Sì. L’acconto di € 300 è necessario per bloccare il posto; il saldo di € 610 si versa prima della partenza. Entrambi tramite contanti o bonifico bancario.',
    },
    {
      q: 'Posso pagare a rate?',
      a: 'Sì, è possibile pagare in più soluzioni. Scrivici e troviamo la formula più comoda per te.',
    },
    {
      q: 'È adatto anche a chi sta vivendo un periodo difficile?',
      a: 'Sì. Spesso è proprio nei momenti di confusione che questo tipo di esperienza aiuta a fare chiarezza e ripartire.',
    },
  ],

  meta: {
    title: 'Adventure Camp Maiorca — Grotte e canyoning | Eddyline Viaggi',
    description:
      'Un camp tra canyoning, trekking e coste di Maiorca. Dal 24 al 29 marzo 2027, gruppo ristretto e guide certificate Eddyline.',
  },
};

/* ============================================================
   I VIAGGI
   ============================================================ */
/** Ordinati per il campo `ordine`: è l'ordine delle card in homepage. */
export const viaggi: Viaggio[] = [madeira, maiorca].sort(
  (a, b) => a.ordine - b.ordine
);

/** Gli altri viaggi rispetto a quello dato (per la sezione in fondo alla scheda). */
export const altriRispettoA = (slug: string): Viaggio[] =>
  viaggi.filter((v) => v.slug !== slug);

export const getViaggio = (slug: string): Viaggio | undefined =>
  viaggi.find((v) => v.slug === slug);

/* ------------------------------------------------------------
   Helper per le partenze
   ------------------------------------------------------------ */

/** La prima partenza: quella da mostrare quando serve una data sola. */
export const primaPartenza = (v: Viaggio): Partenza | undefined => v.partenze[0];

/**
 * Etichetta per le card e l'header.
 * Una partenza → il suo periodo breve. Più partenze → il conteggio, perché
 * elencare due date in un badge lo rende illeggibile.
 */
export const etichettaPartenze = (v: Viaggio): string => {
  if (v.partenze.length === 0) return 'DATE IN DEFINIZIONE';
  if (v.partenze.length === 1) return v.partenze[0].periodoBreve;
  return `${v.partenze.length} PARTENZE`;
};

/** Durata: se coincide tra le partenze la mostra, altrimenti le alternative. */
export const etichettaDurata = (v: Viaggio): string => {
  const d = [...new Set(v.partenze.map((p) => p.durata))];
  if (d.length === 0) return 'Da definire';
  if (d.length === 1) return d[0];
  // Durate diverse (24→29 = 6 giorni, 25→29 = 5): "6 giorni / 5 notti / 5
  // giorni / 4 notti" si leggeva come un elenco unico di quattro voci.
  // Collassiamo sui soli giorni: "5 o 6 giorni".
  const giorni = d.map((x) => Number(x.match(/^\d+/)?.[0] ?? NaN));
  if (giorni.every((n) => !Number.isNaN(n))) {
    return `${Math.min(...giorni)} o ${Math.max(...giorni)} giorni`;
  }
  return d.join(' oppure ');
};

/** Elenco completo delle date: per la scheda e il riepilogo del form. */
export const elencoPartenze = (v: Viaggio): string =>
  v.partenze.map((p) => p.periodo).join(' · ');

/**
 * Forma compatta per le CARD della vetrina: con più partenze l'elenco completo
 * occuperebbe quattro righe e la card serve a decidere, non a elencare.
 * Una partenza → periodo completo. Più partenze → i soli mesi.
 */
export const partenzeCompatte = (v: Viaggio): string => {
  if (v.partenze.length === 0) return 'Da annunciare';
  if (v.partenze.length === 1) return v.partenze[0].periodo;
  // Più partenze nello STESSO mese (Maiorca: 24 e 25 marzo): il mese da solo
  // non direbbe nulla, quindi elenchiamo i giorni — "24 e 25 marzo 2027".
  const coda = v.partenze[0].periodo.match(/([a-zà-ù]+\s+\d{4})\s*$/i)?.[1];
  const giorni = v.partenze.map((p) => p.periodo.match(/^\d{1,2}/)?.[0] ?? '');
  const codeMese = v.partenze.map((p) => p.periodoBreve.match(/[A-Z]{3}/)?.[0] ?? '');
  if (coda && giorni.every(Boolean) && new Set(codeMese).size === 1) {
    return `${giorni.join(' e ')} ${coda}`;
  }

  // Altrimenti: mese di PARTENZA (il primo del periodo) + anno finale.
  // Deduplicati: due partenze nello stesso mese darebbero "Mar e Mar 2027".
  const mesi = [
    ...new Set(
      v.partenze.map((p) => {
        const primo = p.periodoBreve.match(/[A-Z]{3}/);
        return primo ? primo[0].charAt(0) + primo[0].slice(1).toLowerCase() : '';
      })
    ),
  ];
  const anni = [...new Set(v.partenze.map((p) => p.periodoBreve.match(/\d{4}/)?.[0] ?? ''))];
  const suffisso = anni.length === 1 ? ` ${anni[0]}` : '';
  return mesi.filter(Boolean).join(' e ') + suffisso;
};

/* ============================================================
   Homepage — copy della vetrina
   ============================================================ */
export const vetrina = {
  eyebrow: 'EDDYLINE VIAGGI',
  h1: 'Due viaggi. Scegli il tuo.',
  sub: 'Camp di avventura e lavoro mentale, in gruppi ristretti e con guide certificate. Sport e natura sono il mezzo: il viaggio è dentro di te.',
  /** Invito esplicito a cliccare: la home non racconta, indirizza. */
  invito: 'Apri una delle due schede per vedere programma, quota e disponibilità.',
};

/* ============================================================
   Pagina /grazie — copy della conferma post-iscrizione
   ============================================================ */
export const grazie = {
  eyebrow: 'RICHIESTA RICEVUTA',
  h1: 'Ci siamo. Ora tocca a noi',
  sub: 'Abbiamo ricevuto la tua richiesta. Ti ricontattiamo noi: non serve fare altro.',
  passi: [
    {
      titolo: 'Ti scriviamo o ti chiamiamo',
      testo:
        'Entro 24 ore nei giorni lavorativi. Se ci hai lasciato il numero, di solito è più rapido su WhatsApp.',
    },
    {
      titolo: 'Verifichiamo la disponibilità',
      testo:
        'Il camp è a numero chiuso: controlliamo i posti liberi e rispondiamo a tutte le tue domande, senza impegno.',
    },
    {
      titolo: 'Blocchi il posto',
      testo:
        'Solo se decidi di partire: con la caparra il posto è tuo, il saldo si versa prima della partenza.',
    },
  ],
  fretta: 'Hai fretta o una domanda che non può attendere?',
};

/* ============================================================
   Contatti — allineati alla landing attività
   ============================================================ */
export const contacts = {
  phoneDisplay: '347 6439869',
  phoneHref: 'tel:+393476439869',
  email: 'info@eddyline.it',
  whatsapp: 'https://wa.me/393476439869',
  facebook: 'https://facebook.com/eddylinetheriverexperience',
  instagram: 'https://instagram.com/eddyline_asd',
  privacyUrl: 'https://eddyline.it/privacy-cookies/',
  vat: '01043460458',
  legalName: 'Eddyline — Centro Sport Fluviali Valsesia, ASD',
};
