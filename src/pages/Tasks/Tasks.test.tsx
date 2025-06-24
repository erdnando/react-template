import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import store from '../../store';
import Tasks from './Tasks';

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

describe('Tasks Component', () => {
  test('renders Tasks page', () => {
    renderWithProviders(<Tasks />);
    const headingElement = screen.getByRole('heading', { name: /Task Management/i });
    expect(headingElement).toBeInTheDocument();
  });

  test('displays form fields', () => {
    renderWithProviders(<Tasks />);
    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    const addButtons = screen.getAllByRole('button', { name: /Add Task/i });
    expect(addButtons.length).toBeGreaterThan(0);
  });

  // Puedes agregar más pruebas según la lógica de tu componente
});