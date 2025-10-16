import { NextResponse, NextRequest } from 'next/server'
import { getValidMercadoLibreToken as getValidAccessToken } from '@/utils/mercadoLibreTokens'
import {
  mapFormDataToMercadoLibre as mapPropertyToMercadoLibre,
  validateMercadoLibreData,
} from '@/utils/mercadoLibreMappers'
import { getPayload } from 'payload'
import config from '@payload-config'

async function updatePortalStatus(
  propertyId: string,
  status: 'queued' | 'ok' | 'error',
  externalId?: string,
  externalUrl?: string,
  lastError?: string,
) {
  try {
    const payload = await getPayload({ config })

    await payload.update({
      collection: 'propiedades',
      id: propertyId,
      data: {
        mercadolibre: {
          uploaded: status === 'ok',
          externalId: externalId || null,
          externalUrl: externalUrl || null,
          status: status,
          lastSyncAt: new Date().toISOString(),
          lastError: lastError || null,
        },
      },
    })

    return true
  } catch (error) {
    console.error('Error actualizando portal status:', error)
    return false
  }
}

// POST - Publicar nueva propiedad
export async function POST(request: NextRequest) {
  const { propertyData, images, propertyId } = await request.json()
  try {
    console.log('📤 Iniciando publicación en Mercado Libre para propiedad:', propertyId)

    if (!propertyData) {
      return NextResponse.json(
        { error: 'No se encontraron datos válidos de propertyData' },
        { status: 400 },
      )
    }

    // Marcar como en cola
    if (propertyId) {
      await updatePortalStatus(propertyId, 'queued')
    }

    // Obtener access token válido
    const tokenInfo = await getValidAccessToken()
    if (!tokenInfo) {
      if (propertyId) {
        await updatePortalStatus(
          propertyId,
          'error',
          undefined,
          undefined,
          'No se pudo obtener access token de Mercado Libre. Por favor, reconecta tu cuenta.',
        )
      }

      const updatedMercadolibreData = {
        name: 'MercadoLibre',
        uploaded: false,
        externalId: null,
        externalUrl: null,
        status: 'error' as const,
        lastSyncAt: new Date().toISOString(),
        lastError: 'No hay autenticación válida con Mercado Libre',
      }

      return NextResponse.json(
        {
          error: 'No hay autenticación válida con Mercado Libre',
          details: 'Por favor, conecta tu cuenta de Mercado Libre primero',
          updatedMercadolibreData,
        },
        { status: 401 },
      )
    }

    // Mapear datos
    const mlData = mapPropertyToMercadoLibre(propertyData, images || [])

    console.log('📋 Datos mapeados para Mercado Libre:', mlData)

    // Validar
    const validation = validateMercadoLibreData(mlData)
    if (!validation.isValid) {
      if (propertyId) {
        await updatePortalStatus(
          propertyId,
          'error',
          undefined,
          undefined,
          `Datos inválidos: ${validation.errors.join(', ')}`,
        )
      }

      const updatedMercadolibreData = {
        name: 'MercadoLibre',
        uploaded: false,
        externalId: null,
        externalUrl: null,
        status: 'error' as const,
        lastSyncAt: new Date().toISOString(),
        lastError: `Datos inválidos: ${validation.errors.join(', ')}`,
      }

      return NextResponse.json(
        {
          error: 'Datos inválidos para Mercado Libre',
          validationErrors: validation.errors,
          updatedMercadolibreData,
        },
        { status: 400 },
      )
    }

    // Remover descripción del objeto inicial
    const { description, ...mlDataWithoutDescription } = mlData
    // PASO 1: Publicar item en Mercado Libre (sin descripción)
    console.log('📤 Creando item en Mercado Libre...')
    const mlResponse = await fetch('https://api.mercadolibre.com/items', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenInfo.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mlDataWithoutDescription),
    })

    if (!mlResponse.ok) {
      const errorData = await mlResponse.json().catch(() => ({}))
      console.error('❌ Error de MercadoLibre API:', errorData)
      console.log(errorData.cause[0].references)

      const errorMessage =
        errorData.message || errorData.error || 'Error desconocido de Mercado Libre'

      if (propertyId) {
        await updatePortalStatus(propertyId, 'error', undefined, undefined, errorMessage)
      }

      const updatedMercadolibreData = {
        name: 'MercadoLibre',
        uploaded: false,
        externalId: null,
        externalUrl: null,
        status: 'error' as const,
        lastSyncAt: new Date().toISOString(),
        lastError: errorMessage,
      }

      return NextResponse.json(
        {
          error: 'Error publicando en Mercado Libre',
          details: errorMessage,
          mercadolibreError: errorData,
          updatedMercadolibreData,
        },
        { status: mlResponse.status },
      )
    }

    const mlResult = await mlResponse.json()
    // const mlResult = { id: 'hola', permalink: 'https://www.mercadolibre.com.ar/' }
    const itemId = mlResult.id

    console.log('✅ Item creado exitosamente en Mercado Libre:', itemId)

    // PASO 2: Agregar la descripción
    let descriptionAdded = false
    if (description?.plain_text && description?.plain_text.trim().length > 0) {
      try {
        console.log('📝 Agregando descripción al item...')
        const descriptionResponse = await fetch(
          `https://api.mercadolibre.com/items/${itemId}/description`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${tokenInfo.accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              plain_text: description?.plain_text,
            }),
          },
        )

        if (descriptionResponse.ok) {
          console.log('✅ Descripción agregada exitosamente')
          descriptionAdded = true
        } else {
          const descError = await descriptionResponse.json().catch(() => ({}))
          console.warn('⚠️ No se pudo agregar la descripción:', descError)
        }
      } catch (descError) {
        console.error('❌ Error agregando descripción:', descError)
        // No fallar la publicación completa por esto
      }
    }

    // PASO 3: Actualizar estado exitoso en BD
    if (propertyId) {
      await updatePortalStatus(propertyId, 'ok', mlResult.id, mlResult.permalink)
    }

    const updatedMercadolibreData = {
      name: 'MercadoLibre',
      uploaded: true,
      externalId: mlResult.id,
      externalUrl: mlResult.permalink,
      status: 'ok' as const,
      lastSyncAt: new Date().toISOString(),
      lastError: null,
    }

    return NextResponse.json({
      success: true,
      message: 'Propiedad publicada exitosamente en Mercado Libre',
      mercadolibreResponse: mlResult,
      updatedMercadolibreData,
      descriptionAdded,
    })
  } catch (error) {
    console.error('❌ Error en API de MercadoLibre:', error)

    const errorMessage = error instanceof Error ? error.message : 'Error interno'
    if (propertyId) {
      await updatePortalStatus(propertyId, 'error', undefined, undefined, errorMessage)
    }

    const updatedMercadolibreData = {
      name: 'MercadoLibre',
      uploaded: false,
      externalId: null,
      externalUrl: null,
      status: 'error' as const,
      lastSyncAt: new Date().toISOString(),
      lastError: errorMessage,
    }

    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        details: errorMessage,
        updatedMercadolibreData,
      },
      { status: 500 },
    )
  }
}

// PUT - Actualizar propiedad existente
export async function PUT(request: NextRequest) {
  let initialState: any = null

  const { propertyData, images, propertyId, action } = await request.json()
  try {
    console.log('🔄 Iniciando sincronización en Mercado Libre para propiedad:', propertyId)

    if (action !== 'sync') {
      return NextResponse.json({ error: 'Acción no válida para sincronización' }, { status: 400 })
    }

    if (!propertyData?.mercadolibre?.externalId) {
      return NextResponse.json(
        { error: 'No se encontró ID de Mercado Libre para sincronizar' },
        { status: 400 },
      )
    }

    // Guardar estado inicial
    const payload = await getPayload({ config })
    const currentProperty = await payload.findByID({
      collection: 'propiedades',
      id: propertyId!,
    })

    if (currentProperty?.mercadolibre) {
      initialState = { ...currentProperty.mercadolibre }
    }

    await updatePortalStatus(propertyId!, 'queued')

    const tokenInfo = await getValidAccessToken()
    if (!tokenInfo) {
      return NextResponse.json(
        { error: 'No hay autenticación válida con Mercado Libre' },
        { status: 401 },
      )
    }

    const mlData = mapPropertyToMercadoLibre(propertyData, images || [])
    console.log('📋 Datos mapeados para Mercado Libre:', mlData)
    const mlItemId = propertyData.mercadolibre.externalId
    // const description = mlData.description?.plain_text
    const { description, listing_type_id, ...mlDataFormatted } = mlData
    // PASO 1: Actualizar item principal
    const mlResponse = await fetch(`https://api.mercadolibre.com/items/${mlItemId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${tokenInfo.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mlDataFormatted),
    })

    if (!mlResponse.ok) {
      const errorData = await mlResponse.json().catch(() => ({}))
      console.error('❌ Error actualizando en ML:', errorData)

      const errorMessage = errorData.message || 'Error actualizando en Mercado Libre'

      if (propertyId && initialState) {
        await updatePortalStatus(
          propertyId,
          initialState.status,
          initialState.externalId,
          initialState.externalUrl,
          errorMessage,
        )
      }

      throw new Error(errorMessage)
    }

    const mlResult = await mlResponse.json()
    console.log('✅ Item actualizado en Mercado Libre')

    // PASO 2: Actualizar descripción
    let descriptionUpdated = false
    if (description?.plain_text && description?.plain_text.trim().length > 0) {
      try {
        console.log('📝 Actualizando descripción...')
        const descriptionResponse = await fetch(
          `https://api.mercadolibre.com/items/${mlItemId}/description`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${tokenInfo.accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              plain_text: description?.plain_text,
            }),
          },
        )

        if (descriptionResponse.ok) {
          console.log('✅ Descripción actualizada exitosamente')
          descriptionUpdated = true
        } else {
          const descError = await descriptionResponse.json().catch(() => ({}))
          console.warn('⚠️ No se pudo actualizar la descripción:', descError)
        }
      } catch (descError) {
        console.error('❌ Error actualizando descripción:', descError)
      }
    }

    await updatePortalStatus(propertyId!, 'ok', mlResult.id, mlResult.permalink)

    const updatedMercadolibreData = {
      name: 'MercadoLibre',
      uploaded: true,
      externalId: mlResult.id,
      externalUrl: mlResult.permalink,
      status: 'ok' as const,
      lastSyncAt: new Date().toISOString(),
      lastError: null,
    }

    return NextResponse.json({
      success: true,
      message: 'Propiedad actualizada en Mercado Libre',
      mercadolibreResponse: mlResult,
      updatedMercadolibreData,
      descriptionUpdated,
      sync: true,
    })
  } catch (error) {
    console.error('❌ Error actualizando en MercadoLibre:', error)

    const errorMessage = error instanceof Error ? error.message : 'Error en sincronización'

    if (propertyId && initialState) {
      await updatePortalStatus(
        propertyId,
        initialState.status,
        initialState.externalId,
        initialState.externalUrl,
        errorMessage,
      )
    }

    return NextResponse.json(
      { error: 'Error en sincronización', details: errorMessage },
      { status: 500 },
    )
  }
}

// DELETE - Pausar publicación
export async function DELETE(request: NextRequest) {
  const { propertyId, action, externalId } = await request.json()
  try {
    if (action !== 'delete') {
      return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    if (!externalId) {
      return NextResponse.json(
        { error: 'La propiedad no está publicada en Mercado Libre' },
        { status: 400 },
      )
    }

    const tokenInfo = await getValidAccessToken()
    if (!tokenInfo) {
      return NextResponse.json({ error: 'No hay autenticación válida' }, { status: 401 })
    }

    // Pausar publicación
    const mlResponse = await fetch(`https://api.mercadolibre.com/items/${externalId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${tokenInfo.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'closed' }),
    })

    if (!mlResponse.ok) {
      const errorData = await mlResponse.json().catch(() => ({}))
      throw new Error(errorData.message || 'Error pausando publicación')
    }

    console.log('✅ Publicación pausada en Mercado Libre')

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

    const updatedMercadolibreData = {
      name: 'MercadoLibre',
      uploaded: false,
      externalId: null,
      externalUrl: null,
      status: 'not_sent' as const,
      lastSyncAt: new Date().toISOString(),
      lastError: null,
    }

    return NextResponse.json({
      success: true,
      message: 'Publicación pausada en Mercado Libre',
      updatedMercadolibreData,
      deleted: true,
    })
  } catch (error) {
    console.error('❌ Error eliminando de MercadoLibre:', error)
    return NextResponse.json({ error: 'Error en eliminación' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'API de MercadoLibre',
    endpoints: {
      POST: '/api/meli - Publicar nueva propiedad',
      PUT: '/api/meli - Sincronizar propiedad existente (action: sync)',
      DELETE: '/api/meli - Pausar publicación (action: delete)',
    },
    note: 'Requiere autenticación OAuth 2.0. Conecta tu cuenta primero en /api/meli/auth',
  })
}
