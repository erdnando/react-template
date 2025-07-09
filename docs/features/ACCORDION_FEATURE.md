# Implementación de Acordeón para Grupos de Roles

## Funcionalidad Implementada
Se ha agregado funcionalidad de acordeón a los grupos de roles en la sección "User Permissions", permitiendo que cada grupo se pueda expandir y contraer independientemente.

## Cambios Realizados

### 1. Importaciones agregadas
```tsx
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
```

### 2. Estado para controlar expansión
```tsx
// Estado para controlar qué grupos de roles están expandidos
const [expandedRoles, setExpandedRoles] = useState<Record<string, boolean>>({});
```

### 3. Inicialización automática
```tsx
// Inicializar grupos expandidos por defecto
React.useEffect(() => {
  const initialExpanded: Record<string, boolean> = {};
  roles.forEach(role => {
    initialExpanded[role.name] = true; // Todos expandidos por defecto
  });
  setExpandedRoles(initialExpanded);
}, [roles]);
```

### 4. Función para alternar expansión
```tsx
// Función para alternar la expansión de grupos de roles
const toggleRoleExpansion = (roleName: string) => {
  setExpandedRoles(prev => ({
    ...prev,
    [roleName]: !prev[roleName]
  }));
};
```

### 5. Interfaz mejorada
- **Header clickeable**: Cada grupo tiene un header con el nombre del rol y cantidad de usuarios
- **Indicador visual**: Iconos ExpandMore/ExpandLess que cambian según el estado
- **Contador de usuarios**: Muestra el número de usuarios en cada rol (ej: "Administrador (2)")
- **Hover effects**: El header cambia de color al pasar el mouse
- **Transiciones suaves**: Animaciones CSS para una mejor experiencia

## Características de UX

### Estado por defecto
- Todos los grupos inician expandidos para máxima visibilidad
- Los usuarios pueden contraer grupos que no les interesen

### Interacción
- **Click en header**: Expande/contrae el grupo completo
- **Persistencia**: Cada grupo mantiene su estado independiente
- **Visual feedback**: Iconos claros indican si está expandido (▲) o contraído (▼)

### Diseño responsivo
- Mantiene la funcionalidad en dispositivos móviles
- El layout se adapta según el espacio disponible

## Pruebas
Se agregó un test específico que verifica:
- ✅ Los grupos muestran el contador de usuarios
- ✅ Los usuarios son visibles cuando está expandido
- ✅ Al hacer click en el header, los usuarios se ocultan/muestran
- ✅ Los grupos operan independientemente

## Beneficios
1. **Mejor organización**: Los usuarios pueden enfocarse en roles específicos
2. **Menos scroll**: Especialmente útil cuando hay muchos usuarios
3. **Navegación intuitiva**: Patrón de acordeón familiar para los usuarios
4. **Performance**: Solo renderiza usuarios visibles cuando está expandido
5. **Escalabilidad**: Funciona bien con cualquier número de roles y usuarios

La implementación mantiene toda la funcionalidad existente (editar, eliminar usuarios, etc.) mientras añade esta mejora de UX sin afectar el rendimiento.
