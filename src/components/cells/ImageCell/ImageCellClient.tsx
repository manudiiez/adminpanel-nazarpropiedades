'use client'

import './styles.scss'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface ImageData {
  id: string
  url: string
  alt?: string
  filename?: string
  width?: number
  height?: number
  sizes?: any
}

interface ImageCellClientProps {
  imageData: ImageData | null
  rowData?: any
  error?: string
}

export default function ImageCellClient({ imageData, rowData, error }: ImageCellClientProps) {
  const router = useRouter()

  const handleImageClick = () => {
    if (rowData?.id) {
      router.push(`/admin/collections/propiedades/${rowData.id}`)
    }
  }

  // Sin datos de imagen
  if (!imageData) {
    return (
      <div className="cell-portada">
        <div
          onClick={handleImageClick}
          role="img"
          aria-label="Imagen no disponible"
          title={error || 'Sin imagen'}
          className="cell-portada__error-placeholder"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5-4 4-3-3-4 4" />
          </svg>
        </div>
      </div>
    )
  }

  // Obtener URL de la imagen (preferir thumbnail)
  const imageUrl = imageData?.sizes?.thumbnail?.url || imageData?.url

  // Validar que la URL existe
  if (!imageUrl) {
    console.error('Client: No image URL found in imageData:', imageData)
    return (
      <div className="cell-portada">
        <div
          onClick={handleImageClick}
          className="cell-portada__error-placeholder"
          title="URL no disponible"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5-4 4-3-3-4 4" />
          </svg>
        </div>
      </div>
    )
  }

  // Renderizar imagen
  return (
    <div className="cell-portada">
      <div
        onClick={handleImageClick}
        className={`cell-portada__image-wrapper ${rowData?.id ? 'clickable' : ''}`}
        title={rowData?.id ? 'Click para ver detalles' : undefined}
      >
        <Image
          src={imageUrl}
          alt={imageData.alt || imageData.filename || 'Imagen de portada'}
          width={180}
          height={150}
          className="cell-portada__img"
          onError={(e) => {
            console.error('Client: Image load error:', imageUrl)
            console.error('Event:', e)
          }}
          loading="lazy"
          unoptimized={false}
        />
      </div>
    </div>
  )
}
