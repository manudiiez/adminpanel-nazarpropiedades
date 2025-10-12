'use client'

import React, { useEffect, useState } from 'react'

interface MercadoLibreData {
  name?: string
  uploaded?: boolean
  externalId?: string
  externalUrl?: string
  status?: 'queued' | 'ok' | 'published' | 'error' | 'desactualizado' | 'not_published' | 'not_sent'
  lastSyncAt?: string
  lastError?: string
}

interface MercadoLibrePortalProps {
  propertyData: any
  ownerData?: any
  images?: Array<{ url: string; orden: number }>
  propertyId?: string
  mercadoLibreData?: MercadoLibreData
}

export default function MercadoLibrePortal({
  propertyData,
  ownerData,
  images,
  propertyId,
  mercadoLibreData,
}: MercadoLibrePortalProps) {
  const [loading, setLoading] = useState(false)
  const [localMercadoLibreData, setLocalMercadoLibreData] = useState<MercadoLibreData>(
    mercadoLibreData || {},
  )
  const [previousState, setPreviousState] = useState<string>('')

  useEffect(() => {
    console.log('mercadoLibreData cambió: ', localMercadoLibreData)
    console.log('Imágenes en MercadoLibrePortal:', images)
  }, [localMercadoLibreData])

  // Función para obtener el badge de estado
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      published: { class: 'status-published', text: 'Publicado' },
      ok: { class: 'status-published', text: 'Publicado' },
      draft: { class: 'status-draft', text: 'Borrador' },
      error: { class: 'status-error', text: 'Error' },
      queued: { class: 'status-queued', text: 'En cola' },
      desactualizado: { class: 'status-outdated', text: 'Desactualizado' },
      not_published: { class: 'status-not-published', text: 'No publicado' },
      not_sent: { class: 'status-not-published', text: 'No publicado' },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.not_published
    return <span className={`property-details__status-badge ${config.class}`}>{config.text}</span>
  }

  // Función para publicar en Mercado Libre
  const publishToMercadoLibre = async () => {
    try {
      // Guardar el estado actual antes de empezar la publicación
      setPreviousState(localMercadoLibreData?.status || 'not_published')

      setLoading(true)

      // Limpiar datos del propietario para evitar referencias circulares (igual que Inmoup)
      const cleanOwnerData = ownerData
        ? {
            fullname: ownerData.fullname || '',
            email: ownerData.email || '',
            phone: ownerData.phone || '',
            address: ownerData.address || '',
            province: ownerData.province || '',
            locality: ownerData.locality || '',
            notes: ownerData.notes || '',
          }
        : null

      const response = await fetch('/api/meli/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'publishToMercadoLibre',
          propertyId: propertyId,
          propertyData: propertyData,
          ownerData: cleanOwnerData,
          images: images,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }))

        // Si el backend envía updatedMercadolibreData en el error, usarlo
        if (errorData.updatedMercadolibreData || errorData.updatedMercadoLibreData) {
          const updatedData = errorData.updatedMercadolibreData || errorData.updatedMercadoLibreData
          setLocalMercadoLibreData({
            name: updatedData.name,
            uploaded: updatedData.uploaded,
            externalId: updatedData.externalId,
            externalUrl: updatedData.externalUrl,
            status: updatedData.status,
            lastSyncAt: updatedData.lastSyncAt,
            lastError: updatedData.lastError || errorData.error,
          })
          console.log('Datos de error actualizados desde backend:', updatedData)
        } else {
          // Si no hay updatedMercadoLibreData, actualizar manualmente el estado
          setLocalMercadoLibreData({
            ...localMercadoLibreData,
            status: 'error',
            lastError:
              errorData.error || `Error al publicar en MercadoLibre (status ${response.status})`,
            lastSyncAt: new Date().toISOString(),
          })
          console.log('Error actualizado manualmente:', errorData.error)
        }

        throw new Error(errorData.error || `HTTP error ${response.status}`)
      }

      const result = await response.json()
      console.log('Respuesta completa de publicación:', result)

      // Usar los datos actualizados que vienen del backend
      if (result.updatedMercadolibreData || result.updatedMercadoLibreData) {
        const updatedData = result.updatedMercadolibreData || result.updatedMercadoLibreData

        // Limpiar el estado anterior si la operación fue exitosa
        setPreviousState('')
        console.log('Publicación exitosa:', updatedData)
        // Actualizar los datos locales de MercadoLibre con los datos del backend
        setLocalMercadoLibreData({
          name: updatedData.name,
          uploaded: updatedData.uploaded,
          externalId: updatedData.externalId,
          externalUrl: updatedData.externalUrl,
          status: updatedData.status,
          lastSyncAt: updatedData.lastSyncAt,
          lastError: undefined, // Limpiar error en operación exitosa
        })

        console.log('Datos de MercadoLibre actualizados desde backend:', updatedData)
      } else {
        // Fallback al método anterior si no viene updatedMercadoLibreData
        setPreviousState('')

        // Primero combinar cualquier campo devuelto top-level
        const mergedFromServer = {
          externalId: result.externalId ?? undefined,
          externalUrl: result.externalUrl ?? undefined,
          lastSyncAt: result.lastSyncAt ?? new Date().toISOString(),
          status: result.status ?? 'paused',
          uploaded: result.uploaded ?? true,
        }

        // Limpiar lastError en operación exitosa
        setLocalMercadoLibreData({
          ...localMercadoLibreData,
          ...mergedFromServer,
          lastError: undefined,
        })

        console.log('Usando fallback - respuesta completa:', result)
      }
    } catch (error) {
      console.error('Error publicando en MercadoLibre:', error)

      // Solo actualizar lastError si no se actualizó desde el backend
      if (!localMercadoLibreData?.lastError || localMercadoLibreData.lastError === undefined) {
        setLocalMercadoLibreData({
          ...localMercadoLibreData,
          status: 'error',
          lastError: error instanceof Error ? error.message : 'Error desconocido',
          lastSyncAt: new Date().toISOString(),
        })
      }
      alert('Error al publicar en MercadoLibre. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  // Función para sincronizar en Mercado Libre
  const syncToMercadoLibre = async () => {
    try {
      // Guardar el estado actual antes de empezar la sincronización
      setPreviousState(localMercadoLibreData?.status || 'not_published')

      setLoading(true)

      // Limpiar datos del propietario para evitar referencias circulares (igual que Inmoup)
      const cleanOwnerData = ownerData
        ? {
            fullname: ownerData.fullname || '',
            email: ownerData.email || '',
            phone: ownerData.phone || '',
            address: ownerData.address || '',
            province: ownerData.province || '',
            locality: ownerData.locality || '',
            notes: ownerData.notes || '',
          }
        : null

      const response = await fetch('/api/meli/publish', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sync',
          propertyId: propertyId,
          propertyData: propertyData,
          ownerData: cleanOwnerData,
          images: images,
          externalId: localMercadoLibreData?.externalId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }))

        // Si el backend envía updatedMercadolibreData en el error, usarlo SOLO para el lastError
        if (errorData.updatedMercadolibreData || errorData.updatedMercadoLibreData) {
          const updatedData = errorData.updatedMercadolibreData || errorData.updatedMercadoLibreData
          setLocalMercadoLibreData({
            ...localMercadoLibreData,
            lastError: updatedData.lastError || errorData.error,
            lastSyncAt: updatedData.lastSyncAt || new Date().toISOString(),
          })
          console.log('Error de sincronización actualizado desde backend:', updatedData.lastError)
        } else {
          // Si no hay updatedMercadolibreData, solo actualizar el lastError local
          setLocalMercadoLibreData({
            ...localMercadoLibreData,
            lastError: errorData.error || 'Error al sincronizar en MercadoLibre',
            lastSyncAt: new Date().toISOString(),
          })
        }

        throw new Error(errorData.error || `HTTP error ${response.status}`)
      }

      const result = await response.json()

      // Usar los datos actualizados que vienen del backend
      if (result.updatedMercadolibreData || result.updatedMercadoLibreData) {
        const updatedData = result.updatedMercadolibreData || result.updatedMercadoLibreData

        // Limpiar el estado anterior si la operación fue exitosa
        setPreviousState('')

        // Actualizar los datos locales de MercadoLibre con los datos del backend
        setLocalMercadoLibreData({
          name: updatedData.name,
          uploaded: updatedData.uploaded,
          externalId: updatedData.externalId,
          externalUrl: updatedData.externalUrl,
          status: updatedData.status,
          lastSyncAt: updatedData.lastSyncAt,
          lastError: undefined, // Limpiar error en operación exitosa
        })

        console.log('Datos de MercadoLibre sincronizados desde backend:', updatedData)
      } else {
        // Fallback al método anterior si no viene updatedMercadolibreData
        setPreviousState('')

        // Limpiar lastError en operación exitosa
        setLocalMercadoLibreData({
          ...localMercadoLibreData,
          lastError: undefined,
          lastSyncAt: new Date().toISOString(),
        })

        console.log('Usando fallback - respuesta completa de sincronización:', result)
      }

      console.log('Propiedad sincronizada exitosamente en MercadoLibre:', result)
    } catch (error) {
      console.error('Error sincronizando en MercadoLibre:', error)

      // Para errores de sincronización, mantener el estado actual y solo actualizar el lastError
      setLocalMercadoLibreData({
        ...localMercadoLibreData,
        lastError: error instanceof Error ? error.message : 'Error desconocido',
        lastSyncAt: new Date().toISOString(),
      })
      alert('Error al sincronizar con MercadoLibre. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  // Función para eliminar de Mercado Libre
  const deleteFromMercadoLibre = async () => {
    const confirmDelete = window.confirm(
      '¿Estás seguro de que quieres eliminar esta propiedad de MercadoLibre?',
    )
    if (!confirmDelete) return

    try {
      // Guardar el estado actual antes de empezar la eliminación
      setPreviousState(localMercadoLibreData?.status || 'not_published')

      setLoading(true)

      const response = await fetch('/api/meli/publish', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          propertyId: propertyId,
          externalId: localMercadoLibreData?.externalId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }))

        // Si el backend envía updatedMercadolibreData en el error, usarlo SOLO para el lastError
        if (errorData.updatedMercadolibreData || errorData.updatedMercadoLibreData) {
          const updatedData = errorData.updatedMercadolibreData || errorData.updatedMercadoLibreData
          setLocalMercadoLibreData({
            ...localMercadoLibreData,
            lastError: updatedData.lastError || errorData.error,
            lastSyncAt: updatedData.lastSyncAt || new Date().toISOString(),
          })
          console.log('Error de eliminación actualizado desde backend:', updatedData.lastError)
        } else {
          // Si no hay updatedMercadolibreData, solo actualizar el lastError local
          setLocalMercadoLibreData({
            ...localMercadoLibreData,
            lastError: errorData.error || 'Error al eliminar de MercadoLibre',
            lastSyncAt: new Date().toISOString(),
          })
        }

        throw new Error(errorData.error || `HTTP error ${response.status}`)
      }

      const result = await response.json()

      // Usar los datos actualizados que vienen del backend
      if (result.updatedMercadolibreData || result.updatedMercadoLibreData) {
        const updatedData = result.updatedMercadolibreData || result.updatedMercadoLibreData

        // Limpiar el estado anterior si la operación fue exitosa
        setPreviousState('')

        // Actualizar los datos locales de MercadoLibre con los datos del backend
        setLocalMercadoLibreData({
          name: updatedData.name,
          uploaded: updatedData.uploaded,
          externalId: updatedData.externalId,
          externalUrl: updatedData.externalUrl,
          status: updatedData.status,
          lastSyncAt: updatedData.lastSyncAt,
          lastError: undefined, // Limpiar error en operación exitosa
        })

        console.log('Datos de MercadoLibre después de eliminación:', updatedData)
      } else {
        // Fallback - marcar como no publicado
        setPreviousState('')

        setLocalMercadoLibreData({
          ...localMercadoLibreData,
          uploaded: false,
          externalId: undefined,
          externalUrl: undefined,
          status: 'not_published',
          lastSyncAt: new Date().toISOString(),
          lastError: undefined,
        })
        console.log('Usando fallback para eliminación - respuesta completa:', result)
      }

      console.log('Propiedad eliminada exitosamente de MercadoLibre:', result)
    } catch (error) {
      console.error('Error eliminando de MercadoLibre:', error)

      // Para errores de eliminación, mantener el estado actual y solo actualizar el lastError
      setLocalMercadoLibreData({
        ...localMercadoLibreData,
        lastError: error instanceof Error ? error.message : 'Error desconocido',
        lastSyncAt: new Date().toISOString(),
      })
      alert('Error al eliminar de MercadoLibre. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  // Función principal para manejar publicaciones
  const handlePublish = async () => {
    const currentStatus = localMercadoLibreData?.status || 'not_published'

    // Si está desactualizado, sincronizar; si no, publicar
    if (currentStatus === 'desactualizado') {
      await syncToMercadoLibre()
    } else {
      await publishToMercadoLibre()
    }
  }

  // Función para renderizar el botón principal
  const renderButton = () => {
    const currentStatus = localMercadoLibreData?.status || 'not_published'
    // Determinar el texto y funcionalidad del botón según el estado
    let buttonText = ''
    let buttonVariant = 'primary'
    let isDisabled = false
    let onClick = handlePublish

    if (loading || currentStatus === 'queued') {
      buttonText = 'Procesando...'
      buttonVariant = 'pending'
      isDisabled = true
    } else if (currentStatus === 'published' || currentStatus === 'ok') {
      if (localMercadoLibreData?.externalUrl) {
        // Si está publicado y tiene URL, mostrar como enlace
        return (
          <a
            href={localMercadoLibreData.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="property-details__btn property-details__btn--success property-details__btn--small"
          >
            Ver en Mercado Libre
          </a>
        )
      } else {
        buttonText = 'Ver en Portal'
        buttonVariant = 'success'
        isDisabled = true // Sin URL no se puede ver
      }
    } else if (currentStatus === 'error') {
      buttonText = 'Reintentar'
      buttonVariant = 'primary'
    } else if (currentStatus === 'desactualizado') {
      buttonText = 'Sincronizar'
      buttonVariant = 'warning'
    } else {
      // not_published o cualquier otro estado
      buttonText = 'Publicar'
      buttonVariant = 'primary'
    }

    const buttonClass = `property-details__btn property-details__btn--${buttonVariant} property-details__btn--small`

    return (
      <button className={buttonClass} onClick={onClick} disabled={isDisabled}>
        {buttonText}
      </button>
    )
  }

  // Función para renderizar el botón de eliminar
  const renderDeleteButton = () => {
    // El botón eliminar debe aparecer solo si está subido a Mercado Libre
    const shouldShowDelete = localMercadoLibreData?.uploaded === true && !loading

    if (!shouldShowDelete) {
      return null
    }

    return (
      <button
        className="property-details__btn property-details__btn--error property-details__btn--small"
        onClick={deleteFromMercadoLibre}
        disabled={loading}
      >
        {loading ? 'Eliminando...' : 'Eliminar'}
      </button>
    )
  }

  // Función para obtener el mensaje de estado
  const getStatusMessage = () => {
    const currentStatus = localMercadoLibreData?.status || 'not_published'

    switch (currentStatus) {
      case 'desactualizado':
        return (
          <div className="property-details__portal-status-message property-details__portal-status-message--warning">
            💡 <strong>Desactualizado:</strong> La propiedad fue modificada. Haz clic en
            "Sincronizar" para subir las modificaciones a Mercado Libre.
          </div>
        )
      case 'error':
        let errorMessage = 'Hubo un problema al procesar la solicitud. Intenta nuevamente.'

        if (localMercadoLibreData?.lastError) {
          errorMessage = localMercadoLibreData.lastError
        }

        return (
          <div className="property-details__portal-status-message property-details__portal-status-message--error">
            ⚠️ <strong>Error:</strong> {errorMessage}
          </div>
        )
      case 'queued':
        return (
          <div className="property-details__portal-status-message property-details__portal-status-message--info">
            ⏳ <strong>En cola:</strong> La publicación está siendo procesada. Por favor espera.
          </div>
        )
      case 'published':
      case 'ok':
        if (localMercadoLibreData?.externalUrl) {
          return (
            <div className="property-details__portal-status-message property-details__portal-status-message--success">
              ✅ <strong>Publicado:</strong> La propiedad está activa en Mercado Libre.
            </div>
          )
        }
        break
      default:
        return (
          <div className="property-details__portal-status-message property-details__portal-status-message--neutral">
            📤 <strong>No publicado:</strong> Esta propiedad aún no ha sido publicada en Mercado
            Libre.
          </div>
        )
    }
    return null
  }

  return (
    <div className="property-details__portal-carditem">
      <div className="property-details__portal-name">
        <span>Mercado Libre</span>
        {getStatusBadge(localMercadoLibreData?.status || 'not_published')}
      </div>
      <div className="property-details__portal-item">
        <div className="property-details__portal-info">
          {/* Información específica de Mercado Libre */}
          {localMercadoLibreData && (
            <div className="property-details__portal-details">
              {localMercadoLibreData.externalId && (
                <div className="property-details__portal-detail">
                  <strong>ID Mercado Libre:</strong> {localMercadoLibreData.externalId}
                </div>
              )}
              {localMercadoLibreData.externalUrl && (
                <div className="property-details__portal-detail">
                  <strong>URL del Portal:</strong>{' '}
                  <a
                    href={localMercadoLibreData.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {localMercadoLibreData.externalUrl}
                  </a>
                </div>
              )}
              {localMercadoLibreData.lastSyncAt && (
                <div className="property-details__portal-detail">
                  <strong>Última sincronización:</strong>{' '}
                  {new Date(localMercadoLibreData.lastSyncAt).toLocaleString('es-ES')}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="property-details__portal-actions">
          {renderButton()}
          {renderDeleteButton()}
        </div>
      </div>

      {/* Mensajes de estado específicos de Mercado Libre */}
      {getStatusMessage()}

      {/* Mostrar error específico de Mercado Libre */}
      {localMercadoLibreData.lastError && localMercadoLibreData.status !== 'error' && (
        <div className="property-details__portal-status-message property-details__portal-status-message--error">
          ⚠️ <strong>Error:</strong> {localMercadoLibreData.lastError}
        </div>
      )}
    </div>
  )
}
