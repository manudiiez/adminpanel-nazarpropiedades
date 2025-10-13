import { getWatermarkBuffer } from '@/utils/getWatermarkBuffer'
import { s3Bucket, s3Client, s3Prefix } from '@/utils/s3Client'
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import path from 'path'
import sharp from 'sharp'
import { CollectionAfterChangeHook } from 'payload'
const WATERMARK_TARGET_SIZE = 'watermark'

async function streamToBuffer(stream: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    stream.on('data', (chunk: Buffer) => chunks.push(chunk))
    stream.on('error', reject)
    stream.on('end', () => resolve(Buffer.concat(chunks)))
  })
}

export const afterChangeHook: CollectionAfterChangeHook = async ({ doc, req, operation }) => {
  if (operation !== 'create') {
    return doc
  }

  const logger = req.payload.logger
  logger.info(`[Hook afterChange] Iniciando post-procesamiento para ${doc.filename}...`)

  try {
    const imageSizeToEdit = doc.sizes?.[WATERMARK_TARGET_SIZE]
    if (!imageSizeToEdit?.filename) {
      logger.warn(`[Hook afterChange] No se encontró el tamaño '${WATERMARK_TARGET_SIZE}'.`)
      return doc
    }

    // =================== CAMBIO IMPORTANTE ===================
    // Construimos la ruta (Key) del objeto en S3 usando el prefijo
    const key = path.join(s3Prefix, imageSizeToEdit.filename).replace(/\\/g, '/')
    // =======================================================
    const getObjectCmd = new GetObjectCommand({ Bucket: s3Bucket, Key: key })
    const response = await s3Client.send(getObjectCmd)
    const originalBuffer = await streamToBuffer(response.Body)

    const watermarkBuffer = await getWatermarkBuffer()
    if (!watermarkBuffer) {
      logger.warn(`[Hook afterChange] No se pudo cargar la marca de agua.`)
      return doc
    }

    const watermarkedBuffer = await sharp(originalBuffer)
      .composite([{ input: watermarkBuffer, gravity: 'center' }])
      .toBuffer()

    const putObjectCmd = new PutObjectCommand({
      Bucket: s3Bucket,
      Key: key,
      Body: watermarkedBuffer,
      ContentType: imageSizeToEdit.mimeType,
    })
    await s3Client.send(putObjectCmd)

    logger.info(`[Hook afterChange] ✅ Proceso completado para ${doc.filename}.`)
  } catch (error) {
    logger.error(`[Hook afterChange] ❌ Error durante el post-procesamiento:`, error)
  }

  return doc
}
