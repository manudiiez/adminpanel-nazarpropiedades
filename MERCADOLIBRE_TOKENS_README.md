# Sistema de Tokens de MercadoLibre

Este sistema maneja la autenticación OAuth2 con MercadoLibre, incluyendo el manejo automático de renovación de tokens usando refresh tokens.

## Características

- **Autenticación OAuth2**: Manejo completo del flujo de autorización
- **Renovación automática**: Los tokens se renuevan automáticamente antes de expirar
- **Múltiples cuentas**: Soporte para múltiples cuentas de MercadoLibre
- **Persistencia**: Tokens almacenados en base de datos
- **Seguridad**: Tokens sensibles no se exponen en las respuestas de API

## Estructura de la Base de Datos

### Colección: `mercadolibre-tokens`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `accountName` | string | Nombre identificativo de la cuenta |
| `accessToken` | string | Token de acceso actual (expira en 6 horas) |
| `refreshToken` | string | Token para renovar el access token (uso único) |
| `tokenType` | string | Tipo de token (normalmente "Bearer") |
| `expiresIn` | number | Tiempo de vida en segundos (21600 = 6 horas) |
| `expiresAt` | date | Fecha exacta de expiración |
| `scope` | string | Permisos otorgados |
| `userId` | string | ID del usuario en MercadoLibre |
| `isActive` | boolean | Si el token está activo |
| `lastUsed` | date | Última vez que se usó |
| `errorCount` | number | Contador de errores |
| `lastError` | string | Último error ocurrido |

## Endpoints API

### 1. Iniciar Autenticación
```
GET /api/meli/auth
```
Redirige al usuario a la página de autorización de MercadoLibre.

### 2. Completar Autenticación
```
POST /api/meli/auth
```
**Body:**
```json
{
  "code": "authorization_code_from_mercadolibre",
  "accountName": "nombre_identificativo"
}
```

**Respuesta:**
```json
{
  "mensaje": "Token guardado exitosamente",
  "tokenId": "token_id",
  "expiresAt": "2025-10-04T18:41:00.000Z",
  "accountName": "nombre_identificativo"
}
```

### 3. Renovar Token
```
POST /api/meli/refresh
```
**Body:**
```json
{
  "accountName": "nombre_identificativo"
  // O usar tokenId directamente:
  // "tokenId": "specific_token_id"
}
```

**Respuesta:**
```json
{
  "accessToken": "new_access_token",
  "tokenType": "Bearer",
  "expiresAt": "2025-10-04T18:41:00.000Z",
  "tokenId": "new_token_id",
  "isValid": true,
  "message": "Token renovado exitosamente"
}
```

### 4. Listar Tokens Activos
```
GET /api/meli/tokens
```

**Respuesta:**
```json
{
  "tokens": [
    {
      "id": "token_id",
      "accountName": "cuenta_principal",
      "tokenType": "Bearer",
      "expiresAt": "2025-10-04T18:41:00.000Z",
      "isActive": true,
      "lastUsed": "2025-10-04T12:30:00.000Z"
    }
  ],
  "count": 1
}
```

## Uso en el Código

### Función Utilitaria Principal

```typescript
import { getValidMercadoLibreToken } from '@/utils/mercadoLibreTokens'

// Obtener token válido (renueva automáticamente si es necesario)
const tokenInfo = await getValidMercadoLibreToken('nombre_cuenta')

// Usar el token en requests a MercadoLibre
const response = await fetch('https://api.mercadolibre.com/items', {
  method: 'POST',
  headers: {
    'Authorization': `${tokenInfo.tokenType} ${tokenInfo.accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(itemData),
})
```

### Ejemplo de Publicación

Ver `/api/meli/publish/route.ts` para un ejemplo completo de cómo publicar una propiedad en MercadoLibre usando el sistema de tokens.

## Flujo de Trabajo

1. **Primera vez:**
   - Usuario visita `/api/meli/auth` (GET)
   - Se redirige a MercadoLibre para autorización
   - MercadoLibre redirige de vuelta con código
   - Frontend envía código a `/api/meli/auth` (POST)
   - Sistema guarda tokens en base de datos

2. **Uso normal:**
   - Código llama `getValidMercadoLibreToken(accountName)`
   - Si token es válido, se retorna directamente
   - Si token expiró, se renueva automáticamente
   - Se retorna token válido listo para usar

3. **Manejo de errores:**
   - Si refresh token falla, se marca cuenta como inactiva
   - Se requiere nueva autorización manual

## Variables de Entorno Requeridas

```env
MERCADOLIBRE_CLIENT_ID=tu_client_id
MERCADOLIBRE_CLIENT_SECRET=tu_client_secret
MERCADOLIBRE_REDIRECT_URI=https://tudominio.com/callback
```

## Seguridad

- Los tokens de acceso y refresh nunca se exponen en respuestas API públicas
- Solo se almacenan en base de datos con acceso restringido
- Los tokens inactivos se marcan automáticamente
- Se lleva registro de errores para auditoría

## Múltiples Cuentas

El sistema permite manejar múltiples cuentas de MercadoLibre:
- Cada cuenta tiene un `accountName` único
- Se puede especificar qué cuenta usar en cada operación
- Si no se especifica, se usa la más reciente

## Monitoreo

- Campo `lastUsed` para ver actividad
- Campo `errorCount` para detectar problemas
- Campo `lastError` para debugging
- Logs en consola para operaciones importantes
