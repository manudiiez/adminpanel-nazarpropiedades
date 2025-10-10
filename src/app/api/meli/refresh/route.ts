import { NextResponse, NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })

    // Buscar el token activo más reciente
    const tokens = await payload.find({
      collection: 'mercadolibre-tokens',
      where: {
        isActive: {
          equals: true,
        },
      },
      limit: 1,
      sort: '-createdAt',
    })

    if (tokens.docs.length === 0) {
      return NextResponse.json(
        { error: 'No se encontró token activo para MercadoLibre' },
        { status: 404 },
      )
    }

    const tokenRecord = tokens.docs[0]

    if (!tokenRecord || !tokenRecord.isActive) {
      return NextResponse.json({ error: 'Token no encontrado o inactivo' }, { status: 404 })
    }

    // Verificar si el token ha expirado
    const now = new Date()

    if (!tokenRecord.expiresAt) {
      return NextResponse.json({ error: 'Token sin fecha de expiración válida' }, { status: 400 })
    }

    const expiresAt = new Date(tokenRecord.expiresAt)

    if (now < expiresAt) {
      // El token aún es válido, actualizamos lastUsed y lo devolvemos
      await payload.update({
        collection: 'mercadolibre-tokens',
        id: tokenRecord.id,
        data: {
          lastUsed: now.toISOString(),
        },
      })

      return NextResponse.json({
        accessToken: tokenRecord.accessToken,
        tokenType: tokenRecord.tokenType,
        expiresAt: tokenRecord.expiresAt,
        isValid: true,
        message: 'Token válido, no necesita renovación',
      })
    }

    // El token ha expirado, usar refresh token para obtener uno nuevo
    const refreshResponse = await fetch('https://api.mercadolibre.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: process.env.MERCADOLIBRE_CLIENT_ID!,
        client_secret: process.env.MERCADOLIBRE_CLIENT_SECRET!,
        refresh_token: tokenRecord.refreshToken,
      }),
    })

    if (!refreshResponse.ok) {
      const errorData = await refreshResponse.text()
      console.error('Error al renovar token:', errorData)

      // Marcar el token como inactivo debido al error
      await payload.update({
        collection: 'mercadolibre-tokens',
        id: tokenRecord.id,
        data: {
          isActive: false,
          errorCount: (tokenRecord.errorCount || 0) + 1,
          lastError: `Error al renovar token: ${errorData}`,
        },
      })

      return NextResponse.json(
        {
          error: 'Error al renovar token. Necesita reautorización.',
          needsReauth: true,
        },
        { status: 400 },
      )
    }

    const newTokenData = await refreshResponse.json()

    // Calcular nueva fecha de expiración
    const newExpiresAt = new Date(now.getTime() + newTokenData.expires_in * 1000)

    // Desactivar el token anterior
    await payload.update({
      collection: 'mercadolibre-tokens',
      id: tokenRecord.id,
      data: {
        isActive: false,
      },
    })

    // Crear nuevo token
    const newToken = await payload.create({
      collection: 'mercadolibre-tokens',
      data: {
        accountName: tokenRecord.accountName,
        accessToken: newTokenData.access_token,
        refreshToken: newTokenData.refresh_token,
        tokenType: newTokenData.token_type || 'Bearer',
        expiresIn: newTokenData.expires_in,
        expiresAt: newExpiresAt.toISOString(),
        scope: newTokenData.scope,
        userId: newTokenData.user_id?.toString(),
        isActive: true,
        lastUsed: now.toISOString(),
        errorCount: 0,
      },
    })

    return NextResponse.json({
      accessToken: newToken.accessToken,
      tokenType: newToken.tokenType,
      expiresAt: newToken.expiresAt,
      tokenId: newToken.id,
      isValid: true,
      message: 'Token renovado exitosamente',
    })
  } catch (error) {
    console.error('Error en POST /api/meli/refresh:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
