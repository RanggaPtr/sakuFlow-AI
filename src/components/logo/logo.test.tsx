import { it, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';

import { Logo } from './logo';

describe('Logo', () => {
  it('uses SakuFlow identity on shared error and loading surfaces', () => {
    render(<Logo />);
    expect(screen.getByRole('link', { name: 'SakuFlow AI' })).toBeInTheDocument();
    expect(screen.getByText('SakuFlow AI')).toBeInTheDocument();
  });
});
