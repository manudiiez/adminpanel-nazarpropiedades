'use client'

import React, { useEffect, useState } from 'react'
import './styles.scss'

interface MetaData {
  name?: string
  uploaded?: boolean
  externalId?: string
  externalUrl?: string
  status?: 'queued' | 'ok' | 'published' | 'error' | 'not_published' | 'not_sent'
  lastSyncAt?: string
  lastError?: string
}

interface PropertyImage {
  id: string | number
  url?: string
  filename?: string
  alt?: string
  sizes?: {
    thumbnail?: { url?: string }
    watermark?: { url?: string }
  }
}

interface MetaPortalProps {
  propertyId: string
  metaData?: MetaData
  onDataUpdate?: (newData: MetaData) => void
  images?: PropertyImage[]
}

export default function MetaPortal({
  propertyId,
  metaData,
  onDataUpdate,
  images = [],
}: MetaPortalProps) {
  const [loading, setLoading] = useState(false)
  const [localMetaData, setLocalMetaData] = useState<MetaData>(metaData || {})
  const [showImageSelector, setShowImageSelector] = useState(false)
  const [selectedImageIds, setSelectedImageIds] = useState<(string | number)[]>([])
  const MAX_IMAGES = 10

  useEffect(() => {
    // Notificar al componente padre cuando cambie el estado local
    if (onDataUpdate) {
      onDataUpdate(localMetaData)
    }
  }, [localMetaData, onDataUpdate])

  // Función para obtener el badge de estado
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      published: { class: 'status-published', text: 'Publicado' },
      ok: { class: 'status-published', text: 'Publicado' },
      error: { class: 'status-error', text: 'Error' },
      queued: { class: 'status-queued', text: 'En cola' },
      not_published: { class: 'status-not-published', text: 'No publicado' },
      not_sent: { class: 'status-not-published', text: 'No publicado' },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.not_published
    return <span className={`property-details__status-badge ${config.class}`}>{config.text}</span>
  }

  // Función para manejar el clic en el botón "Publicar"
  const handlePublishClick = () => {
    // Si no hay imágenes, mostrar error
    if (!images || images.length === 0) {
      alert('Esta propiedad no tiene imágenes para publicar')
      return
    }

    // Preseleccionar las primeras MAX_IMAGES imágenes
    const initialSelection = images.slice(0, MAX_IMAGES).map((img) => img.id)
    setSelectedImageIds(initialSelection)
    setShowImageSelector(true)
  }

  // Función para manejar la selección/deselección de imágenes
  const toggleImageSelection = (imageId: string | number) => {
    setSelectedImageIds((prev) => {
      if (prev.includes(imageId)) {
        // Deseleccionar
        return prev.filter((id) => id !== imageId)
      } else {
        // Seleccionar solo si no se ha alcanzado el máximo
        if (prev.length < MAX_IMAGES) {
          return [...prev, imageId]
        } else {
          alert(`Solo puedes seleccionar hasta ${MAX_IMAGES} imágenes`)
          return prev
        }
      }
    })
  }

  // Función para seleccionar/deseleccionar todas
  const toggleSelectAll = () => {
    if (selectedImageIds.length === Math.min(images.length, MAX_IMAGES)) {
      setSelectedImageIds([])
    } else {
      const allIds = images.slice(0, MAX_IMAGES).map((img) => img.id)
      setSelectedImageIds(allIds)
    }
  }

  // Función para publicar en Instagram con las imágenes seleccionadas
  const publishToInstagram = async () => {
    setShowImageSelector(false)
    try {
      setLoading(true)

      // Validar que haya imágenes seleccionadas
      if (selectedImageIds.length === 0) {
        alert('Debes seleccionar al menos una imagen')
        setLoading(false)
        return
      }
      console.log('Imágenes seleccionadas para publicar en Instagram:', selectedImageIds)
      // Enviar propertyId y las imágenes seleccionadas al endpoint
      const response = await fetch('/api/portals/meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'publishToInstagram',
          propertyId: propertyId,
          selectedImageIds: selectedImageIds,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }))

        // Si el backend envía updatedMetaData en el error, usarlo
        if (errorData.updatedMetaData) {
          setLocalMetaData({
            name: errorData.updatedMetaData.name,
            uploaded: errorData.updatedMetaData.uploaded,
            externalId: errorData.updatedMetaData.externalId,
            externalUrl: errorData.updatedMetaData.externalUrl,
            status: errorData.updatedMetaData.status,
            lastSyncAt: errorData.updatedMetaData.lastSyncAt,
            lastError: errorData.updatedMetaData.lastError || errorData.error,
          })
        } else {
          setLocalMetaData({
            ...localMetaData,
            status: 'error',
            lastError:
              errorData.error || `Error al publicar en Instagram (status ${response.status})`,
            lastSyncAt: new Date().toISOString(),
          })
        }

        throw new Error(errorData.error || `HTTP error ${response.status}`)
      }

      const result = await response.json()
      console.log('Respuesta de publicación en Instagram:', result)

      // Usar los datos actualizados que vienen del backend
      if (result.updatedMetaData) {
        setLocalMetaData({
          name: result.updatedMetaData.name,
          uploaded: result.updatedMetaData.uploaded,
          externalId: result.updatedMetaData.externalId,
          externalUrl: result.updatedMetaData.externalUrl,
          status: result.updatedMetaData.status,
          lastSyncAt: result.updatedMetaData.lastSyncAt,
          lastError: undefined,
        })
      } else {
        // Fallback
        setLocalMetaData({
          ...localMetaData,
          uploaded: true,
          status: 'published',
          externalId: result.postId || result.id,
          externalUrl: result.postUrl || result.permalink,
          lastSyncAt: new Date().toISOString(),
          lastError: undefined,
        })
      }

      // Cerrar el modal solo si todo fue exitoso
      setShowImageSelector(false)
    } catch (error) {
      console.error('Error publicando en Instagram:', error)

      if (!localMetaData?.lastError) {
        setLocalMetaData({
          ...localMetaData,
          status: 'error',
          lastError: error instanceof Error ? error.message : 'Error desconocido',
          lastSyncAt: new Date().toISOString(),
        })
      }

      alert('Error al publicar en Instagram. Inténtalo de nuevo.')
      // No cerrar el modal en caso de error, para que el usuario pueda reintentar
    } finally {
      setLoading(false)
    }
  }

  // Función para renderizar el botón principal
  const renderButton = () => {
    const currentStatus = localMetaData?.status || 'not_published'
    let buttonText = ''
    let buttonVariant = 'primary'
    let isDisabled = false

    if (loading || currentStatus === 'queued') {
      buttonText = 'Publicando...'
      buttonVariant = 'pending'
      isDisabled = true
    } else if (currentStatus === 'published' || currentStatus === 'ok') {
      if (localMetaData?.externalUrl) {
        return (
          <a
            href={localMetaData.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="property-details__btn property-details__btn--success property-details__btn--small"
          >
            Ver en Instagram
          </a>
        )
      } else {
        buttonText = 'Publicado'
        buttonVariant = 'success'
        isDisabled = true
      }
    } else if (currentStatus === 'error') {
      buttonText = 'Reintentar'
      buttonVariant = 'primary'
    } else {
      buttonText = 'Publicar'
      buttonVariant = 'primary'
    }

    const buttonClass = `property-details__btn property-details__btn--${buttonVariant} property-details__btn--small`

    return (
      <button className={buttonClass} onClick={handlePublishClick} disabled={isDisabled}>
        {buttonText}
      </button>
    )
  }

  // Función para obtener el mensaje de estado
  const getStatusMessage = () => {
    const currentStatus = localMetaData?.status || 'not_published'

    switch (currentStatus) {
      case 'error':
        let errorMessage = 'Hubo un problema al procesar la solicitud. Intenta nuevamente.'

        if (localMetaData?.lastError) {
          errorMessage = localMetaData.lastError
        }

        return (
          <div className="property-details__portal-status-message property-details__portal-status-message--error">
            <strong>Error:</strong> {errorMessage}
          </div>
        )
      case 'queued':
        return (
          <div className="property-details__portal-status-message property-details__portal-status-message--info">
            <strong>En cola:</strong> La publicación está siendo procesada. Por favor espera.
          </div>
        )
      case 'published':
      case 'ok':
        return (
          <div className="property-details__portal-status-message property-details__portal-status-message--success">
            <strong>Publicado:</strong> La propiedad fue publicada en Instagram.
          </div>
        )
      default:
        return (
          <div className="property-details__portal-status-message property-details__portal-status-message--neutral">
            <strong>No publicado:</strong> Esta propiedad aún no ha sido publicada en Instagram.
          </div>
        )
    }
  }

  return (
    <div className="property-details__portal-carditem">
      <div className="property-details__portal-name">
        <span>Instagram</span>
        {getStatusBadge(localMetaData?.status || 'not_published')}
      </div>
      <div className="property-details__portal-item">
        <div className="property-details__portal-info">
          {localMetaData && (
            <div className="property-details__portal-details">
              {localMetaData.externalId && (
                <div className="property-details__portal-detail">
                  <strong>ID Post:</strong> {localMetaData.externalId}
                </div>
              )}
              {localMetaData.externalUrl && (
                <div className="property-details__portal-detail">
                  <strong>URL del Post:</strong>{' '}
                  <a href={localMetaData.externalUrl} target="_blank" rel="noopener noreferrer">
                    Ver post
                  </a>
                </div>
              )}
              {localMetaData.lastSyncAt && (
                <div className="property-details__portal-detail">
                  <strong>Última publicación:</strong>{' '}
                  {new Date(localMetaData.lastSyncAt).toLocaleString('es-ES')}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="property-details__portal-actions">{renderButton()}</div>
      </div>

      {/* Mensajes de estado */}
      {getStatusMessage()}

      {/* Mostrar error si existe */}
      {localMetaData.lastError && localMetaData.status !== 'error' && (
        <div className="property-details__portal-status-message property-details__portal-status-message--error">
          <strong>Error:</strong> {localMetaData.lastError}
        </div>
      )}

      {/* Modal de selección de imágenes */}
      {showImageSelector && (
        <div className="meta-modal-overlay" onClick={() => setShowImageSelector(false)}>
          <div className="meta-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="meta-modal-header">
              <h3>Seleccionar imágenes para Instagram</h3>
              <button className="meta-modal-close" onClick={() => setShowImageSelector(false)}>
                ✕
              </button>
            </div>

            <div className="meta-modal-body">
              <div className="meta-image-counter">
                <p>
                  <strong>
                    Seleccionadas: {selectedImageIds.length} / {MAX_IMAGES}
                  </strong>
                  <br />
                  Instagram permite hasta {MAX_IMAGES} imágenes por publicación.
                </p>
              </div>

              <div className="meta-actions-bar">
                <button
                  className="property-details__btn property-details__btn--secondary property-details__btn--small"
                  onClick={toggleSelectAll}
                >
                  {selectedImageIds.length === Math.min(images.length, MAX_IMAGES)
                    ? 'Deseleccionar todas'
                    : `Seleccionar primeras ${Math.min(images.length, MAX_IMAGES)}`}
                </button>
              </div>

              <div className="meta-images-grid">
                {images.map((image, index) => {
                  const imageUrl =
                    image.sizes?.thumbnail?.url || image.sizes?.watermark?.url || image.url
                  const isSelected = selectedImageIds.includes(image.id)
                  const isDisabled = !isSelected && selectedImageIds.length >= MAX_IMAGES

                  return (
                    <div
                      key={image.id}
                      onClick={() => !isDisabled && toggleImageSelection(image.id)}
                      className={`meta-image-item ${
                        isSelected ? 'meta-image-item--selected' : 'meta-image-item--unselected'
                      } ${isDisabled ? 'meta-image-item--disabled' : ''}`}
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={image.alt || image.filename || `Imagen ${index + 1}`}
                        />
                      ) : (
                        <div className="meta-image-placeholder">Sin imagen</div>
                      )}

                      {isSelected && <div className="meta-image-selected-badge">✓</div>}

                      <div className="meta-image-number">{index + 1}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="meta-modal-footer">
              <button
                className="property-details__btn property-details__btn--secondary"
                onClick={() => setShowImageSelector(false)}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                className="property-details__btn property-details__btn--primary"
                onClick={publishToInstagram}
                disabled={selectedImageIds.length === 0 || loading}
              >
                {loading
                  ? 'Publicando...'
                  : `Publicar ${selectedImageIds.length > 0 ? `(${selectedImageIds.length})` : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
