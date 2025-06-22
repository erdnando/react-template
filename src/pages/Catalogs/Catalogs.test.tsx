import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import store from '../../store';
import Catalogs from './Catalogs';

const theme = createTheme();

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          {component}
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  );
};

describe('Catalogs Component', () => {
  test('renders Catalogs page', () => {
    renderWithProviders(<Catalogs />);
    const headingElement = screen.getByText(/Product Catalog/i);
    expect(headingElement).toBeInTheDocument();
  });

  test('displays search and category filter', () => {
    renderWithProviders(<Catalogs />);
    const searchInput = screen.getByPlaceholderText(/Search products/i);
    const categorySelect = screen.getByRole('combobox');
    expect(searchInput).toBeInTheDocument();
    expect(categorySelect).toBeInTheDocument();
  });

  // Additional tests can be added here
});