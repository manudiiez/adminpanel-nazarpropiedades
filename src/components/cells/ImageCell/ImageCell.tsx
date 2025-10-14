'use client'

import './styles.scss'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// ... tu interface ImageData

// Unificamos el estado en un solo objeto
type FetchState = {
  status: 'idle' | 'loading' | 'success' | 'error'
  data: any | null
  error: string | null
}

export default function ImageCell({ cellData, rowData }: { cellData?: any; rowData?: any }) {
  const [state, setState] = useState<FetchState>({ status: 'idle', data: null, error: null })
  const router = useRouter()

  useEffect(() => {
    const fetchImage = async () => {
      if (!cellData || typeof cellData !== 'string') {
        setState({ status: 'idle', data: null, error: null }) // Resetea si no hay ID
        return
      }

      setState({ status: 'loading', data: null, error: null })

      try {
        const response = await fetch(`/api/media/${cellData}`)
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`)
        }
        const data = await response.json()
        console.log('Fetched image data:', data)
        setState({ status: 'success', data: data, error: null })
      } catch (err) {
        console.error('Error fetching image:', err)
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
        setState({ status: 'error', data: null, error: errorMessage })
      }
    }

    fetchImage()
  }, [cellData])

  const handleImageClick = () => {
    if (rowData?.id) {
      router.push(`/admin/collections/propiedades/${rowData.id}`)
    }
  }

  // Ahora el renderizado es mucho más explícito y seguro
  switch (state.status) {
    case 'loading':
      return (
        <div className="cell-portada">
          <span className="cell-portada__text">Cargando...</span>
        </div>
      )

    case 'error':
      return (
        <div className="cell-portada">
          <div title={state.error || ''} className="cell-portada__error-placeholder">
            {/* SVG Icon */}
          </div>
        </div>
      )

    case 'success':
      if (state.data) {
        const imageUrl = state.data.sizes?.thumbnail?.url || state.data.url
        console.log('PROD RENDER - URL para <Image>:', imageUrl)
        return (
          <div className="cell-portada">
            <div
              onClick={handleImageClick}
              className={`cell-portada__image-wrapper ${rowData?.id ? 'clickable' : ''}`}
            >
              <Image
                src={imageUrl}
                alt={state.data.alt || state.data.filename || 'Imagen de portada'}
                width={180}
                height={150}
                className="cell-portada__img"
                onError={() =>
                  setState((s) => ({
                    ...s,
                    status: 'error',
                    error: 'El archivo de imagen no se pudo cargar.',
                  }))
                }
              />
            </div>
          </div>
        )
      }

    // El caso 'idle' o si no hay cellData cae aquí
    default:
      return (
        <div className="cell-portada">
          <span className="cell-portada__text">Sin imagen</span>
        </div>
      )
  }
}
