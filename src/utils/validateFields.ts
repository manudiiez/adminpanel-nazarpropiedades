// Tipos para las validaciones
interface ValidationData {
  classification?: {
    type?: string
    condition?: string
  }
  [key: string]: any
}

interface ValidationArgs {
  data: ValidationData
}

// Validación para hasExpenses
export const validateHasExpenses = (value: any, { data }: ValidationArgs) => {
  // Requerido para ciertos tipos básicos
  const requiredTypes = [
    'departamento',
    'lote',
    'cochera',
    'condominio',
    'duplex',
    'fondo_de_comercio',
    'local_comercial',
    'loft',
    'oficina',
    'ph',
    'piso',
    'semipiso',
    'terreno',
    'triplex',
  ]

  const isCasaVenta =
    data?.classification?.type === 'casa' &&
    (data?.classification?.condition === 'venta' || data?.classification?.condition === 'permuta')

  const isQuintaVenta =
    data?.classification?.type === 'quinta' &&
    (data?.classification?.condition === 'venta' || data?.classification?.condition === 'permuta')

  const isFraccionamientoVenta =
    data?.classification?.type === 'fraccionamiento' &&
    (data?.classification?.condition === 'venta' || data?.classification?.condition === 'permuta')

  const isIndustriaVenta =
    data?.classification?.type === 'industria' &&
    (data?.classification?.condition === 'venta' || data?.classification?.condition === 'permuta')

  const isLoteoVenta =
    data?.classification?.type === 'loteo' &&
    (data?.classification?.condition === 'venta' || data?.classification?.condition === 'permuta')

  if (
    requiredTypes.includes(data?.classification?.type || '') ||
    isCasaVenta ||
    isQuintaVenta ||
    isFraccionamientoVenta ||
    isIndustriaVenta ||
    isLoteoVenta
  ) {
    if (!value) {
      return 'Este campo es obligatorio.'
    }
  }

  return true
}

// Validación para coveredArea
export const validateCoveredArea = (value: any, { data }: ValidationArgs) => {
  const requiredTypes = [
    'casa',
    'departamento',
    'cabaña',
    'quinta',
    'condominio',
    'oficina',
    'ph',
    'piso',
    'semipiso',
    'bodega',
    'chalet',
    'deposito',
    'duplex',
    'edificio',
    'estacion_de_servicio',
    'fábrica',
    'finca',
    'fondo_de_comercio',
    'fraccionamiento',
    'galpon',
    'industria',
    'playa_de_estacionamiento',
    'triplex',
    'vinedo',
    'local_comercial',
    'bodega_con_vinedo',
    'hotel',
    'industria',
    'negocio',
  ]

  if (requiredTypes.includes(data?.classification?.type || '')) {
    if (!value || value === 0) {
      return 'Este campo es obligatorio.'
    }
  }

  return true
}

// Validación para totalArea
export const validateTotalArea = (value: any, { data }: ValidationArgs) => {
  const requiredTypes = [
    'casa',
    'departamento',
    'lote',
    'cabaña',
    'quinta',
    'condominio',
    'duplex',
    'loteo',
    'oficina',
    'ph',
    'piso',
    'semipiso',
    'terreno',
    'bodega',
    'campo',
    'chalet',
    'cochera',
    'deposito',
    'edificio',
    'estacion_de_servicio',
    'fábrica',
    'finca',
    'fondo_de_comercio',
    'fraccionamiento',
    'galpon',
    'hotel',
    'industria',
    'playa_de_estacionamiento',
    'triplex',
    'vinedo',
    'local_comercial',
    'bodega_con_vinedo',
    'negocio',
  ]

  if (requiredTypes.includes(data?.classification?.type || '')) {
    if (!value || value === 0) {
      return 'Este campo es obligatorio.'
    }
  }

  return true
}

// Validación para antiquity
export const validateAntiquity = (value: any, { data }: ValidationArgs) => {
  const requiredTypes = [
    'casa',
    'departamento',
    'bodega',
    'cabaña',
    'campo',
    'quinta',
    'chalet',
    'condominio',
    'deposito',
    'duplex',
    'edificio',
    'estacion_de_servicio',
    'fábrica',
    'finca',
    'fondo_de_comercio',
    'fraccionamiento',
    'galpon',
    'hotel',
    'industria',
    'local_comercial',
    'loft',
    'loteo',
    'oficina',
    'ph',
    'piso',
    'playa_de_estacionamiento',
    'semipiso',
    'triplex',
    'vinedo',
  ]

  if (requiredTypes.includes(data?.classification?.type || '')) {
    if (!value || value === 0) {
      return 'Este campo es obligatorio.'
    }
  }

  return true
}
// Validación para antiquity
export const validateFrontAndDeep = (value: any, { data }: ValidationArgs) => {
  const requiredTypes = ['lote']

  if (requiredTypes.includes(data?.classification?.type || '')) {
    if (!value || value === 0) {
      return 'Este campo es obligatorio.'
    }
  }

  return true
}

// Validación para conservationStatus
export const validateConservationStatus = (value: any, { data }: ValidationArgs) => {
  const requiredTypes = [
    'casa',
    'departamento',
    'bodega',
    'cabaña',
    'quinta',
    'chalet',
    'cochera',
    'condominio',
    'deposito',
    'duplex',
    'edificio',
    'estacion_de_servicio',
    'fábrica',
    'finca',
    'galpon',
    'hotel',
    'industria',
    'local_comercial',
    'loft',
    'oficina',
    'ph',
    'piso',
    'playa_de_estacionamiento',
    'semipiso',
    'triplex',
    'vinedo',
  ]
  const isCampoAlquiler =
    data?.classification?.type === 'campo' &&
    (data?.classification?.condition === 'venta' || data?.classification?.condition === 'permuta')

  if (requiredTypes.includes(data?.classification?.type || '') || isCampoAlquiler) {
    if (!value || value === 0) {
      return 'Este campo es obligatorio.'
    }
  }
  return true
}

// Validación para bedrooms
export const validateBedrooms = (value: any, { data }: ValidationArgs) => {
  const requiredTypes = [
    'casa',
    'departamento',
    'cabaña',
    'quinta',
    'condominio',
    'duplex',
    'ph',
    'piso',
    'semipiso',
    'chalet',
    'triplex',
    'campo',
  ]

  if (requiredTypes.includes(data?.classification?.type || '')) {
    if (!value || value === 0) {
      return 'Este campo es obligatorio.'
    }
  }

  return true
}

// Validación para bathrooms
export const validateBathrooms = (value: any, { data }: ValidationArgs) => {
  const requiredTypes = [
    'casa',
    'departamento',
    'cabaña',
    'quinta',
    'condominio',
    'duplex',
    'ph',
    'piso',
    'semipiso',
    'bodega',
    'chalet',
    'deposito',
    'estacion_de_servicio',
    'fábrica',
    'fondo_de_comercio',
    'galpon',
    'industria',
    'playa_de_estacionamiento',
    'triplex',
    'campo',
    'local_comercial',
    'oficina',
  ]

  if (requiredTypes.includes(data?.classification?.type || '')) {
    if (!value || value === 0) {
      return 'Este campo es obligatorio.'
    }
  }

  return true
}

// Validación para garageType
export const validateGarageType = (value: any, { data }: ValidationArgs) => {
  const requiredTypes = [
    'casa',
    'departamento',
    'cabaña',
    'quinta',
    'condominio',
    'duplex',
    'piso',
    'chalet',
    'triplex',
    'ph',
  ]

  if (requiredTypes.includes(data?.classification?.type || '')) {
    if (!value || value === 0) {
      return 'Este campo es obligatorio.'
    }
  }

  return true
}

// Validación para mascotas

export const validateMascotas = (value: any, { data }: ValidationArgs) => {
  // Requerido para ciertos tipos básicos
  const requiredTypes = [
    'departamento',
    'cabaña',
    'chalet',
    'condominio',
    'duplex',
    'loft',
    'ph',
    'piso',
    'semipiso',
    'triplex',
  ]

  const isQuintaAlquiler =
    data?.classification?.type === 'quinta' &&
    (data?.classification?.condition === 'alquiler' ||
      data?.classification?.condition === 'alquiler_temporario')

  if (requiredTypes.includes(data?.classification?.type || '') || isQuintaAlquiler) {
    if (!value) {
      return 'Este campo es obligatorio.'
    }
  }

  return true
}
export const validateAmbientes = (value: any, { data }: ValidationArgs) => {
  // Requerido para ciertos tipos básicos
  const requiredTypes = ['departamento', 'ph']

  if (requiredTypes.includes(data?.classification?.type || '')) {
    if (!value) {
      return 'Este campo es obligatorio.'
    }
  }

  return true
}
