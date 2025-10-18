import type { AdminViewServerProps } from 'payload'
import React from 'react'
import Link from 'next/link'
import { Gutter } from '@payloadcms/ui'
import ImageCarousel from '@/components/UI/ImageCarousel/ImageCarousel'
import { PropertyTabs } from '@/components/UI/PropertyTabs/PropertyTabs'
import PortalsList from '@/components/UI/PortalsList/PortalsList'
import { getPayload } from 'payload'
import config from '@payload-config'
import { propertyLabels } from '@/utils/propertyLabels'
import './styles.scss'
import NavigationHeader from '@/components/NavigationHeader'
// Función para procesar las imágenes de la galería
async function processGalleryImages(
  galleryValue: any[],
): Promise<Array<{ url: string; filename: string }>> {
  const galleryImages: Array<{ url: string; filename: string }> = []

  if (galleryValue && Array.isArray(galleryValue)) {
    const payload = await getPayload({ config })

    for (const image of galleryValue) {
      try {
        const imageData = await payload.findByID({
          collection: 'media',
          id: image,
        })
        if (imageData) {
          galleryImages.push({
            url: imageData?.sizes?.og?.url || imageData.url || '',
            filename: imageData?.sizes?.og?.filename || imageData.filename || '',
          })
        }
      } catch (error) {
        console.log('Error en fetch de imagen de galería:', error)
      }
    }
  }

  return galleryImages
}

// Función para procesar imagen de portada
async function processCoverImage(
  coverImageValue: string,
): Promise<{ url: string; filename: string } | null> {
  if (coverImageValue) {
    try {
      const payload = await getPayload({ config })

      const imageData = await payload.findByID({
        collection: 'media',
        id: coverImageValue,
      })
      if (imageData) {
        return {
          url: imageData?.sizes?.og?.url || imageData.url || '',
          filename: imageData?.sizes?.og?.filename || imageData.filename || '',
        }
      }
    } catch (error) {
      console.log('Error en fetch de imagen de portada:', error)
    }
  }
  return null
}

// Función para obtener datos del propietario
async function getOwnerData(ownerId: string) {
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

export default async function PropertyDetails(props: AdminViewServerProps) {
  const formData = (props as any).doc
  const propertyId = (props as any).doc.id
  if (!formData) {
    return (
      <div className="property-details">
        <Gutter>
          <div className="property-details__error">
            <h2>No se encontraron datos de la propiedad</h2>
            <p>No hay información disponible para mostrar.</p>
          </div>
        </Gutter>
      </div>
    )
  }
  // Procesar imágenes del servidor
  const coverImage = formData?.images?.coverImage
    ? await processCoverImage(formData?.images?.coverImage)
    : null

  const galleryImages = formData?.images?.gallery
    ? await processGalleryImages(formData?.images?.gallery)
    : []
  // Obtener datos del propietario
  const ownerData = formData?.owner ? await getOwnerData(formData.owner) : null
  // Construir todas las imágenes para el carrusel
  const allImages = [...(coverImage ? [coverImage] : []), ...galleryImages]
  // Construir array de imágenes para portales con coverImage primero
  const portalImages = []
  // Agregar coverImage como primera imagen (orden 1)
  if (coverImage) {
    portalImages.push({
      // url: 'https://res.cloudinary.com/dykysdnj9/image/upload/v1757027248/inmoup/204_zinkr7.jpg',
      url: coverImage.url,
      orden: 1,
    })
  }

  // Agregar imágenes de galería con orden secuencial
  galleryImages.forEach((image, index) => {
    portalImages.push({
      // url: 'https://res.cloudinary.com/dykysdnj9/image/upload/v1757027247/inmoup/038-2_v0lhhb.jpg',
      url: image.url,
      orden: index + (coverImage ? 2 : 1), // Si hay coverImage, empieza en 2, sino en 1
    })
  })
  // Obtener datos de inmoup desde formData
  const inmoupData = formData.inmoup || {}
  const mercadolibreData = formData.mercadolibre || {}
  console.log('inmoupData:', inmoupData)
  console.log('mercadolibreData:', mercadolibreData)

  // Función para determinar el estado de publicación
  const getPortalStatus = (portalData: any) => {
    if (!portalData || !portalData.status) return 'not_published'

    switch (portalData.status) {
      case 'ok':
        return 'published'
      case 'error':
        return 'error'
      case 'queued':
        return 'pending'
      case 'desactualizado':
        return 'outdated'
      default:
        return 'not_published'
    }
  }

  // Función para generar el botón según el estado
  const getPortalButton = (portalData: any) => {
    const status = getPortalStatus(portalData)

    switch (status) {
      case 'published':
        return {
          text: 'Ver en Portal',
          url: portalData.externalUrl || '#',
          variant: 'success',
          icon: '🔗',
        }
      case 'error':
        return {
          text: 'Error - Reintentar',
          url: null,
          variant: 'error',
          icon: '❌',
        }
      case 'pending':
        return {
          text: 'Publicando...',
          url: null,
          variant: 'pending',
          icon: '⏳',
        }
      case 'outdated':
        return {
          text: 'Actualizar',
          url: null,
          variant: 'warning',
          icon: '🔄',
        }
      default:
        return {
          text: 'Publicar',
          url: null,
          variant: 'primary',
          icon: '📤',
        }
    }
  }

  // Configuración de portales basada en datos reales
  const portalsConfig = {
    inmoup: {
      name: inmoupData.name || 'Inmoup',
      logo: '🏠',
      status: getPortalStatus(inmoupData),
      publishedDate: inmoupData.lastSyncAt || null,
      notes:
        inmoupData.lastError ||
        (inmoupData.status === 'ok' ? 'Portal activo y funcionando' : 'Portal listo para publicar'),
      requiredFields: ['title', 'price', 'location', 'images'],
      button: getPortalButton(inmoupData),
      externalId: inmoupData.externalId || null,
      externalUrl: inmoupData.externalUrl || null,
    },
    mercadolibre: {
      name: mercadolibreData.name || 'MercadoLibre',
      logo: '🏠',
      status: getPortalStatus(mercadolibreData),
      publishedDate: mercadolibreData.lastSyncAt || null,
      notes:
        mercadolibreData.lastError ||
        (mercadolibreData.status === 'ok'
          ? 'Portal activo y funcionando'
          : 'Portal listo para publicar'),
      requiredFields: ['title', 'price', 'location', 'images'],
      button: getPortalButton(mercadolibreData),
      externalId: mercadolibreData.externalId || null,
      externalUrl: mercadolibreData.externalUrl || null,
    },
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No publicado'
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const publishedPortals = Object.values(portalsConfig).filter(
    (portal: any) => portal.status === 'published',
  ).length
  const totalPortals = Object.keys(portalsConfig).length

  return (
    <Gutter>
      <div className="property-details">
        <NavigationHeader title="Detalles de la Propiedad" />
        <div className="property-details__main">
          <div className="property-details__container">
            <div className="property-details__layout">
              {/* Columna Principal */}
              <div className="property-details__main-column">
                <PropertyTabs>
                  {/* Tab de Datos */}
                  <div className="property-details__content">
                    <ImageCarousel images={allImages} />

                    {/* Información de la Propiedad */}
                    <div className="property-details__info-grid">
                      {/* Información Básica */}
                      <div className="property-details__info-card">
                        <h3 className="property-details__card-title">Información Básica</h3>
                        <div className="property-details__card-content">
                          <div className="property-details__info-row">
                            <div className="property-details__info-item">
                              <span className="property-details__info-label">
                                Tipo de Propiedad
                              </span>
                              <span className="property-details__info-value">
                                {formData.classification?.type
                                  ? propertyLabels.type(formData.classification.type)
                                  : 'No especificado'}
                              </span>
                            </div>
                            <div className="property-details__info-item">
                              <span className="property-details__info-label">Operación</span>
                              <span className="property-details__info-value">
                                {formData.classification?.condition
                                  ? propertyLabels.condition(formData.classification.condition)
                                  : 'No especificado'}
                              </span>
                            </div>
                          </div>

                          <div className="property-details__info-item property-details__info-item--full">
                            <span className="property-details__info-label">Precio</span>
                            <span className="property-details__info-value property-details__info-value--price">
                              {formData.caracteristics.price && formData.caracteristics.currency
                                ? propertyLabels.formatCurrency(
                                    formData.caracteristics.price,
                                    formData.caracteristics.currency,
                                  )
                                : 'No especificado'}
                            </span>
                          </div>

                          {/* Información adicional de precios */}
                          {formData.caracteristics?.expenses && (
                            <div className="property-details__info-item">
                              <span className="property-details__info-label">Expensas</span>
                              <span className="property-details__info-value">
                                {formData.caracteristics?.expensesCurrency
                                  ? propertyLabels.formatCurrency(
                                      formData.caracteristics.expenses,
                                      formData.caracteristics.expensesCurrency,
                                    )
                                  : `$${formData.caracteristics.expenses}`}
                              </span>
                            </div>
                          )}

                          {formData.caracteristics?.appraisal && (
                            <div className="property-details__info-item">
                              <span className="property-details__info-label">Tasación</span>
                              <span className="property-details__info-value">
                                {formData.caracteristics?.appraisalCurrency
                                  ? propertyLabels.formatCurrency(
                                      formData.caracteristics.appraisal,
                                      formData.caracteristics.appraisalCurrency,
                                    )
                                  : `$${formData.caracteristics.appraisal}`}
                              </span>
                            </div>
                          )}

                          <div className="property-details__info-item property-details__info-item--full">
                            <span className="property-details__info-label">Ubicación</span>
                            <span className="property-details__info-value">
                              {formData.ubication?.address || 'No especificado'}
                            </span>
                          </div>

                          <div className="property-details__info-row property-details__info-row--three">
                            {formData.environments?.bedrooms && (
                              <div className="property-details__info-item">
                                <span className="property-details__info-label">Dormitorios</span>
                                <span className="property-details__info-value">
                                  {formData.environments.bedrooms}
                                </span>
                              </div>
                            )}
                            {formData.environments?.bathrooms && (
                              <div className="property-details__info-item">
                                <span className="property-details__info-label">Baños</span>
                                <span className="property-details__info-value">
                                  {formData.environments.bathrooms}
                                </span>
                              </div>
                            )}
                            {formData.environments?.garages && (
                              <div className="property-details__info-item">
                                <span className="property-details__info-label">Garajes</span>
                                <span className="property-details__info-value">
                                  {formData.environments.garages}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Características Físicas */}
                      <div className="property-details__info-card">
                        <h3 className="property-details__card-title">Características Físicas</h3>
                        <div className="property-details__card-content">
                          <div className="property-details__info-row">
                            <div className="property-details__info-item">
                              <span className="property-details__info-label">Superficie Total</span>
                              <span className="property-details__info-value">
                                {formData.caracteristics?.totalArea || 'No especificado'} m²
                              </span>
                            </div>
                            {formData.caracteristics?.coveredArea && (
                              <div className="property-details__info-item">
                                <span className="property-details__info-label">
                                  Superficie Cubierta
                                </span>
                                <span className="property-details__info-value">
                                  {formData.caracteristics?.coveredArea || 'No especificado'} m²
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="property-details__info-row">
                            {formData.caracteristics?.frontMeters && (
                              <div className="property-details__info-item">
                                <span className="property-details__info-label">
                                  Metros de Frente
                                </span>
                                <span className="property-details__info-value">
                                  {formData.caracteristics?.frontMeters || 'No especificado'}
                                </span>
                              </div>
                            )}
                            {formData.caracteristics?.deepMeters && (
                              <div className="property-details__info-item">
                                <span className="property-details__info-label">
                                  Metros de Largo
                                </span>
                                <span className="property-details__info-value">
                                  {formData.caracteristics?.deepMeters || 'No especificado'}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="property-details__info-row">
                            {formData.caracteristics?.antiquity && (
                              <div className="property-details__info-item">
                                <span className="property-details__info-label">Antigüedad</span>
                                <span className="property-details__info-value">
                                  {propertyLabels.antiquity(
                                    formData.caracteristics?.antiquity || 'No especificado',
                                  )}
                                </span>
                              </div>
                            )}
                            {formData.caracteristics?.conservationStatus && (
                              <div className="property-details__info-item">
                                <span className="property-details__info-label">Conservación</span>
                                <span className="property-details__info-value">
                                  {propertyLabels.conservationStatus(
                                    formData.caracteristics?.conservationStatus,
                                  )}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="property-details__info-row">
                            {formData.caracteristics?.orientation && (
                              <div className="property-details__info-item">
                                <span className="property-details__info-label">Orientación</span>
                                <span className="property-details__info-value">
                                  {propertyLabels.orientation(formData.caracteristics?.orientation)}
                                </span>
                              </div>
                            )}
                            {formData.caracteristics?.garageType && (
                              <div className="property-details__info-item">
                                <span className="property-details__info-label">Tipo de Garage</span>
                                <span className="property-details__info-value">
                                  {propertyLabels.garageType(formData.caracteristics?.garageType)}
                                </span>
                              </div>
                            )}
                          </div>

                          {formData.environments?.furnished && (
                            <div className="property-details__info-row">
                              <div className="property-details__info-item">
                                <span className="property-details__info-label">Amueblado</span>
                                <span className="property-details__info-value">
                                  {propertyLabels.furnished(formData.environments?.furnished)}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="property-details__info-card">
                        <h3 className="property-details__card-title">Detalles</h3>
                        <div className="property-details__card-content">
                          <div className="property-details__info-row">
                            {formData.amenities?.barrioPrivado && (
                              <div className="property-details__info-item">
                                <span className="property-details__info-label">
                                  ¿Barrio Privado?
                                </span>
                                <span className="property-details__info-value">
                                  {formData.amenities?.barrioPrivado}
                                </span>
                              </div>
                            )}
                            {formData.amenities?.mascotas && (
                              <div className="property-details__info-item">
                                <span className="property-details__info-label">
                                  ¿Aceptan Mascotas?
                                </span>
                                <span className="property-details__info-value">
                                  {formData.amenities?.mascotas}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="property-details__info-row">
                            {formData.amenities?.estrellas && (
                              <div className="property-details__info-item">
                                <span className="property-details__info-label">Estrellas</span>
                                <span className="property-details__info-value">
                                  {formData.amenities?.estrellas}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="property-details__info-row">
                            {formData.amenities?.agua && (
                              <div className="property-details__info-item">
                                <span className="property-details__info-label">Agua</span>
                                <span className="property-details__info-value">
                                  {formData.amenities?.agua}
                                </span>
                              </div>
                            )}
                            {formData.amenities?.gas && (
                              <div className="property-details__info-item">
                                <span className="property-details__info-label">Gas</span>
                                <span className="property-details__info-value">
                                  {formData.amenities?.gas}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="property-details__info-row">
                            {formData.amenities?.cloacas && (
                              <div className="property-details__info-item">
                                <span className="property-details__info-label">Cloacas</span>
                                <span className="property-details__info-value">
                                  {formData.amenities?.cloacas}
                                </span>
                              </div>
                            )}
                            {formData.amenities?.luz && (
                              <div className="property-details__info-item">
                                <span className="property-details__info-label">Luz Eléctrica</span>
                                <span className="property-details__info-value">
                                  {formData.amenities?.luz}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Descripción */}
                      <div className="property-details__info-card property-details__info-card--full">
                        <h3 className="property-details__card-title">Descripción</h3>
                        <div className="property-details__card-content">
                          <p className="property-details__description">
                            {formData.aiContent?.description || 'No hay descripción disponible'}
                          </p>
                        </div>
                      </div>

                      {/* Servicios y Amenities */}
                      <div className="property-details__info-card">
                        <h3 className="property-details__card-title">Servicios y Amenities</h3>
                        <div className="property-details__card-content">
                          <div className="property-details__amenities-section">
                            <h4 className="property-details__amenities-subtitle">Servicios</h4>
                            <div className="property-details__amenities-list">
                              {formData.amenities?.servicios?.length > 0 ? (
                                propertyLabels
                                  .amenityServicesMultiple(formData.amenities.servicios)
                                  .map((servicio: string, index: number) => (
                                    <span key={index} className="property-details__amenity-tag">
                                      {servicio}
                                    </span>
                                  ))
                              ) : (
                                <span className="property-details__amenity-tag">
                                  No hay servicios especificados
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="property-details__amenities-section">
                            <h4 className="property-details__amenities-subtitle">Ambientes</h4>
                            <div className="property-details__amenities-list">
                              {formData.amenities?.ambientes?.length > 0 ? (
                                propertyLabels
                                  .amenityEnvironmentsMultiple(formData.amenities.ambientes)
                                  .map((ambiente: string, index: number) => (
                                    <span key={index} className="property-details__amenity-tag">
                                      {ambiente}
                                    </span>
                                  ))
                              ) : (
                                <span className="property-details__amenity-tag">
                                  No hay ambientes especificados
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="property-details__amenities-section">
                            <h4 className="property-details__amenities-subtitle">Zonas Cercanas</h4>
                            <div className="property-details__amenities-list">
                              {formData.amenities?.zonasCercanas?.length > 0 ? (
                                propertyLabels
                                  .amenityNearbyZonesMultiple(formData.amenities.zonasCercanas)
                                  .map((zona: string, index: number) => (
                                    <span key={index} className="property-details__amenity-tag">
                                      {zona}
                                    </span>
                                  ))
                              ) : (
                                <span className="property-details__amenity-tag">
                                  No hay zonas cercanas especificadas
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Ubicación */}
                      <div className="property-details__info-card">
                        <h3 className="property-details__card-title">Ubicación</h3>
                        <div className="property-details__card-content">
                          <div className="property-details__info-item">
                            <span className="property-details__info-label">Domicilio</span>
                            <span className="property-details__info-value">
                              {formData.ubication?.address || 'No hay dirección'}
                            </span>
                          </div>
                          <div className="property-details__info-item">
                            <span className="property-details__info-label">Provincia</span>
                            <span className="property-details__info-value">
                              {formData.ubication?.province || 'No hay provincia'}
                            </span>
                          </div>
                          <div className="property-details__info-item">
                            <span className="property-details__info-label">Departamento</span>
                            <span className="property-details__info-value">
                              {formData.ubication?.department
                                ? propertyLabels.department(formData.ubication.department)
                                : 'No hay departamento'}
                            </span>
                          </div>
                          <div className="property-details__info-item">
                            <span className="property-details__info-label">Localidad</span>
                            <span className="property-details__info-value">
                              {formData.ubication?.locality
                                ? propertyLabels.locality(formData.ubication.locality)
                                : 'No hay localidad'}
                            </span>
                          </div>
                          <div className="property-details__info-item">
                            <span className="property-details__info-label">Barrio</span>
                            <span className="property-details__info-value">
                              {formData.ubication?.neighborhood || 'No hay barrio'}
                            </span>
                          </div>
                          {formData.ubication?.locationPrivacy && (
                            <div className="property-details__info-item">
                              <span className="property-details__info-label">
                                Privacidad de Ubicación
                              </span>
                              <span className="property-details__info-value">
                                {propertyLabels.locationPrivacy(formData.ubication.locationPrivacy)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tab de Portales */}
                  <PortalsList propertyId={propertyId} />
                </PropertyTabs>
              </div>

              {/* Sidebar */}
              <div className="property-details__sidebar">
                {/* Información del Propietario */}
                <div className="property-details__sidebar-card">
                  <h3 className="property-details__sidebar-title">Información del Propietario</h3>
                  <div className="property-details__sidebar-content">
                    <div className="property-details__sidebar-item">
                      <span className="property-details__sidebar-label">Nombre Completo</span>
                      <span className="property-details__sidebar-value">
                        {ownerData?.fullname || 'No disponible'}
                      </span>
                    </div>
                    <div className="property-details__sidebar-item">
                      <span className="property-details__sidebar-label">Email</span>
                      <span className="property-details__sidebar-value">
                        {ownerData?.email || 'No disponible'}
                      </span>
                    </div>
                    <div className="property-details__sidebar-item">
                      <span className="property-details__sidebar-label">Teléfono</span>
                      <span className="property-details__sidebar-value">
                        {ownerData?.phone || 'No disponible'}
                      </span>
                    </div>
                  </div>
                  <div className="property-details__sidebar-actions">
                    {formData.owner ? (
                      <Link
                        href={`/admin/collections/clientes/${formData.owner}/detalles`}
                        className="property-details__btn property-details__btn--primary property-details__btn--full"
                      >
                        Ver Propietario
                      </Link>
                    ) : (
                      <button
                        className="property-details__btn property-details__btn--primary property-details__btn--full"
                        disabled={true}
                      >
                        Ver Propietario
                      </button>
                    )}
                  </div>
                </div>

                {/* Estado de Publicación */}
                <div className="property-details__sidebar-card">
                  <h3 className="property-details__sidebar-title">Estado de Publicación</h3>
                  <div className="property-details__sidebar-content">
                    <div className="property-details__sidebar-item">
                      <span className="property-details__sidebar-label">Portales Activos</span>
                      <span className="property-details__sidebar-value">{publishedPortals}</span>
                    </div>
                    <div className="property-details__sidebar-item">
                      <span className="property-details__sidebar-label">Total Portales</span>
                      <span className="property-details__sidebar-value">{totalPortals}</span>
                    </div>
                    <div className="property-details__sidebar-item">
                      <span className="property-details__sidebar-label">Última Actualización</span>
                      <span className="property-details__sidebar-value">
                        {inmoupData.lastSyncAt
                          ? formatDate(inmoupData.lastSyncAt)
                          : formatDate(formData.updatedAt?.value || '')}
                      </span>
                    </div>
                  </div>
                  <div className="property-details__sidebar-summary">
                    <span className="property-details__sidebar-ratio">
                      {publishedPortals}/{totalPortals} portales publicados
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Gutter>
  )
}
