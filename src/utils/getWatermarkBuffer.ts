import fs from 'fs/promises'
import path from 'path'

let watermarkBuffer: Buffer | null = null
const WATERMARK_PATH = path.join(process.cwd(), 'public', 'watermark.png')
/**
 * Carga y cachea el buffer de la marca de agua.
 * Solo lee el archivo del disco la primera vez que se llama.
 * @returns El buffer de la imagen de la marca de agua, o null si hay un error.
 */
export const getWatermarkBuffer = async (): Promise<Buffer | null> => {
  // Si ya lo cargamos antes, lo devolvemos directamente desde la memoria.
  if (watermarkBuffer) {
    return watermarkBuffer
  }

  try {
    const watermarkPath = WATERMARK_PATH
    // Leemos el archivo, lo guardamos en nuestra variable y lo devolvemos.
    watermarkBuffer = await fs.readFile(watermarkPath)
    console.log('✅ Watermark cargada en memoria desde:', watermarkBuffer)
    return watermarkBuffer
  } catch (error) {
    console.log('❌ Error al cargar la marca de agua en memoria:', error)
    return null
  }
}
