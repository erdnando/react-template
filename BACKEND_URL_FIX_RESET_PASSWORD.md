# 🔧 Corrección de URLs en Reset Password - Backend

## ❌ **Problema Identificado**

El backend está generando URLs que apuntan al puerto 5096 (backend) en lugar del puerto 3000 (frontend):

```
❌ URL Incorrecta: http://localhost:5096/reset-password?token=9c50c56f36b7...
✅ URL Correcta:   http://localhost:3000/reset-password?token=9c50c56f36b7...
```

## 🛠️ **Solución Backend (.NET Core)**

### 1. **Agregar Configuración en appsettings.json**

```json
{
  "AppSettings": {
    "FrontendBaseUrl": "http://localhost:3000"
  }
}
```

### 2. **Modificar el Servicio de Email**

En el servicio que genera el email de reset password:

```csharp
// En EmailService.cs o similar
public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    
    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }
    
    public async Task SendPasswordResetEmailAsync(string email, string token)
    {
        // ✅ Usar FrontendBaseUrl en lugar de la URL del backend
        var frontendBaseUrl = _configuration["AppSettings:FrontendBaseUrl"];
        var resetUrl = $"{frontendBaseUrl}/reset-password?token={token}";
        
        var subject = "Recuperación de Contraseña";
        var body = $@"
            <h2>Recuperación de Contraseña</h2>
            <p>Hola,</p>
            <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.</p>
            <p>Para continuar con el proceso, haz clic en el siguiente enlace:</p>
            <a href='{resetUrl}' style='background-color: #4CAF50; color: white; padding: 14px 20px; text-decoration: none; display: inline-block; border-radius: 4px;'>
                Restablecer Contraseña
            </a>
            <p>Este enlace expirará en 30 minutos.</p>
            <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
            <p>Saludos,<br>El Equipo de Soporte</p>
        ";
        
        await SendEmailAsync(email, subject, body);
    }
}
```

### 3. **Alternativa: Variable de Entorno**

Si prefieres usar variables de entorno:

```bash
# En el archivo .env del backend o en Docker
FRONTEND_BASE_URL=http://localhost:3000
```

```csharp
// En el código
var frontendBaseUrl = Environment.GetEnvironmentVariable("FRONTEND_BASE_URL") 
                     ?? "http://localhost:3000";
var resetUrl = $"{frontendBaseUrl}/reset-password?token={token}";
```

### 4. **Configuración para Diferentes Entornos**

```json
// appsettings.Development.json
{
  "AppSettings": {
    "FrontendBaseUrl": "http://localhost:3000"
  }
}

// appsettings.Production.json
{
  "AppSettings": {
    "FrontendBaseUrl": "https://tu-dominio-frontend.com"
  }
}
```

## 🔍 **Localizar el Código a Modificar**

Busca en el backend por:

1. **Generación de URLs de reset**:
   ```csharp
   // Buscar algo similar a:
   var resetUrl = $"http://localhost:5096/reset-password?token={token}";
   ```

2. **Servicio de Email**:
   - `EmailService.cs`
   - `NotificationService.cs`
   - Método que contiene `SendPasswordResetEmailAsync` o similar

3. **Controller de Users**:
   - Método `ForgotPassword` en `UsersController.cs`

## ✅ **Resultado Esperado**

Después de la corrección, el email debería contener:

```html
<a href="http://localhost:3000/reset-password?token=9c50c56f36b7ac87b53b3b4582dce53ef1454ed99be4e641f95a9f56d4681462">
   Restablecer Contraseña
</a>
```

## 🚀 **Testing**

1. **Desarrollo**: `http://localhost:3000/reset-password?token=...`
2. **Producción**: `https://tu-dominio.com/reset-password?token=...`

## 📋 **Checklist de Implementación**

- [ ] ✅ Agregar `FrontendBaseUrl` en configuración
- [ ] ✅ Modificar servicio de email para usar frontend URL
- [ ] ✅ Probar en desarrollo (localhost:3000)
- [ ] ✅ Configurar para producción
- [ ] ✅ Verificar que el link del email funciona correctamente

---

**Nota**: Esta corrección es **crítica** para el funcionamiento del reset password, ya que los usuarios necesitan ser redirigidos al frontend, no al backend.
