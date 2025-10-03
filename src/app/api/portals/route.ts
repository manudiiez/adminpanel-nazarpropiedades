import { NextRequest, NextResponse } from 'next/server'
import { PORTAL_CONFIGS, validatePortalData } from '@/lib/portals-config'

// Tipos para las respuestas de los portales
interface PortalPublishResponse {
  success: boolean
  id?: string
  url?: string
  message?: string
  error?: string
  publishedAt?: string
  portalSpecificData?: any
}

interface PublishRequest {
  portals: string[] // Array de portales donde publicar
  propertyData: any
  processImages?: boolean
  ownerData?: any
}

export async function POST(request: NextRequest) {
  try {
    const {
      portals,
      propertyData,
      processImages = true,
      ownerData,
    }: PublishRequest = await request.json()

    if (!portals || portals.length === 0) {
      return NextResponse.json({ error: 'Se debe especificar al menos un portal' }, { status: 400 })
    }

    if (!propertyData) {
      return NextResponse.json({ error: 'Se requieren datos de la propiedad' }, { status: 400 })
    }

    console.log(`Iniciando publicación en ${portals.length} portales:`, portals)

    const results: Record<string, PortalPublishResponse> = {}
    const errors: string[] = []

    // Procesar cada portal secuencialmente para evitar sobrecarga
    for (const portalKey of portals) {
      try {
        console.log(`Publicando en ${portalKey}...`)

        // Validar que el portal existe
        if (!PORTAL_CONFIGS[portalKey]) {
          results[portalKey] = {
            success: false,
            error: `Portal ${portalKey} no configurado`,
          }
          continue
        }

        // Llamar al endpoint específico del portal
        const portalResponse = await fetch(
          `${request.url.replace('/api/portals', `/api/portals/${portalKey}`)}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              propertyData,
              ownerData,
              processImages,
            }),
          },
        )

        if (portalResponse.ok) {
          const result = await portalResponse.json()
          results[portalKey] = {
            success: true,
            ...result,
          }
          console.log(`✅ ${portalKey}: Publicación exitosa`)
        } else {
          const errorData = await portalResponse.json()
          results[portalKey] = {
            success: false,
            error: errorData.error || `Error HTTP ${portalResponse.status}`,
          }
          console.log(`❌ ${portalKey}: ${errorData.error}`)
        }

        // Esperar un poco entre publicaciones para no sobrecargar las APIs
        if (portals.indexOf(portalKey) < portals.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      } catch (error) {
        console.error(`Error en portal ${portalKey}:`, error)
        results[portalKey] = {
          success: false,
          error: error instanceof Error ? error.message : 'Error desconocido',
        }
      }
    }

    // Contar resultados
    const successful = Object.values(results).filter((r) => r.success).length
    const failed = portals.length - successful

    const response = {
      message: `Publicación completada: ${successful} exitosas, ${failed} fallos`,
      summary: {
        total: portals.length,
        successful,
        failed,
        portals: portals,
      },
      results,
      publishedAt: new Date().toISOString(),
    }

    console.log('Resumen de publicación:', response.summary)

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error en publicación masiva:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function GET() {
  const availablePortals = Object.keys(PORTAL_CONFIGS).map((key) => ({
    key,
    name: PORTAL_CONFIGS[key].name,
    limits: PORTAL_CONFIGS[key].limits,
    requiredFields: PORTAL_CONFIGS[key].requiredFields,
  }))

  return NextResponse.json({
    message: 'API de gestión de portales inmobiliarios',
    version: '1.0.0',
    endpoints: {
      POST: '/api/portals - Publicar en múltiples portales',
      'POST /inmoup': 'Publicar en Inmoup',
      'POST /instagram': 'Publicar en Instagram',
      'POST /mercadolibre': 'Publicar en MercadoLibre',
      'POST /images/process': 'Procesar imágenes',
    },
    availablePortals,
    usage: {
      multiplePortals: {
        method: 'POST',
        url: '/api/portals',
        body: {
          portals: ['inmoup', 'instagram', 'mercadolibre'],
          propertyData: '{ property data object }',
          processImages: true,
          ownerData: '{ owner data object (optional) }',
        },
      },
      singlePortal: {
        method: 'POST',
        url: '/api/portals/{portal-name}',
        body: {
          propertyData: '{ property data object }',
          ownerData: '{ owner data object (optional) }',
        },
      },
    },
    limits: {
      maxPortalsPerRequest: 10,
      rateLimitPerMinute: 30,
      maxConcurrentPublications: 3,
    },
  })
}
