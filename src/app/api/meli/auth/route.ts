import { NextResponse, NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET() {
  const u = new URL(
    `https://auth.mercadolibre.com.ar/authorization?response_type=code&client_id=${process.env.MERCADOLIBRE_CLIENT_ID}&redirect_uri=${process.env.MERCADOLIBRE_REDIRECT_URI}`,
  )
  return NextResponse.redirect(u.toString())
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const body = await request.json()
    const { code } = body

    if (!code) {
      return NextResponse.json({ error: 'Code es requerido' }, { status: 400 })
    }

    // Usar un nombre de cuenta por defecto ya que solo hay una cuenta de MercadoLibre
    const accountName = 'default'

    // Intercambiar el code por tokens
    const tokenResponse = await fetch('https://api.mercadolibre.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.MERCADOLIBRE_CLIENT_ID!,
        client_secret: process.env.MERCADOLIBRE_CLIENT_SECRET!,
        code: code,
        redirect_uri: process.env.MERCADOLIBRE_REDIRECT_URI!,
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('Error al obtener tokens:', errorData)
      return NextResponse.json(
        { error: 'Error al obtener tokens de MercadoLibre' },
        { status: 400 },
      )
    }

    const tokenData = await tokenResponse.json()

    // Calcular fecha de expiración
    const now = new Date()
    const expiresAt = new Date(now.getTime() + tokenData.expires_in * 1000)

    // Desactivar todos los tokens existentes activos
    const existingTokens = await payload.find({
      collection: 'mercadolibre-tokens',
      where: {
        isActive: {
          equals: true,
        },
      },
    })

    // Desactivar tokens existentes
    for (const token of existingTokens.docs) {
      await payload.update({
        collection: 'mercadolibre-tokens',
        id: token.id,
        data: {
          isActive: false,
        },
      })
    }

    // Guardar nuevo token en la base de datos
    const savedToken = await payload.create({
      collection: 'mercadolibre-tokens',
      data: {
        accountName: accountName,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        tokenType: tokenData.token_type || 'Bearer',
        expiresIn: tokenData.expires_in,
        expiresAt: expiresAt.toISOString(),
        scope: tokenData.scope,
        userId: tokenData.user_id?.toString(),
        isActive: true,
        lastUsed: now.toISOString(),
        errorCount: 0,
      },
    })

    return NextResponse.json({
      mensaje: 'Token guardado exitosamente',
      tokenId: savedToken.id,
      expiresAt: expiresAt,
      accountName: accountName,
    })
  } catch (error) {
    console.error('Error en POST /api/meli/auth:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
// TG-68e13e05a8f9ad00019483a1-2693936457
// https://auth.mercadolibre.com.ar/authorization?response_type=code&client_id=8700567616367262&redirect_uri=https://nazarpropiedades-admin-adminpanel-predeploy.jzdhpp.easypanel.host/admin
