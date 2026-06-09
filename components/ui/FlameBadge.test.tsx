import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FlameBadge } from './FlameBadge';

describe('FlameBadge', () => {
  it('renderiza el logo con alt accesible', () => {
    render(<FlameBadge />);
    expect(screen.getByRole('img', { name: /candela/i })).toBeInTheDocument();
  });
});
