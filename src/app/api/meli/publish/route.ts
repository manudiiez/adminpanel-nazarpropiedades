import { NextResponse, NextRequest } from 'next/server'
import { getValidMercadoLibreToken } from '@/utils/mercadoLibreTokens'
import { mapFormDataToMercadoLibre, validateMercadoLibreData } from '@/utils/mercadoLibreMappers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, propertyData, images } = body
    console.log('Cuerpo recibido en /api/meli/publish:', images)
    if (!propertyData) {
      return NextResponse.json({ error: 'propertyData es requerido' }, { status: 400 })
    }

    if (!action) {
      return NextResponse.json({ error: 'action es requerido' }, { status: 400 })
    }

    // Obtener token válido (solo hay una cuenta de MercadoLibre)
    const tokenInfo = await getValidMercadoLibreToken()
    // Mapear los datos usando el mapper de MercadoLibre
    const mappedPropertyData = mapFormDataToMercadoLibre(
      {
        ...propertyData,
      },
      images || [],
    )

    console.log('Token válido obtenido:', tokenInfo)
    console.log('Datos mapeados para MercadoLibre:', mappedPropertyData)

    // Validar datos mapeados
    const validation = validateMercadoLibreData(mappedPropertyData)
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: 'Datos inválidos para MercadoLibre',
          details: validation.errors,
        },
        { status: 400 },
      )
    }

    let result

    // switch (action) {
    //   case 'publishToMercadoLibre':
    //     result = await publishToMercadoLibre(mappedPropertyData, tokenInfo, propertyId)
    //     break
    //   case 'syncToMercadoLibre':
    //     result = await syncToMercadoLibre(mappedPropertyData, tokenInfo, propertyId)
    //     break
    //   case 'deleteFromMercadoLibre':
    //     result = await deleteFromMercadoLibre(tokenInfo, propertyId, body.externalId)
    //     break
    //   default:
    //     return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })
    // }

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error en POST /api/meli/publish:', error)

    // Si el error es de token, devolver información específica
    if (error.message.includes('token') || error.message.includes('Token')) {
      return NextResponse.json(
        {
          error: error.message,
          needsReauth: true,
        },
        { status: 401 },
      )
    }

    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

async function publishToMercadoLibre(mappedPropertyData: any, tokenInfo: any, propertyId: string) {
  try {
    // Publicar en MercadoLibre
    const publishResponse = await fetch('https://api.mercadolibre.com/items', {
      method: 'POST',
      headers: {
        Authorization: `${tokenInfo.tokenType} ${tokenInfo.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mappedPropertyData),
    })

    if (!publishResponse.ok) {
      const errorData = await publishResponse.text()
      console.error('Error al publicar en MercadoLibre:', errorData)

      return {
        error: 'Error al publicar en MercadoLibre',
        details: errorData,
        updatedMercadoLibreData: {
          status: 'error',
          lastError: errorData,
          lastSyncAt: new Date().toISOString(),
        },
      }
    }

    const publishedItem = await publishResponse.json()

    return {
      success: true,
      message: 'Propiedad publicada exitosamente en MercadoLibre',
      updatedMercadoLibreData: {
        externalId: publishedItem.id,
        externalUrl: publishedItem.permalink,
        status: publishedItem.status,
        uploaded: true,
        lastSyncAt: new Date().toISOString(),
        lastError: undefined,
      },
      tokenUsed: tokenInfo.tokenId,
    }
  } catch (error: any) {
    console.error('Error publicando en MercadoLibre:', error)
    return {
      error: 'Error al publicar en MercadoLibre',
      updatedMercadoLibreData: {
        status: 'error',
        lastError: error.message,
        lastSyncAt: new Date().toISOString(),
      },
    }
  }
}

async function syncToMercadoLibre(mappedPropertyData: any, tokenInfo: any, propertyId: string) {
  try {
    // Primero necesitamos obtener el ID externo de la propiedad
    // Esto debería venir del propertyData o de la base de datos
    const externalId = mappedPropertyData.externalId || propertyId

    if (!externalId) {
      return {
        error: 'No se encontró ID externo para sincronizar',
        updatedMercadoLibreData: {
          status: 'error',
          lastError: 'No se encontró ID externo para sincronizar',
          lastSyncAt: new Date().toISOString(),
        },
      }
    }

    // Actualizar en MercadoLibre
    const updateResponse = await fetch(`https://api.mercadolibre.com/items/${externalId}`, {
      method: 'PUT',
      headers: {
        Authorization: `${tokenInfo.tokenType} ${tokenInfo.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mappedPropertyData),
    })

    if (!updateResponse.ok) {
      const errorData = await updateResponse.text()
      console.error('Error al sincronizar con MercadoLibre:', errorData)

      return {
        error: 'Error al sincronizar con MercadoLibre',
        details: errorData,
        updatedMercadoLibreData: {
          status: 'error',
          lastError: errorData,
          lastSyncAt: new Date().toISOString(),
        },
      }
    }

    const updatedItem = await updateResponse.json()

    return {
      success: true,
      message: 'Propiedad sincronizada exitosamente con MercadoLibre',
      updatedMercadoLibreData: {
        externalId: updatedItem.id,
        externalUrl: updatedItem.permalink,
        status: updatedItem.status,
        uploaded: true,
        lastSyncAt: new Date().toISOString(),
        lastError: undefined,
      },
      tokenUsed: tokenInfo.tokenId,
    }
  } catch (error: any) {
    console.error('Error sincronizando con MercadoLibre:', error)
    return {
      error: 'Error al sincronizar con MercadoLibre',
      updatedMercadoLibreData: {
        status: 'error',
        lastError: error.message,
        lastSyncAt: new Date().toISOString(),
      },
    }
  }
}

async function deleteFromMercadoLibre(tokenInfo: any, propertyId: string, externalId?: string) {
  try {
    if (!externalId) {
      return {
        error: 'No se encontró ID externo para eliminar',
        updatedMercadoLibreData: {
          status: 'error',
          lastError: 'No se encontró ID externo para eliminar',
          lastSyncAt: new Date().toISOString(),
        },
      }
    }

    // Eliminar de MercadoLibre (pausar o eliminar)
    const deleteResponse = await fetch(`https://api.mercadolibre.com/items/${externalId}`, {
      method: 'PUT',
      headers: {
        Authorization: `${tokenInfo.tokenType} ${tokenInfo.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'paused' }), // MercadoLibre usa 'paused' para desactivar
    })

    if (!deleteResponse.ok) {
      const errorData = await deleteResponse.text()
      console.error('Error al eliminar de MercadoLibre:', errorData)

      return {
        error: 'Error al eliminar de MercadoLibre',
        details: errorData,
        updatedMercadoLibreData: {
          status: 'error',
          lastError: errorData,
          lastSyncAt: new Date().toISOString(),
        },
      }
    }

    return {
      success: true,
      message: 'Propiedad eliminada exitosamente de MercadoLibre',
      updatedMercadoLibreData: {
        externalId: undefined,
        externalUrl: undefined,
        status: 'not_published',
        uploaded: false,
        lastSyncAt: new Date().toISOString(),
        lastError: undefined,
      },
      tokenUsed: tokenInfo.tokenId,
    }
  } catch (error: any) {
    console.error('Error eliminando de MercadoLibre:', error)
    return {
      error: 'Error al eliminar de MercadoLibre',
      updatedMercadoLibreData: {
        status: 'error',
        lastError: error.message,
        lastSyncAt: new Date().toISOString(),
      },
    }
  }
}
