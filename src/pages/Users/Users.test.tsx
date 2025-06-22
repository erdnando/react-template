import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import store from '../../store';
import Users from './Users';

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

describe('Users Component', () => {
  test('renders Users page', () => {
    renderWithProviders(<Users />);
    const headingElement = screen.getByText(/User Management/i);
    expect(headingElement).toBeInTheDocument();
  });

  test('displays user statistics cards', () => {
    renderWithProviders(<Users />);
    const totalUsersCard = screen.getByText(/Total Users/i);
    const activeUsersCard = screen.getByText(/Active Users/i);
    expect(totalUsersCard).toBeInTheDocument();
    expect(activeUsersCard).toBeInTheDocument();
  });

  // Additional tests can be added here
});