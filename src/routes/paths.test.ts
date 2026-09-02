import { it, expect, describe } from 'vitest';

import { paths } from './paths';

describe('finance route contract', () => {
  it('centralizes every finance route', () => {
    expect({
      root: paths.root,
      dashboard: paths.dashboard,
      onboarding: paths.onboarding,
      transactions: paths.transactions,
      plan: paths.plan,
      insights: paths.insights,
      settings: paths.settings,
    }).toEqual({
      root: '/',
      dashboard: '/dashboard',
      onboarding: '/onboarding',
      transactions: '/transactions',
      plan: '/plan',
      insights: '/insights',
      settings: '/settings',
    });
  });
});
