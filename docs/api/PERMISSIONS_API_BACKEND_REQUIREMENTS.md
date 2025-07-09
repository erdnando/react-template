# Permissions API Backend Requirements

## Endpoint: Get User Module Permissions Map

- **Route:** `GET /Permissions/users/{userId}/modules`
- **Purpose:** Returns a map of all modules and their permission type for a given user.

## Required Response Format

- The response must be a JSON object where:
  - The `data` property is an object (map) with **module codes** as keys (e.g., `"home"`, `"tasks"`, `"users"`), not module IDs.
  - The values are the permission type as an integer (see below).

### Example Response
```json
{
  "success": true,
  "message": "Module permissions retrieved successfully",
  "data": {
    "home": 10,
    "tasks": 20,
    "users": 0
  },
  "errors": null
}
```

- **Keys:** Must be the module code string (case-insensitive, e.g., `"home"`, `"tasks"`).
- **Values:** Must be the permission type integer (see enum below).

## PermissionType Enum
- `0` = None
- `10` = Read
- `20` = Write


## Why This Is Required
- The frontend matches sidebar/menu items and route protection using the module code as the key.
- If the backend returns module IDs as keys, the frontend cannot match permissions to modules, and the menu will be empty.

## Summary Table
| Key (module code) | Value (permission type) |
|-------------------|------------------------|
| "home"            | 10                     |
| "tasks"           | 20                     |
| "users"           | 0                      |

## Do NOT Return
- Do **not** return module IDs as keys (e.g., `"1": 10`).
- Do **not** return an array of permissions for this endpoint.

## Acceptance Criteria
- The `data` object must use module codes as keys.
- The values must be permission type integers.
- The response must match the example above for the user's actual permissions.

---

**If you have questions, contact the frontend team.**
