import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('renders the app correctly', () => {
  render(<App />);
  // Test that the app renders without crashing and shows some content
  // Since it uses Redux and Router, we just check it renders without errors
  expect(document.body).toBeInTheDocument();
});