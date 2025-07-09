# Solicitud de Implementación: Endpoints de Reset de Contraseña

## Contexto
Hemos implementado completamente la funcionalidad de reset de contraseña en el frontend React. Necesitamos que el backend (.NET Core API) implemente los endpoints correspondientes para completar el flujo.

## Endpoints Requeridos

### 1. Solicitar Reset de Contraseña
**Endpoint:** `POST /api/Users/forgot-password`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (Éxito):**
```json
{
  "success": true,
  "message": "Password reset instructions have been sent to your email",
  "data": {
    "message": "Reset instructions sent"
  }
}
```

**Response (Error - Usuario no encontrado):**
```json
{
  "success": false,
  "message": "No account found with this email address",
  "data": null
}
```

**Response (Error - Email inválido):**
```json
{
  "success": false,
  "message": "Please provide a valid email address",
  "data": null
}
```

### 2. Reset de Contraseña
**Endpoint:** `POST /api/Users/reset-password`

**Request Body:**
```json
{
  "token": "abc123def456...",
  "email": "user@example.com",
  "newPassword": "newSecurePassword123"
}
```

**Response (Éxito):**
```json
{
  "success": true,
  "message": "Password has been reset successfully",
  "data": {
    "message": "Password reset successfully"
  }
}
```

**Response (Error - Token inválido/expirado):**
```json
{
  "success": false,
  "message": "Invalid or expired reset token",
  "data": null
}
```

**Response (Error - Usuario no encontrado):**
```json
{
  "success": false,
  "message": "No account found with this email address",
  "data": null
}
```

**Response (Error - Contraseña débil):**
```json
{
  "success": false,
  "message": "Password must be at least 8 characters long and contain letters and numbers",
  "data": null
}
```

## DTOs Sugeridos

```csharp
// Request DTOs
public class ForgotPasswordDto
{
    public string Email { get; set; }
}

public class ResetPasswordDto
{
    public string Token { get; set; }
    public string Email { get; set; }
    public string NewPassword { get; set; }
}

// Response DTOs (pueden usar DTOs existentes)
public class MessageResponseDto
{
    public string Message { get; set; }
}
```

## Funcionalidad Esperada

### Para `/forgot-password`:
1. **Validar email:** Verificar formato válido
2. **Buscar usuario:** Confirmar que existe una cuenta con ese email
3. **Generar token:** Crear token seguro y único (GUID + timestamp)
4. **Guardar token:** Almacenar en BD con expiración (ej: 1 hora)
5. **Enviar email:** Enviar email con enlace que incluya el token
6. **Responder:** Confirmar envío (sin revelar si el email existe por seguridad)

### Para `/reset-password`:
1. **Validar token:** Verificar que existe y no ha expirado
2. **Validar email:** Confirmar que coincide con el token
3. **Validar contraseña:** Verificar políticas de seguridad
4. **Actualizar contraseña:** Hash y guardar nueva contraseña
5. **Invalidar token:** Marcar token como usado
6. **Responder:** Confirmar éxito del reset

## Consideraciones de Seguridad

### Tokens de Reset:
- **Generación:** Usar GUID seguro + timestamp
- **Expiración:** 1 hora máximo
- **Un solo uso:** Invalidar después del primer uso
- **Almacenamiento:** Hash en base de datos

### Rate Limiting:
- **Forgot password:** Máximo 3 intentos por email por hora
- **Reset password:** Máximo 5 intentos por token

### Validaciones:
- **Email:** Formato válido y existente en BD
- **Contraseña:** Mínimo 8 caracteres, letras y números
- **Token:** Válido, no expirado, no usado

## Configuración de Email

### Template de Email:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Reset Your Password</title>
</head>
<body>
    <h2>Password Reset Request</h2>
    <p>Hello,</p>
    <p>You requested to reset your password. Click the link below to reset it:</p>
    <p><a href="{{FRONTEND_URL}}/forgot-password?token={{TOKEN}}&email={{EMAIL}}">Reset Password</a></p>
    <p>This link will expire in 1 hour.</p>
    <p>If you didn't request this, please ignore this email.</p>
</body>
</html>
```

### Variables de Configuración:
- `FRONTEND_URL`: URL del frontend (ej: `http://localhost:3000`)
- `SMTP_SERVER`: Servidor de email
- `FROM_EMAIL`: Email remitente

## Estructura de BD Sugerida

### Tabla: `PasswordResetTokens`
```sql
CREATE TABLE PasswordResetTokens (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    Token NVARCHAR(255) NOT NULL,
    Email NVARCHAR(255) NOT NULL,
    CreatedAt DATETIME2 NOT NULL,
    ExpiresAt DATETIME2 NOT NULL,
    IsUsed BIT NOT NULL DEFAULT 0,
    UsedAt DATETIME2 NULL,
    FOREIGN KEY (UserId) REFERENCES Users(Id)
);
```

## Flujo Completo

### Flujo de Usuario:
1. Usuario hace click en "Forgot Password" en el login
2. Introduce su email y hace click en "Send Reset Instructions"
3. Frontend llama `POST /api/Users/forgot-password`
4. Backend envía email con token
5. Usuario recibe email y hace click en el enlace
6. Frontend abre página con token pre-rellenado
7. Usuario introduce nueva contraseña
8. Frontend llama `POST /api/Users/reset-password`
9. Backend actualiza contraseña
10. Usuario ve confirmación y puede hacer login

### Integración Frontend:
El frontend ya está preparado para consumir estos endpoints. Los archivos relevantes son:
- `src/services/authApiService.ts`: Contiene las funciones `forgotPassword()` y `resetPassword()`
- `src/pages/ForgotPassword/ForgotPassword.tsx`: Interfaz completa del flujo
- `src/pages/Login/Login.tsx`: Enlace para iniciar el flujo

## Testing

### Casos de Prueba:
1. **Email válido existente:** Debe enviar email y responder éxito
2. **Email válido inexistente:** Debe responder éxito (por seguridad)
3. **Email inválido:** Debe responder error de formato
4. **Token válido:** Debe permitir reset de contraseña
5. **Token inválido:** Debe responder error
6. **Token expirado:** Debe responder error
7. **Contraseña débil:** Debe responder error de validación
8. **Rate limiting:** Debe bloquear exceso de requests

### Endpoints de Testing (Opcional):
```
GET /api/Users/debug/reset-tokens/{email} (solo en desarrollo)
DELETE /api/Users/debug/reset-tokens/{email} (solo en desarrollo)
```

## Prioridad

**Alta prioridad:** Esta funcionalidad es esencial para la experiencia del usuario y está completamente implementada en el frontend esperando estos endpoints.

¿Necesitas alguna aclaración adicional sobre algún aspecto específico de la implementación?
