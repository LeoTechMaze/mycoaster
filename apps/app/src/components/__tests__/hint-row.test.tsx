import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';

import { HintRow } from '../hint-row';

// Smoke test: proves the Jest + jest-expo + RNTL toolchain renders a themed
// component end to end. Real component tests come with each feature.
describe('HintRow', () => {
  it('renders the default title and hint', async () => {
    await render(<HintRow />);

    expect(screen.getByText('Try editing')).toBeOnTheScreen();
    expect(screen.getByText('app/index.tsx')).toBeOnTheScreen();
  });

  it('renders a custom title and hint', async () => {
    await render(<HintRow title="Next ride" hint="Steel Vengeance" />);

    expect(screen.getByText('Next ride')).toBeOnTheScreen();
    expect(screen.getByText('Steel Vengeance')).toBeOnTheScreen();
  });
});
