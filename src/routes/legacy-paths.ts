/** Compatibility routes for reusable template examples only. */
export const legacyPaths = {
  components: '/components',
  support: '/support',
  article: {
    root: '/article',
    details: (slug: string) => `/article/${slug}`,
  },
};
