# Definición de requerimiento: Enforced Module Permissions (Permisos de Módulos Respetados)

## Objetivo
Asegurar que los permisos configurados en el módulo de permisos del sistema sean respetados y aplicados tanto en el frontend como en el backend. Un usuario solo podrá acceder a los módulos y funcionalidades para los que tenga permisos explícitos. Si, por ejemplo, solo tiene permiso para el módulo "home", solo podrá ver y acceder a ese módulo.

---

## Requerimientos para el Backend

### 1. Fuente de verdad
- El backend debe ser la única fuente de verdad para los permisos de cada usuario.
- El frontend solo debe consumir y mostrar la información de permisos, pero nunca confiar en ella para la seguridad real.

### 2. Validación de permisos en endpoints
- Cada endpoint del backend debe validar los permisos del usuario autenticado antes de responder o ejecutar cualquier acción.
- Si el usuario no tiene permiso para el módulo/funcionalidad solicitada, el backend debe responder con un error 403 Forbidden o equivalente.
- No se debe enviar información ni permitir acciones sobre módulos a los que el usuario no tiene acceso, aunque el frontend lo solicite.

### 3. Ejemplo de flujo seguro
1. El usuario inicia sesión y el backend devuelve un token de autenticación (JWT, sesión, etc.).
2. El frontend solicita los permisos del usuario al backend y los usa para mostrar/ocultar módulos y acciones.
3. Cuando el usuario intenta acceder a un módulo o realizar una acción:
   - El frontend verifica los permisos y, si no tiene, no muestra la opción.
   - Si el usuario manipula el frontend y fuerza la petición, el backend valida el token y los permisos antes de responder.
   - Si no tiene permiso, el backend responde con 403 y el frontend muestra un mensaje de acceso denegado.

### 4. Consideraciones adicionales
- Los permisos deben ser consultados y validados en cada petición relevante, no solo al inicio de sesión.
- Si los permisos cambian, el backend debe invalidar la sesión o forzar la recarga de permisos en el frontend.
- Se recomienda auditar y registrar los intentos de acceso no autorizado.

### 5. Ejemplo de estructura de permisos
la estructura de permisos esta definida en la tabla de base de datos UserPermissions

---

## Resumen
- El backend debe validar y hacer cumplir los permisos de módulos en cada endpoint.
- El frontend solo debe usarlos para la experiencia de usuario, nunca para la seguridad real.
- Cualquier intento de acceso a módulos no permitidos debe ser bloqueado y registrado.

---

**Este documento debe ser seguido por el equipo de backend para garantizar la seguridad y el cumplimiento de los permisos definidos en el sistema.**
