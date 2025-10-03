import { NextRequest, NextResponse } from 'next/server'
import { mapFormDataToMercadoLibre, validateMercadoLibreData } from '../../../../utils/mercadoLibreMapper'
import { getPayload } from 'payload'
import config from '@payload-config'

// Función para limpiar campos vacíos en el objeto de edición
function cleanEmptyFields(obj: any): any {
  if (obj === null || obj === undefined) {
    return undefined
  }

  if (Array.isArray(obj)) {
    const cleanedArray = obj
      .map((item) => cleanEmptyFields(item))
      .filter((item) => item !== undefined)
    return cleanedArray.length > 0 ? cleanedArray : undefined
  }

  if (typeof obj === 'object') {
    const cleaned: any = {}

    for (const [key, value] of Object.entries(obj)) {
      const cleanedValue = cleanEmptyFields(value)

      // Solo incluir si el valor no está vacío
      if (
        cleanedValue !== undefined &&
        cleanedValue !== '' &&
        cleanedValue !== 0 &&
        cleanedValue !== null &&
        !(Array.isArray(cleanedValue) && cleanedValue.length === 0) &&
        !(typeof cleanedValue === 'object' && Object.keys(cleanedValue).length === 0)
      ) {
        cleaned[key] = cleanedValue
      }
    }

    return Object.keys(cleaned).length > 0 ? cleaned : undefined
  }

  // Para valores primitivos, devolver undefined si están vacíos
  if (obj === '' || obj === 0) {
    return undefined
  }

  return obj
}

// Función para obtener el access token de MercadoLibre
async function getMercadoLibreAccessToken(): Promise<string | null> {
  try {
    console.log('🔍 Obteniendo access token de MercadoLibre...')

    // Si ya tienes un token guardado en variables de entorno
    if (process.env.MERCADOLIBRE_ACCESS_TOKEN) {
      console.log('✅ Access token obtenido desde variables de entorno')
      return process.env.MERCADOLIBRE_ACCESS_TOKEN
    }

    // Si necesitas refresh del token
    if (process.env.MERCADOLIBRE_REFRESH_TOKEN) {
      const response = await fetch('https://api.mercadolibre.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: process.env.MERCADOLIBRE_CLIENT_ID || '',
          client_secret: process.env.MERCADOLIBRE_CLIENT_SECRET || '',
          refresh_token: process.env.MERCADOLIBRE_REFRESH_TOKEN || '',
        }),
      })

      if (!response.ok) {
        console.error('Error al renovar token de MercadoLibre:', response.status)
        return null
      }

      const tokenData = await response.json()
      console.log('✅ Access token renovado')
      return tokenData.access_token
    }

    console.error('No se encontró access token ni refresh token para MercadoLibre')
    return null
  } catch (error) {
    console.error('Error al obtener access token de MercadoLibre:', error)
    return null
  }
}

// Función para crear el objeto mercadoLibreData reutilizable
function createMercadoLibreData(
  mappedPropertyData: any,
  images: any[],
  propertyId?: string,
) {
  return {
    title: mappedPropertyData.title,
    category_id: mappedPropertyData.categoryId,
    price: mappedPropertyData.price,
    currency_id: mappedPropertyData.currencyId || 'ARS',
    available_quantity: 1,
    buying_mode: 'classified',
    listing_type_id: mappedPropertyData.listingType || 'gold_special',
    condition: 'new',
    description: {
      plain_text: mappedPropertyData.description,
    },
    pictures: images.map((img) => ({
      source: img.url || img,
    })),
    location: mappedPropertyData.location || {},
    attributes: mappedPropertyData.attributes || [],
    ...(propertyId && { id: propertyId }), // Solo incluir ID si existe (para edición)
  }
}

// Funciones auxiliares para manejo de estado del portal
async function updatePortalStatus(
  propertyId: string,
  status: 'queued' | 'ok' | 'error' | 'not_sent' | 'desactualizado',
  externalId?: string,
  externalUrl?: string,
  lastError?: string,
) {
  const payload = await getPayload({ config })

  const currentProperty = await payload.findByID({
    collection: 'propiedades',
    id: propertyId,
  })

  await payload.update({
    collection: 'propiedades',
    id: propertyId,
    data: {
      mercadolibre: {
        uploaded: status === 'ok' ? true : currentProperty?.mercadolibre?.uploaded || false,
        externalId: externalId || currentProperty?.mercadolibre?.externalId || null,
        externalUrl: externalUrl || currentProperty?.mercadolibre?.externalUrl || null,
        status,
        lastSyncAt: new Date().toISOString(),
        lastError: lastError || null,
      },
    },
  })
}

async function updatePortalError(propertyId: string, lastError: string) {
  const payload = await getPayload({ config })

  const currentProperty = await payload.findByID({
    collection: 'propiedades',
    id: propertyId,
  })

  await payload.update({
    collection: 'propiedades',
    id: propertyId,
    data: {
      mercadolibre: {
        uploaded: currentProperty?.mercadolibre?.uploaded || false,
        externalId: currentProperty?.mercadolibre?.externalId || null,
        externalUrl: currentProperty?.mercadolibre?.externalUrl || null,
        status: currentProperty?.mercadolibre?.status || 'error',
        lastSyncAt: new Date().toISOString(),
        lastError,
      },
    },
  })
}

async function clearPortalError(propertyId: string) {
  const payload = await getPayload({ config })

  const currentProperty = await payload.findByID({
    collection: 'propiedades',
    id: propertyId,
  })

  await payload.update({
    collection: 'propiedades',
    id: propertyId,
    data: {
      mercadolibre: {
        uploaded: currentProperty?.mercadolibre?.uploaded || false,
        externalId: currentProperty?.mercadolibre?.externalId || null,
        externalUrl: currentProperty?.mercadolibre?.externalUrl || null,
        status: currentProperty?.mercadolibre?.status || 'ok',
        lastSyncAt: new Date().toISOString(),
        lastError: null,
      },
    },
  })
}

async function restoreStateWithError(
  propertyId: string,
  initialState: any,
  errorMessage: string,
) {
  const payload = await getPayload({ config })

  await payload.update({
    collection: 'propiedades',
    id: propertyId,
    data: {
      mercadolibre: {
        uploaded: initialState.uploaded,
        externalId: initialState.externalId,
        externalUrl: initialState.externalUrl,
        status: initialState.status,
        lastSyncAt: new Date().toISOString(),
        lastError: errorMessage,
      },
    },
  })
}

// Función GET para información de la API
export async function GET() {
  return NextResponse.json({
    message: 'API de MercadoLibre para inmobiliarias',
    endpoints: {
      POST: 'Crear nueva publicación',
      PUT: 'Actualizar publicación existente', 
      DELETE: 'Eliminar publicación',
    },
    requiredFields: [
      'title (máximo 60 caracteres)',
      'description',
      'price (número)',
      'category_id',
      'pictures (array, máximo 12)',
    ],
    optionalFields: [
      'currency_id (default: ARS)',
      'attributes (array)',
      'location',
      'listing_type_id (default: gold_special)',
    ],
    categories: {
      houses: 'MLA1459',
      apartments: 'MLA1472', 
      lots: 'MLA1466',
      commercial: 'MLA1468',
    },
    limits: {
      title: '60 caracteres máximo',
      pictures: '12 imágenes máximo',
      description: '50,000 caracteres máximo',
    },
  })
}

// Función POST para crear nuevas publicaciones
export async function POST(request: NextRequest) {
  let propertyId: string | undefined

  try {
    const { propertyData, images, propertyId: requestPropertyId } = await request.json()
    propertyId = requestPropertyId

    console.log('🏠 Solicitud de publicación recibida para propiedad:', propertyId)

    // Validar que existan datos de propertyData
    if (!propertyData) {
      // Actualizar estado a error si no hay propertyData
      if (propertyId) {
        await updatePortalStatus(
          propertyId,
          'error',
          undefined,
          undefined,
          'No se encontraron datos válidos de propertyData',
        )
      }
      return NextResponse.json(
        { error: 'No se encontraron datos válidos de propertyData' },
        { status: 400 },
      )
    }

    // Marcar como en cola al inicio del proceso
    if (propertyId) {
      await updatePortalStatus(propertyId, 'queued')
    }

    // Mapear propertyData al formato de MercadoLibre
    const mappedPropertyData = mapFormDataToMercadoLibre(propertyData)
    
    // Validar los datos mapeados
    const validation = validateMercadoLibreData(mappedPropertyData)
    if (!validation.isValid) {
      // Actualizar estado a error si la validación falla
      if (propertyId) {
        await updatePortalStatus(
          propertyId,
          'error',
          undefined,
          undefined,
          `Datos inválidos para MercadoLibre: ${validation.errors.join(', ')}`,
        )
      }
      return NextResponse.json(
        {
          error: 'Datos inválidos para MercadoLibre',
          validationErrors: validation.errors,
        },
        { status: 400 },
      )
    }

    // Crear objeto mercadoLibreData usando la función reutilizable
    const mercadoLibreData = createMercadoLibreData(mappedPropertyData, images)

    console.log('🏠 Datos preparados para publicación en MercadoLibre:', mercadoLibreData.title)

    // Obtener el access token dinámicamente
    const accessToken = await getMercadoLibreAccessToken()

    if (!accessToken) {
      if (propertyId) {
        await updatePortalStatus(
          propertyId,
          'error',
          undefined,
          undefined,
          'No se pudo obtener el access token de MercadoLibre',
        )
      }

      return NextResponse.json(
        {
          error: 'No se pudo obtener el access token de MercadoLibre',
          details: 'Verificar configuración de tokens en variables de entorno',
        },
        { status: 500 },
      )
    }

    // Llamada real a API de MercadoLibre para crear publicación
    try {
      const mlResponse: Response = await fetch('https://api.mercadolibre.com/items', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mercadoLibreData),
      })

      if (!mlResponse.ok) {
        const errorData = await mlResponse.json().catch(() => ({}))
        console.error('Error de MercadoLibre API (HTTP):', errorData)
        throw new Error(
          `Error HTTP de MercadoLibre API: ${mlResponse.status} - ${errorData.message || 'Error desconocido'}`,
        )
      }

      const mlResult: any = await mlResponse.json()
      console.log('✅ Respuesta de MercadoLibre:', mlResult)

      // Verificar si hay errores en la respuesta de MercadoLibre
      if (mlResult.error) {
        console.error('Error reportado por MercadoLibre:', mlResult.error)

        if (propertyId) {
          await updatePortalError(propertyId, `Error de MercadoLibre: ${mlResult.message}`)
        }

        const updatedMercadoLibreData = {
          name: 'MercadoLibre',
          uploaded: false,
          externalId: null,
          externalUrl: null,
          status: 'error' as const,
          lastSyncAt: new Date().toISOString(),
          lastError: `Error de MercadoLibre: ${mlResult.message}`,
        }

        return NextResponse.json(
          {
            success: false,
            error: 'Error en la publicación de MercadoLibre',
            mercadoLibreError: mlResult.message,
            details: mlResult,
            updatedMercadoLibreData,
          },
          { status: 400 },
        )
      }

      // Actualizar estado a exitoso
      if (propertyId) {
        await updatePortalStatus(
          propertyId,
          'ok',
          mlResult.id,
          mlResult.permalink,
        )
        // Limpiar cualquier error previo
        await clearPortalError(propertyId)
      }

      const updatedMercadoLibreData = {
        name: 'MercadoLibre',
        uploaded: true,
        externalId: mlResult.id,
        externalUrl: mlResult.permalink,
        status: 'ok' as const,
        lastSyncAt: new Date().toISOString(),
        lastError: null,
      }

      return NextResponse.json({
        message: 'Propiedad publicada exitosamente en MercadoLibre',
        success: true,
        mercadoLibreResponse: mlResult,
        updatedMercadoLibreData,
        published: true,
      })
    } catch (mlError: unknown) {
      console.error('Error llamando a MercadoLibre API:', mlError)

      const errorMessage = mlError instanceof Error ? mlError.message : 'Error desconocido'
      if (propertyId) {
        await updatePortalError(propertyId, `Error al conectar con MercadoLibre API: ${errorMessage}`)
      }

      const updatedMercadoLibreData = {
        name: 'MercadoLibre',
        uploaded: false,
        externalId: null,
        externalUrl: null,
        status: 'error' as const,
        lastSyncAt: new Date().toISOString(),
        lastError: `Error al conectar con MercadoLibre API: ${errorMessage}`,
      }

      return NextResponse.json(
        {
          error: 'Error al conectar con MercadoLibre API',
          details: errorMessage,
          mappedData: mappedPropertyData,
          updatedMercadoLibreData,
        },
        { status: 502 },
      )
    }
  } catch (error) {
    console.error('Error en publicación de MercadoLibre:', error)

    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    if (propertyId) {
      await updatePortalError(propertyId, `Error interno en publicación: ${errorMessage}`)
    }

    const updatedMercadoLibreData = {
      name: 'MercadoLibre',
      uploaded: false,
      externalId: null,
      externalUrl: null,
      status: 'error' as const,
      lastSyncAt: new Date().toISOString(),
      lastError: `Error en publicación: ${errorMessage}`,
    }

    return NextResponse.json(
      {
        error: 'Error en publicación',
        details: errorMessage,
        updatedMercadoLibreData,
      },
      { status: 500 },
    )
  }
}

// Función PUT para actualizar publicaciones existentes
export async function PUT(request: NextRequest) {
  let propertyId: string | undefined
  let initialMercadoLibreState: any = null

  try {
    const {
      propertyData,
      images,
      propertyId: requestPropertyId,
      action,
    } = await request.json()
    propertyId = requestPropertyId

    console.log('🔄 Solicitud de actualización recibida para propiedad:', propertyId)

    // Validar que sea una acción de sincronización
    if (action !== 'sync') {
      const updatedMercadoLibreData = {
        name: 'MercadoLibre',
        uploaded: false,
        externalId: null,
        externalUrl: null,
        status: 'error' as const,
        lastSyncAt: new Date().toISOString(),
        lastError: 'Acción no válida para sincronización',
      }

      return NextResponse.json(
        {
          error: 'Acción no válida',
          details: 'La ruta PUT solo acepta action: "sync"',
          updatedMercadoLibreData,
        },
        { status: 400 },
      )
    }

    // Validar que existan datos de propertyData
    if (!propertyData) {
      if (propertyId) {
        await updatePortalStatus(
          propertyId,
          'error',
          undefined,
          undefined,
          'No se encontraron datos válidos de propertyData para sincronización',
        )
      }

      const updatedMercadoLibreData = {
        name: 'MercadoLibre',
        uploaded: false,
        externalId: null,
        externalUrl: null,
        status: 'error' as const,
        lastSyncAt: new Date().toISOString(),
        lastError: 'No se encontraron datos válidos de propertyData',
      }

      return NextResponse.json(
        {
          error: 'No se encontraron datos válidos de propertyData',
          updatedMercadoLibreData,
        },
        { status: 400 },
      )
    }

    // Obtener los datos actuales de la propiedad ANTES de hacer cambios para preservar estado
    if (propertyId) {
      const payload = await getPayload({ config })
      const currentProperty = await payload.findByID({
        collection: 'propiedades',
        id: propertyId,
      })

      // Capturar el estado inicial para restaurar en caso de error
      if (currentProperty?.mercadolibre) {
        initialMercadoLibreState = {
          uploaded: currentProperty.mercadolibre.uploaded,
          externalId: currentProperty.mercadolibre.externalId,
          externalUrl: currentProperty.mercadolibre.externalUrl,
          status: currentProperty.mercadolibre.status,
          lastSyncAt: currentProperty.mercadolibre.lastSyncAt,
          lastError: currentProperty.mercadolibre.lastError,
        }
      }
    }

    // Marcar como en cola al inicio del proceso
    if (propertyId) {
      await updatePortalStatus(propertyId, 'queued')
    }

    // Mapear propertyData al formato de MercadoLibre
    const mappedPropertyData = mapFormDataToMercadoLibre(propertyData)

    // Validar los datos mapeados
    const validation = validateMercadoLibreData(mappedPropertyData)
    if (!validation.isValid) {
      if (propertyId) {
        await updatePortalStatus(
          propertyId,
          'error',
          undefined,
          undefined,
          `Datos inválidos para sincronización en MercadoLibre: ${validation.errors.join(', ')}`,
        )
      }

      const updatedMercadoLibreData = {
        name: 'MercadoLibre',
        uploaded: false,
        externalId: propertyData?.mercadolibre?.externalId || null,
        externalUrl: propertyData?.mercadolibre?.externalUrl || null,
        status: 'error' as const,
        lastSyncAt: new Date().toISOString(),
        lastError: `Datos inválidos para MercadoLibre: ${validation.errors.join(', ')}`,
      }

      return NextResponse.json(
        {
          error: 'Datos inválidos para sincronización en MercadoLibre',
          validationErrors: validation.errors,
          updatedMercadoLibreData,
        },
        { status: 400 },
      )
    }

    // Crear objeto mercadoLibreData usando la función reutilizable
    // Para sincronización, usar el externalId existente como ID
    const mercadoLibreData = createMercadoLibreData(
      mappedPropertyData,
      images,
      propertyData?.mercadolibre?.externalId || propertyId || '0',
    )

    console.log('🔄 Datos preparados para actualización en MercadoLibre:', mercadoLibreData.title)

    // Obtener el access token dinámicamente
    const accessToken = await getMercadoLibreAccessToken()

    if (!accessToken) {
      if (propertyId && initialMercadoLibreState) {
        await restoreStateWithError(
          propertyId,
          initialMercadoLibreState,
          'No se pudo obtener el access token de MercadoLibre',
        )
      }

      const updatedMercadoLibreData = {
        name: 'MercadoLibre',
        uploaded: initialMercadoLibreState?.uploaded || false,
        externalId: initialMercadoLibreState?.externalId || null,
        externalUrl: initialMercadoLibreState?.externalUrl || null,
        status: (initialMercadoLibreState?.status as any) || 'error',
        lastSyncAt: new Date().toISOString(),
        lastError: 'No se pudo obtener el access token de MercadoLibre',
      }

      return NextResponse.json(
        {
          error: 'No se pudo obtener el access token de MercadoLibre',
          details: 'Verificar configuración de tokens en variables de entorno',
          updatedMercadoLibreData,
        },
        { status: 500 },
      )
    }

    // Llamada real a API de MercadoLibre para actualización
    try {
      // Para edición/sincronización, usar PUT con el ID del item
      const mlResponse: Response = await fetch(
        `https://api.mercadolibre.com/items/${propertyData?.mercadolibre?.externalId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mercadoLibreData),
        },
      )

      if (!mlResponse.ok) {
        const errorData = await mlResponse.json().catch(() => ({}))
        console.error('Error de MercadoLibre API (HTTP) en sincronización:', errorData)
        throw new Error(
          `Error HTTP de MercadoLibre API en sincronización: ${mlResponse.status} - ${errorData.message || 'Error desconocido'}`,
        )
      }

      const mlResult: any = await mlResponse.json()
      console.log('✅ Respuesta de MercadoLibre en sincronización:', mlResult)

      // Verificar si hay errores en la respuesta de MercadoLibre
      if (mlResult.error) {
        console.error('Error reportado por MercadoLibre en sincronización:', mlResult.error)

        if (propertyId && initialMercadoLibreState) {
          await restoreStateWithError(
            propertyId,
            initialMercadoLibreState,
            `Error en la sincronización de MercadoLibre: ${mlResult.message}`,
          )
        }

        const updatedMercadoLibreData = {
          name: 'MercadoLibre',
          uploaded: initialMercadoLibreState?.uploaded || false,
          externalId: initialMercadoLibreState?.externalId || null,
          externalUrl: initialMercadoLibreState?.externalUrl || null,
          status: (initialMercadoLibreState?.status as any) || 'error',
          lastSyncAt: new Date().toISOString(),
          lastError: `Error en la sincronización de MercadoLibre: ${mlResult.message}`,
        }

        return NextResponse.json(
          {
            success: false,
            error: 'Error en la sincronización de MercadoLibre',
            mercadoLibreError: mlResult.message,
            details: mlResult,
            updatedMercadoLibreData,
          },
          { status: 400 },
        )
      }

      // Actualizar estado a exitoso
      if (propertyId) {
        await updatePortalStatus(
          propertyId,
          'ok',
          propertyData?.mercadolibre?.externalId,
          propertyData?.mercadolibre?.externalUrl,
        )
        // Limpiar cualquier error previo
        await clearPortalError(propertyId)
      }

      const updatedMercadoLibreData = {
        name: 'MercadoLibre',
        uploaded: true,
        externalId: propertyData?.mercadolibre?.externalId || null,
        externalUrl: propertyData?.mercadolibre?.externalUrl || null,
        status: 'ok' as const,
        lastSyncAt: new Date().toISOString(),
        lastError: null,
      }

      return NextResponse.json({
        message: 'Propiedad actualizada en MercadoLibre',
        success: true,
        mercadoLibreResponse: mlResult,
        updatedMercadoLibreData,
        sync: true,
      })
    } catch (mlError: unknown) {
      console.error('Error llamando a MercadoLibre API para sincronización:', mlError)

      const errorMessage = mlError instanceof Error ? mlError.message : 'Error desconocido'
      if (propertyId && initialMercadoLibreState) {
        await restoreStateWithError(
          propertyId,
          initialMercadoLibreState,
          `Error al conectar con MercadoLibre API en sincronización: ${errorMessage}`,
        )
      }

      const updatedMercadoLibreData = {
        name: 'MercadoLibre',
        uploaded: initialMercadoLibreState?.uploaded || false,
        externalId: initialMercadoLibreState?.externalId || null,
        externalUrl: initialMercadoLibreState?.externalUrl || null,
        status: (initialMercadoLibreState?.status as any) || 'error',
        lastSyncAt: new Date().toISOString(),
        lastError: `Error al conectar con MercadoLibre API: ${errorMessage}`,
      }

      return NextResponse.json(
        {
          error: 'Error al conectar con MercadoLibre API en sincronización',
          details: errorMessage,
          mappedData: mappedPropertyData,
          updatedMercadoLibreData,
        },
        { status: 502 },
      )
    }
  } catch (error) {
    console.error('Error en sincronización de MercadoLibre:', error)

    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    if (propertyId) {
      // En el catch general, puede que no tengamos initialMercadoLibreState,
      // pero debemos intentar preservar lo que podamos
      try {
        await restoreStateWithError(
          propertyId,
          initialMercadoLibreState || { uploaded: false, status: 'error' }, // fallback
          `Error interno en sincronización: ${errorMessage}`,
        )
      } catch {
        // Si falla, usar el método básico
        await updatePortalError(propertyId, `Error interno en sincronización: ${errorMessage}`)
      }
    }

    const updatedMercadoLibreData = {
      name: 'MercadoLibre',
      uploaded: initialMercadoLibreState?.uploaded || false,
      externalId: initialMercadoLibreState?.externalId || null,
      externalUrl: initialMercadoLibreState?.externalUrl || null,
      status: (initialMercadoLibreState?.status as any) || 'error',
      lastSyncAt: new Date().toISOString(),
      lastError: `Error en sincronización: ${errorMessage}`,
    }

    return NextResponse.json(
      {
        error: 'Error en sincronización',
        details: errorMessage,
        updatedMercadoLibreData,
      },
      { status: 500 },
    )
  }
}

// Función DELETE para eliminar publicaciones del portal
export async function DELETE(request: NextRequest) {
  let propertyId: string | undefined
  let initialMercadoLibreState: any = null

  try {
    const { propertyId: requestPropertyId, action } = await request.json()
    propertyId = requestPropertyId

    console.log('🗑️ Solicitud de eliminación recibida para propiedad:', propertyId)

    // Validar que sea una acción de eliminación
    if (action !== 'delete') {
      const updatedMercadoLibreData = {
        name: 'MercadoLibre',
        uploaded: false,
        externalId: null,
        externalUrl: null,
        status: 'error' as const,
        lastSyncAt: new Date().toISOString(),
        lastError: 'Acción no válida para eliminación',
      }

      return NextResponse.json(
        {
          error: 'Acción no válida',
          details: 'La ruta DELETE solo acepta action: "delete"',
          updatedMercadoLibreData,
        },
        { status: 400 },
      )
    }

    // Validar que existe propertyId
    if (!propertyId) {
      return NextResponse.json(
        {
          error: 'ID de propiedad requerido',
          details: 'Se requiere propertyId para eliminar la propiedad del portal',
        },
        { status: 400 },
      )
    }

    // Obtener los datos actuales de la propiedad ANTES de hacer cambios
    const payload = await getPayload({ config })
    const property = await payload.findByID({
      collection: 'propiedades',
      id: propertyId,
    })

    if (!property || !property.mercadolibre?.externalId) {
      const updatedMercadoLibreData = {
        name: 'MercadoLibre',
        uploaded: false,
        externalId: null,
        externalUrl: null,
        status: 'not_published' as const,
        lastSyncAt: new Date().toISOString(),
        lastError: 'La propiedad no está publicada en MercadoLibre o no tiene ID externo',
      }

      return NextResponse.json(
        {
          error: 'La propiedad no está publicada en MercadoLibre',
          details: 'No se encontró ID externo de MercadoLibre para esta propiedad',
          updatedMercadoLibreData,
        },
        { status: 400 },
      )
    }

    // Asignar el estado inicial para restaurar en caso de error
    initialMercadoLibreState = {
      uploaded: property.mercadolibre.uploaded,
      externalId: property.mercadolibre.externalId,
      externalUrl: property.mercadolibre.externalUrl,
      status: property.mercadolibre.status,
      lastSyncAt: property.mercadolibre.lastSyncAt,
      lastError: property.mercadolibre.lastError,
    }

    // Marcar como en cola al inicio del proceso
    await updatePortalStatus(propertyId, 'queued')

    // Obtener el access token dinámicamente
    const accessToken = await getMercadoLibreAccessToken()

    if (!accessToken) {
      await restoreStateWithError(
        propertyId,
        initialMercadoLibreState,
        'No se pudo obtener el access token de MercadoLibre',
      )

      const updatedMercadoLibreData = {
        name: 'MercadoLibre',
        uploaded: initialMercadoLibreState.uploaded,
        externalId: initialMercadoLibreState.externalId,
        externalUrl: initialMercadoLibreState.externalUrl,
        status: initialMercadoLibreState.status,
        lastSyncAt: new Date().toISOString(),
        lastError: 'No se pudo obtener el access token de MercadoLibre',
      }

      return NextResponse.json(
        {
          error: 'No se pudo obtener el access token de MercadoLibre',
          details: 'Verificar configuración de tokens en variables de entorno',
          updatedMercadoLibreData,
        },
        { status: 500 },
      )
    }

    // Llamada real a API de MercadoLibre para eliminación
    try {
      // Para eliminar, cambiar status a "closed" (MercadoLibre no permite DELETE directo)
      const mlResponse: Response = await fetch(
        `https://api.mercadolibre.com/items/${property.mercadolibre.externalId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'closed', // Cerrar la publicación
          }),
        },
      )

      if (!mlResponse.ok) {
        const errorData = await mlResponse.json().catch(() => ({}))
        console.error('Error de MercadoLibre API (HTTP) en eliminación:', errorData)
        throw new Error(
          `Error HTTP de MercadoLibre API en eliminación: ${mlResponse.status} - ${errorData.message || 'Error desconocido'}`,
        )
      }

      const mlResult: any = await mlResponse.json()
      console.log('✅ Respuesta de MercadoLibre en eliminación:', mlResult)

      // Verificar si hay errores en la respuesta de MercadoLibre
      if (mlResult.error) {
        console.error(
          'Error reportado por MercadoLibre en eliminación:',
          mlResult.error,
          'de la propiedad:',
          propertyId,
        )

        await restoreStateWithError(
          propertyId,
          initialMercadoLibreState,
          `Error en la eliminación de MercadoLibre: ${mlResult.message}`,
        )

        const updatedMercadoLibreData = {
          name: 'MercadoLibre',
          uploaded: initialMercadoLibreState.uploaded,
          externalId: initialMercadoLibreState.externalId,
          externalUrl: initialMercadoLibreState.externalUrl,
          status: initialMercadoLibreState.status,
          lastSyncAt: new Date().toISOString(),
          lastError: `Error en la eliminación de MercadoLibre: ${mlResult.message}`,
        }

        return NextResponse.json(
          {
            success: false,
            error: 'Error en la eliminación de MercadoLibre',
            mercadoLibreError: mlResult.message,
            details: mlResult,
            updatedMercadoLibreData,
          },
          { status: 400 },
        )
      }

      // Actualizar estado a no publicado (limpiar datos de portal)
      await updatePortalStatus(propertyId, 'ok', undefined, undefined, undefined)

      // Luego actualizar con el estado correcto
      await payload.update({
        collection: 'propiedades',
        id: propertyId,
        data: {
          mercadolibre: {
            uploaded: false,
            externalId: null,
            externalUrl: null,
            status: 'not_sent',
            lastSyncAt: new Date().toISOString(),
            lastError: null,
          },
        },
      })

      const updatedMercadoLibreData = {
        name: 'MercadoLibre',
        uploaded: false,
        externalId: null,
        externalUrl: null,
        status: 'not_sent' as const,
        lastSyncAt: new Date().toISOString(),
        lastError: null,
      }

      return NextResponse.json({
        message: 'Propiedad eliminada exitosamente de MercadoLibre',
        success: true,
        mercadoLibreResponse: mlResult,
        updatedMercadoLibreData,
        deleted: true,
      })
    } catch (mlError: unknown) {
      console.error('Error llamando a MercadoLibre API para eliminación:', mlError)

      const errorMessage = mlError instanceof Error ? mlError.message : 'Error desconocido'
      await restoreStateWithError(
        propertyId,
        initialMercadoLibreState,
        `Error al conectar con MercadoLibre API en eliminación: ${errorMessage}`,
      )

      const updatedMercadoLibreData = {
        name: 'MercadoLibre',
        uploaded: initialMercadoLibreState.uploaded,
        externalId: initialMercadoLibreState.externalId,
        externalUrl: initialMercadoLibreState.externalUrl,
        status: initialMercadoLibreState.status,
        lastSyncAt: new Date().toISOString(),
        lastError: `Error al conectar con MercadoLibre API: ${errorMessage}`,
      }

      return NextResponse.json(
        {
          error: 'Error al conectar con MercadoLibre API en eliminación',
          details: errorMessage,
          updatedMercadoLibreData,
        },
        { status: 502 },
      )
    }
  } catch (error) {
    console.error('Error en eliminación de MercadoLibre:', error)

    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    if (propertyId) {
      // En el catch general, puede que no tengamos initialMercadoLibreState, 
      // pero debemos intentar preservar lo que podamos
      try {
        await restoreStateWithError(
          propertyId,
          initialMercadoLibreState || { uploaded: true, status: 'ok' }, // fallback
          `Error interno en eliminación: ${errorMessage}`,
        )
      } catch {
        // Si falla, usar el método básico
        await updatePortalError(propertyId, `Error interno en eliminación: ${errorMessage}`)
      }
    }

    const updatedMercadoLibreData = {
      name: 'MercadoLibre',
      uploaded: initialMercadoLibreState?.uploaded || true,
      externalId: initialMercadoLibreState?.externalId || null,
      externalUrl: initialMercadoLibreState?.externalUrl || null,
      status: (initialMercadoLibreState?.status as any) || 'ok',
      lastSyncAt: new Date().toISOString(),
      lastError: `Error en eliminación: ${errorMessage}`,
    }

    return NextResponse.json(
      {
        error: 'Error en eliminación',
        details: errorMessage,
        updatedMercadoLibreData,
      },
      { status: 500 },
    )
  }
}
