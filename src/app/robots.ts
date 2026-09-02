import type { MetadataRoute } from 'next';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      noindex: true,
      nofollow: true,
      disallow: ['/components/', '/blank/', '/error/', '/coming-soon/', '/maintenance/'],
    } as MetadataRoute.Robots['rules'] & { noindex: true; nofollow: true },
    sitemap: `${CONFIG.siteUrl}/sitemap.xml`,
  };
}
