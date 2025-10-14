import { getPayload } from 'payload'
import config from '@payload-config'
import ImageCellClient from './ImageCellClient'

interface ImageCellServerProps {
  cellData?: any
  rowData?: any
}

interface ImageData {
  id: string
  url: string
  alt?: string
  filename?: string
  width?: number
  height?: number
  sizes?: any
}

export default async function ImageCellServer({ cellData, rowData }: ImageCellServerProps) {
  // Si no hay cellData, pasar null al cliente
  if (!cellData || typeof cellData !== 'string') {
    return <ImageCellClient imageData={null} rowData={rowData} />
  }

  try {
    console.log('Server: Fetching image for ID:', cellData)

    const payload = await getPayload({ config })

    const mediaItem = await payload.findByID({
      collection: 'media',
      id: cellData,
    })

    console.log('Server: Fetched media item:', mediaItem)

    // Convertir a formato ImageData y validar que url existe
    if (!mediaItem.url) {
      console.error('Server: No URL found in media item:', mediaItem)
      return <ImageCellClient imageData={null} rowData={rowData} error="URL no disponible" />
    }

    const imageData: ImageData = {
      id: mediaItem.id,
      url: mediaItem.url,
      alt: mediaItem.alt || undefined,
      filename: mediaItem.filename || undefined,
      width: mediaItem.width || undefined,
      height: mediaItem.height || undefined,
      sizes: mediaItem.sizes || undefined,
    }

    console.log('Server: Converted image data:', imageData)

    // Pasar los datos de la imagen al componente cliente
    return <ImageCellClient imageData={imageData} rowData={rowData} />
  } catch (error) {
    console.error('Server: Error fetching image:', error)

    // En caso de error, pasar null al cliente para que maneje el estado de error
    return <ImageCellClient imageData={null} rowData={rowData} error="Error al cargar imagen" />
  }
}
