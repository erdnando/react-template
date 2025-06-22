import React from 'react';
import { render, screen } from '@testing-library/react';
import Card from './Card';

describe('Card Component', () => {
  test('renders the card with content', () => {
    render(<Card title="Test Card" content="This is a test card." />);
    expect(screen.getByRole('heading', { name: /Test Card/i })).toBeInTheDocument();
    expect(screen.getByText(/This is a test card./i)).toBeInTheDocument();
  });

  test('renders without crashing', () => {
    const { container } = render(<Card title="Sample Card" content="Sample content." />);
    expect(container).toBeInTheDocument();
  });
});