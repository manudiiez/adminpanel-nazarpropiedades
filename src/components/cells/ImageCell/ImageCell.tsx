'use client'

import './styles.scss'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface ImageData {
  id: string
  url: string
  alt?: string
  filename?: string
  width?: number
  height?: number
  sizes?: any
  thumbnailURL?: string
}

export default function ImageCell({ cellData, rowData }: { cellData?: any; rowData?: any }) {
  const [imageData, setImageData] = useState<ImageData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageKey, setImageKey] = useState(0) // ✅ Key para forzar re-render
  const router = useRouter()

  useEffect(() => {
    const fetchImage = async () => {
      if (!cellData || typeof cellData !== 'string') {
        return
      }

      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/media/${cellData}`)

        if (!response.ok) {
          throw new Error(`Error al cargar imagen: ${response.status}`)
        }

        const data = await response.json()
        console.log('Fetched image data:', data)
        console.log('Thumbnail URL:', data?.sizes?.thumbnail?.url)
        console.log('Main URL:', data?.url)

        setImageData(data)
        setImageKey((prev) => prev + 1) // ✅ Forzar re-render cuando los datos cambian
      } catch (err) {
        console.error('Error fetching image:', err)
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    fetchImage()
  }, [cellData])

  const handleImageClick = () => {
    if (rowData?.id) {
      router.push(`/admin/collections/propiedades/${rowData.id}`)
    }
  }

  if (!cellData) {
    return (
      <div className="cell-portada">
        <span className="cell-portada__text">Sin imagen</span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="cell-portada">
        <span className="cell-portada__text">Cargando...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="cell-portada">
        <div
          onClick={handleImageClick}
          role="img"
          aria-label="Imagen no disponible"
          title={error}
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

  if (imageData) {
    const imageUrl = imageData?.sizes?.thumbnail?.url || imageData?.url

    // ✅ Validar que la URL existe antes de renderizar
    if (!imageUrl) {
      console.error('No image URL found in imageData:', imageData)
      return (
        <div className="cell-portada">
          <span className="cell-portada__text">URL no disponible</span>
        </div>
      )
    }

    return (
      <div className="cell-portada">
        <div
          onClick={handleImageClick}
          className={`cell-portada__image-wrapper ${rowData?.id ? 'clickable' : ''}`}
          title={rowData?.id ? 'Click para ver detalles' : undefined}
        >
          <Image
            key={imageKey} // ✅ Key única para forzar re-mount en cambios
            src={imageUrl}
            alt={imageData.alt || imageData.filename || 'Imagen de portada'}
            width={180}
            height={150}
            className="cell-portada__img"
            onError={(e) => {
              console.error('Image load error:', imageUrl)
              console.error('Event:', e)
              setError('Error al cargar la imagen')
            }}
            loading="lazy"
            unoptimized={false} // ✅ Usar optimización de Next.js
          />
        </div>
      </div>
    )
  }

  return (
    <div className="cell-portada" onClick={handleImageClick}>
      <span style={{ color: 'var(--theme-elevation-600)', fontStyle: 'italic' }}>Sin imagen</span>
    </div>
  )
}

// ===== ALTERNATIVA: Usar img nativa para evitar problemas =====

/*
'use client'

import './styles.scss'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface ImageData {
  id: string
  url: string
  alt?: string
  filename?: string
  sizes?: any
}

export default function ImageCell({ cellData, rowData }: { cellData?: any; rowData?: any }) {
  const [imageData, setImageData] = useState<ImageData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchImage = async () => {
      if (!cellData || typeof cellData !== 'string') return

      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/media/${cellData}`)
        if (!response.ok) throw new Error(`Error: ${response.status}`)
        
        const data = await response.json()
        setImageData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    fetchImage()
  }, [cellData])

  const handleImageClick = () => {
    if (rowData?.id) {
      router.push(`/admin/collections/propiedades/${rowData.id}`)
    }
  }

  if (!cellData) {
    return <div className="cell-portada"><span>Sin imagen</span></div>
  }

  if (loading) {
    return <div className="cell-portada"><span>Cargando...</span></div>
  }

  if (error || !imageData) {
    return (
      <div className="cell-portada">
        <div className="cell-portada__error-placeholder" onClick={handleImageClick}>
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5-4 4-3-3-4 4" />
          </svg>
        </div>
      </div>
    )
  }

  const imageUrl = imageData?.sizes?.thumbnail?.url || imageData?.url

  return (
    <div className="cell-portada">
      <div
        onClick={handleImageClick}
        className={`cell-portada__image-wrapper ${rowData?.id ? 'clickable' : ''}`}
      >
        <img
          src={imageUrl}
          alt={imageData.alt || imageData.filename || 'Imagen'}
          width={180}
          height={150}
          className="cell-portada__img"
          onError={() => setError('Error al cargar imagen')}
          loading="lazy"
          style={{ objectFit: 'cover', width: '180px', height: '150px' }}
        />
      </div>
    </div>
  )
}
*/
