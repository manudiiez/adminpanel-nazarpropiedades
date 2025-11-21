'use client'

import React, { useState, useEffect } from 'react'
import { InmoupPortal, MercadoLibrePortal } from '../../portals'
import './styles.scss'
import MetaPortal from '@/components/portals/meta'

interface PortalData {
  name?: string
  uploaded?: boolean
  externalId?: string
  externalUrl?: string
  status?: 'queued' | 'ok' | 'published' | 'error' | 'desactualizado' | 'not_published' | 'not_sent'
  lastSyncAt?: string
  lastError?: string
}

interface MetaPortalData {
  name?: string
  uploaded?: boolean
  externalId?: string
  externalUrl?: string
  status?: 'queued' | 'ok' | 'published' | 'error' | 'not_published' | 'not_sent'
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
  const [localInmoupData, setLocalInmoupData] = useState<PortalData>({})
  const [localMercadoLibreData, setLocalMercadoLibreData] = useState<PortalData>({})
  const [localMetaData, setLocalMetaData] = useState<MetaPortalData>({})

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
        setLocalInmoupData(result.inmoup || {})
        setLocalMercadoLibreData(result.mercadolibre || {})
        setLocalMetaData(result.meta || {})
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

  // Función para actualizar datos de Inmoup desde el componente hijo
  const handleInmoupDataUpdate = (newData: PortalData) => {
    setLocalInmoupData(newData)
  }

  // Función para actualizar datos de MercadoLibre desde el componente hijo
  const handleMercadoLibreDataUpdate = (newData: PortalData) => {
    setLocalMercadoLibreData(newData)
  }

  // Función para actualizar datos de Meta desde el componente hijo
  const handleMetaDataUpdate = (newData: MetaPortalData) => {
    setLocalMetaData(newData)
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
        {propertyData?.images?.coverImage && propertyData?.images?.gallery && (
          <MetaPortal
            metaData={localMetaData}
            propertyId={propertyId}
            onDataUpdate={handleMetaDataUpdate}
            images={(() => {
              // Construir array de imágenes desde el objeto images
              const imageArray = []

              // Agregar coverImage si existe
              if (propertyData?.images?.coverImage) {
                imageArray.push(propertyData.images.coverImage)
              }

              // Agregar imágenes de gallery si existe
              if (Array.isArray(propertyData?.images?.gallery)) {
                imageArray.push(...propertyData.images.gallery)
              }

              return imageArray
            })()}
          />
        )}
      </div>
    </div>
  )
}
