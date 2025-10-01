'use client'

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
        console.log('ImageCell data:', data)
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
        <span style={{ color: '#666', fontStyle: 'italic' }}>Sin imagen</span>
      </div>
    )
  }

  // Si está cargando, mostrar mensaje de carga
  if (loading) {
    return (
      <div className="cell-portada">
        <span>Cargando...</span>
      </div>
    )
  }

  // Si hay error, mostrar mensaje de error
  if (error) {
    return (
      <div className="cell-portada">
        <span style={{ color: '#d32f2f', fontSize: '0.875rem' }}>Error: {error}</span>
      </div>
    )
  }

  // Si hay datos de imagen, mostrarla
  if (imageData) {
    return (
      <div className="cell-portada">
        <div
          onClick={handleImageClick}
          style={{
            cursor: rowData?.id ? 'pointer' : 'default',
            display: 'inline-block',
            transition: 'transform 0.2s ease, opacity 0.2s ease',
          }}
          onMouseEnter={(e) => {
            if (rowData?.id) {
              e.currentTarget.style.transform = 'scale(1.05)'
              e.currentTarget.style.opacity = '0.9'
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.opacity = '1'
          }}
          title={rowData?.id ? 'Click para ver detalles' : undefined}
        >
          <Image
            // src={imageData.url}
            src={imageData.sizes.thumbnail.url}
            alt={imageData.alt || imageData.filename || 'Imagen de portada'}
            width={180}
            height={150}
            style={{
              objectFit: 'cover',
              borderRadius: '4px',
              border: '1px solid #e0e0e0',
              display: 'block',
            }}
            onError={() => setError('Error al cargar la imagen')}
          />
        </div>
      </div>
    )
  }

  // Fallback si no hay imagen
  return (
    <div className="cell-portada">
      <span style={{ color: '#666', fontStyle: 'italic' }}>Sin imagen</span>
    </div>
  )
}
