import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { store } from '../../store/store';
import Home from './Home';

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

describe('Home Component', () => {
  test('renders Home page', () => {
    renderWithProviders(<Home />);
    const headingElement = screen.getByText(/Welcome to React Template/i);
    expect(headingElement).toBeInTheDocument();
  });

  test('shows login button when not authenticated', () => {
    renderWithProviders(<Home />);
    const loginButton = screen.getByText(/Login Now/i);
    expect(loginButton).toBeInTheDocument();
  });

  // Add more tests as needed
});