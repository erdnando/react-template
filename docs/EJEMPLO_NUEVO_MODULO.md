# Ejemplo Práctico: Implementación de un Nuevo Módulo

Este documento ofrece un ejemplo paso a paso sobre cómo implementar un nuevo módulo llamado "Productos" en el template React, siguiendo la guía general de desarrollo.

## Índice
1. [Definición de Tipos](#1-definición-de-tipos)
2. [Creación del Servicio API](#2-creación-del-servicio-api)
3. [Desarrollo del Custom Hook](#3-desarrollo-del-custom-hook)
4. [Implementación de Componentes](#4-implementación-de-componentes)
5. [Creación de la Página](#5-creación-de-la-página)
6. [Registro de la Ruta](#6-registro-de-la-ruta)
7. [Configuración de Permisos](#7-configuración-de-permisos)

## 1. Definición de Tipos

Primero, definimos los tipos necesarios para el módulo de Productos:

```typescript
// src/types/producto.ts
export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoria: string;
  imagenUrl?: string;
  activo: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface CreateProductoDto {
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoria: string;
  imagenUrl?: string;
  activo: boolean;
}

export interface UpdateProductoDto {
  nombre?: string;
  descripcion?: string;
  precio?: number;
  stock?: number;
  categoria?: string;
  imagenUrl?: string;
  activo?: boolean;
}

export interface ProductoFiltros {
  busqueda?: string;
  categoria?: string;
  precioMinimo?: number;
  precioMaximo?: number;
  soloActivos?: boolean;
}
```

## 2. Creación del Servicio API

Implementamos el servicio para comunicarse con el backend:

```typescript
// src/services/productoService.ts
import { apiRequest, ApiResponse } from './apiClient';
import { Producto, CreateProductoDto, UpdateProductoDto, ProductoFiltros } from '../types/producto';

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

export const productoService = {
  // Obtener productos con paginación y filtros
  getProductos: async (params?: {
    page?: number;
    pageSize?: number;
    filtros?: ProductoFiltros;
    sortBy?: string;
    sortDescending?: boolean;
  }): Promise<ApiResponse<PagedResult<Producto>>> => {
    try {
      // Construir parámetros de consulta
      const queryParams = {
        page: params?.page || 1,
        pageSize: params?.pageSize || 10,
        busqueda: params?.filtros?.busqueda || '',
        categoria: params?.filtros?.categoria || '',
        precioMinimo: params?.filtros?.precioMinimo || '',
        precioMaximo: params?.filtros?.precioMaximo || '',
        soloActivos: params?.filtros?.soloActivos || false,
        sortBy: params?.sortBy || 'nombre',
        sortDescending: params?.sortDescending || false
      };

      const response = await apiRequest.get('/Productos', { params: queryParams });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error al obtener productos:', error);
      return {
        success: false,
        message: 'Error al obtener productos. Por favor, intente de nuevo.',
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

  // Obtener un producto por ID
  getProductoById: async (id: number): Promise<ApiResponse<Producto>> => {
    try {
      const response = await apiRequest.get(`/Productos/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error(`Error al obtener producto #${id}:`, error);
      return {
        success: false,
        message: `No se pudo obtener información del producto #${id}.`,
        data: null as any
      };
    }
  },

  // Crear un nuevo producto
  createProducto: async (data: CreateProductoDto): Promise<ApiResponse<Producto>> => {
    try {
      const response = await apiRequest.post('/Productos', data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error al crear producto:', error);
      return {
        success: false,
        message: 'No se pudo crear el producto. Verifique los datos e intente de nuevo.',
        data: null as any
      };
    }
  },

  // Actualizar un producto existente
  updateProducto: async (id: number, data: UpdateProductoDto): Promise<ApiResponse<Producto>> => {
    try {
      const response = await apiRequest.put(`/Productos/${id}`, data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error(`Error al actualizar producto #${id}:`, error);
      return {
        success: false,
        message: `No se pudo actualizar el producto #${id}. Verifique los datos e intente de nuevo.`,
        data: null as any
      };
    }
  },

  // Eliminar un producto
  deleteProducto: async (id: number): Promise<ApiResponse<boolean>> => {
    try {
      await apiRequest.delete(`/Productos/${id}`);
      return {
        success: true,
        data: true
      };
    } catch (error) {
      console.error(`Error al eliminar producto #${id}:`, error);
      return {
        success: false,
        message: `No se pudo eliminar el producto #${id}.`,
        data: false
      };
    }
  },

  // Obtener categorías disponibles
  getCategorias: async (): Promise<ApiResponse<string[]>> => {
    try {
      const response = await apiRequest.get('/Productos/categorias');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      return {
        success: false,
        message: 'No se pudieron cargar las categorías.',
        data: []
      };
    }
  }
};

// Actualizar index.ts para exportar el servicio
// En services/index.ts
// export { productoService } from './productoService';
```

## 3. Desarrollo del Custom Hook

Creamos un hook personalizado para manejar el estado y la lógica del módulo:

```typescript
// src/hooks/useProductos.ts
import { useState, useCallback, useEffect } from 'react';
import { Producto, CreateProductoDto, UpdateProductoDto, ProductoFiltros } from '../types/producto';
import { productoService } from '../services/productoService';

// Estado de paginación
interface PaginationState {
  page: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export const useProductos = () => {
  // Estados
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estado de filtros
  const [filtros, setFiltros] = useState<ProductoFiltros>({
    soloActivos: true
  });
  
  // Estado de ordenamiento
  const [sortBy, setSortBy] = useState('nombre');
  const [sortDescending, setSortDescending] = useState(false);
  
  // Estado de paginación
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 10,
    totalPages: 0,
    totalRecords: 0,
    hasNext: false,
    hasPrevious: false
  });

  // Cargar categorías al iniciar
  const loadCategorias = useCallback(async () => {
    try {
      const response = await productoService.getCategorias();
      if (response.success && response.data) {
        setCategorias(response.data);
      } else {
        setError('Error al cargar categorías.');
      }
    } catch (err) {
      setError('Error al cargar categorías. Intente de nuevo más tarde.');
      console.error('Error cargando categorías:', err);
    }
  }, []);

  // Cargar datos al iniciar
  useEffect(() => {
    loadCategorias();
  }, [loadCategorias]);

  // Cargar productos con paginación y filtros
  const loadProductos = useCallback(async (page = 1, pageSize = 10) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await productoService.getProductos({
        page,
        pageSize,
        filtros,
        sortBy,
        sortDescending
      });
      
      if (response.success && response.data) {
        setProductos(response.data.data);
        setPagination({
          page: response.data.pageNumber,
          pageSize: response.data.pageSize,
          totalPages: response.data.totalPages,
          totalRecords: response.data.totalRecords,
          hasNext: response.data.hasNext,
          hasPrevious: response.data.hasPrevious
        });
      } else {
        setError(response.message || 'Error al cargar productos.');
      }
    } catch (err) {
      setError('Error al cargar productos. Intente de nuevo más tarde.');
      console.error('Error cargando productos:', err);
    } finally {
      setLoading(false);
    }
  }, [filtros, sortBy, sortDescending]);

  // Cargar un producto por ID
  const loadProductoById = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await productoService.getProductoById(id);
      if (response.success && response.data) {
        setSelectedProducto(response.data);
        return response.data;
      } else {
        setError(response.message || `Error al cargar producto #${id}.`);
        return null;
      }
    } catch (err) {
      setError(`Error al cargar producto #${id}. Intente de nuevo más tarde.`);
      console.error(`Error cargando producto #${id}:`, err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear un nuevo producto
  const createProducto = useCallback(async (data: CreateProductoDto) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await productoService.createProducto(data);
      if (response.success && response.data) {
        // Recargar productos para reflejar cambios
        await loadProductos(pagination.page, pagination.pageSize);
        return response.data;
      } else {
        setError(response.message || 'Error al crear producto.');
        return null;
      }
    } catch (err) {
      setError('Error al crear producto. Verifique los datos e intente de nuevo.');
      console.error('Error creando producto:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [loadProductos, pagination.page, pagination.pageSize]);

  // Actualizar un producto existente
  const updateProducto = useCallback(async (id: number, data: UpdateProductoDto) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await productoService.updateProducto(id, data);
      if (response.success && response.data) {
        // Actualizar producto seleccionado si es el mismo
        if (selectedProducto && selectedProducto.id === id) {
          setSelectedProducto(response.data);
        }
        // Recargar productos para reflejar cambios
        await loadProductos(pagination.page, pagination.pageSize);
        return response.data;
      } else {
        setError(response.message || `Error al actualizar producto #${id}.`);
        return null;
      }
    } catch (err) {
      setError(`Error al actualizar producto #${id}. Verifique los datos e intente de nuevo.`);
      console.error(`Error actualizando producto #${id}:`, err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [loadProductos, pagination.page, pagination.pageSize, selectedProducto]);

  // Eliminar un producto
  const deleteProducto = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await productoService.deleteProducto(id);
      if (response.success && response.data) {
        // Recargar productos para reflejar cambios
        await loadProductos(pagination.page, pagination.pageSize);
        // Si el producto eliminado era el seleccionado, limpiar selección
        if (selectedProducto && selectedProducto.id === id) {
          setSelectedProducto(null);
        }
        return true;
      } else {
        setError(response.message || `Error al eliminar producto #${id}.`);
        return false;
      }
    } catch (err) {
      setError(`Error al eliminar producto #${id}. Intente de nuevo más tarde.`);
      console.error(`Error eliminando producto #${id}:`, err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadProductos, pagination.page, pagination.pageSize, selectedProducto]);

  // Actualizar filtros
  const updateFiltros = useCallback((nuevosFiltros: ProductoFiltros) => {
    setFiltros(prev => ({ ...prev, ...nuevosFiltros }));
    // Volver a la primera página al cambiar filtros
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  // Actualizar ordenamiento
  const updateSort = useCallback((campo: string, descendente: boolean) => {
    setSortBy(campo);
    setSortDescending(descendente);
  }, []);

  // Cambiar página
  const changePage = useCallback((newPage: number) => {
    loadProductos(newPage, pagination.pageSize);
  }, [loadProductos, pagination.pageSize]);

  // Cambiar tamaño de página
  const changePageSize = useCallback((newSize: number) => {
    loadProductos(1, newSize);
  }, [loadProductos]);

  return {
    // Estados
    productos,
    categorias,
    selectedProducto,
    loading,
    error,
    filtros,
    pagination,
    sortBy,
    sortDescending,
    
    // Acciones
    loadProductos,
    loadProductoById,
    createProducto,
    updateProducto,
    deleteProducto,
    setSelectedProducto,
    updateFiltros,
    updateSort,
    changePage,
    changePageSize,
  };
};

// Actualizar hooks/index.ts
// export { useProductos } from './useProductos';
```

## 4. Implementación de Componentes

Creamos los componentes necesarios para el módulo:

### ProductosList.tsx

```tsx
// src/components/Productos/ProductosList.tsx
import React from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Tooltip,
  TableSortLabel
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Producto } from '../../types/producto';

interface ProductosListProps {
  productos: Producto[];
  loading: boolean;
  page: number;
  pageSize: number;
  totalCount: number;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newSize: number) => void;
  onSortChange: (field: string) => void;
  onView: (producto: Producto) => void;
  onEdit: (producto: Producto) => void;
  onDelete: (producto: Producto) => void;
  canEdit: boolean;
}

export const ProductosList: React.FC<ProductosListProps> = ({
  productos,
  loading,
  page,
  pageSize,
  totalCount,
  sortBy,
  sortDirection,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onView,
  onEdit,
  onDelete,
  canEdit
}) => {
  const handleChangePage = (event: unknown, newPage: number) => {
    onPageChange(newPage + 1); // +1 porque MUI usa base 0
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    onPageSizeChange(parseInt(event.target.value, 10));
  };

  const createSortHandler = (property: string) => () => {
    onSortChange(property);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value);
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="productos table">
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'nombre'}
                  direction={sortBy === 'nombre' ? sortDirection : 'asc'}
                  onClick={createSortHandler('nombre')}
                >
                  Nombre
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'categoria'}
                  direction={sortBy === 'categoria' ? sortDirection : 'asc'}
                  onClick={createSortHandler('categoria')}
                >
                  Categoría
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={sortBy === 'precio'}
                  direction={sortBy === 'precio' ? sortDirection : 'asc'}
                  onClick={createSortHandler('precio')}
                >
                  Precio
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={sortBy === 'stock'}
                  direction={sortBy === 'stock' ? sortDirection : 'asc'}
                  onClick={createSortHandler('stock')}
                >
                  Stock
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">Estado</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {productos.map((producto) => (
              <TableRow hover key={producto.id}>
                <TableCell component="th" scope="row">
                  {producto.nombre}
                </TableCell>
                <TableCell>{producto.categoria}</TableCell>
                <TableCell align="right">{formatCurrency(producto.precio)}</TableCell>
                <TableCell align="right">{producto.stock}</TableCell>
                <TableCell align="center">
                  <Chip 
                    label={producto.activo ? "Activo" : "Inactivo"}
                    color={producto.activo ? "success" : "default"}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Ver detalles">
                    <IconButton size="small" onClick={() => onView(producto)}>
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  
                  {canEdit && (
                    <>
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => onEdit(producto)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Eliminar">
                        <IconButton size="small" onClick={() => onDelete(producto)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={totalCount}
        rowsPerPage={pageSize}
        page={page - 1} // -1 porque MUI usa base 0
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        labelRowsPerPage="Filas por página:"
      />
    </Paper>
  );
};

export default ProductosList;
```

### ProductoForm.tsx

```tsx
// src/components/Productos/ProductoForm.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Grid,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import { Producto, CreateProductoDto, UpdateProductoDto } from '../../types/producto';

interface ProductoFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CreateProductoDto | UpdateProductoDto) => void;
  producto?: Producto | null;
  categorias: string[];
  loading: boolean;
}

export const ProductoForm: React.FC<ProductoFormProps> = ({
  open,
  onClose,
  onSave,
  producto,
  categorias,
  loading
}) => {
  const [formData, setFormData] = useState<CreateProductoDto | UpdateProductoDto>({
    nombre: '',
    descripcion: '',
    precio: 0,
    stock: 0,
    categoria: '',
    activo: true,
    imagenUrl: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cargar datos del producto si existe
  useEffect(() => {
    if (producto) {
      setFormData({
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precio: producto.precio,
        stock: producto.stock,
        categoria: producto.categoria,
        activo: producto.activo,
        imagenUrl: producto.imagenUrl || ''
      });
    } else {
      // Resetear formulario si es nuevo
      setFormData({
        nombre: '',
        descripcion: '',
        precio: 0,
        stock: 0,
        categoria: categorias.length > 0 ? categorias[0] : '',
        activo: true,
        imagenUrl: ''
      });
    }
    setErrors({});
  }, [producto, categorias]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (!name) return;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error al cambiar valor
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.nombre?.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }
    
    if (!formData.descripcion?.trim()) {
      newErrors.descripcion = 'La descripción es obligatoria';
    }
    
    if ((formData.precio || 0) <= 0) {
      newErrors.precio = 'El precio debe ser mayor que cero';
    }
    
    if ((formData.stock || 0) < 0) {
      newErrors.stock = 'El stock no puede ser negativo';
    }
    
    if (!formData.categoria?.trim()) {
      newErrors.categoria = 'La categoría es obligatoria';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title">
        {producto ? 'Editar Producto' : 'Nuevo Producto'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <TextField
              name="nombre"
              label="Nombre"
              value={formData.nombre}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.nombre}
              helperText={errors.nombre}
              disabled={loading}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required error={!!errors.categoria}>
              <InputLabel id="categoria-label">Categoría</InputLabel>
              <Select
                labelId="categoria-label"
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                label="Categoría"
                disabled={loading}
              >
                {categorias.map(cat => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              name="precio"
              label="Precio"
              type="number"
              value={formData.precio}
              onChange={handleNumberChange}
              fullWidth
              required
              error={!!errors.precio}
              helperText={errors.precio}
              disabled={loading}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              name="stock"
              label="Stock"
              type="number"
              value={formData.stock}
              onChange={handleNumberChange}
              fullWidth
              required
              error={!!errors.stock}
              helperText={errors.stock}
              disabled={loading}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              name="descripcion"
              label="Descripción"
              value={formData.descripcion}
              onChange={handleChange}
              fullWidth
              required
              multiline
              rows={4}
              error={!!errors.descripcion}
              helperText={errors.descripcion}
              disabled={loading}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              name="imagenUrl"
              label="URL de Imagen"
              value={formData.imagenUrl}
              onChange={handleChange}
              fullWidth
              disabled={loading}
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.activo}
                  onChange={handleSwitchChange}
                  name="activo"
                  color="primary"
                  disabled={loading}
                />
              }
              label="Producto activo"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit} 
          color="primary" 
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : undefined}
        >
          {loading ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductoForm;
```

### ProductoDetail.tsx

```tsx
// src/components/Productos/ProductoDetail.tsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Chip,
  Divider,
  Box
} from '@mui/material';
import { Producto } from '../../types/producto';

interface ProductoDetailProps {
  open: boolean;
  onClose: () => void;
  producto: Producto | null;
  onEdit: (producto: Producto) => void;
  canEdit: boolean;
}

export const ProductoDetail: React.FC<ProductoDetailProps> = ({
  open,
  onClose,
  producto,
  onEdit,
  canEdit
}) => {
  if (!producto) {
    return null;
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      aria-labelledby="detail-dialog-title"
    >
      <DialogTitle id="detail-dialog-title">
        Detalle del Producto
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h5" gutterBottom>
                {producto.nombre}
              </Typography>
              <Chip 
                label={producto.activo ? "Activo" : "Inactivo"}
                color={producto.activo ? "success" : "default"}
                size="small"
                sx={{ mr: 1 }}
              />
              <Chip 
                label={producto.categoria}
                color="primary"
                size="small"
              />
            </Box>
            
            <Typography variant="body1" paragraph>
              {producto.descripcion}
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Precio:</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {formatCurrency(producto.precio)}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="subtitle2">Stock disponible:</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {producto.stock} unidades
                </Typography>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle2">Creado:</Typography>
            <Typography variant="body2">{formatDate(producto.fechaCreacion)}</Typography>
            
            <Typography variant="subtitle2" sx={{ mt: 1 }}>Última actualización:</Typography>
            <Typography variant="body2">{formatDate(producto.fechaActualizacion)}</Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            {producto.imagenUrl ? (
              <Box
                component="img"
                src={producto.imagenUrl}
                alt={producto.nombre}
                sx={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 1,
                  boxShadow: 1
                }}
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: '300px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'grey.100',
                  borderRadius: 1,
                  color: 'text.secondary'
                }}
              >
                <Typography>Sin imagen disponible</Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cerrar
        </Button>
        {canEdit && (
          <Button 
            onClick={() => onEdit(producto)} 
            color="primary" 
            variant="contained"
          >
            Editar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ProductoDetail;
```

### Filtros.tsx

```tsx
// src/components/Productos/ProductosFiltros.tsx
import React, { useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Button,
  Grid,
  InputAdornment,
  Box
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListIcon from '@mui/icons-material/FilterList';
import { ProductoFiltros } from '../../types/producto';

interface ProductosFiltrosProps {
  filtros: ProductoFiltros;
  categorias: string[];
  onChange: (filtros: ProductoFiltros) => void;
}

export const ProductosFiltros: React.FC<ProductosFiltrosProps> = ({
  filtros,
  categorias,
  onChange
}) => {
  const [tempFiltros, setTempFiltros] = useState<ProductoFiltros>(filtros);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (!name) return;
    
    setTempFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setTempFiltros(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let parsedValue = value === '' ? undefined : parseFloat(value);
    
    if (parsedValue !== undefined && isNaN(parsedValue)) {
      parsedValue = undefined;
    }
    
    setTempFiltros(prev => ({
      ...prev,
      [name]: parsedValue
    }));
  };

  const handleApplyFilters = () => {
    onChange(tempFiltros);
  };

  const handleResetFilters = () => {
    const resetFiltros: ProductoFiltros = {
      busqueda: '',
      categoria: '',
      precioMinimo: undefined,
      precioMaximo: undefined,
      soloActivos: true
    };
    setTempFiltros(resetFiltros);
    onChange(resetFiltros);
  };

  return (
    <Accordion defaultExpanded sx={{ mb: 2 }}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="filtros-content"
        id="filtros-header"
      >
        <FilterListIcon sx={{ mr: 1 }} />
        <Typography>Filtros</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              name="busqueda"
              label="Búsqueda"
              value={tempFiltros.busqueda || ''}
              onChange={handleChange}
              fullWidth
              placeholder="Buscar por nombre o descripción"
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="categoria-filter-label">Categoría</InputLabel>
              <Select
                labelId="categoria-filter-label"
                name="categoria"
                value={tempFiltros.categoria || ''}
                onChange={handleChange}
                label="Categoría"
              >
                <MenuItem value="">Todas</MenuItem>
                {categorias.map(cat => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControlLabel
              control={
                <Switch
                  checked={tempFiltros.soloActivos || false}
                  onChange={handleSwitchChange}
                  name="soloActivos"
                  color="primary"
                />
              }
              label="Solo productos activos"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              name="precioMinimo"
              label="Precio mínimo"
              type="number"
              value={tempFiltros.precioMinimo || ''}
              onChange={handleNumberChange}
              fullWidth
              size="small"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              name="precioMaximo"
              label="Precio máximo"
              type="number"
              value={tempFiltros.precioMaximo || ''}
              onChange={handleNumberChange}
              fullWidth
              size="small"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            onClick={handleResetFilters}
            color="inherit"
            sx={{ mr: 1 }}
          >
            Limpiar
          </Button>
          <Button 
            onClick={handleApplyFilters}
            variant="contained"
            color="primary"
          >
            Aplicar Filtros
          </Button>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default ProductosFiltros;
```

### Index Export File

```typescript
// src/components/Productos/index.ts
export { default as ProductosList } from './ProductosList';
export { default as ProductoForm } from './ProductoForm';
export { default as ProductoDetail } from './ProductoDetail';
export { default as ProductosFiltros } from './ProductosFiltros';
```

## 5. Creación de la Página

Ahora creamos la página principal del módulo que utiliza los componentes y el hook:

```tsx
// src/pages/Productos/Productos.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useProductos } from '../../hooks/useProductos';
import { useUserPermissions } from '../../hooks/useUserPermissions';
import {
  ProductosList,
  ProductoForm,
  ProductoDetail,
  ProductosFiltros
} from '../../components/Productos';
import { Producto } from '../../types/producto';
import { ModuleHeader, ReadOnlyBanner } from '../../components/ui';

const Productos: React.FC = () => {
  // Obtener permisos del usuario actual
  const userPermissions = useUserPermissions();
  const canEdit = userPermissions['productos']?.type === 'Edit';
  
  // Usar el hook personalizado
  const {
    productos,
    categorias,
    selectedProducto,
    loading,
    error,
    filtros,
    pagination,
    sortBy,
    sortDescending,
    loadProductos,
    loadProductoById,
    createProducto,
    updateProducto,
    deleteProducto,
    setSelectedProducto,
    updateFiltros,
    updateSort,
    changePage,
    changePageSize,
  } = useProductos();
  
  // Estados locales
  const [openForm, setOpenForm] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [productoToDelete, setProductoToDelete] = useState<Producto | null>(null);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    type: 'info'
  });
  
  // Cargar datos iniciales
  useEffect(() => {
    loadProductos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Abrir formulario para crear nuevo producto
  const handleAddNew = () => {
    setSelectedProducto(null);
    setOpenForm(true);
  };
  
  // Abrir formulario para editar producto
  const handleEdit = (producto: Producto) => {
    setSelectedProducto(producto);
    setOpenForm(true);
    if (openDetail) setOpenDetail(false);
  };
  
  // Abrir detalle de producto
  const handleView = (producto: Producto) => {
    setSelectedProducto(producto);
    setOpenDetail(true);
  };
  
  // Confirmar eliminación
  const handleConfirmDelete = (producto: Producto) => {
    setProductoToDelete(producto);
    setOpenDeleteConfirm(true);
  };
  
  // Eliminar producto
  const handleDelete = async () => {
    if (!productoToDelete) return;
    
    try {
      const success = await deleteProducto(productoToDelete.id);
      if (success) {
        setNotification({
          open: true,
          message: `Producto "${productoToDelete.nombre}" eliminado correctamente`,
          type: 'success'
        });
      } else {
        setNotification({
          open: true,
          message: 'Error al eliminar el producto',
          type: 'error'
        });
      }
    } catch (err) {
      setNotification({
        open: true,
        message: 'Error al eliminar el producto',
        type: 'error'
      });
    } finally {
      setOpenDeleteConfirm(false);
      setProductoToDelete(null);
    }
  };
  
  // Guardar producto (crear o actualizar)
  const handleSave = async (data: any) => {
    try {
      if (selectedProducto) {
        // Actualizar
        const updated = await updateProducto(selectedProducto.id, data);
        if (updated) {
          setNotification({
            open: true,
            message: `Producto "${updated.nombre}" actualizado correctamente`,
            type: 'success'
          });
          setOpenForm(false);
        }
      } else {
        // Crear nuevo
        const created = await createProducto(data);
        if (created) {
          setNotification({
            open: true,
            message: `Producto "${created.nombre}" creado correctamente`,
            type: 'success'
          });
          setOpenForm(false);
        }
      }
    } catch (err) {
      setNotification({
        open: true,
        message: 'Error al guardar el producto',
        type: 'error'
      });
    }
  };
  
  // Cambiar ordenamiento
  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      // Invertir dirección si ya está ordenado por este campo
      updateSort(field, !sortDescending);
    } else {
      // Nuevo campo, ordenar ascendente por defecto
      updateSort(field, false);
    }
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <ModuleHeader
        title="Productos"
        description="Administración de productos"
      />
      
      {!canEdit && <ReadOnlyBanner />}
      
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Catálogo de Productos</Typography>
        
        {canEdit && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddNew}
          >
            Nuevo Producto
          </Button>
        )}
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <ProductosFiltros
        filtros={filtros}
        categorias={categorias}
        onChange={updateFiltros}
      />
      
      <ProductosList
        productos={productos}
        loading={loading}
        page={pagination.page}
        pageSize={pagination.pageSize}
        totalCount={pagination.totalRecords}
        sortBy={sortBy}
        sortDirection={sortDescending ? 'desc' : 'asc'}
        onPageChange={changePage}
        onPageSizeChange={changePageSize}
        onSortChange={handleSortChange}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleConfirmDelete}
        canEdit={canEdit}
      />
      
      {/* Formulario */}
      <ProductoForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSave={handleSave}
        producto={selectedProducto}
        categorias={categorias}
        loading={loading}
      />
      
      {/* Detalle */}
      <ProductoDetail
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        producto={selectedProducto}
        onEdit={handleEdit}
        canEdit={canEdit}
      />
      
      {/* Confirmación de eliminación */}
      <Dialog
        open={openDeleteConfirm}
        onClose={() => setOpenDeleteConfirm(false)}
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Está seguro que desea eliminar el producto "{productoToDelete?.nombre}"?
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteConfirm(false)} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Notificaciones */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
      >
        <Alert
          severity={notification.type}
          sx={{ width: '100%' }}
          onClose={() => setNotification(prev => ({ ...prev, open: false }))}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Productos;
```

### Index Export File

```typescript
// src/pages/Productos/index.ts
export { default } from './Productos';
```

## 6. Registro de la Ruta

Añadir la ruta al componente AppLayout:

```tsx
// En src/components/common/AppLayout/AppLayout.tsx

// Importar el componente
import Productos from '../../../pages/Productos';

// Añadir la ruta dentro de <Routes>
<Route path="/productos" element={
  <ProtectedRoute moduleCode="productos">
    <Productos />
  </ProtectedRoute>
} />
```

## 7. Configuración de Permisos

Para que el módulo sea accesible, debe estar registrado en la base de datos del backend con la siguiente información:

```json
{
  "id": 10, // Un ID único
  "name": "Productos",
  "code": "productos", 
  "path": "/productos",
  "icon": "Inventory2Icon", 
  "isActive": true,
  "order": 5 // Posición en el menú
}
```

Además, se debe asignar el permiso adecuado a los roles de usuario que deberían tener acceso al módulo:

- **Administrador**: Permisos de escritura/edición (tipo "Edit")
- **Usuario estándar**: Permisos de solo lectura (tipo "ReadOnly")

---

Este ejemplo ilustra un flujo completo de desarrollo de un nuevo módulo, siguiendo las mejores prácticas y la arquitectura del proyecto.
