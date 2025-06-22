import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { store } from '../../store/store';
import Login from './Login';

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

describe('Login Component', () => {
  test('renders login form', () => {
    renderWithProviders(<Login />);
    const loginElement = screen.getByRole('heading', { name: /Welcome Back/i });
    expect(loginElement).toBeInTheDocument();
  });

  test('has email and password fields', () => {
    renderWithProviders(<Login />);
    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
  });

  test('has a submit button', () => {
    renderWithProviders(<Login />);
    const submitButton = screen.getByRole('button', { name: /Sign In/i });
    expect(submitButton).toBeInTheDocument();
  });
});