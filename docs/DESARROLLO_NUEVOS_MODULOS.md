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

El sistema utiliza un esquema de permisos basado en roles y módulos que debe integrarse al implementar un nuevo módulo:

### 3.1. Tipos de Permisos

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

### 3.2. Protección de Rutas

El componente `ProtectedRoute` controla el acceso a las páginas según los permisos:

```tsx
// En AppLayout.tsx
<Route path="/mi-nuevo-modulo" element={
  <ProtectedRoute moduleCode="miNuevoModulo">
    <MiNuevoModulo />
  </ProtectedRoute>
} />
```

### 3.3. Registro del Módulo en el Backend

El módulo debe estar registrado en la base de datos del backend con:

- **code**: Identificador único del módulo (ej. "miNuevoModulo")
- **name**: Nombre descriptivo (ej. "Mi Nuevo Módulo")
- **description**: Descripción opcional
- **isActive**: Estado activo/inactivo
- **order**: Posición en el menú

### 3.4. Comprobación de Permisos en UI

```typescript
// En el componente del módulo
import { useUserPermissions } from '../../hooks/useUserPermissions';

function MiNuevoModulo() {
  const userPermissions = useUserPermissions();
  const canEdit = userPermissions['miNuevoModulo']?.type === 'Edit';
  
  // Renderizado condicional según permisos
  return (
    <div>
      <h1>Mi Nuevo Módulo</h1>
      {canEdit ? (
        <button>Editar</button>
      ) : (
        <ReadOnlyBanner />
      )}
    </div>
  );
}
```

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
  }, [convertDtoToModel]);

  // Implementar otras operaciones CRUD...

  return {
    // Estado
    entidades,
    loading,
    error,
    pagination,
    
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

// Mock para miNuevoModuloService
jest.mock('../services', () => ({
  miNuevoModuloService: {
    getEntidades: jest.fn(),
    createEntidad: jest.fn(),
    // Otros métodos...
  }
}));

describe('useMiNuevoModulo', () => {
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
    // Configuración del mock
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

- Registrar el módulo en el backend
- Usar `ProtectedRoute` para rutas
- Implementar comprobaciones de permisos en componentes
- Seguir principios de mínimo privilegio

### 7.4. APIs y Servicios

- Manejar errores adecuadamente
- Implementar paginación para listas largas
- Proveer feedback al usuario durante operaciones
- Validar datos antes de enviar al servidor

### 7.5. Rendimiento

- Implementar memoización con `useMemo` y `useCallback`
- Optimizar renderizado con React.memo donde sea necesario
- Evitar recálculos innecesarios

### 7.6. Accesibilidad

- Usar componentes MUI que ya incluyen características de accesibilidad
- Añadir textos alternativos a imágenes
- Asegurar contrastes adecuados
- Incluir atributos ARIA cuando sea necesario

---

Esta guía proporciona la estructura básica para implementar nuevos módulos en el template. Siga estos lineamientos para mantener la consistencia y calidad del código en todo el proyecto.
