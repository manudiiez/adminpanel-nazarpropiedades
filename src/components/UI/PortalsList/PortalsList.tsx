'use client'

import React, { useState, useEffect } from 'react'
import { InmoupPortal, MercadoLibrePortal } from '../../portals'
import './styles.scss'

interface PortalData {
  name?: string
  uploaded?: boolean
  externalId?: string
  externalUrl?: string
  status?: 'queued' | 'ok' | 'published' | 'error' | 'desactualizado' | 'not_published' | 'not_sent'
  lastSyncAt?: string
  lastError?: string
}

interface PortalsListProps {
  propertyId: string
}

export default function PortalsList({ propertyId }: PortalsListProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [propertyData, setPropertyData] = useState<any>(null)
  const [ownerData, setOwnerData] = useState<any>(null)
  const [images, setImages] = useState<any[]>([])
  const [localInmoupData, setLocalInmoupData] = useState<PortalData>({})
  const [localMercadoLibreData, setLocalMercadoLibreData] = useState<PortalData>({})

  // Fetch de datos de la propiedad al montar el componente
  useEffect(() => {
    const fetchPropertyData = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/propiedades/${propertyId}`)

        if (!response.ok) {
          throw new Error('Error al cargar los datos de la propiedad')
        }

        const result = await response.json()

        console.log('Datos de propiedad cargados:', result)

        // Actualizar estados con los datos obtenidos
        setPropertyData(result)
        setOwnerData(result.ownerData)
        setImages(result.images)
        setLocalInmoupData(result.inmoup || {})
        setLocalMercadoLibreData(result.mercadolibre || {})
      } catch (err) {
        console.error('Error fetching property data:', err)
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    if (propertyId) {
      fetchPropertyData()
    }
  }, [propertyId])

  // Función para refrescar los datos del portal
  const refreshPortalData = async () => {
    try {
      const response = await fetch(`/api/properties/${propertyId}`)

      if (response.ok) {
        const result = await response.json()
        setPropertyData(result.property)
        setLocalInmoupData(result.property?.inmoup || {})
        setLocalMercadoLibreData(result.property?.mercadolibre || {})
        console.log('Datos de portales actualizados')
      }
    } catch (err) {
      console.error('Error refrescando datos de portales:', err)
    }
  }

  // Función para actualizar datos de Inmoup desde el componente hijo
  const handleInmoupDataUpdate = (newData: PortalData) => {
    setLocalInmoupData(newData)
  }

  // Función para actualizar datos de MercadoLibre desde el componente hijo
  const handleMercadoLibreDataUpdate = (newData: PortalData) => {
    setLocalMercadoLibreData(newData)
  }

  if (loading) {
    return (
      <div className="property-details__portals-content">
        <div className="property-details__portals-header">
          <h3 className="property-details__portals-title">Gestión de Portales</h3>
        </div>
        <div className="property-details__portals-loading">
          <p>Cargando datos de portales...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="property-details__portals-content">
        <div className="property-details__portals-header">
          <h3 className="property-details__portals-title">Gestión de Portales</h3>
        </div>
        <div className="property-details__portals-error">
          <p>⚠️ Error: {error}</p>
          <button
            className="property-details__btn property-details__btn--primary"
            onClick={() => window.location.reload()}
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (!propertyData) {
    return (
      <div className="property-details__portals-content">
        <div className="property-details__portals-header">
          <h3 className="property-details__portals-title">Gestión de Portales</h3>
        </div>
        <div className="property-details__portals-error">
          <p>No se encontraron datos de la propiedad</p>
        </div>
      </div>
    )
  }

  return (
    <div className="property-details__portals-content">
      <div className="property-details__portals-header">
        <h3 className="property-details__portals-title">Gestión de Portales</h3>
        <div className="property-details__portals-actions">
          {/* <button
            className="property-details__btn property-details__btn--secondary property-details__btn--small"
            onClick={refreshPortalData}
          >
            🔄 Actualizar
          </button> */}
        </div>
      </div>
      <div className="property-details__portals-list">
        {/* Portal Inmoup */}
        <InmoupPortal
          inmoupData={localInmoupData}
          propertyId={propertyId}
          onDataUpdate={handleInmoupDataUpdate}
        />

        {/* Portal Mercado Libre */}
        {propertyData?.images?.coverImage && propertyData?.images?.gallery && (
          <MercadoLibrePortal
            mercadoLibreData={localMercadoLibreData}
            propertyId={propertyId}
            onDataUpdate={handleMercadoLibreDataUpdate}
          />
        )}
      </div>
    </div>
  )
}
