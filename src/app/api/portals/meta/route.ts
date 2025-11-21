import { NextResponse, NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getDepartmentLabel, getGarageTypeLabel } from '@/utils/propertyLabels'

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
          status: status === 'published' ? 'ok' : status,
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
  const { propertyId, selectedImageIds } = await request.json()
  try {
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

    // Construir array de todas las imágenes disponibles
    const allImages = []
    if (property.images?.coverImage) {
      allImages.push(property.images.coverImage)
    }
    if (Array.isArray(property.images?.gallery)) {
      allImages.push(...property.images.gallery)
    }

    // Filtrar solo las imágenes seleccionadas
    const selectedImages = allImages.filter((img) => {
      if (typeof img === 'string') {
        return selectedImageIds.includes(img)
      }
      // Si es un objeto Media, verificar id o _id
      const imageId = (img as any).id || (img as any)._id
      return selectedImageIds.includes(imageId)
    })

    // Transformar valores a labels antes de enviar
    const transformedProperty = {
      ...property,
      ubication: {
        ...property.ubication,
        department: property.ubication?.department
          ? getDepartmentLabel(property.ubication.department)
          : property.ubication?.department,
      },
      environments: {
        ...property.environments,
        garageType: property.environments?.garageType
          ? getGarageTypeLabel(property.environments.garageType)
          : property.environments?.garageType,
      },
    }

    // Enviar la propiedad completa a n8n
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'publishToInstagram',
        propertyId: propertyId,
        property: transformedProperty,
        selectedImages: selectedImages,
      }),
    })

    // Intentar parsear la respuesta de n8n
    const n8nResult = await n8nResponse.json().catch(() => ({}))
    console.log('📨 Respuesta de n8n:', n8nResult)

    // Verificar si n8n devolvió un error en el body (independientemente del status HTTP)
    if (n8nResult.status === 'error') {
      const errorMessage = n8nResult.message || 'Error al publicar en Instagram'
      const errorDetails = n8nResult.details || ''

      console.error('❌ Error de n8n:', errorMessage, errorDetails)

      await updateMetaStatus(
        propertyId,
        'error',
        undefined,
        undefined,
        `${errorMessage}${errorDetails ? ': ' + errorDetails : ''}`,
      )

      return NextResponse.json(
        {
          error: 'Error publicando en Instagram',
          message: errorMessage,
          details: errorDetails,
          updatedMetaData: {
            name: 'Instagram',
            uploaded: false,
            externalId: null,
            externalUrl: null,
            status: 'error' as const,
            lastSyncAt: new Date().toISOString(),
            lastError: `${errorMessage}${errorDetails ? ': ' + errorDetails : ''}`,
          },
        },
        { status: 400 },
      )
    }

    // Verificar si n8n devolvió éxito
    if (n8nResult.status === 'success' && n8nResult.postId) {
      const externalId = n8nResult.postId
      const externalUrl = n8nResult.postUrl || null

      console.log('✅ Publicación exitosa. Post ID:', externalId)

      await updateMetaStatus(propertyId, 'published', externalId, externalUrl)

      const updatedMetaData = {
        name: 'Instagram',
        uploaded: true,
        externalId: externalId,
        externalUrl: externalUrl,
        status: 'ok' as const,
        lastSyncAt: new Date().toISOString(),
        lastError: null,
      }

      return NextResponse.json({
        success: true,
        message: 'Propiedad publicada en Instagram exitosamente',
        postId: externalId,
        postUrl: externalUrl,
        updatedMetaData,
      })
    }

    // Si la respuesta HTTP no es ok y no tenemos estructura de error conocida
    if (!n8nResponse.ok) {
      const errorMessage = n8nResult.message || n8nResult.error || 'Error desconocido de n8n'

      console.error('❌ Error HTTP de n8n:', n8nResponse.status, errorMessage)

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

    // Si llegamos aquí, la respuesta no tiene el formato esperado
    console.error('❌ Respuesta de n8n en formato inesperado:', n8nResult)

    const errorMessage = 'Respuesta de n8n en formato inesperado'
    await updateMetaStatus(propertyId, 'error', undefined, undefined, errorMessage)

    return NextResponse.json(
      {
        error: errorMessage,
        details:
          'Se esperaba {status: "success", postId: "..."} o {status: "error", message: "...", details: "..."}',
        receivedData: n8nResult,
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
      { status: 500 },
    )
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
