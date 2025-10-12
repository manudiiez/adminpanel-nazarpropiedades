'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { InmoupPortal, MercadoLibrePortal } from '../../portals'
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
  propertyData: any
  ownerData: any
  images: any[]
  propertyId: string
  inmoupData?: PortalData
  mercadoLibreData?: PortalData
}

// Estado global para persistir datos entre renders
const globalPortalState = new Map<string, { inmoup: PortalData; mercadolibre: PortalData }>()

export default function PortalsList({
  propertyData,
  ownerData,
  images,
  propertyId,
  inmoupData,
  mercadoLibreData,
}: PortalsListProps) {
  // Usar una clave única para esta propiedad
  const stateKey = `property-${propertyId}`

  // Inicializar estado con datos del servidor o estado persistido
  const [localInmoupData, setLocalInmoupData] = useState<PortalData>(() => {
    const persistedState = globalPortalState.get(stateKey)
    return persistedState?.inmoup || inmoupData || {}
  })

  const [localMercadoLibreData, setLocalMercadoLibreData] = useState<PortalData>(() => {
    const persistedState = globalPortalState.get(stateKey)
    return persistedState?.mercadolibre || mercadoLibreData || {}
  })

  // Persistir estado en el mapa global cuando cambie
  useEffect(() => {
    globalPortalState.set(stateKey, {
      inmoup: localInmoupData,
      mercadolibre: localMercadoLibreData,
    })
  }, [localInmoupData, localMercadoLibreData, stateKey])

  // Actualizar estado local cuando lleguen nuevos datos del servidor
  useEffect(() => {
    if (inmoupData && JSON.stringify(inmoupData) !== JSON.stringify(localInmoupData)) {
      setLocalInmoupData(inmoupData)
    }
  }, [inmoupData])

  useEffect(() => {
    if (
      mercadoLibreData &&
      JSON.stringify(mercadoLibreData) !== JSON.stringify(localMercadoLibreData)
    ) {
      setLocalMercadoLibreData(mercadoLibreData)
    }
  }, [mercadoLibreData])

  // Función para actualizar datos de Inmoup desde el componente hijo
  const handleInmoupDataUpdate = (newData: PortalData) => {
    setLocalInmoupData(newData)
  }

  // Función para actualizar datos de MercadoLibre desde el componente hijo
  const handleMercadoLibreDataUpdate = (newData: PortalData) => {
    setLocalMercadoLibreData(newData)
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
        {/* Portal Inmoup */}
        <InmoupPortal
          inmoupData={localInmoupData}
          propertyData={propertyData}
          ownerData={ownerData}
          images={images}
          propertyId={propertyId}
          onDataUpdate={handleInmoupDataUpdate}
        />

        {/* Portal Mercado Libre */}
        <MercadoLibrePortal
          mercadoLibreData={localMercadoLibreData}
          propertyData={propertyData}
          ownerData={ownerData}
          images={images}
          propertyId={propertyId}
          onDataUpdate={handleMercadoLibreDataUpdate}
        />
      </div>
    </div>
  )
}
