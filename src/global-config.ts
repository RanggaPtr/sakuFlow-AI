import { env } from 'src/lib/env';

import packageJson from '../package.json';

// ----------------------------------------------------------------------
// Semua env sudah divalidasi zod di src/lib/env.ts (fail-fast saat build bila
// var wajib hilang). Konsumsi konfigurasi lewat objek ini, bukan process.env.

export const CONFIG = {
  appName: 'SakuFlow AI',
  appVersion: packageJson.version,
  assetsDir: env.NEXT_PUBLIC_ASSETS_DIR,
  /** Tampilkan galeri referensi /components di build production (dev selalu tampil). */
  showComponents: env.NEXT_PUBLIC_SHOW_COMPONENTS,
  /** Go backend base URL (marketplace-be). */
  apiUrl: env.NEXT_PUBLIC_API_URL,
  /** Tenant slug sent as X-Company-Slug on every public API call. */
  companySlug: env.NEXT_PUBLIC_COMPANY_SLUG,
  /**
   * Whitelabel client slug (level di atas company — lihat core/auth.md:
   * JWT membawa client_id + company_id). Dipakai untuk bootstrap translation
   * overrides (`GET /core/v1/translation-overrides?slug={client_slug}`) dan
   * endpoint yang me-resolve tenant via X-Client-Slug.
   */
  clientSlug: env.NEXT_PUBLIC_CLIENT_SLUG,
  /**
   * Public site origin — canonical URLs, OG tags, sitemap, robots.
   * Sudah ternormalisasi (tanpa trailing slash); production wajib di-set.
   */
  siteUrl: env.NEXT_PUBLIC_SITE_URL,
  /** Server-only: override URL API internal (k8s) untuk fetch RSC/sitemap. */
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
