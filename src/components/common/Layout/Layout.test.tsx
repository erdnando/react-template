import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { store } from '../../../store/store';
import Layout from './Layout';

// Mock the useAuth hook
jest.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    logout: jest.fn(),
  }),
}));

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

describe('Layout Component', () => {
  test('renders children correctly', () => {
    renderWithProviders(
      <Layout>
        <div>Test Child</div>
      </Layout>
    );
    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  test('renders main layout structure', () => {
    renderWithProviders(<Layout><div>Content</div></Layout>);
    // Test that the layout renders without errors
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});