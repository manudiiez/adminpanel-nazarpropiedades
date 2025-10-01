import type { AdminViewServerProps } from 'payload'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { fechaLarga, formatPrice } from '@/utils/formatValues'
import { Gutter } from '@payloadcms/ui'
import './styles.scss'
import ClientDetailsClient from './ClientDetails'

async function fetchClientProperties(clientId: string | number) {
  try {
    const payload = await getPayload({ config })

    const result = await payload.find({
      collection: 'propiedades',
      where: {
        and: [
          {
            owner: {
              equals: clientId,
            },
          },
          {
            status: {
              equals: 'activa',
            },
          },
        ],
      },
    })

    return result.docs || []
  } catch (error) {
    console.error('Error fetching published properties:', error)
    return []
  }
}

async function fetchSoldProperties(clientId: string | number) {
  try {
    const payload = await getPayload({ config })

    const result = await payload.find({
      collection: 'contratos',
      where: {
        and: [
          {
            owner: {
              equals: clientId,
            },
          },
          {
            type: {
              equals: 'venta',
            },
          },
        ],
      },
    })

    return (
      result.docs?.map((contract: any) => ({
        ...contract.property,
        clientName: contract.client.fullname,
        clientNumber: contract.client.phone,
        soldPrice: contract.realPrice,
        soldCurrency: contract.realCurrency,
        fee: contract.fee,
        feeCurrency: contract.feeCurrency,
        propertyPublishedDate: contract.propertyPublishedDate,
        signDate: contract.signDate,
        contractId: contract.id,
        clientId: contract.client.id,
      })) || []
    )
  } catch (error) {
    console.error('Error fetching sold properties:', error)
    return []
  }
}

async function fetchRentedProperties(clientId: string | number) {
  try {
    const payload = await getPayload({ config })

    const result = await payload.find({
      collection: 'contratos',
      where: {
        and: [
          {
            owner: {
              equals: clientId,
            },
          },
          {
            type: {
              equals: 'alquiler',
            },
          },
        ],
      },
    })

    return (
      result.docs?.map((contract: any) => ({
        ...contract.property,
        clientName: contract.client.fullname,
        clientNumber: contract.client.phone,
        rentPrice: contract.realPrice,
        rentCurrency: contract.realCurrency,
        fee: contract.fee,
        feeCurrency: contract.feeCurrency,
        propertyPublishedDate: contract.propertyPublishedDate,
        startDate: contract.startDate,
        endDate: contract.endDate,
        contractId: contract.id,
        clientId: contract.client.id,
      })) || []
    )
  } catch (error) {
    console.error('Error fetching rented properties:', error)
    return []
  }
}

async function fetchPurchasedProperties(clientId: string | number) {
  try {
    const payload = await getPayload({ config })

    const result = await payload.find({
      collection: 'contratos',
      where: {
        and: [
          {
            client: {
              equals: clientId,
            },
          },
          {
            type: {
              equals: 'venta',
            },
          },
        ],
      },
    })

    return (
      result.docs?.map((contract: any) => ({
        ...contract.property,
        clientName: contract.owner.fullname,
        clientNumber: contract.owner.phone,
        buyPrice: contract.realPrice,
        buyCurrency: contract.realCurrency,
        fee: contract.fee,
        feeCurrency: contract.feeCurrency,
        signDate: contract.signDate,
        contractId: contract.id,
        ownerId: contract.owner.id,
      })) || []
    )
  } catch (error) {
    console.error('Error fetching purchased properties:', error)
    return []
  }
}

export default async function ClientDetails(props: AdminViewServerProps) {
  // Extraer el ID del cliente desde los parámetros de la URL o docID
  const clientId = props.docID || (props.params?.segments?.[2] as string | number)

  if (!clientId) {
    return (
      <div className="client-details">
        <div className="client-details__container">
          <Gutter>
            <div className="client-details__error">
              <p>No se pudo obtener el ID del cliente</p>
            </div>
          </Gutter>
        </div>
      </div>
    )
  }

  // Obtener los datos del cliente desde props
  const clientData = (props as any).formState
  if (!clientData) {
    return (
      <div className="client-details">
        <div className="client-details__container">
          <Gutter>
            <div className="client-details__error">
              <p>No se pudieron cargar los datos del cliente</p>
            </div>
          </Gutter>
        </div>
      </div>
    )
  }

  // Obtener todas las propiedades del cliente
  const [clientProperties, soldProperties, rentedProperties, purchasedProperties] =
    await Promise.all([
      fetchClientProperties(clientId),
      fetchSoldProperties(clientId),
      fetchRentedProperties(clientId),
      fetchPurchasedProperties(clientId),
    ])

  const calculateTotalCommissions = () => {
    let totalUSD = 0
    let totalARS = 0

    // Sumar comisiones de propiedades vendidas
    soldProperties.forEach((prop: any) => {
      if (prop.fee && prop.feeCurrency) {
        if (prop.feeCurrency === 'USD') {
          totalUSD += prop.fee
        } else if (prop.feeCurrency === 'ARS') {
          totalARS += prop.fee
        }
      }
    })

    // Sumar comisiones de propiedades alquiladas
    rentedProperties.forEach((prop: any) => {
      if (prop.fee && prop.feeCurrency) {
        if (prop.feeCurrency === 'USD') {
          totalUSD += prop.fee
        } else if (prop.feeCurrency === 'ARS') {
          totalARS += prop.fee
        }
      }
    })

    // Sumar comisiones de propiedades compradas
    purchasedProperties.forEach((prop: any) => {
      if (prop.fee && prop.feeCurrency) {
        if (prop.feeCurrency === 'USD') {
          totalUSD += prop.fee
        } else if (prop.feeCurrency === 'ARS') {
          totalARS += prop.fee
        }
      }
    })

    return { USD: totalUSD, ARS: totalARS }
  }

  const calculateSoldCommissions = () => {
    let totalUSD = 0
    let totalARS = 0

    soldProperties.forEach((prop: any) => {
      if (prop.fee && prop.feeCurrency) {
        if (prop.feeCurrency === 'USD') {
          totalUSD += prop.fee
        } else if (prop.feeCurrency === 'ARS') {
          totalARS += prop.fee
        }
      }
    })

    return { USD: totalUSD, ARS: totalARS }
  }

  const calculateRentedCommissions = () => {
    let totalUSD = 0
    let totalARS = 0

    rentedProperties.forEach((prop: any) => {
      if (prop.fee && prop.feeCurrency) {
        if (prop.feeCurrency === 'USD') {
          totalUSD += prop.fee
        } else if (prop.feeCurrency === 'ARS') {
          totalARS += prop.fee
        }
      }
    })

    return { USD: totalUSD, ARS: totalARS }
  }

  const calculatePurchasedCommissions = () => {
    let totalUSD = 0
    let totalARS = 0

    purchasedProperties.forEach((prop: any) => {
      if (prop.fee && prop.feeCurrency) {
        if (prop.feeCurrency === 'USD') {
          totalUSD += prop.fee
        } else if (prop.feeCurrency === 'ARS') {
          totalARS += prop.fee
        }
      }
    })

    return { USD: totalUSD, ARS: totalARS }
  }

  const renderCommissionValues = (commissions: { USD: number; ARS: number }) => {
    if (commissions.USD === 0 && commissions.ARS === 0) {
      return <span>USD $0</span>
    }

    return (
      <div
        style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', alignItems: 'flex-end' }}
      >
        {commissions.USD > 0 && <span>USD ${formatPrice(commissions.USD)}</span>}
        {commissions.ARS > 0 && <span>ARS ${formatPrice(commissions.ARS)}</span>}
      </div>
    )
  }

  return (
    <div className="client-details">
      <div className="client-details__container">
        {/* Métricas Principales */}
        <Gutter>
          <div className="client-details__metrics">
            <div className="client-details__metric-card client-details__metric-card--black">
              <div className="client-details__metric-card-content">
                <div className="client-details__metric-card-info">
                  <p className="client-details__metric-card-label">Ganancias Totales</p>
                  <div className="client-details__metric-card-value">
                    {(() => {
                      const totals = calculateTotalCommissions()
                      return (
                        <div className="client-details__metric-card-value-prices">
                          <span>USD ${formatPrice(totals.USD)}</span>
                          <span>ARS ${formatPrice(totals.ARS)}</span>
                        </div>
                      )
                    })()}
                  </div>
                </div>
                <div className="client-details__metric-card-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    ></path>
                  </svg>
                </div>
              </div>
            </div>

            <div className="client-details__metric-card client-details__metric-card--white">
              <div className="client-details__metric-card-content">
                <div className="client-details__metric-card-info">
                  <p className="client-details__metric-card-label">Propiedades Activas</p>
                  <p className="client-details__metric-card-value">
                    {clientProperties.length || 0}
                  </p>
                </div>
                <div className="client-details__metric-card-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    ></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="client-details__main-layout">
            {/* Columna Principal - Usar componente cliente para las tabs */}
            <ClientDetailsClient
              clientProperties={clientProperties}
              soldProperties={soldProperties}
              rentedProperties={rentedProperties}
              purchasedProperties={purchasedProperties}
            />

            {/* Columna Lateral */}
            <div className="client-details__sidebar">
              {/* Información del Cliente */}
              <div className="client-details__sidebar-card">
                <h3 className="client-details__sidebar-card-title">Información de Contacto</h3>
                <div className="client-details__sidebar-card-content">
                  <div className="client-details__sidebar-card-item">
                    <span className="client-details__sidebar-card-label">Nombre Completo</span>
                    <span className="client-details__sidebar-card-value">
                      {clientData?.fullname?.value}
                    </span>
                  </div>
                  <div className="client-details__sidebar-card-item">
                    <span className="client-details__sidebar-card-label">Teléfono</span>
                    <span className="client-details__sidebar-card-value">
                      {clientData?.phone?.value}
                    </span>
                  </div>
                  <div className="client-details__sidebar-card-item">
                    <span className="client-details__sidebar-card-label">Email</span>
                    <span className="client-details__sidebar-card-value">
                      {clientData?.email?.value || 'No hay email registrado'}
                    </span>
                  </div>

                  <div className="client-details__sidebar-card-item">
                    <span className="client-details__sidebar-card-label">DNI</span>
                    <span className="client-details__sidebar-card-value">
                      {clientData?.dni?.value || 'No hay DNI registrado'}
                    </span>
                  </div>

                  <div className="client-details__sidebar-card-item">
                    <span className="client-details__sidebar-card-label">Cliente desde</span>
                    <span className="client-details__sidebar-card-value">
                      {fechaLarga(clientData?.createdAt.value)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Resumen Financiero */}
              <div className="client-details__sidebar-card">
                <h3 className="client-details__sidebar-card-title">Resumen Financiero</h3>
                <div className="client-details__sidebar-card-content">
                  <div className="client-details__sidebar-card-item">
                    <span className="client-details__sidebar-card-label">Ventas</span>
                    <div className="client-details__sidebar-card-value">
                      {renderCommissionValues(calculateSoldCommissions())}
                    </div>
                  </div>
                  <div className="client-details__sidebar-card-item">
                    <span className="client-details__sidebar-card-label">Alquileres</span>
                    <div className="client-details__sidebar-card-value">
                      {renderCommissionValues(calculateRentedCommissions())}
                    </div>
                  </div>
                  <div className="client-details__sidebar-card-item">
                    <span className="client-details__sidebar-card-label">Compras</span>
                    <div className="client-details__sidebar-card-value">
                      {renderCommissionValues(calculatePurchasedCommissions())}
                    </div>
                  </div>
                  <div className="client-details__sidebar-card-item client-details__sidebar-card-item--total">
                    <span className="client-details__sidebar-card-label">Total</span>
                    <div className="client-details__sidebar-card-value">
                      {renderCommissionValues(calculateTotalCommissions())}
                    </div>
                  </div>
                </div>
              </div>

              {/* Acciones Rápidas */}
              <div className="client-details__sidebar-card">
                <h3 className="client-details__sidebar-card-title">Acciones Rápidas</h3>
                <div className="client-details__sidebar-card-content">
                  <button className="client-details__quick-action">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      ></path>
                    </svg>
                    Enviar Email
                  </button>
                  <button className="client-details__quick-action">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      ></path>
                    </svg>
                    Programar Llamada
                  </button>
                  <button className="client-details__quick-action">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      ></path>
                    </svg>
                    Generar Reporte
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Gutter>
      </div>
    </div>
  )
}
