// Utilidad para mapear datos de formData al formato requerido por Inmoup API

import { inmoupMappings } from '@/data/inmoupMappings'

// Nueva interfaz para datos normales (sin .value)
interface PropertyData {
  title?: string
  aiContent?: {
    title?: string
    description?: string
  }
  description?: string
  classification?: {
    type?: string
    condition?: string
  }
  caracteristics?: {
    price?: number
    currency?: string
    totalArea?: number
    coveredArea?: number
    conservationStatus?: string
    orientation?: string
    antiquity?: string
    frontMeters?: number
    deepMeters?: number
    hasExpenses?: string
    expenses?: number
    expensesCurrency?: string
    appraisal?: number
    appraisalCurrency?: string
    pricePerSquareMeterArs?: number
    pricePerSquareMeterUsd?: number
  }
  environments?: {
    bedrooms?: number
    bathrooms?: number
    garages?: number
    toilettes?: number
    livingRooms?: number
    kitchens?: number
    diningRooms?: number
    totalRooms?: number
    plantas?: number
    ambientes?: number
    garageType?: string
    furnished?: string
  }
  ubication?: {
    address?: string
    province?: string
    department?: string
    locality?: string
    neighborhood?: string
    mapLocation?: {
      lat?: number
      lng?: number
    }
  }
  images?: {
    coverImage?: any
    gallery?: any[]
    videoUrl?: string
    virtualTourUrl?: string
  }
  amenities?: {
    servicios?: string[]
    ambientes?: string[]
    zonasCercanas?: string[]
    agua?: string
    cloacas?: string
    gas?: string
    luz?: string
    estrellas?: number
    mascotas?: string
    barrioPrivado?: string

    extra?: {
      bauleras?: number
      numeroCasa?: string
      guests?: number
      checkinTime?: string
      checkoutTime?: string
      camas?: number
      minimumStay?: number
      disposicion?: string
      superficieBalcon?: number
      departamentosPorPiso?: number
    }
    [key: string]: any
  }
}

interface InmoupData {
  title: string
  description?: string
  propertyType: string | number
  condition: string | number
  price: number
  currency: string | number
  totalArea?: number
  coveredArea?: number
  bedrooms?: number | string
  bathrooms?: number | string
  garages?: number
  toilettes?: number
  livingRooms?: number
  kitchens?: number
  diningRooms?: number
  totalRooms?: number
  plantas?: number
  ambientes?: number
  estrellas?: number
  agua?: string
  cloacas?: string
  gas?: string
  luz?: string
  mascotas?: string
  barrioPrivado?: string
  address: string
  province?: string | number
  department?: string | number
  locality?: string | number
  neighborhood?: string
  conservationStatus?: string | number
  orientation?: string | number
  garageType?: string | number
  furnished?: boolean | string | number
  antiquity?: string | number | { value: number; tiempo: string }
  frontMeters?: number
  deepMeters?: number
  expenses?: number
  expensesCurrency?: string | number
  appraisal?: number
  appraisalCurrency?: string | number
  amenityServices?: (string | number)[]
  amenityEnvironments?: (string | number)[]
  amenityNearbyZones?: (string | number)[]
  lat?: number
  lng?: number
  zona_id?: string | number
  [key: string]: any
}

/**
 * Función para mapear un valor individual usando los mapeos de Inmoup (para mapeos simples)
 */
function mapValue(
  value: string,
  mappingType: Exclude<keyof typeof inmoupMappings, 'antiquity'>,
): string | number {
  if (!value) return value

  const mapping = inmoupMappings[mappingType]
  const mappedValue = mapping[value] as string | number | undefined
  return mappedValue || value
}

/**
 * Función específica para mapear la antigüedad que devuelve un objeto
 */
function mapAntiquity(value: string): { value: number; tiempo: string } | string {
  if (!value) return value

  const antiquityMapping = inmoupMappings.antiquity[value]
  return antiquityMapping || value
}

/**
 * Función para mapear arrays de valores (para amenities)
 */
function mapArrayValues(
  values: string[],
  mappingType: Exclude<keyof typeof inmoupMappings, 'antiquity'>,
): (string | number)[] {
  if (!Array.isArray(values)) return []

  return values.map((value) => mapValue(value, mappingType))
}

/**
 * Función principal para convertir propertyData al formato de Inmoup
 */
export function mapFormDataToInmoup(propertyData: PropertyData): InmoupData {
  // Mapeo básico de la propiedad
  console.log('data recibed propertyData:', propertyData)
  const mappedData: InmoupData = {
    // Información básica
    title: propertyData.aiContent?.title || propertyData.title || '',
    description: propertyData.aiContent?.description || propertyData.description,

    // Clasificación
    propertyType: mapValue(propertyData.classification?.type || '', 'propertyType'),
    condition: mapValue(propertyData.classification?.condition || '', 'condition'),

    // Precio
    price: propertyData.caracteristics?.price || 0,
    currency: mapValue(propertyData.caracteristics?.currency || '', 'currency'),

    // Superficies
    totalArea: propertyData.caracteristics?.totalArea,
    coveredArea: propertyData.caracteristics?.coveredArea,
    pricePerSquareMeterArs: propertyData.caracteristics?.pricePerSquareMeterArs,
    pricePerSquareMeterUsd: propertyData.caracteristics?.pricePerSquareMeterUsd,
    // Ambientes
    bedrooms: propertyData.environments?.bedrooms,
    bathrooms: propertyData.environments?.bathrooms,
    garages: propertyData.environments?.garages,
    toilettes: propertyData.environments?.toilettes,
    livingRooms: propertyData.environments?.livingRooms,
    kitchens: propertyData.environments?.kitchens,
    diningRooms: propertyData.environments?.diningRooms,
    totalRooms: propertyData.environments?.totalRooms,
    plantas: propertyData.environments?.plantas,
    ambientes: propertyData.environments?.ambientes,
    garageType: mapValue(propertyData.environments?.garageType || '', 'garageType'),
    furnished: mapValue(propertyData.environments?.furnished || '', 'furnished'),
    videoUrl: propertyData.images?.videoUrl,
    virtualTourUrl: propertyData.images?.virtualTourUrl,
    // Nuevos campos específicos - priorizar campos directos sobre servicios
    agua:
      propertyData.amenities?.agua ||
      (propertyData.amenities?.servicios?.includes('agua_corriente') ? 'Si' : undefined),
    cloacas:
      propertyData.amenities?.cloacas ||
      (propertyData.amenities?.servicios?.includes('desague_cloacal') ? 'Si' : undefined),
    gas:
      propertyData.amenities?.gas ||
      (propertyData.amenities?.servicios?.includes('gas_natural') ? 'Si' : undefined),
    luz:
      propertyData.amenities?.luz ||
      (propertyData.amenities?.servicios?.includes('luz') ? 'Si' : undefined),
    estrellas: propertyData.amenities?.estrellas,
    mascotas: propertyData.amenities?.mascotas,
    barrioPrivado: propertyData.amenities?.barrioPrivado,

    // Ubicación
    address: propertyData.ubication?.address || '',
    province: 'Mendoza', // Fijo para Mendoza 21
    department: mapValue(propertyData.ubication?.department || '', 'department'),
    locality: mapValue(propertyData.ubication?.department || '', 'department'),
    neighborhood: propertyData.ubication?.neighborhood,
    lat: propertyData.ubication?.mapLocation?.lat,
    lng: propertyData.ubication?.mapLocation?.lng,
    zona_id: mapValue(propertyData.ubication?.locality || '', 'locality'),

    // Características físicas
    conservationStatus: mapValue(
      propertyData.caracteristics?.conservationStatus || '',
      'conservationStatus',
    ),
    orientation: mapValue(propertyData.caracteristics?.orientation || '', 'orientation'),
    antiquity: mapAntiquity(propertyData.caracteristics?.antiquity || ''),
    frontMeters: propertyData.caracteristics?.frontMeters,
    deepMeters: propertyData.caracteristics?.deepMeters,

    // Gastos adicionales
    hasExpenses: propertyData.caracteristics?.hasExpenses,
    expenses: propertyData.caracteristics?.expenses,
    expensesCurrency: mapValue(propertyData.caracteristics?.expensesCurrency || '', 'currency'),
    appraisal: propertyData.caracteristics?.appraisal,
    appraisalCurrency: mapValue(propertyData.caracteristics?.appraisalCurrency || '', 'currency'),
  }

  // Mapear amenities si existen
  if (propertyData.amenities?.servicios && Array.isArray(propertyData.amenities.servicios)) {
    mappedData.amenityServices = mapArrayValues(propertyData.amenities.servicios, 'amenityServices')
  }

  if (propertyData.amenities?.ambientes && Array.isArray(propertyData.amenities.ambientes)) {
    mappedData.amenityEnvironments = mapArrayValues(
      propertyData.amenities.ambientes,
      'amenityEnvironments',
    )
  }

  if (
    propertyData.amenities?.zonasCercanas &&
    Array.isArray(propertyData.amenities.zonasCercanas)
  ) {
    mappedData.amenityNearbyZones = mapArrayValues(
      propertyData.amenities.zonasCercanas,
      'amenityNearbyZones',
    )
  }

  // Limpiar valores undefined/null para envío API
  const cleanedData: InmoupData = Object.entries(mappedData).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      acc[key] = value
    }
    return acc
  }, {} as InmoupData)

  return cleanedData
}

/**
 * Función para validar que los datos mínimos requeridos estén presentes
 */
export function validateInmoupData(data: InmoupData): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  // Campos requeridos básicos
  if (!data.title) {
    errors.push('Título es requerido')
  }

  if (!data.propertyType) {
    errors.push('Tipo de propiedad es requerido')
  }

  if (!data.condition) {
    errors.push('Condición de operación es requerida')
  }

  if (!data.price || data.price <= 0) {
    errors.push('Precio debe ser mayor a 0')
  }

  if (!data.currency) {
    errors.push('Moneda es requerida')
  }

  if (!data.address) {
    errors.push('Dirección es requerida')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Función helper para debug - muestra el mapeo completo
 */
export function debugMapping(propertyData: PropertyData): void {
  console.log('Original propertyData:', propertyData)
  const mapped = mapFormDataToInmoup(propertyData)
  console.log('Mapped to Inmoup:', mapped)
  const validation = validateInmoupData(mapped)
  console.log('Validation result:', validation)
}
