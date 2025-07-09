# 🔍 Guía de Debugging - Reset Password API

## Problema Detectado
Los emails de reset password no llegan cuando se envían desde el frontend, pero funcionan correctamente desde el backend con curl.

## Cambios Realizados

### 1. ✅ Logs Detallados Agregados
- En `ForgotPassword.tsx`: Logs detallados del proceso completo
- En `apiClient.ts`: Logs mejorados de requests y responses
- Información completa de errores de red

### 2. ✅ Tipos TypeScript Corregidos
- `ForgotPasswordDto.email`: Cambiado de `string | null` a `string`
- `ResetPasswordDto`: Todos los campos ahora son `string` (no nullable)
- `LoginDto`: Campos actualizados a `string`

### 3. ✅ Validación de Datos
- Email se limpia con `.trim()` antes de enviar
- Validación explícita de datos antes del envío

### 4. ✅ Herramientas de Testing
- Botones de debug en la UI
- Script `test-api.js` para pruebas manuales

## 📋 Pasos para Debuggear

### Paso 1: Verificar Logs en Consola
1. Abre el navegador en `http://localhost:3000/forgot-password`
2. Abre DevTools (F12) y ve a la pestaña Console
3. Intenta enviar un reset password
4. Revisa los logs que aparecen (deberían empezar con 🔄, 📧, 🚀, etc.)

### Paso 2: Usar Botones de Debug
En la parte inferior de la página de forgot-password verás botones de "Test with Fetch" y "Test with Axios". Haz clic en ambos y revisa los logs.

### Paso 3: Ejecutar Script de Testing
1. En DevTools Console, ejecuta: `testAPI.runAllTests()`
2. O prueba individualmente:
   ```javascript
   testAPI.testConnectivity()
   testAPI.testForgotPasswordFetch('erdnando@gmail.com')
   testAPI.testCurlEquivalent('erdnando@gmail.com')
   ```

### Paso 4: Comparar con cURL
Tu comando curl que funciona:
```bash
curl -X POST http://localhost:5000/api/Users/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "erdnando@gmail.com"}'
```

## 🔍 Qué Buscar en los Logs

### ✅ Request Exitoso
```
🔄 Iniciando solicitud de reset password...
📧 Email: erdnando@gmail.com
🚀 API POST: http://localhost:5000/api/Users/forgot-password {"email":"erdnando@gmail.com"}
✅ API POST Response Status: 200
✅ API POST Response Data: {success: true, message: "..."}
```

### ❌ Posibles Problemas

1. **Error de CORS**
   ```
   💥 API POST Error Details:
   🌐 Network Error: Failed to fetch
   ```

2. **Error 404 - Endpoint no encontrado**
   ```
   🔢 Status: 404
   📝 Status Text: Not Found
   ```

3. **Error 500 - Error del servidor**
   ```
   🔢 Status: 500
   📄 Response Data: {error: "..."}
   ```

4. **Error de formato de datos**
   ```
   🔢 Status: 400
   📄 Response Data: {message: "Invalid email format"}
   ```

## 🛠️ Posibles Soluciones

### Si hay Error de CORS:
- Verificar que el backend tenga CORS configurado para `http://localhost:3000`
- Asegurar que el backend esté corriendo en `http://localhost:5000`

### Si hay Error 404:
- Verificar que la ruta del API sea exactamente `/api/Users/forgot-password`
- Verificar que el backend esté corriendo

### Si hay Error 400:
- Verificar el formato del JSON que se envía
- Comparar con el curl que funciona

### Si hay Error 500:
- Revisar logs del backend
- Verificar configuración de email en el backend

## 📞 Próximos Pasos
Ejecuta los pasos de debugging y comparte los logs de la consola para identificar exactamente qué está fallando.
