'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { daysBetween, fechaCorta, formatPrice } from '@/utils/formatValues'
import { propertyLabels } from '@/utils/propertyLabels'

interface ClientDetailsProps {
  clientProperties: any[]
  soldProperties: any[]
  rentedProperties: any[]
  purchasedProperties: any[]
}

export default function ClientDetails({
  clientProperties,
  soldProperties,
  rentedProperties,
  purchasedProperties,
}: ClientDetailsProps) {
  const [currentTab, setCurrentTab] = useState<
    'publicadas' | 'vendidas' | 'alquiladas' | 'compradas'
  >('publicadas')
  const router = useRouter()

  const switchTab = (tab: 'publicadas' | 'vendidas' | 'alquiladas' | 'compradas') => {
    setCurrentTab(tab)
  }

  // Función para calcular y formatear honorarios totales
  const calculateTotalFees = (priceInfo: any) => {
    if (!priceInfo.ownerFee && !priceInfo.buyerFee) {
      return null
    }

    const ownerFee = priceInfo.ownerFee || 0
    const buyerFee = priceInfo.buyerFee || 0
    const ownerFeeCurrency = priceInfo.ownerFeeCurrency || 'USD'
    const buyerFeeCurrency = priceInfo.buyerFeeCurrency || 'USD'

    // Si ambos honorarios están en la misma moneda, sumamos
    if (ownerFeeCurrency === buyerFeeCurrency) {
      const totalFee = ownerFee + buyerFee
      return `${ownerFeeCurrency} $${formatPrice(totalFee)}`
    }

    // Si están en monedas diferentes, mostramos por separado
    const parts = []
    if (ownerFee > 0) parts.push(`${ownerFeeCurrency} $${formatPrice(ownerFee)}`)
    if (buyerFee > 0) parts.push(`${buyerFeeCurrency} $${formatPrice(buyerFee)}`)

    return parts.join(' + ')
  }

  const getCurrentProperties = () => {
    switch (currentTab) {
      case 'publicadas':
        return clientProperties
      case 'vendidas':
        return soldProperties
      case 'alquiladas':
        return rentedProperties
      case 'compradas':
        return purchasedProperties
      default:
        return []
    }
  }

  const renderPropertyCard = (property: any, type: string) => {
    let statusBadge = ''
    let id = property.id

    switch (type) {
      case 'publicadas':
        if (property._status) {
          statusBadge = property._status === 'published' ? 'active' : 'paused'
        } else {
          statusBadge = property.status === 'activa' ? 'active' : 'paused'
        }
        break
      case 'vendidas':
        statusBadge = 'sold'
        id = property.contractId
        break
      case 'alquiladas':
        statusBadge = property.status === 'published' ? 'rented' : 'paused'
        id = property.contractId
        break
      case 'compradas':
        statusBadge = 'purchased'
        id = property.contractId
        break
    }

    // Función para obtener precio según tipo de propiedad
    const getPrice = () => {
      if (type === 'vendidas') {
        return {
          currency: property.soldCurrency,
          price: property.soldPrice,
          ownerFee: property.ownerFee,
          ownerFeeCurrency: property.ownerFeeCurrency,
          buyerFee: property.buyerFee,
          buyerFeeCurrency: property.buyerFeeCurrency,
        }
      } else if (type === 'alquiladas') {
        return {
          currency: property.rentCurrency,
          price: property.rentPrice,
          ownerFee: property.ownerFee,
          ownerFeeCurrency: property.ownerFeeCurrency,
          buyerFee: property.buyerFee,
          buyerFeeCurrency: property.buyerFeeCurrency,
        }
      } else if (type === 'compradas') {
        return {
          currency: property.buyCurrency || 'USD',
          price: property.buyPrice,
          ownerFee: property.ownerFee,
          ownerFeeCurrency: property.ownerFeeCurrency,
          buyerFee: property.buyerFee,
          buyerFeeCurrency: property.buyerFeeCurrency,
        }
      } else {
        // Para propiedades publicadas
        return {
          currency: property.caracteristics?.currency,
          price: property.caracteristics?.price,
        }
      }
    }

    const priceInfo = getPrice()

    // Obtener días en mercado según el tipo
    let daysOnMarket = 0
    if (type === 'publicadas') {
      daysOnMarket = property.daysOnMarket || 0
    } else if (type === 'vendidas') {
      daysOnMarket = property.daysOnMarket || 0
    } else if (type === 'compradas') {
      if (property.purchaseDate) {
        daysOnMarket = Math.ceil(
          (new Date().getTime() - new Date(property.purchaseDate).getTime()) /
            (1000 * 60 * 60 * 24),
        )
      }
    } else if (type === 'alquiladas') {
      if (property.startDate) {
        daysOnMarket = Math.ceil(
          (new Date().getTime() - new Date(property.startDate).getTime()) / (1000 * 60 * 60 * 24),
        )
      }
    }

    return (
      <div key={id} className="client-details__property-card">
        {/* Layout responsive: imagen arriba en mobile, al costado en desktop */}
        <div className="client-details__property-card-layout">
          {/* Imagen de la propiedad */}
          <div className="client-details__property-card-image">
            <div className="client-details__property-card-placeholder">
              {property.images?.coverImage?.url ? (
                <img src={property.images.coverImage.url} alt="" />
              ) : (
                <div className="placeholder-image">Sin imagen</div>
              )}
            </div>
          </div>

          {/* Contenido de la tarjeta */}
          <div className="client-details__property-card-content">
            <div className="client-details__property-card-header">
              <div className="client-details__property-card-badges">
                <span
                  className={`client-details__property-badge client-details__property-badge--${statusBadge}`}
                >
                  {statusBadge === 'active'
                    ? 'Publicada'
                    : statusBadge === 'sold'
                      ? 'Vendida'
                      : statusBadge === 'rented'
                        ? 'Alquilada'
                        : statusBadge === 'purchased'
                          ? 'Comprada'
                          : 'Pausada'}
                </span>
                <span className="client-details__property-type-badge">
                  {propertyLabels.type(property.classification?.type)}
                </span>
              </div>

              <h3 className="client-details__property-card-title">{property.title}</h3>
              <p className="client-details__property-card-address">{property.ubication?.address}</p>

              {/* Precio principal */}
              <div className="client-details__property-card-price">
                <span className="client-details__property-card-price-value">
                  {propertyLabels.currency(priceInfo.currency)} ${formatPrice(priceInfo.price)}
                </span>
                {type === 'alquiladas' && (
                  <span className="client-details__property-card-price-period">/ mes</span>
                )}
                {(type === 'vendidas' || type === 'compradas' || type === 'alquiladas') && (
                  <span className="client-details__property-card-price-original">
                    Honorarios: {calculateTotalFees(priceInfo) || 'No disponible'}
                  </span>
                )}
              </div>
            </div>

            {/* Características de la propiedad */}
            <div className="client-details__property-card-features">
              {property.environments?.bedrooms && (
                <div className="client-details__property-feature">
                  <div className="client-details__property-feature-value">
                    {property.environments.bedrooms}
                  </div>
                  <div className="client-details__property-feature-label">Hab.</div>
                </div>
              )}
              {property.environments?.bathrooms && (
                <div className="client-details__property-feature">
                  <div className="client-details__property-feature-value">
                    {property.environments.bathrooms}
                  </div>
                  <div className="client-details__property-feature-label">Baños</div>
                </div>
              )}
              {property.caracteristics?.totalArea && (
                <div className="client-details__property-feature">
                  <div className="client-details__property-feature-value">
                    {property.caracteristics.totalArea}
                  </div>
                  <div className="client-details__property-feature-label">m² totales</div>
                </div>
              )}
              {property.caracteristics?.coveredArea && (
                <div className="client-details__property-feature">
                  <div className="client-details__property-feature-value">
                    {property.caracteristics.coveredArea}
                  </div>
                  <div className="client-details__property-feature-label">m² cubiertos</div>
                </div>
              )}
              {property.environments?.garages && (
                <div className="client-details__property-feature">
                  <div className="client-details__property-feature-value">
                    {property.environments.garages}
                  </div>
                  <div className="client-details__property-feature-label">Cocheras</div>
                </div>
              )}
              {property.environments?.furnished && (
                <div className="client-details__property-feature">
                  <div className="client-details__property-feature-value">
                    {property.environments.furnished ? 'Si' : 'No'}
                  </div>
                  <div className="client-details__property-feature-label">Amoblado</div>
                </div>
              )}
            </div>

            {/* Información adicional según tipo */}
            {type === 'vendidas' && (
              <div className="client-details__property-card-extra">
                <div className="client-details__property-extra-item">
                  <span>Comprador:</span> {property.clientName || 'No disponible'}
                  {'  ---  '}
                  <span>Numero:</span> {property.clientNumber || 'No disponible'}
                </div>
                <div className="client-details__property-extra-item">
                  <span>Fecha venta:</span>{' '}
                  {property.signDate ? fechaCorta(property.signDate) : 'No disponible'}
                </div>
                <div className="client-details__property-extra-item">
                  <span>Días en mercado:</span>{' '}
                  {daysBetween(property.propertyPublishedDate, property.signDate)} días
                </div>
              </div>
            )}

            {type === 'alquiladas' && (
              <div className="client-details__property-card-extra">
                <div className="client-details__property-extra-item">
                  <span>Inquilino:</span> {property.clientName}
                  {'  ---  '}
                  <span>Numero:</span> {property.clientNumber || 'No disponible'}
                </div>
                <div className="client-details__property-extra-item">
                  <span>Inicio:</span>{' '}
                  {property.startDate ? fechaCorta(property.startDate) : 'No disponible'}
                </div>
                <div className="client-details__property-extra-item">
                  <span>Vencimiento:</span>{' '}
                  {property.endDate ? fechaCorta(property.endDate) : 'No disponible'}
                </div>
              </div>
            )}

            {type === 'compradas' && (
              <div className="client-details__property-card-extra">
                <div className="client-details__property-extra-item">
                  <span>Vendedor:</span> {property.owner?.fullname || property.clientName}
                </div>
                <div className="client-details__property-extra-item">
                  <span>Fecha compra:</span>{' '}
                  {property.signDate ? fechaCorta(property.signDate) : 'No disponible'}
                </div>
              </div>
            )}

            {type === 'publicadas' && (
              <div className="client-details__property-card-extra">
                <div className="client-details__property-extra-item">
                  <span>Días publicada:</span> {daysOnMarket} días
                </div>
              </div>
            )}

            {/* Acciones de la propiedad */}
            <div className="client-details__property-card-actions">
              <button
                onClick={() =>
                  router.push(`/admin/collections/propiedades/${property.id}/detalles`)
                }
                className="client-details__property-action-primary"
              >
                Ver Propiedad
              </button>
              {(type === 'vendidas' || type === 'alquiladas' || type === 'compradas') && (
                <button
                  onClick={() =>
                    router.push(`/admin/collections/contratos/${property.contractId}/detalles`)
                  }
                  className="client-details__property-action-secondary"
                >
                  Ver Contrato
                </button>
              )}

              {(type === 'vendidas' || type === 'alquiladas') && (
                <button
                  onClick={() =>
                    router.push(`/admin/collections/clientes/${property.clientId}/detalles`)
                  }
                  className="client-details__property-action-secondary"
                >
                  {type === 'vendidas' ? 'Contactar Comprador' : 'Contactar Inquilino'}
                </button>
              )}

              {type === 'compradas' && (
                <button
                  onClick={() =>
                    router.push(`/admin/collections/clientes/${property.ownerId}/detalles`)
                  }
                  className="client-details__property-action-secondary"
                >
                  Contactar vendedor
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentProperties = getCurrentProperties()

  return (
    <div className="client-details__main-column">
      {/* Tabs de Navegación */}
      <div className="client-details__tabs-container">
        <div className="client-details__tabs-header">
          <h2 className="client-details__tabs-title">Propiedades del Cliente</h2>
          <div className="client-details__tabs-nav">
            <button
              onClick={() => switchTab('publicadas')}
              className={`client-details__tab-button ${currentTab === 'publicadas' ? 'client-details__tab-button--active' : ''}`}
            >
              Publicadas ({clientProperties.length || 0})
            </button>
            <button
              onClick={() => switchTab('vendidas')}
              className={`client-details__tab-button ${currentTab === 'vendidas' ? 'client-details__tab-button--active' : ''}`}
            >
              Vendidas ({soldProperties.length || 0})
            </button>
            <button
              onClick={() => switchTab('alquiladas')}
              className={`client-details__tab-button ${currentTab === 'alquiladas' ? 'client-details__tab-button--active' : ''}`}
            >
              Alquiladas ({rentedProperties.length || 0})
            </button>
            <button
              onClick={() => switchTab('compradas')}
              className={`client-details__tab-button ${currentTab === 'compradas' ? 'client-details__tab-button--active' : ''}`}
            >
              Compradas ({purchasedProperties.length || 0})
            </button>
          </div>
        </div>
      </div>

      {/* Contenido de Propiedades */}
      <div className="client-details__properties-grid">
        {currentProperties.length === 0 ? (
          <div className="client-details__empty-state">
            <svg
              className="client-details__empty-state-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              ></path>
            </svg>
            <h3 className="client-details__empty-state-title">No hay propiedades</h3>
            <p className="client-details__empty-state-description">
              No se encontraron propiedades en esta categoría.
            </p>
          </div>
        ) : (
          currentProperties.map((property: any) => renderPropertyCard(property, currentTab))
        )}
      </div>
    </div>
  )
}
