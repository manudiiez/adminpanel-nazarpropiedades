import { NextRequest, NextResponse } from 'next/server'

export type ListingCopy = {
  title: string
  description: string
}

export type GenerateListingCopyParams = {
  /** Objeto con los datos de la propiedad (lo que ya tengas en tu app). */
  property: Record<string, any>
  /** (Opcional) Modelo a usar. Por defecto gpt-4o. */
  model?: string
  /** (Opcional) Idioma de salida. Por defecto "es-AR". */
  locale?: string
}

export async function POST(request: NextRequest) {
  try {
    const propertyData = await request.json()

    // Intentar obtener el token JWT de diferentes fuentes
    const authHeader = request.headers.get('authorization')
    let token = authHeader?.replace('Bearer ', '')

    // Si no hay token en Authorization, intentar desde cookies
    if (!token) {
      const cookieHeader = request.headers.get('cookie')
      const possibleTokenNames = [
        '_verificationToken', // Token específico de Payload CMS
        'payload-token',
        'payload',
        'token',
        'jwt',
        'auth-token',
        'payload_jwt',
        'payload-jwt',
      ]

      for (const tokenName of possibleTokenNames) {
        const cookieValue = cookieHeader?.match(new RegExp(`${tokenName}=([^;]+)`))?.[1]
        if (cookieValue) {
          token = cookieValue
          break
        }
      }
    }
    // Enviar datos a N8N (con o sin token)
    const aiResponse = await generateWithAI(propertyData, token || '')

    return NextResponse.json({
      title: aiResponse.title,
      description: aiResponse.description,
    })
  } catch (error) {
    console.error('Error generando contenido:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

async function generateWithAI(
  propertyData: any,
  token: string,
): Promise<{ title: string; description: string }> {
  // Verificar que existe la URL del webhook de N8N
  if (!process.env.N8N_WEBHOOK_URL) {
    throw new Error('N8N_WEBHOOK_URL no configurada')
  }

  try {
    // Enviar todos los datos del formulario a N8N con el token JWT
    const n8nRes = await fetch(process.env.N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(propertyData),
    })

    // Obtener el texto de la respuesta para logging
    const responseText = await n8nRes.text()

    if (!n8nRes.ok) {
      throw new Error(`Error en N8N webhook: ${n8nRes.status} ${n8nRes.statusText}`)
    }
    // Parsear la respuesta como JSON
    let result
    try {
      result = JSON.parse(responseText)
    } catch (parseError) {
      throw new Error('Respuesta inválida de N8N: no es JSON válido')
    }

    // Verificar que la respuesta tiene el formato esperado
    if (!result.response.titulo || !result.response.descripcion) {
      throw new Error('Respuesta inválida de N8N: falta título o descripción')
    }

    return {
      title: result.response.titulo,
      description: result.response.descripcion,
    }
  } catch (error) {
    console.error('Error en webhook N8N:', error)

    // Fallback en caso de error
    return {
      title: 'Excelente oportunidad inmobiliaria',
      description:
        'Propiedad con excelentes características en muy buena ubicación. Ideal para inversión o vivienda familiar.',
    }
  }
}
