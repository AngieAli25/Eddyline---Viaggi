/**
 * Configurazione centralizzata.
 * Tutti i placeholder/variabili vivono QUI: si sostituiscono in un punto solo.
 * In produzione si sovrascrivono via variabili d'ambiente Vercel
 * (PUBLIC_* per quelle che servono lato client). Vedi `.env.example`.
 */

const env = import.meta.env;

export interface AppConfig {
  site: {
    subdomain: string;
    siteUrl: string;
  };
  integrations: {
    /** Endpoint webhook per il form d'iscrizione (server-side). */
    leadWebhookUrl: string;
    /** Container GTM. */
    gtmContainerId: string;
    /** Meta Pixel. Vuoto = pixel non caricato affatto. */
    metaPixelId: string;
  };
  assets: {
    logoUrl: string;
    /** Foto hero del camp. */
    heroImage: string;
  };
}

/**
 * Legge una variabile d'ambiente, ripiegando sul default anche quando la
 * variabile ESISTE ma è VUOTA.
 *
 * Serve perché `??` scatta solo su null/undefined: importando i nomi da
 * .env.example, Vercel crea le variabili senza valore e una `siteUrl` vuota
 * produce canonical e og:url vuoti — anteprime rotte nelle condivisioni.
 */
const val = (v: string | undefined, fallback: string): string => {
  const t = (v ?? '').trim();
  return t === '' ? fallback : t;
};

export const config: AppConfig = {
  site: {
    // Default = dominio Vercel attivo. Al passaggio su viaggi.eddyline.it
    // basta valorizzare le variabili su Vercel, senza toccare il codice.
    subdomain: val(env.PUBLIC_SUBDOMAIN, 'eddyline-viaggi.vercel.app'),
    siteUrl: val(env.PUBLIC_SITE_URL, 'https://eddyline-viaggi.vercel.app'),
  },

  integrations: {
    // Endpoint per i lead del camp. Vuoto = lead loggato ma non inoltrato.
    leadWebhookUrl: val(env.LEAD_WEBHOOK_URL, ''),
    gtmContainerId: val(env.PUBLIC_GTM_CONTAINER_ID, 'GTM-55ZJ7TMT'),
    // Pixel dedicato ai viaggi. Svuotare la variabile su Vercel lo disattiva
    // senza toccare il codice.
    metaPixelId: val(env.PUBLIC_META_PIXEL_ID, '134648522074710'),
  },

  assets: {
    logoUrl: val(
      env.PUBLIC_LOGO_URL,
      'https://eddyline.it/wp-content/uploads/2014/04/logo.png'
    ),
    heroImage: val(env.PUBLIC_HERO_IMAGE, '/images/hero-camp.jpg'),
  },
};

export default config;
