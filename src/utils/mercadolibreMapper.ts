// Utilidad para mapear datos de formData al formato requerido por MercadoLibre API

import { mercadolibreMappings, propertyType } from '@/data/mercadolibreMappings'

/**
 * Función para obtener el category_id de MercadoLibre basado en el tipo de propiedad y condición
 */
function getMercadoLibreCategoryId(propertyTypeValue: string, condition: string): string {
  // Buscar el tipo de propiedad en el mapping
  const mappedPropertyType = mercadolibreMappings.propertyType[propertyTypeValue]

  if (!mappedPropertyType) {
    // Default: Departamentos en venta
    return 'MLA401685'
  }

  // Buscar en el array propertyType el objeto correspondiente
  const categoryData = propertyType.find((item) => item.name === mappedPropertyType)

  if (!categoryData) {
    // Default: Departamentos en venta
    return 'MLA401685'
  }

  // Obtener el ID según la condición
  let categoryId: string

  switch (condition) {
    case 'venta':
      categoryId = categoryData.venta
      break
    case 'alquiler':
      categoryId = categoryData.alquiler
      break
    case 'alquiler_temporario':
      categoryId = categoryData.alquiler_temporario
      break
    default:
      // Default: venta
      categoryId = categoryData.venta
      break
  }

  return categoryId || 'MLA401685' // Fallback si no se encuentra
}

// Nueva interfaz para datos normales (sin .value)
interface PropertyData {
  // Classification
  classification?: {
    type?: string
    condition?: string
  }

  // Ubication
  ubication?: {
    province?: string
    department?: string
    locality?: string
    neighborhood?: string
    address?: string
    mapLocation?: {
      lat?: number
      lng?: number
      address?: string
      formattedAddress?: string
    }
  }

  // Caracteristics
  caracteristics?: {
    price?: number
    currency?: string
    hasExpenses?: string
    expenses?: number
    expensesCurrency?: string
    coveredArea?: number
    totalArea?: number
    frontMeters?: number
    deepMeters?: number
    antiquity?: string
    conservationStatus?: string
    orientation?: string
  }

  // Environments
  environments?: {
    bedrooms?: number
    bathrooms?: number
    garageType?: string
    garages?: number
    plantas?: number
    ambientes?: string
    furnished?: string
  }

  // Amenities
  amenities?: {
    barrioPrivado?: string
    servicios?: string[]
    ambientes?: string[]
    zonasCercanas?: string[]
  }

  // AI Content
  aiContent?: {
    title?: string
    description?: string
  }

  // Images
  images?: {
    coverImage?: any
    gallery?: any[]
    videoUrl?: string
    virtualTourUrl?: string
  }
}

interface MercadoLibreData {
  title: string
  category_id: string
  price: number
  currency_id: string
  available_quantity: number
  buying_mode: string
  condition: string
  listing_type_id: string
  description?: string
  pictures?: Array<{ source: string }>
  attributes?: Array<{
    id: string
    value_name?: string
    value_unit?: string
    value_id?: string
  }>
  location?: {
    address_line?: string
    zip_code?: string
    city?: {
      name?: string
    }
    state?: {
      name?: string
    }
    country?: {
      id: string
    }
  }
  [key: string]: any
}

/**
 * Función para obtener el listing_type_id basado en el tipo de operación
 */
function getListingTypeId(condition: string): string {
  // Mapeo básico de operaciones a tipos de listado de MercadoLibre
  const listingTypes = {
    venta: 'gold_special',
    alquiler: 'gold_special',
    alquiler_temporario: 'gold_special',
    permuta: 'gold_special',
  }

  return listingTypes[condition as keyof typeof listingTypes] || 'gold_special'
}

/**
 * Función helper para obtener el ID del tipo de propiedad
 */
function getPropertyTypeId(propertyTypeName: string): string | null {
  // Mapeo basado en el JSON proporcionado
  const propertyTypeMapping: Record<string, string> = {
    Casa: '242060',
    // Agregar más mapeos según sea necesario
  }

  return propertyTypeMapping[propertyTypeName] || null
}

/**
 * Función helper para obtener el ID de la operación
 */
function getOperationId(condition: string): string | null {
  // Mapeo basado en el JSON proporcionado
  const operationMapping: Record<string, string> = {
    venta: '242073', // Asumiendo que existe (no está en el JSON pero es común)
    alquiler: '242072', // Asumiendo que existe
    alquiler_temporario: '242074', // Del JSON proporcionado
    permuta: '242075', // Asumiendo que existe
  }

  return operationMapping[condition] || null
}

/**
 * Función helper para obtener el subtipo de casa
 */
function getHouseSubtype(propertyData: PropertyData): string | null {
  // Mapeo basado en el JSON proporcionado - HOUSE_PROPERTY_SUBTYPE
  const houseSubtypes: Record<string, string> = {
    duplex: '266259',
    ph: '266260',
    triplex: '266261',
    cabaña: '266256',
    casa: '266257',
    chalet: '266258',
  }

  // Intentar determinar el subtipo basado en datos disponibles
  const type = propertyData.classification?.type?.toLowerCase()

  if (type?.includes('duplex')) return houseSubtypes['duplex']
  if (type?.includes('ph')) return houseSubtypes['ph']
  if (type?.includes('triplex')) return houseSubtypes['triplex']
  if (type?.includes('cabaña')) return houseSubtypes['cabaña']
  if (type?.includes('chalet')) return houseSubtypes['chalet']

  // Default para casa normal
  return houseSubtypes['casa']
}

/**
 * Función helper para convertir valores boolean a formato MercadoLibre
 */
function getBooleanMeliValue(
  value: string | boolean | undefined,
  defaultValue: boolean = false,
): string {
  if (value === undefined || value === null) {
    return defaultValue ? '242085' : '242084' // Sí : No
  }

  if (typeof value === 'boolean') {
    return value ? '242085' : '242084'
  }

  if (typeof value === 'string') {
    const normalizedValue = value.toLowerCase()
    if (normalizedValue === 'si' || normalizedValue === 'sí' || normalizedValue === 'true') {
      return '242085'
    }
    if (normalizedValue === 'no' || normalizedValue === 'false') {
      return '242084'
    }
  }

  return defaultValue ? '242085' : '242084'
}

/**
 * Función para mapear atributos específicos de MercadoLibre
 */
function mapAttributes(
  propertyData: PropertyData,
): Array<{ id: string; value_name?: string; value_unit?: string; value_id?: string }> {
  const attributes: Array<{
    id: string
    value_name?: string
    value_unit?: string
    value_id?: string
  }> = []

  // === CAMPOS REQUERIDOS ===

  // Tipo de propiedad (PROPERTY_TYPE) - REQUERIDO para algunas categorías
  if (propertyData.classification?.type) {
    const mappedPropertyType = mercadolibreMappings.propertyType[propertyData.classification.type]
    if (mappedPropertyType) {
      // Buscar el ID correspondiente en los valores permitidos
      const propertyTypeId = getPropertyTypeId(String(mappedPropertyType))
      if (propertyTypeId) {
        attributes.push({
          id: 'PROPERTY_TYPE',
          value_id: propertyTypeId,
        })
      }
    }
  }

  // Operación (OPERATION) - REQUERIDO
  if (propertyData.classification?.condition) {
    const operationId = getOperationId(propertyData.classification.condition)
    if (operationId) {
      attributes.push({
        id: 'OPERATION',
        value_id: operationId,
      })
    }
  }

  // Superficie total (TOTAL_AREA) - REQUERIDO
  if (propertyData.caracteristics?.totalArea) {
    attributes.push({
      id: 'TOTAL_AREA',
      value_name: propertyData.caracteristics.totalArea.toString(),
      value_unit: 'm²',
    })
  }

  // Superficie cubierta (COVERED_AREA) - REQUERIDO
  if (propertyData.caracteristics?.coveredArea) {
    attributes.push({
      id: 'COVERED_AREA',
      value_name: propertyData.caracteristics.coveredArea.toString(),
      value_unit: 'm²',
    })
  }

  // Huéspedes (GUESTS) - REQUERIDO para alquiler temporario
  if (propertyData.caracteristics?.guests) {
    attributes.push({
      id: 'GUESTS',
      value_name: propertyData.caracteristics.guests.toString(),
    })
  }

  // Dormitorios (BEDROOMS) - REQUERIDO
  if (propertyData.environments?.bedrooms) {
    attributes.push({
      id: 'BEDROOMS',
      value_name: propertyData.environments.bedrooms.toString(),
    })
  }

  // Baños completos (FULL_BATHROOMS) - REQUERIDO
  if (propertyData.environments?.bathrooms) {
    attributes.push({
      id: 'FULL_BATHROOMS',
      value_name: propertyData.environments.bathrooms.toString(),
    })
  }

  // Cocheras (PARKING_LOTS) - REQUERIDO
  attributes.push({
    id: 'PARKING_LOTS',
    value_name: (propertyData.environments?.garages || 0).toString(),
  })

  // === CAMPOS OPCIONALES IMPORTANTES ===

  // Ambientes (ROOMS)
  if (propertyData.environments?.totalRooms) {
    attributes.push({
      id: 'ROOMS',
      value_name: propertyData.environments.totalRooms.toString(),
    })
  }

  // Camas (BEDS)
  if (propertyData.environments?.bedrooms) {
    // Asumimos 1-2 camas por dormitorio
    const estimatedBeds = propertyData.environments.bedrooms * 1.5
    attributes.push({
      id: 'BEDS',
      value_name: Math.ceil(estimatedBeds).toString(),
    })
  }

  // Pisos (FLOORS)
  if (propertyData.environments?.plantas) {
    attributes.push({
      id: 'FLOORS',
      value_name: propertyData.environments.plantas.toString(),
    })
  }

  // Tipo de casa (HOUSE_PROPERTY_SUBTYPE)
  if (propertyData.classification?.type === 'casa') {
    const houseSubtype = getHouseSubtype(propertyData)
    if (houseSubtype) {
      attributes.push({
        id: 'HOUSE_PROPERTY_SUBTYPE',
        value_id: houseSubtype,
      })
    }
  }

  // === AMENITIES Y CARACTERÍSTICAS ===

  // Pileta (HAS_SWIMMING_POOL)
  if (
    propertyData.amenities?.servicios?.includes('pileta') ||
    propertyData.amenities?.servicios?.includes('piscina')
  ) {
    attributes.push({
      id: 'HAS_SWIMMING_POOL',
      value_id: '242085', // Sí
    })
  }

  // Aire acondicionado (HAS_AIR_CONDITIONING)
  if (
    propertyData.amenities?.servicios?.includes('aire_acondicionado') ||
    propertyData.amenities?.servicios?.includes('climatizacion')
  ) {
    attributes.push({
      id: 'HAS_AIR_CONDITIONING',
      value_id: '242085', // Sí
    })
  }

  // Calefacción (HAS_HEATING)
  if (propertyData.amenities?.servicios?.includes('calefaccion')) {
    attributes.push({
      id: 'HAS_HEATING',
      value_id: '242085', // Sí
    })
  }

  // Jardín (HAS_GARDEN)
  if (
    propertyData.amenities?.ambientes?.includes('jardin') ||
    propertyData.amenities?.ambientes?.includes('patio') ||
    propertyData.amenities?.ambientes?.includes('parque')
  ) {
    attributes.push({
      id: 'HAS_GARDEN',
      value_id: '242085', // Sí
    })
  }

  // Parrilla (HAS_GRILL)
  if (
    propertyData.amenities?.servicios?.includes('parrilla') ||
    propertyData.amenities?.servicios?.includes('asador')
  ) {
    attributes.push({
      id: 'HAS_GRILL',
      value_id: '242085', // Sí
    })
  }

  // Mascotas (PETS_ALLOWED)
  if (propertyData.amenities?.mascotas) {
    const petsAllowed = getBooleanMeliValue(propertyData.amenities.mascotas)
    attributes.push({
      id: 'PETS_ALLOWED',
      value_id: petsAllowed,
    })
  }

  // Amoblado - mapeo desde environments.furnished
  if (propertyData.environments?.furnished) {
    const furnishedValue = getBooleanMeliValue(propertyData.environments.furnished)
    // Note: No hay campo FURNISHED exacto en el JSON, pero podríamos usar otro campo
  }

  // Dormitorio en suite (HAS_BEDROOM_SUITE)
  if (
    propertyData.amenities?.ambientes?.includes('suite') ||
    propertyData.amenities?.ambientes?.includes('dormitorio_principal')
  ) {
    attributes.push({
      id: 'HAS_BEDROOM_SUITE',
      value_id: '242085', // Sí
    })
  }

  // Toilette (HAS_HALF_BATH)
  if (propertyData.environments?.toilettes && propertyData.environments.toilettes > 0) {
    attributes.push({
      id: 'HAS_HALF_BATH',
      value_id: '242085', // Sí
    })
  }

  // Placards (HAS_CLOSETS)
  if (propertyData.amenities?.servicios?.includes('placards')) {
    attributes.push({
      id: 'HAS_CLOSETS',
      value_id: '242085', // Sí
    })
  }

  // Electrodomésticos
  if (propertyData.amenities?.servicios?.includes('heladera')) {
    attributes.push({
      id: 'HAS_REFRIGERATOR',
      value_id: '242085', // Sí
    })
  }

  if (propertyData.amenities?.servicios?.includes('microondas')) {
    attributes.push({
      id: 'HAS_MICROWAVE',
      value_id: '242085', // Sí
    })
  }

  if (propertyData.amenities?.servicios?.includes('lavarropa')) {
    attributes.push({
      id: 'HAS_WASHING_MACHINE',
      value_id: '242085', // Sí
    })
  }

  // Deportes y recreación
  if (propertyData.amenities?.servicios?.includes('cancha_tenis')) {
    attributes.push({
      id: 'HAS_TENNIS_COURT',
      value_id: '242085', // Sí
    })
  }

  if (propertyData.amenities?.servicios?.includes('cancha_basquet')) {
    attributes.push({
      id: 'HAS_BASKETBALL_COURT',
      value_id: '242085', // Sí
    })
  }

  if (propertyData.amenities?.servicios?.includes('cancha_paddle')) {
    attributes.push({
      id: 'HAS_PADDLE_COURT',
      value_id: '242085', // Sí
    })
  }

  // Superficie de terreno (LAND_AREA)
  if (propertyData.caracteristics?.totalArea && propertyData.caracteristics?.coveredArea) {
    const landArea = propertyData.caracteristics.totalArea - propertyData.caracteristics.coveredArea
    if (landArea > 0) {
      attributes.push({
        id: 'LAND_AREA',
        value_name: landArea.toString(),
        value_unit: 'm²',
      })
    }
  }

  return attributes
}

/**
 * Función principal para convertir propertyData al formato de MercadoLibre
 */
export function mapFormDataToMercadoLibre(propertyData: PropertyData): MercadoLibreData {
  // Mapeo básico de la propiedad
  const mappedData: MercadoLibreData = {
    // === CAMPOS BÁSICOS REQUERIDOS ===
    title: propertyData.aiContent?.title || propertyData.title || '',
    category_id: getMercadoLibreCategoryId(
      propertyData.classification?.type || '',
      propertyData.classification?.condition || '',
    ),
    price: propertyData.caracteristics?.price || 0,
    currency_id: propertyData.caracteristics?.currency === 'usd' ? 'USD' : 'ARS',

    // === CONFIGURACIÓN DE LISTADO ===
    available_quantity: 1,
    buying_mode: 'classified', // Para inmuebles
    condition: 'new', // MercadoLibre usa 'new' para inmuebles
    listing_type_id: getListingTypeId(propertyData.classification?.condition || ''),

    // === CONTENIDO ===
    description: buildDescription(propertyData),

    // === IMÁGENES ===
    pictures: propertyData.images?.map((img) => ({ source: img.url })) || [],

    // === ATRIBUTOS ESPECÍFICOS ===
    attributes: mapAttributes(propertyData),

    // === UBICACIÓN ===
    location: {
      address_line: propertyData.ubication?.address || '',
      city: {
        name: propertyData.ubication?.locality || propertyData.ubication?.department || '',
      },
      state: {
        name: propertyData.ubication?.province || 'Mendoza',
      },
      country: {
        id: 'AR', // Argentina
      },
    },
  }

  return mappedData
}

/**
 * Función helper para construir una descripción más completa
 */
function buildDescription(propertyData: PropertyData): string {
  let description = propertyData.aiContent?.description || propertyData.description || ''

  // Si no hay descripción, construir una básica
  if (!description.trim()) {
    const parts: string[] = []

    // Tipo de propiedad
    if (propertyData.classification?.type) {
      parts.push(
        `${propertyData.classification.type.charAt(0).toUpperCase() + propertyData.classification.type.slice(1)}`,
      )
    }

    // Operación
    if (propertyData.classification?.condition) {
      const conditionText =
        propertyData.classification.condition === 'venta'
          ? 'en venta'
          : propertyData.classification.condition === 'alquiler'
            ? 'en alquiler'
            : propertyData.classification.condition === 'alquiler_temporario'
              ? 'en alquiler temporario'
              : ''
      if (conditionText) parts.push(conditionText)
    }

    // Ubicación
    if (propertyData.ubication?.locality) {
      parts.push(`en ${propertyData.ubication.locality}`)
    }

    description = parts.join(' ')

    // Agregar características principales
    const features: string[] = []
    if (propertyData.environments?.bedrooms) {
      features.push(
        `${propertyData.environments.bedrooms} dormitorio${propertyData.environments.bedrooms > 1 ? 's' : ''}`,
      )
    }
    if (propertyData.environments?.bathrooms) {
      features.push(
        `${propertyData.environments.bathrooms} baño${propertyData.environments.bathrooms > 1 ? 's' : ''}`,
      )
    }
    if (propertyData.caracteristics?.totalArea) {
      features.push(`${propertyData.caracteristics.totalArea}m² totales`)
    }

    if (features.length > 0) {
      description += `. ${features.join(', ')}.`
    }
  }

  return description
}

/**
 * Función para validar que los datos mínimos requeridos estén presentes
 */
export function validateMercadoLibreData(data: MercadoLibreData): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // === CAMPOS BÁSICOS REQUERIDOS ===
  if (!data.title) {
    errors.push('Título es requerido')
  }

  if (!data.category_id) {
    errors.push('Categoría es requerida')
  }

  if (!data.price || data.price <= 0) {
    errors.push('Precio debe ser mayor a 0')
  }

  if (!data.currency_id) {
    errors.push('Moneda es requerida')
  }

  if (!data.description) {
    errors.push('Descripción es requerida')
  }

  // === VALIDAR ATRIBUTOS REQUERIDOS ===
  const attributes = data.attributes || []
  const attributeIds = attributes.map((attr) => attr.id)

  // Campos requeridos según mercadolibredata.json
  const requiredAttributes = [
    { id: 'TOTAL_AREA', name: 'Superficie total' },
    { id: 'COVERED_AREA', name: 'Superficie cubierta' },
    { id: 'BEDROOMS', name: 'Dormitorios' },
    { id: 'FULL_BATHROOMS', name: 'Baños' },
    { id: 'PARKING_LOTS', name: 'Cocheras' },
  ]

  // Validar atributos requeridos para alquiler temporario
  const hasGuestsAttribute = attributeIds.includes('GUESTS')
  if (data.category_id === 'MLA50278' && !hasGuestsAttribute) {
    // Alquiler temporario
    errors.push('Huéspedes es requerido para alquiler temporario')
  }

  // Validar atributos básicos requeridos
  requiredAttributes.forEach((reqAttr) => {
    const hasAttribute = attributeIds.includes(reqAttr.id)
    if (!hasAttribute) {
      errors.push(`${reqAttr.name} es requerido`)
    } else {
      // Validar que tenga valor
      const attribute = attributes.find((attr) => attr.id === reqAttr.id)
      if (attribute && !attribute.value_name && !attribute.value_id) {
        errors.push(`${reqAttr.name} debe tener un valor`)
      }
    }
  })

  // === VALIDACIONES DE NEGOCIO ===

  // Validar que tenga al menos una imagen
  if (!data.pictures || data.pictures.length === 0) {
    errors.push('Se requiere al menos una imagen')
  }

  // Validar ubicación
  if (!data.location?.city?.name) {
    errors.push('Ubicación (ciudad) es requerida')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Función helper para debug - muestra el mapeo completo
 */
export function debugMercadoLibreMapping(propertyData: PropertyData): void {
  console.log('Original propertyData:', propertyData)
  const mapped = mapFormDataToMercadoLibre(propertyData)
  console.log('Mapped to MercadoLibre:', mapped)
  const validation = validateMercadoLibreData(mapped)
  console.log('Validation result:', validation)
}
