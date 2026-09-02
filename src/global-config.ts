import { env } from 'src/lib/env';

import packageJson from '../package.json';

// ----------------------------------------------------------------------
// Semua env sudah divalidasi zod di src/lib/env.ts (fail-fast saat build bila
// var wajib hilang). Konsumsi konfigurasi lewat objek ini, bukan process.env.

export const CONFIG = {
  appName: 'SakuFlow AI',
  appVersion: packageJson.version,
  assetsDir: env.NEXT_PUBLIC_ASSETS_DIR,
  /** Tampilkan galeri komponen internal di build production bila diaktifkan. */
  showComponents: env.NEXT_PUBLIC_SHOW_COMPONENTS,
  /** Optional external data API base URL. */
  apiUrl: env.NEXT_PUBLIC_API_URL,
  /** Optional tenant identifier for the external data API. */
  companySlug: env.NEXT_PUBLIC_COMPANY_SLUG,
  /**
   * Optional client identifier for external integrations.
   */
  clientSlug: env.NEXT_PUBLIC_CLIENT_SLUG,
  /**
   * Public site origin — canonical URLs, OG tags, sitemap, robots.
   * Sudah ternormalisasi (tanpa trailing slash); production wajib di-set.
   */
  siteUrl: env.NEXT_PUBLIC_SITE_URL,
  /** Server-only: override URL API internal untuk server-side fetches. */
  serverApiUrl: env.API_URL,
  /** Server-only OpenAI-compatible endpoint base URL; absent means deterministic local parsing. */
  aiApiUrl: env.AI_API_URL,
  /** Optional server-only bearer credential. Never read from client finance code. */
  aiApiKey: env.AI_API_KEY,
  /** Model identifier passed to the configured OpenAI-compatible endpoint. */
  aiModel: env.AI_MODEL,
  /** Bound external AI latency so local fallback remains responsive. */
  aiTimeoutMs: 5000,
};
