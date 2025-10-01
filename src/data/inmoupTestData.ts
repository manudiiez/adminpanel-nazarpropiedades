/**
 * Datos de prueba para testear el sistema de mapeo de Inmoup
 */

export const sampleFormData = {
  // Datos básicos
  title: 'Casa moderna en Las Heras',
  description: 'Hermosa casa con todas las comodidades, ideal para familia',
  property_type: 'casa',
  property_condition: 'venta',

  // Precio
  price_usd: 180000,
  price_ars: 150000000,
  currency: 'USD',

  // Ubicación
  address: 'Av. San Martín 1234',
  province: 'mendoza',
  department: 'las_heras',
  locality: 'las_heras_city',
  neighborhood: 'centro',

  // Características
  total_area: 350,
  covered_area: 280,
  front_meters: 12,
  deep_meters: 30,
  orientation: 'norte',
  conservation_status: 'excelente',
  antiquity: 5,
  furnished: false,

  // Ambientes
  bedrooms: 3,
  bathrooms: 2,
  toilettes: 1,
  garages: 2,
  garage_type: 'cubierta',
  living_rooms: 1,
  kitchens: 1,
  dining_rooms: 1,
  total_rooms: 8,

  // Gastos adicionales
  expenses: 25000,
  expenses_currency: 'ARS',
  appraisal: 200000,
  appraisal_currency: 'USD',

  // Amenities
  amenity_services: ['gas_natural', 'agua_corriente', 'electricidad', 'internet'],
  amenity_environments: ['jardin', 'parrilla', 'pileta'],
  amenity_nearby_zones: ['supermercado', 'hospital', 'colegios'],
}

export const sampleOwnerData = {
  fullname: 'Juan Pérez',
  email: 'juan.perez@email.com',
  phone: '+54 261 123-4567',
}

/**
 * Función para probar el mapeo completo
 */
export function getTestData() {
  return {
    formData: sampleFormData,
    ownerData: sampleOwnerData,
  }
}

/**
 * Resultado esperado del mapeo
 */
export const expectedMappedData = {
  // Datos básicos
  propertyType: 1, // Mapeo numérico de casa
  condition: 1, // Mapeo numérico de venta
  title: 'Casa moderna en Las Heras',
  description: 'Hermosa casa con todas las comodidades, ideal para familia',

  // Precio
  price: 180000,
  currency: 'USD',

  // Ubicación
  address: 'Av. San Martín 1234',
  province: 'mendoza',
  department: 6, // Mapeo numérico de las_heras
  locality: 'las-heras', // Mapeo de las_heras_city
  neighborhood: 'centro',

  // Características
  totalArea: 350,
  coveredArea: 280,
  frontMeters: 12,
  deepMeters: 30,
  orientation: 'norte',
  conservationStatus: 'excelente',
  antiquity: 5,
  furnished: false,

  // Ambientes
  bedrooms: 3,
  bathrooms: 2,
  toilettes: 1,
  garages: 2,
  garageType: 'cubierta',
  livingRooms: 1,
  kitchens: 1,
  diningRooms: 1,
  totalRooms: 8,

  // Gastos
  expenses: 25000,
  expensesCurrency: 'ARS',
  appraisal: 200000,
  appraisalCurrency: 'USD',

  // Servicios mapeados
  amenityServices: ['gas-natural', 'agua-corriente', 'electricidad', 'internet'],
  amenityEnvironments: ['jardin', 'parrilla', 'pileta'],
  amenityNearbyZones: ['supermercado', 'hospital', 'colegios'],
}
