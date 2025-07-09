# Guía de Desarrollo de Nuevos Módulos

Esta guía detalla el proceso para implementar nuevos módulos en el template React, cubriendo la estructura, seguridad, permisos, servicios y persistencia requeridos.

## Índice
1. [Arquitectura del Sistema](#1-arquitectura-del-sistema)
2. [Estructura de un Nuevo Módulo](#2-estructura-de-un-nuevo-módulo)
3. [Esquema de Seguridad y Permisos](#3-esquema-de-seguridad-y-permisos)
4. [Servicios y APIs](#4-servicios-y-apis)
5. [Persistencia y Estado](#5-persistencia-y-estado)
6. [Testing](#6-testing)
7. [Buenas Prácticas](#7-buenas-prácticas)
8. [Ejemplos Prácticos](#8-ejemplos-prácticos)

## 1. Arquitectura del Sistema

El template sigue una arquitectura en capas clara y bien definida:

```
┌─────────────────────────────────────┐
│           UI COMPONENTS             │ ← Componentes UI y páginas
├─────────────────────────────────────┤
│        CUSTOM HOOKS                 │ ← Lógica y estado
├─────────────────────────────────────┤
│       API SERVICES                  │ ← Comunicación con backend
├─────────────────────────────────────┤
│       HTTP CLIENT                   │ ← Cliente HTTP centralizado
├─────────────────────────────────────┤
│       BACKEND API                   │ ← .NET Core API
└─────────────────────────────────────┘
```

### Flujo de Datos
```
Acción Usuario → Componente → Hook → Service → API → Backend
     ↓
Actualización UI ← Estado ← Respuesta ← HTTP ← API Response
```

## 2. Estructura de un Nuevo Módulo

Para crear un nuevo módulo, siga esta estructura de carpetas y archivos:

```
src/
├── components/
│   └── MiNuevoModulo/                 # Componentes específicos del módulo
│       ├── index.ts                   # Archivo de exportación
│       ├── MiNuevoModuloList.tsx      # Componente de listado
│       ├── MiNuevoModuloDetail.tsx    # Componente de detalle
│       └── MiNuevoModuloForm.tsx      # Formulario del módulo
├── pages/
│   └── MiNuevoModulo/                 # Página principal del módulo
│       ├── index.ts                   # Archivo de exportación
│       └── MiNuevoModulo.tsx          # Componente de página
├── services/
│   └── miNuevoModuloService.ts        # Servicios API para el módulo
├── hooks/
│   └── useMiNuevoModulo.ts            # Hook personalizado para el módulo
└── types/
    └── miNuevoModulo.ts               # Tipos TypeScript para el módulo
```

### Pasos para implementar un nuevo módulo

1. **Crear la estructura de carpetas** como se muestra arriba
2. **Definir los tipos** en `types/miNuevoModulo.ts`
3. **Implementar servicios API** en `services/miNuevoModuloService.ts`
4. **Desarrollar el hook personalizado** en `hooks/useMiNuevoModulo.ts`
5. **Crear componentes UI** en `components/MiNuevoModulo/`
6. **Implementar la página principal** en `pages/MiNuevoModulo/`
7. **Registrar la ruta** en `AppLayout.tsx`
8. **Registrar el módulo** en el sistema de permisos

## 3. Esquema de Seguridad y Permisos

El sistema utiliza un esquema de permisos basado en roles y módulos. Esta integración es crucial para cualquier nuevo módulo que se implemente.

### 3.1. Arquitectura de Permisos

El sistema de permisos está estructurado de la siguiente manera:

1. **Backend como fuente de verdad**: El servidor mantiene la única fuente de verdad para los permisos de cada usuario.
2. **Validación a nivel API**: Cada endpoint valida los permisos del usuario antes de ejecutar operaciones.
3. **Validación en frontend**: Los componentes se adaptan según los permisos del usuario.

### 3.2. Tipos de Permisos

La enumeración `PermissionType` define los niveles de acceso disponibles:

```typescript
enum PermissionType {
  None = 0,    // Sin acceso
  Read = 10,   // Acceso de solo lectura
  Write = 20,  // Acceso de escritura/edición
  Delete = 30, // Acceso para eliminar
  Admin = 40   // Acceso administrativo completo
}
```

En el frontend, estos permisos se simplifican en tres tipos principales:

```typescript
type ModulePermission = {
  enabled: boolean;
  type: 'None' | 'ReadOnly' | 'Edit';
};
```

- `None`: Sin acceso al módulo
- `ReadOnly`: Acceso de solo lectura (equivalente a `Read` en backend)
- `Edit`: Acceso completo (equivalente a `Write`, `Delete` o `Admin` en backend)

### 3.3. Contexto de Permisos

Los permisos se gestionan a través de un contexto global y un hook personalizado:

```typescript
// src/store/UserPermissionsContext.tsx
export type UserPermissions = {
  [moduleCode: string]: ModulePermission;
};

export const UserPermissionsContext = createContext<UserPermissions>({});
```

```typescript
// src/hooks/useUserPermissions.ts
export function useUserPermissions(): UserPermissions {
  return useContext(UserPermissionsContext);
}
```

### 3.4. Protección de Rutas

El componente `ProtectedRoute` controla el acceso a las páginas según los permisos:

```tsx
// En AppLayout.tsx
<Route path="/mi-nuevo-modulo" element={
  <ProtectedRoute moduleCode="miNuevoModulo">
    <MiNuevoModulo />
  </ProtectedRoute>
} />
```

El componente `ProtectedRoute` verifica los permisos del usuario y redirige a una página de acceso denegado si el usuario no tiene permisos:

```tsx
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  moduleCode, 
  children, 
  requiredType = ['ReadOnly', 'Edit'] 
}) => {
  const permissions = useUserPermissions();
  const modulePerm = permissions[moduleCode];

  if (!modulePerm || modulePerm.type === 'None' || !requiredType.includes(modulePerm.type)) {
    return <Navigate to="/no-access" replace />;
  }

  return <>{children}</>;
};
```

### 3.5. Registro del Módulo en el Backend

El módulo debe estar registrado en la base de datos del backend con la siguiente información:

```json
{
  "id": 10,              // ID numérico único
  "name": "Mi Módulo",   // Nombre descriptivo
  "code": "mimodulo",    // Código único (se usa en frontend)
  "path": "/mimodulo",   // Ruta en el navegador
  "icon": "ModuleIcon",  // Icono de Material UI (sin el 'Mui')
  "order": 5,            // Orden en el menú lateral
  "isActive": true       // Estado activo/inactivo
}
```

> **Importante**: El `code` del módulo debe ser exactamente el mismo que se utiliza en los componentes `ProtectedRoute` y en las comprobaciones de permisos en el frontend.

### 3.6. Comprobación de Permisos en UI

Para verificar los permisos en componentes y renderizar la UI de forma condicional:

```tsx
// En el componente del módulo
import { useUserPermissions } from '../../hooks/useUserPermissions';

function MiNuevoModulo() {
  const userPermissions = useUserPermissions();
  
  // Verificar si el usuario tiene permisos de edición
  const canEdit = userPermissions['miNuevoModulo']?.type === 'Edit';
  
  // Verificar si el usuario tiene al menos permisos de lectura
  const canView = userPermissions['miNuevoModulo']?.enabled;
  
  return (
    <div>
      <h1>Mi Nuevo Módulo</h1>
      
      {!canView && (
        <Alert severity="warning">
          No tiene permisos para ver este módulo
        </Alert>
      )}
      
      {canView && (
        <>
          {/* Contenido visible para todos los usuarios con acceso */}
          <MiNuevoModuloList />
          
          {/* Acciones solo para usuarios con permisos de edición */}
          {canEdit && (
            <>
              <Button onClick={handleAdd}>Agregar</Button>
              <Button onClick={handleEdit}>Editar</Button>
            </>
          )}
          
          {/* Indicador de modo solo lectura */}
          {!canEdit && <ReadOnlyBanner />}
        </>
      )}
    </div>
  );
}
```

### 3.7. Integración de Permisos con Hooks Personalizados

Es una buena práctica integrar las comprobaciones de permisos directamente en el hook personalizado del módulo:

```typescript
export const useMiNuevoModulo = () => {
  const userPermissions = useUserPermissions();
  const canEdit = userPermissions['miNuevoModulo']?.type === 'Edit';
  
  // Resto del hook...
  
  // Incluir el estado de permisos en el retorno
  return {
    // Estados y funciones...
    permissions: {
      canView: userPermissions['miNuevoModulo']?.enabled || false,
      canEdit: canEdit || false,
      canDelete: canEdit || false // Si se necesita un control más granular
    }
  };
};
```

### 3.8. Flujo Seguro de Integración

El ciclo completo de integración con el sistema de permisos es:

1. El usuario inicia sesión y obtiene un token de autenticación
2. El frontend solicita los permisos del usuario desde el backend
3. Los permisos se almacenan en el contexto global (`UserPermissionsContext`)
4. Los componentes utilizan el hook `useUserPermissions` para verificar permisos
5. Las rutas se protegen con `ProtectedRoute`
6. Los componentes se adaptan según los permisos del usuario
7. Todas las operaciones críticas verifican permisos tanto en frontend como en backend

## 4. Servicios y APIs

### 4.1. Estructura del Servicio

Cree un archivo `services/miNuevoModuloService.ts` con la siguiente estructura:

```typescript
import { apiRequest, ApiResponse } from './apiClient';
import { isMockMode } from './apiConfig';
import { MockDataService } from './mockDataService';

// DTOs para comunicación con API
export interface MiEntidadDto {
  id: number;
  nombre: string;
  // Otros campos según API
}

export interface CreateMiEntidadDto {
  nombre: string;
  // Campos requeridos para crear
}

export interface UpdateMiEntidadDto {
  nombre?: string;
  // Campos que se pueden actualizar
}

// Interfaz para resultados paginados
export interface PagedResult<T> {
  data: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Implementación del servicio
export const miNuevoModuloService = {
  // Obtener lista con paginación
  getEntidades: async (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    sortBy?: string;
    sortDescending?: boolean;
  }): Promise<ApiResponse<PagedResult<MiEntidadDto>>> => {
    try {
      const response = await apiRequest.get('/MiEntidad', { params });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al obtener entidades',
        data: {
          data: [],
          pageNumber: 1,
          pageSize: 10,
          totalPages: 0,
          totalRecords: 0,
          hasNext: false,
          hasPrevious: false
        }
      };
    }
  },

  // Obtener por ID
  getEntidadById: async (id: number): Promise<ApiResponse<MiEntidadDto>> => {
    try {
      const response = await apiRequest.get(`/MiEntidad/${id}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: `Error al obtener entidad #${id}`,
        data: null as any
      };
    }
  },

  // Crear nueva entidad
  createEntidad: async (data: CreateMiEntidadDto): Promise<ApiResponse<MiEntidadDto>> => {
    try {
      const response = await apiRequest.post('/MiEntidad', data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al crear entidad',
        data: null as any
      };
    }
  },

  // Actualizar entidad
  updateEntidad: async (id: number, data: UpdateMiEntidadDto): Promise<ApiResponse<MiEntidadDto>> => {
    try {
      const response = await apiRequest.put(`/MiEntidad/${id}`, data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: `Error al actualizar entidad #${id}`,
        data: null as any
      };
    }
  },

  // Eliminar entidad
  deleteEntidad: async (id: number): Promise<ApiResponse<boolean>> => {
    try {
      await apiRequest.delete(`/MiEntidad/${id}`);
      return {
        success: true,
        data: true,
      };
    } catch (error) {
      return {
        success: false,
        message: `Error al eliminar entidad #${id}`,
        data: false
      };
    }
  }
};
```

### 4.2. Registro del Servicio

Actualice `services/index.ts` para exportar el nuevo servicio:

```typescript
export { miNuevoModuloService } from './miNuevoModuloService';
```

## 5. Persistencia y Estado

### 5.1. Custom Hook

Cree un hook personalizado `hooks/useMiNuevoModulo.ts` para gestionar el estado:

```typescript
import { useState, useCallback } from 'react';
import { miNuevoModuloService } from '../services';
import type { MiEntidadDto } from '../services/miNuevoModuloService';
import { useUserPermissions } from './useUserPermissions';

// Frontend-compatible interface
export interface MiEntidad {
  id: number;
  nombre: string;
  // Propiedades adicionales para la UI
}

// Pagination state
interface PaginationState {
  page: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export const useMiNuevoModulo = () => {
  // Estado
  const [entidades, setEntidades] = useState<MiEntidad[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estado de paginación
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 10,
    totalPages: 0,
    totalRecords: 0,
    hasNext: false,
    hasPrevious: false
  });
  
  // Permisos del usuario
  const userPermissions = useUserPermissions();
  const canEdit = userPermissions['miNuevoModulo']?.type === 'Edit';

  // Cargar entidades con paginación
  const loadEntidades = useCallback(async (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    sortBy?: string;
    sortDescending?: boolean;
  }) => {
    try {
      setLoading(true);
      const response = await miNuevoModuloService.getEntidades(params);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Error al cargar datos');
      }

      const pagedResult = response.data;
      setPagination({
        page: pagedResult.pageNumber,
        pageSize: pagedResult.pageSize,
        totalPages: pagedResult.totalPages,
        totalRecords: pagedResult.totalRecords,
        hasNext: pagedResult.hasNext,
        hasPrevious: pagedResult.hasPrevious
      });

      // Convertir DTO a modelo de frontend
      const mappedData = pagedResult.data.map(convertDtoToModel);
      setEntidades(mappedData);
      return mappedData;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMsg);
      console.error('Error cargando entidades:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Convertir DTO a modelo de frontend
  const convertDtoToModel = useCallback((dto: MiEntidadDto): MiEntidad => {
    return {
      id: dto.id,
      nombre: dto.nombre,
      // Mapeo adicional según necesidades
    };
  }, []);

  // Crear entidad
  const createEntidad = useCallback(async (data: { nombre: string; /* otros campos */ }) => {
    // Verificación de permisos
    if (!canEdit) {
      setError("No tiene permisos para crear entidades");
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await miNuevoModuloService.createEntidad(data);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Error al crear entidad');
      }
      
      const newEntidad = convertDtoToModel(response.data);
      setEntidades(prev => [...prev, newEntidad]);
      
      return newEntidad;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [canEdit, convertDtoToModel]);

  // Implementar otras operaciones CRUD...

  return {
    // Estado
    entidades,
    loading,
    error,
    pagination,
    
    // Permisos
    permissions: {
      canView: userPermissions['miNuevoModulo']?.enabled || false,
      canEdit: canEdit || false
    },
    
    // Acciones
    loadEntidades,
    createEntidad,
    // Otras operaciones CRUD
  };
};
```

### 5.2. Registrar el Hook

Actualice `hooks/index.ts` para exportar el nuevo hook:

```typescript
export { useMiNuevoModulo } from './useMiNuevoModulo';
```

## 6. Testing

Para cada módulo, cree archivos de prueba correspondientes:

### 6.1. Tests de Servicios

```typescript
// En services/miNuevoModuloService.test.ts
import { miNuevoModuloService } from './miNuevoModuloService';
import { apiRequest } from './apiClient';

// Mock para apiRequest
jest.mock('./apiClient', () => ({
  apiRequest: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  }
}));

describe('miNuevoModuloService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería obtener entidades correctamente', async () => {
    const mockResponse = {
      data: {
        data: [{ id: 1, nombre: 'Entidad 1' }],
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
        totalRecords: 1,
        hasNext: false,
        hasPrevious: false
      }
    };
    
    (apiRequest.get as jest.Mock).mockResolvedValueOnce(mockResponse);
    
    const result = await miNuevoModuloService.getEntidades();
    
    expect(apiRequest.get).toHaveBeenCalledWith('/MiEntidad', { params: undefined });
    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockResponse.data);
  });

  // Añadir más tests...
});
```

### 6.2. Tests de Hooks

```typescript
// En hooks/useMiNuevoModulo.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useMiNuevoModulo } from './useMiNuevoModulo';
import { miNuevoModuloService } from '../services';
import { useUserPermissions } from './useUserPermissions';

// Mock para miNuevoModuloService y useUserPermissions
jest.mock('../services', () => ({
  miNuevoModuloService: {
    getEntidades: jest.fn(),
    createEntidad: jest.fn(),
    // Otros métodos...
  }
}));

jest.mock('./useUserPermissions', () => ({
  useUserPermissions: jest.fn()
}));

describe('useMiNuevoModulo', () => {
  beforeEach(() => {
    // Mock de permisos por defecto (con acceso de edición)
    (useUserPermissions as jest.Mock).mockReturnValue({
      'miNuevoModulo': { enabled: true, type: 'Edit' }
    });
  });

  it('debería cargar entidades correctamente', async () => {
    const mockResponse = {
      success: true,
      data: {
        data: [{ id: 1, nombre: 'Entidad 1' }],
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
        totalRecords: 1,
        hasNext: false,
        hasPrevious: false
      }
    };
    
    (miNuevoModuloService.getEntidades as jest.Mock).mockResolvedValueOnce(mockResponse);
    
    const { result, waitForNextUpdate } = renderHook(() => useMiNuevoModulo());
    
    expect(result.current.loading).toBe(false);
    
    act(() => {
      result.current.loadEntidades();
    });
    
    expect(result.current.loading).toBe(true);
    
    await waitForNextUpdate();
    
    expect(result.current.loading).toBe(false);
    expect(result.current.entidades).toEqual([{ id: 1, nombre: 'Entidad 1' }]);
  });
  
  it('no debería permitir crear entidades sin permisos', async () => {
    // Mock para simular usuario sin permisos de edición
    (useUserPermissions as jest.Mock).mockReturnValue({
      'miNuevoModulo': { enabled: true, type: 'ReadOnly' }
    });
    
    const { result } = renderHook(() => useMiNuevoModulo());
    
    act(() => {
      result.current.createEntidad({ nombre: 'Nueva Entidad' });
    });
    
    expect(result.current.error).toBe("No tiene permisos para crear entidades");
    expect(miNuevoModuloService.createEntidad).not.toHaveBeenCalled();
  });

  // Añadir más tests...
});
```

### 6.3. Tests de Componentes

```tsx
// En components/MiNuevoModulo/MiNuevoModulo.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MiNuevoModulo from './MiNuevoModulo';
import { useMiNuevoModulo } from '../../hooks';

// Mock para el hook
jest.mock('../../hooks', () => ({
  useMiNuevoModulo: jest.fn()
}));

describe('MiNuevoModulo', () => {
  beforeEach(() => {
    // Configuración del mock con permisos
    (useMiNuevoModulo as jest.Mock).mockReturnValue({
      entidades: [{ id: 1, nombre: 'Entidad 1' }],
      loading: false,
      error: null,
      pagination: {
        page: 1,
        pageSize: 10,
        totalPages: 1,
        totalRecords: 1,
        hasNext: false,
        hasPrevious: false
      },
      permissions: {
        canView: true,
        canEdit: true
      },
      loadEntidades: jest.fn(),
      createEntidad: jest.fn(),
    });
  });

  it('debería renderizar correctamente', () => {
    render(<MiNuevoModulo />);
    expect(screen.getByText('Mi Nuevo Módulo')).toBeInTheDocument();
  });

  it('debería mostrar la lista de entidades', () => {
    render(<MiNuevoModulo />);
    expect(screen.getByText('Entidad 1')).toBeInTheDocument();
  });
  
  it('debería ocultar botones de edición cuando el usuario no tiene permisos', () => {
    // Cambiar mock para simular usuario sin permisos de edición
    (useMiNuevoModulo as jest.Mock).mockReturnValue({
      entidades: [{ id: 1, nombre: 'Entidad 1' }],
      loading: false,
      error: null,
      pagination: {
        page: 1,
        pageSize: 10,
        totalPages: 1,
        totalRecords: 1,
        hasNext: false,
        hasPrevious: false
      },
      permissions: {
        canView: true,
        canEdit: false
      },
      loadEntidades: jest.fn(),
      createEntidad: jest.fn(),
    });
    
    render(<MiNuevoModulo />);
    
    // El botón de agregar no debería estar presente
    expect(screen.queryByText('Agregar')).not.toBeInTheDocument();
    
    // Debería mostrar el banner de solo lectura
    expect(screen.getByText('Modo Solo Lectura')).toBeInTheDocument();
  });

  // Añadir más tests...
});
```

## 7. Buenas Prácticas

### 7.1. Nomenclatura

- **Archivos**: CamelCase para componentes (ej. `MiNuevoModulo.tsx`) y camelCase para servicios y hooks (ej. `miNuevoModuloService.ts`)
- **Interfaces**: Prefijos claros (`MiEntidadDto` para DTOs, `MiEntidad` para modelos frontend)
- **Componentes**: Nombres descriptivos en PascalCase (ej. `MiNuevoModuloList`, `MiNuevoModuloDetail`)

### 7.2. Estructura de Código

- Separar lógica de presentación
- Usar custom hooks para manejo de estado
- Componentizar para reutilización
- Aplicar principio DRY (Don't Repeat Yourself)

### 7.3. Permisos

- Registrar el módulo en el backend con el código exacto que se usará en el frontend
- Usar `ProtectedRoute` para proteger rutas
- Implementar comprobaciones de permisos tanto en hooks como en componentes
- Seguir el principio de mínimo privilegio (mostrar solo lo que el usuario puede ver/hacer)
- Manejar apropiadamente los casos de permisos insuficientes con mensajes claros

### 7.4. APIs y Servicios

- Manejar errores adecuadamente
- Implementar paginación para listas largas
- Proveer feedback al usuario durante operaciones (loading, errores, éxito)
- Validar datos antes de enviar al servidor
- Utilizar DTOs específicos para cada operación (create, update)

### 7.5. Rendimiento

- Implementar memoización con `useMemo` y `useCallback`
- Optimizar renderizado con React.memo donde sea necesario
- Evitar recálculos innecesarios
- Implementar paginación del lado del servidor para conjuntos grandes de datos

### 7.6. Accesibilidad

- Usar componentes MUI que ya incluyen características de accesibilidad
- Añadir textos alternativos a imágenes
- Asegurar contrastes adecuados
- Incluir atributos ARIA cuando sea necesario

## 8. Ejemplos Prácticos

Para un ejemplo completo paso a paso sobre cómo implementar un nuevo módulo, consulte el documento:

[Ejemplo Práctico: Implementación de un Nuevo Módulo](./EJEMPLO_NUEVO_MODULO.md)

Este ejemplo detalla la creación de un módulo de "Productos" siguiendo todas las directrices de esta guía.

---

Esta guía proporciona la estructura y los lineamientos para implementar nuevos módulos en el template. Siga estos principios para mantener la consistencia y calidad del código en todo el proyecto.
