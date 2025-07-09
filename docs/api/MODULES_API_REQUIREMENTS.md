# API de Módulos del Sistema

Este documento describe los requisitos para la API RESTful que gestiona los módulos del sistema (los mismos que aparecen en el menú lateral y en el módulo de permisos).

## Objetivo
Centralizar la definición, orden y atributos de los módulos en el backend, permitiendo que el frontend consuma la lista y la utilice tanto para el menú lateral como para el módulo de permisos. Así se garantiza una única fuente de verdad y consistencia en toda la aplicación.

---

## Módulos precargados sugeridos
Se recomienda que el backend inicie con los siguientes módulos precargados, que reflejan el menú actual del sistema y su orden:

```json
[
  { "name": "Home", "path": "/", "icon": "HomeIcon", "adminOnly": false, "order": 1 },
  { "name": "Tasks", "path": "/tasks", "icon": "AssignmentIcon", "adminOnly": false, "order": 2 },
  { "name": "Users", "path": "/users", "icon": "PeopleIcon", "adminOnly": false, "order": 3 },
  { "name": "Roles", "path": "/roles", "icon": "SecurityIcon", "adminOnly": false, "order": 4 },
  { "name": "Catalogs", "path": "/catalogs", "icon": "CategoryIcon", "adminOnly": false, "order": 5 },
  { "name": "Permisos", "path": "/permissions", "icon": "AssignmentIcon", "adminOnly": false, "order": 6 },
  { "name": "Admin Utilities", "path": "/admin/utils", "icon": "SecurityIcon", "adminOnly": true, "order": 7 }
]
```

---

## Endpoints CRUD

### 1. Obtener todos los módulos (GET)
- **Ruta:** `GET /api/modules`
- **Descripción:** Devuelve la lista de módulos del sistema, ordenados según el campo `order`.
- **Respuesta ejemplo:**
```json
[
  {
    "id": 1,
    "name": "Home",
    "path": "/",
    "icon": "HomeIcon",
    "adminOnly": false,
    "order": 1
  },
  ...
]
```

### 2. Crear un módulo (POST)
- **Ruta:** `POST /api/modules`
- **Body:**
```json
{
  "name": "string",
  "path": "string",
  "icon": "string",
  "adminOnly": false,
  "order": 99
}
```
- **Respuesta:** Módulo creado.

### 3. Actualizar un módulo (PUT)
- **Ruta:** `PUT /api/modules/:id`
- **Body:**
```json
{
  "name": "string",
  "path": "string",
  "icon": "string",
  "adminOnly": false,
  "order": 99
}
```
- **Respuesta:** Módulo actualizado.

### 4. Eliminar un módulo (DELETE)
- **Ruta:** `DELETE /api/modules/:id`
- **Respuesta:** Módulo eliminado.

---

## Consideraciones
- El frontend solo necesita consumir `GET /api/modules` para construir el menú lateral y el listado de módulos en el módulo de permisos.
- El orden de los módulos debe respetar el campo `order`.
- Los iconos pueden mapearse por nombre en el frontend.
- El backend es la única fuente de verdad para los módulos.

---

**Autor:** GitHub Copilot
**Fecha:** 2025-07-05
