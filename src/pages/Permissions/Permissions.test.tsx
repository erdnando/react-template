import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { configureStore } from '@reduxjs/toolkit';
import Permissions from './Permissions';
import authSlice from '../../store/slices/authSlice';
import userSlice from '../../store/slices/userSlice';

// Mock the usePermissionsApi hook
jest.mock('../../hooks/usePermissionsApi', () => ({
  usePermissionsApi: () => ({
    users: [
      {
        id: 1,
        name: 'Alice Smith',
        email: 'alice@example.com',
        status: 'active',
        roleId: 1,
        isActive: true,
        role: 'admin', // changed from 'Administrador' to 'admin'
        avatar: null,
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
        joinDate: '2023-01-01',
        lastLoginAt: '2023-01-01',
        firstName: 'Alice',
        lastName: 'Smith',
        fullName: 'Alice Smith'
      },
      {
        id: 2,
        name: 'Bob Johnson',
        email: 'bob@example.com',
        status: 'active',
        roleId: 1,
        isActive: true,
        role: 'admin', // changed from 'Administrador' to 'admin'
        avatar: null,
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
        joinDate: '2023-01-01',
        lastLoginAt: '2023-01-01',
        firstName: 'Bob',
        lastName: 'Johnson',
        fullName: 'Bob Johnson'
      },
      {
        id: 3,
        name: 'Carol Williams',
        email: 'carol@example.com',
        status: 'active',
        roleId: 2,
        isActive: true,
        role: 'user', // changed from 'Analista' to 'user'
        avatar: null,
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
        joinDate: '2023-01-01',
        lastLoginAt: '2023-01-01',
        firstName: 'Carol',
        lastName: 'Williams',
        fullName: 'Carol Williams'
      },
      {
        id: 4,
        name: 'David Brown',
        email: 'david@example.com',
        status: 'active',
        roleId: 2,
        isActive: true,
        role: 'user', // changed from 'Analista' to 'user'
        avatar: null,
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
        joinDate: '2023-01-01',
        lastLoginAt: '2023-01-01',
        firstName: 'David',
        lastName: 'Brown',
        fullName: 'David Brown'
      },
      {
        id: 5,
        name: 'Eva Davis',
        email: 'eva@example.com',
        status: 'active',
        roleId: 2,
        isActive: true,
        role: 'user', // changed from 'Analista' to 'user'
        avatar: null,
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
        joinDate: '2023-01-01',
        lastLoginAt: '2023-01-01',
        firstName: 'Eva',
        lastName: 'Davis',
        fullName: 'Eva Davis'
      }
    ],
    roles: [
      { id: 1, name: 'Administrador', description: 'Full access' },
      { id: 2, name: 'Analista', description: 'Limited access' }
    ],
    modules: [
      { id: 1, name: 'Users', description: 'User management' },
      { id: 2, name: 'Reports', description: 'Report generation' }
    ],
    userModulePermissions: {},
    loading: false,
    error: null,
    deleteUser: jest.fn().mockReturnValue(Promise.resolve()),
    createRole: jest.fn().mockReturnValue(Promise.resolve()),
    updateRole: jest.fn().mockReturnValue(Promise.resolve()),
    deleteRole: jest.fn().mockReturnValue(Promise.resolve()),
    saveUserPermissions: jest.fn().mockReturnValue(Promise.resolve()),
    setUserModulePermissions: jest.fn()
  })
}));

// Mock store
const mockStore = configureStore({
  reducer: {
    auth: authSlice,
    users: userSlice,
  },
  preloadedState: {
    auth: {
      isAuthenticated: true,
      user: { id: '1', username: 'Test User', email: 'test@example.com', role: 'admin' },
      loading: false,
      error: null,
    },
    users: {
      users: [],
      loading: false,
      error: null,
    },
  },
});

const theme = createTheme();

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <Provider store={mockStore}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          {component}
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  );
};

describe('Permissions Component', () => {
  test('renders permissions management title', () => {
    renderWithProviders(<Permissions />);
    expect(screen.getByText('Permissions Management')).toBeInTheDocument();
  });

  test('renders usuarios button', () => {
    renderWithProviders(<Permissions />);
    expect(screen.getByRole('button', { name: /usuarios/i })).toBeInTheDocument();
  });

  test('renders user permissions section with role groups', () => {
    renderWithProviders(<Permissions />);
    expect(screen.getByText('User Permissions')).toBeInTheDocument();
    expect(screen.getByText(/Administrador \(2\)/)).toBeInTheDocument();
    expect(screen.getByText(/Analista \(3\)/)).toBeInTheDocument();
  });

  test('renders user permissions section', () => {
    renderWithProviders(<Permissions />);
    expect(screen.getByText('User Permissions')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Buscar usuario...')).toBeInTheDocument();
  });

  test('renders module permissions section', () => {
    renderWithProviders(<Permissions />);
    expect(screen.getByText('Permisos por Módulo')).toBeInTheDocument();
    expect(screen.getByText('Selecciona un usuario para configurar sus permisos de módulos.')).toBeInTheDocument();
  });

  test('renders save button', () => {
    renderWithProviders(<Permissions />);
    expect(screen.getByRole('button', { name: /guardar cambios/i })).toBeInTheDocument();
  });

  test('shows delete confirmation dialog when delete button is clicked', async () => {
    renderWithProviders(<Permissions />);
    
    // First expand the Administrador group to see Alice Smith
    await waitFor(() => {
      expect(screen.getByText(/Administrador \(2\)/)).toBeInTheDocument();
    });
    
    // Click to expand the Administrador group
    const adminGroup = screen.getByText(/Administrador \(2\)/).closest('div');
    if (adminGroup) {
      fireEvent.click(adminGroup);
    }

    // Wait for Alice Smith to be visible after expanding
    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    });

    // Find and click the delete button for Alice Smith
    const deleteButtons = screen.getAllByTitle('Eliminar usuario');
    fireEvent.click(deleteButtons[0]); // Click the first delete button

    // Check if the confirmation dialog appears
    await waitFor(() => {
      expect(screen.getByText('Eliminar usuario')).toBeInTheDocument();
      expect(screen.getByText(/¿Estás seguro de que deseas eliminar al usuario/)).toBeInTheDocument();
      expect(screen.getByText(/Esta acción es permanente y no se puede deshacer/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Eliminar' })).toBeInTheDocument();
    });
  });

  test('cancels user deletion when cancel button is clicked', async () => {
    renderWithProviders(<Permissions />);
    
    // First expand the Administrador group to see Alice Smith
    await waitFor(() => {
      expect(screen.getByText(/Administrador \(2\)/)).toBeInTheDocument();
    });
    
    // Click to expand the Administrador group
    const adminGroup = screen.getByText(/Administrador \(2\)/).closest('div');
    if (adminGroup) {
      fireEvent.click(adminGroup);
    }

    // Wait for Alice Smith to be visible after expanding
    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    });

    // Find and click the delete button for Alice Smith
    const deleteButtons = screen.getAllByTitle('Eliminar usuario');
    fireEvent.click(deleteButtons[0]);

    // Wait for dialog to appear and click cancel
    await waitFor(() => {
      expect(screen.getByText('Eliminar usuario')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Check that dialog is closed and user still exists
    await waitFor(() => {
      expect(screen.queryByText('Eliminar usuario')).not.toBeInTheDocument();
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    });
  });

  test('shows role groups with expand/collapse functionality', async () => {
    renderWithProviders(<Permissions />);
    
    // Wait for the component to render
    await waitFor(() => {
      expect(screen.getByText(/Administrador \(\d+\)/)).toBeInTheDocument();
      expect(screen.getByText(/Analista \(\d+\)/)).toBeInTheDocument();
    });

    // Check that role groups show user count
    expect(screen.getByText(/Administrador \(2\)/)).toBeInTheDocument();
    expect(screen.getByText(/Analista \(3\)/)).toBeInTheDocument();

    // Initially, users should be hidden (groups collapsed by default)
    expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument();
    expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
    expect(screen.queryByText('Charlie Lee')).not.toBeInTheDocument();

    // Expand the Administrador group
    const adminGroup = screen.getByText(/Administrador \(2\)/).closest('div');
    if (adminGroup) {
      fireEvent.click(adminGroup);
      
      // After expanding, users should be visible
      await waitFor(() => {
        expect(screen.getByText('Alice Smith')).toBeInTheDocument();
        expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
      });
    }

    // Expand the Analista group
    const analystGroup = screen.getByText(/Analista \(3\)/).closest('div');
    if (analystGroup) {
      fireEvent.click(analystGroup);
      
      // After expanding, analyst users should be visible
      await waitFor(() => {
        expect(screen.getByText('Charlie Lee')).toBeInTheDocument();
      });
    }

    // Collapse the Administrador group again
    if (adminGroup) {
      fireEvent.click(adminGroup);
      
      // Wait for the collapse and check users are hidden again
      await waitFor(() => {
        expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument();
        expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
        // But users from expanded groups should still be visible
        expect(screen.getByText('Charlie Lee')).toBeInTheDocument();
      });
    }
  });

  test('shows user role information in module permissions section', async () => {
    renderWithProviders(<Permissions />);
    
    // First expand the Administrador group to see Alice Smith
    await waitFor(() => {
      expect(screen.getByText(/Administrador \(2\)/)).toBeInTheDocument();
    });
    
    // Click to expand the Administrador group
    const adminGroup = screen.getByText(/Administrador \(2\)/).closest('div');
    if (adminGroup) {
      fireEvent.click(adminGroup);
    }

    // Wait for Alice Smith to be visible after expanding
    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    });

    // Click on Alice Smith to select her
    fireEvent.click(screen.getByText('Alice Smith'));

    // Wait for the module permissions section to update and check for the role
    await waitFor(() => {
      expect(screen.getByText('(Administrador)')).toBeInTheDocument();
    });

    // Expand the Analista group to test with a user from a different role
    const analystGroup = screen.getByText(/Analista \(3\)/).closest('div');
    if (analystGroup) {
      fireEvent.click(analystGroup);
    }

    await waitFor(() => {
      expect(screen.getByText('Charlie Lee')).toBeInTheDocument();
    });

    // Test with a user from a different role
    fireEvent.click(screen.getByText('Charlie Lee'));

    await waitFor(() => {
      expect(screen.getByText('(Analista)')).toBeInTheDocument();
    });
  });
});
