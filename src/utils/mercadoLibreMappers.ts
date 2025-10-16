// src/utils/mercadoLibreMapper.ts

import { mercadolibreMappings, propertyType } from '@/data/mercadolibreMappings'

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
    landArea?: number
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
    ambientes?: number
    furnished?: string
  }

  // Amenities
  amenities?: {
    barrioPrivado?: string
    servicios?: string[]
    ambientes?: string[]
    zonasCercanas?: string[]
    mascotas?: string
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
  extra?: {
    bauleras?: number
    numeroCasa?: string
    guests?: number
    checkinTime?: string
    checkoutTime?: string
    camas?: number
    minimumStay?: number
  }
}

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

export function mapFormDataToMercadoLibre(propertyData: PropertyData, images: any[]) {
  const classification = propertyData.classification || {}
  const ubication = propertyData.ubication || {}
  const caracteristics = propertyData.caracteristics || {}
  const environments = propertyData.environments || {}
  const amenities = propertyData.amenities || {}
  const aiContent = propertyData.aiContent || {}
  const extra = propertyData.extra || {}
  const propertyImages = propertyData.images || {}
  // Normalizar texto plano: mantener solo saltos de línea `\n`, recortar espacios
  const normalizePlainText = (input: any): string => {
    if (input === undefined || input === null) return 'Propiedad disponible'
    // Si vienen como array de strings
    if (Array.isArray(input)) {
      input = input.join('\n')
    }
    let text = String(input)
    // Normalizar retornos de carro
    text = text.replace(/\r\n?/g, '\n')
    // Dividir en líneas, recortar cada una y colapsar espacios internos
    const lines = text.split('\n').map((l) => l.replace(/\s+/g, ' ').trim())
    // Eliminar líneas vacías consecutivas y trim de inicio/fin
    const out: string[] = []
    for (const line of lines) {
      if (line === '') {
        if (out.length === 0) continue
        if (out[out.length - 1] === '') continue
        out.push('')
      } else {
        out.push(line)
      }
    }
    // Quitar posibles líneas vacías al inicio/fin
    while (out.length && out[0] === '') out.shift()
    while (out.length && out[out.length - 1] === '') out.pop()
    return out.join('\n') || 'Propiedad disponible'
  }
  // Determinar operación
  const operation = classification.condition?.toLowerCase() === 'venta' ? 'Venta' : 'Alquiler'

  // Construir título (máximo 60 caracteres)
  const title = aiContent.title || `${mapPropertyTypeToLabel(classification.type)} en ${operation}`

  // Precio
  const price = caracteristics.price || 0
  const currency = caracteristics.currency?.toUpperCase() === 'USD' ? 'USD' : 'ARS'

  // Procesar imágenes - combinar gallery y coverImage
  const allImages: any[] = []

  // Agregar cover image si existe
  if (propertyImages.coverImage?.url) {
    allImages.push({
      source: `${process.env.NEXT_PUBLIC_SERVER_URL}${propertyImages.coverImage.url}`,
    })
  }

  // Agregar imágenes de la galería
  if (propertyImages.gallery && Array.isArray(propertyImages.gallery)) {
    propertyImages.gallery.forEach((img: any) => {
      if (img.url) {
        allImages.push({
          source: `${process.env.NEXT_PUBLIC_SERVER_URL}${img.url}`,
        })
      }
    })
  }

  // Agregar imágenes adicionales del parámetro
  if (images && Array.isArray(images)) {
    images.forEach((img: any) => {
      const imgUrl = typeof img === 'string' ? img : img.url
      if (imgUrl && !allImages.some((i) => i.source === imgUrl)) {
        allImages.push({ source: imgUrl })
      }
    })
  }

  // Construir atributos
  const attributes: any[] = []

  // ===== ATRIBUTOS OBLIGATORIOS =====

  // Superficie total (REQUERIDO)
  if (caracteristics.totalArea && caracteristics.totalArea > 0) {
    attributes.push({
      id: 'TOTAL_AREA',
      value_name: `${caracteristics.totalArea} m²`,
      value_struct: {
        number: caracteristics.totalArea,
        unit: 'm²',
      },
    })
  }

  // Superficie cubierta (REQUERIDO)
  if (caracteristics.coveredArea && caracteristics.coveredArea > 0) {
    attributes.push({
      id: 'COVERED_AREA',
      value_name: `${caracteristics.coveredArea} m²`,
      value_struct: {
        number: caracteristics.coveredArea,
        unit: 'm²',
      },
    })
  }

  // Superficie cubierta (REQUERIDO)
  if (caracteristics.landArea && caracteristics.landArea > 0) {
    attributes.push({
      id: 'LAND_AREA',
      value_name: `${caracteristics.landArea} m²`,
      value_struct: {
        number: caracteristics.landArea,
        unit: 'm²',
      },
    })
  }

  // Dormitorios (REQUERIDO)
  if (environments.bedrooms !== undefined) {
    attributes.push({
      id: 'BEDROOMS',
      value_name: environments.bedrooms.toString(),
    })
  }

  // Baños (REQUERIDO)
  if (environments.bathrooms !== undefined) {
    attributes.push({
      id: 'FULL_BATHROOMS',
      value_name: environments.bathrooms.toString(),
    })
  }

  // Cocheras (REQUERIDO - si no tiene, enviar 0)
  attributes.push({
    id: 'PARKING_LOTS',
    value_name: (environments.garages || 0).toString(),
  })

  // ===== ATRIBUTOS OPCIONALES =====

  // Antigüedad
  if (caracteristics.antiquity) {
    const antiguedadValue = parseAntiquity(caracteristics.antiquity)
    if (antiguedadValue > 0) {
      attributes.push({
        id: 'PROPERTY_AGE',
        value_name: `${antiguedadValue} años`,
        value_struct: {
          number: antiguedadValue,
          unit: 'años',
        },
      })
    }
  }

  // Ambientes
  if (environments.ambientes) {
    const ambientesNum = environments.ambientes
    if (ambientesNum > 0) {
      attributes.push({
        id: 'ROOMS',
        value_name: ambientesNum.toString(),
      })
    }
  }

  // Cantidad de pisos
  if (environments.plantas && environments.plantas > 0) {
    attributes.push({
      id: 'FLOORS',
      value_name: environments.plantas.toString(),
    })
  }

  if (extra.bauleras) {
    attributes.push({
      id: 'WAREHOUSES',
      value_name: extra.bauleras,
    })
  }

  if (extra.numeroCasa) {
    attributes.push({
      id: 'HOUSE_NUMBER',
      value_name: extra.numeroCasa,
    })
  }

  if (extra.guests) {
    attributes.push({
      id: 'GUESTS',
      value_name: extra.guests,
    })
  }

  if (extra.checkinTime) {
    attributes.push({
      id: 'CHECK_IN',
      value_name: extra.checkinTime,
    })
  }
  if (extra.checkoutTime) {
    attributes.push({
      id: 'CHECK_OUT',
      value_name: extra.checkoutTime,
    })
  }

  // Tipo de casa
  const houseSubtype = mapHouseSubtype(classification.type)
  if (houseSubtype) {
    attributes.push({
      id: 'HOUSE_PROPERTY_SUBTYPE',
      value_id: houseSubtype.id,
      value_name: houseSubtype.name,
    })
  }

  // Orientación
  if (caracteristics.orientation) {
    const orientacion = mapOrientation(caracteristics.orientation)
    if (orientacion) {
      attributes.push({
        id: 'FACING',
        value_id: orientacion.id,
        value_name: orientacion.name,
      })
    }
  }

  // Expensas
  if (caracteristics.expenses && caracteristics.expenses > 0) {
    const expensesCurrency = caracteristics.expensesCurrency?.toUpperCase() || currency
    attributes.push({
      id: 'MAINTENANCE_FEE',
      value_name: `${caracteristics.expenses} ${expensesCurrency}`,
      value_struct: {
        number: caracteristics.expenses,
        unit: expensesCurrency,
      },
    })
  }

  // ===== AMENITIES BOOLEANOS =====

  const servicios = amenities.servicios || []
  const ambientesArray = amenities.ambientes || []

  // Acceso a internet
  if (servicios.includes('internet')) {
    attributes.push({
      id: 'HAS_INTERNET_ACCESS',
      value_id: '242085',
      value_name: 'Sí',
    })
  }

  // Caldera
  if (servicios.includes('caldera')) {
    attributes.push({
      id: 'HAS_BOILER',
      value_id: '242085',
      value_name: 'Sí',
    })
  }

  // Servicio de Desayuno
  if (servicios.includes('servicio_de_desayuno')) {
    attributes.push({
      id: 'BREAKFAST_SERVICE',
      value_id: '242085',
      value_name: 'Sí',
    })
  } else {
    attributes.push({
      id: 'BREAKFAST_SERVICE',
      value_id: '242084',
      value_name: 'No',
    })
  }

  // Servicio de Limpieza
  if (servicios.includes('servicio_de_limpieza')) {
    attributes.push({
      id: 'HOUSEKEEPING_SERVICE',
      value_id: '242085',
      value_name: 'Sí',
    })
  } else {
    attributes.push({
      id: 'HOUSEKEEPING_SERVICE',
      value_id: '242084',
      value_name: 'No',
    })
  }

  // Energía solar
  if (servicios.includes('energia_solar')) {
    attributes.push({
      id: 'WITH_SOLAR_ENERGY',
      value_id: '242085',
      value_name: 'Sí',
    })
  }

  // Cisterna
  if (servicios.includes('cisterna')) {
    attributes.push({
      id: 'HAS_CISTERN',
      value_id: '242085',
      value_name: 'Sí',
    })
  }

  // Cisterna
  if (servicios.includes('conexion_para_lavarropas')) {
    attributes.push({
      id: 'WITH_LAUNDRY_CONNECTION',
      value_id: '242085',
      value_name: 'Sí',
    })
  }

  // Aire acondicionado
  if (servicios.includes('aire_acondicionado')) {
    attributes.push({
      id: 'HAS_AIR_CONDITIONING',
      value_id: '242085',
      value_name: 'Sí',
    })
  }
  // Seguridad
  if (servicios.includes('seguridad')) {
    attributes.push({
      id: 'HAS_SECURITY',
      value_id: '242085',
      value_name: 'Sí',
    })
  }

  // Alarma
  if (servicios.includes('alarma')) {
    attributes.push({
      id: 'HAS_ALARM',
      value_id: '242085',
      value_name: 'Sí',
    })
  }

  // Balcón
  if (ambientesArray.includes('balcon')) {
    attributes.push({
      id: 'HAS_BALCONY',
      value_id: '242085',
      value_name: 'Sí',
    })
  }

  // Calefacción
  if (servicios.includes('calefaccion_central')) {
    attributes.push({
      id: 'HAS_HEATING',
      value_id: '242085',
      value_name: 'Sí',
    })
  }

  // Chimenea
  if (ambientesArray.includes('chimenea')) {
    attributes.push({
      id: 'HAS_INDOOR_FIREPLACE',
      value_id: '242085',
      value_name: 'Sí',
    })
  }

  // Cocina
  if (ambientesArray.includes('cocina')) {
    attributes.push({
      id: 'HAS_KITCHEN',
      value_id: '242085',
      value_name: 'Sí',
    })
  }

  // Comedor
  if (ambientesArray.includes('comedor') || ambientesArray.includes('living_comedor')) {
    attributes.push({
      id: 'HAS_DINNING_ROOM',
      value_id: '242085',
      value_name: 'Sí',
    })
  }

  // Dependencia de servicio
  if (ambientesArray.includes('dependencia_de_servicio')) {
    attributes.push({
      id: 'HAS_MAID_ROOM',
      value_id: '242085',
      value_name: 'Sí',
    })
  }

  // Dormitorio en suite
  if (ambientesArray.includes('dormitorio_en_suite')) {
    attributes.push({
      id: 'HAS_BEDROOM_SUITE',
      value_id: '242085',
      value_name: 'Sí',
    })
  }

  // Estudio
  if (ambientesArray.includes('estudio') || ambientesArray.includes('escritorio')) {
    attributes.push({
      id: 'HAS_STUDY',
      value_id: '242085',
      value_name: 'Sí',
    })
  }

  // Gas natural
  if (servicios.includes('gas_natural')) {
    attributes.push({
      id: 'HAS_NATURAL_GAS',
      value_id: '242085',
      value_name: 'Sí',
    })
  }

  // Gimnasio
  if (ambientesArray.includes('gimnasio')) {
    attributes.push({
      id: 'HAS_GYM',
      value_id: '242085',
      value_name: 'Sí',
    })
  }

  // Jardín
  if (ambientesArray.includes('patio')) {
    attributes.push({
      id: 'HAS_GARDEN',
      value_id: '242085',
      value_name: 'Sí',
    })
  } else {
    attributes.push({
      id: 'HAS_GARDEN',
      value_id: '242084',
      value_name: 'No',
    })
  }

  // Línea telefónica
  if (servicios.includes('telefono')) {
    attributes.push({
      id: 'HAS_TELEPHONE_LINE',
      value_id: '242085',
      value_name: 'Sí',
    })
  }

  // Living
  if (ambientesArray.includes('living') || ambientesArray.includes('living_comedor')) {
    attributes.push({
      id: 'HAS_LIVING_ROOM',
      value_id: '242085',
      value_name: 'Sí',
    })
  }

  // Parrilla
  if (ambientesArray.includes('parrilla')) {
    attributes.push({
      id: 'HAS_GRILL',
      value_id: '242085',
      value_name: 'Sí',
    })
  } else {
    attributes.push({
      id: 'HAS_GRILL',
      value_id: '242084',
      value_name: 'No',
    })
  }

  // Patio
  if (ambientesArray.includes('patio')) {
    attributes.push({
      id: 'HAS_PATIO',
      value_id: '242085',
      value_name: 'Sí',
    })
  }

  // Pileta/Piscina
  if (servicios.includes('piscina') || ambientesArray.includes('piscina')) {
    attributes.push({
      id: 'HAS_SWIMMING_POOL',
      value_id: '242085',
      value_name: 'Sí',
    })
  } else {
    attributes.push({
      id: 'HAS_SWIMMING_POOL',
      value_id: '242084',
      value_name: 'No',
    })
  }

  // Playroom
  if (ambientesArray.includes('area_de_juegos_infantiles')) {
    attributes.push({
      id: 'HAS_PLAYROOM',
      value_id: '242085',
      value_name: 'Sí',
    })
  }

  // Portón automático
  if (ambientesArray.includes('porton_automatico')) {
    attributes.push({
      id: 'HAS_ELECTRIC_GATE_OPENER',
      value_id: '242085',
      value_name: 'Sí',
    })
  }

  // Terraza
  if (ambientesArray.includes('terraza')) {
    attributes.push({
      id: 'HAS_TERRACE',
      value_id: '242085',
      value_name: 'Sí',
    })
  }

  // Jacuzzi
  if (ambientesArray.includes('jacuzzi')) {
    attributes.push({
      id: 'HAS_JACUZZI',
      value_id: '242085',
      value_name: 'Sí',
    })
  }

  // Vestidor
  if (ambientesArray.includes('vestidor')) {
    attributes.push({
      id: 'HAS_DRESSING_ROOM',
      value_id: '242085',
      value_name: 'Sí',
    })
  }

  // Toilette
  if (ambientesArray.includes('toilette')) {
    attributes.push({
      id: 'HAS_HALF_BATH',
      value_id: '242085',
      value_name: 'Sí',
    })
  } else {
    attributes.push({
      id: 'HAS_HALF_BATH',
      value_id: '242084',
      value_name: 'No',
    })
  }
  // Placards
  if (ambientesArray.includes('placards')) {
    attributes.push({
      id: 'HAS_CLOSETS',
      value_id: '242085',
      value_name: 'Sí',
    })
  }

  // Apto crédito hipotecario
  if (servicios.includes('apto_credito_hipotecario')) {
    attributes.push({
      id: 'SUITABLE_FOR_MORTGAGE_LOAN',
      value_id: '242085',
      value_name: 'Sí',
    })
  }

  // TV por cable
  if (servicios.includes('cable_tv')) {
    attributes.push({
      id: 'HAS_CABLE_TV',
      value_id: '242085',
      value_name: 'Sí',
    })
  }

  // Mascotas
  if (amenities.mascotas === 'Si') {
    attributes.push({
      id: 'IS_SUITABLE_FOR_PETS',
      value_id: '242085',
      value_name: 'Sí',
    })
  } else {
    attributes.push({
      id: 'IS_SUITABLE_FOR_PETS',
      value_id: '242084',
      value_name: 'No',
    })
  }
  // Barrio cerrado
  if (amenities.barrioPrivado === 'Si') {
    attributes.push({
      id: 'WITH_GATED_COMMUNITY',
      value_id: '242085',
      value_name: 'Sí',
    })
  } else {
    attributes.push({
      id: 'WITH_GATED_COMMUNITY',
      value_id: '242084',
      value_name: 'No',
    })
  }

  // Área de cine
  if (ambientesArray.includes('area_de_cine')) {
    attributes.push({
      id: 'HAS_CINEMA_HALL',
      value_id: '242085',
      value_name: 'Sí',
    })
  }

  // Área de juegos infantiles
  if (ambientesArray.includes('area_de_juegos_infantiles')) {
    attributes.push({
      id: 'HAS_PLAYGROUND',
      value_id: '242085',
      value_name: 'Sí',
    })
  }

  // Área verde
  if (ambientesArray.includes('area_verde')) {
    attributes.push({
      id: 'WITH_GREEN_AREA',
      value_id: '242085',
      value_name: 'Sí',
    })
  }

  // Ascensor
  if (ambientesArray.includes('ascensor')) {
    attributes.push({
      id: 'HAS_LIFT',
      value_id: '242085',
      value_name: 'Sí',
    })
  }

  // Cancha de paddle
  if (ambientesArray.includes('cancha_de_padel')) {
    attributes.push({
      id: 'HAS_PADDLE_COURT',
      value_id: '242085',
      value_name: 'Sí',
    })
  }

  // Cancha de tenis
  if (ambientesArray.includes('cancha_de_tenis')) {
    attributes.push({
      id: 'HAS_TENNIS_COURT',
      value_id: '242085',
      value_name: 'Sí',
    })
  }

  // Cancha de basquet
  if (ambientesArray.includes('cancha_de_basquet')) {
    attributes.push({
      id: 'HAS_BASKETBALL_COURT',
      value_id: '242085',
      value_name: 'Sí',
    })
  }

  // Cancha de futbol
  if (ambientesArray.includes('cancha_de_futbol')) {
    attributes.push({
      id: 'WITH_SOCCER_FIELD',
      value_id: '242085',
      value_name: 'Sí',
    })
  }

  // Cancha polideportiva
  if (ambientesArray.includes('cancha_polideportiva')) {
    attributes.push({
      id: 'WITH_MULTIPURPOSE_SPORT_COURT',
      value_id: '242085',
      value_name: 'Sí',
    })
  }

  // Desayunador
  if (ambientesArray.includes('desayunador')) {
    attributes.push({
      id: 'HAS_BREAKFAST_BAR',
      value_id: '242085',
      value_name: 'Sí',
    })
  }

  // Salón de usos múltiples
  if (ambientesArray.includes('salon_de_usos_multiples')) {
    attributes.push({
      id: 'HAS_PARTY_ROOM',
      value_id: '242085',
      value_name: 'Sí',
    })
  }

  // Sauna
  if (ambientesArray.includes('sauna')) {
    attributes.push({
      id: 'HAS_SAUNA',
      value_id: '242085',
      value_name: 'Sí',
    })
  }

  // Amoblado
  if (environments.furnished === 'si') {
    attributes.push({
      id: 'FURNISHED',
      value_id: '242085',
      value_name: 'Sí',
    })
  } else {
    attributes.push({
      id: 'FURNISHED',
      value_id: '242084',
      value_name: 'No',
    })
  }

  // Estacionamiento para visitantes
  if (ambientesArray.includes('estacionamiento_para_visitantes')) {
    attributes.push({
      id: 'HAS_GUEST_PARKING',
      value_id: '242085',
      value_name: 'Sí',
    })
  }

  // Con tour virtual
  if (propertyImages.virtualTourUrl) {
    attributes.push({
      id: 'WITH_VIRTUAL_TOUR',
      value_id: '242085',
      value_name: 'Sí',
    })
  }

  return {
    title: title.substring(0, 60),
    category_id: getMercadoLibreCategoryId(
      propertyData.classification?.type || '',
      propertyData.classification?.condition || '',
    ), // Inmuebles en Argentina
    price: price,
    currency_id: currency,
    available_quantity: 1,
    buying_mode: 'classified',
    listing_type_id: 'silver', // Puedes cambiar a 'free', 'gold_premium', etc.
    condition: 'not_specified',

    description: {
      plain_text: normalizePlainText(aiContent.description),
    },

    pictures: allImages.length > 0 ? allImages : undefined,

    attributes: attributes,

    // Mapear la ciudad usando departmentMappings y el barrio usando localityMappings
    location: {
      address_line: ubication.address || ubication.neighborhood || '',
      zip_code: '5001',
      city: (() => {
        // Buscar el department en departmentMappings
        const deptKey = ubication.department || ''
        const deptMapped = mercadolibreMappings.department[deptKey]

        // Si el mapping es un objeto con id y name, devolverlo tal cual
        if (
          deptMapped &&
          typeof deptMapped === 'object' &&
          'id' in deptMapped &&
          'name' in deptMapped
        ) {
          return deptMapped as { id: string; name: string }
        }

        // Si es un string, devolverlo como name
        if (deptMapped && typeof deptMapped === 'string') {
          return { name: deptMapped }
        }

        // Fallback
        return { name: ubication.department || 'Mendoza' }
      })(),
      neighborhood: (() => {
        // Buscar la locality en localityMappings
        const localityKey = ubication.locality || ''
        const localityMapped = mercadolibreMappings.locality[localityKey]

        // Si el mapping es un objeto con id y name, devolverlo tal cual
        if (
          localityMapped &&
          typeof localityMapped === 'object' &&
          'id' in localityMapped &&
          'name' in localityMapped
        ) {
          return localityMapped as { id: string; name: string }
        }

        // Si es un número o string, no es un barrio válido de MercadoLibre, no enviar neighborhood
        if (typeof localityMapped === 'number' || typeof localityMapped === 'string') {
          return undefined
        }

        // Fallback: intentar usar el valor original como name
        if (ubication.locality) {
          return { name: ubication.locality }
        }

        return undefined
      })(),
      state: {
        id: 'AR-M',
        name: 'Mendoza',
      },
      country: {
        id: 'AR',
        name: 'Argentina',
      },
      latitude: ubication.mapLocation?.lat,
      longitude: ubication.mapLocation?.lng,
    },

    // Video URL (si existe)
    ...(propertyImages.videoUrl && {
      video_id: extractYoutubeId(propertyImages.videoUrl),
    }),
  }
}

function mapPropertyTypeToLabel(type?: string): string {
  const typeMap: Record<string, string> = {
    casa: 'Casa',
    departamento: 'Departamento',
    ph: 'PH',
    local: 'Local',
    oficina: 'Oficina',
    terreno: 'Terreno',
    campo: 'Campo',
    galpon: 'Galpón',
    quinta: 'Quinta',
  }

  return typeMap[type?.toLowerCase() || ''] || 'Propiedad'
}

function mapHouseSubtype(type?: string): { id: string; name: string } | null {
  const subtypeMap: Record<string, { id: string; name: string }> = {
    casa: { id: '266257', name: 'Casa' },
    duplex: { id: '266259', name: 'Dúplex' },
    ph: { id: '266260', name: 'Ph' },
    triplex: { id: '266261', name: 'Tríplex' },
    cabana: { id: '266256', name: 'Cabaña' },
    chalet: { id: '266258', name: 'Chalet' },
  }

  return subtypeMap[type?.toLowerCase() || ''] || null
}

function mapOrientation(orientation?: string): { id: string; name: string } | null {
  const orientationMap: Record<string, { id: string; name: string }> = {
    norte: { id: '242327', name: 'Norte' },
    sur: { id: '242328', name: 'Sur' },
    este: { id: '242329', name: 'Este' },
    oeste: { id: '242330', name: 'Oeste' },
  }

  return orientationMap[orientation?.toLowerCase() || ''] || null
}

function parseAntiquity(antiquity?: string): number {
  if (!antiquity) return 0

  const match = antiquity.match(/(\d+)/)
  return match ? parseInt(match[1]) : 0
}

function extractYoutubeId(url?: string): string | undefined {
  if (typeof url !== 'string' || url.trim() === '') {
    return undefined
  }
  const regex =
    /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/

  const match = url.match(regex)
  return match ? match[1] : undefined
}

export function validateMercadoLibreData(data: any) {
  const errors: string[] = []

  if (!data.title || data.title.length === 0) {
    errors.push('El título es obligatorio')
  }

  if (data.title && data.title.length > 60) {
    errors.push('El título no puede superar los 60 caracteres')
  }

  if (!data.price || data.price <= 0) {
    errors.push('El precio debe ser mayor a 0')
  }

  if (!data.pictures || data.pictures.length === 0) {
    errors.push('Se requiere al menos una imagen')
  }

  if (!data.description?.plain_text) {
    errors.push('La descripción es obligatoria')
  }

  // Validar atributos obligatorios
  const requiredAttributes = [
    'TOTAL_AREA',
    'COVERED_AREA',
    'BEDROOMS',
    'FULL_BATHROOMS',
    'PARKING_LOTS',
  ]
  const presentAttributes = data.attributes?.map((attr: any) => attr.id) || []

  requiredAttributes.forEach((reqAttr) => {
    if (!presentAttributes.includes(reqAttr)) {
      errors.push(`Falta el atributo obligatorio: ${reqAttr}`)
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
  }
}
