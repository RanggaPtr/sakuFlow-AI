// ----------------------------------------------------------------------
// Semua string route terpusat di sini — jangan hardcode URL di komponen.
//
// Kebijakan trailing slash: entri di bawah TANPA trailing slash (Next
// menormalkan saat navigasi karena `trailingSlash: true`). Untuk URL yang
// dipublikasikan ke crawler (canonical, sitemap, JSON-LD), SELALU tambahkan
// '/' di akhir — gunakan `pathWithSlash()` supaya konsisten.

export const pathWithSlash = (path: string) => (path.endsWith('/') ? path : `${path}/`);

export const paths = {
  root: '/',
  dashboard: '/dashboard',
  onboarding: '/onboarding',
  transactions: '/transactions',
  plan: '/plan',
  insights: '/insights',
  settings: '/settings',
  home: '/dashboard', // alias for old Venturo routes
  support: '/support',
  components: '/components',
  article: {
    root: '/article',
    details: (slug: string) => `/article/${slug}`,
  },
};
