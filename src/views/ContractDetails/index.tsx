import type { AdminViewServerProps } from 'payload'
import { getPayload } from 'payload'
import config from '@/payload.config'

import { calculateFee, daysBetween, fechaLarga, formatPrice } from '@/utils/formatValues'
import { Gutter } from '@payloadcms/ui'
import { propertyLabels } from '@/utils/propertyLabels'
import { ContractDetailsClient } from './ContractDetailsClient'
import './styles.scss'

interface PageProps {
  params: { segments: string[] }
}

// Función para obtener datos de la propiedad
async function getPropertyData(propertyId: string | number) {
  try {
    const payload = await getPayload({ config })

    const propertyData = await payload.findByID({
      collection: 'propiedades',
      id: propertyId,
    })
    return propertyData
  } catch (error) {
    console.log('Error al obtener datos de la propiedad:', error)
    return null
  }
}

// Función para obtener datos del cliente
async function getClientData(clientId: string | number) {
  try {
    const payload = await getPayload({ config })

    const clientData = await payload.findByID({
      collection: 'clientes',
      id: clientId,
    })
    return clientData
  } catch (error) {
    console.log('Error al obtener datos del cliente:', error)
    return null
  }
}

// Función para obtener datos del propietario
async function getOwnerData(ownerId: string | number) {
  try {
    const payload = await getPayload({ config })

    const ownerData = await payload.findByID({
      collection: 'clientes',
      id: ownerId,
    })
    return ownerData
  } catch (error) {
    console.log('Error al obtener datos del propietario:', error)
    return null
  }
}

// Función para obtener documentos
async function getDocumentsData(documentIds: (string | number)[]) {
  try {
    const payload = await getPayload({ config })

    const documentPromises = documentIds.map(async (docId) => {
      try {
        return await payload.findByID({
          collection: 'media',
          id: docId,
        })
      } catch (error) {
        console.log(`Error al obtener documento ${docId}:`, error)
        return null
      }
    })

    const documents = await Promise.all(documentPromises)
    return documents.filter((doc) => doc !== null)
  } catch (error) {
    console.log('Error al obtener documentos:', error)
    return []
  }
}

export default async function ContractDetails(props: AdminViewServerProps & PageProps) {
  // Extraer el ID del contrato desde los parámetros
  const contractId = props.docID || (props.params?.segments?.[2] as string | number)

  // Función para calcular honorarios totales considerando diferentes monedas
  const calculateTotalFees = (contractData: any) => {
    const ownerFee = contractData.ownerFee?.value || 0
    const buyerFee = contractData.buyerFee?.value || 0
    const ownerFeeCurrency = contractData.ownerFeeCurrency?.value || 'USD'
    const buyerFeeCurrency = contractData.buyerFeeCurrency?.value || 'USD'
    const propertyCurrency = contractData.currency?.value || 'USD'

    // Si ambos honorarios están en la misma moneda, sumamos directamente
    if (ownerFeeCurrency === buyerFeeCurrency) {
      return {
        totalAmount: ownerFee + buyerFee,
        currency: ownerFeeCurrency,
        breakdown: `${ownerFeeCurrency} $${formatPrice(ownerFee + buyerFee)}`,
        isMixed: false,
        propertyCurrency,
      }
    }

    // Si están en monedas diferentes, mostramos por separado
    const parts = []
    if (ownerFee > 0) parts.push(`${ownerFeeCurrency} $${formatPrice(ownerFee)}`)
    if (buyerFee > 0) parts.push(`${buyerFeeCurrency} $${formatPrice(buyerFee)}`)

    return {
      totalAmount: ownerFee + buyerFee, // Solo para cálculos de porcentaje
      currency: ownerFeeCurrency, // Usar la del owner como principal
      breakdown: parts.join(' + '),
      isMixed: true,
      propertyCurrency,
    }
  }

  if (!contractId) {
    return (
      <div className="contract-details">
        <div className="contract-details__content">
          <Gutter>
            <div className="contract-details__error">
              <p>No se pudo obtener el ID del contrato</p>
            </div>
          </Gutter>
        </div>
      </div>
    )
  }

  // Obtener los datos del contrato desde props
  const contractData = (props as any).formState

  if (!contractData) {
    return (
      <div className="contract-details">
        <div className="contract-details__content">
          <Gutter>
            <div className="contract-details__error">
              <p>No se pudieron cargar los datos del contrato</p>
            </div>
          </Gutter>
        </div>
      </div>
    )
  }

  // Determinar el tipo de contrato
  const contractType = contractData.type?.value || 'venta'

  // Objeto con configuración específica por tipo de contrato
  const contractConfig = {
    venta: {
      feeLabel: 'Honorarios totales',
      priceLabel: 'Precio de venta',
      buyerLabel: 'Comprador',
      sellerLabel: 'Antiguo Propietario',
      startDateLabel: 'Inicio de posesión',
    },
    alquiler: {
      feeLabel: 'Honorarios totales',
      priceLabel: 'Precio de la renta',
      buyerLabel: 'Inquilino',
      sellerLabel: 'Propietario',
      startDateLabel: 'Inicio del contrato',
    },
  }

  // Obtener datos relacionados en paralelo
  const [propertyData, clientData, ownerData, documentsData] = await Promise.all([
    contractData.property?.value ? getPropertyData(contractData.property.value) : null,
    contractData.client?.value ? getClientData(contractData.client.value) : null,
    contractData.owner?.value ? getOwnerData(contractData.owner.value) : null,
    contractData.documents?.value && contractData.documents.value.length > 0
      ? getDocumentsData(contractData.documents.value)
      : [],
  ])

  return (
    <div className="contract-details">
      <div className="contract-details__content">
        <Gutter>
          <div className="contract-details__grid">
            {/* Columna Principal */}
            <div className="contract-details__main-column">
              {/* Datos del Contrato */}
              <div className="contract-details__section">
                <h2>Datos del Contrato de {contractData.type.value}</h2>
                <div className="contract-details__contract-summary">
                  <div className="contract-details__price-item">
                    <div className="contract-details__price-value">
                      {contractData.currency.value} ${formatPrice(contractData.realPrice.value)}
                    </div>
                    <div className="contract-details__price-label">
                      {contractConfig[contractType as keyof typeof contractConfig].priceLabel}
                    </div>
                  </div>
                  <div className="contract-details__price-item">
                    <div className="contract-details__price-value">
                      {/* Mostrar honorarios totales calculados */}
                      {(() => {
                        const totalFeesData = calculateTotalFees(contractData)
                        return totalFeesData.breakdown
                      })()}
                    </div>
                    <div className="contract-details__price-label">
                      {contractConfig[contractType as keyof typeof contractConfig].feeLabel}
                    </div>
                  </div>
                  <div className="contract-details__price-item">
                    <div className="contract-details__price-value">
                      {fechaLarga(contractData.signDate.value)}
                    </div>
                    <div className="contract-details__price-label">Fecha de Firma</div>
                  </div>
                </div>

                <div className="contract-details__meta-info">
                  <div className="contract-details__meta-item">
                    <span>Fecha de publicacion de la propiedad</span>
                    <p>{fechaLarga(contractData.propertyPublishedDate.value)}</p>
                  </div>
                  <div className="contract-details__meta-item">
                    <span>Tiempo en Mercado</span>
                    <p>
                      {daysBetween(
                        contractData.propertyPublishedDate.value,
                        contractData.signDate.value,
                      )}{' '}
                      dias
                    </p>
                  </div>
                  <div className="contract-details__meta-item">
                    <span>
                      {contractConfig[contractType as keyof typeof contractConfig].feeLabel}{' '}
                      {contractData.realCurrency.value}
                    </span>
                    <p>
                      {(() => {
                        const totalFeesData = calculateTotalFees(contractData)
                        const realPrice = contractData.realPrice?.value || 0

                        if (totalFeesData.isMixed) {
                          // Para monedas mixtas, mostrar porcentajes solo de las que coincidan con la propiedad
                          const ownerFee = contractData.ownerFee?.value || 0
                          const buyerFee = contractData.buyerFee?.value || 0
                          const ownerFeeCurrency = contractData.ownerFeeCurrency?.value || 'USD'
                          const buyerFeeCurrency = contractData.buyerFeeCurrency?.value || 'USD'

                          const parts = []
                          if (ownerFee > 0 && ownerFeeCurrency === totalFeesData.propertyCurrency) {
                            parts.push(`${calculateFee(realPrice, ownerFee)}`)
                          }
                          if (buyerFee > 0 && buyerFeeCurrency === totalFeesData.propertyCurrency) {
                            parts.push(`${calculateFee(realPrice, buyerFee)}`)
                          }

                          // Si ningún honorario coincide con la moneda de la propiedad, no mostrar porcentaje
                          return parts.length > 0 ? parts.join(' + ') : ''
                        } else {
                          // Misma moneda, verificar si coincide con la de la propiedad
                          if (totalFeesData.currency === totalFeesData.propertyCurrency) {
                            return calculateFee(realPrice, totalFeesData.totalAmount)
                          } else {
                            return ''
                          }
                        }
                      })()}
                      {contractData.currency?.value === 'USD' ||
                      contractData.currency?.value === 'ARS'
                        ? contractType !== 'venta'
                          ? '% de la renta'
                          : '%'
                        : '%'}
                    </p>
                  </div>
                  <div className="contract-details__meta-item">
                    <span>Estado</span>
                    <p>Firmado</p>
                  </div>
                  {contractData.startDate.value && (
                    <div className="contract-details__meta-item">
                      <span>Inicio de posesión</span>
                      <p>{fechaLarga(contractData.startDate.value)}</p>
                    </div>
                  )}
                  {contractData.endDate.value && (
                    <div className="contract-details__meta-item">
                      <span>Fin del contrato</span>
                      <p>{fechaLarga(contractData.endDate.value)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Propiedad Involucrada */}
              {propertyData && (
                <div className="contract-details__section">
                  <h2>Propiedad Involucrada</h2>

                  <div className="contract-details__property">
                    <div className="contract-details__property-image">
                      {propertyData.images?.coverImage && (
                        <img
                          src={
                            typeof propertyData.images.coverImage === 'string'
                              ? propertyData.images.coverImage
                              : propertyData.images.coverImage.url || ''
                          }
                          alt={propertyData.title || 'Imagen de propiedad'}
                        />
                      )}
                    </div>

                    <div className="contract-details__property-info">
                      <h3>{contractData.propertyTitle.value}</h3>
                      <p>{propertyData.ubication?.address}</p>

                      <div className="contract-details__property-details">
                        <div className="contract-details__detail">
                          <span>Tipo</span>
                          <p>{propertyLabels.type(propertyData.classification?.type)}</p>
                        </div>
                        <div className="contract-details__detail">
                          <span>Condición</span>
                          <p>
                            {propertyLabels.condition(
                              propertyData.caracteristics?.conservationStatus || 'bueno',
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="contract-details__property-features">
                        {propertyData.environments?.bedrooms && (
                          <div className="contract-details__property-feature">
                            <div className="contract-details__property-feature-label">Hab.</div>
                            <div className="contract-details__property-feature-value">
                              {propertyData.environments.bedrooms}
                            </div>
                          </div>
                        )}
                        {propertyData.environments?.bathrooms && (
                          <div className="contract-details__property-feature">
                            <div className="contract-details__property-feature-label">Baños</div>
                            <div className="contract-details__property-feature-value">
                              {propertyData.environments.bathrooms}
                            </div>
                          </div>
                        )}
                        {propertyData.caracteristics?.totalArea && (
                          <div className="contract-details__property-feature">
                            <div className="contract-details__property-feature-label">
                              m² totales
                            </div>
                            <div className="contract-details__property-feature-value">
                              {propertyData.caracteristics.totalArea}
                            </div>
                          </div>
                        )}
                        {propertyData.caracteristics?.coveredArea && (
                          <div className="contract-details__property-feature">
                            <div className="contract-details__property-feature-label">
                              m² cubiertos
                            </div>
                            <div className="contract-details__property-feature-value">
                              {propertyData.caracteristics.coveredArea}
                            </div>
                          </div>
                        )}
                        {propertyData.environments?.garages && (
                          <div className="contract-details__property-feature">
                            <div className="contract-details__property-feature-label">Cocheras</div>
                            <div className="contract-details__property-feature-value">
                              {propertyData.environments.garages}
                            </div>
                          </div>
                        )}
                        {propertyData.environments?.funished && (
                          <div className="contract-details__property-feature">
                            <div className="contract-details__property-feature-label">Amoblado</div>
                            <div className="contract-details__property-feature-value">
                              {propertyData.environments.funished ? 'Si' : 'No'}
                            </div>
                          </div>
                        )}
                      </div>

                      <ContractDetailsClient propertyId={propertyData.id} />
                    </div>
                  </div>
                </div>
              )}

              {/* Detalles Financieros */}
              <div className="contract-details__section">
                <h2>Detalles Financieros</h2>

                {/* Comparación de Precios */}
                <div className="contract-details__price-comparison">
                  <div className="contract-details__price-comparison-item">
                    <div className="contract-details__comparison-value">
                      {contractData.currency.value} ${formatPrice(contractData.listingPrice.value)}
                    </div>
                    <div className="contract-details__comparison-label">
                      {contractType === 'venta' ? 'Precio de Lista' : 'Renta Solicitada'}
                    </div>
                  </div>
                  <div className="contract-details__price-comparison-item">
                    <div className="contract-details__comparison-label">Diferencia de precio</div>
                    <div className="contract-details__comparison-savings">
                      {contractData.currency.value}${' '}
                      {formatPrice(
                        -(contractData.listingPrice.value - contractData.realPrice.value),
                      )}
                    </div>
                  </div>
                  <div className="contract-details__price-comparison-item">
                    <div className="contract-details__comparison-value">
                      {contractData.currency.value} ${formatPrice(contractData.realPrice.value)}
                    </div>
                    <div className="contract-details__comparison-label">
                      {contractType === 'venta' ? 'Precio negociado' : 'Renta Acordada'}
                    </div>
                  </div>
                </div>

                <div className="contract-details__financial-grid">
                  <div className="contract-details__financial-column">
                    <h4>Ganancia de la inmobiliaria</h4>
                    <div className="contract-details__payment-details">
                      {/* Honorarios del propietario */}
                      {contractData.ownerFee?.value > 0 && (
                        <>
                          <div className="contract-details__payment-item">
                            <span>Moneda (Propietario)</span>
                            <span>{contractData.ownerFeeCurrency?.value || 'USD'}</span>
                          </div>
                          <div className="contract-details__expense-item">
                            <span>
                              Honorarios del propietario{' '}
                              {(() => {
                                const ownerFeeCurrency =
                                  contractData.ownerFeeCurrency?.value || 'USD'
                                const propertyCurrency = contractData.currency?.value || 'USD'

                                // Solo mostrar porcentaje si las monedas coinciden
                                if (ownerFeeCurrency === propertyCurrency) {
                                  return `(${calculateFee(
                                    contractData.realPrice?.value || 0,
                                    contractData.ownerFee?.value || 0,
                                  )}%${contractType !== 'venta' ? ' de la renta' : ''})`
                                } else {
                                  return ''
                                }
                              })()}
                            </span>
                            <span>${formatPrice(contractData.ownerFee.value)}</span>
                          </div>
                        </>
                      )}

                      {/* Honorarios del comprador/inquilino */}
                      {contractData.buyerFee?.value > 0 && (
                        <>
                          <div className="contract-details__payment-item">
                            <span>
                              Moneda ({contractType === 'venta' ? 'Comprador' : 'Inquilino'})
                            </span>
                            <span>{contractData.buyerFeeCurrency?.value || 'USD'}</span>
                          </div>
                          <div className="contract-details__expense-item">
                            <span>
                              Honorarios del {contractType === 'venta' ? 'comprador' : 'inquilino'}{' '}
                              {(() => {
                                const buyerFeeCurrency =
                                  contractData.buyerFeeCurrency?.value || 'USD'
                                const propertyCurrency = contractData.currency?.value || 'USD'

                                // Solo mostrar porcentaje si las monedas coinciden
                                if (buyerFeeCurrency === propertyCurrency) {
                                  return `(${calculateFee(
                                    contractData.realPrice?.value || 0,
                                    contractData.buyerFee?.value || 0,
                                  )}%${contractType !== 'venta' ? ' de la renta' : ''})`
                                } else {
                                  return ''
                                }
                              })()}
                            </span>
                            <span>${formatPrice(contractData.buyerFee.value)}</span>
                          </div>
                        </>
                      )}

                      {/* Total de honorarios */}
                      {(contractData.ownerFee?.value > 0 || contractData.buyerFee?.value > 0) && (
                        <div className="contract-details__expense-item contract-details__total-fees">
                          <span>
                            <strong>
                              Total de honorarios{' '}
                              {(() => {
                                const totalFeesData = calculateTotalFees(contractData)
                                const realPrice = contractData.realPrice?.value || 0

                                if (totalFeesData.isMixed) {
                                  // Para monedas mixtas, mostrar porcentajes solo de las que coincidan con la propiedad
                                  const ownerFee = contractData.ownerFee?.value || 0
                                  const buyerFee = contractData.buyerFee?.value || 0
                                  const ownerFeeCurrency =
                                    contractData.ownerFeeCurrency?.value || 'USD'
                                  const buyerFeeCurrency =
                                    contractData.buyerFeeCurrency?.value || 'USD'

                                  const parts = []
                                  if (
                                    ownerFee > 0 &&
                                    ownerFeeCurrency === totalFeesData.propertyCurrency
                                  ) {
                                    parts.push(`${calculateFee(realPrice, ownerFee)}%`)
                                  }
                                  if (
                                    buyerFee > 0 &&
                                    buyerFeeCurrency === totalFeesData.propertyCurrency
                                  ) {
                                    parts.push(`${calculateFee(realPrice, buyerFee)}%`)
                                  }

                                  // Si hay porcentajes válidos, mostrarlos con paréntesis
                                  return parts.length > 0 ? `(${parts.join(' + ')})` : ''
                                } else {
                                  // Misma moneda, verificar si coincide con la de la propiedad
                                  if (totalFeesData.currency === totalFeesData.propertyCurrency) {
                                    return `(${calculateFee(realPrice, totalFeesData.totalAmount)}%)`
                                  } else {
                                    return ''
                                  }
                                }
                              })()}
                              {contractType !== 'venta' && ' de la renta'}
                            </strong>
                          </span>
                          <span>
                            <strong>
                              {(() => {
                                const totalFeesData = calculateTotalFees(contractData)
                                return totalFeesData.breakdown
                              })()}
                            </strong>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Documentos */}
              <div className="contract-details__section">
                <h2>Documentos</h2>

                <div className="contract-details__documents">
                  {documentsData.length > 0 &&
                    documentsData.map((doc: any, index: number) => (
                      <ContractDetailsClient key={index} document={doc} />
                    ))}
                </div>
              </div>
            </div>

            {/* Columna Lateral */}
            <div className="contract-details__sidebar">
              {/* Comprador/Inquilino */}
              {clientData && (
                <div className="contract-details__section">
                  <h3>{contractConfig[contractType as keyof typeof contractConfig].buyerLabel}</h3>
                  <div className="contract-details__person-info">
                    <div className="contract-details__info-item">
                      <span>Nombre</span>
                      <p>{clientData.fullname}</p>
                    </div>
                    <div className="contract-details__info-item">
                      <span>Teléfono</span>
                      <p>{clientData.phone}</p>
                    </div>
                    {clientData.email && (
                      <div className="contract-details__info-item">
                        <span>Email</span>
                        <p>{clientData.email}</p>
                      </div>
                    )}
                    {clientData.dni && (
                      <div className="contract-details__info-item">
                        <span>DNI</span>
                        <p>{clientData.dni}</p>
                      </div>
                    )}
                    {clientData.notes && (
                      <div className="contract-details__info-item">
                        <span>Notas</span>
                        <p>{clientData.notes}</p>
                      </div>
                    )}
                  </div>
                  <ContractDetailsClient
                    clientId={clientData.id}
                    label={`Ver ${contractConfig[contractType as keyof typeof contractConfig].buyerLabel}`}
                  />
                </div>
              )}

              {/* Vendedor/Propietario */}
              {ownerData && (
                <div className="contract-details__section">
                  <h3>{contractConfig[contractType as keyof typeof contractConfig].sellerLabel}</h3>
                  <div className="contract-details__person-info">
                    <div className="contract-details__info-item">
                      <span>Nombre</span>
                      <p>{ownerData.fullname}</p>
                    </div>
                    <div className="contract-details__info-item">
                      <span>Teléfono</span>
                      <p>{ownerData.phone}</p>
                    </div>
                    {ownerData.email && (
                      <div className="contract-details__info-item">
                        <span>Email</span>
                        <p>{ownerData.email}</p>
                      </div>
                    )}
                    {ownerData.dni && (
                      <div className="contract-details__info-item">
                        <span>DNI</span>
                        <p>{ownerData.dni}</p>
                      </div>
                    )}
                    {ownerData.notes && (
                      <div className="contract-details__info-item">
                        <span>Notas</span>
                        <p>{ownerData.notes}</p>
                      </div>
                    )}
                  </div>
                  <ContractDetailsClient
                    clientId={ownerData.id}
                    label={`Ver ${contractConfig[contractType as keyof typeof contractConfig].sellerLabel}`}
                  />
                </div>
              )}
            </div>
          </div>
        </Gutter>
      </div>
    </div>
  )
}
