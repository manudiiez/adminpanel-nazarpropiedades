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
  const router = useRouter()
  useEffect(() => {
    const fetchImage = async () => {
      // Si no hay cellData o no es un string (ID), no hacer nada
      if (!cellData || typeof cellData !== 'string') {
        return
      }

      setLoading(true)
      setError(null)

      try {
        // Hacer petición a la API para obtener los datos de la imagen
        const response = await fetch(`/api/media/${cellData}`)

        if (!response.ok) {
          throw new Error(`Error al cargar imagen: ${response.status}`)
        }

        const data = await response.json()
        setImageData(data)
      } catch (err) {
        console.error('Error fetching image:', err)
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    fetchImage()
  }, [cellData])

  // Función para manejar el click en la imagen
  const handleImageClick = () => {
    if (rowData?.id) {
      // Navegar al elemento de la colección (asumiendo que es propiedades)
      router.push(`/admin/collections/propiedades/${rowData.id}`)
    }
  }

  // Si no hay cellData, mostrar mensaje
  if (!cellData) {
    return (
      <div className="cell-portada">
        <span className="cell-portada__text">Sin imagen</span>
      </div>
    )
  }

  // Si está cargando, mostrar mensaje de carga
  if (loading) {
    return (
      <div className="cell-portada">
        <span className="cell-portada__text">Cargando...</span>
      </div>
    )
  }

  // Si hay error, mostrar un placeholder cuadrado con un icono
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
          {/* Icono de imagen simple en SVG */}
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

  // Si hay datos de imagen, mostrarla
  if (imageData) {
    return (
      <div className="cell-portada">
        <div
          onClick={handleImageClick}
          className={`cell-portada__image-wrapper ${rowData?.id ? 'clickable' : ''}`}
          title={rowData?.id ? 'Click para ver detalles' : undefined}
        >
          <Image
            src={imageData?.sizes?.thumbnail?.url}
            // src={imageData?.thumbnailURL}
            alt={imageData.alt || imageData.filename || 'Imagen de portada'}
            width={180}
            height={150}
            className="cell-portada__img"
            onError={() => setError('Error al cargar la imagen')}
          />
        </div>
      </div>
    )
  }

  // Fallback si no hay imagen
  return (
    <div className="cell-portada" onClick={handleImageClick}>
      <span style={{ color: 'var(--theme-elevation-600)', fontStyle: 'italic' }}>Sin imagen</span>
    </div>
  )
}
