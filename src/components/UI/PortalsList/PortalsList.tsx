'use client'

import React from 'react'
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

interface PortalsListProps {
  portalsConfig: Record<string, PortalConfig>
  propertyData: any
  ownerData: any
  images: any[]
  propertyId: string
  inmoupData?: {
    name?: string
    uploaded?: boolean
    externalId?: string
    externalUrl?: string
    status?:
      | 'queued'
      | 'ok'
      | 'published'
      | 'error'
      | 'desactualizado'
      | 'not_published'
      | 'not_sent'
    lastSyncAt?: string
    lastError?: string
  }
  mercadoLibreData?: {
    name?: string
    uploaded?: boolean
    externalId?: string
    externalUrl?: string
    status?:
      | 'queued'
      | 'ok'
      | 'published'
      | 'error'
      | 'desactualizado'
      | 'not_published'
      | 'not_sent'
    lastSyncAt?: string
    lastError?: string
  }
}

export default function PortalsList({
  propertyData,
  ownerData,
  images,
  propertyId,
  inmoupData,
  mercadoLibreData,
}: PortalsListProps) {
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
          inmoupData={inmoupData}
          propertyData={propertyData}
          ownerData={ownerData}
          images={images}
          propertyId={propertyId}
        />

        {/* Portal Mercado Libre */}
        <MercadoLibrePortal
          mercadoLibreData={mercadoLibreData}
          propertyData={propertyData}
          ownerData={ownerData}
          images={images}
          propertyId={propertyId}
        />
      </div>
    </div>
  )
}
