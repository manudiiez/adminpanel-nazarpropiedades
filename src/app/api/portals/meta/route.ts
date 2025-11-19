import { NextResponse, NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

async function updateMetaStatus(
  propertyId: string,
  status: 'queued' | 'ok' | 'error' | 'published',
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
        meta: {
          uploaded: status === 'ok' || status === 'published',
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
    console.error('Error actualizando meta status:', error)
    return false
  }
}

// POST - Publicar propiedad en Instagram
export async function POST(request: NextRequest) {
  const { propertyId } = await request.json()
  try {
    console.log('📤 Iniciando publicación en Instagram para propiedad:', propertyId)

    // Validar que existe propertyId
    if (!propertyId) {
      return NextResponse.json({ error: 'propertyId es requerido' }, { status: 400 })
    }

    // Marcar como en cola
    await updateMetaStatus(propertyId, 'queued')

    // Buscar la propiedad completa en la base de datos
    const payload = await getPayload({ config })
    const property = await payload.findByID({
      collection: 'propiedades',
      id: propertyId,
      depth: 2, // Para obtener relaciones como images
    })

    if (!property) {
      await updateMetaStatus(propertyId, 'error', undefined, undefined, 'Propiedad no encontrada')
      return NextResponse.json({ error: 'Propiedad no encontrada' }, { status: 404 })
    }

    // Obtener URL del webhook de n8n
    const n8nWebhookUrl = process.env.N8N_META_WEBHOOK_URL

    if (!n8nWebhookUrl) {
      await updateMetaStatus(
        propertyId,
        'error',
        undefined,
        undefined,
        'N8N webhook URL no configurada',
      )

      return NextResponse.json(
        {
          error: 'N8N webhook URL no configurada',
          updatedMetaData: {
            name: 'Instagram',
            uploaded: false,
            externalId: null,
            externalUrl: null,
            status: 'error' as const,
            lastSyncAt: new Date().toISOString(),
            lastError: 'N8N webhook URL no configurada',
          },
        },
        { status: 500 },
      )
    }

    // Enviar la propiedad completa a n8n
    console.log('📤 Enviando propiedad a n8n...')
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'publishToInstagram',
        propertyId: propertyId,
        property: property,
      }),
    })

    if (!n8nResponse.ok) {
      const errorData = await n8nResponse.json().catch(() => ({}))
      console.error('❌ Error de n8n:', errorData)

      const errorMessage = errorData.message || errorData.error || 'Error al publicar en Instagram'

      await updateMetaStatus(propertyId, 'error', undefined, undefined, errorMessage)

      return NextResponse.json(
        {
          error: 'Error publicando en Instagram',
          details: errorMessage,
          updatedMetaData: {
            name: 'Instagram',
            uploaded: false,
            externalId: null,
            externalUrl: null,
            status: 'error' as const,
            lastSyncAt: new Date().toISOString(),
            lastError: errorMessage,
          },
        },
        { status: n8nResponse.status },
      )
    }

    const n8nResult = await n8nResponse.json()
    console.log('✅ Respuesta de n8n:', n8nResult)

    // Actualizar estado exitoso en BD
    const externalId = n8nResult.postId || n8nResult.id || null
    const externalUrl = n8nResult.postUrl || n8nResult.permalink || null

    await updateMetaStatus(propertyId, 'published', externalId, externalUrl)

    const updatedMetaData = {
      name: 'Instagram',
      uploaded: true,
      externalId: externalId,
      externalUrl: externalUrl,
      status: 'published' as const,
      lastSyncAt: new Date().toISOString(),
      lastError: null,
    }

    return NextResponse.json({
      success: true,
      message: 'Propiedad enviada a Instagram exitosamente',
      n8nResponse: n8nResult,
      updatedMetaData,
    })
  } catch (error) {
    console.error('❌ Error en API de Meta:', error)

    const errorMessage = error instanceof Error ? error.message : 'Error interno'
    if (propertyId) {
      await updateMetaStatus(propertyId, 'error', undefined, undefined, errorMessage)
    }

    const updatedMetaData = {
      name: 'Instagram',
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
        updatedMetaData,
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'API de Meta/Instagram',
    endpoints: {
      POST: '/api/portals/meta - Publicar propiedad en Instagram via n8n',
    },
    note: 'Requiere configurar N8N_META_WEBHOOK_URL en las variables de entorno',
  })
}
