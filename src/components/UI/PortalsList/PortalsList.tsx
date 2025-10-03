'use client'

import React, { useEffect, useState } from 'react'
import './styles.scss'

interface PortalConfig {
  name: string
  logo: string
  status: string
  publishedDate: string | null
  notes: string
  requiredFields: string[]
  button?: {
    text: string
    url: string | null
    variant: string
    icon: string
  }
  externalId?: string | null
  externalUrl?: string | null
}

interface PortalsListProps {
  portalsConfig: Record<string, PortalConfig>
  propertyData: any
  ownerData?: any
  images?: Array<{ url: string; orden: number }>
  propertyId?: string
  inmoupData?: {
    name?: string
    uploaded?: boolean
    externalId?: string
    externalUrl?: string
    status?: 'queued' | 'ok' | 'error' | 'desactualizado' | 'not_published' | 'not_sent'
    lastSyncAt?: string
    lastError?: string
  }
}

export default function PortalsList({
  portalsConfig,
  propertyData,
  ownerData,
  images,
  propertyId,
  inmoupData,
}: PortalsListProps) {
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  // Estado local para los datos de Inmoup que se actualiza después de publicar
  const [localInmoupData, setLocalInmoupData] = useState(inmoupData || {})

  // Estado para recordar el estado anterior antes de un error
  const [previousState, setPreviousState] = useState<Record<string, string>>({})

  // Inicializar estados con datos reales de la base de datos
  const [statuses, setStatuses] = useState<Record<string, string>>(() => {
    const initialStatuses = Object.fromEntries(
      Object.entries(portalsConfig).map(([key, portal]) => [key, portal.status]),
    )

    // Sobrescribir con el estado real de Inmoup si existe
    if (inmoupData?.status) {
      initialStatuses['inmoup'] = inmoupData.status === 'ok' ? 'published' : inmoupData.status
    }

    return initialStatuses
  })
  useEffect(() => {
    console.log('inmoupData cambió: ', localInmoupData)
  }, [localInmoupData])
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

  // Función específica para publicar en Inmoup
  const publishToInmoup = async () => {
    try {
      // Guardar el estado actual antes de empezar la publicación
      setPreviousState((prev) => ({ ...prev, inmoup: statuses['inmoup'] }))

      setLoading((prev) => ({ ...prev, inmoup: true }))

      // Limpiar datos del propietario para evitar referencias circulares
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

      // Enviar datos ya mapeados al endpoint
      const response = await fetch('/api/portals/inmoup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyData: propertyData, // Enviar datos ya mapeados
          ownerData: cleanOwnerData,
          images: images || [], // Enviar array de imágenes
          propertyId: propertyId, // Enviar ID de la propiedad
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()

        // Si el backend envía updatedInmoupData en el error, usarlo
        if (errorData.updatedInmoupData) {
          setStatuses((prev) => ({ ...prev, inmoup: errorData.updatedInmoupData.status }))
          setLocalInmoupData({
            name: errorData.updatedInmoupData.name,
            uploaded: errorData.updatedInmoupData.uploaded,
            externalId: errorData.updatedInmoupData.externalId,
            externalUrl: errorData.updatedInmoupData.externalUrl,
            status: errorData.updatedInmoupData.status,
            lastSyncAt: errorData.updatedInmoupData.lastSyncAt,
            lastError: errorData.updatedInmoupData.lastError,
          })
          console.log('Datos de error actualizados desde backend:', errorData.updatedInmoupData)
          console.log('lastError actualizado:', errorData.updatedInmoupData.lastError)
        } else {
          // Si no hay updatedInmoupData, actualizar manualmente el estado
          setStatuses((prev) => ({ ...prev, inmoup: 'error' }))
          setLocalInmoupData({
            ...localInmoupData,
            status: 'error',
            lastError: errorData.error || 'Error al publicar en Inmoup',
            lastSyncAt: new Date().toISOString(),
          })
          console.log('Error actualizado manualmente:', errorData.error)
        }

        throw new Error(errorData.error || 'Error al publicar en Inmoup')
      }

      const result = await response.json()

      // Usar los datos actualizados que vienen del backend
      if (result.updatedInmoupData) {
        const updatedData = result.updatedInmoupData

        // Actualizar el estado del portal
        setStatuses((prev) => ({ ...prev, inmoup: updatedData.status }))

        // Limpiar el estado anterior si la operación fue exitosa
        setPreviousState((prev) => ({ ...prev, inmoup: '' }))

        // Actualizar los datos locales de Inmoup con los datos del backend
        setLocalInmoupData({
          name: updatedData.name,
          uploaded: updatedData.uploaded,
          externalId: updatedData.externalId,
          externalUrl: updatedData.externalUrl,
          status: updatedData.status,
          lastSyncAt: updatedData.lastSyncAt,
          lastError: undefined, // Limpiar error en operación exitosa
        })

        console.log('Datos de Inmoup actualizados desde backend:', updatedData)
      } else {
        // Fallback al método anterior si no viene updatedInmoupData
        setStatuses((prev) => ({ ...prev, inmoup: 'ok' }))

        // Limpiar el estado anterior si la operación fue exitosa
        setPreviousState((prev) => ({ ...prev, inmoup: '' }))

        // Limpiar lastError en operación exitosa
        setLocalInmoupData({
          ...localInmoupData,
          lastError: undefined,
          lastSyncAt: new Date().toISOString(),
        })

        console.log('Usando fallback - respuesta completa:', result)
      }

      console.log('Propiedad publicada exitosamente en Inmoup:', result)
    } catch (error) {
      console.error('Error publicando en Inmoup:', error)

      // Actualizar siempre el estado de error, ya sea que venga del backend o del catch
      setStatuses((prev) => ({ ...prev, inmoup: 'error' }))

      // Solo actualizar lastError si no se actualizó desde el backend
      if (!localInmoupData?.lastError || localInmoupData.lastError === undefined) {
        setLocalInmoupData({
          ...localInmoupData,
          status: 'error',
          lastError: error instanceof Error ? error.message : 'Error desconocido',
          lastSyncAt: new Date().toISOString(),
        })
      }
    } finally {
      setLoading((prev) => ({ ...prev, inmoup: false }))
    }
  }

  // Función específica para sincronizar en Inmoup
  const syncToInmoup = async () => {
    try {
      // Guardar el estado actual antes de empezar la sincronización
      setPreviousState((prev) => ({ ...prev, inmoup: statuses['inmoup'] }))

      setLoading((prev) => ({ ...prev, inmoup: true }))

      // Limpiar datos del propietario para evitar referencias circulares
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

      // Enviar datos para sincronización al endpoint
      const response = await fetch('/api/portals/inmoup', {
        method: 'PUT', // Usar PUT para sincronización/actualización
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyData: propertyData,
          ownerData: cleanOwnerData,
          images: images || [],
          propertyId: propertyId,
          action: 'sync', // Indicar que es una sincronización
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()

        // Si el backend envía updatedInmoupData en el error, usarlo SOLO para el lastError
        if (errorData.updatedInmoupData) {
          setLocalInmoupData({
            ...localInmoupData,
            lastError: errorData.updatedInmoupData.lastError || errorData.error,
            lastSyncAt: errorData.updatedInmoupData.lastSyncAt || new Date().toISOString(),
          })
          console.log(
            'Error de sincronización actualizado desde backend:',
            errorData.updatedInmoupData.lastError,
          )
        } else {
          // Si no hay updatedInmoupData, solo actualizar el lastError local
          setLocalInmoupData({
            ...localInmoupData,
            lastError: errorData.error || 'Error al sincronizar en Inmoup',
            lastSyncAt: new Date().toISOString(),
          })
        }

        throw new Error(errorData.error || 'Error al sincronizar en Inmoup')
      }

      const result = await response.json()

      // Usar los datos actualizados que vienen del backend
      if (result.updatedInmoupData) {
        const updatedData = result.updatedInmoupData

        // Actualizar el estado del portal
        setStatuses((prev) => ({ ...prev, inmoup: updatedData.status }))

        // Limpiar el estado anterior si la operación fue exitosa
        setPreviousState((prev) => ({ ...prev, inmoup: '' }))

        // Actualizar los datos locales de Inmoup con los datos del backend
        setLocalInmoupData({
          name: updatedData.name,
          uploaded: updatedData.uploaded,
          externalId: updatedData.externalId,
          externalUrl: updatedData.externalUrl,
          status: updatedData.status,
          lastSyncAt: updatedData.lastSyncAt,
          lastError: undefined, // Limpiar error en operación exitosa
        })

        console.log('Datos de Inmoup sincronizados desde backend:', updatedData)
      } else {
        // Fallback al método anterior si no viene updatedInmoupData
        setStatuses((prev) => ({ ...prev, inmoup: 'ok' }))

        // Limpiar el estado anterior si la operación fue exitosa
        setPreviousState((prev) => ({ ...prev, inmoup: '' }))

        // Limpiar lastError en operación exitosa
        setLocalInmoupData({
          ...localInmoupData,
          lastError: undefined,
          lastSyncAt: new Date().toISOString(),
        })

        console.log('Usando fallback - respuesta completa de sincronización:', result)
      }

      console.log('Propiedad sincronizada exitosamente en Inmoup:', result)
    } catch (error) {
      console.error('Error sincronizando en Inmoup:', error)

      // Para errores de sincronización, mantener el estado actual y solo actualizar el lastError
      setLocalInmoupData({
        ...localInmoupData,
        lastError: error instanceof Error ? error.message : 'Error desconocido',
        lastSyncAt: new Date().toISOString(),
      })
    } finally {
      setLoading((prev) => ({ ...prev, inmoup: false }))
    }
  }

  // Función específica para eliminar de Inmoup
  const deleteFromInmoup = async () => {
    try {
      // Guardar el estado actual antes de empezar la eliminación
      setPreviousState((prev) => ({ ...prev, inmoup: statuses['inmoup'] }))

      setLoading((prev) => ({ ...prev, inmoup: true }))

      // Enviar solicitud de eliminación al endpoint
      const response = await fetch('/api/portals/inmoup', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId: propertyId,
          action: 'delete',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()

        // Si el backend envía updatedInmoupData en el error, usarlo SOLO para el lastError
        if (errorData.updatedInmoupData) {
          setLocalInmoupData({
            ...localInmoupData,
            lastError: errorData.updatedInmoupData.lastError || errorData.error,
            lastSyncAt: errorData.updatedInmoupData.lastSyncAt || new Date().toISOString(),
          })
          console.log(
            'Error de eliminación actualizado desde backend:',
            errorData.updatedInmoupData.lastError,
          )
        } else {
          // Si no hay updatedInmoupData, solo actualizar el lastError local
          setLocalInmoupData({
            ...localInmoupData,
            lastError: errorData.error || 'Error al eliminar de Inmoup',
            lastSyncAt: new Date().toISOString(),
          })
        }

        throw new Error(errorData.error || 'Error al eliminar de Inmoup')
      }

      const result = await response.json()

      // Usar los datos actualizados que vienen del backend
      if (result.updatedInmoupData) {
        const updatedData = result.updatedInmoupData

        // Actualizar el estado del portal
        setStatuses((prev) => ({ ...prev, inmoup: updatedData.status }))

        // Limpiar el estado anterior si la operación fue exitosa
        setPreviousState((prev) => ({ ...prev, inmoup: '' }))

        // Actualizar los datos locales de Inmoup con los datos del backend
        setLocalInmoupData({
          name: updatedData.name,
          uploaded: updatedData.uploaded,
          externalId: updatedData.externalId,
          externalUrl: updatedData.externalUrl,
          status: updatedData.status,
          lastSyncAt: updatedData.lastSyncAt,
          lastError: undefined, // Limpiar error en operación exitosa
        })

        console.log('Datos de Inmoup después de eliminación:', updatedData)
      } else {
        // Fallback - marcar como no publicado
        setStatuses((prev) => ({ ...prev, inmoup: 'not_published' }))

        // Limpiar el estado anterior si la operación fue exitosa
        setPreviousState((prev) => ({ ...prev, inmoup: '' }))

        setLocalInmoupData({
          ...localInmoupData,
          uploaded: false,
          externalId: undefined,
          externalUrl: undefined,
          status: 'not_published',
          lastSyncAt: new Date().toISOString(),
          lastError: undefined,
        })
        console.log('Usando fallback para eliminación - respuesta completa:', result)
      }

      console.log('Propiedad eliminada exitosamente de Inmoup:', result)
    } catch (error) {
      console.error('Error eliminando de Inmoup:', error)

      // Para errores de eliminación, mantener el estado actual y solo actualizar el lastError
      setLocalInmoupData({
        ...localInmoupData,
        lastError: error instanceof Error ? error.message : 'Error desconocido',
        lastSyncAt: new Date().toISOString(),
      })
    } finally {
      setLoading((prev) => ({ ...prev, inmoup: false }))
    }
  }

  // Función principal para manejar publicaciones
  const handlePublish = async (portalKey: string) => {
    if (portalKey === 'inmoup') {
      const currentStatus = statuses[portalKey]

      // Si está desactualizado, sincronizar; si no, publicar
      if (currentStatus === 'desactualizado') {
        await syncToInmoup()
      } else {
        await publishToInmoup()
      }
    } else {
      console.log(`Portal ${portalKey} no está configurado`)
    }
  }

  // Función para renderizar el botón de eliminar de forma condicional
  const renderDeleteButton = (portalKey: string) => {
    const currentStatus = statuses[portalKey]
    const isLoading = loading[portalKey]

    // El botón eliminar debe aparecer solo si:
    // 1. Para Inmoup: El campo uploaded es true
    // 2. No está cargando/procesando
    let shouldShowDelete = false

    if (portalKey === 'inmoup') {
      shouldShowDelete = localInmoupData?.uploaded === true && !isLoading
    } else {
      // Para otros portales, usar la lógica anterior
      shouldShowDelete =
        (currentStatus === 'published' ||
          currentStatus === 'ok' ||
          currentStatus === 'desactualizado' ||
          currentStatus === 'error') &&
        !isLoading
    }

    if (!shouldShowDelete) {
      return null
    }

    return (
      <button
        className="property-details__btn property-details__btn--error property-details__btn--small"
        onClick={() => {
          if (portalKey === 'inmoup') {
            deleteFromInmoup()
          } else {
            console.log(`Eliminar de ${portalKey} no está configurado`)
          }
        }}
        disabled={isLoading}
      >
        {isLoading ? 'Eliminando...' : 'Eliminar'}
      </button>
    )
  }

  // Función para renderizar el botón según el estado
  const renderPortalButton = (portalKey: string, portal: PortalConfig) => {
    const currentStatus = statuses[portalKey]
    const isLoading = loading[portalKey]

    // Determinar el texto y funcionalidad del botón según el estado
    let buttonText = ''
    let buttonVariant = 'primary'
    let isDisabled = false
    let onClick = () => handlePublish(portalKey)

    if (isLoading || currentStatus === 'queued') {
      buttonText = 'Procesando...'
      buttonVariant = 'pending'
      isDisabled = true
    } else if (currentStatus === 'published' || currentStatus === 'ok') {
      if (portal.externalUrl) {
        // Si está publicado y tiene URL, mostrar como enlace
        return (
          <a
            href={portal.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="property-details__btn property-details__btn--success property-details__btn--small"
          >
            Ver en Portal
          </a>
        )
      } else {
        buttonText = 'Ver en Portal'
        buttonVariant = 'success'
        isDisabled = true // Sin URL no se puede ver
      }
    } else if (currentStatus === 'error') {
      // En caso de error, determinar el botón según el estado anterior
      const prevState = previousState[portalKey]
      if (prevState === 'desactualizado') {
        buttonText = 'Sincronizar'
        buttonVariant = 'warning'
      } else if (prevState === 'published' || prevState === 'ok') {
        buttonText = 'Reintentar'
        buttonVariant = 'primary'
      } else {
        buttonText = 'Publicar'
        buttonVariant = 'primary'
      }
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

  // Función para obtener el mensaje explicativo según el estado
  const getStatusMessage = (portalKey: string, portal: PortalConfig) => {
    const currentStatus = statuses[portalKey]

    switch (currentStatus) {
      case 'desactualizado':
        return (
          <div className="property-details__portal-status-message property-details__portal-status-message--warning">
            💡 <strong>Desactualizado:</strong> La propiedad fue modificada. Haz clic en
            "Sincronizar" para subir las modificaciones al portal.
          </div>
        )
      case 'error':
        // Obtener el error específico del backend para Inmoup
        let errorMessage = 'Hubo un problema al procesar la solicitud. Intenta nuevamente.'
        let showDuplicatePropertyMessage = false

        if (portalKey === 'inmoup' && localInmoupData?.lastError) {
          errorMessage = localInmoupData.lastError

          // Detectar si el error es por propiedad duplicada
          if (errorMessage.toLowerCase().includes('la propiedad ya existe en inmoup')) {
            showDuplicatePropertyMessage = true
          }
        }

        return (
          <>
            <div className="property-details__portal-status-message property-details__portal-status-message--error">
              ⚠️ <strong>Error:</strong> {errorMessage}
            </div>
            {showDuplicatePropertyMessage && (
              <div className="property-details__portal-status-message property-details__portal-status-message--warning">
                💡 <strong>Sugerencia:</strong> Esta propiedad ya existe en Inmoup. Debes probar
                cambiando el domicilio para crear una nueva publicación.
              </div>
            )}
          </>
        )
      case 'queued':
        return (
          <div className="property-details__portal-status-message property-details__portal-status-message--info">
            ⏳ <strong>En cola:</strong> La publicación está siendo procesada. Por favor espera.
          </div>
        )
      case 'published':
      case 'ok':
        if (portal.externalUrl) {
          return (
            <div className="property-details__portal-status-message property-details__portal-status-message--success">
              ✅ <strong>Publicado:</strong> La propiedad está activa en el portal.
            </div>
          )
        }
        break
      default:
        return (
          <div className="property-details__portal-status-message property-details__portal-status-message--neutral">
            📤 <strong>No publicado:</strong> Esta propiedad aún no ha sido publicada en este
            portal.
          </div>
        )
    }
    return null
  }

  return (
    <div className="property-details__portals-content">
      <div className="property-details__portals-header">
        <h3 className="property-details__portals-title">Gestión de Portales</h3>
        <div className="property-details__portals-actions">
          <button className="property-details__btn property-details__btn--primary">
            Publicar en todos
          </button>
        </div>
      </div>

      <div className="property-details__portals-list">
        {Object.entries(portalsConfig).map(([portalKey, portal]) => (
          <div key={portalKey} className="property-details__portal-carditem">
            <div className="property-details__portal-name">
              <span>{portal.name}</span>
              {getStatusBadge(statuses[portalKey])}
            </div>
            <div className="property-details__portal-item">
              <div className="property-details__portal-info">
                {/* Información adicional de Inmoup */}
                {portalKey === 'inmoup' && localInmoupData && (
                  <div className="property-details__portal-details">
                    {localInmoupData.externalId && (
                      <div className="property-details__portal-detail">
                        <strong>ID Inmoup:</strong> {localInmoupData.externalId}
                      </div>
                    )}
                    {localInmoupData.externalUrl && (
                      <div className="property-details__portal-detail">
                        <strong>URL del Portal:</strong>{' '}
                        <a
                          href={localInmoupData.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {localInmoupData.externalUrl}
                        </a>
                      </div>
                    )}
                    {localInmoupData.lastSyncAt && (
                      <div className="property-details__portal-detail">
                        <strong>Última sincronización:</strong>{' '}
                        {new Date(localInmoupData.lastSyncAt).toLocaleString('es-ES')}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="property-details__portal-actions">
                {renderPortalButton(portalKey, {
                  ...portal,
                  externalUrl:
                    portalKey === 'inmoup' ? localInmoupData?.externalUrl : portal.externalUrl,
                })}
                {renderDeleteButton(portalKey)}
              </div>
            </div>

            {/* Mensaje de estado explicativo */}
            {getStatusMessage(portalKey, {
              ...portal,
              externalUrl:
                portalKey === 'inmoup' ? localInmoupData?.externalUrl : portal.externalUrl,
            })}

            {/* Mostrar error específico solo si no se mostró en getStatusMessage */}
            {portalKey === 'inmoup' &&
              localInmoupData.lastError &&
              statuses[portalKey] !== 'error' && (
                <div className="property-details__portal-status-message property-details__portal-status-message--error">
                  ⚠️ <strong>Error:</strong> {localInmoupData.lastError}
                </div>
              )}
          </div>
        ))}
      </div>
    </div>
  )
}
