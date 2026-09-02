import { it, expect, describe } from 'vitest';

import { SYSTEM_PROMPT } from './prompt';

describe('SYSTEM_PROMPT', () => {
  it('documents every finance intent with exact fields and safe boundaries', () => {
    expect(SYSTEM_PROMPT).toContain('add_obligation');
    expect(SYSTEM_PROMPT).toContain('create_goal');
    expect(SYSTEM_PROMPT).toContain('simulate_purchase');
    expect(SYSTEM_PROMPT).toContain('ask_summary');
    expect(SYSTEM_PROMPT).toContain('mark_obligation_paid');
    expect(SYSTEM_PROMPT).toContain('obligationName');
    expect(SYSTEM_PROMPT).toContain('targetAmount');
    expect(SYSTEM_PROMPT).toContain('targetDate');
    expect(SYSTEM_PROMPT).toContain('Never request, infer, reveal, or');
    expect(SYSTEM_PROMPT).toContain('salary');
    expect(SYSTEM_PROMPT).toContain('emergency');
    expect(SYSTEM_PROMPT).toContain('utilities');
  });
});
