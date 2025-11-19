'use client'

import React, { useEffect, useState } from 'react'

interface MetaData {
  name?: string
  uploaded?: boolean
  externalId?: string
  externalUrl?: string
  status?: 'queued' | 'ok' | 'published' | 'error' | 'not_published' | 'not_sent'
  lastSyncAt?: string
  lastError?: string
}

interface MetaPortalProps {
  propertyId: string
  metaData?: MetaData
  onDataUpdate?: (newData: MetaData) => void
}

export default function MetaPortal({
  propertyId,
  metaData,
  onDataUpdate,
}: MetaPortalProps) {
  const [loading, setLoading] = useState(false)
  const [localMetaData, setLocalMetaData] = useState<MetaData>(metaData || {})

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

  // Función para publicar en Instagram via API interna
  const publishToInstagram = async () => {
    try {
      setLoading(true)

      // Enviar solo el propertyId al endpoint, el backend se encarga de buscar todos los datos
      const response = await fetch('/api/portals/meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'publishToInstagram',
          propertyId: propertyId,
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
            lastError: errorData.error || `Error al publicar en Instagram (status ${response.status})`,
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
      <button className={buttonClass} onClick={publishToInstagram} disabled={isDisabled}>
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
                  <a
                    href={localMetaData.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
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
        <div className="property-details__portal-actions">
          {renderButton()}
        </div>
      </div>

      {/* Mensajes de estado */}
      {getStatusMessage()}

      {/* Mostrar error si existe */}
      {localMetaData.lastError && localMetaData.status !== 'error' && (
        <div className="property-details__portal-status-message property-details__portal-status-message--error">
          <strong>Error:</strong> {localMetaData.lastError}
        </div>
      )}
    </div>
  )
}
