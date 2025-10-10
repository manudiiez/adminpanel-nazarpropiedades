import { getPayload } from 'payload'
import config from '@payload-config'

export interface MercadoLibreToken {
  accessToken: string
  tokenType: string
  expiresAt: string
  isValid: boolean
  tokenId: string
}

export async function getValidMercadoLibreToken(): Promise<MercadoLibreToken> {
  const payload = await getPayload({ config })

  // Buscar token activo más reciente
  const tokens = await payload.find({
    collection: 'mercadolibre-tokens',
    where: {
      isActive: {
        equals: true,
      },
    },
    limit: 1,
    sort: '-createdAt', // Obtener el más reciente
  })

  if (tokens.docs.length === 0) {
    throw new Error('No se encontró token activo para MercadoLibre')
  }

  const tokenRecord = tokens.docs[0]
  const now = new Date()

  if (!tokenRecord.expiresAt) {
    throw new Error('Token sin fecha de expiración válida')
  }

  const expiresAt = new Date(tokenRecord.expiresAt)

  // Si el token aún es válido, actualizamos lastUsed y lo devolvemos
  if (now < expiresAt) {
    await payload.update({
      collection: 'mercadolibre-tokens',
      id: tokenRecord.id,
      data: {
        lastUsed: now.toISOString(),
      },
    })

    return {
      accessToken: tokenRecord.accessToken!,
      tokenType: tokenRecord.tokenType || 'Bearer',
      expiresAt: tokenRecord.expiresAt,
      isValid: true,
      tokenId: tokenRecord.id,
    }
  }

  // El token ha expirado, intentar renovarlo
  if (!tokenRecord.refreshToken) {
    throw new Error('Token expirado y sin refresh token disponible')
  }

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

    // Marcar el token como inactivo
    await payload.update({
      collection: 'mercadolibre-tokens',
      id: tokenRecord.id,
      data: {
        isActive: false,
        errorCount: (tokenRecord.errorCount || 0) + 1,
        lastError: `Error al renovar token: ${errorData}`,
      },
    })

    throw new Error('Error al renovar token. Necesita reautorización.')
  }

  const newTokenData = await refreshResponse.json()
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

  return {
    accessToken: newToken.accessToken!,
    tokenType: newToken.tokenType || 'Bearer',
    expiresAt: newToken.expiresAt!,
    isValid: true,
    tokenId: newToken.id,
  }
}

export async function getAllActiveTokens() {
  const payload = await getPayload({ config })

  const tokens = await payload.find({
    collection: 'mercadolibre-tokens',
    where: {
      isActive: {
        equals: true,
      },
    },
    sort: '-createdAt',
  })

  return tokens.docs
}

export async function deactivateToken(tokenId: string, reason?: string) {
  const payload = await getPayload({ config })

  await payload.update({
    collection: 'mercadolibre-tokens',
    id: tokenId,
    data: {
      isActive: false,
      lastError: reason || 'Desactivado manualmente',
    },
  })
}
