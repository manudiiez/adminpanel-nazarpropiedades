# Sistema de Integración con MercadoLibre

Este documento describe la implementación del sistema de integración con MercadoLibre para la publicación automatizada de propiedades inmobiliarias.

## Arquitectura del Sistema

### 1. Componentes Principales

#### 1.1 Colección de Tokens (`MercadoLibreTokens`)
- **Ubicación**: `src/collections/MercadoLibreTokens.ts`
- **Propósito**: Almacenar token de acceso OAuth2 de MercadoLibre
- **Campos principales**:
  - `accountName`: Siempre "default" (cuenta única)
  - `accessToken`: Token de acceso actual
  - `refreshToken`: Token para renovar el acceso
  - `tokenType`: Tipo de token (Bearer)
  - `expiresAt`: Fecha de expiración
  - `scope`: Permisos del token
  - `isActive`: Solo un token activo a la vez

#### 1.2 Mapper de MercadoLibre (`mercadolibreMapper.ts`)
- **Ubicación**: `src/utils/mercadolibreMapper.ts`
- **Propósito**: Convertir datos internos al formato requerido por la API de MercadoLibre
- **Funciones principales**:
  - `mapFormDataToMercadoLibre()`: Convierte PropertyData a formato MercadoLibre
  - `validateMercadoLibreData()`: Valida datos antes del envío
  - `debugMercadoLibreMapping()`: Función de debug

#### 1.3 Mappings de MercadoLibre (`mercadolibreMappings.ts`)
- **Ubicación**: `src/data/mercadolibreMappings.ts`
- **Propósito**: Definir mapeos de valores internos a valores de MercadoLibre
- **Incluye**:
  - Tipos de propiedad con IDs de categoría de MercadoLibre
  - Estados de conservación
  - Monedas, antigüedad, amenities, etc.

#### 1.4 Utilidades de Tokens (`mercadoLibreTokens.ts`)
- **Ubicación**: `src/utils/mercadoLibreTokens.ts`
- **Propósito**: Gestión automática de token OAuth2 único
- **Funciones**:
  - `getValidMercadoLibreToken()`: Obtiene el token activo (renueva si es necesario)
  - Manejo automático de refresh token

### 2. Endpoints de API

#### 2.1 Autenticación OAuth2
- **GET** `/api/meli/auth`: Inicia flujo OAuth2
- **POST** `/api/meli/auth`: Procesa código de autorización (no requiere accountName)
- **POST** `/api/meli/refresh`: Renueva token expirado

#### 2.2 Gestión de Propiedades
- **POST** `/api/meli/publish`: Endpoint principal para operaciones CRUD (no requiere accountName)
  - `action: 'publishToMercadoLibre'`: Publica nueva propiedad
  - `action: 'syncToMercadoLibre'`: Sincroniza propiedad existente
  - `action: 'deleteFromMercadoLibre'`: Elimina/pausa propiedad

#### 2.3 Información de Tokens
- **GET** `/api/meli/tokens`: Lista token activo y su estado

### 3. Componente Frontend

#### 3.1 MercadoLibrePortal
- **Ubicación**: `src/components/portals/mercadolibre/MercadoLibrePortal.tsx`
- **Propósito**: Interfaz de usuario para gestión de propiedades en MercadoLibre
- **Funcionalidades**:
  - Publicar nuevas propiedades
  - Sincronizar propiedades existentes
  - Eliminar propiedades
  - Mostrar estado y errores

## Flujo de Trabajo

### 1. Configuración Inicial

1. **Configurar credenciales**:
   ```env
   MERCADOLIBRE_CLIENT_ID=tu_client_id
   MERCADOLIBRE_CLIENT_SECRET=tu_client_secret
   MERCADOLIBRE_REDIRECT_URI=http://localhost:3000/api/meli/auth/callback
   ```

2. **Autorización inicial**:
   - Acceder a `/api/meli/auth`
   - Autorizar aplicación en MercadoLibre
   - Los tokens se guardan automáticamente con nombre de cuenta "default"
   - Solo se mantiene un token activo a la vez

### 2. Publicación de Propiedades

1. **Mapeo de datos**: Los datos de la propiedad se mapean usando `mercadolibreMapper.ts`
2. **Validación**: Se validan los datos requeridos por MercadoLibre
3. **Obtención de token**: Se obtiene el token activo automáticamente
4. **Publicación**: Se envía a la API de MercadoLibre
5. **Actualización**: Se actualiza el estado en la base de datos

### 3. Gestión de Tokens

- **Un solo token**: Solo se mantiene un token activo para la cuenta única de MercadoLibre
- **Renovación automática**: El token se renueva automáticamente antes de expirar
- **Manejo de errores**: Detección y manejo de tokens inválidos

## Estructura de Datos

### Formato de Entrada (PropertyData)
```typescript
interface PropertyData {
  title?: string
  description?: string
  classification?: {
    type?: string      // tipo de propiedad
    condition?: string // venta/alquiler
  }
  caracteristics?: {
    price?: number
    currency?: string
    totalArea?: number
    // ... más campos
  }
  // ... más secciones
}
```

### Formato de Salida (MercadoLibre)
```typescript
interface MercadoLibreData {
  title: string
  category_id: string
  price: number
  currency_id: string
  buying_mode: string
  condition: string
  listing_type_id: string
  description?: string
  pictures?: Array<{ source: string }>
  attributes?: Array<{
    id: string
    value_name?: string
    value_unit?: string
  }>
  location?: {
    address_line?: string
    city?: { name?: string }
    state?: { name?: string }
    country?: { id: string }
  }
}
```

## Mapeo de Campos

### Tipos de Propiedad
- Los tipos internos se mapean a categorías de MercadoLibre
- Ejemplo: `departamento` → `MLA1472` (Departamentos)

### Atributos
- Superficie: Se envía en m² como atributo `TOTAL_AREA`
- Dormitorios/Baños: Atributos `BEDROOMS`/`BATHROOMS`
- Antigüedad: Se convierte a valor numérico con unidad de tiempo

### Ubicación
- Se mapea dirección, ciudad, provincia y país
- Argentina se identifica con `country.id: 'AR'`

## Manejo de Errores

### Tipos de Error
1. **Token inválido**: Se intenta renovar automáticamente
2. **Datos faltantes**: Se validan antes del envío
3. **Error de API**: Se captura y se informa al usuario
4. **Error de red**: Se maneja con reintentos

### Respuestas de Error
```typescript
{
  error: string,
  details?: string,
  needsReauth?: boolean,
  updatedMercadoLibreData?: {
    status: 'error',
    lastError: string,
    lastSyncAt: string
  }
}
```

## Configuración de Desarrollo

1. **Variables de entorno requeridas**:
   ```env
   MERCADOLIBRE_CLIENT_ID=
   MERCADOLIBRE_CLIENT_SECRET=
   MERCADOLIBRE_REDIRECT_URI=
   ```

2. **Base de datos**: Asegurar que la colección `MercadoLibreTokens` esté creada

3. **Permisos**: La aplicación debe tener permisos de:
   - `read`: Leer información de la cuenta
   - `write`: Crear y modificar listados

## Notas Importantes

- **Tokens de 6 horas**: Los tokens expiran cada 6 horas y se renuevan automáticamente
- **Refresh tokens únicos**: Cada renovación genera un nuevo refresh token
- **Cuenta única**: El sistema usa una sola cuenta de MercadoLibre para todas las publicaciones
- **Rate limiting**: MercadoLibre tiene límites de API que deben considerarse
- **Sandbox vs Producción**: Asegurar usar las URLs correctas según el entorno

## Troubleshooting

### Problemas Comunes

1. **Token expirado**:
   - Verificar fecha de expiración en la base de datos
   - Comprobar que el refresh token sea válido

2. **Error de categoría**:
   - Verificar que el mapeo de tipo de propiedad sea correcto
   - Comprobar que la categoría exista en MercadoLibre

3. **Error de ubicación**:
   - Asegurar que ciudad y provincia estén correctamente mapeadas
   - Verificar formato de dirección

4. **Imágenes no aparecen**:
   - Verificar que las URLs de imágenes sean accesibles públicamente
   - Comprobar formato de array de imágenes
