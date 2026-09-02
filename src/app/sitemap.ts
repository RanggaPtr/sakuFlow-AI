import type { MetadataRoute } from 'next';

import { paths, pathWithSlash } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------
// sitemap.ts is cached by default (frozen at build) — revalidate keeps it
// fresh against the backend. URLs carry a trailing slash to match the
// canonical form served under `trailingSlash: true`.

export const revalidate = 3600;

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${CONFIG.siteUrl}${pathWithSlash(paths.dashboard)}` },
    { url: `${CONFIG.siteUrl}${pathWithSlash(paths.transactions)}` },
    { url: `${CONFIG.siteUrl}${pathWithSlash(paths.plan)}` },
    { url: `${CONFIG.siteUrl}${pathWithSlash(paths.insights)}` },
    { url: `${CONFIG.siteUrl}${pathWithSlash(paths.settings)}` },
  ];
  return staticEntries;
}
