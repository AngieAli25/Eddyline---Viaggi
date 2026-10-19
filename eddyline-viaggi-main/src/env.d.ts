/// <reference path="../.astro/types.d.ts" />

/**
 * Tipi globali del progetto.
 * `dataLayer` è iniettato dallo snippet GTM nel BaseLayout: lo dichiariamo qui
 * perché gli script dei componenti (type-checked da `astro check`) lo usano.
 */
declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
    gtag: (...args: unknown[]) => void;
  }
}

export {};
