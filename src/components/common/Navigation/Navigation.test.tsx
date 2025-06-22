import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navigation from './Navigation';

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Navigation Component', () => {
  test('renders navigation links', () => {
    renderWithRouter(<Navigation />);
    const homeLink = screen.getByText(/home/i);
    const catalogLink = screen.getByText(/catalogs/i);
    const usersLink = screen.getByText(/users/i);
    expect(homeLink).toBeInTheDocument();
    expect(catalogLink).toBeInTheDocument();
    expect(usersLink).toBeInTheDocument();
  });

  test('matches snapshot', () => {
    const { asFragment } = renderWithRouter(<Navigation />);
    expect(asFragment()).toMatchSnapshot();
  });
});