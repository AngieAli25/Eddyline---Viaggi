/**
 * Endpoint server-side per il form d'iscrizione al camp.
 * Mantiene `LEAD_WEBHOOK_URL` lato server (non è una PUBLIC_*): il client fa
 * POST qui, noi inoltriamo al webhook. Così l'endpoint non è esposto e possiamo
 * applicare anti-spam (honeypot + time-trap) server-side.
 *
 * Static output + questa route on-demand: su Vercel diventa una serverless function.
 */
import type { APIRoute } from 'astro';

export const prerender = false;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });

interface LeadPayload {
  nome?: string;
  email?: string;
  telefono?: string;
  /** slug del viaggio richiesto */
  viaggio?: string;
  /** nome del viaggio, leggibile nel foglio */
  viaggioNome?: string;
  /** id della partenza scelta (es. 'gen-2027') o 'indifferente' */
  partenza?: string;
  esperienza?: string;
  messaggio?: string;
  privacy?: boolean;
  // attribuzione (da dove arriva il lead)
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  gclid?: string;
  fbclid?: string;
  landing_page?: string;
  referrer?: string;
  // anti-spam
  website?: string; // honeypot: deve restare vuoto
  _t?: number; // timestamp di apertura form (time-trap)
}

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export const POST: APIRoute = async ({ request }) => {
  let body: LeadPayload;
  try {
    body = (await request.json()) as LeadPayload;
  } catch {
    return json({ ok: false, error: 'Richiesta non valida.' }, 400);
  }

  // --- Anti-spam: honeypot. Se compilato, fingiamo successo e droppiamo. ---
  if (body.website && body.website.trim() !== '') {
    return json({ ok: true });
  }

  // --- Anti-spam: time-trap. Invio entro 2s = probabile bot. ---
  if (typeof body._t === 'number') {
    const elapsed = Date.now() - body._t;
    if (elapsed >= 0 && elapsed < 2000) {
      return json({ ok: true });
    }
  }

  // --- Validazione campi obbligatori ---
  const errors: Record<string, string> = {};
  if (!body.nome || body.nome.trim().length < 2) errors.nome = 'Inserisci il tuo nome.';
  if (!body.email || !isEmail(body.email.trim())) errors.email = 'Inserisci un’email valida.';
  if (!body.telefono || body.telefono.trim().length < 6)
    errors.telefono = 'Inserisci un recapito telefonico.';
  if (!body.privacy) errors.privacy = 'Serve l’accettazione della privacy.';

  if (Object.keys(errors).length > 0) {
    return json({ ok: false, errors }, 422);
  }

  // --- Inoltro al webhook (server-side). ---
  const webhook = import.meta.env.LEAD_WEBHOOK_URL;
  const lead = {
    nome: body.nome!.trim(),
    email: body.email!.trim(),
    telefono: body.telefono!.trim(),
    viaggio: body.viaggio ?? '',
    viaggioNome: body.viaggioNome ?? '',
    partenza: body.partenza ?? '',
    esperienza: body.esperienza ?? '',
    messaggio: body.messaggio ?? '',
    // --- attribuzione: da dove arriva il lead ---
    utm_source: body.utm_source ?? '',
    utm_medium: body.utm_medium ?? '',
    utm_campaign: body.utm_campaign ?? '',
    utm_content: body.utm_content ?? '',
    utm_term: body.utm_term ?? '',
    gclid: body.gclid ?? '',
    fbclid: body.fbclid ?? '',
    landing_page: body.landing_page ?? '',
    referrer: body.referrer ?? '',
    source: 'landing-viaggi',
    receivedAt: new Date().toISOString(),
  };

  // Senza webhook configurato, logghiamo e rispondiamo ok: il flusso resta
  // testabile end-to-end prima del go-live.
  if (!webhook) {
    console.warn('[lead] LEAD_WEBHOOK_URL non configurato — lead non inoltrato:', lead);
    return json({ ok: true, forwarded: false });
  }

  try {
    // Nota: le Web App di Google Apps Script rispondono con un redirect 302
    // verso script.googleusercontent.com; fetch lo segue in automatico e la
    // scrittura sul foglio avviene comunque.
    const res = await fetch(webhook, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(lead),
      redirect: 'follow',
    });
    if (!res.ok) {
      return json({ ok: false, error: 'Invio non riuscito. Riprova tra poco.' }, 502);
    }
    return json({ ok: true, forwarded: true });
  } catch {
    return json({ ok: false, error: 'Problema di rete. Riprova tra poco.' }, 502);
  }
};
