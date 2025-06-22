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
    const headingElement = screen.getByRole('heading', { name: /Tasks/i });
    expect(headingElement).toBeInTheDocument();
  });

  test('displays form fields', () => {
    renderWithProviders(<Tasks />);
    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    const addOrUpdateButton =
        screen.queryByRole('button', { name: /Add Task/i }) ||
        screen.queryByRole('button', { name: /Update/i });
    expect(addOrUpdateButton).toBeInTheDocument();
  });

  // Puedes agregar más pruebas según la lógica de tu componente
});