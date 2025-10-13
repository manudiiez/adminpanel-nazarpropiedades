import { S3Client } from '@aws-sdk/client-s3'

const hasR2Vars = Boolean(
  process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET &&
    process.env.R2_ENDPOINT &&
    process.env.R2_PREFIX,
)

export function getR2Client() {
  if (!hasR2Vars) {
    // During build, avoid throwing — return null to let callers degrade gracefully
    return null
  } else {
    // Lee las variables de entorno que estás usando en tu payload.config.ts
    const R2_ENDPOINT = process.env.R2_ENDPOINT
    const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID
    const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY
    return new S3Client({
      endpoint: R2_ENDPOINT,
      region: 'auto',
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID!,
        secretAccessKey: R2_SECRET_ACCESS_KEY!,
      },
      forcePathStyle: true, // Coincide con tu configuración
    })
  }
}

export const getS3Config = () => {
  const R2_BUCKET = process.env.R2_BUCKET || ''
  const R2_PREFIX = process.env.R2_PREFIX || ''

  if (!R2_BUCKET) {
    // Solo lanzamos error si el bucket no está definido, el prefijo es opcional
    throw new Error('La variable de entorno R2_BUCKET no está definida.')
  }

  return {
    bucket: R2_BUCKET,
    prefix: R2_PREFIX,
  }
}
