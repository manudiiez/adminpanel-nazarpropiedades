import { S3Client } from '@aws-sdk/client-s3'

// Lee las variables de entorno que estás usando en tu payload.config.ts
const R2_BUCKET = process.env.R2_BUCKET
const R2_ENDPOINT = process.env.R2_ENDPOINT
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY
const R2_PREFIX = process.env.R2_PREFIX || '' // Leemos el prefijo para la colección 'media'

// Valida que todas las variables necesarias para la conexión estén definidas
if (!R2_BUCKET || !R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
  throw new Error('Faltan variables de entorno R2_... críticas para la configuración de S3.')
}

// Crea y exporta una instancia del cliente S3 que usaremos en nuestro hook
export const s3Client = new S3Client({
  endpoint: R2_ENDPOINT,
  region: 'auto', // Coincide con tu configuración
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true, // Coincide con tu configuración
})

// Exporta el nombre del bucket y el prefijo para fácil acceso
export const s3Bucket = R2_BUCKET
export const s3Prefix = R2_PREFIX
