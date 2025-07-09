# Corrección del Diálogo de Confirmación de Eliminación de Usuario

## Problema Identificado
El diálogo de confirmación para eliminar usuarios no aparecía cuando se hacía clic en el ícono de eliminar.

## Causa Raíz
1. **Función duplicada**: Existían dos definiciones de `handleDeleteUser` en el componente:
   - Una versión correcta que usaba React Dialog (líneas ~172-176)
   - Una versión legacy que usaba `window.confirm` (líneas ~274-279)

2. **Posición incorrecta del JSX**: El diálogo de confirmación estaba definido fuera del JSX del componente, por lo que nunca se renderizaba.

## Solución Implementada

### 1. Eliminación de función duplicada
- Removí la función `handleDeleteUser` legacy que usaba `window.confirm`
- Mantuve únicamente la versión que usa React Dialog

### 2. Corrección del onClick del botón eliminar
```tsx
// Antes:
onClick={() => { if (typeof handleDeleteUser === 'function') handleDeleteUser(fullUser.id); }}

// Después:
onClick={() => handleDeleteUser(fullUser.id)}
```

### 3. Reubicación del diálogo en el JSX
Moví el diálogo de confirmación desde su posición incorrecta (fuera del JSX) a su posición correcta dentro del return del componente, justo antes del Snackbar:

```tsx
{/* Diálogo de confirmación para eliminar usuario */}
<Dialog open={deleteDialogOpen} onClose={cancelDeleteUser}>
  <DialogTitle>Eliminar usuario</DialogTitle>
  <DialogContent>
    <Typography>¿Estás seguro de que deseas eliminar al usuario <b>{userToDelete?.name}</b> ({userToDelete?.email})?</Typography>
    <Typography color="error" sx={{ mt: 1 }}>
      Esta acción es permanente y no se puede deshacer.
    </Typography>
  </DialogContent>
  <DialogActions>
    <Button onClick={cancelDeleteUser} color="primary">Cancelar</Button>
    <Button onClick={confirmDeleteUser} color="error" variant="contained">Eliminar</Button>
  </DialogActions>
</Dialog>
```

## Verificación
- ✅ Aplicación compila sin errores
- ✅ Test unitario específico para el diálogo pasa exitosamente
- ✅ El diálogo de confirmación ahora aparece correctamente cuando se hace clic en eliminar usuario

## Estado Final
El diálogo de confirmación de eliminación de usuario ahora funciona correctamente:
1. Se muestra cuando se hace clic en el ícono de eliminar
2. Muestra el nombre y email del usuario a eliminar
3. Permite cancelar o confirmar la eliminación
4. Al confirmar, elimina al usuario y actualiza la UI
5. Al cancelar, cierra el diálogo sin realizar cambios
